# Test Kartları

Bu liste `server/src/testCards.js` ile aynı kaynaktan gelir ve
`anadolupay-laravel` örnek projesindeki listeyle birebir aynıdır. Buraya
yalnızca **kaynağı doğrulanmış** numaralar konur — çalışmayan bir test
kartı, hiç kart olmamasından daha çok vakit kaybettirir.

Arayüzde "Hazır test kartı" listesinden seçtiğinizde kart alanları (numara,
son kullanma tarihi, CVV) otomatik doldurulur.

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
| moka | Ziraat (Master) | `5136621122223331` | 12/2030 | 000 | Garanti kartı `VirtualPosNotAvailable` verir, test bayisinde her bankanın sanal POS'u tanımlı değil |
| ziraat / akbank / turkiyefinans (NestPay) | Ziraat — Visa | `4546711234567894` | 12/2026 | 000 | 3D şifresi hepsinde: `a` |
| ziraat (NestPay) | Ziraat — Mastercard | `5401341234567891` | 12/2026 | 000 | 3D şifre: `a` |
| akbank (NestPay) | Akbank — Mastercard | `5571135571135575` | 12/2026 | 000 | 3D şifre: `a` |
| akbank (NestPay) | Akbank — Visa | `4355084355084358` | 12/2026 | 000 | 3D şifre: `a`. Akbank'ın `100100000` mağazasında `Kartin son kullanma tarihi hatali` verebilir — reddedilirse listedeki bir diğerini deneyin |
| turkiyefinans (NestPay) | Türkiye Finans — Mastercard | `5377195377190410` | 12/2026 | 000 | 3D şifre: `a` |
| turkiyefinans (NestPay) | Türkiye Finans — Visa | `4799174799173828` | 12/2026 | 000 | 3D şifre: `a` |
| tosla | Ziraat Bankkart (Visa) | `4546711234567894` | 12/2026 | 000 | |
| tosla | Visa | `4531444531442283` | 12/2026 | 001 | |
| tosla | Mastercard | `5406675406675403` | 12/2026 | 000 | |
| kuveytturk | Mastercard | `5188961939192544` | 06/2029 | 588 | 3D doğrulama kodu: `123456`. SKT geçmiş, test ortamı doğrulamayabilir |
| akbank-pos | Mastercard | `5578293000121055` | 11/2040 | 238 | |
| qnb-payfor | Visa (CVV boş geçilebilir) | `4022780198283155` | 01/2050 | (boş) | QNB 3D zorunlu tutar, non-secure sunulmaz |
| qnb-payfor | Visa 1 | `4155650100416111` | 12/2025 | 656 | |
| qnb-payfor | Mastercard 1 | `5209882483498019` | 12/2025 | 656 | |
| vakifbank | Visa | `4355084000000001` | 12/2029 | 000 | |
| vakifbank | Mastercard (yalnız 3D) | `5521010140829928` | 12/2029 | 961 | Non-secure provizyonda CVV ne olursa olsun `0312` ile reddedilir — non-3D için Visa'yı seçin |
| paratika | Akbank (Visa) | `4355084355084358` | 12/2030 | 000 | |
| paratika | İş Bankası (Visa) | `4508034508034509` | 12/2030 | 000 | |
| yapikredi | Mastercard | `5400637500005263` | 12/2030 | 111 | **Doğrulanmadı** — banka test kartı yayınlamıyor, bu entegrasyon dokümanının XML örneğindeki kart. SKT biçimi `YYAA`; CVC olarak `111` yerine `XXX` gerekebilir |
| paycell | Akbank (Visa) | `4355093000777068` | 11/2040 | 238 | Kart token adımını geçer; provizyon adımı varsayılan test üye işyerinde (`9998`) "Bank error" döndürebilir |
| paycell | DenizBank | `5200190006338608` | 01/2030 | 410 | 3D şifre: `123456` |
| albaraka | Visa | `4506347010299085` | 09/2026 | 000 | 3D onay kodu: `34020`. Banka test kartı yayınlamıyor; mewebstudio/pos örneğindeki kart |
| ziraat-payflex | Mastercard (3D Pay) | `5549601963997012` | 09/2029 | 259 | Ziraat/Innova 3D Pay test formunun varsayılanı |

## Kaynaklar

- iyzico — docs.iyzico.com/en/add-ons/test-cards
- Garanti — dev.garantibbva.com.tr/test-kartlari
- PayTR — dev.paytr.com
- Craftgate — resmî istemci depolarındaki (craftgate-php-client,
  craftgate-java-client) örnekler
- Moka United — developer.mokaunited.com/home.php?page=test-kartlari
- NestPay (Asseco) ailesi — ortak test ucu (entegrasyon.asseco-see.com.tr)
- Tosla — tosla.com/isim-icin/gelistirici-merkezi
- Kuveyt Türk — mewebstudio/pos örnek deposu
- Akbank — sanalposteststore-prep.akbank.com (resmî test store)
- QNB PayFor — vpostest.qnb.com.tr demo ortamı
- VakıfBank — sanalpossandbox-test.vakifbank.com.tr
- Paratika — docs.paratika.com.tr/test-kartlari
- Paycell — paycellapi.apidog.io/test-kredi-kartlari
- Albaraka Türk — mewebstudio/pos örnek deposu
- Ziraat 3D Pay — Innova test formu

## Kaynağı olmayan/kimliği bekleyen sürücüler

`denizbank`, `halkbank`, `teb`, `sekerbank`, `ing`, `alternatifbank`,
`ziraat-katilim`, `vakif-katilim` için henüz doğrulanmış bir test kartı
yok — bu sürücülerin `.env` alanları da boş (kimlik bilgisi bekleniyor).
