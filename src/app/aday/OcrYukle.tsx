// Aday — OCR ile Belge Yükleme.
// PDF drag&drop, mock OCR animasyonu, çıkarılan alanların form'a doldurulması,
// kullanıcı onayı ile store'a kayıt.

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, Check, ArrowLeft, ScanLine, AlertCircle } from "lucide-react";
import { useStore, actions, type BelgeTipi } from "../shared/store";
import { MSB, FONT } from "../shared/theme";
import { Btn, Pill, Field, inputCls, selectCls, trTarih, Section } from "../shared/ui";

type Faz = "idle" | "yukleniyor" | "tarama" | "cikarim" | "onay" | "tamam" | "hata";

const belgeTipleri: { value: BelgeTipi; label: string }[] = [
  { value: "sinav_sonuc",   label: "Sınav Sonuç Belgesi (KPSS/YKS)" },
  { value: "diploma",       label: "Diploma" },
  { value: "transkript",    label: "Transkript" },
  { value: "kimlik",        label: "Kimlik Fotokopisi" },
  { value: "askerlik",      label: "Askerlik Durum Belgesi" },
  { value: "saglik_raporu", label: "Sağlık Raporu" },
  { value: "adli_sicil",    label: "Adli Sicil Kaydı" },
  { value: "sertifika",     label: "Mesleki Sertifika" },
  { value: "ehliyet",       label: "Sürücü Belgesi" },
  { value: "yabanci_dil",   label: "Yabancı Dil Belgesi (YDS/YÖKDİL/TOEFL)" },
  { value: "bonservis",     label: "Bonservis / İş Referansı" },
  { value: "diger",         label: "Diğer" },
];

export default function OcrYukle({ onBack }: { onBack: () => void }) {
  const store = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [tip, setTip] = useState<BelgeTipi>("sinav_sonuc");
  const [dosya, setDosya] = useState<File | null>(null);
  const [faz, setFaz] = useState<Faz>("idle");
  const [progress, setProgress] = useState(0);
  const [alanlar, setAlanlar] = useState<Record<string, string | number>>({});
  const [drag, setDrag] = useState(false);

  const adayId = store.oturum?.tc ?? store.adaylar[0]?.id ?? "18878273464";
  const aday = store.adaylar.find(a => a.id === adayId);
  const belgelerim = store.belgeler.filter(b => b.adayId === adayId);

  const handleFile = (f: File) => {
    if (!f) return;
    if (!/pdf$|image\//.test(f.type)) {
      setFaz("hata");
      setTimeout(() => setFaz("idle"), 2000);
      return;
    }
    setDosya(f);
    setFaz("yukleniyor");
    setProgress(0);
    // Mock: yükleme animasyonu
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(iv); setFaz("tarama"); startOcr(); return 100; }
        return p + 8;
      });
    }, 80);
  };

  const startOcr = () => {
    setProgress(0);
    const iv = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setFaz("cikarim");
          setTimeout(cikarimYap, 600);
          return 100;
        }
        return p + 5;
      });
    }, 60);
  };

  // Mock OCR sonucu — belge tipine göre gerçekçi alan çıkarımı simüle et
  const cikarimYap = () => {
    const alanlarMap: Record<BelgeTipi, Record<string, string | number>> = {
      sinav_sonuc: {
        "T.C. Kimlik No": aday?.id ?? "",
        "Ad Soyad": `${aday?.ad ?? ""} ${aday?.soyad ?? ""}`.trim(),
        "Sınav Adı": "KPSS-P3",
        "Sınav Yılı": 2026,
        "Puan": 82.4,
        "Sınav Tarihi": "14.07.2026",
      },
      diploma: {
        "Mezuniyet Okulu": aday?.mezuniyet ?? "Gazi Üniversitesi",
        "Bölüm": aday?.bolum ?? "Bilgisayar Mühendisliği",
        "Mezuniyet Tarihi": "22.06.2025",
        "Diploma Notu": aday?.ortalama ?? 3.42,
        "Diploma No": "20250622-4185",
      },
      transkript: {
        "Öğrenci No": "180404058",
        "Bölüm": aday?.bolum ?? "Bilgisayar Mühendisliği",
        "GNO": aday?.ortalama ?? 3.42,
        "Toplam Kredi": 240,
      },
      kimlik: {
        "T.C. Kimlik No": aday?.id ?? "",
        "Ad": aday?.ad ?? "",
        "Soyad": aday?.soyad ?? "",
        "Doğum Tarihi": aday?.dogumTarihi ?? "",
      },
      askerlik: {
        "T.C. Kimlik No": aday?.id ?? "",
        "Askerlik Durumu": "Tecilli",
        "Tecil Bitiş": "01.01.2028",
      },
      saglik_raporu: {
        "Rapor No": "SG-2026-14785",
        "Rapor Tarihi": "10.07.2026",
        "Sonuç": "Askerî hizmete elverişlidir",
      },
      adli_sicil: {
        "Belge Tarihi": "01.07.2026",
        "Kayıt Durumu": "Sabıkasızdır",
      },
      sertifika: {
        "Sertifika Adı": "AWS Cloud Practitioner",
        "Veren Kurum": "Amazon Web Services",
        "Sertifika Tarihi": "14.03.2026",
      },
      ehliyet: {
        "Sınıf": "B",
        "Veriliş Tarihi": "05.05.2024",
      },
      yabanci_dil: {
        "Sınav": "YDS",
        "Dil": "İngilizce",
        "Puan": 78,
        "Sınav Tarihi": "07.04.2026",
      },
      bonservis: {
        "Firma": "TechCo A.Ş.",
        "Görev": "Yazılım Geliştirici",
        "Çalışma Süresi": "18 ay",
      },
      diger: { "Belge Türü": "Diğer" },
    };
    setAlanlar(alanlarMap[tip]);
    setFaz("onay");
  };

  const kaydet = () => {
    if (!dosya) return;
    actions.belgeYukle({
      adayId, tip, ad: dosya.name, boyutKB: Math.round(dosya.size / 1024),
      ocrAlanlar: alanlar,
    });
    setFaz("tamam");
    setTimeout(() => {
      setFaz("idle"); setDosya(null); setAlanlar({}); setProgress(0);
    }, 2500);
  };

  const iptal = () => {
    setFaz("idle"); setDosya(null); setAlanlar({}); setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]" style={{ fontFamily: FONT, color: MSB.ink }}>
      <header className="h-[58px] bg-white border-b border-[#E0E0E0] flex items-center px-4 sticky top-0 z-30">
        <button onClick={onBack} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#555] hover:text-[#A82232]">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Aday Paneline Dön
        </button>
        <div className="mx-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: MSB.red }}>
            <ScanLine className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-extrabold" style={{ color: MSB.red }}>OCR Belge Yükleme</span>
        </div>
        <div className="text-[11px] text-[#888] font-semibold">
          {aday ? `${aday.ad} ${aday.soyad}` : "Aday"}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Bilgilendirme */}
          <div className="bg-[#E7F3F9] border border-[#B6DAEA] rounded-[3px] p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: MSB.infoText }} />
            <div className="text-[12px] leading-relaxed" style={{ color: MSB.infoText }}>
              PDF ya da JPEG/PNG formatında belgenizi yükleyin. Sistem <b>optik karakter tanıma (OCR)</b>
              ile belgedeki alanları otomatik çıkarır, siz onayladıktan sonra form alanlarınıza aktarır.
              En iyi sonuç için 300 DPI ve düz, gölgesiz taramalar önerilir.
            </div>
          </div>

          <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-4">
            <div className="mb-3">
              <Field label="Belge Türü" required>
                <select className={selectCls} value={tip} onChange={e => setTip(e.target.value as BelgeTipi)} disabled={faz !== "idle"}>
                  {belgeTipleri.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
            </div>

            {faz === "idle" && (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => {
                  e.preventDefault(); setDrag(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFile(f);
                }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-[4px] p-10 text-center cursor-pointer transition-colors ${
                  drag ? "border-[#A82232] bg-[#FBECEE]" : "border-[#CCC] hover:border-[#A82232] hover:bg-[#FBF7F7]"
                }`}>
                <UploadCloud className="w-12 h-12 mx-auto text-[#A82232]" strokeWidth={1.5} />
                <div className="text-[14px] font-bold mt-3" style={{ color: MSB.ink }}>Dosya sürükleyin veya seçin</div>
                <div className="text-[11.5px] text-[#888] mt-1">PDF, JPG, PNG · Maksimum 10 MB</div>
                <input ref={inputRef} type="file" accept="application/pdf,image/*"
                  className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            )}

            {faz === "hata" && (
              <div className="border-2 border-[#E30A17] rounded-[4px] p-10 text-center bg-[#FBECEE]">
                <AlertCircle className="w-10 h-10 mx-auto text-[#E30A17]" strokeWidth={2} />
                <div className="text-[13px] font-bold mt-2" style={{ color: MSB.red }}>Geçersiz dosya formatı</div>
                <div className="text-[11.5px] text-[#888] mt-1">Yalnızca PDF veya görsel dosyaları kabul edilir.</div>
              </div>
            )}

            {(faz === "yukleniyor" || faz === "tarama" || faz === "cikarim") && (
              <div className="bg-[#FAFAFA] border border-[#EEE] rounded-[3px] p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-[#666]" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">{dosya?.name}</div>
                    <div className="text-[11px] text-[#888]">{dosya ? (dosya.size / 1024).toFixed(1) : 0} KB</div>
                  </div>
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: MSB.red }} strokeWidth={2} />
                </div>
                <div className="h-2 bg-[#EEE] rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-100" style={{ background: MSB.red, width: `${progress}%` }} />
                </div>
                <div className="text-[11.5px] mt-2 font-semibold" style={{ color: MSB.red }}>
                  {faz === "yukleniyor" && `Yükleniyor… %${progress}`}
                  {faz === "tarama" && `Belge taranıyor (OCR)… %${progress}`}
                  {faz === "cikarim" && "Alanlar çıkarılıyor…"}
                </div>
              </div>
            )}

            {faz === "onay" && (
              <div className="border border-[#E0E0E0] rounded-[4px]">
                <div className="px-4 py-2.5 border-b border-[#EEE] flex items-center gap-2 bg-[#F9F9F9]">
                  <Check className="w-4 h-4" style={{ color: MSB.green }} />
                  <span className="text-[13px] font-bold">OCR Tamamlandı — Çıkarılan Alanları Onaylayın</span>
                  <Pill tone="success" >{Object.keys(alanlar).length} alan bulundu</Pill>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {Object.entries(alanlar).map(([k, v]) => (
                    <Field key={k} label={k}>
                      <input className={inputCls} value={String(v)}
                        onChange={e => setAlanlar({ ...alanlar, [k]: e.target.value })} />
                    </Field>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-[#EEE] bg-[#F9F9F9] flex items-center justify-between">
                  <div className="text-[11px] text-[#888]">
                    Yanlış tanınan alanları düzeltebilirsiniz. Onayladığınızda bilgiler formunuza kaydedilir.
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={iptal}>İptal</Btn>
                    <Btn variant="success" onClick={kaydet}><Check className="w-3.5 h-3.5" /> Onayla ve Kaydet</Btn>
                  </div>
                </div>
              </div>
            )}

            {faz === "tamam" && (
              <div className="border-2 border-[#7BA05B] bg-[#EEF6E8] rounded-[4px] p-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: MSB.green }}>
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
                <div className="text-[15px] font-extrabold mt-3" style={{ color: MSB.greenDark }}>Belge kaydedildi</div>
                <div className="text-[12px] text-[#666] mt-1">Yönetici onayı bekleniyor. Onay/red durumunu belgelerim listesinden takip edebilirsiniz.</div>
              </div>
            )}
          </div>
        </div>

        {/* Yüklenmiş belgelerim */}
        <div>
          <Section title="Belgelerim" dense>
            <div className="divide-y divide-[#EEE]">
              {belgelerim.length === 0 && (
                <div className="text-center text-[#888] py-6 text-[12px]">Henüz belge yüklenmedi.</div>
              )}
              {belgelerim.map(b => (
                <div key={b.id} className="flex items-start gap-2 px-3 py-2.5">
                  <FileText className="w-4 h-4 text-[#888] mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold truncate">{b.ad}</div>
                    <div className="text-[10.5px] text-[#888]">{trTarih(b.yuklemeTarihi)}</div>
                    {b.redGerekce && <div className="text-[10.5px] mt-0.5" style={{ color: MSB.red }}>{b.redGerekce}</div>}
                  </div>
                  <Pill tone={b.durum === "onaylandi" ? "success" : b.durum === "reddedildi" ? "danger" : "warn"}>
                    {b.durum === "onaylandi" ? "Onaylı" : b.durum === "reddedildi" ? "Red" : "Bekliyor"}
                  </Pill>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
