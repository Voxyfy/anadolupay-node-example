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
