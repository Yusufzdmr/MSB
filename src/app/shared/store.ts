// Kurum İçi Tercih ve Yerleştirme Sistemi — paylaşılan durum yönetimi.
// LocalStorage-backed store: aday panelinden yapılan işlemler admin panelinde,
// admin panelinden yapılan yerleştirme/duyurular aday panelinde görünür.
//
// Backend yok — prod'a alınırken bu modül REST/GraphQL client ile değiştirilir,
// tüm componentler aynı hook API'sini kullanmaya devam eder.

import { useSyncExternalStore } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TİPLER
// ─────────────────────────────────────────────────────────────────────────────

export type Kuvvet = "Kara" | "Deniz" | "Hava" | "Jandarma" | "Sahil Güvenlik" | "MSB Merkez";
export type Sinif = "Subay" | "Astsubay" | "Uzman Erbaş" | "Sözleşmeli Er" | "Sivil Memur";
export type EgitimSeviyesi = "Lise" | "Ön Lisans" | "Lisans" | "Yüksek Lisans" | "Doktora";
export type Cinsiyet = "Erkek" | "Kadın" | "Farketmez";
export type IlanDurum = "taslak" | "yayin" | "kapali" | "yerlestirildi";

export type AltBirim = { ad: string; kontenjanAsil: number; kontenjanYedek: number };

// ─── Ödeme kuralı ─────────────────────────────────────────────────────────────
export type OdemeKurali = "yok" | "once_tercih_sonra_odeme" | "once_odeme_sonra_tercih";

export type Ilan = {
  id: string;
  baslik: string;
  kurum?: string;              // Kurum/Birim (yeni)
  kuvvet: Kuvvet;
  sinif: Sinif;
  kontenjan: number;           // toplam (asil)
  kontenjanYedek?: number;     // toplam yedek (yeni)
  yerlesen: number;
  basvuranSayisi: number;
  baslangic: string; // ISO YYYY-MM-DD
  baslangicSaat?: string;      // HH:MM (yeni)
  bitis: string;
  bitisSaat?: string;          // HH:MM (yeni)
  minPuan: number;
  sinavSarti?: SinavTuru;      // hangi sınav zorunlu (yeni)
  egitim: EgitimSeviyesi;
  cinsiyet: Cinsiyet;
  yasMin: number;
  yasMax: number;
  boyMin?: number;
  aciklama: string;
  sehir: string;
  durum: IlanDurum;
  olusturmaTarihi: string;
  kriterler: string[];
  kilavuzAdi?: string;         // İlan kılavuz PDF adı (yeni)
  altBirimler?: AltBirim[];    // Alt birim kontenjanları (yeni)
  // ─ Şehit/Gazi kuralları
  sehitGaziTabanIndirimi?: number;   // Örn: 10 puan indirim (70 → 60)
  sehitGaziKotaYuzde?: number;       // Örn: 5 → %5 özel kontenjan
  // ─ Sınav geçerlilik yılı
  sinavGecerlilikYili?: number;
  // ─ Ödeme
  odemeKurali?: OdemeKurali;
  ucretTutari?: number;              // TL
  odemeVadeSaat?: number;            // Ödeme başladığından itibaren kaç saat
  sehitGaziUcretMuaf?: boolean;      // Şehit/gazi yakınları ödemeden muaf mı?
  iadeMekanizmasi?: boolean;         // Bu ilanda iade uygulanır mı?
  banka?: { ad: string; iban: string; alici: string };
  // ─ Ek tercih dönemi
  ekTercihAktif?: boolean;
  ekTercihBaslangic?: string;
  ekTercihBitis?: string;
  // ─ Kesin kayıt dönemi
  kesinKayitAktif?: boolean;
  kesinKayitBaslangic?: string;
  kesinKayitBitis?: string;
};

export type BelgeTipi =
  | "kimlik" | "diploma" | "transkript" | "sinav_sonuc"
  | "saglik_raporu" | "askerlik" | "adli_sicil" | "sertifika" | "ehliyet" | "yabanci_dil" | "bonservis" | "diger";

export type BelgeDurum = "beklemede" | "onaylandi" | "reddedildi";

export type Belge = {
  id: string;
  adayId: string;
  tip: BelgeTipi;
  ad: string;
  yuklemeTarihi: string;
  boyutKB: number;
  durum: BelgeDurum;
  redGerekce?: string;
  onaylayan?: string;
  onayTarihi?: string;
  // OCR ile çıkarılan alanlar (sınav sonuç belgesi vs.)
  ocrAlanlar?: Record<string, string | number>;
  // Data URL veya blob URL (client-side mock)
  onizleme?: string;
};

export type Aday = {
  id: string;                 // TC kimlik (mock)
  ad: string;
  soyad: string;
  eposta: string;
  telefon: string;
  dogumTarihi: string;
  cinsiyet: Cinsiyet;
  sehir: string;
  ilce?: string;
  adres?: string;
  egitim: EgitimSeviyesi;
  mezuniyet?: string;         // okul adı
  bolum?: string;
  ortalama?: number;          // GPA
  yabanciDil?: { dil: string; seviye: string; puan?: number }[];
  ehliyet?: string[];         // ["B", "A2"]
  sertifikalar?: string[];
  askerlikDurumu?: "yapildi" | "muaf" | "tecil" | "yapmadi";
  sinavPuani: number;         // ana yerleştirme puanı (KPSS vb.)
  sinavAdi?: string;
  kayitTarihi: string;
  kvkkOnayi: boolean;
  aktif: boolean;
};

export type Basvuru = {
  id: string;
  adayId: string;
  ilanId: string;
  basvuruTarihi: string;
  durum: "hazirlaniyor" | "gonderildi" | "onaylandi" | "reddedildi" | "yerlestirildi" | "yerlestirilmedi" | "belge_onay_bekliyor" | "yedek";
  puan: number;                  // ham puan (ÖSYM + bonservis) — nihai puan yerleştirmede hesaplanır
  bonservisPuani?: number;       // admin onaylı ek puan
  nihaiPuan?: number;            // ham × K_tercih (yerleştirmede hesaplanır)
  tercihSirasi?: number;         // adayın bu ilan için yazdığı tercih sırası (1,2,3…)
  redGerekce?: string;
  yerlestirmeSirasi?: number;
  yedekSirasi?: number;          // örn 5. yedek
  adminGerekce?: string;
  tebligatBelgesi?: string;
  gonderildi?: boolean;
  gonderilmeTarihi?: string;
  // ─ Ödeme
  odemeDurumu?: "beklemiyor" | "bekleniyor" | "inceleniyor" | "alindi" | "iade_edilecek" | "iade_edildi" | "iptal";
  dekontAdi?: string;
  referansKodu?: string;
  odemeTarihi?: string;
  // ─ Kesin kayıt
  kesinKayitDurumu?: "aktif_degil" | "beklemede" | "inceleniyor" | "onaylandi" | "reddedildi" | "feragat" | "sure_asimi";
  kesinKayitEvraklar?: { ad: string; boyutKB: number; tip: string }[];
  taahhutOnayi?: boolean;
  kesinKayitOnayTarihi?: string;
  kesinKayitRedNedeni?: string;
  kayitBelgesiPdf?: string;
};

export type Tercih = {
  adayId: string;
  ilanId: string;
  sira: number;              // 1 = en yüksek tercih
  guncellenme: string;
};

export type DuyuruEk = { ad: string; boyutKB: number; url?: string };
export type DuyuruSonucKayit = {
  tc: string; ad: string; soyad: string;
  program?: string; statu: "Asil" | "Yedek" | "Yerleşemedi" | "Red";
  sira?: number; puan?: number; sonucKodu?: string;
  gerekce?: string; sonucTarihi: string;
};
export type Duyuru = {
  id: string;
  baslik: string;
  ozet: string;
  icerik: string;
  kategori: "genel" | "sinav" | "yerlestirme" | "belge" | "sistem";
  onemli: boolean;
  yayinTarihi: string;
  yayinlayan: string;
  ilanId?: string;
  ekler?: DuyuruEk[];
  sonucSorgulamaAktif?: boolean;
  sonuclar?: DuyuruSonucKayit[];
};

export type MesajTur = "bilgi" | "uyari" | "basari" | "hata" | "sistem";
export type Mesaj = {
  id: string;
  konu: string;
  icerik: string;
  gonderen: string;
  alici: string;
  tarih: string;
  okundu: boolean;
  yanitId?: string;
  tur?: MesajTur;             // uyarı rengi için (yeni)
  onemli?: boolean;           // yeni
  ilanId?: string;            // ilişkili ilan (yeni)
};

export type Yerlestirme = {
  id: string;
  ilanId: string;
  tarih: string;
  yontem: "otomatik" | "manuel";
  yapan: string;
  yayinlandi: boolean;
  sonuclar: {
    adayId: string;
    tercihSirasi: number;
    puan: number;
    durum: "yerlesti" | "yedek" | "yerlesmedi";
    yedekSirasi?: number;
  }[];
};

export type Rol = "aday" | "admin" | "yonetici";

// ─── Başvuru Sihirbazı: adım adım aday profil verileri ─────────────────────────

export type Uyruk = "T.C." | "KKTC" | "Diğer";
export type MedeniHal = "Bekar" | "Evli" | "Boşanmış" | "Dul";
export type YakinlikDerecesi = "Eş" | "Çocuk" | "Kardeş" | "Anne" | "Baba";
export type EgitimDurumu = "Mezun" | "Öğrenci";
export type NotSistemi = "4 üzerinden" | "5 üzerinden" | "10 üzerinden" | "100 üzerinden";
export type OgretimTipi = "Örgün Öğretim" | "Yaygın Öğretim" | "Açık Öğretim" | "Dışardan Öğretim";
export type EgitimYeri = "Türkiye" | "KKTC";
export type EgitimSeviyeKod =
  | "esdeger_yo" | "esdeger_uni" | "esdeger_yl" | "esdeger_dr"
  | "denk_yo" | "denk_uni" | "denk_yl" | "denk_dr"
  | "denk_lise";

export type SinavTuru =
  | "YDS" | "YKS" | "AGS" | "TUS" | "DUS" | "YDT" | "MSÜ" | "DGS"
  | "KPSS Lisans" | "KPSS Ön Lisans" | "ALES" | "TR-YÖS";

export type KimlikBilgi = {
  uyruk: Uyruk;
  kimlikNo: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  medeniHal: MedeniHal | "";
  cinsiyet: Cinsiyet;
  vesikalikFoto?: string;   // dataURL veya boş; biyometrik fotoğraf
};

export type SehitGaziBilgi = {
  varMi: boolean;
  yakinlikDerecesi?: YakinlikDerecesi;
  belgeAdi?: string;
  belgeBoyutKB?: number;
  belgeYuklemeTarihi?: string;
  ocrTcKimlik?: string;
  ocrAdSoyad?: string;
  ocrYakinlik?: string;
  ocrEslesmeUyari?: boolean;
  kvkkOnay?: boolean;
  sorumlulukOnay?: boolean;
};

export type EgitimKaydi = {
  id: string;
  durum: EgitimDurumu;
  seviye: EgitimSeviyeKod;
  seviyeAdi: string;
  // Yükseköğretim
  universite?: string;
  fakulte?: string;
  bolum?: string;
  bolumKodu?: string;        // referansgorsel1: "Bölüm Kodu: 0000"
  ogretimTipi?: OgretimTipi;
  sinif?: string;             // Öğrenci ise sınıf bilgisi (Örn: "4. SINIF")
  // Ortaöğretim
  egitimYeri?: EgitimYeri;
  il?: string;
  ilce?: string;
  okulAdi?: string;
  // Ortak
  diplomaNo?: string;
  baslangicTarihi?: string;
  mezuniyetTarihi?: string;
  notSistemi?: NotSistemi;
  mezuniyetNotu?: string;
  belgeAdi?: string;
  // Eşdeğer ise
  egitimUlkesi?: string;
  egitimDili?: string;
};

// OCR detay satırı — sınav türüne göre birden fazla puan/sıralama olabilir
export type SinavDetayKalem = { etiket: string; puan?: number; siralama?: number; seviye?: string; yuzdelikDilim?: number };

export type SinavKaydi = {
  id: string;
  sinav: SinavTuru;
  sinavYili: number;
  sonucKodu: string;
  belgeAdi: string;
  kategori?: string;
  altKategori?: string;
  alan?: string;
  dil?: string;
  puan?: number;
  yuzdelikDilim?: number;
  siralama?: number;
  seviye?: string;
  ocrDetay?: SinavDetayKalem[];   // YKS'de 4 satır (TYT/SAY/SÖZ/EA), MSÜ'de 4 satır vb.
  onayDurumu: "beklemede" | "onaylandi" | "reddedildi";
  onayNotu?: string;
  arsivlendi?: boolean;
};

export type AdresBilgi = {
  ulke: string;      // Türkiye / KKTC / Diğer
  il: string;
  ilce: string;
  koyKasaba?: string;
  mahalle?: string;
  cadde?: string;
  sokak?: string;
  binaNo: string;
  daireNo: string;
};

export type IletisimBilgi = {
  gsm: string;
  yakinTelefon1: string;
  yakinTelefon2?: string;
  eposta: string;
};

export type DigerBelgeler = {
  bonservisAdi?: string;
  adliSicilAdi?: string;
};

export type BasvuruProfili = {
  adayId: string;
  kimlik: KimlikBilgi;
  sehitGazi: SehitGaziBilgi;
  egitimler: EgitimKaydi[];
  sinavlar: SinavKaydi[];
  adres?: AdresBilgi;
  iletisim?: IletisimBilgi;
  digerBelgeler?: DigerBelgeler;
  sorumlulukBeyani: boolean;
  kvkkOnayi: boolean;
  guncelleme: string;
};

// ─── Çağrı (Destek Talebi) ─────────────────────────────────────────────────────

export type CagriKategori =
  | "Başvuru ve Tercih İşlemleri"
  | "Sınav Sonuç ve Puan İşlemleri"
  | "Belge ve Evraklar Hakkında"
  | "Teknik ve Hesap Sorunları"
  | "Sonuç ve Çağrı Durumu"
  | "Puan / Sıralama İtirazı"
  | "Bonservis / Belge İtirazı / Reddedilme"
  | "Şehit/Gazi Yakınlığı / Baraj İtirazı"
  | "Genel Yerleştirme / Diğer Şikayetler"
  | "Diğer / Genel Bilgi Talepleri"
  | "Öneri"
  | "Görüş";
export const ITIRAZ_KATEGORILERI: CagriKategori[] = [
  "Puan / Sıralama İtirazı",
  "Bonservis / Belge İtirazı / Reddedilme",
  "Şehit/Gazi Yakınlığı / Baraj İtirazı",
  "Genel Yerleştirme / Diğer Şikayetler",
];

export type CagriDurum = "acik" | "islemde" | "yanitlandi" | "kapali";

export type CagriMesaj = {
  gonderen: "aday" | "admin";
  metin: string;
  tarih: string;
};

export type Cagri = {
  id: string;
  adayId: string;
  ad: string;
  soyad: string;
  eposta: string;
  telefon: string;
  kategori: CagriKategori;
  altKategori?: string;
  alimId?: string;      // ilan referansı
  aciklama: string;
  gorselAdi?: string;
  olusturma: string;
  durum: CagriDurum;
  oncelik: "Düşük" | "Normal" | "Yüksek";
  mesajlar: CagriMesaj[];
};

export type OturumUser = {
  id: string;
  ad: string;
  soyad: string;
  eposta: string;
  rol: Rol;
  tc?: string;
};

export type State = {
  ilanlar: Ilan[];
  adaylar: Aday[];
  belgeler: Belge[];
  basvurular: Basvuru[];
  tercihler: Tercih[];
  duyurular: Duyuru[];
  mesajlar: Mesaj[];
  yerlestirmeler: Yerlestirme[];
  profiller: BasvuruProfili[];
  cagrilar: Cagri[];
  oturum: OturumUser | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA (ilk açılışta yüklenir)
// ─────────────────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

const seedIlanlar: Ilan[] = [
  {
    id: "IL-2026-001",
    baslik: "2026 Yılı Muvazzaf Subay Temini",
    kuvvet: "Kara",
    sinif: "Subay",
    kontenjan: 450, yerlesen: 0, basvuranSayisi: 312,
    baslangic: "2026-06-01", baslangicSaat: "09:00", bitis: "2026-09-15", bitisSaat: "23:59",
    minPuan: 70, egitim: "Lisans", cinsiyet: "Farketmez",
    yasMin: 21, yasMax: 27, boyMin: 165,
    aciklama: "Kara Kuvvetleri Komutanlığı bünyesinde muvazzaf subay temini.",
    sehir: "Türkiye Geneli", durum: "yayin",
    olusturmaTarihi: "2026-05-01T09:00:00.000Z",
    kriterler: ["Sağlık raporu", "Askerlik durumu", "Adli sicil temiz"],
  },
  {
    id: "IL-2026-002",
    baslik: "Sözleşmeli Er Alımı — 3. Dönem",
    kuvvet: "Kara",
    sinif: "Sözleşmeli Er",
    kontenjan: 1200, yerlesen: 0, basvuranSayisi: 1148,
    baslangic: "2026-05-15", bitis: "2026-08-20",
    minPuan: 50, egitim: "Lise", cinsiyet: "Erkek",
    yasMin: 20, yasMax: 25, boyMin: 165,
    aciklama: "Kara Kuvvetleri 3. dönem sözleşmeli er alımı.",
    sehir: "Türkiye Geneli", durum: "yayin",
    olusturmaTarihi: "2026-04-15T09:00:00.000Z",
    kriterler: ["Sağlık raporu", "Beden yeterliliği"],
  },
  {
    id: "IL-2026-003",
    baslik: "Astsubay Meslek Yüksekokulu Temini",
    kuvvet: "Hava",
    sinif: "Astsubay",
    kontenjan: 680, yerlesen: 0, basvuranSayisi: 291,
    baslangic: "2026-06-10", bitis: "2026-09-30",
    minPuan: 65, egitim: "Lise", cinsiyet: "Farketmez",
    yasMin: 18, yasMax: 22, boyMin: 165,
    aciklama: "Astsubay Meslek YO 2026 giriş sınavı.",
    sehir: "Türkiye Geneli", durum: "yayin",
    olusturmaTarihi: "2026-05-10T09:00:00.000Z",
    kriterler: ["YKS puanı", "Sağlık raporu"],
  },
  {
    id: "IL-2026-004",
    baslik: "Sivil Memur Alımı — BT & Mühendislik",
    kuvvet: "MSB Merkez",
    sinif: "Sivil Memur",
    kontenjan: 95, yerlesen: 0, basvuranSayisi: 28,
    baslangic: "2026-06-20", bitis: "2026-09-20",
    minPuan: 75, egitim: "Lisans", cinsiyet: "Farketmez",
    yasMin: 22, yasMax: 35,
    aciklama: "BT, yazılım, siber güvenlik ve mühendislik kadroları.",
    sehir: "Ankara, İstanbul", durum: "yayin",
    olusturmaTarihi: "2026-05-20T09:00:00.000Z",
    kriterler: ["KPSS-P3", "İngilizce YDS/YÖKDİL", "Mesleki sertifika"],
  },
];

const seedAdaylar: Aday[] = [
  {
    id: "18878273464",
    ad: "YUSUF", soyad: "ÖZDEMİR",
    eposta: "yusuf.ozdemir@example.com", telefon: "0555 111 22 33",
    dogumTarihi: "2003-11-13", cinsiyet: "Erkek", sehir: "Ankara",
    egitim: "Lisans", mezuniyet: "Gazi Üniversitesi", bolum: "Bilgisayar Mühendisliği",
    ortalama: 3.42, ehliyet: ["B"],
    yabanciDil: [{ dil: "İngilizce", seviye: "B2", puan: 78 }],
    sertifikalar: ["AWS Cloud Practitioner"],
    askerlikDurumu: "tecil",
    sinavPuani: 82.4, sinavAdi: "KPSS-P3",
    kayitTarihi: "2026-07-01T10:15:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
  {
    id: "24567890123",
    ad: "AYŞE", soyad: "KAYA",
    eposta: "ayse.kaya@example.com", telefon: "0555 222 33 44",
    dogumTarihi: "2001-04-22", cinsiyet: "Kadın", sehir: "İstanbul",
    egitim: "Lisans", mezuniyet: "İTÜ", bolum: "Elektrik-Elektronik Mühendisliği",
    ortalama: 3.68,
    yabanciDil: [{ dil: "İngilizce", seviye: "C1", puan: 88 }],
    sinavPuani: 88.2, sinavAdi: "KPSS-P3",
    kayitTarihi: "2026-07-03T11:20:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
  {
    id: "13456789012",
    ad: "MEHMET", soyad: "DEMİR",
    eposta: "m.demir@example.com", telefon: "0555 333 44 55",
    dogumTarihi: "2002-09-05", cinsiyet: "Erkek", sehir: "İzmir",
    egitim: "Lise", askerlikDurumu: "yapmadi",
    sinavPuani: 71.5,
    kayitTarihi: "2026-07-05T14:00:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
  {
    id: "35678901234",
    ad: "ELİF", soyad: "YILMAZ",
    eposta: "elif.y@example.com", telefon: "0555 444 55 66",
    dogumTarihi: "2000-12-18", cinsiyet: "Kadın", sehir: "Ankara",
    egitim: "Yüksek Lisans", mezuniyet: "ODTÜ", bolum: "Yazılım Mühendisliği",
    ortalama: 3.85,
    yabanciDil: [{ dil: "İngilizce", seviye: "C1", puan: 92 }],
    sertifikalar: ["ISO 27001 Lead Auditor"],
    sinavPuani: 91.7, sinavAdi: "KPSS-P3",
    kayitTarihi: "2026-07-08T09:30:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
  {
    id: "46789012345",
    ad: "AHMET", soyad: "ÇELİK",
    eposta: "ahmet.celik@example.com", telefon: "0555 555 66 77",
    dogumTarihi: "1999-06-11", cinsiyet: "Erkek", sehir: "Bursa",
    egitim: "Ön Lisans", askerlikDurumu: "yapildi",
    sinavPuani: 63.9,
    kayitTarihi: "2026-07-10T16:45:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
  {
    id: "57890123456",
    ad: "ZEYNEP", soyad: "ARSLAN",
    eposta: "z.arslan@example.com", telefon: "0555 666 77 88",
    dogumTarihi: "2003-02-28", cinsiyet: "Kadın", sehir: "Antalya",
    egitim: "Lisans", mezuniyet: "Akdeniz Üniversitesi", bolum: "İşletme",
    ortalama: 3.21,
    sinavPuani: 76.3, sinavAdi: "KPSS-P3",
    kayitTarihi: "2026-07-12T13:20:00.000Z",
    kvkkOnayi: true, aktif: true,
  },
];

const seedBelgeler: Belge[] = [
  {
    id: "BLG-001", adayId: "18878273464", tip: "diploma", ad: "diploma.pdf",
    yuklemeTarihi: "2026-07-15T10:00:00.000Z", boyutKB: 512, durum: "beklemede",
  },
  {
    id: "BLG-002", adayId: "18878273464", tip: "sinav_sonuc", ad: "kpss_2026.pdf",
    yuklemeTarihi: "2026-07-15T10:05:00.000Z", boyutKB: 340, durum: "beklemede",
    ocrAlanlar: { "Puan Türü": "P3", "KPSS Puanı": 82.4, "Sınav Yılı": 2026 },
  },
  {
    id: "BLG-003", adayId: "24567890123", tip: "diploma", ad: "diploma.pdf",
    yuklemeTarihi: "2026-07-16T09:00:00.000Z", boyutKB: 480, durum: "onaylandi",
    onaylayan: "admin", onayTarihi: "2026-07-17T14:00:00.000Z",
  },
  {
    id: "BLG-004", adayId: "13456789012", tip: "askerlik", ad: "askerlik_durum.pdf",
    yuklemeTarihi: "2026-07-18T11:00:00.000Z", boyutKB: 210, durum: "reddedildi",
    redGerekce: "Belge okunaklı değil, yeniden yükleyiniz.",
  },
];

const seedDuyurular: Duyuru[] = [
  {
    id: "D-001",
    baslik: "2026/2 Sözleşmeli Er Yerleştirme Sonuçları Açıklandı",
    ozet: "2026 yılı 2. dönem sözleşmeli er alımı yerleştirme sonuçları açıklanmıştır.",
    icerik: "TC kimlik numaranız ile sistem üzerinden sonuçlarınızı sorgulayabilirsiniz. Yerleşen adaylar için evrak teslim süreci başlamıştır.",
    kategori: "yerlestirme", onemli: true,
    yayinTarihi: "2026-07-28T09:00:00.000Z", yayinlayan: "PGM",
    ilanId: "IL-2026-002",
    sonucSorgulamaAktif: true,
    ekler: [
      { ad: "Görevde Yükselme Taban Puanı Tablosu.pdf", boyutKB: 245 },
      { ad: "Ünvan Değişikliği Taban Puanı Tablosu.pdf", boyutKB: 198 },
      { ad: "Sözleşmeli Er 2026-2 Yerleştirme Sonuç Listesi.xlsx", boyutKB: 512 },
    ],
    sonuclar: [
      { tc: "18878273464", ad: "YUSUF", soyad: "ÖZDEMİR", program: "Kara Kuvvetleri Sözleşmeli Er", statu: "Asil", sira: 42, puan: 82.4, sonucKodu: "SR-2026-042", sonucTarihi: "2026-07-28T09:00:00.000Z" },
      { tc: "24567890123", ad: "AYŞE", soyad: "KAYA", program: "Kara Kuvvetleri Sözleşmeli Er", statu: "Asil", sira: 5, puan: 88.2, sonucKodu: "SR-2026-005", sonucTarihi: "2026-07-28T09:00:00.000Z" },
      { tc: "13456789012", ad: "MEHMET", soyad: "DEMİR", program: "Kara Kuvvetleri Sözleşmeli Er", statu: "Yedek", sira: 128, puan: 71.5, sonucKodu: "SR-2026-Y128", sonucTarihi: "2026-07-28T09:00:00.000Z" },
      { tc: "46789012345", ad: "AHMET", soyad: "ÇELİK", program: "-", statu: "Yerleşemedi", puan: 320.03, gerekce: "Süreçte başarısız olduğunuzdan adaylığınız sonlandırılmıştır. (Gerekçe: Zorunlu profil adımları eksik: Kimlik Bilgileri, Biyometrik Fotoğraf, Eğitim Bilgileri, Sınav Bilgileri, Adres Bilgileri)", sonucTarihi: "2026-08-07T09:00:00.000Z" },
    ],
  },
  {
    id: "D-002",
    baslik: "Muvazzaf Subay Temini Mülakat Tarihleri Güncellendi",
    ozet: "Mülakat tarihleri ve sınav yerleri sistemde güncellenmiştir.",
    icerik: "Adayların 5 gün içinde randevu bilgilerini kontrol etmeleri gerekmektedir.",
    kategori: "sinav", onemli: false,
    yayinTarihi: "2026-07-22T10:00:00.000Z", yayinlayan: "PGM",
  },
  {
    id: "D-003",
    baslik: "OCR ile Belge Yükleme Kılavuzu Güncellendi",
    ozet: "Belge yükleme sürecinde yaşanan teknik sorunlara yönelik güncellenen kılavuz yayımlanmıştır.",
    icerik: "Yeni kılavuzu incelemenizi öneririz. Belgelerinizin PDF formatında, 300 DPI çözünürlükte olması OCR başarısını artırır.",
    kategori: "belge", onemli: false,
    yayinTarihi: "2026-07-18T15:00:00.000Z", yayinlayan: "Bilgi İşlem",
  },
];

const seedBasvurular: Basvuru[] = [
  { id: "BSV-001", adayId: "18878273464", ilanId: "IL-2026-004", basvuruTarihi: "2026-07-14T10:00:00.000Z", durum: "onaylandi", puan: 82.4 },
  { id: "BSV-002", adayId: "24567890123", ilanId: "IL-2026-004", basvuruTarihi: "2026-07-15T10:00:00.000Z", durum: "onaylandi", puan: 88.2 },
  { id: "BSV-003", adayId: "35678901234", ilanId: "IL-2026-004", basvuruTarihi: "2026-07-16T10:00:00.000Z", durum: "onaylandi", puan: 91.7 },
  { id: "BSV-004", adayId: "13456789012", ilanId: "IL-2026-002", basvuruTarihi: "2026-07-13T10:00:00.000Z", durum: "gonderildi", puan: 71.5 },
  { id: "BSV-005", adayId: "46789012345", ilanId: "IL-2026-002", basvuruTarihi: "2026-07-14T10:00:00.000Z", durum: "gonderildi", puan: 63.9 },
  { id: "BSV-006", adayId: "57890123456", ilanId: "IL-2026-004", basvuruTarihi: "2026-07-17T10:00:00.000Z", durum: "gonderildi", puan: 76.3 },
];

const seedTercihler: Tercih[] = [
  { adayId: "18878273464", ilanId: "IL-2026-004", sira: 1, guncellenme: "2026-07-14T10:05:00.000Z" },
  { adayId: "18878273464", ilanId: "IL-2026-001", sira: 2, guncellenme: "2026-07-14T10:05:00.000Z" },
  { adayId: "24567890123", ilanId: "IL-2026-004", sira: 1, guncellenme: "2026-07-15T10:05:00.000Z" },
  { adayId: "35678901234", ilanId: "IL-2026-004", sira: 1, guncellenme: "2026-07-16T10:05:00.000Z" },
];

const seedMesajlar: Mesaj[] = [
  { id: "M-001", konu: "Belge Onayı", icerik: "Diploma belgeniz onaylanmıştır. Kalan belgelerinizi de tamamlamanız gerekmektedir.",
    gonderen: "admin", alici: "24567890123", tarih: "2026-07-17T14:05:00.000Z", okundu: false },
  { id: "M-002", konu: "Hoş Geldiniz", icerik: "Personel Temin Sistemine hoş geldiniz. Başvuru sürecinizi tamamlamak için Bilgilerim sekmesindeki formu doldurunuz.",
    gonderen: "admin", alici: "18878273464", tarih: "2026-07-01T10:30:00.000Z", okundu: true },
];

const seedProfiller: BasvuruProfili[] = [
  {
    adayId: "18878273464",
    kimlik: {
      uyruk: "T.C.", kimlikNo: "18878273464",
      ad: "YUSUF", soyad: "ÖZDEMİR",
      dogumTarihi: "2003-11-13", medeniHal: "Bekar", cinsiyet: "Erkek",
    },
    sehitGazi: { varMi: false },
    egitimler: [
      {
        id: "EGT-001", durum: "Öğrenci", seviye: "denk_uni", seviyeAdi: "Denk Ülke Üniversite",
        universite: "Gazi Üniversitesi", fakulte: "Mühendislik Fakültesi",
        bolum: "Bilgisayar Mühendisliği", ogretimTipi: "Örgün Öğretim", sinif: "4. SINIF",
        baslangicTarihi: "2021-09-15", notSistemi: "4 üzerinden", mezuniyetNotu: "3.42",
      },
      {
        id: "EGT-002", durum: "Mezun", seviye: "denk_lise", seviyeAdi: "Denk Ülke Lise/Ortaöğretim",
        egitimYeri: "Türkiye", il: "Ankara", ilce: "Çankaya",
        okulAdi: "Ankara Atatürk Anadolu Lisesi",
        mezuniyetTarihi: "2021-06-15", notSistemi: "100 üzerinden", mezuniyetNotu: "87.5",
      },
    ],
    sinavlar: [
      {
        id: "SNV-001", sinav: "KPSS Lisans", sinavYili: 2026, sonucKodu: "KPSS-26-004512",
        belgeAdi: "kpss_2026.pdf", kategori: "KPSS P3", puan: 82.4, siralama: 15420,
        onayDurumu: "beklemede",
      },
    ],
    adres: { ulke: "Türkiye", il: "Ankara", ilce: "Çankaya", mahalle: "Kavaklıdere",
             cadde: "Atatürk Bulvarı", binaNo: "125", daireNo: "8" },
    iletisim: { gsm: "0555 111 22 33", yakinTelefon1: "0312 444 55 66", eposta: "yusuf.ozdemir@example.com" },
    sorumlulukBeyani: true, kvkkOnayi: true,
    guncelleme: "2026-07-14T09:00:00.000Z",
  },
];

const seedCagrilar: Cagri[] = [
  {
    id: "CAG-2026-1042", adayId: "18878273464",
    ad: "YUSUF", soyad: "ÖZDEMİR",
    eposta: "yusuf.ozdemir@example.com", telefon: "0555 111 22 33",
    kategori: "Sınav Sonuç ve Puan İşlemleri",
    altKategori: "Sınav sonuç belgem OCR tarafından yanlış okundu / puanım hatalı yansıdı.",
    alimId: "IL-2026-004",
    aciklama: "KPSS-P3 puanım sistemde 82.4 olarak görünüyor ancak belgemde 84.7 yazıyor. Kontrol edilmesini rica ederim.",
    olusturma: "2026-07-20T10:15:00.000Z",
    durum: "yanitlandi", oncelik: "Normal",
    mesajlar: [
      { gonderen: "aday", metin: "KPSS-P3 puanım sistemde 82.4 olarak görünüyor ancak belgemde 84.7 yazıyor.", tarih: "2026-07-20T10:15:00.000Z" },
      { gonderen: "admin", metin: "Talebiniz incelenmiştir. Belgenizde OCR düzeltmesi yapılmış olup puanınız 84.7 olarak güncellenmiştir.", tarih: "2026-07-22T14:20:00.000Z" },
    ],
  },
];

const seed: State = {
  ilanlar: seedIlanlar,
  adaylar: seedAdaylar,
  belgeler: seedBelgeler,
  basvurular: seedBasvurular,
  tercihler: seedTercihler,
  duyurular: seedDuyurular,
  mesajlar: seedMesajlar,
  yerlestirmeler: [],
  profiller: seedProfiller,
  cagrilar: seedCagrilar,
  oturum: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE (custom subscribable, useSyncExternalStore uyumlu)
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEY = "msb.ptds.v1";

function loadInitial(): State {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ilanlar:        parsed.ilanlar        ?? seed.ilanlar,
      adaylar:        parsed.adaylar        ?? seed.adaylar,
      belgeler:       parsed.belgeler       ?? seed.belgeler,
      basvurular:     parsed.basvurular     ?? seed.basvurular,
      tercihler:      parsed.tercihler      ?? seed.tercihler,
      duyurular:      parsed.duyurular      ?? seed.duyurular,
      mesajlar:       parsed.mesajlar       ?? seed.mesajlar,
      yerlestirmeler: parsed.yerlestirmeler ?? seed.yerlestirmeler,
      profiller:      parsed.profiller      ?? seed.profiller,
      cagrilar:       parsed.cagrilar       ?? seed.cagrilar,
      oturum:         parsed.oturum         ?? null,
    };
  } catch {
    return seed;
  }
}

function autoExpireIlanlar(s: State): State {
  const bugun = new Date().toISOString().slice(0, 10);
  const dolan = s.ilanlar.filter(i => i.durum === "yayin" && i.bitis < bugun);
  if (dolan.length === 0) return s;
  return {
    ...s,
    ilanlar: s.ilanlar.map(i =>
      i.durum === "yayin" && i.bitis < bugun ? { ...i, durum: "kapali" } : i
    ),
  };
}

let state: State = autoExpireIlanlar(loadInitial());
const listeners = new Set<() => void>();

// Periyodik olarak bitiş tarihi geçen ilanları "kapali" statüsüne çek (60sn'de bir)
if (typeof window !== "undefined") {
  setInterval(() => {
    const yeni = autoExpireIlanlar(state);
    if (yeni !== state) {
      state = yeni;
      notify();
    }
  }, 60_000);
}

let quotaUyariGosterildi = false;
function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (err) {
    // Quota aşımı — kullanıcıyı bir kere uyar, tekrar tekrar alert atma
    if (!quotaUyariGosterildi) {
      quotaUyariGosterildi = true;
      const msg = "⚠️ Tarayıcı yerel depolama alanı doldu (LocalStorage quota).\n\n" +
        "Muhtemel neden: Vesikalık fotoğraf ve PDF adları çoğaldı.\n" +
        "Değişiklikleriniz bu oturumda görünür, ancak sayfa yenilenirse kaybolabilir.\n\n" +
        "Çözüm: Tarayıcı depolamayı temizleyin veya bazı fotoğraf/PDF'leri kaldırın.";
      setTimeout(() => { try { window.alert(msg); } catch { /* SSR */ } }, 0);
      console.error("[store] LocalStorage quota exceeded:", err);
    }
  }
}

function notify() {
  persist();
  listeners.forEach(l => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

function getSnapshot(): State {
  return state;
}

function set(mutator: (draft: State) => State | void) {
  const next = mutator({ ...state });
  state = (next as State) || state;
  notify();
}

// React hook — selector opsiyonel; default: tüm state.
export function useStore(): State;
export function useStore<T>(selector: (s: State) => T): T;
export function useStore<T>(selector?: (s: State) => T) {
  const sel = selector ?? ((s: State) => s as unknown as T);
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(state));
}

// ─────────────────────────────────────────────────────────────────────────────
// EYLEMLER (actions)
// ─────────────────────────────────────────────────────────────────────────────

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();

export const actions = {
  // ─ Oturum
  girisAday: (tc: string) => {
    const aday = state.adaylar.find(a => a.id === tc);
    if (!aday) return { ok: false, error: "Aday bulunamadı" as const };
    set(s => { s.oturum = { id: aday.id, ad: aday.ad, soyad: aday.soyad, eposta: aday.eposta, rol: "aday", tc: aday.id }; return s; });
    return { ok: true as const };
  },
  girisAdmin: (eposta: string) => {
    set(s => { s.oturum = { id: "admin", ad: "Yönetici", soyad: "Kullanıcısı", eposta, rol: "admin" }; return s; });
    return { ok: true as const };
  },
  cikis: () => set(s => { s.oturum = null; return s; }),

  // ─ İlanlar
  ilanEkle: (payload: Omit<Ilan, "id" | "yerlesen" | "basvuranSayisi" | "olusturmaTarihi" | "durum"> & Partial<Pick<Ilan, "durum">>) => {
    const yeni: Ilan = {
      ...payload,
      id: genId("IL"),
      yerlesen: 0,
      basvuranSayisi: 0,
      durum: payload.durum ?? "taslak",
      olusturmaTarihi: now(),
    };
    set(s => { s.ilanlar = [yeni, ...s.ilanlar]; return s; });
    return yeni;
  },
  ilanGuncelle: (id: string, patch: Partial<Ilan>) =>
    set(s => { s.ilanlar = s.ilanlar.map(i => i.id === id ? { ...i, ...patch } : i); return s; }),
  ilanSil: (id: string) =>
    set(s => { s.ilanlar = s.ilanlar.filter(i => i.id !== id); return s; }),

  // ─ Adaylar
  adayEkle: (payload: Omit<Aday, "kayitTarihi" | "aktif">) =>
    set(s => { s.adaylar = [{ ...payload, kayitTarihi: now(), aktif: true }, ...s.adaylar]; return s; }),
  adayGuncelle: (id: string, patch: Partial<Aday>) =>
    set(s => { s.adaylar = s.adaylar.map(a => a.id === id ? { ...a, ...patch } : a); return s; }),

  // ─ Belgeler
  belgeYukle: (payload: Omit<Belge, "id" | "yuklemeTarihi" | "durum">) => {
    const yeni: Belge = { ...payload, id: genId("BLG"), yuklemeTarihi: now(), durum: "beklemede" };
    set(s => { s.belgeler = [yeni, ...s.belgeler]; return s; });
    return yeni;
  },
  belgeOnayla: (id: string, onaylayan: string) =>
    set(s => { s.belgeler = s.belgeler.map(b => b.id === id ? { ...b, durum: "onaylandi", onaylayan, onayTarihi: now(), redGerekce: undefined } : b); return s; }),
  belgeReddet: (id: string, onaylayan: string, redGerekce: string) =>
    set(s => { s.belgeler = s.belgeler.map(b => b.id === id ? { ...b, durum: "reddedildi", onaylayan, onayTarihi: now(), redGerekce } : b); return s; }),

  // ─ Başvurular
  basvuruYap: (adayId: string, ilanId: string, puan: number) => {
    if (state.basvurular.some(b => b.adayId === adayId && b.ilanId === ilanId)) return null;
    const yeni: Basvuru = { id: genId("BSV"), adayId, ilanId, basvuruTarihi: now(), durum: "gonderildi", puan };
    set(s => {
      s.basvurular = [yeni, ...s.basvurular];
      s.ilanlar = s.ilanlar.map(i => i.id === ilanId ? { ...i, basvuranSayisi: i.basvuranSayisi + 1 } : i);
      return s;
    });
    return yeni;
  },
  basvuruDurumGuncelle: (id: string, durum: Basvuru["durum"], redGerekce?: string) =>
    set(s => { s.basvurular = s.basvurular.map(b => b.id === id ? { ...b, durum, redGerekce } : b); return s; }),

  // Admin: rich text gerekçe + tebligat PDF + adaya gönder (kilitler)
  basvuruAdminIslem: (id: string, patch: {
    durum?: Basvuru["durum"]; adminGerekce?: string; tebligatBelgesi?: string;
  }, gonder = false) => {
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== id ? b : {
        ...b, ...patch,
        gonderildi: gonder ? true : b.gonderildi,
        gonderilmeTarihi: gonder ? now() : b.gonderilmeTarihi,
      });
      if (gonder) {
        const bsv = s.basvurular.find(b => b.id === id);
        if (bsv) {
          const ilan = s.ilanlar.find(i => i.id === bsv.ilanId);
          const durum = patch.durum ?? bsv.durum;
          const konu = durum === "onaylandi" ? "Başvurunuz Onaylandı"
                     : durum === "reddedildi" ? "Başvurunuz Reddedildi"
                     : durum === "yerlestirildi" ? "Yerleştirme Sonucu — Asil"
                     : durum === "yedek" ? "Yerleştirme Sonucu — Yedek"
                     : durum === "belge_onay_bekliyor" ? "Belge Onayı Bekleniyor"
                     : "Başvuru Durumu Güncellendi";
          const tur: MesajTur = durum === "reddedildi" ? "hata"
                              : durum === "yerlestirildi" || durum === "onaylandi" ? "basari"
                              : durum === "yedek" ? "uyari" : "bilgi";
          s.mesajlar = [{
            id: genId("M"), konu,
            icerik: patch.adminGerekce ?? "Başvuru durumunuz güncellendi. Detay için ilgili sayfaya bakınız.",
            gonderen: "admin", alici: bsv.adayId, tarih: now(), okundu: false,
            tur, onemli: durum === "reddedildi" || durum === "yerlestirildi",
            ilanId: bsv.ilanId,
          }, ...s.mesajlar];
        }
      }
      return s;
    });
  },

  // ─ Tercihler
  tercihKaydet: (adayId: string, siralar: { ilanId: string; sira: number }[]) =>
    set(s => {
      s.tercihler = [
        ...s.tercihler.filter(t => t.adayId !== adayId),
        ...siralar.map(x => ({ adayId, ilanId: x.ilanId, sira: x.sira, guncellenme: now() })),
      ];
      return s;
    }),

  // ─ Duyurular
  duyuruEkle: (payload: Omit<Duyuru, "id" | "yayinTarihi">) => {
    const yeni: Duyuru = { ...payload, id: genId("D"), yayinTarihi: now() };
    set(s => { s.duyurular = [yeni, ...s.duyurular]; return s; });
    return yeni;
  },
  duyuruGuncelle: (id: string, patch: Partial<Duyuru>) =>
    set(s => { s.duyurular = s.duyurular.map(d => d.id === id ? { ...d, ...patch } : d); return s; }),
  duyuruEkleDosya: (id: string, ek: DuyuruEk) =>
    set(s => { s.duyurular = s.duyurular.map(d => d.id === id ? { ...d, ekler: [...(d.ekler ?? []), ek] } : d); return s; }),
  duyuruSonucSorgulamaAyar: (id: string, aktif: boolean) =>
    set(s => { s.duyurular = s.duyurular.map(d => d.id === id ? { ...d, sonucSorgulamaAktif: aktif } : d); return s; }),
  duyuruSonuclarYukle: (id: string, sonuclar: DuyuruSonucKayit[]) =>
    set(s => { s.duyurular = s.duyurular.map(d => d.id === id ? { ...d, sonuclar } : d); return s; }),
  duyuruSil: (id: string) =>
    set(s => { s.duyurular = s.duyurular.filter(d => d.id !== id); return s; }),

  // ─ Mesajlar
  mesajGonder: (payload: Omit<Mesaj, "id" | "tarih" | "okundu">) => {
    const yeni: Mesaj = { ...payload, id: genId("M"), tarih: now(), okundu: false };
    set(s => { s.mesajlar = [yeni, ...s.mesajlar]; return s; });
    return yeni;
  },
  mesajOkundu: (id: string) =>
    set(s => { s.mesajlar = s.mesajlar.map(m => m.id === id ? { ...m, okundu: true } : m); return s; }),

  // ─ Yerleştirme motoru (yeni formül: Ham × K_tercih + Şehit/Gazi öncelik)
  // Ham = ÖSYM puan + Bonservis puanı
  // K_tercih: 1. tercih=1.05, 2. tercih=1.02, 3+=1.00
  // Şehit/Gazi: taban indirimi + eşitlikte öncelik
  yerlestirmeCalistir: (ilanId: string, yontem: "otomatik" | "manuel", yapan: string) => {
    const ilan = state.ilanlar.find(i => i.id === ilanId);
    if (!ilan) return null;

    // Şehit/gazi mi?
    const sehitGaziMi = (adayId: string) => !!state.profiller.find(p => p.adayId === adayId)?.sehitGazi.varMi;

    // Taban puan (şehit/gazi için indirimli)
    const tabanIcin = (adayId: string) =>
      sehitGaziMi(adayId) ? Math.max(0, ilan.minPuan - (ilan.sehitGaziTabanIndirimi ?? 0)) : ilan.minPuan;

    const basvurular = state.basvurular
      .filter(b => b.ilanId === ilanId && (b.durum === "onaylandi" || b.durum === "gonderildi" || b.durum === "belge_onay_bekliyor"))
      .filter(b => b.puan >= tabanIcin(b.adayId));

    const zatenYerlesenler = new Set(
      state.yerlestirmeler
        .filter(y => y.yayinlandi)
        .flatMap(y => y.sonuclar.filter(r => r.durum === "yerlesti").map(r => r.adayId))
    );

    const tercihSirasi = (adayId: string) => {
      const t = state.tercihler.find(x => x.adayId === adayId && x.ilanId === ilanId);
      return t?.sira ?? 999;
    };

    // K_tercih katsayısı
    const kTercih = (sira: number) => sira === 1 ? 1.05 : sira === 2 ? 1.02 : 1.00;

    // Ham puan (ÖSYM + bonservis)
    const hamPuan = (b: Basvuru) => b.puan + (b.bonservisPuani ?? 0);
    const nihaiPuan = (b: Basvuru) => Math.round(hamPuan(b) * kTercih(tercihSirasi(b.adayId)) * 100) / 100;

    // Sırala: önce nihai puan (büyükten küçüğe), eşitse şehit/gazi öncelik, sonra tercih sırası
    const siralanan = basvurular
      .filter(b => !zatenYerlesenler.has(b.adayId))
      .sort((a, b) => {
        const na = nihaiPuan(a), nb = nihaiPuan(b);
        if (nb !== na) return nb - na;
        const sga = sehitGaziMi(a.adayId) ? 1 : 0;
        const sgb = sehitGaziMi(b.adayId) ? 1 : 0;
        if (sga !== sgb) return sgb - sga;
        return tercihSirasi(a.adayId) - tercihSirasi(b.adayId);
      });

    // Şehit/Gazi özel kontenjan (opsiyonel)
    const ozelKota = ilan.sehitGaziKotaYuzde ? Math.floor(ilan.kontenjan * ilan.sehitGaziKotaYuzde / 100) : 0;
    let yerlesenler: typeof siralanan = [];
    if (ozelKota > 0) {
      const sgAdayları = siralanan.filter(b => sehitGaziMi(b.adayId)).slice(0, ozelKota);
      const genelHavuz = siralanan.filter(b => !sgAdayları.includes(b));
      yerlesenler = [...sgAdayları, ...genelHavuz.slice(0, ilan.kontenjan - sgAdayları.length)];
    } else {
      yerlesenler = siralanan.slice(0, ilan.kontenjan);
    }

    const yedekMax = ilan.kontenjanYedek ?? Math.ceil(ilan.kontenjan * 0.2);
    const kalanlar = siralanan.filter(b => !yerlesenler.includes(b));
    const yedekler = kalanlar.slice(0, yedekMax);
    const yerlesmeyenler = kalanlar.slice(yedekMax);

    const yerlestirme: Yerlestirme = {
      id: genId("YRL"), ilanId, tarih: now(), yontem, yapan, yayinlandi: false,
      sonuclar: [
        ...yerlesenler.map(b => ({ adayId: b.adayId, tercihSirasi: tercihSirasi(b.adayId), puan: nihaiPuan(b), durum: "yerlesti" as const })),
        ...yedekler.map((b, i) => ({ adayId: b.adayId, tercihSirasi: tercihSirasi(b.adayId), puan: nihaiPuan(b), durum: "yedek" as const, yedekSirasi: i + 1 })),
        ...yerlesmeyenler.map(b => ({ adayId: b.adayId, tercihSirasi: tercihSirasi(b.adayId), puan: nihaiPuan(b), durum: "yerlesmedi" as const })),
      ],
    };

    // Aynı ilan için önceki yayınlanmamış yerleştirmeyi değiştir
    set(s => {
      s.yerlestirmeler = [
        yerlestirme,
        ...s.yerlestirmeler.filter(y => !(y.ilanId === ilanId && !y.yayinlandi)),
      ];
      return s;
    });
    return yerlestirme;
  },
  yerlestirmeManuelDegistir: (yerlestirmeId: string, adayId: string, yeniDurum: "yerlesti" | "yedek" | "yerlesmedi") =>
    set(s => {
      s.yerlestirmeler = s.yerlestirmeler.map(y =>
        y.id !== yerlestirmeId ? y :
          { ...y, sonuclar: y.sonuclar.map(r => r.adayId === adayId ? { ...r, durum: yeniDurum } : r) }
      );
      return s;
    }),
  yerlestirmeYayinla: (yerlestirmeId: string) =>
    set(s => {
      const y = s.yerlestirmeler.find(z => z.id === yerlestirmeId);
      if (!y) return s;
      s.yerlestirmeler = s.yerlestirmeler.map(z => z.id === yerlestirmeId ? { ...z, yayinlandi: true } : z);
      const ilan = s.ilanlar.find(i => i.id === y.ilanId);
      // Başvuru durumlarını ayrıntılı güncelle (asil / yedek / yerleşmedi)
      const yerlesenIds = new Set(y.sonuclar.filter(r => r.durum === "yerlesti").map(r => r.adayId));
      const yedekMap   = new Map(y.sonuclar.filter(r => r.durum === "yedek").map(r => [r.adayId, r.yedekSirasi]));
      s.basvurular = s.basvurular.map(b => {
        if (b.ilanId !== y.ilanId) return b;
        if (yerlesenIds.has(b.adayId)) return { ...b, durum: "yerlestirildi", yedekSirasi: undefined };
        if (yedekMap.has(b.adayId))    return { ...b, durum: "yedek", yedekSirasi: yedekMap.get(b.adayId) };
        return { ...b, durum: "yerlestirilmedi" };
      });
      // İlan sayaçları
      s.ilanlar = s.ilanlar.map(i => i.id === y.ilanId ? { ...i, yerlesen: yerlesenIds.size, durum: "yerlestirildi" } : i);
      // Otomatik duyuru — "[İlan Adı] Sonuç Çağrı Durumu" + sonuç sorgulama AKTİF + sonuçlar yüklü
      const sonucKayitlari: DuyuruSonucKayit[] = y.sonuclar.map(r => {
        const aday = s.adaylar.find(a => a.id === r.adayId);
        const statu: DuyuruSonucKayit["statu"] =
          r.durum === "yerlesti" ? "Asil" : r.durum === "yedek" ? "Yedek" : "Yerleşemedi";
        return {
          tc: r.adayId, ad: aday?.ad ?? "", soyad: aday?.soyad ?? "",
          program: ilan?.baslik, statu,
          sira: r.durum === "yerlesti"
            ? y.sonuclar.filter(x => x.durum === "yerlesti").findIndex(x => x.adayId === r.adayId) + 1
            : r.yedekSirasi,
          puan: r.puan,
          sonucKodu: `SR-${new Date().getFullYear()}-${r.adayId.slice(0, 3)}${String(r.puan).replace(".", "")}`,
          sonucTarihi: now(),
        };
      });
      s.duyurular = [{
        id: genId("D"),
        baslik: `${ilan?.baslik ?? "İlan"} — Sonuç Çağrı Durumu`,
        ozet: `Toplam ${yerlesenIds.size} aday asil, ${yedekMap.size} aday yedek olarak yerleştirilmiştir. TCKN ile sonucunuzu sorgulayabilirsiniz.`,
        icerik: "Yerleşen adaylar için kesin kayıt süreci başlamıştır. Yedek adaylar boş kalan kontenjanlara sırayla çağrılacaktır.",
        kategori: "yerlestirme", onemli: true,
        yayinTarihi: now(), yayinlayan: "PGM",
        ilanId: y.ilanId,
        sonucSorgulamaAktif: true,       // Spec: SONUÇ SORGULA otomatik AÇIK
        sonuclar: sonucKayitlari,         // Spec: admin toplu liste otomatik yüklü
      }, ...s.duyurular];
      // Aday panel mesajları — spec: "1. Tercihinize Asil Yerleştiniz", "Yedek Sırada Bekliyor (2. Yedek)"
      const yeniMesajlar: Mesaj[] = y.sonuclar.map(r => {
        let konu = "Yerleştirme Sonucu";
        let icerik = "";
        let tur: MesajTur = "bilgi";
        if (r.durum === "yerlesti") {
          konu = `${r.tercihSirasi}. Tercihinize Asil Yerleştiniz`;
          icerik = `Tebrikler! <strong>${ilan?.baslik ?? "İlan"}</strong> için <strong>${r.tercihSirasi}. tercihinize</strong> Asil olarak yerleştiniz. Nihai puanınız <strong>${r.puan.toFixed(2)}</strong>. Kesin kayıt sürecini panelinizden başlatabilirsiniz.`;
          tur = "basari";
        } else if (r.durum === "yedek") {
          konu = `Yedek Sırada Bekliyorsunuz (${r.yedekSirasi}. Yedek)`;
          icerik = `<strong>${ilan?.baslik ?? "İlan"}</strong> için <strong>${r.yedekSirasi}. yedek</strong> sırada bekliyorsunuz. Nihai puanınız <strong>${r.puan.toFixed(2)}</strong>. Asil kontenjan boşalırsa sıradaki adaya bildirim gönderilir; sıra size gelene kadar ödeme yapmanız gerekmez.`;
          tur = "uyari";
        } else {
          konu = "Puan Yetersizliği / Kontenjan Doldu";
          icerik = `<strong>${ilan?.baslik ?? "İlan"}</strong> için kadro dahilinde değerlendirilemediniz. Nihai puanınız <strong>${r.puan.toFixed(2)}</strong>. Bu sonuç tebligat yerine geçmektedir.`;
          tur = "hata";
        }
        return {
          id: genId("M"), konu, icerik,
          gonderen: "admin", alici: r.adayId, tarih: now(), okundu: false,
          tur, onemli: r.durum === "yerlesti", ilanId: y.ilanId,
        };
      });
      s.mesajlar = [...yeniMesajlar, ...s.mesajlar];
      return s;
    }),

  // ─ Başvuru Profili (Sihirbaz)
  profilKaydet: (adayId: string, patch: Partial<BasvuruProfili>) => {
    set(s => {
      const idx = s.profiller.findIndex(p => p.adayId === adayId);
      if (idx === -1) {
        const yeni: BasvuruProfili = {
          adayId,
          kimlik: { uyruk: "T.C.", kimlikNo: adayId, ad: "", soyad: "", dogumTarihi: "", medeniHal: "", cinsiyet: "Erkek" },
          sehitGazi: { varMi: false },
          egitimler: [],
          sinavlar: [],
          sorumlulukBeyani: false,
          kvkkOnayi: false,
          guncelleme: now(),
          ...patch,
        };
        s.profiller = [yeni, ...s.profiller];
      } else {
        s.profiller = s.profiller.map(p => p.adayId === adayId ? { ...p, ...patch, guncelleme: now() } : p);
      }
      return s;
    });
  },
  egitimEkle: (adayId: string, egitim: Omit<EgitimKaydi, "id">) => {
    const yeni: EgitimKaydi = { ...egitim, id: genId("EGT") };
    set(s => {
      s.profiller = s.profiller.map(p => p.adayId !== adayId ? p
        : { ...p, egitimler: [yeni, ...p.egitimler], guncelleme: now() });
      return s;
    });
    return yeni;
  },
  egitimSil: (adayId: string, id: string) =>
    set(s => {
      s.profiller = s.profiller.map(p => p.adayId !== adayId ? p
        : { ...p, egitimler: p.egitimler.filter(e => e.id !== id), guncelleme: now() });
      return s;
    }),
  sinavEkle: (adayId: string, sinav: Omit<SinavKaydi, "id" | "onayDurumu">) => {
    const yeni: SinavKaydi = { ...sinav, id: genId("SNV"), onayDurumu: "beklemede" };
    set(s => {
      s.profiller = s.profiller.map(p => p.adayId !== adayId ? p
        : { ...p, sinavlar: [yeni, ...p.sinavlar], guncelleme: now() });
      return s;
    });
    return yeni;
  },
  sinavSil: (adayId: string, id: string) =>
    set(s => {
      s.profiller = s.profiller.map(p => p.adayId !== adayId ? p
        : { ...p, sinavlar: p.sinavlar.filter(x => x.id !== id), guncelleme: now() });
      return s;
    }),
  sinavOnayDegistir: (adayId: string, id: string, durum: SinavKaydi["onayDurumu"], not?: string) =>
    set(s => {
      s.profiller = s.profiller.map(p => p.adayId !== adayId ? p
        : { ...p, sinavlar: p.sinavlar.map(x => x.id === id ? { ...x, onayDurumu: durum, onayNotu: not } : x) });
      return s;
    }),

  // ─ Çağrılar (destek talepleri)
  cagriAc: (payload: Omit<Cagri, "id" | "olusturma" | "durum" | "oncelik" | "mesajlar"> & { oncelik?: Cagri["oncelik"] }) => {
    const yeni: Cagri = {
      ...payload,
      id: "CAG-" + new Date().getFullYear() + "-" + String(1000 + Math.floor(Math.random() * 9000)),
      olusturma: now(),
      durum: "acik",
      oncelik: payload.oncelik ?? "Normal",
      mesajlar: [{ gonderen: "aday", metin: payload.aciklama, tarih: now() }],
    };
    set(s => { s.cagrilar = [yeni, ...s.cagrilar]; return s; });
    return yeni;
  },
  cagriDurumGuncelle: (id: string, durum: CagriDurum) =>
    set(s => { s.cagrilar = s.cagrilar.map(c => c.id === id ? { ...c, durum } : c); return s; }),
  cagriYanit: (id: string, gonderen: "aday" | "admin", metin: string) =>
    set(s => {
      s.cagrilar = s.cagrilar.map(c => c.id !== id ? c
        : { ...c, mesajlar: [...c.mesajlar, { gonderen, metin, tarih: now() }],
            durum: gonderen === "admin" ? "yanitlandi" : c.durum });
      return s;
    }),

  // ─ Ödeme (aday dekont yükleme + admin onay/red)
  odemeBildir: (basvuruId: string, dekontAdi: string, referansKodu: string) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b
        : { ...b, odemeDurumu: "inceleniyor", dekontAdi, referansKodu, odemeTarihi: now() });
      return s;
    }),
  odemeOnayla: (basvuruId: string) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b
        : { ...b, odemeDurumu: "alindi" });
      const b = s.basvurular.find(x => x.id === basvuruId);
      if (b) s.mesajlar = [{
        id: genId("M"), konu: "Ödemeniz Alındı",
        icerik: "Başvuru ücreti ödemesi onaylanmıştır. Başvurunuz geçerli sayılmıştır.",
        gonderen: "admin", alici: b.adayId, tarih: now(), okundu: false, tur: "basari", ilanId: b.ilanId,
      }, ...s.mesajlar];
      return s;
    }),
  odemeReddet: (basvuruId: string, gerekce: string) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b
        : { ...b, odemeDurumu: "bekleniyor" });
      const b = s.basvurular.find(x => x.id === basvuruId);
      if (b) s.mesajlar = [{
        id: genId("M"), konu: "Ödemeniz Reddedildi", icerik: gerekce,
        gonderen: "admin", alici: b.adayId, tarih: now(), okundu: false, tur: "hata", ilanId: b.ilanId,
      }, ...s.mesajlar];
      return s;
    }),
  // Açıkta kalanları "iade_edilecek" olarak işaretle (henüz iade yapılmadı, muhasebe bekliyor)
  iadeyeAyir: (basvuruIds: string[]) =>
    set(s => { s.basvurular = s.basvurular.map(b => basvuruIds.includes(b.id) ? { ...b, odemeDurumu: "iade_edilecek" } : b); return s; }),
  // Muhasebe iadeyi yaptıktan sonra "iade_edildi" olarak arşive alır
  iadeIsaretle: (basvuruIds: string[]) =>
    set(s => { s.basvurular = s.basvurular.map(b => basvuruIds.includes(b.id) ? { ...b, odemeDurumu: "iade_edildi" } : b); return s; }),

  // ─ Kesin kayıt
  kesinKayitBaslat: (ilanId: string, bitisTarihi: string) =>
    set(s => {
      s.ilanlar = s.ilanlar.map(i => i.id !== ilanId ? i
        : { ...i, kesinKayitAktif: true, kesinKayitBaslangic: today(), kesinKayitBitis: bitisTarihi });
      // Asil kazanan adaylara bildirim
      const y = s.yerlestirmeler.find(x => x.ilanId === ilanId && x.yayinlandi);
      const asillar = y?.sonuclar.filter(r => r.durum === "yerlesti") ?? [];
      const ilan = s.ilanlar.find(i => i.id === ilanId);
      asillar.forEach(r => {
        const bsv = s.basvurular.find(b => b.adayId === r.adayId && b.ilanId === ilanId);
        if (bsv) {
          s.basvurular = s.basvurular.map(b => b.id === bsv.id ? { ...b, kesinKayitDurumu: "beklemede" } : b);
        }
        s.mesajlar = [{
          id: genId("M"), konu: "Kesin Kayıt Dönemi Başladı",
          icerik: `Tebrikler, ${ilan?.baslik ?? ""} programına asil olarak yerleştiniz. Kesin kayıt işleminizi ${bitisTarihi} tarihine kadar tamamlayınız.`,
          gonderen: "admin", alici: r.adayId, tarih: now(), okundu: false, tur: "basari", onemli: true, ilanId,
        }, ...s.mesajlar];
      });
      return s;
    }),
  kesinKayitTamamla: (basvuruId: string, evraklar: { ad: string; boyutKB: number; tip: string }[], taahhut: boolean) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b
        : { ...b, kesinKayitEvraklar: evraklar, taahhutOnayi: taahhut, kesinKayitDurumu: "inceleniyor" });
      return s;
    }),
  kesinKayitReset: (basvuruId: string) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b
        : { ...b, kesinKayitDurumu: "beklemede", kesinKayitEvraklar: undefined, taahhutOnayi: false, kesinKayitRedNedeni: undefined });
      return s;
    }),
  kesinKayitAdminOnay: (basvuruId: string, onay: boolean, gerekce?: string) =>
    set(s => {
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b : {
        ...b,
        kesinKayitDurumu: onay ? "onaylandi" : "reddedildi",
        kesinKayitOnayTarihi: now(),
        kesinKayitRedNedeni: onay ? undefined : gerekce,
        kayitBelgesiPdf: onay ? `KKB-${b.adayId}-${b.ilanId}.pdf` : undefined,
      });
      const b = s.basvurular.find(x => x.id === basvuruId);
      if (b) s.mesajlar = [{
        id: genId("M"),
        konu: onay ? "Kesin Kayıt Onaylandı" : "Kesin Kayıt Reddedildi",
        icerik: onay ? "Kesin kayıt işleminiz onaylanmıştır. Kayıt Belgenizi (Barkodlu PDF) panelinizden indirebilirsiniz."
                     : (gerekce ?? "Eksik/hatalı evrak. Lütfen düzeltip yeniden yükleyin."),
        gonderen: "admin", alici: b.adayId, tarih: now(), okundu: false,
        tur: onay ? "basari" : "hata", onemli: true, ilanId: b.ilanId,
      }, ...s.mesajlar];
      return s;
    }),
  kesinKayitFeragat: (basvuruId: string) =>
    set(s => {
      const bsv = s.basvurular.find(b => b.id === basvuruId);
      if (!bsv) return s;
      s.basvurular = s.basvurular.map(b => b.id !== basvuruId ? b : {
        ...b, kesinKayitDurumu: "feragat", durum: "yerlestirilmedi",
      });
      // Yedek zincirini tetikle: en yakın yedeği asil'e çevir
      const y = s.yerlestirmeler.find(x => x.ilanId === bsv.ilanId && x.yayinlandi);
      if (y) {
        const yedekAday = y.sonuclar.filter(r => r.durum === "yedek").sort((a, b) => (a.yedekSirasi ?? 999) - (b.yedekSirasi ?? 999))[0];
        if (yedekAday) {
          s.yerlestirmeler = s.yerlestirmeler.map(z => z.id !== y.id ? z : {
            ...z,
            sonuclar: z.sonuclar.map(r => r.adayId === bsv.adayId ? { ...r, durum: "yerlesmedi" as const }
              : r.adayId === yedekAday.adayId ? { ...r, durum: "yerlesti" as const, yedekSirasi: undefined } : r),
          });
          const yedekBsv = s.basvurular.find(b => b.adayId === yedekAday.adayId && b.ilanId === bsv.ilanId);
          if (yedekBsv) {
            s.basvurular = s.basvurular.map(b => b.id !== yedekBsv.id ? b : { ...b, durum: "yerlestirildi", kesinKayitDurumu: "beklemede" });
          }
          s.mesajlar = [{
            id: genId("M"), konu: "Sıranız Asil Listeye Yükseldi",
            icerik: "Asil adayın feragat etmesi nedeniyle sıranız gelmiştir. 3 gün içinde tercih ücretinizi yatırıp kesin kayıt işleminizi tamamlayınız.",
            gonderen: "admin", alici: yedekAday.adayId, tarih: now(), okundu: false, tur: "basari", onemli: true, ilanId: bsv.ilanId,
          }, ...s.mesajlar];
        }
      }
      return s;
    }),

  // ─ Ek Tercih Dönemi
  ekTercihBaslat: (ilanId: string, bitisTarihi: string) =>
    set(s => {
      s.ilanlar = s.ilanlar.map(i => i.id !== ilanId ? i
        : { ...i, ekTercihAktif: true, ekTercihBaslangic: today(), ekTercihBitis: bitisTarihi });
      return s;
    }),
  ekTercihKapat: (ilanId: string) =>
    set(s => { s.ilanlar = s.ilanlar.map(i => i.id === ilanId ? { ...i, ekTercihAktif: false } : i); return s; }),

  // ─ Ek Tercih Simülasyonu — spec: ana yerleştirmede yerleşememiş + kesin kayıt yapmamış adaylar için
  //   boş kontenjanları doldurur. K_ek_tercih: 1. tercih 1.05, 2+ = 1.00. Taban puan opsiyonel esnetme.
  ekTercihSimulasyonuCalistir: (ilanId: string, opts?: { tabanIndirimi?: number }) => {
    const ilan = state.ilanlar.find(i => i.id === ilanId);
    if (!ilan) return null;

    // Boş kontenjan hesabı: orijinal kontenjan - kesin kaydı ONAYLANMIŞ asil sayısı
    const kayitliAsilSayisi = state.basvurular.filter(
      b => b.ilanId === ilanId && b.durum === "yerlestirildi" && b.kesinKayitDurumu === "onaylandi"
    ).length;
    const bosKontenjan = Math.max(0, ilan.kontenjan - kayitliAsilSayisi);
    if (bosKontenjan === 0) return { id: "", ilanId, tarih: now(), yontem: "otomatik" as const, yapan: "system", yayinlandi: false, sonuclar: [] };

    // Uygun havuz: yerleşememişler + yedekte olup asile yükselmemişler + kesin kayıt yaptırmamış olanlar
    // KAYIT YAPTIRANLAR HARIÇ (spec)
    const uygun = state.basvurular.filter(b =>
      b.ilanId === ilanId
      && (b.durum === "yerlestirilmedi" || b.durum === "yedek")
      && b.kesinKayitDurumu !== "onaylandi"
    );

    const sehitGaziMi = (adayId: string) => !!state.profiller.find(p => p.adayId === adayId)?.sehitGazi.varMi;
    const indirim = opts?.tabanIndirimi ?? 0;
    const tabanEk = (adayId: string) => {
      const base = Math.max(0, ilan.minPuan - indirim);
      return sehitGaziMi(adayId) ? Math.max(0, base - (ilan.sehitGaziTabanIndirimi ?? 0)) : base;
    };
    const tabaniGecen = uygun.filter(b => b.puan >= tabanEk(b.adayId));

    const tercihSirasi = (adayId: string) => state.tercihler.find(t => t.adayId === adayId && t.ilanId === ilanId)?.sira ?? 999;
    // K_ek_tercih: 1. ek tercih 1.05, 2+ = 1.00
    const kEk = (sira: number) => sira === 1 ? 1.05 : 1.00;
    const hamPuan = (b: Basvuru) => b.puan + (b.bonservisPuani ?? 0);
    const nihaiEk = (b: Basvuru) => Math.round(hamPuan(b) * kEk(tercihSirasi(b.adayId)) * 100) / 100;

    const siralanan = tabaniGecen.sort((a, b) => {
      const na = nihaiEk(a), nb = nihaiEk(b);
      if (nb !== na) return nb - na;
      const sga = sehitGaziMi(a.adayId) ? 1 : 0;
      const sgb = sehitGaziMi(b.adayId) ? 1 : 0;
      if (sga !== sgb) return sgb - sga;
      return tercihSirasi(a.adayId) - tercihSirasi(b.adayId);
    });

    const yerlesenler = siralanan.slice(0, bosKontenjan);
    const yerlestirme: Yerlestirme = {
      id: genId("YRL-EK"), ilanId, tarih: now(), yontem: "otomatik", yapan: "ek-tercih-system", yayinlandi: false,
      sonuclar: [
        ...yerlesenler.map(b => ({ adayId: b.adayId, tercihSirasi: tercihSirasi(b.adayId), puan: nihaiEk(b), durum: "yerlesti" as const })),
        // Kalanlar yerleşemedi statüsünde
        ...siralanan.slice(bosKontenjan).map(b => ({ adayId: b.adayId, tercihSirasi: tercihSirasi(b.adayId), puan: nihaiEk(b), durum: "yerlesmedi" as const })),
      ],
    };
    set(s => {
      s.yerlestirmeler = [yerlestirme, ...s.yerlestirmeler.filter(y => !(y.ilanId === ilanId && !y.yayinlandi))];
      return s;
    });
    return yerlestirme;
  },

  // ─ Çoklu sınav arşiv (sene geçince önceki yıl belgeleri arşivlenir)
  sinavlarArsivle: (yeniYil: number) =>
    set(s => {
      s.profiller = s.profiller.map(p => ({
        ...p,
        sinavlar: p.sinavlar.map(sn => sn.sinavYili < yeniYil ? { ...sn, arsivlendi: true } : sn),
      }));
      return s;
    }),

  // ─ Manuel aday ekleme + Excel toplu içe aktarma
  adayManuelEkle: (payload: Omit<Aday, "kayitTarihi" | "aktif">) => {
    if (state.adaylar.some(a => a.id === payload.id)) return { ok: false, error: "TCKN zaten kayıtlı." };
    set(s => { s.adaylar = [{ ...payload, kayitTarihi: now(), aktif: true }, ...s.adaylar]; return s; });
    return { ok: true };
  },
  adaylarToplu: (rows: Array<Pick<Aday, "id" | "ad" | "soyad" | "eposta" | "telefon" | "sinavPuani"> & { sehitGaziMi?: boolean }>) => {
    const kabul: typeof rows = []; const red: { row: typeof rows[number]; sebep: string }[] = [];
    const mevcutIds = new Set(state.adaylar.map(a => a.id));
    rows.forEach(r => {
      if (!/^\d{11}$/.test(r.id)) red.push({ row: r, sebep: "TCKN 11 hane olmalı" });
      else if (mevcutIds.has(r.id) || kabul.some(k => k.id === r.id)) red.push({ row: r, sebep: "Mükerrer TCKN" });
      else kabul.push(r);
    });
    set(s => {
      const yeniler: Aday[] = kabul.map(r => ({
        id: r.id, ad: r.ad, soyad: r.soyad, eposta: r.eposta, telefon: r.telefon,
        dogumTarihi: "2000-01-01", cinsiyet: "Erkek", sehir: "—",
        egitim: "Lise", sinavPuani: r.sinavPuani,
        kayitTarihi: now(), kvkkOnayi: false, aktif: true,
      }));
      s.adaylar = [...yeniler, ...s.adaylar];
      if (r_shg(kabul).length) {
        // Şehit/gazi işaretli olanlar için profil oluştur
        s.profiller = [
          ...r_shg(kabul).map(r => ({
            adayId: r.id,
            kimlik: { uyruk: "T.C." as Uyruk, kimlikNo: r.id, ad: r.ad, soyad: r.soyad, dogumTarihi: "", medeniHal: "" as "", cinsiyet: "Erkek" as const },
            sehitGazi: { varMi: true },
            egitimler: [], sinavlar: [], sorumlulukBeyani: false, kvkkOnayi: false, guncelleme: now(),
          })),
          ...s.profiller,
        ];
      }
      return s;
    });
    return { kabul: kabul.length, red: red.length, redDetay: red };
  },

  // ─ Reset (test/demo için)
  resetAll: () => { state = seed; notify(); },
};

// yardımcı — Şehit/Gazi işaretlileri filtrele
function r_shg<T extends { sehitGaziMi?: boolean }>(arr: T[]): T[] {
  return arr.filter(x => x.sehitGaziMi);
}

// Selector yardımcıları
export const select = {
  bekleyenBelgeSayisi: (s: State) => s.belgeler.filter(b => b.durum === "beklemede").length,
  aktifIlanSayisi: (s: State) => s.ilanlar.filter(i => i.durum === "yayin").length,
  toplamAday: (s: State) => s.adaylar.length,
  toplamYerlesen: (s: State) => s.ilanlar.reduce((a, i) => a + i.yerlesen, 0),
  adayBelgeleri: (s: State, adayId: string) => s.belgeler.filter(b => b.adayId === adayId),
  adayBasvurulari: (s: State, adayId: string) => s.basvurular.filter(b => b.adayId === adayId),
  adayMesajlari: (s: State, adayId: string) => s.mesajlar.filter(m => m.alici === adayId || m.gonderen === adayId),
  adayProfili: (s: State, adayId: string) => s.profiller.find(p => p.adayId === adayId) ?? null,
  adayCagrilari: (s: State, adayId: string) => s.cagrilar.filter(c => c.adayId === adayId),
  aktifCagriSayisi: (s: State) => s.cagrilar.filter(c => c.durum === "acik" || c.durum === "islemde").length,
  adayYerlestirmesi: (s: State, adayId: string) => {
    for (const y of s.yerlestirmeler.filter(x => x.yayinlandi)) {
      const r = y.sonuclar.find(x => x.adayId === adayId);
      if (r) return { yerlestirme: y, sonuc: r };
    }
    return null;
  },
};

export { today, now };
