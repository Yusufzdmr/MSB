// Kesin Kayıt — asil kazanan adayın evrak yükleme, taahhütname, feragat ve
// barkodlu kayıt belgesi indirme akışı.

import { useState } from "react";
import {
  Upload, FileText, ShieldCheck, Check, X, AlertCircle, Download,
  Trash2, Award, XCircle, Clock,
} from "lucide-react";
// dosyaIndir yardımcısı zaten import edildi
import { MSB } from "../shared/theme";
import { useStore, actions } from "../shared/store";
import { dosyaIndir } from "../shared/ui";

const btnDrk = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const btnLgt = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";
const btnGrn = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-white bg-[#5E7F42] hover:bg-[#4A6634] rounded-[3px]";
const btnRed = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-white bg-[#A82232] hover:bg-[#8B1A25] rounded-[3px]";

const ZORUNLU_EVRAKLAR: { tip: string; ad: string }[] = [
  { tip: "diploma",         ad: "Diploma / Mezuniyet Belgesi" },
  { tip: "kimlik",          ad: "Kimlik Fotokopisi" },
  { tip: "adli_sicil",      ad: "Adli Sicil Kaydı" },
  { tip: "askerlik",        ad: "Askerlik Durum Belgesi" },
  { tip: "saglik_raporu",   ad: "Sağlık Kurul Raporu" },
];

export default function KesinKayit({ adayId }: { adayId: string }) {
  const basvurular = useStore(s => s.basvurular.filter(b =>
    b.adayId === adayId && (b.kesinKayitDurumu === "beklemede" || b.kesinKayitDurumu === "inceleniyor" || b.kesinKayitDurumu === "onaylandi" || b.kesinKayitDurumu === "reddedildi" || b.kesinKayitDurumu === "feragat" || b.kesinKayitDurumu === "sure_asimi")
  ));
  const ilanlar = useStore(s => s.ilanlar);
  const [aktifId, setAktifId] = useState<string | null>(basvurular[0]?.id ?? null);
  const [evraklar, setEvraklar] = useState<Record<string, { ad: string; boyutKB: number }>>({});
  const [taahhut, setTaahhut] = useState(false);
  const [feragatDialog, setFeragatDialog] = useState(false);
  const [feragatOnayMetin, setFeragatOnayMetin] = useState("");

  const aktif = basvurular.find(b => b.id === aktifId);
  const ilan = aktif ? ilanlar.find(i => i.id === aktif.ilanId) : null;

  if (basvurular.length === 0) {
    return (
      <div className="bg-white border border-[#DDD] rounded p-10 text-center">
        <Clock className="w-12 h-12 mx-auto text-[#CCC] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#555] mb-1">Kesin kayıt hakkınız bulunmuyor.</h3>
        <p className="text-[13px] text-[#888]">Yerleştirme sonuçları açıklandıktan sonra asil olan başvurularınız burada listelenir.</p>
      </div>
    );
  }

  const dosyaSec = (tip: string, ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; if (!f) return;
    setEvraklar(e => ({ ...e, [tip]: { ad: f.name, boyutKB: Math.round(f.size / 1024) } }));
  };
  const dosyaKaldir = (tip: string) => setEvraklar(e => { const x = { ...e }; delete x[tip]; return x; });

  const tumEvraklarTamam = ZORUNLU_EVRAKLAR.every(z => evraklar[z.tip]);
  const gonderilebilir = tumEvraklarTamam && taahhut;

  const gonder = () => {
    if (!aktif) return;
    const payload = ZORUNLU_EVRAKLAR.map(z => ({ tip: z.tip, ad: evraklar[z.tip].ad, boyutKB: evraklar[z.tip].boyutKB }));
    actions.kesinKayitTamamla(aktif.id, payload, true);
    alert("Kesin kayıt başvurunuz admin onayına gönderildi.");
  };

  const feragatEt = () => {
    if (!aktif) return;
    if (feragatOnayMetin !== "FERAGAT EDİYORUM") { alert("Onay metni tam olarak 'FERAGAT EDİYORUM' yazılmalıdır."); return; }
    actions.kesinKayitFeragat(aktif.id);
    setFeragatDialog(false);
    setFeragatOnayMetin("");
    alert("Feragat işleminiz tamamlandı. Yedek sıradaki adaya sıra devredildi.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
      {/* Sol: Başvuru seçici */}
      <div className="bg-white border border-[#DDD] rounded overflow-hidden">
        <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase">Kesin Kayıt Başvurularım</div>
        <div className="divide-y divide-[#EEE]">
          {basvurular.map(b => {
            const il = ilanlar.find(x => x.id === b.ilanId);
            const at = aktifId === b.id;
            return (
              <button key={b.id} onClick={() => { setAktifId(b.id); setEvraklar({}); setTaahhut(false); }}
                className={`w-full text-left px-3 py-2.5 ${at ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                <div className="text-[12.5px] font-bold text-[#333] line-clamp-2 mb-1">{il?.baslik}</div>
                {b.kesinKayitDurumu === "beklemede" && <span className="px-2 py-0.5 bg-[#FCF3E3] text-[#C87E27] text-[10px] font-bold rounded uppercase">Bekleniyor</span>}
                {b.kesinKayitDurumu === "inceleniyor" && <span className="px-2 py-0.5 bg-[#DBEAF5] text-[#1F5372] text-[10px] font-bold rounded uppercase">İnceleniyor</span>}
                {b.kesinKayitDurumu === "onaylandi" && <span className="px-2 py-0.5 bg-[#EEF6E8] text-[#5E7F42] text-[10px] font-bold rounded uppercase">Onaylandı</span>}
                {b.kesinKayitDurumu === "reddedildi" && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] text-[10px] font-bold rounded uppercase">Reddedildi</span>}
                {b.kesinKayitDurumu === "feragat" && <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#666] text-[10px] font-bold rounded uppercase">Feragat</span>}
                {b.kesinKayitDurumu === "sure_asimi" && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] text-[10px] font-bold rounded uppercase">Süre Aşımı</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ: İçerik */}
      <div className="bg-white border border-[#DDD] rounded">
        {!aktif || !ilan ? (
          <div className="p-10 text-center text-[#888]">Solda bir başvuru seçin.</div>
        ) : (
          <>
            <div className="px-5 py-4 border-b bg-[#FAFAFA]">
              <h2 className="text-[16px] font-bold text-[#333]">{ilan.baslik}</h2>
              <div className="text-[12px] text-[#666] mt-1">
                Kayıt Bitiş: <strong>{ilan.kesinKayitBitis ?? "—"}</strong> ·
                Bugün itibariyle {ilan.kesinKayitBitis ? Math.max(0, Math.ceil((new Date(ilan.kesinKayitBitis).getTime() - Date.now()) / 86400000)) : "—"} gün kaldı.
              </div>
            </div>

            {aktif.kesinKayitDurumu === "onaylandi" ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#EEF6E8] border-2 border-[#7BA05B] mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-[#5E7F42]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#5E7F42] mb-2">Kesin Kaydınız Onaylandı</h3>
                <p className="text-[13px] text-[#555] mb-4 max-w-md mx-auto">
                  Tebrikler! Kesin Kayıt Kabul Belgeniz sistemde hazırdır. Barkodlu + QR kodlu resmi PDF olarak indirebilirsiniz.
                </p>
                <button className={btnDrk + " mx-auto"} onClick={() => {
                  const kod = `KKB-${aktif.adayId.slice(0, 5)}-${aktif.ilanId.slice(-6)}`;
                  dosyaIndir(
                    `T.C. MİLLÎ SAVUNMA BAKANLIĞI\nKESİN KAYIT KABUL BELGESİ\n\nİlan: ${ilan.baslik}\nTCKN: ${aktif.adayId.slice(0, 3)}******${aktif.adayId.slice(-2)}\nKayıt Kodu: ${kod}\nOnay Tarihi: ${aktif.kesinKayitOnayTarihi ? new Date(aktif.kesinKayitOnayTarihi).toLocaleDateString("tr-TR") : "-"}\n\nBu belge resmi barkodlu / karekodlu Kesin Kayıt Kabul Belgesidir.\nKurumun fiziki yerleşkesine gidip veya uzaktan eğitim/görev başlangıcına adım atabilirsiniz.\n`,
                    `${aktif.kayitBelgesiPdf ?? "KKB.txt"}`
                  );
                }}>
                  <Download className="w-3.5 h-3.5" /> Kesin Kayıt Kabul Belgesi (PDF) İndir
                </button>
              </div>
            ) : aktif.kesinKayitDurumu === "reddedildi" ? (
              <div className="p-6">
                <div className="p-4 rounded border-l-4 mb-4" style={{ background: "#FBECEE", borderColor: "#E8B5BB", borderLeftColor: MSB.red, color: MSB.red }}>
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-[14px] mb-1">Kesin Kayıt Reddedildi</div>
                      <div className="text-[12.5px]">{aktif.kesinKayitRedNedeni ?? "Eksik veya hatalı evrak. Lütfen düzeltip yeniden yükleyin."}</div>
                    </div>
                  </div>
                </div>
                <button className={btnDrk} onClick={() => { actions.kesinKayitReset(aktif.id); setEvraklar({}); setTaahhut(false); }}>Belgeleri Düzelt ve Yeniden Yükle</button>
              </div>
            ) : aktif.kesinKayitDurumu === "feragat" ? (
              <div className="p-8 text-center">
                <XCircle className="w-12 h-12 mx-auto text-[#AAA] mb-2" />
                <div className="text-[14px] text-[#666] mb-4">Bu program için kayıt hakkınızdan feragat ettiniz. Bu işlem geri alınamaz.</div>
                <button className={btnDrk + " mx-auto"} onClick={() => {
                  const kod = `FRG-${aktif.adayId.slice(0, 5)}-${aktif.ilanId.slice(-6)}`;
                  dosyaIndir(
                    `T.C. MİLLÎ SAVUNMA BAKANLIĞI\nFERAGAT DİLEKÇESİ\n\nİlan: ${ilan.baslik}\nTCKN: ${aktif.adayId.slice(0, 3)}******${aktif.adayId.slice(-2)}\nFeragat Kodu: ${kod}\nTarih: ${new Date().toLocaleString("tr-TR")}\n\nBen, ${aktif.adayId} kimlik numaralı aday, ${ilan.baslik} programı için yerleşme hakkımdan KENDİ İRADEM İLE ve KALICI olarak feragat ettiğimi beyan ederim.\n\nBu belge resmi barkodlu / karekodlu Feragat Dilekçesidir. Dijital imzam kayıt altına alınmıştır.\n\nKontenjanım yedek listesindeki bir sonraki adaya otomatik olarak devredilmiştir.\n`,
                    `feragat-${kod}.txt`
                  );
                }}>
                  <Download className="w-3.5 h-3.5" /> Feragat Dilekçesi (Barkodlu PDF) İndir
                </button>
              </div>
            ) : aktif.kesinKayitDurumu === "sure_asimi" ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-[#A82232] mb-2" />
                <div className="text-[14px] text-[#A82232] font-bold mb-1">Süre Aşımı / Hak Kaybı</div>
                <p className="text-[13px] text-[#666]">Tanınan süre içinde kesin kayıt işlemini tamamlamadığınız için hakkınız düşmüştür. Kontenjanınız yedeğe devredildi.</p>
              </div>
            ) : aktif.kesinKayitDurumu === "inceleniyor" ? (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-[#C87E27] mb-2" />
                <h3 className="text-[16px] font-bold text-[#C87E27] mb-1">Admin Onayı Bekleniyor</h3>
                <p className="text-[13px] text-[#666]">Yüklediğiniz evraklar admin tarafından incelenmektedir. Sonuç Mesajlarım sayfanıza bildirim olarak düşecektir.</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Uyarı */}
                <div className="p-3 rounded border" style={{ background: MSB.warnBg, borderColor: MSB.warnBrd, color: MSB.orange }}>
                  <div className="flex items-start gap-2 text-[12.5px]">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Zorunlu Evraklar</strong>: Aşağıdaki tüm belgeler yüklenmeden ve taahhütname onaylanmadan kesin kayıt başvurunuz tamamlanamaz.
                      Süresi içinde tamamlamayan adayın hakkı otomatik yedeğe devredilir.
                    </div>
                  </div>
                </div>

                {/* Evrak yükleme */}
                <div className="space-y-2">
                  {ZORUNLU_EVRAKLAR.map(z => {
                    const y = evraklar[z.tip];
                    return (
                      <div key={z.tip} className="flex items-center gap-3 p-3 border border-[#EEE] rounded bg-white">
                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0">
                          {y ? <Check className="w-4 h-4 text-[#5E7F42]" strokeWidth={3} /> : <FileText className="w-4 h-4 text-[#888]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[#333]">{z.ad}</div>
                          {y && <div className="text-[11px] text-[#666]">{y.ad} · {y.boyutKB} KB</div>}
                        </div>
                        {y ? (
                          <button onClick={() => dosyaKaldir(z.tip)} className="text-[#A82232] p-1 hover:bg-[#FBECEE] rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                        ) : (
                          <label className={btnLgt + " cursor-pointer"}>
                            <Upload className="w-3.5 h-3.5" /> PDF Seç
                            <input type="file" accept="application/pdf" className="hidden" onChange={e => dosyaSec(z.tip, e)} />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Taahhütname */}
                <label className="flex items-start gap-2.5 p-3 bg-[#F8F8F8] border border-[#DDD] rounded cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#A82232]" checked={taahhut} onChange={e => setTaahhut(e.target.checked)} />
                  <span className="text-[12.5px] text-[#333] leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-[#5E7F42]" />
                    <strong>Taahhütname:</strong> Verdiğim bilgilerin ve yüklediğim belgelerin doğruluğunu, hakkımdan feragat etmediğimi, aksinin tespiti halinde yerleştirmemin iptal edileceğini ve hukuki sorumluluğun tarafıma ait olacağını dijital olarak beyan ve taahhüt ederim.
                  </span>
                </label>

                {/* Aksiyonlar */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#EEE]">
                  <button className={btnGrn} onClick={gonder} disabled={!gonderilebilir} style={!gonderilebilir ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                    <Check className="w-3.5 h-3.5" /> Kesin Kayıt Başvurusunu Tamamla
                  </button>
                  <button className={btnRed + " ml-auto"} onClick={() => setFeragatDialog(true)}>
                    <XCircle className="w-3.5 h-3.5" /> Kesin Kayıt Hakkımdan Feragat Et
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Feragat onay modal */}
      {feragatDialog && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFeragatDialog(false)} />
          <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-lg">
            <header className="px-5 h-[52px] border-b flex items-center gap-3" style={{ background: MSB.red, color: "#fff" }}>
              <AlertCircle className="w-4 h-4" />
              <h2 className="text-[14.5px] font-bold tracking-normal flex-1">Kesin Kayıt Feragat Onayı</h2>
              <button onClick={() => setFeragatDialog(false)} className="text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </header>
            <div className="p-5 space-y-3">
              <div className="p-3 rounded border" style={{ background: "#FBECEE", borderColor: "#E8B5BB", color: MSB.red }}>
                <div className="text-[13px] font-bold mb-1">⚠️ Bu işlem GERİ ALINAMAZ.</div>
                <div className="text-[12.5px]">Bu programa yerleşme hakkınızdan kalıcı olarak vazgeçmiş olacaksınız. Kontenjanınız otomatik olarak yedek listesindeki bir sonraki adaya devredilecektir.</div>
              </div>
              <div className="p-3 bg-[#F5F5F5] border border-[#DDD] rounded text-[12.5px]">
                Sistem, onayınızla birlikte resmi <strong>Feragat Dilekçesi</strong> (barkodlu PDF) üretecektir. Dijital imzanız kayıt altına alınacaktır.
              </div>
              <label className="block">
                <span className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase tracking-wide">Onaylamak için aşağıya <span className="text-[#A82232]">FERAGAT EDİYORUM</span> yazın:</span>
                <input className="w-full h-[36px] px-3 text-[13px] bg-white border-2 border-[#A82232] rounded focus:outline-none uppercase"
                  value={feragatOnayMetin} onChange={e => setFeragatOnayMetin(e.target.value.toUpperCase())}
                  placeholder="FERAGAT EDİYORUM" />
              </label>
            </div>
            <footer className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2">
              <button className={btnLgt} onClick={() => setFeragatDialog(false)}>Vazgeç</button>
              <button className={btnRed} onClick={feragatEt}><XCircle className="w-3.5 h-3.5" /> Evet, Feragat Ediyorum</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
