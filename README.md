# anadolupay-node-example

[`@voxyfy/anadolupay`](https://www.npmjs.com/package/@voxyfy/anadolupay) (Node.js/TypeScript
portu) paketini gerçek banka/sağlayıcı test ortamlarına karşı denemek için
hazırlanmış küçük bir test aracı — [`anadolupay-laravel`](https://github.com/Voxyfy/anadolupay-laravel)
örnek Laravel projesindeki "Ödeme Önizleme" ekranının Node.js/React karşılığı.

Akış aynı: **form → sağlayıcının 3D sayfası → dönüş doğrulaması.** Hiçbir adım
taklit edilmez, hepsi paketin kendi driver'ları üzerinden çalışır.

## Mimari

- **`server/`** — Express API. `@voxyfy/anadolupay`'i sarmalar, sürücüleri
  `.env`'den kurar, ödeme başlatma/doğrulama/iade/durum sorgusu uçlarını
  sunar. Bankanın 3D dönüşü de buraya (`/api/payment/callback`) POST edilir.
- **`client/`** — Vite + React (18, LTS) arayüzü. Sürücü/kart/tutar seçimi,
  sonuç ekranı ve ödeme sonrası işlemler (iade/iptal/BIN/taksit sorgusu).

İki süreç ayrı çalışır (API :4000, arayüz :5173); Vite dev sunucusu `/api`
isteklerini Express'e proxy'ler.

## Kurulum

```bash
npm install
```

(npm workspaces sayesinde `server/` ve `client/` bağımlılıkları tek seferde
kurulur.)

### `.env`

Kök dizindeki `.env` dosyası, **`anadolupay-laravel`/`config/anadolupay.php`
ile birebir aynı değişken adlarını** kullanır — bu yüzden o projenin
`.env`'indeki değerleri doğrudan buraya kopyalayabilirsiniz (zaten bu
depoda `.env` bu şekilde dolduruldu, sadece gerçek/güncel kimlik
bilgilerinizle senkron tutun). Yapı için `.env.example`'a bakın.

Bir sürücünün alanları boşsa arayüzde "kimlik bilgisi girilmemiş" uyarısı
görünür; o sürücüyle ödeme denenemez ama uygulama çökmez.

## Çalıştırma

```bash
npm run dev
```

Bu, `server` (http://localhost:4000) ve `client`'ı (http://localhost:5173)
aynı anda başlatır. Tarayıcıda **http://localhost:5173** açın.

## Kullanım

1. Sağlayıcı, tutar, taksit ve ödeme modelini seçin. "Hazır test kartı"
   listesinden resmî kaynaklı bir test kartı seçebilir veya elle
   girebilirsiniz.
2. "Ödemeyi başlat" — sunucu `createPayment()`'ı çağırır, dönen sonuca göre:
   - form alanları varsa gerçek bir form POST'uyla bankanın 3D sayfasına
     gidersiniz,
   - hazır HTML dönüyorsa (Kuveyt Türk, Craftgate gibi) o sayfa olduğu gibi
     gösterilir,
   - yalnızca yönlendirme URL'i dönüyorsa oraya gidersiniz.
3. Bankada doğrulamayı tamamlayın (çoğu test ortamında sabit bir OTP/şifre
   vardır — bkz. `server/src/testCards.js` içindeki notlar).
4. Banka `/api/payment/callback`'e döner, sunucu `verify()`'ı çağırır ve
   sizi sonuç ekranına yönlendirir.
5. Sonuç ekranındaki `paymentId` ile iade/iptal/BIN/taksit sorgusu deneyin.

## Test kartları

Arayüzdeki "Hazır test kartı" listesiyle aynı kaynaktan gelir (bkz.
`server/src/testCards.js` ve tam liste/kaynaklar için
[`TEST-KARTLARI.md`](./TEST-KARTLARI.md)). Buraya yalnızca kaynağı
doğrulanmış numaralar konur.

| Sağlayıcı | Etiket | Kart No | Ay/Yıl | CVV | Not |
|---|---|---|---|---|---|
| iyzico | Başarılı (Akbank Master) | `5890040000000016` | 12/2030 | 123 | |
| iyzico | Yetersiz bakiye | `4111111111111129` | 12/2030 | 123 | |
| garanti | Simulator | `4282209004348015` | 08/2027 | 123 | 3D OTP: `147852` |
| garanti | Bonus | `5549600732695519` | 04/2030 | 244 | 3D OTP: `147852` |
| paytr | Visa | `4355084355084358` | 12/2030 | 000 | |
| paytr | Mastercard | `5406675406675403` | 12/2030 | 000 | |
| craftgate | Mastercard | `5258640000000001` | 07/2044 | 000 | |
| craftgate | Visa | `4256690000000001` | 11/2035 | 123 | |
| moka | İş Bankası (Visa) | `4183441122223339` | 12/2030 | 000 | |
| moka | Akbank (Master) | `5127541122223332` | 12/2030 | 000 | |
| moka | Ziraat (Master) | `5136621122223331` | 12/2030 | 000 | |
| ziraat (NestPay) | Visa | `4546711234567894` | 12/2026 | 000 | 3D şifre: `a` |
| ziraat (NestPay) | Mastercard | `5401341234567891` | 12/2026 | 000 | 3D şifre: `a` |
| akbank (NestPay) | Mastercard | `5571135571135575` | 12/2026 | 000 | 3D şifre: `a` |
| akbank (NestPay) | Visa | `4355084355084358` | 12/2026 | 000 | 3D şifre: `a` |
| turkiyefinans (NestPay) | Mastercard | `5377195377190410` | 12/2026 | 000 | 3D şifre: `a` |
| turkiyefinans (NestPay) | Visa | `4799174799173828` | 12/2026 | 000 | 3D şifre: `a` |
| tosla | Ziraat Bankkart (Visa) | `4546711234567894` | 12/2026 | 000 | |
| tosla | Visa | `4531444531442283` | 12/2026 | 001 | |
| tosla | Mastercard | `5406675406675403` | 12/2026 | 000 | |
| kuveytturk | Mastercard | `5188961939192544` | 06/2029 | 588 | 3D doğrulama kodu: `123456` |
| akbank-pos | Mastercard | `5578293000121055` | 11/2040 | 238 | |
| qnb-payfor | Visa | `4022780198283155` | 01/2050 | (boş) | CVV boş geçilebilir |
| qnb-payfor | Visa 1 | `4155650100416111` | 12/2025 | 656 | |
| qnb-payfor | Mastercard 1 | `5209882483498019` | 12/2025 | 656 | |
| vakifbank | Visa | `4355084000000001` | 12/2029 | 000 | |
| vakifbank | Mastercard (yalnız 3D) | `5521010140829928` | 12/2029 | 961 | |
| paratika | Akbank (Visa) | `4355084355084358` | 12/2030 | 000 | |
| paratika | İş Bankası (Visa) | `4508034508034509` | 12/2030 | 000 | |
| yapikredi | Mastercard | `5400637500005263` | 12/2030 | 111 | **Doğrulanmadı** |
| paycell | Akbank (Visa) | `4355093000777068` | 11/2040 | 238 | |
| paycell | DenizBank | `5200190006338608` | 01/2030 | 410 | 3D şifre: `123456` |
| albaraka | Visa | `4506347010299085` | 09/2026 | 000 | 3D onay kodu: `34020` |
| ziraat-payflex | Mastercard (3D Pay) | `5549601963997012` | 09/2029 | 259 | |

Kaynaklar ve kimliği/kartı henüz bekleyen sürücülerin listesi için
[`TEST-KARTLARI.md`](./TEST-KARTLARI.md)'ye bakın.

## Bilinen sınırlar

- Bu bir **geliştirme/test aracıdır**, üretim sunucusu değil: ödeme bağlamı
  ve sonuçlar bellekte tutulur (Redis/DB yok), sunucu yeniden başlayınca
  bekleyen işlemler kaybolur.
- `@voxyfy/anadolupay`'in kendisi gibi, buradaki sürücüler de yalnızca
  protokol seviyesinde doğrulandı — bir sürücünün burada çalışması,
  gerçek üretim kimlik bilgileriyle de çalışacağının garantisi değildir.
- `param` (Param) hiç eklenmedi — TMSF kayyımlığında, paket tarafında da
  desteklenmiyor.

## İlgili projeler

- **[Voxyfy/anadolupay-node](https://github.com/Voxyfy/anadolupay-node)** —
  test edilen paketin kendisi.
- **[Voxyfy/anadolupay](https://github.com/Voxyfy/anadolupay)** — PHP/Laravel
  kütüphanesi (bu portun kaynağı).
- **[Voxyfy/anadolupay-laravel](https://github.com/Voxyfy/anadolupay-laravel)**
  — bu projenin Laravel karşılığı.
