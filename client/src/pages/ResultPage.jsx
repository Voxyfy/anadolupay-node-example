import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order') || '';
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    api
      .result(orderId)
      .then(setResult)
      .catch((err) => setError(err.message));
  }, [orderId]);

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
            <strong>{result.message}</strong>
          </div>
        )}

        {result && (
          <section className="card">
            <div className="card-head">
              <h2>Ayrıntı</h2>
            </div>
            <pre>{JSON.stringify(result.detail, null, 2)}</pre>
          </section>
        )}

        {result?.raw && (
          <section className="card">
            <div className="card-head">
              <h2>Ham yanıt (raw)</h2>
            </div>
            <pre>{JSON.stringify(result.raw, null, 2)}</pre>
          </section>
        )}

        {result?.payload && (
          <section className="card">
            <div className="card-head">
              <h2>Bankadan gelen POST (payload)</h2>
            </div>
            <pre>{JSON.stringify(result.payload, null, 2)}</pre>
          </section>
        )}

        <Link to="/" className="primary-button link-button">
          ← Yeni ödeme dene
        </Link>
      </main>
    </div>
  );
}
