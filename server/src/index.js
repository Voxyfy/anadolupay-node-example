import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import {
  CapturePaymentData,
  CardData,
  CreatePaymentData,
  InvalidSignatureError,
  Money,
  PaymentFailedError,
  RefundPaymentData,
  supportsBinQuery,
  supportsCancellation,
  supportsInstallmentQuery,
  supportsPreAuthorization,
  supportsStatusQuery,
  TransportError,
  VerifyPaymentData,
} from '@voxyfy/anadolupay';
import { buildRegistry } from './registry.js';
import { TEST_CARDS } from './testCards.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Kök dizindeki tek `.env` dosyası (Laravel örnek projesiyle aynı
// değişken adlarını taşır) — bkz. README "Kurulum" bölümü.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = Number(process.env.PORT || 4000);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

const registry = buildRegistry(process.env);
const gatewaysByKey = new Map(registry.map((entry) => [entry.def.key, entry]));

/**
 * Ödeme bağlamı ve doğrulama sonuçları — bellekte, süreç ömrü boyunca.
 *
 * Bu bir test aracıdır, üretim sunucusu değil; kalıcı depoya (Redis vb.)
 * gerek yok. Sunucu yeniden başladığında bekleyen ödemeler kaybolur.
 */
const paymentContexts = new Map();
const paymentResults = new Map();

const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());
// Bankaların 3D dönüşü genelde `application/x-www-form-urlencoded` gelir.
app.use(express.urlencoded({ extended: true }));

function driverSummary(entry) {
  const { def, gateway, ready, missing } = entry;

  return {
    key: def.key,
    label: def.label,
    ready,
    missing,
    capabilities: {
      status: supportsStatusQuery(gateway),
      cancel: supportsCancellation(gateway),
      preAuthorization: supportsPreAuthorization(gateway),
      bin: supportsBinQuery(gateway),
      installment: supportsInstallmentQuery(gateway),
    },
  };
}

app.get('/api/drivers', (_req, res) => {
  res.json({ drivers: registry.map(driverSummary) });
});

app.get('/api/test-cards', (_req, res) => {
  res.json({ cards: TEST_CARDS });
});

function errorPayload(error) {
  if (error instanceof InvalidSignatureError) {
    return { title: 'İmza doğrulanamadı', message: error.message, context: error.context };
  }

  if (error instanceof TransportError) {
    return {
      title: error.outcomeUncertain ? 'Bankaya ulaşıldı ama sonuç belirsiz' : 'Banka isteği reddetti — işlem gerçekleşmedi',
      message: error.message,
      context: { ...error.context, safeToRetry: error.safeToRetry, outcomeUncertain: error.outcomeUncertain },
    };
  }

  if (error instanceof PaymentFailedError) {
    return { title: 'Banka isteği reddetti', message: error.message, context: error.context };
  }

  return { title: 'Beklenmeyen hata', message: error instanceof Error ? error.message : String(error), context: {} };
}

/** Ödemeyi başlatır; müşterinin bankaya POST edeceği (veya yönleneceği) veriyi döner. */
app.post('/api/pay', async (req, res) => {
  const body = req.body || {};
  const entry = gatewaysByKey.get(body.driver);

  if (!entry) {
    return res.status(400).json({ error: { title: 'Geçersiz sürücü', message: `'${body.driver}' tanımlı değil.` } });
  }

  const orderId = body.orderId || `TEST-${randomUUID().slice(0, 8).toUpperCase()}`;

  const data = new CreatePaymentData({
    amount: Money.fromDecimal(String(body.amount ?? '100.00')),
    currency: 'TRY',
    orderId,
    customer: {
      id: orderId,
      name: body.holderName || 'Test Kullanıcı',
      email: 'test@example.com',
      phone: '5350000000',
      gsm_number: '5350000000',
      address: 'Örnek Mah. Test Sok. No:1',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34000',
    },
    // Bağlam dönüş adresinde taşınır: bankanın POST'u siteler arası
    // olduğu için çerezle taşınan bir oturuma güvenilemez.
    successUrl: `${SERVER_URL}/api/payment/callback?driver=${encodeURIComponent(body.driver)}&order=${encodeURIComponent(orderId)}`,
    failUrl: `${SERVER_URL}/api/payment/callback?driver=${encodeURIComponent(body.driver)}&order=${encodeURIComponent(orderId)}`,
    card: new CardData(
      String(body.cardNumber || '').replace(/\s+/g, ''),
      String(body.expireMonth || ''),
      String(body.expireYear || ''),
      String(body.cvv || ''),
      body.holderName || 'Test Kullanıcı',
    ),
    installment: Number(body.installment || 1),
    paymentModel: body.paymentModel || '3d',
    ip: req.ip,
  });

  paymentContexts.set(orderId, {
    driver: body.driver,
    amount: String(body.amount ?? '100.00'),
    installment: Number(body.installment || 1),
    // Moka'nın dönüş doğrulaması bu değer olmadan yapılamaz.
    codeForHash: null,
  });

  try {
    const response = await entry.gateway.createPayment(data);

    const context = paymentContexts.get(orderId);
    if (context) {
      context.codeForHash = response.raw?.code_for_hash ?? null;
    }

    res.json({
      orderId,
      success: response.success,
      requiresForm: response.requiresForm(),
      formAction: response.formAction ?? null,
      formFields: response.formFields ?? {},
      formMethod: response.formMethod,
      redirectUrl: response.redirectUrl ?? null,
      htmlContent: response.htmlContent ?? null,
    });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

/** Bankanın 3D dönüşü buraya POST/GET edilir; doğrulayıp istemciye yönlendirir. */
app.all('/api/payment/callback', async (req, res) => {
  const orderId = String(req.query.order || '');
  const context = paymentContexts.get(orderId) || {};
  const driverKey = String(req.query.driver || context.driver || '');
  const entry = gatewaysByKey.get(driverKey);

  const payload = { ...req.query, ...req.body };
  delete payload.driver;
  delete payload.order;

  if (!entry) {
    paymentResults.set(orderId, {
      success: false,
      message: `'${driverKey}' tanımlı değil.`,
      payload,
      detail: {},
    });

    return res.redirect(`${CLIENT_URL}/result?order=${encodeURIComponent(orderId)}`);
  }

  try {
    const result = await entry.gateway.verify(
      new VerifyPaymentData({
        payload,
        headers: req.headers,
        rawBody: JSON.stringify(req.body),
        order: {
          id: orderId,
          amount: context.amount,
          currency: 'TRY',
          installment: context.installment,
          ip: req.ip,
          code_for_hash: context.codeForHash,
        },
      }),
    );

    paymentResults.set(orderId, {
      success: result.success,
      message: result.success ? 'Ödeme başarılı' : 'Ödeme alınamadı',
      payload,
      detail: { paymentId: result.paymentId, status: result.status, orderId },
      raw: result.raw,
    });
  } catch (error) {
    paymentResults.set(orderId, {
      success: false,
      message: errorPayload(error).message,
      payload,
      detail: errorPayload(error),
    });
  }

  res.redirect(`${CLIENT_URL}/result?order=${encodeURIComponent(orderId)}&driver=${encodeURIComponent(driverKey)}`);
});

app.get('/api/result/:orderId', (req, res) => {
  const result = paymentResults.get(req.params.orderId);

  if (!result) {
    return res.status(404).json({ error: { title: 'Bulunamadı', message: 'Bu sipariş için sonuç yok.' } });
  }

  res.json(result);
});

app.get('/api/status/:driver/:orderId', async (req, res) => {
  const entry = gatewaysByKey.get(req.params.driver);

  if (!entry || !supportsStatusQuery(entry.gateway)) {
    return res.status(400).json({ error: { title: 'Desteklenmiyor', message: `'${req.params.driver}' durum sorgusu sunmuyor.` } });
  }

  try {
    const status = await entry.gateway.status(req.params.orderId);

    res.json({
      found: status.found,
      status: status.status,
      paid: status.isPaid(),
      paymentId: status.paymentId,
      amount: status.amount?.toDecimalString() ?? null,
      raw: status.raw,
    });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.post('/api/operations/refund', async (req, res) => {
  const { driver, paymentId, amount } = req.body || {};
  const entry = gatewaysByKey.get(driver);

  if (!entry) {
    return res.status(400).json({ error: { title: 'Geçersiz sürücü', message: `'${driver}' tanımlı değil.` } });
  }

  try {
    const response = await entry.gateway.refund(
      new RefundPaymentData({ paymentId, amount: amount ? Money.fromDecimal(String(amount)) : undefined }),
    );

    res.json({ success: response.success, refundId: response.refundId ?? null, errorMessage: response.errorMessage ?? null, raw: response.raw });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.post('/api/operations/cancel', async (req, res) => {
  const { driver, paymentId } = req.body || {};
  const entry = gatewaysByKey.get(driver);

  if (!entry || !supportsCancellation(entry.gateway)) {
    return res.status(400).json({ error: { title: 'Desteklenmiyor', message: `'${driver}' iptal sunmuyor.` } });
  }

  try {
    const response = await entry.gateway.cancel(new RefundPaymentData({ paymentId }));

    res.json({ success: response.success, refundId: response.refundId ?? null, errorMessage: response.errorMessage ?? null, raw: response.raw });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.post('/api/operations/bin-lookup', async (req, res) => {
  const { driver, bin } = req.body || {};
  const entry = gatewaysByKey.get(driver);

  if (!entry || !supportsBinQuery(entry.gateway)) {
    return res.status(400).json({ error: { title: 'Desteklenmiyor', message: `'${driver}' BIN sorgusu sunmuyor.` } });
  }

  try {
    const response = await entry.gateway.binLookup(bin);
    res.json({ ...response, amount: undefined });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.post('/api/operations/installment-options', async (req, res) => {
  const { driver, amount, bin } = req.body || {};
  const entry = gatewaysByKey.get(driver);

  if (!entry || !supportsInstallmentQuery(entry.gateway)) {
    return res.status(400).json({ error: { title: 'Desteklenmiyor', message: `'${driver}' taksit sorgusu sunmuyor.` } });
  }

  try {
    const options = await entry.gateway.installmentOptions(Money.fromDecimal(String(amount ?? '100.00')), bin || undefined);

    res.json({
      options: options.map((option) => ({
        count: option.count,
        totalPrice: option.totalPrice?.toDecimalString() ?? null,
        monthlyPrice: option.monthlyPrice?.toDecimalString() ?? null,
        commissionRate: option.commissionRate ?? null,
        bankName: option.bankName ?? null,
      })),
    });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.post('/api/operations/capture', async (req, res) => {
  const { driver, orderId, amount, metadata } = req.body || {};
  const entry = gatewaysByKey.get(driver);

  if (!entry || !supportsPreAuthorization(entry.gateway)) {
    return res.status(400).json({ error: { title: 'Desteklenmiyor', message: `'${driver}' ön provizyon sunmuyor.` } });
  }

  try {
    const response = await entry.gateway.capture(
      new CapturePaymentData({ orderId, amount: amount ? Money.fromDecimal(String(amount)) : undefined, metadata }),
    );

    res.json({ success: response.success, paymentId: response.paymentId ?? null, errorMessage: response.errorMessage ?? null, raw: response.raw });
  } catch (error) {
    res.status(422).json({ error: errorPayload(error) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`anadolupay-node-example API http://localhost:${PORT} üzerinde çalışıyor (istemci: ${CLIENT_URL})`);
});
