// Ref: cascading dropdowns için ülke/il/ilçe, üniversite/fakülte/bölüm,
// il→okul eşleşmeleri. Demo amaçlı temsili bir alt küme.

export type IlIlce = { il: string; ilceler: string[] };

export const TR_ILLER: IlIlce[] = [
  { il: "Adana",     ilceler: ["Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan"] },
  { il: "Ankara",    ilceler: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Pursaklar", "Polatlı"] },
  { il: "Antalya",   ilceler: ["Muratpaşa", "Kepez", "Konyaaltı", "Aksu", "Döşemealtı", "Manavgat", "Alanya"] },
  { il: "Bursa",     ilceler: ["Osmangazi", "Nilüfer", "Yıldırım", "Gemlik", "İnegöl", "Mudanya"] },
  { il: "Diyarbakır", ilceler: ["Bağlar", "Kayapınar", "Sur", "Yenişehir", "Bismil"] },
  { il: "Erzurum",   ilceler: ["Yakutiye", "Palandöken", "Aziziye", "Horasan", "Pasinler"] },
  { il: "Eskişehir", ilceler: ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Çifteler"] },
  { il: "Gaziantep", ilceler: ["Şahinbey", "Şehitkamil", "Nizip", "İslahiye"] },
  { il: "Hatay",     ilceler: ["Antakya", "Defne", "İskenderun", "Dörtyol", "Samandağ"] },
  { il: "İstanbul",  ilceler: ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Beyoğlu", "Fatih", "Bakırköy", "Ataşehir", "Maltepe", "Kartal", "Pendik", "Bahçelievler", "Zeytinburnu", "Sarıyer", "Beykoz"] },
  { il: "İzmir",     ilceler: ["Konak", "Karşıyaka", "Bornova", "Buca", "Balçova", "Çiğli", "Gaziemir", "Bayraklı"] },
  { il: "Kayseri",   ilceler: ["Melikgazi", "Kocasinan", "Talas", "Hacılar", "İncesu"] },
  { il: "Kocaeli",   ilceler: ["İzmit", "Gebze", "Darıca", "Körfez", "Çayırova"] },
  { il: "Konya",     ilceler: ["Meram", "Selçuklu", "Karatay", "Ereğli", "Akşehir"] },
  { il: "Malatya",   ilceler: ["Battalgazi", "Yeşilyurt", "Doğanşehir"] },
  { il: "Manisa",    ilceler: ["Yunusemre", "Şehzadeler", "Turgutlu", "Akhisar", "Salihli"] },
  { il: "Mersin",    ilceler: ["Yenişehir", "Toroslar", "Akdeniz", "Mezitli", "Tarsus"] },
  { il: "Muğla",     ilceler: ["Menteşe", "Bodrum", "Fethiye", "Marmaris", "Milas"] },
  { il: "Sakarya",   ilceler: ["Adapazarı", "Serdivan", "Erenler", "Hendek"] },
  { il: "Samsun",    ilceler: ["Atakum", "İlkadım", "Canik", "Bafra", "Çarşamba"] },
  { il: "Şanlıurfa", ilceler: ["Haliliye", "Eyyübiye", "Karaköprü", "Siverek", "Viranşehir"] },
  { il: "Tekirdağ",  ilceler: ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı"] },
  { il: "Trabzon",   ilceler: ["Ortahisar", "Akçaabat", "Yomra", "Araklı"] },
  { il: "Van",       ilceler: ["İpekyolu", "Tuşba", "Edremit", "Erciş"] },
];

export const KKTC_ILLER: IlIlce[] = [
  { il: "Lefkoşa",   ilceler: ["Merkez", "Gönyeli", "Değirmenlik"] },
  { il: "Girne",     ilceler: ["Merkez", "Çatalköy", "Alsancak", "Lapta"] },
  { il: "Gazimağusa", ilceler: ["Merkez", "İskele", "Yeniboğaziçi"] },
  { il: "Güzelyurt", ilceler: ["Merkez", "Lefke"] },
];

export const YURT_DISI_ULKELER = [
  "Almanya", "ABD", "Avusturya", "Azerbaycan", "Belçika", "Birleşik Krallık",
  "Fransa", "Hollanda", "İsviçre", "İtalya", "Kanada", "Kazakistan",
  "Kırgızistan", "Malezya", "Özbekistan", "Polonya", "Romanya", "Rusya",
  "Suudi Arabistan", "Ukrayna", "Diğer",
];

export const EGITIM_DILLERI = [
  "Türkçe", "İngilizce", "Almanca", "Fransızca", "Rusça", "Arapça", "İspanyolca", "Çince",
];

// ─── Üniversiteler + Fakülte + Bölüm ─────────────────────────────────────────
export type Bolum = { ad: string; kod: string };
export type Fakulte = { ad: string; bolumler: Bolum[] };
export type Universite = { ad: string; fakulteler: Fakulte[] };

const muhFakulte = (): Fakulte => ({
  ad: "Mühendislik Fakültesi",
  bolumler: [
    { ad: "Bilgisayar Mühendisliği", kod: "BM" },
    { ad: "Elektrik-Elektronik Mühendisliği", kod: "EEM" },
    { ad: "Makine Mühendisliği", kod: "MAK" },
    { ad: "Endüstri Mühendisliği", kod: "END" },
    { ad: "İnşaat Mühendisliği", kod: "INS" },
    { ad: "Yazılım Mühendisliği", kod: "YZM" },
  ],
});
const iibfFakulte = (): Fakulte => ({
  ad: "İktisadi ve İdari Bilimler Fakültesi",
  bolumler: [
    { ad: "İşletme", kod: "ISL" },
    { ad: "İktisat", kod: "IKT" },
    { ad: "Kamu Yönetimi", kod: "KYN" },
    { ad: "Uluslararası İlişkiler", kod: "UI" },
    { ad: "Maliye", kod: "MAL" },
  ],
});
const hukFakulte = (): Fakulte => ({
  ad: "Hukuk Fakültesi",
  bolumler: [{ ad: "Hukuk", kod: "HUK" }],
});
const tipFakulte = (): Fakulte => ({
  ad: "Tıp Fakültesi",
  bolumler: [{ ad: "Tıp", kod: "TIP" }],
});
const egtFakulte = (): Fakulte => ({
  ad: "Eğitim Fakültesi",
  bolumler: [
    { ad: "Sınıf Öğretmenliği", kod: "SNF" },
    { ad: "Matematik Öğretmenliği", kod: "MTM" },
    { ad: "Türkçe Öğretmenliği", kod: "TRK" },
    { ad: "İngilizce Öğretmenliği", kod: "ING" },
  ],
});
const acikOgretim = (): Fakulte => ({
  ad: "Açıköğretim Fakültesi",
  bolumler: [
    { ad: "İşletme", kod: "AOF-ISL" },
    { ad: "İktisat", kod: "AOF-IKT" },
    { ad: "Kamu Yönetimi", kod: "AOF-KYN" },
    { ad: "Adalet", kod: "AOF-ADL" },
  ],
});

export const UNIVERSITELER: Universite[] = [
  { ad: "Ankara Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte(), tipFakulte()] },
  { ad: "Gazi Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), egtFakulte(), tipFakulte()] },
  { ad: "Hacettepe Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), tipFakulte(), egtFakulte()] },
  { ad: "ODTÜ", fakulteler: [muhFakulte(), iibfFakulte(), egtFakulte()] },
  { ad: "Bilkent Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte()] },
  { ad: "İTÜ", fakulteler: [muhFakulte()] },
  { ad: "Boğaziçi Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), egtFakulte()] },
  { ad: "İstanbul Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte(), tipFakulte()] },
  { ad: "Marmara Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte()] },
  { ad: "Yıldız Teknik Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte()] },
  { ad: "Ege Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), tipFakulte()] },
  { ad: "Dokuz Eylül Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte()] },
  { ad: "Anadolu Üniversitesi", fakulteler: [iibfFakulte(), acikOgretim(), egtFakulte()] },
  { ad: "Selçuk Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte(), tipFakulte(), egtFakulte()] },
  { ad: "Erciyes Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), tipFakulte(), egtFakulte()] },
  { ad: "Karadeniz Teknik Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), egtFakulte()] },
  { ad: "Çukurova Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), tipFakulte()] },
  { ad: "Uludağ Üniversitesi", fakulteler: [muhFakulte(), iibfFakulte(), hukFakulte(), tipFakulte()] },
];

// İl → Lise/Ortaöğretim okulları (küçük temsili küme)
export const OKULLAR_IL: Record<string, string[]> = {
  "Ankara": [
    "Ankara Atatürk Anadolu Lisesi", "TED Ankara Koleji", "Ankara Fen Lisesi",
    "Ankara Bahçelievler Deneme Lisesi", "Cumhuriyet Anadolu Lisesi",
    "Gazi Anadolu Lisesi", "Etimesgut Halide Edip Anadolu Lisesi",
  ],
  "İstanbul": [
    "Galatasaray Lisesi", "İstanbul Erkek Lisesi", "Kabataş Erkek Lisesi",
    "Vefa Lisesi", "Kadıköy Anadolu Lisesi", "Pertevniyal Lisesi",
    "İstanbul Fen Lisesi", "Cağaloğlu Anadolu Lisesi",
  ],
  "İzmir": [
    "İzmir Atatürk Lisesi", "Bornova Anadolu Lisesi", "İzmir Fen Lisesi",
    "Karşıyaka Anadolu Lisesi", "Namık Kemal Lisesi",
  ],
  "Bursa": [
    "Bursa Erkek Lisesi", "Bursa Anadolu Lisesi", "Tofaş Fen Lisesi",
  ],
  "Antalya": [
    "Antalya Lisesi", "Antalya Anadolu Lisesi", "Antalya Fen Lisesi",
  ],
  "Adana": ["Adana Anadolu Lisesi", "Seyhan Rotary Lisesi"],
  "Konya": ["Konya Meram Anadolu Lisesi", "Konya Anadolu İmam Hatip Lisesi"],
  "Kayseri": ["Kayseri Nuh Mehmet Baldöktü Anadolu Lisesi"],
  "Gaziantep": ["Gaziantep Kolej Vakfı Anadolu Lisesi"],
  "Trabzon": ["Trabzon Anadolu Lisesi", "Trabzon Fen Lisesi"],
  "Samsun": ["Samsun Anadolu Lisesi", "Anadolu Ondokuz Mayıs Lisesi"],
  "Eskişehir": ["Eskişehir Anadolu Lisesi", "Tepebaşı Anadolu Lisesi"],
};

export function okullarFor(il: string): string[] {
  return OKULLAR_IL[il] ?? ["Örnek Anadolu Lisesi", "Cumhuriyet Lisesi", "Merkez Lisesi"];
}

// ─── Sınav yılı: içinde bulunulan yıl (değiştirilemez, otomatik) ─────────────
export function sinavYiliOtomatik(): number {
  return new Date().getFullYear();
}
