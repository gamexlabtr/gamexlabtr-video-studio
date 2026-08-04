# GamexlabTR Auto Video Studio v0.1

Bu paket, GitHub Actions üzerinde bir GamexlabTR oyun sayfasını açar, yaklaşık 15 saniyelik tarayıcı kaydı alır ve FFmpeg ile 1080×1920 dikey MP4 üretir.

## Üretilen video

- 1,5 saniye GamexlabTR giriş ekranı
- 8–30 saniye oyun kaydı
- Sürekli küçük GamexlabTR filigranı
- 3 saniye kapanış:
  - GamexlabTR
  - PLAY FREE NOW
  - gamexlabtr.com
  - Like & Follow for Daily New Games

## GitHub'a yükleme

1. ZIP'i bilgisayarında aç.
2. Depoda **Add file → Upload files** bölümüne gir.
3. ZIP'in içindeki tüm dosya ve klasörleri yükle.
4. **Commit changes** düğmesine bas.
5. GitHub'da **Actions → Create Game Video** bölümünü aç.
6. **Run workflow** düğmesine bas.
7. Oyun URL'si, oyun adı ve kayıt süresini yaz.
8. İşlem tamamlanınca çalışmanın altındaki **Artifacts → gamexlabtr-video** dosyasını indir.

## Önemli sınırlamalar

Bu ilk çalışan prototiptir. Her HTML5 oyunun kontrol yapısı farklıdır. Script Play/Oyna butonlarını bulmaya ve klavye/fare hareketleri göndermeye çalışır; bazı oyunlarda yalnız açılış ekranı kaydedilebilir. Sağlayıcıya özel oynama profilleri sonraki sürümde eklenmelidir.

GitHub Actions çıktısındaki MP4, Instagram veya Facebook'a kendiliğinden gönderilmez. Make entegrasyonu için kalıcı, herkese açık bir video URL'si gerekir. Bu adım sonraki sürüm kapsamındadır.

## Güvenlik

Repo private tutulmalıdır. Oyun sağlayıcılarının tanıtım ve içerik kullanım şartlarına uyulmalıdır.
