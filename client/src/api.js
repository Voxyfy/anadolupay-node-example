const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body?.error?.message || 'İstek başarısız oldu.');
    error.detail = body?.error;
    throw error;
  }

  return body;
}

export const api = {
  drivers: () => request('/drivers'),
  testCards: () => request('/test-cards'),
  pay: (payload) => request('/pay', { method: 'POST', body: JSON.stringify(payload) }),
  result: (orderId) => request(`/result/${encodeURIComponent(orderId)}`),
  status: (driver, orderId) => request(`/status/${encodeURIComponent(driver)}/${encodeURIComponent(orderId)}`),
  refund: (payload) => request('/operations/refund', { method: 'POST', body: JSON.stringify(payload) }),
  cancel: (payload) => request('/operations/cancel', { method: 'POST', body: JSON.stringify(payload) }),
  binLookup: (payload) => request('/operations/bin-lookup', { method: 'POST', body: JSON.stringify(payload) }),
  installmentOptions: (payload) => request('/operations/installment-options', { method: 'POST', body: JSON.stringify(payload) }),
  capture: (payload) => request('/operations/capture', { method: 'POST', body: JSON.stringify(payload) }),
};
