# Personel Temin Sistemi — Kullanım Senaryoları

Bu belge, müşteri briefing'lerinden derlenen tüm iş akışlarını ve gereksinimleri içerir.
Son güncelleme: 2026-08-08

---

## 1. Aday — Sisteme İlk Giriş ve Karşılama

Aday web sitesine girdiğinde **iki ana sütun** görür (renk kodlaması adayı psikolojik olarak yönlendirir):

- **Sol panel — GÜNCEL TEMİNLER** (kırmızı/kiremit):
  Yeni aday, aktif alım ilanlarının vitrinini görür. İlan kartına tıklayınca ilan detay veya giriş ekranına yönlendirilir.
- **Sağ panel — GÜNCEL DUYURULAR** (kurumsal gri):
  Mevcut aday (başvurusunu yapmış, sonuç bekleyen) doğrudan sonuç ve tebligat duyurularına ulaşır.

---

## 2. Aday — Duyuru Detay & Sonuç Sorgulama

Aday bir duyuruya tıkladığında karşılaşacağı ekran:

1. **Başlık ve Yönlendirici Kurallar**
   - Madde 1: TCKN ile sonuç sorgulama açıklaması.
   - Madde 2: Taban puan tabloları/ekleri.
2. **Duyuruya İlişkin Dosyalar** — İndirilebilir PDF/Excel ekler (Örn: "Görevde Yükselme Taban Puanı Tablosu").
3. **SONUÇ SORGULA** (opsiyonel, admin tarafından aktifleştirilir):
   - TC Kimlik No (zorunlu)
   - Güvenlik Kodu / Captcha (bot koruması)
   - Sorgula / Temizle butonları
4. **SONUÇ LİSTESİ** — Kişiye özel sonuç (Asil / Yedek / Yerleşemedi / Red gerekçesi) veya genel taban puan tablosu.
   - "Sonuç Belgesi İndir (PDF – QR Kodlu)" butonu
   - Uyarı kutusu: "Bu sonuç tebligat yerine geçmektedir."

---

## 3. Aday — Başvuru Sihirbazı (7 Adım)

### STEP 1: KİMLİK BİLGİLERİ
- Uyruk (T.C. / KKTC / Diğer), Kimlik No, Ad, Soyad, Doğum Tarihi, Medeni Hal, Cinsiyet
- **Vesikalık (biyometrik) fotoğraf** yükleme — zorunlu
- Kilit alanlar: **TCKN, Doğum Tarihi, Cinsiyet değiştirilemez**

### STEP 2: ŞEHİT/GAZİ YAKINLIK BİLGİLERİ
- Uyarı: Şehit/gazi eş ve çocukları sınav/başvuru ücreti yatırmaz.
- Yakınlık derecesi (Eş, Çocuk, Kardeş, Anne, Baba)
- Belge yükleme (yalnızca PDF, max 5MB, e-Devlet barkodlu)
- **OCR eşleşme kontrolü** — belgedeki TCKN/Ad-Soyad profil ile karşılaştırılır
- **KVKK Açık Rıza + Sorumluluk Beyanı** checkbox'ları

### STEP 3: EĞİTİM BİLGİLERİ
- **3 ana tablo**: Öğrencilik Bilgileri, Mezuniyet - Yükseköğretim, Mezuniyet - Lise/Ortaöğretim
- "+ Eğitim Bilgisi Ekle" popup ile ekleme
- Eğitim Seviyesi: Denk Ülke (Yüksek Okulu, Üniversite, Yüksek Lisans, Doktora, Lise/Ortaöğretim) veya Eşdeğer / Yabancı Ülke muadilleri
- **Kademeli dropdown**: Üniversite → Fakülte → Bölüm ; İl → İlçe → Okul
- Yükseköğretim: Üniversite, Fakülte, Bölüm, Öğretim Tipi zorunlu
- Ortaöğretim: Eğitim Yeri, İl, İlçe, Okul Adı zorunlu
- Eşdeğer için ek: Eğitim Ülkesi, Eğitim Dili
- Ortak: Diploma No, Başlangıç/Mezuniyet Tarihi (ops), Not Sistemi + Mezuniyet Notu (zor), Belge PDF (zor)

### STEP 4: SINAV BİLGİLERİ
- Sınav Türü (YDS, YKS, AGS, TUS, DUS, YDT, MSÜ, DGS, KPSS Lisans, KPSS Ön Lisans, ALES, TR-YÖS)
- **TUS, DUS, AGS iptaldir** — bilgi mesajı gösterilir
- Sınav yılı otomatik ve **değiştirilemez**
- Aday manuel: Sonuç Kodu + PDF Sonuç Belgesi
- **OCR ile otomatik okunan alanlar (değiştirilemez)**:
  - **YKS**: TYT, SAY, SÖZ, EA ham puan ve sıralamalar
  - **KPSS Lisans**: Kategori (P1/P2/P3) + Alt Kategori (P10, P48…) → seçili kategori puanları
  - **KPSS Ön Lisans**: Yalnızca P93 sıralaması (Türkiye Geneli Başarı)
  - **ALES**: Alan seçimi (SAY/SÖZ/EA) → seçilen alan sıralaması
  - **YDT**: Dil seçimi (İng/Alm/Fra/Rus/Arp) → dil sıralaması
  - **MSÜ**: Harp Okulları (SAY/SÖZ/EA) veya Astsubay MYO (TYT) başarı sırası
  - **DGS**: Alan seçimi (EA/SÖZ/SAY) → seçilen alan sıralaması
  - **YDS**: 0-100 ham puan + A/B/C/D/E seviye
  - **TR-YÖS**: Yüzdelik dilim veya başarı sıralaması
- **2. onay**: Sistem yöneticisi belgeyi inceleyerek onay/red verir

### STEP 5: ADRES BİLGİLERİ
- Zorunlu: Ülke (TR/KKTC/Diğer), İl, İlçe, Bina No, Daire No
- Ops: Köy/Kasaba, Mahalle, Cadde, Sokak
- Ülke → İl → İlçe **kademeli dropdown**

### STEP 6: İLETİŞİM BİLGİLERİ
- Zorunlu: GSM (SMS bildirim için), Yakın Telefon-1, E-posta
- Ops: Yakın Telefon-2

### STEP 7: DİĞER BİLGİ/BELGELER
- Bonservis/sertifika (ops)
- Adli sicil kayıt belgesi (ops)

### ÖZET & KAYDET
- Tüm adımlar tamamlanınca **Sorumluluk Beyanı + KVKK Açık Rıza** onayı ve **Bilgilerimi Kaydet** butonu.
- Özet sayfasında her bölüm için **Güncelle** butonu.

---

## 4. Aday — Çağrı Açma (Destek Talebi)

Aday "Çağrı Açma" butonuna basınca **çok adımlı POP-UP** açılır:

### STEP 1: ÇAĞRI BAŞLANGICI
- Ad Soyad otomatik dolu (değiştirilemez)
- E-Posta ve Telefon manuel + zorunlu
- **Çağrı Kategorisi** (zorunlu):
  1. Başvuru ve Tercih İşlemleri
  2. Sınav Sonuç ve Puan İşlemleri
  3. Belge ve Evraklar Hakkında
  4. Teknik ve Hesap Sorunları
  5. Sonuç ve Çağrı Durumu
  6. Diğer / Genel Bilgi Talepleri
  7. Öneri
  8. Görüş
- **Alt kategori** seçimi (her kategorinin kendi listesi)
- **Alım Adı** seçimi (güncel ilanlardan)
- Öneri/Görüş seçildiğinde alt kategori/alım gösterilmez

### STEP 2: ÇAĞRI KAYDETME
- Görsel ekleme (opsiyonel)
- Açıklama metni
- Önizleme + **Kaydet**

### Admin Tarafı
- Tüm çağrıları liste halinde görür, istatistikler
- Durum güncelleme (açık → işlemde → yanıtlandı → kapalı)
- Geri bildirim mesajı gönderir

---

## 5. Aday — Çağrı/Sınav Durumu (Başvurularım)

### Görüntülenenler
- Başvurulan ilanların listesi (kart/liste)
- Her başvurunun anlık durumu:
  - İnceleniyor / Değerlendirmede
  - Belge Onayı Bekliyor
  - Asil Yerleşti
  - Yedek Sırada Bekliyor
  - Reddedildi / Puan Yetersiz
- Sonuç Belgeleri (PDF — QR kodlu)
- Tebligat / Bilgilendirme metinleri

### İşlemler
- İlan seçimi ile detay ekranı
- Sonuç belgesi indirme (PDF)

### Admin Akışı
- "Başvuru Yönetimi" → İlan + Aday seçimi
- Durum güncelleme
- **Zengin Metin Editörü** ile gerekçe/açıklama yazma
- Opsiyonel resmi tebligat PDF yükleme
- **"Adaya Gönder / Bildirimi Yayınla"** — kilitler + adayın paneline yansır
- Aday: "Çağrı/Sınav Durumu" sayfasında gerekçeyi ve tebligat PDF'ini görür

### Bildirim
- Aday "Mesajlarım" kısmında tüm sistem bildirimleri (uyarı renklerine göre)

---

## 6. Aday — Tercih Ekranı (Referans Görsel 2)

Ekran **iki ana sütuna** bölünür:

### Üst — DİKKAT Kutusu
- Kılavuz okuma zorunluluğu
- Tercih sıralamasının kritikliği hatırlatması
- "Tercihlerimi Göster" butonu

### Sol Panel — Aktif Tercihler (Aramada/Seçim)
- Kategori/Alt kategori ağaç yapısı (Örn: MSÜ Harp Okulları → HARP OKULLARI → Kara/Deniz/Hava Harp Okulu)
- Her programın yanında **son başvuru tarihi**
- Bilgi (i) tuşu — pop-up ile süreç, cinsiyet, kontenjan
- Süresi dolan ilanların butonları pasif
- **"Tercih Yap"** yeşil butonu — onay pop-up sonrası sağ tarafa aktarılır

### Sağ Panel — Kaydedilmiş Tercihlerim
- Aday tarafından seçilmiş programlar listelenir
- **Yukarı/Aşağı ok tuşları** ile dinamik sıralama
- "i Durum" — güncel kontenjan/ilan durumu
- Kırmızı "Sil" butonu

### Tamamlanma
- Tercih dönemi kapandığında sağ paneldeki kesin sıralama sistem tarafından kabul edilir

---

## 7. Admin — İlan Yönetimi Modülü

### Yeni İlan Ekleme (Sihirbaz)
- **Temel Bilgiler**: İlan Adı/Başlığı, Kurum/Birim
- **Takvim** (kritik):
  - Başvuru Başlangıç Tarihi + Saati
  - Başvuru Bitiş Tarihi + Saati (dolduğunda sistem tercih butonlarını kapatır)
- **İlan Kılavuzu**: PDF yükleme
- **Kriterler**:
  - Eğitim Seviyesi Filtresi (Denk Ülke Üniversite/Lise vb.)
  - Sınav Şartı (YKS, KPSS Lisans vb.) + minimum taban puan
  - Yaş / Cinsiyet kısıtları
- **Kontenjan**: Alt birimler için Asil + Yedek sayıları (Örn: Kara Harp Okulu — 100 Asil, 50 Yedek)
- **"İlanı Yayınla"** veya **"Taslak Olarak Kaydet"**

### İlan Listesi
- Filtreler: Aktif, Taslak, Süresi Doldu, Sonuçlandı
- Statüler:
  - **Taslak**: Adaylara açık değil
  - **Aktif (Yayında)**: Başvuru alınıyor
  - **Süresi Doldu / İncelemede**: Belge onayı / simülasyon bekleniyor
  - **Sonuçlandı**: Sonuç sorgulama + tebligat yayında
- Hızlı işlemler:
  - Düzenle (kritik alanlar başvuru başladıysa kilitli)
  - Başvuruları Gör / Yönet
  - Simülasyonu Çalıştır (süre bitince)
  - Sonuçları Yayınla
  - Sil / Pasife Al

### Otomatik Akışlar
1. **Yayın**: Statü "Aktif" olunca **"Güncel Teminler"** listesinde en üstte gösterilir.
2. **Süre Dolması**: Bitiş tarihi + saati (Örn: 24.07.2026 23:59) geçince sistem zamanlayıcısı otomatik olarak statüyü "Süresi Doldu / İncelemede" yapar ve ilan **"Güncel Teminler"** vitrininden düşer.
3. **Sonuçlanma**: Admin "Sonuçlandı" statüsüne alınca ilan **"Güncel Duyurular"** paneline taşınır ve sonuç sorgulama modülü ile birlikte yayına girer.

---

## 8. Admin — Duyuru ve Sonuç Modülü Yönetimi

### Yeni Sonuç Duyurusu
- Duyuru Başlığı ve içerik metni (rich text)
- İlgili İlan Eşitleme — sistemdeki ilan listesinden seçim
- **"Duyuruya İlişkin Dosyalar"**: PDF/Excel yükleme + görünen ad
- **Sonuç Sorgulama Modülü**: Aktif/Pasif toggle
  - Aktif: Adaya TCKN + Captcha ile bireysel sonuç ekranı
  - Pasif: Yalnızca bilgilendirme + dosyalar
- **Sonuç Verilerinin Yüklenmesi**: Nihai Excel/CSV yerleştirme listesi (TCKN, ünvan, puan, statü) toplu yükleme

### Zengin Metin Editörü (Word benzeri araç çubuğu)
Admin, duyuru içeriğini standart bir metin kutusu yerine gelişmiş bir toolbar ile yazar:
- **Biçimlendirme**: Kalın (Bold), İtalik (Italic), Altı Çizgili
- **Başlık Hiyerarşisi**: H1, H2, H3 etiketleri
- **Tablo Ekleme**: Sütun/Satır sayısı belirleyerek tablo (Örn: 3×4) — hücrelere doğrudan veri girme
- **Hizalama**: Sola/Sağa/Ortaya hizalama
- **Renklendirme**: Yazı ve arka plan rengi
- **Liste Yapıları**: Madde işaretli (bullet) veya numaralandırılmış listeler

### Aday Sorgulama
- Aday TCKN ile sorguladığında sistem eşleşen kaydı bulur ve Asil/Yedek/Red gerekçesi ile ekrana yansıtır.

---

## 9. Ortak Notlar

- **Renk kodlaması**: Sol tarafta kırmızı/kiremit (aksiyon), sağ tarafta gri (bilgilendirme)
- **Kilit noktalar**: TCKN, Doğum Tarihi, Cinsiyet, OCR ile çekilen puanlar değiştirilemez
- **KVKK**: Belge yükleme aşamalarında zorunlu açık rıza checkbox'ları
- **Sorumluluk beyanı**: Sahte belge halinde iptal ve hukuki sorumluluk uyarısı
- **Bildirim sistemi**: Mesajlarım kısmında uyarı renklerine göre bildirimler
- **2. onay**: Sınav bilgileri sistem yöneticisi tarafından belge üzerinden onaylanır
