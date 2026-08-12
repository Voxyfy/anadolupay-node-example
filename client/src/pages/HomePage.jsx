import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

function randomOrderId() {
  return `TEST-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [drivers, setDrivers] = useState([]);
  const [cards, setCards] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const [orderId] = useState(randomOrderId);
  // Sonuç sayfasından dönüldüğünde sürücüyü hatırla — bileşen her açılışta
  // varsayılana dönseydi durum sorgusu farkında olmadan başka bir
  // sağlayıcıya gidip "bulunamadı" derdi.
  const [driver, setDriver] = useState(() => searchParams.get('driver') || 'fake');
  const [amount, setAmount] = useState('100.00');
  const [installment, setInstallment] = useState(1);
  const [paymentModel, setPaymentModel] = useState('3d');
  const [preset, setPreset] = useState('');
  const [cardNumber, setCardNumber] = useState('5890040000000016');
  const [expireMonth, setExpireMonth] = useState('12');
  const [expireYear, setExpireYear] = useState('2030');
  const [cvv, setCvv] = useState('123');
  const [holderName, setHolderName] = useState('Test Kullanıcı');

  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState(null);

  const [statusOrderId, setStatusOrderId] = useState(() => searchParams.get('order') || '');
  const [statusResult, setStatusResult] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const [opPaymentId, setOpPaymentId] = useState('');
  const [opAmount, setOpAmount] = useState('');
  const [opBin, setOpBin] = useState('589004');
  const [opResult, setOpResult] = useState(null);
  const [opLoading, setOpLoading] = useState(null);

  useEffect(() => {
    api
      .drivers()
      .then((data) => setDrivers(data.drivers))
      .catch((error) => setLoadError(error.message));

    api
      .testCards()
      .then((data) => setCards(data.cards))
      .catch(() => {});
  }, []);

  const currentDriver = useMemo(() => drivers.find((d) => d.key === driver), [drivers, driver]);
  const readyDrivers = useMemo(() => drivers.filter((d) => d.ready), [drivers]);
  const cardsForDriver = useMemo(() => cards.filter((c) => c.driver === driver), [cards, driver]);

  function applyPreset(key) {
    setPreset(key);
    const card = cards.find((c) => c.key === key);
    if (!card) return;

    setCardNumber(card.number);
    setExpireMonth(card.month);
    setExpireYear(card.year);
    setCvv(card.cvv);
    setOpBin(card.number.slice(0, 6));
  }

  async function submitPayment(event) {
    event.preventDefault();
    setSubmitting(true);
    setPayError(null);

    try {
      const response = await api.pay({
        driver,
        orderId,
        amount,
        installment,
        paymentModel,
        cardNumber,
        expireMonth,
        expireYear,
        cvv,
        holderName,
      });

      if (!response.requiresForm && response.redirectUrl) {
        window.location.href = response.redirectUrl;
        return;
      }

      if (response.htmlContent) {
        // Bankanın hazır döndürdüğü HTML sayfası (form kendi kendini gönderir).
        document.open();
        document.write(response.htmlContent);
        document.close();
        return;
      }

      if (!response.requiresForm) {
        // Sağlayıcı ödemeyi (istisna fırlatmadan) reddetti — asıl sebep
        // varsa onu göster, "ne form ne HTML var" genel mesajına düşme.
        setPayError(
          response.errorMessage
            ? `${response.errorMessage}${response.errorCode ? ` (${response.errorCode})` : ''}`
            : 'Banka 3D içeriği döndürmedi (ne form alanı ne HTML var).',
        );
        setSubmitting(false);
        return;
      }

      // Gerçek bir form POST'u ile bankanın 3D sayfasına git — fetch/XHR
      // ile değil, çünkü tarayıcının çerezleri/yönlendirmeleri gerekiyor.
      const form = document.createElement('form');
      form.method = response.formMethod || 'POST';
      form.action = response.formAction;

      for (const [name, value] of Object.entries(response.formFields || {})) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = String(value);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setPayError(error.detail?.message || error.message);
      setSubmitting(false);
    }
  }

  async function checkStatus() {
    if (!statusOrderId) return;

    setStatusLoading(true);
    setStatusResult(null);

    try {
      const result = await api.status(driver, statusOrderId);
      setStatusResult(result);
    } catch (error) {
      setStatusResult({ error: error.detail?.message || error.message });
    } finally {
      setStatusLoading(false);
    }
  }

  async function runOperation(name, fn) {
    setOpLoading(name);
    setOpResult(null);

    try {
      const data = await fn();
      setOpResult({ operation: name, ok: true, data });
    } catch (error) {
      setOpResult({ operation: name, ok: false, data: error.detail || { message: error.message } });
    } finally {
      setOpLoading(null);
    }
  }

  const minorUnits = useMemo(() => {
    const value = Number(String(amount).replace(',', '.'));
    return Number.isNaN(value) ? null : Math.round(value * 100);
  }, [amount]);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">AnadoluPay</span>
          <span className="brand-sub">Node.js Ödeme Önizleme</span>
        </div>
        <div className="order-chip">
          <span>sipariş</span>
          <code>{orderId}</code>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <h1>Gerçek bankaya, gerçek istek.</h1>
          <p>
            Form → sağlayıcının 3D sayfası → dönüş doğrulaması. Akışın tamamı{' '}
            <code>@voxyfy/anadolupay</code> paketinin driver&apos;ları üzerinden çalışır.
          </p>
        </section>

        {loadError && <div className="banner banner-error">Sunucuya bağlanılamadı: {loadError}</div>}

        {currentDriver && !currentDriver.ready && (
          <div className="banner banner-warning">
            <strong>{currentDriver.label}</strong> için kimlik bilgisi girilmemiş.
            <p>
              Eksik alanlar:{' '}
              {currentDriver.missing.map((m, index) => (
                <span key={m}>
                  <code>{m}</code>
                  {index < currentDriver.missing.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
            <p>Değerleri kök dizindeki <code>.env</code> dosyasına ekleyip sunucuyu yeniden başlatın.</p>
            {readyDrivers.length > 0 && (
              <p>
                Şu an hazır olanlar:{' '}
                {readyDrivers.map((d) => (
                  <button key={d.key} type="button" className="pill-button" onClick={() => setDriver(d.key)}>
                    {d.key}
                  </button>
                ))}
              </p>
            )}
          </div>
        )}

        <form onSubmit={submitPayment} className="grid-columns">
          <div className="stack">
            <section className="card">
              <div className="card-head">
                <h2>Sipariş</h2>
                <span className="muted mono">{minorUnits !== null ? `${minorUnits.toLocaleString('tr-TR')} kuruş` : 'geçersiz tutar'}</span>
              </div>

              <div className="field-grid three">
                <label>
                  Sağlayıcı
                  <select value={driver} onChange={(e) => setDriver(e.target.value)}>
                    {drivers.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.ready ? d.key : `${d.key} (kimlik yok)`}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tutar (TL)
                  <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </label>

                <label>
                  Taksit
                  <select value={installment} onChange={(e) => setInstallment(Number(e.target.value))}>
                    {[1, 2, 3, 6, 9, 12].map((count) => (
                      <option key={count} value={count}>
                        {count === 1 ? 'Tek çekim' : `${count} taksit`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                Ödeme modeli
                <select value={paymentModel} onChange={(e) => setPaymentModel(e.target.value)}>
                  <option value="3d">3D Secure — doğrulama sonrası ayrı provizyon</option>
                  <option value="3d_pay">3D Pay — tek adımda</option>
                  <option value="3d_host">3D Host — kart formu sağlayıcıda</option>
                  <option value="regular">Non-secure — 3D yok</option>
                </select>
              </label>
            </section>

            <section className="card">
              <div className="card-head">
                <h2>Kart</h2>
              </div>

              <label>
                Hazır test kartı
                <select value={preset} onChange={(e) => applyPreset(e.target.value)}>
                  <option value="">— elle gir —</option>
                  {cardsForDriver.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              {paymentModel !== '3d_host' && (
                <>
                  <label>
                    Kart numarası
                    <input inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                  </label>

                  <div className="field-grid three">
                    <label>
                      Ay
                      <input maxLength={2} inputMode="numeric" value={expireMonth} onChange={(e) => setExpireMonth(e.target.value)} />
                    </label>
                    <label>
                      Yıl
                      <input maxLength={4} inputMode="numeric" value={expireYear} onChange={(e) => setExpireYear(e.target.value)} />
                    </label>
                    <label>
                      CVV
                      <input maxLength={4} inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value)} />
                    </label>
                  </div>

                  <label>
                    Kart sahibi
                    <input value={holderName} onChange={(e) => setHolderName(e.target.value)} />
                  </label>
                </>
              )}
            </section>
          </div>

          <aside className="summary card">
            <div className="summary-amount">
              <span className="muted">Tahsil edilecek</span>
              <div className="amount-row">
                <span className="amount">{Number(amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                <span className="muted">TL</span>
              </div>
              {installment > 1 && (
                <div className="muted small">
                  {installment} taksit · {(Number(amount || 0) / installment).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL/ay
                </div>
              )}
            </div>

            <dl className="summary-list">
              <div>
                <dt>Sağlayıcı</dt>
                <dd className="mono">{driver}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd className="mono">{paymentModel}</dd>
              </div>
              <div>
                <dt>Kuruş</dt>
                <dd className="mono">{minorUnits ?? '—'}</dd>
              </div>
            </dl>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Gönderiliyor…' : 'Ödemeyi başlat'}
            </button>

            {payError && <p className="error-text">{payError}</p>}

            <p className="muted small">
              3D dönüşü sunucu tarafındaki <code>/api/payment/callback</code> adresine gelir, imzası paket tarafından doğrulanır.
            </p>
          </aside>
        </form>

        <section className="card">
          <div className="card-head">
            <h2>Durum sorgusu</h2>
            <span className="chip">{driver}</span>
          </div>
          <p className="muted">
            Zaman aşımı gibi belirsiz sonuçları kapatmanın tek yolu sağlayıcıya sormaktır.
          </p>

          {!currentDriver?.capabilities?.status ? (
            <div className="banner banner-warning small">
              <strong>{driver}</strong> durum sorgusu sunmuyor — bu bir eksiklik değil, sağlayıcı sınırıdır.
            </div>
          ) : (
            <>
              <div className="inline-form">
                <input placeholder={orderId} value={statusOrderId} onChange={(e) => setStatusOrderId(e.target.value)} />
                <button type="button" onClick={checkStatus} disabled={statusLoading}>
                  {statusLoading ? 'Sorgulanıyor…' : 'Sorgula'}
                </button>
              </div>

              {statusResult && <ResultBlock data={statusResult} />}
            </>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Ödeme sonrası işlemler</h2>
            <span className="chip">{driver}</span>
          </div>
          <p className="muted">
            İade, iptal, BIN ve taksit sorgusu — ödeme numarası sonuç sayfasındaki <code>paymentId</code> değeridir.
          </p>

          <div className="field-grid three">
            <label>
              Ödeme numarası
              <input placeholder="37192321" value={opPaymentId} onChange={(e) => setOpPaymentId(e.target.value)} />
            </label>
            <label>
              İade tutarı
              <input placeholder="boş = tam iade" value={opAmount} onChange={(e) => setOpAmount(e.target.value)} />
            </label>
            <label>
              BIN
              <input placeholder="589004" value={opBin} onChange={(e) => setOpBin(e.target.value)} />
            </label>
          </div>

          <div className="button-row">
            <button
              type="button"
              disabled={opLoading !== null}
              onClick={() => runOperation('İade', () => api.refund({ driver, paymentId: opPaymentId, amount: opAmount || undefined }))}
            >
              {opLoading === 'İade' ? 'İade ediliyor…' : 'İade et'}
            </button>

            {currentDriver?.capabilities?.cancel && (
              <button
                type="button"
                disabled={opLoading !== null}
                onClick={() => runOperation('İptal', () => api.cancel({ driver, paymentId: opPaymentId }))}
              >
                {opLoading === 'İptal' ? 'İptal ediliyor…' : 'İptal et'}
              </button>
            )}

            {currentDriver?.capabilities?.bin && (
              <button
                type="button"
                className="ghost"
                disabled={opLoading !== null}
                onClick={() => runOperation('BIN sorgusu', () => api.binLookup({ driver, bin: opBin }))}
              >
                {opLoading === 'BIN sorgusu' ? 'Sorgulanıyor…' : 'BIN sorgula'}
              </button>
            )}

            {currentDriver?.capabilities?.installment && (
              <button
                type="button"
                className="ghost"
                disabled={opLoading !== null}
                onClick={() => runOperation('Taksit sorgusu', () => api.installmentOptions({ driver, amount, bin: opBin }))}
              >
                {opLoading === 'Taksit sorgusu' ? 'Sorgulanıyor…' : 'Taksitleri sorgula'}
              </button>
            )}
          </div>

          {opResult && (
            <div className={`op-result ${opResult.ok ? 'ok' : 'fail'}`}>
              <span className="op-result-label">
                {opResult.operation} · {opResult.ok ? 'tamam' : 'hata'}
              </span>
              <pre>{JSON.stringify(opResult.data, null, 2)}</pre>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ResultBlock({ data }) {
  return (
    <div className="result-block">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
