# GamexlabTR Video Studio v2.0

Bu paket GitHub Actions üzerinde dikey oyun videosu, kapak, metadata ve sosyal medya açıklaması üretir.

## En güvenli yükleme yöntemi

GitHub web yükleyicisi `.github`, `.gitignore`, `assets/.gitkeep` ve `output/.gitkeep` gibi gizli dosyaları atlayabilir. Bu nedenle ZIP'i açtıktan sonra **UPLOAD_TO_GITHUB.bat** dosyasını çalıştırın.

Gerekli:
- GitHub Desktop veya Git for Windows
- Var olan boş GitHub deposunun `.git` ile biten URL'si

Örnek:
https://github.com/gamexlabtr/gamexlabtr-video-studio.git

Yardımcı dosya bütün gizli klasörleri ve boş klasör koruyucularını eksiksiz biçimde GitHub'a gönderir.

## Çalıştırma

1. GitHub deposunda Actions sekmesini açın.
2. Create Game Video seçin.
3. Run workflow düğmesine basın.
4. Oyun URL, başlık, kategori, süre ve dil bilgilerini girin.
5. İsterseniz Make webhook URL ekleyin.
6. İşlem bitince Artifacts bölümünden `gamexlabtr-video` paketini indirin.

## Üretilenler

- output/gamexlabtr-final.mp4
- output/cover.png
- output/metadata.json
- output/social.json

## Make notu

Workflow yalnız JSON metnini webhook'a gönderebilir. GitHub artifact dosyası doğrudan herkese açık video URL'si değildir. Instagram/Facebook otomatik video paylaşımı için sonraki adımda videonun kalıcı bir depolama alanına yüklenmesi gerekir.

## Sınırlama

Bu sistem Play/Oyna düğmelerini ve temel klavye/fare hareketlerini otomatik dener. Her oyunun kontrol yapısı farklı olduğundan bazı oyunlarda menü veya yükleme ekranı kaydedilebilir.
