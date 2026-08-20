import {
  AkbankPosGateway,
  AssecoGateway,
  CraftgateGateway,
  FakeGateway,
  GarantiGateway,
  InterPosGateway,
  IyzicoGateway,
  KuveytPosGateway,
  MokaGateway,
  ParatikaGateway,
  PaycellGateway,
  PayForGateway,
  PayFlexGateway,
  PayTrGateway,
  PosNetGateway,
  PosNetV1Gateway,
  TamiGateway,
  ToslaGateway,
  VakifKatilimGateway,
} from '@voxyfy/anadolupay';

/**
 * Sürücü kayıt defteri.
 *
 * Her girdi PHP paketindeki `config/anadolupay.php`'deki env değişken
 * adlarıyla birebir eşleşir — aynı `.env` bu yüzden hem Laravel hem bu
 * örnek projede çalışır. `requiredEnv`, arayüzde "hazır" rozetini
 * belirlemek için kullanılır; boş olsa da sürücü kurulur (kurulum hata
 * fırlatmaz, yalnızca gerçek bir işlem denendiğinde eksik alan hatası verir).
 */
export const DRIVER_DEFS = [
  {
    key: 'fake',
    label: 'Fake (ağ çağrısı yapmaz)',
    requiredEnv: [],
    build: () => new FakeGateway(),
  },
  {
    key: 'iyzico',
    label: 'iyzico',
    requiredEnv: ['IYZICO_API_KEY', 'IYZICO_SECRET_KEY'],
    build: (env) =>
      new IyzicoGateway({
        baseUrl: env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
        apiKey: env.IYZICO_API_KEY || '',
        secretKey: env.IYZICO_SECRET_KEY || '',
        defaultCallbackUrl: env.IYZICO_CALLBACK_URL,
      }),
  },

  // --- Asseco / Payten (NestPay) ailesi ---
  ...[
    ['akbank', 'AKBANK', 'https://entegrasyon.asseco-see.com.tr/fim/api', 'https://entegrasyon.asseco-see.com.tr/fim/est3Dgate'],
    ['isbank', 'ISBANK', 'https://sanalpos.isbank.com.tr/fim/api', 'https://sanalpos.isbank.com.tr/fim/est3Dgate'],
    ['ziraat', 'ZIRAAT', 'https://sanalpos2.ziraatbank.com.tr/fim/api', 'https://sanalpos2.ziraatbank.com.tr/fim/est3Dgate'],
    ['halkbank', 'HALKBANK', 'https://sanalpos.halkbank.com.tr/fim/api', 'https://sanalpos.halkbank.com.tr/fim/est3dgate'],
    ['qnb', 'QNB', 'https://www.fbwebpos.com/fim/api', 'https://www.fbwebpos.com/fim/est3dgate'],
    ['teb', 'TEB', 'https://sanalpos.teb.com.tr/fim/api', 'https://sanalpos.teb.com.tr/fim/est3Dgate'],
    ['sekerbank', 'SEKERBANK', 'https://sanalpos.sekerbank.com.tr/fim/api', 'https://sanalpos.sekerbank.com.tr/fim/est3Dgate'],
    ['ing', 'ING', 'https://sanalpos.ing.com.tr/fim/api', 'https://sanalpos.ing.com.tr/fim/est3Dgate'],
    ['alternatifbank', 'ALTERNATIFBANK', 'https://sanalpos.alternatifbank.com.tr/fim/api', 'https://sanalpos.alternatifbank.com.tr/fim/est3Dgate'],
    ['turkiyefinans', 'TURKIYEFINANS', 'https://sanalpos.turkiyefinans.com.tr/fim/api', 'https://sanalpos.turkiyefinans.com.tr/fim/est3Dgate'],
  ].map(([key, prefix, defaultApi, defaultGateway3d]) => ({
    key,
    label: `${key} (NestPay/Asseco)`,
    requiredEnv: [`${prefix}_MERCHANT_ID`, `${prefix}_USERNAME`, `${prefix}_PASSWORD`, `${prefix}_SECRET_KEY`],
    build: (env) =>
      new AssecoGateway(key, {
        merchantId: env[`${prefix}_MERCHANT_ID`] || '',
        username: env[`${prefix}_USERNAME`] || '',
        password: env[`${prefix}_PASSWORD`] || '',
        secretKey: env[`${prefix}_SECRET_KEY`] || '',
        testMode: env[`${prefix}_TEST_MODE`] === 'true',
        endpoints: {
          payment_api: env[`${prefix}_PAYMENT_API`] || defaultApi,
          gateway_3d: env[`${prefix}_GATEWAY_3D`] || defaultGateway3d,
          gateway_3d_host: env[`${prefix}_GATEWAY_3D_HOST`],
        },
      }),
  })),

  {
    key: 'garanti',
    label: 'Garanti BBVA (GVPS)',
    requiredEnv: ['GARANTI_MERCHANT_ID', 'GARANTI_TERMINAL_ID', 'GARANTI_USERNAME', 'GARANTI_PASSWORD', 'GARANTI_SECRET_KEY'],
    build: (env) =>
      new GarantiGateway({
        merchantId: env.GARANTI_MERCHANT_ID || '',
        terminalId: env.GARANTI_TERMINAL_ID || '',
        username: env.GARANTI_USERNAME || '',
        password: env.GARANTI_PASSWORD || '',
        secretKey: env.GARANTI_SECRET_KEY || '',
        refundPassword: env.GARANTI_REFUND_PASSWORD,
        extra: {
          refund_username: env.GARANTI_REFUND_USERNAME,
          // Yalnızca bayi (alt üye işyeri) yapılandırmalı terminaller için.
          sub_merchant_id: env.GARANTI_SUB_MERCHANT_ID,
          sub_merchant_id_path: env.GARANTI_SUB_MERCHANT_ID_PATH,
        },
        testMode: env.GARANTI_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.GARANTI_PAYMENT_API || 'https://sanalposprov.garanti.com.tr/VPServlet',
          gateway_3d: env.GARANTI_GATEWAY_3D || 'https://sanalposprov.garanti.com.tr/servlet/gt3dengine',
        },
      }),
  },

  {
    key: 'yapikredi',
    label: 'Yapı Kredi (PosNet)',
    requiredEnv: ['YAPIKREDI_MERCHANT_ID', 'YAPIKREDI_TERMINAL_ID', 'YAPIKREDI_SECRET_KEY'],
    build: (env) =>
      new PosNetGateway({
        merchantId: env.YAPIKREDI_MERCHANT_ID || '',
        terminalId: env.YAPIKREDI_TERMINAL_ID || '',
        secretKey: env.YAPIKREDI_SECRET_KEY || '',
        extra: { posnet_id: env.YAPIKREDI_POSNET_ID },
        testMode: env.YAPIKREDI_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.YAPIKREDI_PAYMENT_API || 'https://posnet.yapikredi.com.tr/PosnetWebService/XML',
          gateway_3d: env.YAPIKREDI_GATEWAY_3D || 'https://posnet.yapikredi.com.tr/3DSWebService/YKBPaymentService',
        },
      }),
  },

  {
    key: 'albaraka',
    label: 'Albaraka Türk (PosNet V1)',
    requiredEnv: ['ALBARAKA_MERCHANT_ID', 'ALBARAKA_TERMINAL_ID', 'ALBARAKA_SECRET_KEY'],
    build: (env) =>
      new PosNetV1Gateway({
        merchantId: env.ALBARAKA_MERCHANT_ID || '',
        terminalId: env.ALBARAKA_TERMINAL_ID || '',
        secretKey: env.ALBARAKA_SECRET_KEY || '',
        extra: { posnet_id: env.ALBARAKA_POSNET_ID },
        testMode: env.ALBARAKA_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.ALBARAKA_PAYMENT_API || 'https://epos.albarakaturk.com.tr/ALBMerchantService/MerchantJSONAPI.svc',
          gateway_3d: env.ALBARAKA_GATEWAY_3D || 'https://epos.albarakaturk.com.tr/ALBSecurePaymentUI/SecureProcess/SecureVerification.aspx',
        },
      }),
  },

  {
    key: 'vakifbank',
    label: 'VakıfBank (PayFlex V4)',
    requiredEnv: ['VAKIFBANK_MERCHANT_ID', 'VAKIFBANK_TERMINAL_ID', 'VAKIFBANK_PASSWORD'],
    build: (env) =>
      new PayFlexGateway('vakifbank', {
        merchantId: env.VAKIFBANK_MERCHANT_ID || '',
        terminalId: env.VAKIFBANK_TERMINAL_ID || '',
        password: env.VAKIFBANK_PASSWORD || '',
        extra: { merchant_type: env.VAKIFBANK_MERCHANT_TYPE || '0' },
        testMode: env.VAKIFBANK_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.VAKIFBANK_PAYMENT_API || 'https://onlineodeme.vakifbank.com.tr:4443/VposService/v3/Vposreq.aspx',
          gateway_3d: env.VAKIFBANK_GATEWAY_3D || 'https://3dsecure.vakifbank.com.tr:4443/MPIAPI/MPI_Enrollment.aspx',
          query_api: env.VAKIFBANK_QUERY_API || 'https://onlineodeme.vakifbank.com.tr:4443/UIService/Search.aspx',
        },
      }),
  },

  {
    key: 'ziraat-payflex',
    label: 'Ziraat Bankası (PayFlex V4)',
    requiredEnv: ['ZIRAAT_PAYFLEX_MERCHANT_ID', 'ZIRAAT_PAYFLEX_TERMINAL_ID', 'ZIRAAT_PAYFLEX_PASSWORD'],
    build: (env) =>
      new PayFlexGateway('ziraat-payflex', {
        merchantId: env.ZIRAAT_PAYFLEX_MERCHANT_ID || '',
        terminalId: env.ZIRAAT_PAYFLEX_TERMINAL_ID || '',
        password: env.ZIRAAT_PAYFLEX_PASSWORD || '',
        testMode: env.ZIRAAT_PAYFLEX_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.ZIRAAT_PAYFLEX_PAYMENT_API || 'https://sanalpos.ziraatbank.com.tr/v4/v3/Vposreq.aspx',
          gateway_3d: env.ZIRAAT_PAYFLEX_GATEWAY_3D || 'https://mpi.ziraatbank.com.tr/Enrollment.aspx',
          query_api: env.ZIRAAT_PAYFLEX_QUERY_API || 'https://sanalpos.ziraatbank.com.tr/v4/UIWebService/Search.aspx',
        },
      }),
  },

  {
    key: 'denizbank',
    label: 'DenizBank (InterPos)',
    requiredEnv: ['DENIZBANK_MERCHANT_ID', 'DENIZBANK_USERNAME', 'DENIZBANK_PASSWORD', 'DENIZBANK_SECRET_KEY'],
    build: (env) =>
      new InterPosGateway('denizbank', {
        merchantId: env.DENIZBANK_MERCHANT_ID || '',
        username: env.DENIZBANK_USERNAME || '',
        password: env.DENIZBANK_PASSWORD || '',
        secretKey: env.DENIZBANK_SECRET_KEY || '',
        testMode: env.DENIZBANK_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.DENIZBANK_PAYMENT_API || 'https://inter-vpos.com.tr/mpi/Default.aspx',
          gateway_3d: env.DENIZBANK_GATEWAY_3D || 'https://inter-vpos.com.tr/mpi/Default.aspx',
          gateway_3d_host: env.DENIZBANK_GATEWAY_3D_HOST || 'https://inter-vpos.com.tr/mpi/3DHost.aspx',
        },
      }),
  },

  {
    key: 'qnb-payfor',
    label: 'QNB Finansbank / Enpara (PayFor)',
    requiredEnv: ['QNB_PAYFOR_MERCHANT_ID', 'QNB_PAYFOR_USERNAME', 'QNB_PAYFOR_PASSWORD', 'QNB_PAYFOR_SECRET_KEY'],
    build: (env) =>
      new PayForGateway('qnb-payfor', {
        merchantId: env.QNB_PAYFOR_MERCHANT_ID || '',
        username: env.QNB_PAYFOR_USERNAME || '',
        password: env.QNB_PAYFOR_PASSWORD || '',
        secretKey: env.QNB_PAYFOR_SECRET_KEY || '',
        extra: { mbr_id: env.QNB_PAYFOR_MBR_ID || '5' },
        testMode: env.QNB_PAYFOR_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.QNB_PAYFOR_PAYMENT_API || 'https://vpos.qnb.com.tr/Gateway/XMLGate.aspx',
          gateway_3d: env.QNB_PAYFOR_GATEWAY_3D || 'https://vpos.qnb.com.tr/Gateway/Default.aspx',
          gateway_3d_host: env.QNB_PAYFOR_GATEWAY_3D_HOST || 'https://vpos.qnb.com.tr/Gateway/3DHost.aspx',
        },
      }),
  },

  {
    key: 'ziraat-katilim',
    label: 'Ziraat Katılım (PayFor)',
    requiredEnv: ['ZIRAAT_KATILIM_MERCHANT_ID', 'ZIRAAT_KATILIM_USERNAME', 'ZIRAAT_KATILIM_PASSWORD', 'ZIRAAT_KATILIM_SECRET_KEY'],
    build: (env) =>
      new PayForGateway('ziraat-katilim', {
        merchantId: env.ZIRAAT_KATILIM_MERCHANT_ID || '',
        username: env.ZIRAAT_KATILIM_USERNAME || '',
        password: env.ZIRAAT_KATILIM_PASSWORD || '',
        secretKey: env.ZIRAAT_KATILIM_SECRET_KEY || '',
        // PHP tarafında dönüş hash'i tutarsız üretildiği için varsayılan kapalı.
        verifyHash: env.ZIRAAT_KATILIM_VERIFY_HASH === 'true',
        testMode: env.ZIRAAT_KATILIM_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.ZIRAAT_KATILIM_PAYMENT_API || 'https://vpos.ziraatkatilim.com.tr/Mpi/XMLGate.aspx',
          gateway_3d: env.ZIRAAT_KATILIM_GATEWAY_3D || 'https://vpos.ziraatkatilim.com.tr/Mpi/Default.aspx',
          gateway_3d_host: env.ZIRAAT_KATILIM_GATEWAY_3D_HOST || 'https://vpos.ziraatkatilim.com.tr/Mpi/3Dhost.aspx',
        },
      }),
  },

  {
    key: 'kuveytturk',
    label: 'Kuveyt Türk (BOA)',
    requiredEnv: ['KUVEYTTURK_MERCHANT_ID', 'KUVEYTTURK_USERNAME', 'KUVEYTTURK_SECRET_KEY'],
    build: (env) =>
      new KuveytPosGateway({
        merchantId: env.KUVEYTTURK_MERCHANT_ID || '',
        username: env.KUVEYTTURK_USERNAME || '',
        secretKey: env.KUVEYTTURK_SECRET_KEY || '',
        extra: { customer_id: env.KUVEYTTURK_CUSTOMER_ID },
        testMode: env.KUVEYTTURK_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.KUVEYTTURK_PAYMENT_API || 'https://sanalpos.kuveytturk.com.tr/ServiceGateWay/Home',
          query_api:
            env.KUVEYTTURK_QUERY_API ||
            'https://boa.kuveytturk.com.tr/BOA.Integration.WCFService/BOA.Integration.VirtualPos/VirtualPosService.svc/Basic',
        },
      }),
  },

  {
    key: 'vakif-katilim',
    label: 'Vakıf Katılım (BOA)',
    requiredEnv: ['VAKIF_KATILIM_MERCHANT_ID', 'VAKIF_KATILIM_USERNAME', 'VAKIF_KATILIM_SECRET_KEY'],
    build: (env) =>
      new VakifKatilimGateway({
        merchantId: env.VAKIF_KATILIM_MERCHANT_ID || '',
        username: env.VAKIF_KATILIM_USERNAME || '',
        secretKey: env.VAKIF_KATILIM_SECRET_KEY || '',
        extra: {
          customer_id: env.VAKIF_KATILIM_CUSTOMER_ID,
          sub_merchant_id: env.VAKIF_KATILIM_SUB_MERCHANT_ID || '0',
        },
        testMode: env.VAKIF_KATILIM_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.VAKIF_KATILIM_PAYMENT_API || 'https://boa.vakifkatilim.com.tr/VirtualPOS.Gateway/Home',
          gateway_3d_host:
            env.VAKIF_KATILIM_GATEWAY_3D_HOST || 'https://boa.vakifkatilim.com.tr/VirtualPOS.Gateway/CommonPaymentPage/CommonPaymentPage',
        },
      }),
  },

  // --- Ödeme kuruluşları ---
  {
    key: 'akbank-pos',
    label: 'Akbank (yeni JSON API)',
    requiredEnv: ['AKBANK_POS_MERCHANT_SAFE_ID', 'AKBANK_POS_TERMINAL_SAFE_ID', 'AKBANK_POS_SECRET_KEY'],
    build: (env) =>
      new AkbankPosGateway({
        merchantId: env.AKBANK_POS_MERCHANT_SAFE_ID || '',
        terminalId: env.AKBANK_POS_TERMINAL_SAFE_ID || '',
        secretKey: env.AKBANK_POS_SECRET_KEY || '',
        testMode: env.AKBANK_POS_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.AKBANK_POS_PAYMENT_API || 'https://api.akbank.com/api/v1/payment/virtualpos',
          gateway_3d: env.AKBANK_POS_GATEWAY_3D || 'https://virtualpospaymentgateway.akbank.com/securepay',
          gateway_3d_host: env.AKBANK_POS_GATEWAY_3D_HOST || 'https://virtualpospaymentgateway.akbank.com/payhosting',
        },
      }),
  },

  {
    key: 'paytr',
    label: 'PayTR',
    requiredEnv: ['PAYTR_MERCHANT_ID', 'PAYTR_MERCHANT_KEY', 'PAYTR_MERCHANT_SALT'],
    build: (env) =>
      new PayTrGateway({
        merchantId: env.PAYTR_MERCHANT_ID || '',
        // PayTR terminolojisi: secretKey => merchant key, password => merchant salt.
        secretKey: env.PAYTR_MERCHANT_KEY || '',
        password: env.PAYTR_MERCHANT_SALT || '',
        testMode: env.PAYTR_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.PAYTR_PAYMENT_API || 'https://www.paytr.com',
          gateway_3d: env.PAYTR_GATEWAY_3D || 'https://www.paytr.com/odeme',
          gateway_3d_host: env.PAYTR_GATEWAY_3D_HOST || 'https://www.paytr.com/odeme/guvenli',
        },
      }),
  },

  {
    key: 'tami',
    label: 'Tami',
    requiredEnv: ['TAMI_MERCHANT_NUMBER', 'TAMI_TERMINAL_NUMBER', 'TAMI_SECRET_KEY', 'TAMI_JWK_KID', 'TAMI_JWK_K'],
    build: (env) =>
      new TamiGateway({
        merchantId: env.TAMI_MERCHANT_NUMBER || '',
        terminalId: env.TAMI_TERMINAL_NUMBER || '',
        secretKey: env.TAMI_SECRET_KEY || '',
        // Tami terminolojisi: username/password burada JWK kid/k çiftidir
        // — PG-Auth-Token'daki secretKey'den ayrı bir anahtar.
        username: env.TAMI_JWK_KID || '',
        password: env.TAMI_JWK_K || '',
        extra: { payment_group: env.TAMI_PAYMENT_GROUP || 'PRODUCT' },
        // securityHash/hashedData formülü Tami tarafından resmen
        // doğrulanmadı; riski bilerek test ederken TAMI_VERIFY_HASH=true
        // yapabilirsiniz.
        verifyHash: env.TAMI_VERIFY_HASH === 'true',
        testMode: env.TAMI_TEST_MODE === 'true',
        endpoints: { payment_api: env.TAMI_PAYMENT_API || 'https://paymentapi.tami.com.tr' },
      }),
  },

  {
    key: 'tosla',
    label: 'Tosla (AkÖde)',
    requiredEnv: ['TOSLA_CLIENT_ID', 'TOSLA_API_USER', 'TOSLA_API_PASS'],
    build: (env) =>
      new ToslaGateway({
        merchantId: env.TOSLA_CLIENT_ID || '',
        username: env.TOSLA_API_USER || '',
        secretKey: env.TOSLA_API_PASS || '',
        testMode: env.TOSLA_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.TOSLA_PAYMENT_API || 'https://entegrasyon.tosla.com/api/Payment',
          gateway_3d: env.TOSLA_GATEWAY_3D || 'https://entegrasyon.tosla.com/api/Payment/ProcessCardForm',
          gateway_3d_host: env.TOSLA_GATEWAY_3D_HOST || 'https://entegrasyon.tosla.com/api/Payment/threeDSecure',
        },
      }),
  },

  {
    key: 'paycell',
    label: 'Paycell (Turkcell)',
    requiredEnv: ['PAYCELL_MERCHANT_CODE', 'PAYCELL_APPLICATION_NAME', 'PAYCELL_APPLICATION_PWD', 'PAYCELL_SECURE_CODE'],
    build: (env) =>
      new PaycellGateway({
        // Paycell terminolojisi: merchantId => merchantCode, username =>
        // applicationName, password => applicationPwd, secretKey => secureCode.
        merchantId: env.PAYCELL_MERCHANT_CODE || '',
        username: env.PAYCELL_APPLICATION_NAME || '',
        password: env.PAYCELL_APPLICATION_PWD || '',
        secretKey: env.PAYCELL_SECURE_CODE || '',
        extra: {
          msisdn: env.PAYCELL_MSISDN,
          eula_id: env.PAYCELL_EULA_ID || '17',
          client_ip: env.PAYCELL_CLIENT_IP || '127.0.0.1',
        },
        testMode: env.PAYCELL_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.PAYCELL_PAYMENT_API || 'https://tpay.turkcell.com.tr/tpay/provision/services/restful/getCardToken',
          token_api: env.PAYCELL_TOKEN_API || 'https://epayment.turkcell.com.tr/paymentmanagement/rest/getCardTokenSecure',
          gateway_3d: env.PAYCELL_GATEWAY_3D || 'https://epayment.turkcell.com.tr/paymentmanagement/rest/threeDSecure',
        },
      }),
  },

  {
    key: 'paratika',
    label: 'Paratika (Payten)',
    requiredEnv: ['PARATIKA_MERCHANT', 'PARATIKA_MERCHANT_USER', 'PARATIKA_MERCHANT_PASSWORD'],
    build: (env) =>
      new ParatikaGateway({
        // Paratika terminolojisi: merchantId => MERCHANT, username => API
        // kullanıcı e-postası, password => şifresi.
        merchantId: env.PARATIKA_MERCHANT || '',
        username: env.PARATIKA_MERCHANT_USER || '',
        password: env.PARATIKA_MERCHANT_PASSWORD || '',
        secretKey: env.PARATIKA_SECRET_KEY || '',
        testMode: env.PARATIKA_TEST_MODE === 'true',
        endpoints: {
          payment_api: env.PARATIKA_PAYMENT_API || 'https://vpos.paratika.com.tr/paratika/api/v2',
          gateway_3d: env.PARATIKA_GATEWAY_3D || 'https://vpos.paratika.com.tr/paratika/api/v2/post/sale3d',
          gateway_3d_auth: env.PARATIKA_GATEWAY_3D_AUTH || 'https://vpos.paratika.com.tr/paratika/api/v2/post/auth3d',
          gateway_3d_host: env.PARATIKA_GATEWAY_3D_HOST || 'https://vpos.paratika.com.tr/payment',
        },
      }),
  },

  {
    key: 'moka',
    label: 'Moka United',
    requiredEnv: ['MOKA_DEALER_CODE', 'MOKA_USERNAME', 'MOKA_PASSWORD'],
    build: (env) =>
      new MokaGateway({
        merchantId: env.MOKA_DEALER_CODE || '',
        username: env.MOKA_USERNAME || '',
        password: env.MOKA_PASSWORD || '',
        testMode: env.MOKA_TEST_MODE === 'true',
        extra: {
          pool_payment: env.MOKA_POOL_PAYMENT === 'true',
          redirect_type: env.MOKA_REDIRECT_TYPE || 0,
          software: env.MOKA_SOFTWARE || 'anadolupay-node-example',
        },
        endpoints: { payment_api: env.MOKA_PAYMENT_API || 'https://service.mokaunited.com' },
      }),
  },

  {
    key: 'craftgate',
    label: 'Craftgate',
    requiredEnv: ['CRAFTGATE_API_KEY', 'CRAFTGATE_SECRET_KEY', 'CRAFTGATE_CALLBACK_KEY'],
    build: (env) =>
      new CraftgateGateway({
        // Craftgate terminolojisi: username => API Key, secretKey => Secret
        // Key, password => 3D Secure Callback Key.
        username: env.CRAFTGATE_API_KEY || '',
        secretKey: env.CRAFTGATE_SECRET_KEY || '',
        password: env.CRAFTGATE_CALLBACK_KEY || '',
        extra: {
          merchant_hook_key: env.CRAFTGATE_HOOK_KEY,
          payment_group: env.CRAFTGATE_PAYMENT_GROUP || 'PRODUCT',
        },
        testMode: env.CRAFTGATE_TEST_MODE === 'true',
        endpoints: { payment_api: env.CRAFTGATE_PAYMENT_API || 'https://api.craftgate.io' },
      }),
  },
];

/** Bir sürücünün kimlik bilgilerinin dolu olup olmadığını kontrol eder. */
export function driverReadiness(def, env) {
  const missing = def.requiredEnv.filter((name) => !env[name] || env[name] === '');

  return { ready: missing.length === 0, missing };
}

/** Tüm sürücüleri, kurulu (instantiated) hâlde ve hazır bilgisiyle döner. */
export function buildRegistry(env = process.env) {
  return DRIVER_DEFS.map((def) => ({
    def,
    gateway: def.build(env),
    ...driverReadiness(def, env),
  }));
}
