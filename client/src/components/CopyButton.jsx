import { useState } from 'react';

/**
 * Panoya kopyalama düğmesi.
 *
 * `navigator.clipboard` güvenli bağlam (https veya localhost) ister; bu
 * projede her ikisi de sağlanıyor ama yine de eski `textarea` + `execCommand`
 * yoluna düşer — anadolupay-laravel'deki sonuç sayfasındaki davranışın aynısı.
 */
export default function CopyButton({ text, label = 'Kopyala', className = '' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button type="button" className={`copy-button ${copied ? 'done' : ''} ${className}`} onClick={handleCopy}>
      {copied ? 'Kopyalandı' : label}
    </button>
  );
}
