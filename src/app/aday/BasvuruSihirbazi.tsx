// Başvuru Sihirbazı — 7 adımlı aday profil doldurma akışı.
// Kimlik, Şehit/Gazi, Eğitim, Sınav, Adres, İletişim, Diğer Belgeler.
// Referans: müşteri briefing (2026-08-08).

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ArrowRight, Check, Plus, Info, AlertCircle, FileText,
  Upload, X, Trash2, Camera, ShieldCheck, Award, GraduationCap, ScanLine,
} from "lucide-react";
import { MSB } from "../shared/theme";
import { actions, useStore, type BasvuruProfili, type EgitimKaydi, type SinavKaydi, type SinavDetayKalem,
  type NotSistemi, type OgretimTipi, type Uyruk, type MedeniHal, type YakinlikDerecesi,
  type EgitimDurumu, type SinavTuru, type EgitimSeviyeKod } from "../shared/store";
import {
  TR_ILLER, KKTC_ILLER, YURT_DISI_ULKELER, UNIVERSITELER, okullarFor,
  EGITIM_DILLERI, sinavYiliOtomatik,
} from "../shared/lookup";

const inp =
  "w-full h-[34px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20 text-[#333]";
const inpDis = inp + " bg-[#F5F5F5] text-[#888] cursor-not-allowed";
const sel = inp + " appearance-none pr-8";
const ta = "w-full px-3 py-2 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] resize-y min-h-[80px] focus:outline-none focus:border-[#A82232]";
const lbl = "block text-[11.5px] font-bold text-[#555] mb-1 uppercase tracking-wide";
const req = <span className="text-[#A82232]">*</span>;
const btnPri = "inline-flex items-center gap-1.5 h-[32px] px-3.5 text-[12.5px] font-bold text-white rounded-[3px] border border-[#8B1A25]";
const btnDrk = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const btnLgt = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";

const STEPS = [
  "Kimlik Bilgileri",
  "Şehit/Gazi Yakınlığı",
  "Eğitim Bilgileri",
  "Sınav Bilgileri",
  "Adres Bilgileri",
  "İletişim Bilgileri",
  "Diğer Bilgi/Belgeler",
] as const;

// ─── küçük UI parçaları ─────────────────────────────────────────────────────
function Panel({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#DDDDDD] rounded shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-4">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DDDDDD] bg-[#F5F5F5]">
        <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#555]">{title}</div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoBox({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "warn" | "error" }) {
  const map = {
    info:  { bg: MSB.infoBg, brd: MSB.infoBrd, fg: MSB.infoText, Ic: Info },
    warn:  { bg: MSB.warnBg, brd: MSB.warnBrd, fg: MSB.orange,   Ic: AlertCircle },
    error: { bg: "#FBECEE", brd: "#E8B5BB",    fg: MSB.red,      Ic: AlertCircle },
  } as const;
  const t = map[tone];
  const Ic = t.Ic;
  return (
    <div className="flex items-start gap-3 p-3 rounded border mb-3" style={{ background: t.bg, borderColor: t.brd, color: t.fg }}>
      <Ic className="w-4 h-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
      <div className="text-[12.5px] leading-relaxed">{children}</div>
    </div>
  );
}

function KV({ l, v, mono = false }: { l: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex border-b border-[#EEE] py-2">
      <div className="w-[260px] flex-shrink-0 text-right pr-4 text-[13px] text-[#555]">{l}</div>
      <div className={`flex-1 text-[13.5px] text-[#222] font-medium ${mono ? "tabular-nums" : ""}`}>{v || <span className="text-[#BBB]">—</span>}</div>
    </div>
  );
}

// ─── ADIM 1: KİMLİK ─────────────────────────────────────────────────────────
function Adim1Kimlik({ p, onChange }: { p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void }) {
  const k = p.kimlik;
  const fotoInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    if (f.size > 3 * 1024 * 1024) { alert("Fotoğraf 3MB'ı geçemez."); return; }
    const r = new FileReader();
    r.onload = () => onChange({ kimlik: { ...k, vesikalikFoto: String(r.result) } });
    r.readAsDataURL(f);
  };
  return (
    <div className="p-5">
      <InfoBox tone="warn">
        <strong>Kilitli Alanlar:</strong> Sisteme girilmiş <strong>T.C. Kimlik Numarası</strong>, <strong>Doğum Tarihi</strong> ve <strong>Cinsiyet</strong> değiştirilemez.
      </InfoBox>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Vesikalık fotoğraf */}
        <div>
          <label className={lbl}>Vesikalık Fotoğraf {req}</label>
          <div className="w-[200px] h-[240px] bg-[#F5F5F5] border-2 border-dashed border-[#CCCCCC] rounded flex items-center justify-center overflow-hidden relative">
            {k.vesikalikFoto ? (
              <>
                <img src={k.vesikalikFoto} alt="Vesikalık" className="w-full h-full object-cover" />
                <button onClick={() => onChange({ kimlik: { ...k, vesikalikFoto: undefined } })}
                  className="absolute top-1 right-1 w-6 h-6 bg-white/95 border border-[#DDD] rounded-full flex items-center justify-center hover:bg-[#FBECEE]">
                  <X className="w-3.5 h-3.5 text-[#A82232]" />
                </button>
              </>
            ) : (
              <div className="text-center px-3">
                <Camera className="w-8 h-8 mx-auto text-[#AAA] mb-1.5" />
                <div className="text-[10.5px] text-[#888] mb-2">Biyometrik fotoğraf<br />(50×60 mm önerilir)</div>
                <label className={btnLgt + " cursor-pointer text-[11.5px] px-2.5 h-[28px]"}>
                  <Upload className="w-3 h-3" /> Fotoğraf Seç
                  <input type="file" accept="image/*" className="hidden" onChange={fotoInput} />
                </label>
              </div>
            )}
          </div>
          <p className="text-[10.5px] text-[#888] mt-2 max-w-[200px]">
            Son 6 ay içinde çekilmiş, yüz açıkça görünen, düz beyaz zeminli fotoğraf yükleyiniz.
          </p>
        </div>

        {/* Kimlik alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Uyruk {req}</label>
            <select className={sel} value={k.uyruk} onChange={e => onChange({ kimlik: { ...k, uyruk: e.target.value as Uyruk } })}>
              <option>T.C.</option><option>KKTC</option><option>Diğer</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Kimlik No {req} <span className="text-[#888] normal-case ml-1">(değiştirilemez)</span></label>
            <input className={inpDis} value={k.kimlikNo} disabled />
          </div>
          <div>
            <label className={lbl}>Ad {req}</label>
            <input className={inp} value={k.ad} onChange={e => onChange({ kimlik: { ...k, ad: e.target.value.toLocaleUpperCase("tr") } })} />
          </div>
          <div>
            <label className={lbl}>Soyad {req}</label>
            <input className={inp} value={k.soyad} onChange={e => onChange({ kimlik: { ...k, soyad: e.target.value.toLocaleUpperCase("tr") } })} />
          </div>
          <div>
            <label className={lbl}>Doğum Tarihi {req} <span className="text-[#888] normal-case ml-1">(değiştirilemez)</span></label>
            <input type="date" className={inpDis} value={k.dogumTarihi} disabled />
          </div>
          <div>
            <label className={lbl}>Medeni Hal {req}</label>
            <select className={sel} value={k.medeniHal} onChange={e => onChange({ kimlik: { ...k, medeniHal: e.target.value as MedeniHal } })}>
              <option value="">Seçiniz</option>
              <option>Bekar</option><option>Evli</option><option>Boşanmış</option><option>Dul</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Cinsiyet {req} <span className="text-[#888] normal-case ml-1">(değiştirilemez)</span></label>
            <input className={inpDis} value={k.cinsiyet} disabled />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADIM 2: ŞEHİT/GAZİ ─────────────────────────────────────────────────────
function Adim2SehitGazi({ p, onChange }: { p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void }) {
  const s = p.sehitGazi;
  const [belgeAdi, setBelgeAdi] = useState(s.belgeAdi ?? "");
  const [belgeBoyut, setBelgeBoyut] = useState(s.belgeBoyutKB ?? 0);

  const fileIn = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    if (!/\.pdf$/i.test(f.name)) { alert("Sadece PDF kabul edilmektedir."); return; }
    if (f.size > 5 * 1024 * 1024) { alert("Belge 5MB'ı geçemez."); return; }
    setBelgeAdi(f.name);
    setBelgeBoyut(Math.round(f.size / 1024));
    // OCR simülasyonu — profilden gelen kimliğe göre eşleşme kontrolü
    const ok = Math.random() > 0.15;
    onChange({
      sehitGazi: {
        ...s,
        belgeAdi: f.name,
        belgeBoyutKB: Math.round(f.size / 1024),
        belgeYuklemeTarihi: new Date().toISOString(),
        ocrTcKimlik: p.kimlik.kimlikNo,
        ocrAdSoyad: `${p.kimlik.ad} ${p.kimlik.soyad}`,
        ocrYakinlik: s.yakinlikDerecesi ?? "Çocuk",
        ocrEslesmeUyari: !ok,
      },
    });
  };

  return (
    <div className="p-5">
      <InfoBox tone="warn">
        Yönetmelikte belirtilen <strong>şehit/gazi eş ve çocukları</strong> sınav/başvuru ücreti yatırmayacaktır.{" "}
        <a href="#" className="underline font-semibold">Yönetmelik maddeleri için tıklayınız.</a>
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className={lbl}>Şehit/Gazi Yakınlığınız Var mı?</label>
          <select className={sel} value={s.varMi ? "evet" : "hayir"}
            onChange={e => onChange({ sehitGazi: { ...s, varMi: e.target.value === "evet" } })}>
            <option value="hayir">Hayır</option><option value="evet">Evet</option>
          </select>
        </div>
        {s.varMi && (
          <div>
            <label className={lbl}>Yakınlık Derecesi {req}</label>
            <select className={sel} value={s.yakinlikDerecesi ?? ""}
              onChange={e => onChange({ sehitGazi: { ...s, yakinlikDerecesi: e.target.value as YakinlikDerecesi } })}>
              <option value="">Seçiniz</option>
              <option>Eş</option><option>Çocuk</option><option>Kardeş</option><option>Anne</option><option>Baba</option>
            </select>
          </div>
        )}
      </div>

      {s.varMi && (
        <>
          <InfoBox tone="info">
            <div className="space-y-1">
              <div><strong>Belgenin Nereden Alınacağı:</strong> e-Devlet → "Şehit Yakınlığı / Gazi Sorgulama ve Belge Oluşturma" hizmetinden barkodlu belgenizi indirebilir ve bu alana yükleyebilirsiniz.</div>
            </div>
          </InfoBox>
          <InfoBox tone="warn">
            <div className="font-semibold mb-1">Format ve Boyut Uyarısı</div>
            <ul className="list-disc ml-5 space-y-0.5">
              <li>Yükleyeceğiniz belge yalnızca <strong>PDF</strong> formatında olmalıdır.</li>
              <li>Belge boyutu maksimum <strong>5 MB</strong> geçmemelidir.</li>
              <li>JPEG veya PNG formatındaki ekran görüntüsü/fotoğraflar kabul edilmemektedir.</li>
            </ul>
          </InfoBox>
          <InfoBox tone="error">
            <div className="font-semibold mb-1">Resmi Belge / Barkod Uyarısı</div>
            Yükleyeceğiniz belgenin <strong>e-Devlet kapısı üzerinden alınmış, barkodlu ve sorgulanabilir</strong> resmi belge olması zorunludur. Üzerinde barkod/karekod bulunmayan veya tahrifat yapılmış belgeler geçersiz sayılacak ve yasal işlem başlatılacaktır.
          </InfoBox>

          {/* Dosya yükleme — OCR uyuşmazlıkta kırmızı çerçeveli */}
          <div
            className={`border-2 border-dashed rounded p-6 text-center mb-4 ${
              s.ocrEslesmeUyari
                ? "border-[#A82232] bg-[#FBECEE]"
                : belgeAdi && s.ocrTcKimlik
                ? "border-[#5E7F42] bg-[#EEF6E8]"
                : "border-[#CCC] bg-[#FAFAFA]"
            }`}
          >
            {belgeAdi ? (
              <>
                <div className="flex items-center justify-center gap-3">
                  <FileText className={`w-8 h-8 ${s.ocrEslesmeUyari ? "text-[#A82232]" : "text-[#5E7F42]"}`} />
                  <div className="text-left">
                    <div className={`text-[13.5px] font-bold ${s.ocrEslesmeUyari ? "text-[#A82232]" : "text-[#333]"}`}>{belgeAdi}</div>
                    <div className="text-[11.5px] text-[#666]">{belgeBoyut} KB · PDF · OCR: {s.ocrEslesmeUyari ? "❌ UYUŞMAZLIK" : "✓ Eşleşti"}</div>
                  </div>
                  <button className={btnLgt + " ml-3"} onClick={() => {
                    setBelgeAdi(""); setBelgeBoyut(0);
                    onChange({ sehitGazi: { ...s, belgeAdi: undefined, belgeBoyutKB: undefined, ocrTcKimlik: undefined, ocrAdSoyad: undefined, ocrYakinlik: undefined, ocrEslesmeUyari: undefined } });
                  }}>
                    <Trash2 className="w-3.5 h-3.5" /> Kaldır
                  </button>
                </div>
                {s.ocrEslesmeUyari && (
                  <div className="mt-3 text-[12px] text-[#A82232] font-bold uppercase tracking-wide">
                    ⚠ Belge kırmızıyla işaretlendi — kimlik bilgileri eşleşmiyor
                  </div>
                )}
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto text-[#AAA] mb-2" />
                <div className="text-[13px] text-[#666] mb-2">Barkodlu PDF belgenizi buraya yükleyiniz</div>
                <label className={btnDrk + " cursor-pointer inline-flex"}>
                  <Upload className="w-3.5 h-3.5" /> PDF Yükle
                  <input type="file" accept="application/pdf" className="hidden" onChange={fileIn} />
                </label>
              </>
            )}
          </div>

          {/* OCR eşleşme sonucu */}
          {s.ocrEslesmeUyari && (
            <InfoBox tone="error">
              <strong>Dikkat!</strong> Belgedeki kimlik bilgileri aday profiliyle uyuşmuyor. Doğru barkodlu belgeyi yüklediğinizden emin olun.
            </InfoBox>
          )}
          {s.ocrTcKimlik && !s.ocrEslesmeUyari && (
            <InfoBox tone="info">
              <strong>OCR Doğrulaması Tamam:</strong> TCKN {s.ocrTcKimlik}, Ad Soyad {s.ocrAdSoyad}, Yakınlık {s.ocrYakinlik}.
            </InfoBox>
          )}

          {/* KVKK + Sorumluluk */}
          <div className="mt-4 space-y-2.5">
            <label className="flex items-start gap-2.5 p-3 bg-[#F8F8F8] border border-[#DDD] rounded cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={!!s.kvkkOnay}
                onChange={e => onChange({ sehitGazi: { ...s, kvkkOnay: e.target.checked } })} />
              <span className="text-[12.5px] text-[#333] leading-relaxed">
                Yüklediğim belgede yer alan <strong>kişisel verilerimin</strong>, ilgili ilan ve yerleştirme süreçlerinin yürütülmesi amacı doğrultusunda işlenmesine, kurumunuz tarafından doğrulanmasına ve saklanmasına <strong>6698 sayılı KVKK</strong> kapsamında açık rıza gösteriyorum.
              </span>
            </label>
            <label className="flex items-start gap-2.5 p-3 bg-[#F8F8F8] border border-[#DDD] rounded cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={!!s.sorumlulukOnay}
                onChange={e => onChange({ sehitGazi: { ...s, sorumlulukOnay: e.target.checked } })} />
              <span className="text-[12.5px] text-[#333] leading-relaxed">
                <strong>Sorumluluk Beyanı:</strong> Yüklenen belgenin gerçeğe aykırı olduğunun tespiti durumunda, yerleştirmem yapılmış olsa dahi iptal edileceğini ve hukuki sorumluluğun tarafıma ait olacağını kabul ederim.
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ADIM 3: EĞİTİM ─────────────────────────────────────────────────────────
const SEVIYELER: { kod: EgitimSeviyeKod; ad: string; kademe: "yo" | "lise"; denk: boolean }[] = [
  { kod: "esdeger_yo",  ad: "Eşdeğer / Yabancı Ülke Yüksek Okulu", kademe: "yo",   denk: false },
  { kod: "esdeger_uni", ad: "Eşdeğer / Yabancı Ülke Üniversite",   kademe: "yo",   denk: false },
  { kod: "esdeger_yl",  ad: "Eşdeğer / Yabancı Ülke Yüksek Lisans", kademe: "yo",  denk: false },
  { kod: "esdeger_dr",  ad: "Eşdeğer / Yabancı Ülke Doktora",       kademe: "yo",  denk: false },
  { kod: "denk_yo",     ad: "Denk Ülke Yüksek Okulu",               kademe: "yo",  denk: true  },
  { kod: "denk_uni",    ad: "Denk Ülke Üniversite",                 kademe: "yo",  denk: true  },
  { kod: "denk_yl",     ad: "Denk Ülke Yüksek Lisans",              kademe: "yo",  denk: true  },
  { kod: "denk_dr",     ad: "Denk Ülke Doktora",                    kademe: "yo",  denk: true  },
  { kod: "denk_lise",   ad: "Denk Ülke Lise/Ortaöğretim",           kademe: "lise", denk: true },
];

function EgitimPopup({ open, onClose, onSave, kimlikNo }: {
  open: boolean; onClose: () => void; onSave: (e: Omit<EgitimKaydi, "id">) => void; kimlikNo: string;
}) {
  const [durum, setDurum] = useState<EgitimDurumu>("Mezun");
  const [seviyeKod, setSeviyeKod] = useState<EgitimSeviyeKod | "">("");
  const [universite, setUniversite] = useState(""); const [fakulte, setFakulte] = useState(""); const [bolum, setBolum] = useState("");
  const [bolumKodu, setBolumKodu] = useState("");
  const [sinif, setSinif] = useState("");
  const [ogretimTipi, setOgretimTipi] = useState<OgretimTipi>("Örgün Öğretim");
  const [egitimYeri, setEgitimYeri] = useState<"Türkiye" | "KKTC">("Türkiye");
  const [il, setIl] = useState(""); const [ilce, setIlce] = useState(""); const [okulAdi, setOkulAdi] = useState("");
  const [diplomaNo, setDiplomaNo] = useState(""); const [baslangicTarihi, setBaslangicTarihi] = useState(""); const [mezuniyetTarihi, setMezuniyetTarihi] = useState("");
  const [notSistemi, setNotSistemi] = useState<NotSistemi>("4 üzerinden"); const [mezuniyetNotu, setMezuniyetNotu] = useState("");
  const [belgeAdi, setBelgeAdi] = useState("");
  const [egitimUlkesi, setEgitimUlkesi] = useState(""); const [egitimDili, setEgitimDili] = useState("");

  const seviye = SEVIYELER.find(x => x.kod === seviyeKod);
  const isYo   = seviye?.kademe === "yo";
  const isLise = seviye?.kademe === "lise";
  const isDenk = !!seviye?.denk;
  const isEsdeger = seviye && !seviye.denk;

  const universiteObj = UNIVERSITELER.find(u => u.ad === universite);
  const fakulteObj = universiteObj?.fakulteler.find(f => f.ad === fakulte);
  const iller = egitimYeri === "KKTC" ? KKTC_ILLER : TR_ILLER;
  const ilObj = iller.find(x => x.il === il);

  useEffect(() => { if (!open) return;
    // Popup açıldığında sıfırla
    setDurum("Mezun"); setSeviyeKod(""); setUniversite(""); setFakulte(""); setBolum("");
    setBolumKodu(""); setSinif("");
    setEgitimYeri("Türkiye"); setIl(""); setIlce(""); setOkulAdi("");
    setDiplomaNo(""); setBaslangicTarihi(""); setMezuniyetTarihi("");
    setNotSistemi("4 üzerinden"); setMezuniyetNotu(""); setBelgeAdi("");
    setEgitimUlkesi(""); setEgitimDili("");
  }, [open]);

  if (!open) return null;

  const canSave = () => {
    if (!seviye) return false;
    if (!belgeAdi) return false;
    if (!notSistemi || !mezuniyetNotu) return false;
    if (isYo && (!universite || !fakulte || !bolum || !ogretimTipi)) return false;
    if (isLise && (!egitimYeri || !il || !ilce || !okulAdi)) return false;
    if (isEsdeger && (!egitimUlkesi || !egitimDili)) return false;
    return true;
  };

  const handleSave = () => {
    if (!canSave() || !seviye) return;
    const payload: Omit<EgitimKaydi, "id"> = {
      durum, seviye: seviye.kod, seviyeAdi: seviye.ad,
      ...(isYo && { universite, fakulte, bolum, ogretimTipi }),
      ...(isYo && durum === "Öğrenci" && sinif ? { sinif } : {}),
      ...(isYo && durum === "Mezun" && bolumKodu ? { bolumKodu } : {}),
      ...(isLise && { egitimYeri, il, ilce, okulAdi }),
      diplomaNo, baslangicTarihi, mezuniyetTarihi,
      notSistemi, mezuniyetNotu, belgeAdi,
      ...(isEsdeger && { egitimUlkesi, egitimDili }),
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-3xl max-h-[92vh] flex flex-col">
        <header className="flex items-center gap-3 px-5 h-[52px] border-b flex-shrink-0" style={{ background: MSB.red, color: "#fff" }}>
          <GraduationCap className="w-4 h-4" />
          <h2 className="text-[14px] font-extrabold uppercase tracking-wide">Yeni Eğitim Bilgisi Ekle</h2>
          <button onClick={onClose} className="ml-auto text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </header>
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Eğitim Durumu {req}</label>
              <select className={sel} value={durum} onChange={e => setDurum(e.target.value as EgitimDurumu)}>
                <option>Mezun</option><option>Öğrenci</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Eğitim Seviyesi {req}</label>
              <select className={sel} value={seviyeKod} onChange={e => setSeviyeKod(e.target.value as EgitimSeviyeKod)}>
                <option value="">Seçiniz</option>
                <optgroup label="Denk Ülke (Türkiye / KKTC)">
                  {SEVIYELER.filter(s => s.denk).map(s => <option key={s.kod} value={s.kod}>{s.ad}</option>)}
                </optgroup>
                <optgroup label="Eşdeğer / Yabancı Ülke">
                  {SEVIYELER.filter(s => !s.denk).map(s => <option key={s.kod} value={s.kod}>{s.ad}</option>)}
                </optgroup>
              </select>
            </div>
          </div>

          {!seviye && (
            <InfoBox tone="info">
              <div className="space-y-1.5">
                <div><strong>Yurt Dışında Eğitim Alanlar İçin (Eşdeğerlik):</strong> Ön lisans veya lisans aşamasını Türkiye ve KKTC haricindeki bir ülkede tamamladıysanız, "Eşdeğer / Yabancı Ülke" seçeneklerini seçmelisiniz.</div>
                <div><strong>Türkiye / KKTC'de Eğitim Alanlar İçin (Denklik):</strong> Tüm eğitim hayatınızı Türkiye sınırları içerisinde veya KKTC'de tamamladıysanız, "Denk Ülke" seçeneklerini seçmelisiniz.</div>
              </div>
            </InfoBox>
          )}
          {seviye && (
            <InfoBox tone="error">
              <div className="font-semibold mb-1">Dikkat Edilmesi Gereken Husus</div>
              <ul className="list-disc ml-5 space-y-0.5">
                <li>Yurt dışı mezuniyetlerinde <strong>YÖK/MEB onaylı Eşdeğerlik Belgesi</strong> ibraz edilmesi zorunludur.</li>
                <li>Türkiye/KKTC mezuniyetlerinde ise sistemdeki diploma/mezuniyet bilgileri esas alınır.</li>
                <li>Yanlış eğitim seviyesi seçimi, başvurunuzun geçersiz sayılmasına veya reddedilmesine yol açabilir.</li>
              </ul>
            </InfoBox>
          )}

          {/* Eşdeğer için ek alanlar */}
          {isEsdeger && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#EEE] pt-4">
              <div>
                <label className={lbl}>Eğitim Ülkesi {req}</label>
                <select className={sel} value={egitimUlkesi} onChange={e => setEgitimUlkesi(e.target.value)}>
                  <option value="">Seçiniz</option>
                  {YURT_DISI_ULKELER.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Eğitim Dili {req}</label>
                <select className={sel} value={egitimDili} onChange={e => setEgitimDili(e.target.value)}>
                  <option value="">Seçiniz</option>
                  {EGITIM_DILLERI.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Yükseköğretim alanları */}
          {isYo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#EEE] pt-4">
              <div>
                <label className={lbl}>Üniversite {req}</label>
                <select className={sel} value={universite} onChange={e => { setUniversite(e.target.value); setFakulte(""); setBolum(""); }}>
                  <option value="">Seçiniz</option>
                  {UNIVERSITELER.map(u => <option key={u.ad}>{u.ad}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Fakülte / MYO {req}</label>
                <select className={sel} value={fakulte} onChange={e => { setFakulte(e.target.value); setBolum(""); }} disabled={!universiteObj}>
                  <option value="">{universiteObj ? "Seçiniz" : "Önce üniversite seçin"}</option>
                  {universiteObj?.fakulteler.map(f => <option key={f.ad}>{f.ad}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Bölüm {req}</label>
                <select className={sel} value={bolum} onChange={e => setBolum(e.target.value)} disabled={!fakulteObj}>
                  <option value="">{fakulteObj ? "Seçiniz" : "Önce fakülte seçin"}</option>
                  {fakulteObj?.bolumler.map(b => <option key={b.ad}>{b.ad}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Öğretim Tipi {req}</label>
                <select className={sel} value={ogretimTipi} onChange={e => setOgretimTipi(e.target.value as OgretimTipi)}>
                  <option>Örgün Öğretim</option><option>Yaygın Öğretim</option>
                  <option>Açık Öğretim</option><option>Dışardan Öğretim</option>
                </select>
              </div>
              {durum === "Öğrenci" && (
                <div>
                  <label className={lbl}>Sınıf <span className="text-[#888] normal-case">(devam ediyorsa)</span></label>
                  <select className={sel} value={sinif} onChange={e => setSinif(e.target.value)}>
                    <option value="">Seçiniz</option>
                    <option>Hazırlık</option><option>1. SINIF</option><option>2. SINIF</option>
                    <option>3. SINIF</option><option>4. SINIF</option><option>5. SINIF</option><option>6. SINIF</option>
                  </select>
                </div>
              )}
              {durum === "Mezun" && (
                <div>
                  <label className={lbl}>Bölüm Kodu <span className="text-[#888] normal-case">(ops.)</span></label>
                  <input className={inp} value={bolumKodu} onChange={e => setBolumKodu(e.target.value)} placeholder="Örn: 0000" />
                </div>
              )}
            </div>
          )}

          {/* Lise alanları */}
          {isLise && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#EEE] pt-4">
              <div>
                <label className={lbl}>Eğitim Yeri {req}</label>
                <select className={sel} value={egitimYeri} onChange={e => { setEgitimYeri(e.target.value as "Türkiye" | "KKTC"); setIl(""); setIlce(""); setOkulAdi(""); }}>
                  <option>Türkiye</option><option>KKTC</option>
                </select>
              </div>
              <div>
                <label className={lbl}>İl {req}</label>
                <select className={sel} value={il} onChange={e => { setIl(e.target.value); setIlce(""); setOkulAdi(""); }}>
                  <option value="">Seçiniz</option>
                  {iller.map(x => <option key={x.il}>{x.il}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>İlçe {req}</label>
                <select className={sel} value={ilce} onChange={e => setIlce(e.target.value)} disabled={!ilObj}>
                  <option value="">{ilObj ? "Seçiniz" : "Önce il seçin"}</option>
                  {ilObj?.ilceler.map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Okul Adı {req}</label>
                <select className={sel} value={okulAdi} onChange={e => setOkulAdi(e.target.value)} disabled={!il}>
                  <option value="">{il ? "Seçiniz" : "Önce il seçin"}</option>
                  {il && okullarFor(il).map(x => <option key={x}>{x}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Ortak alanlar */}
          {seviye && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#EEE] pt-4">
                <div>
                  <label className={lbl}>Diploma No <span className="text-[#888] normal-case">(ops.)</span></label>
                  <input className={inp} value={diplomaNo} onChange={e => setDiplomaNo(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Başlangıç Tarihi <span className="text-[#888] normal-case">(ops.)</span></label>
                  <input type="date" className={inp} value={baslangicTarihi} onChange={e => setBaslangicTarihi(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Mezuniyet Tarihi <span className="text-[#888] normal-case">(ops.)</span></label>
                  <input type="date" className={inp} value={mezuniyetTarihi} onChange={e => setMezuniyetTarihi(e.target.value)} disabled={durum === "Öğrenci"} />
                </div>
                <div>
                  <label className={lbl}>Not Sistemi {req}</label>
                  <select className={sel} value={notSistemi} onChange={e => setNotSistemi(e.target.value as NotSistemi)}>
                    <option>4 üzerinden</option><option>5 üzerinden</option><option>10 üzerinden</option><option>100 üzerinden</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Mezuniyet Notu {req}</label>
                  <input className={inp} value={mezuniyetNotu} onChange={e => setMezuniyetNotu(e.target.value)} placeholder="Örn: 3.42" />
                </div>
                <div>
                  <label className={lbl}>Belge (PDF) {req}</label>
                  <label className={btnLgt + " cursor-pointer w-full justify-center"}>
                    <Upload className="w-3.5 h-3.5" />
                    <span className="truncate">{belgeAdi || "PDF Seç"}</span>
                    <input type="file" accept="application/pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setBelgeAdi(f.name); }} />
                  </label>
                </div>
              </div>
              <InfoBox tone="info">
                Aday <strong>Adı, Soyadı, TC Kimlik No</strong> ve <strong>Diploma Bilgileri</strong> yüklediğiniz belgeden otomatik okunacak ve profil bilgileriyle karşılaştırılacaktır. Uyuşmazlık halinde belge kırmızıyla işaretlenir.
              </InfoBox>
            </>
          )}
        </div>
        <footer className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2 flex-shrink-0">
          <button className={btnLgt} onClick={onClose}>Vazgeç</button>
          <button className={btnDrk} onClick={handleSave} disabled={!canSave()} style={!canSave() ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            <Check className="w-3.5 h-3.5" /> Kaydet
          </button>
        </footer>
      </div>
    </div>
  );
}

function Adim3Egitim({ p }: { p: BasvuruProfili }) {
  const [popup, setPopup] = useState(false);
  const ogrenci = p.egitimler.filter(e => e.durum === "Öğrenci");
  const mezunYo   = p.egitimler.filter(e => e.durum === "Mezun" && e.seviye !== "denk_lise");
  const mezunLise = p.egitimler.filter(e => e.durum === "Mezun" && e.seviye === "denk_lise");

  return (
    <div className="p-5">
      <InfoBox tone="info">
        YÖK servisinden bilgileriniz alınmıştır. Türkiye'de mezun olduğunuz üniversite bilginiz görünmüyorsa lütfen üniversiteniz ile iletişime geçiniz. Üniversite denklik belgeniz varsa "Eşdeğer / Yabancı Ülke Üniversite" seçerek bilgi girişi yapınız.
      </InfoBox>

      {/* Öğrencilik Bilgileri */}
      <div className="mb-5">
        <div className="bg-[#DBEAF5] border-l-4 border-[#4A6FA5] px-3 py-2 mb-2">
          <h3 className="text-[13.5px] font-bold text-[#1F5372]">Öğrencilik Bilgileri</h3>
        </div>
        {ogrenci.length === 0 ? (
          <div className="text-[12.5px] text-[#888] italic py-2 text-center bg-[#FAFAFA] rounded">Devam eden eğitim kaydı bulunmuyor.</div>
        ) : ogrenci.map(e => (
          <div key={e.id} className="border border-[#EEE] rounded p-3 mb-2">
            <div className="text-[13px] font-bold text-[#333] mb-2">{e.seviyeAdi}</div>
            <div className="grid grid-cols-[160px_1fr] gap-y-1 text-[12.5px]">
              <span className="text-[#666] text-right pr-2">Okul Adı:</span><span className="font-semibold">{e.universite || e.okulAdi}</span>
              {e.fakulte && (<><span className="text-[#666] text-right pr-2">Fakülte / MYO:</span><span>{e.fakulte}</span></>)}
              {e.bolum && (<><span className="text-[#666] text-right pr-2">Bölüm:</span><span>{e.bolum}</span></>)}
              <span className="text-[#666] text-right pr-2">Öğretim Tipi:</span><span>{e.ogretimTipi ?? "—"}</span>
              <span className="text-[#666] text-right pr-2">Sınıfı:</span><span className="font-semibold">{e.sinif ?? "Devam ediyor"}</span>
            </div>
            <div className="flex justify-end mt-2 pt-2 border-t border-[#EEE]">
              <button onClick={() => actions.egitimSil(p.adayId, e.id)}
                className="text-[11.5px] text-[#A82232] hover:underline flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Kaldır
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mezuniyet - Yükseköğretim */}
      {mezunYo.length > 0 && (
        <div className="mb-5">
          <div className="bg-[#DBEAF5] border-l-4 border-[#4A6FA5] px-3 py-2 mb-2">
            <h3 className="text-[13.5px] font-bold text-[#1F5372]">Mezuniyet Bilgileri — Yükseköğretim</h3>
          </div>
          {mezunYo.map(e => (
            <div key={e.id} className="border border-[#EEE] rounded p-3 mb-2">
              <div className="text-[13px] font-bold text-[#333] mb-2">{e.seviyeAdi}</div>
              <div className="grid grid-cols-[180px_1fr] gap-y-1 text-[12.5px]">
                <span className="text-[#666] text-right pr-2">Okul Adı:</span><span className="font-semibold">{e.universite}</span>
                <span className="text-[#666] text-right pr-2">Fakülte / MYO:</span><span>{e.fakulte}</span>
                <span className="text-[#666] text-right pr-2">Bölüm:</span><span>{e.bolum}</span>
                <span className="text-[#666] text-right pr-2">Mezuniyet Tarihi:</span><span>{e.mezuniyetTarihi ? new Date(e.mezuniyetTarihi).toLocaleDateString("tr-TR") : "—"}</span>
                {e.bolumKodu && (<><span className="text-[#666] text-right pr-2">Bölüm Kodu:</span><span className="tabular-nums">{e.bolumKodu}</span></>)}
                <span className="text-[#666] text-right pr-2">Diploma Not Sistemi / Diploma Notu:</span><span>{e.notSistemi} — <strong>{e.mezuniyetNotu}</strong></span>
                {e.egitimUlkesi && (<><span className="text-[#666] text-right pr-2">Ülke / Dil:</span><span>{e.egitimUlkesi} / {e.egitimDili}</span></>)}
              </div>
              <div className="flex justify-end mt-2 pt-2 border-t border-[#EEE]">
                <button onClick={() => actions.egitimSil(p.adayId, e.id)}
                  className="text-[11.5px] text-[#A82232] hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mezuniyet - Lise */}
      {mezunLise.length > 0 && (
        <div className="mb-5">
          <div className="bg-[#DBEAF5] border-l-4 border-[#4A6FA5] px-3 py-2 mb-2">
            <h3 className="text-[13.5px] font-bold text-[#1F5372]">Mezuniyet Bilgileri — Lise/Ortaöğretim</h3>
          </div>
          {mezunLise.map(e => (
            <div key={e.id} className="border border-[#EEE] rounded p-3 mb-2">
              <div className="grid grid-cols-[180px_1fr] gap-y-1 text-[12.5px]">
                <span className="text-[#666] text-right pr-2">Okul Yeri:</span><span className="font-semibold">{e.egitimYeri} / {(e.il ?? "").toLocaleUpperCase("tr")} / {(e.ilce ?? "").toLocaleUpperCase("tr")}</span>
                <span className="text-[#666] text-right pr-2">Okul Adı:</span><span className="font-semibold">{e.okulAdi}</span>
                <span className="text-[#666] text-right pr-2">Mezuniyet Tarihi:</span><span>{e.mezuniyetTarihi ? new Date(e.mezuniyetTarihi).toLocaleDateString("tr-TR") : "—"}</span>
                <span className="text-[#666] text-right pr-2">Diploma Not Sistemi / Diploma Notu:</span><span>{e.notSistemi} — <strong>{e.mezuniyetNotu}</strong></span>
              </div>
              <div className="flex justify-end mt-2 pt-2 border-t border-[#EEE]">
                <button onClick={() => actions.egitimSil(p.adayId, e.id)}
                  className="text-[11.5px] text-[#A82232] hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-4 pt-4 border-t border-[#EEE]">
        <button className={btnDrk} onClick={() => setPopup(true)}>
          <Plus className="w-3.5 h-3.5" /> Eğitim Bilgisi Ekle
        </button>
      </div>

      <EgitimPopup open={popup} onClose={() => setPopup(false)}
        kimlikNo={p.kimlik.kimlikNo}
        onSave={e => actions.egitimEkle(p.adayId, e)} />
    </div>
  );
}

// ─── ADIM 4: SINAV ──────────────────────────────────────────────────────────
const KPSS_KATEGORILER = ["KPSS P1", "KPSS P2", "KPSS P3"];
const KPSS_ALT = ["Genel", "KPSS P10", "KPSS P48", "KPSS P58", "KPSS P94", "KPSS P121"];
const ALES_ALAN = ["SAY", "SÖZ", "EA"];
const DGS_ALAN = ["EA", "SÖZ", "SAY"];
const MSU_ALAN = ["Harp Okulları — Sayısal", "Harp Okulları — Sözel", "Harp Okulları — Eşit Ağırlık", "Astsubay MYO — TYT"];
const YDT_DIL = ["İngilizce", "Almanca", "Fransızca", "Rusça", "Arapça"];

function SinavPopup({ open, onClose, onSave }: {
  open: boolean; onClose: () => void; onSave: (s: Omit<SinavKaydi, "id" | "onayDurumu">) => void;
}) {
  const [sinav, setSinav] = useState<SinavTuru | "">("");
  const [sonucKodu, setSonucKodu] = useState("");
  const [belgeAdi, setBelgeAdi] = useState("");
  const [kategori, setKategori] = useState(""); const [altKategori, setAltKategori] = useState("");
  const [alan, setAlan] = useState(""); const [dil, setDil] = useState("");

  useEffect(() => { if (!open) return;
    setSinav(""); setSonucKodu(""); setBelgeAdi("");
    setKategori(""); setAltKategori(""); setAlan(""); setDil("");
  }, [open]);

  if (!open) return null;

  const iptal = sinav === "TUS" || sinav === "DUS" || sinav === "AGS";

  const gerekenAlanlar = () => {
    if (sinav === "KPSS Lisans") return !!kategori && !!altKategori;
    if (sinav === "ALES") return !!alan;
    if (sinav === "DGS") return !!alan;
    if (sinav === "MSÜ") return !!alan;
    if (sinav === "YDT") return !!dil;
    return true;
  };
  const canSave = !!sinav && !iptal && !!sonucKodu && !!belgeAdi && gerekenAlanlar();

  const handleSave = () => {
    if (!canSave || !sinav) return;
    const rnd = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * 100) / 100;
    const rndSira = () => Math.floor(1000 + Math.random() * 200000);

    // OCR simülasyonu — sınav türüne göre gerçekçi çoklu-puan detay üret
    let ocrDetay: SinavDetayKalem[] | undefined = undefined;
    let puan = rnd(60, 95);
    let siralama = rndSira();
    let yuzdelikDilim: number | undefined = undefined;
    let seviye: string | undefined = undefined;

    if (sinav === "YKS") {
      // TYT / SAY / SÖZ / EA ayrı ayrı ham puan + sıralama
      ocrDetay = [
        { etiket: "TYT", puan: rnd(200, 500), siralama: rndSira() },
        { etiket: "SAY", puan: rnd(180, 550), siralama: rndSira() },
        { etiket: "SÖZ", puan: rnd(180, 500), siralama: rndSira() },
        { etiket: "EA",  puan: rnd(180, 520), siralama: rndSira() },
      ];
      puan = ocrDetay[0].puan!;   // özet için TYT
    } else if (sinav === "MSÜ") {
      // Harp Okulları (SAY/SÖZ/EA) + Astsubay MYO (TYT) ayrı sıralama
      ocrDetay = [
        { etiket: "Harp Okulları — Sayısal", puan: rnd(200, 450), siralama: rndSira() },
        { etiket: "Harp Okulları — Sözel",   puan: rnd(200, 430), siralama: rndSira() },
        { etiket: "Harp Okulları — EA",       puan: rnd(200, 440), siralama: rndSira() },
        { etiket: "Astsubay MYO — TYT",       puan: rnd(180, 400), siralama: rndSira() },
      ];
      const secilen = ocrDetay.find(d => d.etiket === alan);
      puan = secilen?.puan ?? puan;
      siralama = secilen?.siralama ?? siralama;
    } else if (sinav === "KPSS Ön Lisans") {
      // Yalnızca P93 — Türkiye Geneli Başarı Sırası
      ocrDetay = [{ etiket: "P93 — Türkiye Geneli Başarı Sırası", puan: rnd(50, 90), siralama: rndSira() }];
      puan = ocrDetay[0].puan!;
      siralama = ocrDetay[0].siralama!;
    } else if (sinav === "YDS") {
      // 0-100 ham + A/B/C/D/E seviye
      puan = rnd(0, 100);
      seviye = puan >= 90 ? "A" : puan >= 80 ? "B" : puan >= 70 ? "C" : puan >= 60 ? "D" : "E";
      siralama = 0;
      ocrDetay = [{ etiket: `YDS Ham (Seviye ${seviye})`, puan, seviye }];
    } else if (sinav === "TR-YÖS") {
      yuzdelikDilim = rnd(0.5, 60);
      puan = rnd(60, 90);
      ocrDetay = [{ etiket: "TR-YÖS Standart Puan", puan, siralama, yuzdelikDilim }];
    } else if (sinav === "ALES" || sinav === "DGS") {
      ocrDetay = [{ etiket: `${sinav} ${alan}`, puan, siralama }];
    } else if (sinav === "YDT") {
      ocrDetay = [{ etiket: `${dil} — YDT`, puan, siralama }];
    } else if (sinav === "KPSS Lisans") {
      ocrDetay = [{ etiket: `${kategori} — ${altKategori}`, puan, siralama }];
    }

    const payload: Omit<SinavKaydi, "id" | "onayDurumu"> = {
      sinav, sinavYili: sinavYiliOtomatik(), sonucKodu, belgeAdi,
      kategori: kategori || (sinav === "KPSS Ön Lisans" ? "KPSS P93" : undefined),
      altKategori: altKategori || undefined,
      alan: alan || undefined,
      dil:  dil  || undefined,
      puan, siralama, yuzdelikDilim, seviye, ocrDetay,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-2xl max-h-[92vh] flex flex-col">
        <header className="flex items-center gap-3 px-5 h-[52px] border-b flex-shrink-0" style={{ background: MSB.red, color: "#fff" }}>
          <ScanLine className="w-4 h-4" />
          <h2 className="text-[14px] font-extrabold uppercase tracking-wide">Yeni Sınav Bilgisi Ekle</h2>
          <button onClick={onClose} className="ml-auto text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </header>
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Sınav {req}</label>
              <select className={sel} value={sinav} onChange={e => { setSinav(e.target.value as SinavTuru); setKategori(""); setAltKategori(""); setAlan(""); setDil(""); }}>
                <option value="">Seçiniz</option>
                {(["YDS","YKS","AGS","TUS","DUS","YDT","MSÜ","DGS","KPSS Lisans","KPSS Ön Lisans","ALES","TR-YÖS"] as SinavTuru[]).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Sınav Yılı <span className="text-[#888] normal-case">(otomatik)</span></label>
              <input className={inpDis} value={sinavYiliOtomatik()} disabled />
            </div>
          </div>

          {iptal && (
            <InfoBox tone="error">
              <strong>{sinav}</strong> sınavı iptal edilmiştir; bu sınav türü ile başvuru yapılamaz.
            </InfoBox>
          )}

          {!iptal && sinav && (
            <>
              {/* KPSS Ön Lisans — otomatik P93 bilgilendirme */}
              {sinav === "KPSS Ön Lisans" && (
                <InfoBox tone="info">
                  <strong>KPSS Ön Lisans — P93</strong>: Sistem yalnızca <strong>P93 (Türkiye Geneli Başarı Sırası)</strong> puan ve sıralamasını otomatik olarak okuyacaktır. Manuel seçim gerekmez.
                </InfoBox>
              )}

              {/* Alt kategori seçimleri */}
              {sinav === "KPSS Lisans" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>KPSS Kategori {req}</label>
                    <select className={sel} value={kategori} onChange={e => setKategori(e.target.value)}>
                      <option value="">Seçiniz</option>{KPSS_KATEGORILER.map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Alt Kategori {req}</label>
                    <select className={sel} value={altKategori} onChange={e => setAltKategori(e.target.value)}>
                      <option value="">Seçiniz</option>{KPSS_ALT.map(k => <option key={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {sinav === "ALES" && (
                <div><label className={lbl}>ALES Alan {req}</label>
                  <select className={sel} value={alan} onChange={e => setAlan(e.target.value)}>
                    <option value="">Seçiniz</option>{ALES_ALAN.map(a => <option key={a}>{a}</option>)}
                  </select></div>
              )}
              {sinav === "DGS" && (
                <div><label className={lbl}>DGS Alan {req}</label>
                  <select className={sel} value={alan} onChange={e => setAlan(e.target.value)}>
                    <option value="">Seçiniz</option>{DGS_ALAN.map(a => <option key={a}>{a}</option>)}
                  </select></div>
              )}
              {sinav === "MSÜ" && (
                <div><label className={lbl}>Başarı Sıralaması Türü {req}</label>
                  <select className={sel} value={alan} onChange={e => setAlan(e.target.value)}>
                    <option value="">Seçiniz</option>{MSU_ALAN.map(a => <option key={a}>{a}</option>)}
                  </select></div>
              )}
              {sinav === "YDT" && (
                <div><label className={lbl}>Dil {req}</label>
                  <select className={sel} value={dil} onChange={e => setDil(e.target.value)}>
                    <option value="">Seçiniz</option>{YDT_DIL.map(d => <option key={d}>{d}</option>)}
                  </select></div>
              )}

              <div>
                <label className={lbl}>Sonuç Kodu {req} <span className="text-[#888] normal-case ml-1">(belgenin altındaki kod)</span></label>
                <input className={inp} value={sonucKodu} onChange={e => setSonucKodu(e.target.value)} placeholder="Örn: KPSS-26-004512" />
              </div>

              <div>
                <label className={lbl}>Sonuç Belgesi (PDF) {req}</label>
                <label className={btnLgt + " cursor-pointer w-full justify-center"}>
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate">{belgeAdi || "PDF Seç"}</span>
                  <input type="file" accept="application/pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) setBelgeAdi(f.name); }} />
                </label>
                <p className="text-[11px] text-[#888] mt-1.5">
                  Yalnızca <strong>PDF</strong> kabul edilir. Sistem seçilen sınav türüne göre puan/sıralama/dil bilgilerini otomatik okuyacaktır ve <strong>değiştirilemez</strong>.
                </p>
              </div>

              <InfoBox tone="warn">
                Kişisel bilgiler (TCKN, Ad-Soyad) tüm sınav türleri için okunacak ve profil bilgilerinizle eşleşme kontrol edilecektir. <strong>Sistem yöneticisi tarafından 2. onay</strong> yapıldıktan sonra bu sınav bilgisi geçerli sayılacaktır.
              </InfoBox>
            </>
          )}
        </div>
        <footer className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2 flex-shrink-0">
          <button className={btnLgt} onClick={onClose}>Vazgeç</button>
          <button className={btnDrk} onClick={handleSave} disabled={!canSave} style={!canSave ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
            <Check className="w-3.5 h-3.5" /> Kaydet
          </button>
        </footer>
      </div>
    </div>
  );
}

function Adim4Sinav({ p }: { p: BasvuruProfili }) {
  const [popup, setPopup] = useState(false);
  return (
    <div className="p-5">
      <InfoBox tone="info">
        Sınav yılı otomatik olarak <strong>{sinavYiliOtomatik()}</strong> alınır ve değiştirilemez. Yüklenen PDF'ten sınav türüne göre <strong>puan, sıralama, dil, seviye</strong> gibi bilgiler okunur ve sabit olarak kaydedilir.
      </InfoBox>

      {p.sinavlar.length === 0 ? (
        <div className="text-[13px] text-[#888] italic py-6 text-center bg-[#FAFAFA] rounded border border-dashed border-[#DDD]">
          Kayıtlı sınav bilgisi bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {p.sinavlar.map(s => {
            const onayStyle = s.onayDurumu === "onaylandi"
              ? { bg: "#EEF6E8", brd: "#C7DDB0", fg: "#5E7F42", label: "ONAY" }
              : s.onayDurumu === "reddedildi"
              ? { bg: "#FBECEE", brd: "#E8B5BB", fg: MSB.red, label: "RED" }
              : { bg: "#FCF3E3", brd: MSB.warnBrd, fg: MSB.orange, label: "BEKLEMEDE" };
            return (
              <div key={s.id} className="border border-[#E0E0E0] rounded overflow-hidden">
                {/* Başlık satırı */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[#F5F5F5] border-b border-[#DDD]">
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="text-[14px] font-bold text-[#333]">{s.sinav}</span>
                    <span className="text-[11.5px] text-[#666] tabular-nums">({s.sinavYili})</span>
                    {(s.kategori || s.altKategori || s.alan || s.dil) && (
                      <span className="text-[11.5px] text-[#666]">
                        · {[s.kategori, s.altKategori, s.alan, s.dil].filter(Boolean).join(" / ")}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#888] truncate max-w-[200px]">{s.belgeAdi}</span>
                  <span className="inline-block px-2 py-0.5 text-[10.5px] font-bold rounded"
                    style={{ background: onayStyle.bg, color: onayStyle.fg, border: `1px solid ${onayStyle.brd}` }}>
                    {onayStyle.label}
                  </span>
                  <button onClick={() => actions.sinavSil(p.adayId, s.id)} className="text-[#A82232] p-1 hover:bg-[#FBECEE] rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* OCR detay tablosu — YKS için 4, MSÜ için 4, diğerleri için 1 satır */}
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="bg-white text-[#666] border-b border-[#EEE]">
                      <th className="px-4 py-1.5 text-left text-[10.5px] uppercase font-bold">OCR Alan / Sıralama Türü</th>
                      <th className="px-4 py-1.5 text-right text-[10.5px] uppercase font-bold w-24">Ham Puan</th>
                      <th className="px-4 py-1.5 text-right text-[10.5px] uppercase font-bold w-32">Sıralama</th>
                      <th className="px-4 py-1.5 text-center text-[10.5px] uppercase font-bold w-24">Seviye</th>
                      <th className="px-4 py-1.5 text-right text-[10.5px] uppercase font-bold w-28">Yüzdelik %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(s.ocrDetay && s.ocrDetay.length > 0 ? s.ocrDetay : [{ etiket: "Genel Puan", puan: s.puan, siralama: s.siralama, seviye: s.seviye, yuzdelikDilim: s.yuzdelikDilim }]).map((d, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                        <td className="px-4 py-1.5 text-[#333] font-medium">{d.etiket}</td>
                        <td className="px-4 py-1.5 tabular-nums text-right font-semibold text-[#A82232]">{d.puan?.toFixed(2) ?? "—"}</td>
                        <td className="px-4 py-1.5 tabular-nums text-right">{d.siralama != null ? d.siralama.toLocaleString("tr") : "—"}</td>
                        <td className="px-4 py-1.5 text-center">
                          {d.seviye ? <span className="inline-block px-2 py-0.5 bg-[#DBEAF5] text-[#1F5372] text-[10.5px] font-black rounded">{d.seviye}</span> : "—"}
                        </td>
                        <td className="px-4 py-1.5 tabular-nums text-right">{d.yuzdelikDilim != null ? "%" + d.yuzdelikDilim.toFixed(2) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Sonuç Kodu alt bant */}
                <div className="px-4 py-1.5 border-t border-[#EEE] bg-[#FAFAFA] text-[11px] text-[#666] flex items-center justify-between">
                  <span>Sonuç Kodu: <strong className="font-mono text-[#333]">{s.sonucKodu}</strong></span>
                  <span className="text-[10px] italic">Bu değerler PDF'ten OCR ile okunmuştur ve <strong>değiştirilemez</strong>.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end mt-4 pt-4 border-t border-[#EEE]">
        <button className={btnDrk} onClick={() => setPopup(true)}>
          <Plus className="w-3.5 h-3.5" /> Sınav Bilgisi Ekle
        </button>
      </div>

      <SinavPopup open={popup} onClose={() => setPopup(false)}
        onSave={s => actions.sinavEkle(p.adayId, s)} />
    </div>
  );
}

// ─── ADIM 5: ADRES ──────────────────────────────────────────────────────────
function Adim5Adres({ p, onChange }: { p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void }) {
  const a = p.adres ?? { ulke: "Türkiye", il: "", ilce: "", binaNo: "", daireNo: "" };
  const set = (patch: Partial<typeof a>) => onChange({ adres: { ...a, ...patch } });

  const iller = a.ulke === "KKTC" ? KKTC_ILLER : (a.ulke === "Türkiye" ? TR_ILLER : []);
  const ilObj = iller.find(x => x.il === a.il);

  const eksik = !a.il || !a.ilce || !a.binaNo || !a.daireNo;

  return (
    <div className="p-5">
      <InfoBox tone={eksik ? "error" : "info"}>
        <strong>Yaşadığım Adres bilgisi girilmesi zorunludur.</strong> Adres bilgisi girilmeden başvuru sihirbazından devam edilemez.
      </InfoBox>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={lbl}>Ülke {req}</label>
          <select className={sel} value={a.ulke}
            onChange={e => set({ ulke: e.target.value, il: "", ilce: "" })}>
            <option>Türkiye</option><option>KKTC</option><option>Diğer</option>
          </select>
        </div>
        <div>
          <label className={lbl}>İl {req}</label>
          {a.ulke === "Diğer" ? (
            <input className={inp} value={a.il} onChange={e => set({ il: e.target.value })} placeholder="Yurt dışı şehir" />
          ) : (
            <select className={sel} value={a.il} onChange={e => set({ il: e.target.value, ilce: "" })}>
              <option value="">Seçiniz</option>
              {iller.map(x => <option key={x.il}>{x.il}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className={lbl}>İlçe {req}</label>
          {a.ulke === "Diğer" ? (
            <input className={inp} value={a.ilce} onChange={e => set({ ilce: e.target.value })} />
          ) : (
            <select className={sel} value={a.ilce} onChange={e => set({ ilce: e.target.value })} disabled={!ilObj}>
              <option value="">{ilObj ? "Seçiniz" : "Önce il seçin"}</option>
              {ilObj?.ilceler.map(x => <option key={x}>{x}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className={lbl}>Köy / Kasaba <span className="text-[#888] normal-case">(ops.)</span></label>
          <input className={inp} value={a.koyKasaba ?? ""} onChange={e => set({ koyKasaba: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Mahalle <span className="text-[#888] normal-case">(ops.)</span></label>
          <input className={inp} value={a.mahalle ?? ""} onChange={e => set({ mahalle: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Cadde <span className="text-[#888] normal-case">(ops.)</span></label>
          <input className={inp} value={a.cadde ?? ""} onChange={e => set({ cadde: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Sokak <span className="text-[#888] normal-case">(ops.)</span></label>
          <input className={inp} value={a.sokak ?? ""} onChange={e => set({ sokak: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Bina No {req}</label>
          <input className={inp} value={a.binaNo} onChange={e => set({ binaNo: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Daire No {req}</label>
          <input className={inp} value={a.daireNo} onChange={e => set({ daireNo: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── ADIM 6: İLETİŞİM ──────────────────────────────────────────────────────
function Adim6Iletisim({ p, onChange }: { p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void }) {
  const i = p.iletisim ?? { gsm: "", yakinTelefon1: "", eposta: "" };
  const set = (patch: Partial<typeof i>) => onChange({ iletisim: { ...i, ...patch } });
  return (
    <div className="p-5">
      <InfoBox tone="warn">
        Aday <strong>GSM</strong> bilgisi; duyurular ve diğer SMS bildirimleri için kullanılacaktır. Doğru girildiğinden emin olunuz.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>GSM {req}</label>
          <input className={inp} value={i.gsm} onChange={e => set({ gsm: e.target.value })} placeholder="0 5xx xxx xx xx" />
        </div>
        <div>
          <label className={lbl}>E-posta {req}</label>
          <input type="email" className={inp} value={i.eposta} onChange={e => set({ eposta: e.target.value })} />
        </div>
        <div>
          <label className={lbl}>Yakın Telefon-1 {req}</label>
          <input className={inp} value={i.yakinTelefon1} onChange={e => set({ yakinTelefon1: e.target.value })} placeholder="0 xxx xxx xx xx" />
        </div>
        <div>
          <label className={lbl}>Yakın Telefon-2 <span className="text-[#888] normal-case">(ops.)</span></label>
          <input className={inp} value={i.yakinTelefon2 ?? ""} onChange={e => set({ yakinTelefon2: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── ADIM 7: DİĞER BELGELER ────────────────────────────────────────────────
function Adim7Diger({ p, onChange }: { p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void }) {
  const d = p.digerBelgeler ?? {};
  const set = (patch: Partial<typeof d>) => onChange({ digerBelgeler: { ...d, ...patch } });
  return (
    <div className="p-5">
      <InfoBox tone="info">
        Bu adımdaki belgeler <strong>zorunlu değildir</strong>; ancak yükleniyorsa yalnızca PDF formatında ve barkodlu olması önerilir.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={lbl}>Bonservis / Sertifika (PDF)</label>
          <label className={btnLgt + " cursor-pointer w-full justify-center"}>
            <Award className="w-3.5 h-3.5" />
            <span className="truncate">{d.bonservisAdi || "PDF Seç"}</span>
            <input type="file" accept="application/pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) set({ bonservisAdi: f.name }); }} />
          </label>
          <p className="text-[11px] text-[#888] mt-1.5">Kurs bonservisi, mesleki yeterlik sertifikası vb.</p>
        </div>
        <div>
          <label className={lbl}>Adli Sicil Kayıt Belgesi (PDF)</label>
          <label className={btnLgt + " cursor-pointer w-full justify-center"}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">{d.adliSicilAdi || "PDF Seç"}</span>
            <input type="file" accept="application/pdf" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) set({ adliSicilAdi: f.name }); }} />
          </label>
          <p className="text-[11px] text-[#888] mt-1.5">e-Devlet üzerinden alınmış barkodlu belge yükleyiniz.</p>
        </div>
      </div>
    </div>
  );
}

// ─── ÖZET ───────────────────────────────────────────────────────────────────
function Ozet({ p, onChange, onEdit }: {
  p: BasvuruProfili; onChange: (patch: Partial<BasvuruProfili>) => void; onEdit: (step: number) => void;
}) {
  return (
    <div className="p-5 space-y-3">
      <Panel title="Kimlik Bilgileri" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(0)}>Güncelle</button>}>
        <div className="flex gap-5">
          {p.kimlik.vesikalikFoto && <img src={p.kimlik.vesikalikFoto} alt="Vesikalık" className="w-[100px] h-[120px] object-cover border border-[#DDD] rounded" />}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
            <KV l="Uyruk"        v={p.kimlik.uyruk} />
            <KV l="Kimlik No"    v={p.kimlik.kimlikNo} mono />
            <KV l="Ad"           v={p.kimlik.ad} />
            <KV l="Soyad"        v={p.kimlik.soyad} />
            <KV l="Doğum Tarihi" v={p.kimlik.dogumTarihi} />
            <KV l="Medeni Hal"   v={p.kimlik.medeniHal} />
            <KV l="Cinsiyet"     v={p.kimlik.cinsiyet} />
          </div>
        </div>
      </Panel>

      <Panel title="Şehit / Gazi Yakınlığı" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(1)}>Güncelle</button>}>
        {p.sehitGazi.varMi ? (
          <>
            <KV l="Yakınlık"     v={p.sehitGazi.yakinlikDerecesi} />
            <KV l="Belge"        v={p.sehitGazi.belgeAdi} />
            <KV l="KVKK Onayı"   v={p.sehitGazi.kvkkOnay ? "Evet" : "Hayır"} />
          </>
        ) : <div className="text-[13px] text-[#888]">Belirtilmedi.</div>}
      </Panel>

      <Panel title="Eğitim Bilgileri" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(2)}>Güncelle</button>}>
        {p.egitimler.length === 0 ? <div className="text-[13px] text-[#888]">Kayıt yok.</div>
          : <ul className="text-[13px] space-y-1.5">{p.egitimler.map(e => (
              <li key={e.id}>• <strong>{e.seviyeAdi}</strong> — {e.universite || e.okulAdi} ({e.durum})</li>
            ))}</ul>}
      </Panel>

      <Panel title="Sınav Bilgileri" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(3)}>Güncelle</button>}>
        {p.sinavlar.length === 0 ? <div className="text-[13px] text-[#888]">Kayıt yok.</div>
          : <ul className="text-[13px] space-y-1.5">{p.sinavlar.map(s => (
              <li key={s.id}>• <strong>{s.sinav}</strong> ({s.sinavYili}) — Puan: {s.puan?.toFixed(2)} — {s.onayDurumu === "onaylandi" ? "Onaylı" : s.onayDurumu === "reddedildi" ? "Reddedildi" : "Beklemede"}</li>
            ))}</ul>}
      </Panel>

      <Panel title="Adres Bilgileri" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(4)}>Güncelle</button>}>
        {p.adres ? (
          <div className="text-[13px] text-[#333]">
            {[p.adres.mahalle, p.adres.cadde, p.adres.sokak].filter(Boolean).join(", ")} No: {p.adres.binaNo}/{p.adres.daireNo}<br />
            <span className="text-[#666]">{p.adres.ilce} / {p.adres.il} / {p.adres.ulke}</span>
          </div>
        ) : <div className="text-[13px] text-[#888]">Girilmedi.</div>}
      </Panel>

      <Panel title="İletişim Bilgileri" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(5)}>Güncelle</button>}>
        {p.iletisim ? (
          <>
            <KV l="GSM"     v={p.iletisim.gsm} mono />
            <KV l="E-posta" v={p.iletisim.eposta} />
            <KV l="Yakın 1" v={p.iletisim.yakinTelefon1} mono />
            <KV l="Yakın 2" v={p.iletisim.yakinTelefon2} mono />
          </>
        ) : <div className="text-[13px] text-[#888]">Girilmedi.</div>}
      </Panel>

      <Panel title="Diğer Belgeler" right={<button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => onEdit(6)}>Güncelle</button>}>
        <KV l="Bonservis"       v={p.digerBelgeler?.bonservisAdi} />
        <KV l="Adli Sicil"      v={p.digerBelgeler?.adliSicilAdi} />
      </Panel>

      {/* Sorumluluk + KVKK Beyanı */}
      <div className="border border-[#E0E0E0] rounded p-4 bg-[#FAFAFA] mt-4">
        <h3 className="text-[13px] font-bold text-[#A82232] mb-3 uppercase tracking-wide">Sorumluluk Beyanı ve KVKK Onayı</h3>
        <label className="flex items-start gap-2.5 mb-2 cursor-pointer">
          <input type="checkbox" className="mt-0.5" checked={p.sorumlulukBeyani}
            onChange={e => onChange({ sorumlulukBeyani: e.target.checked })} />
          <span className="text-[12.5px] text-[#333] leading-relaxed">
            Sistemde beyan ettiğim tüm bilgi ve belgelerin doğru olduğunu, aksinin tespiti halinde yerleştirmem yapılmış olsa dahi iptal edileceğini ve hukuki sorumluluğun tarafıma ait olacağını kabul ederim.
          </span>
        </label>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" className="mt-0.5" checked={p.kvkkOnayi}
            onChange={e => onChange({ kvkkOnayi: e.target.checked })} />
          <span className="text-[12.5px] text-[#333] leading-relaxed">
            <strong>6698 sayılı KVKK</strong> kapsamında kişisel verilerimin, ilgili ilan ve yerleştirme süreçlerinin yürütülmesi amacıyla işlenmesine, kurum tarafından doğrulanmasına ve saklanmasına açık rıza gösteriyorum.
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── ANA BİLEŞEN ────────────────────────────────────────────────────────────
export default function BasvuruSihirbazi({ adayId, onKaydet }: { adayId: string; onKaydet?: () => void }) {
  const profil = useStore(s => s.profiller.find(p => p.adayId === adayId)) ?? null;
  const [step, setStep] = useState(0);
  const [ozetGoster, setOzetGoster] = useState(false);

  // İlk açılışta profil yoksa oluştur
  useEffect(() => {
    if (!profil) actions.profilKaydet(adayId, {});
  }, [adayId, profil]);

  const p = profil ?? {
    adayId,
    kimlik: { uyruk: "T.C." as Uyruk, kimlikNo: adayId, ad: "", soyad: "", dogumTarihi: "", medeniHal: "" as "", cinsiyet: "Erkek" as const },
    sehitGazi: { varMi: false },
    egitimler: [], sinavlar: [],
    sorumlulukBeyani: false, kvkkOnayi: false,
    guncelleme: new Date().toISOString(),
  } satisfies BasvuruProfili;

  const patch = (px: Partial<BasvuruProfili>) => actions.profilKaydet(adayId, px);

  const eksikAdimlar = useMemo(() => {
    const eksik: string[] = [];
    if (!p.kimlik.ad || !p.kimlik.soyad || !p.kimlik.medeniHal || !p.kimlik.vesikalikFoto) eksik.push("Kimlik Bilgileri");
    if (p.egitimler.length === 0) eksik.push("Eğitim Bilgileri");
    if (p.sinavlar.length === 0)  eksik.push("Sınav Bilgileri");
    if (!p.adres || !p.adres.il || !p.adres.ilce || !p.adres.binaNo || !p.adres.daireNo) eksik.push("Adres Bilgileri");
    if (!p.iletisim || !p.iletisim.gsm || !p.iletisim.eposta || !p.iletisim.yakinTelefon1) eksik.push("İletişim Bilgileri");
    return eksik;
  }, [p]);

  const tamam = eksikAdimlar.length === 0 && p.sorumlulukBeyani && p.kvkkOnayi;

  if (ozetGoster) {
    return (
      <div className="bg-white border border-[#DDDDDD] rounded shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDDDDD] bg-[#F5F5F5]">
          <h2 className="text-[15px] font-bold text-[#333]">Bilgilerim — Özet</h2>
          <button className={btnDrk} onClick={() => setOzetGoster(false)}>Adımlara Dön</button>
        </div>
        <Ozet p={p} onChange={patch} onEdit={i => { setStep(i); setOzetGoster(false); }} />
        <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-between">
          <div className="text-[12px] text-[#888]">Son güncelleme: {new Date(p.guncelleme).toLocaleString("tr-TR")}</div>
          <button
            className={btnPri}
            style={{ background: tamam ? MSB.red : "#999" }}
            disabled={!tamam}
            onClick={() => { onKaydet?.(); alert("Başvuru bilgileriniz kaydedildi."); }}>
            <Check className="w-4 h-4" /> Bilgilerimi Kaydet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Adım göstergesi */}
      <div className="flex items-stretch overflow-x-auto border-b border-[#DDDDDD] relative">
        {STEPS.map((t, i) => {
          const active = i === step;
          const done   = i < step;
          return (
            <button key={i} onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] whitespace-nowrap border-b-2 transition-colors ${
                active ? "border-[#A82232] text-[#A82232] font-semibold" : "border-transparent text-[#888] hover:text-[#333]"
              }`}>
              <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                active ? "bg-[#A82232] text-white" : done ? "bg-[#7BA05B] text-white" : "bg-[#CCCCCC] text-white"
              }`}>{done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}</span>
              <span>{t}</span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 pl-4 pr-2 py-2">
          <button disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} className={btnLgt + " disabled:opacity-50"}>
            <ChevronLeft className="w-3.5 h-3.5" /> Geri
          </button>
          <button disabled={step === STEPS.length - 1} onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} className={btnDrk + " disabled:opacity-50"}>
            İleri <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Adım içerik */}
      <div className="border border-t-0 border-[#DDDDDD]">
        {step === 0 && <Adim1Kimlik p={p} onChange={patch} />}
        {step === 1 && <Adim2SehitGazi p={p} onChange={patch} />}
        {step === 2 && <Adim3Egitim p={p} />}
        {step === 3 && <Adim4Sinav p={p} />}
        {step === 4 && <Adim5Adres p={p} onChange={patch} />}
        {step === 5 && <Adim6Iletisim p={p} onChange={patch} />}
        {step === 6 && <Adim7Diger p={p} onChange={patch} />}
      </div>

      {/* Alt eylem çubuğu */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#EEE]">
        <div className="text-[12px] text-[#888]">
          {eksikAdimlar.length > 0
            ? <>Eksik adım(lar): <strong className="text-[#A82232]">{eksikAdimlar.join(", ")}</strong></>
            : <span className="text-[#5E7F42] font-semibold">Tüm zorunlu adımlar tamamlandı.</span>}
        </div>
        <div className="flex items-center gap-2">
          <button className={btnLgt} onClick={() => setOzetGoster(true)}>Özeti Gör</button>
          <button className={btnDrk} onClick={() => actions.profilKaydet(adayId, {})}>
            <Check className="w-3.5 h-3.5" /> Bu Adımı Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
