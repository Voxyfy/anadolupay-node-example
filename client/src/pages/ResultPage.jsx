import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import CopyButton from '../components/CopyButton.jsx';

export default function ResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order') || '';
  const driver = params.get('driver') || '';
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    api
      .result(orderId)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [orderId]);

  const fullReport = result
    ? JSON.stringify(
        {
          driver,
          orderId,
          success: result.success,
          message: result.message,
          detail: result.detail ?? null,
          payload: result.payload ?? null,
          raw: result.raw ?? null,
        },
        null,
        2,
      )
    : null;

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">AnadoluPay</span>
          <span className="brand-sub">Sonuç</span>
        </div>
        <div className="order-chip">
          <span>sipariş</span>
          <code>{orderId || '—'}</code>
        </div>
      </header>

      <main className="container">
        {error && <div className="banner banner-error">{error}</div>}

        {result && (
          <div className={`banner ${result.success ? 'banner-success' : 'banner-error'}`}>
            <strong>{result.success ? 'Onaylandı' : 'Alınamadı'}</strong>
            <p style={{ margin: '4px 0 0' }}>{result.message}</p>
          </div>
        )}

        {fullReport && (
          <div className="toolbar">
            <CopyButton text={fullReport} label="Tümünü JSON olarak kopyala" className="toolbar-copy" />
          </div>
        )}

        {result && (
          <section className="card">
            <div className="card-head">
              <h2>Ayrıntı</h2>
              <CopyButton text={JSON.stringify(result.detail, null, 2)} />
            </div>
            <pre>{JSON.stringify(result.detail, null, 2)}</pre>
          </section>
        )}

        {result?.raw && (
          <section className="card">
            <div className="card-head">
              <h2>Ham yanıt (raw)</h2>
              <CopyButton text={JSON.stringify(result.raw, null, 2)} />
            </div>
            <pre>{JSON.stringify(result.raw, null, 2)}</pre>
          </section>
        )}

        {result?.payload && (
          <section className="card">
            <div className="card-head">
              <h2>Bankadan gelen POST (payload)</h2>
              <CopyButton text={JSON.stringify(result.payload, null, 2)} />
            </div>
            <pre>{JSON.stringify(result.payload, null, 2)}</pre>
          </section>
        )}

        <Link
          to={{
            pathname: '/',
            search: new URLSearchParams({
              ...(driver ? { driver } : {}),
              ...(result?.detail?.order_id ? { order: result.detail.order_id } : {}),
            }).toString(),
          }}
          className="primary-button link-button"
        >
          ← Yeni ödeme dene
        </Link>
      </main>
    </div>
  );
}
