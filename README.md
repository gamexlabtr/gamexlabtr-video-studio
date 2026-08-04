# GamexlabTR Video Studio v1.0

Bu paket GitHub Actions üzerinde tek bir oyun URL'sinden dikey MP4 prototipi üretir.

## Yükleme

1. ZIP dosyasını bilgisayarınızda açın.
2. GitHub deposunun kök dizinine ZIP içindeki dosya ve klasörleri yükleyin.
3. `.github/workflows/create-video.yml` yolunun aynen korunduğunu kontrol edin.
4. GitHub'da Actions > Create Game Video > Run workflow yolunu açın.
5. Oyun URL'sini, oyun adını ve kayıt süresini girin.
6. İşlem bittikten sonra `gamexlabtr-video` artifact dosyasını indirin.

## Video yapısı

- 1.5 saniye GamexlabTR intro
- 8-30 saniye otomatik tarayıcı kaydı
- GamexlabTR filigranı
- 3 saniye kapanış:
  - PLAY FREE NOW
  - gamexlabtr.com
  - Like and Follow for Daily New Games

## Sınırlama

Bu, çalışan prototip paketidir. Oyunların kontrol yapıları farklıdır. Script ortak Play/Oyna düğmelerini arar ve temel klavye/fare hareketleri gönderir. Bazı oyunlarda yalnız menü veya yükleme ekranı kaydedilebilir.

Make, Instagram ve Facebook'a otomatik gönderim bu pakette henüz yoktur. Bunun için kalıcı ve herkese açık video URL'si ile ayrı bir yayınlama akışı gerekir.
