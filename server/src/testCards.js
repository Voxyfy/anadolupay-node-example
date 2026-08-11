/**
 * Sağlayıcıların resmî olarak yayınladığı test kartları.
 *
 * anadolupay-laravel örnek projesindeki listeyle aynı kaynaktan gelir
 * (bkz. o projede `resources/views/pages/payment-preview.blade.php`).
 * Buraya yalnızca kaynağı doğrulanmış numaralar konur.
 */
export const TEST_CARDS = [
  { key: 'iyzico-success', driver: 'iyzico', label: 'iyzico — Başarılı (Akbank Master)', number: '5890040000000016', month: '12', year: '2030', cvv: '123' },
  { key: 'iyzico-insufficient', driver: 'iyzico', label: 'iyzico — Yetersiz bakiye', number: '4111111111111129', month: '12', year: '2030', cvv: '123' },
  { key: 'garanti-simulator', driver: 'garanti', label: 'Garanti — Simulator (OTP 147852)', number: '4282209004348015', month: '08', year: '2027', cvv: '123' },
  { key: 'garanti-bonus', driver: 'garanti', label: 'Garanti — Bonus (OTP 147852)', number: '5549600732695519', month: '04', year: '2030', cvv: '244' },
  { key: 'paytr-visa', driver: 'paytr', label: 'PayTR — Visa', number: '4355084355084358', month: '12', year: '2030', cvv: '000' },
  { key: 'paytr-master', driver: 'paytr', label: 'PayTR — Mastercard', number: '5406675406675403', month: '12', year: '2030', cvv: '000' },
  { key: 'craftgate-master', driver: 'craftgate', label: 'Craftgate — Mastercard', number: '5258640000000001', month: '07', year: '2044', cvv: '000' },
  { key: 'craftgate-visa', driver: 'craftgate', label: 'Craftgate — Visa', number: '4256690000000001', month: '11', year: '2035', cvv: '123' },
  { key: 'moka-isbank', driver: 'moka', label: 'Moka — İş Bankası (Visa)', number: '4183441122223339', month: '12', year: '2030', cvv: '000' },
  { key: 'moka-akbank', driver: 'moka', label: 'Moka — Akbank (Master)', number: '5127541122223332', month: '12', year: '2030', cvv: '000' },
  { key: 'moka-ziraat', driver: 'moka', label: 'Moka — Ziraat (Master)', number: '5136621122223331', month: '12', year: '2030', cvv: '000' },
  { key: 'nestpay-ziraat-visa', driver: 'ziraat', label: 'Ziraat / NestPay — Visa (3D şifre: a)', number: '4546711234567894', month: '12', year: '2026', cvv: '000' },
  { key: 'nestpay-ziraat-master', driver: 'ziraat', label: 'Ziraat / NestPay — Mastercard (3D şifre: a)', number: '5401341234567891', month: '12', year: '2026', cvv: '000' },
  { key: 'nestpay-akbank-master', driver: 'akbank', label: 'Akbank NestPay — Mastercard (3D şifre: a)', number: '5571135571135575', month: '12', year: '2026', cvv: '000' },
  { key: 'nestpay-akbank-visa', driver: 'akbank', label: 'Akbank NestPay — Visa (3D şifre: a)', number: '4355084355084358', month: '12', year: '2026', cvv: '000' },
  { key: 'nestpay-tfkb-master', driver: 'turkiyefinans', label: 'Türkiye Finans NestPay — Mastercard (3D şifre: a)', number: '5377195377190410', month: '12', year: '2026', cvv: '000' },
  { key: 'nestpay-tfkb-visa', driver: 'turkiyefinans', label: 'Türkiye Finans NestPay — Visa (3D şifre: a)', number: '4799174799173828', month: '12', year: '2026', cvv: '000' },
  { key: 'tosla-ziraat', driver: 'tosla', label: 'Tosla — Ziraat Bankkart (Visa)', number: '4546711234567894', month: '12', year: '2026', cvv: '000' },
  { key: 'tosla-visa', driver: 'tosla', label: 'Tosla — Visa', number: '4531444531442283', month: '12', year: '2026', cvv: '001' },
  { key: 'tosla-master', driver: 'tosla', label: 'Tosla — Mastercard', number: '5406675406675403', month: '12', year: '2026', cvv: '000' },
  { key: 'kuveyt-master', driver: 'kuveytturk', label: 'Kuveyt Türk — Mastercard (3D kodu: 123456)', number: '5188961939192544', month: '06', year: '2029', cvv: '588' },
  { key: 'akbank-master', driver: 'akbank-pos', label: 'Akbank — Mastercard', number: '5578293000121055', month: '11', year: '2040', cvv: '238' },
  { key: 'qnb-visa', driver: 'qnb-payfor', label: 'QNB PayFor — Visa (CVV boş geçilebilir)', number: '4022780198283155', month: '01', year: '2050', cvv: '' },
  { key: 'qnb-visa-1', driver: 'qnb-payfor', label: 'QNB PayFor — Visa 1', number: '4155650100416111', month: '12', year: '2025', cvv: '656' },
  { key: 'qnb-mc-1', driver: 'qnb-payfor', label: 'QNB PayFor — Mastercard 1', number: '5209882483498019', month: '12', year: '2025', cvv: '656' },
  { key: 'vakifbank-visa', driver: 'vakifbank', label: 'VakıfBank — Visa', number: '4355084000000001', month: '12', year: '2029', cvv: '000' },
  { key: 'vakifbank-master', driver: 'vakifbank', label: 'VakıfBank — Mastercard (yalnız 3D)', number: '5521010140829928', month: '12', year: '2029', cvv: '961' },
  { key: 'paratika-akbank', driver: 'paratika', label: 'Paratika — Akbank (Visa)', number: '4355084355084358', month: '12', year: '2030', cvv: '000' },
  { key: 'paratika-isbank', driver: 'paratika', label: 'Paratika — İş Bankası (Visa)', number: '4508034508034509', month: '12', year: '2030', cvv: '000' },
  { key: 'yapikredi-master', driver: 'yapikredi', label: 'Yapı Kredi — Mastercard (doğrulanmadı)', number: '5400637500005263', month: '12', year: '2030', cvv: '111' },
  { key: 'paycell-akbank-visa', driver: 'paycell', label: 'Paycell — Akbank (Visa)', number: '4355093000777068', month: '11', year: '2040', cvv: '238' },
  { key: 'paycell-denizbank', driver: 'paycell', label: 'Paycell — DenizBank (3D şifre: 123456)', number: '5200190006338608', month: '01', year: '2030', cvv: '410' },
  { key: 'albaraka-visa', driver: 'albaraka', label: 'Albaraka — Visa (3D onay kodu: 34020)', number: '4506347010299085', month: '09', year: '2026', cvv: '000' },
  { key: 'ziraat-3dpay', driver: 'ziraat-payflex', label: 'Ziraat 3D Pay — Mastercard', number: '5549601963997012', month: '09', year: '2029', cvv: '259' },
];
