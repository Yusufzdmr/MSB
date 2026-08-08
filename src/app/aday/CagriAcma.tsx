// Çağrı Açma — çok adımlı destek talebi POP-UP + aday çağrı listesi.

import { useState } from "react";
import { X, Info, ChevronLeft, ArrowRight, Check, Upload, Image as ImageIcon, MessageSquare, Trash2, Search } from "lucide-react";
import { MSB } from "../shared/theme";
import { actions, useStore, ITIRAZ_KATEGORILERI, type CagriKategori, type Cagri } from "../shared/store";

const inp = "w-full h-[34px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20";
const inpDis = inp + " bg-[#F5F5F5] text-[#888] cursor-not-allowed";
const sel = inp + " appearance-none pr-8";
const ta = "w-full px-3 py-2 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] resize-y min-h-[100px] focus:outline-none focus:border-[#A82232]";
const lbl = "block text-[11.5px] font-bold text-[#555] mb-1 uppercase tracking-wide";
const req = <span className="text-[#A82232]">*</span>;
const btnDrk = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const btnLgt = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";

const KATEGORILER: { ad: CagriKategori; alt: string[] }[] = [
  { ad: "Başvuru ve Tercih İşlemleri", alt: [
    "Tercih listemi onaylayamıyorum / hata alıyorum.",
    "Yaptığım tercihleri güncellemek / silmek istiyorum.",
    "Tercih süresi uzatılacak mı?",
    "İlan detaylarında/kontenjanlarda hata olduğunu düşünüyorum.",
    'Başvurum "Onay Bekliyor" aşamasında çok uzun süredir bekliyor.',
  ]},
  { ad: "Sınav Sonuç ve Puan İşlemleri", alt: [
    "Sınav sonuç belgem OCR tarafından yanlış okundu / puanım hatalı yansıdı.",
    "Kontrol kodunu girdiğim halde sistem belgemi doğrulamıyor.",
    "Farklı bir sınav türünü (YKS, KPSS vb.) sisteme eklemek istiyorum.",
    "Sonuç belgem PDF formatında olmasına rağmen sistem hata veriyor.",
  ]},
  { ad: "Belge ve Evraklar Hakkında", alt: [
    "Şehit/Gazi yakınlık belgem reddedildi / Neden onaylanmadı?",
    "Bonservis (kurs/sertifika) belgem admin onayında takıldı.",
    "Eğitim durumu / Mezuniyet bilgilerimi güncelleyemiyorum.",
    "Eşdeğerlik / Denklik belgesi seçiminde hata yaptım, nasıl düzeltebilirim?",
  ]},
  { ad: "Teknik ve Hesap Sorunları", alt: [
    "TC Kimlik numaram veya şifremle sisteme giriş yapamıyorum.",
    "Şifremi unuttum / Sıfırlama bağlantısı gelmiyor.",
    "Profil bilgilerimdeki TC Kimlik Numarası hatalı (Değiştirme talebi).",
    "Sayfada gezinirken sistem hatası (500 Internal Error vb.) alıyorum.",
  ]},
  { ad: "Sonuç ve Çağrı Durumu", alt: [
    "Asil / Yedek yerleştirme sonucuma itiraz etmek istiyorum.",
    "Çağrı sonuç belgeme ve tebligat metnine ulaşamıyorum.",
    "Yerleştiğim kuruma gitmek için son kayıt/başvuru tarihi nedir?",
    "Yedek kontenjan sıralamamda güncelleme oldu mu?",
  ]},
  { ad: "Diğer / Genel Bilgi Talepleri", alt: [
    "İlan kılavuzunda belirtilmeyen bir husus hakkında bilgi almak istiyorum.",
    "Sistemin işleyişine yönelik öneri ve geri bildirim.",
  ]},
  { ad: "Öneri", alt: [] },
  { ad: "Görüş", alt: [] },
];

export function CagriAcmaPopup({ open, onClose, adayId, adayAd, adayEposta, adayTelefon }: {
  open: boolean; onClose: () => void;
  adayId: string; adayAd: string; adayEposta: string; adayTelefon: string;
}) {
  const ilanlar = useStore(s => s.ilanlar.filter(i => i.durum === "yayin" || i.durum === "kapali" || i.durum === "yerlestirildi"));
  const yerlestirmeler = useStore(s => s.yerlestirmeler.filter(y => y.yayinlandi));
  const [step, setStep] = useState<1 | 2>(1);
  const [kategori, setKategori] = useState<CagriKategori | "">("");
  const [altKategori, setAltKategori] = useState("");
  const [alimId, setAlimId] = useState("");
  const [eposta, setEposta] = useState(adayEposta);
  const [telefon, setTelefon] = useState(adayTelefon);
  const [aciklama, setAciklama] = useState("");
  const [gorselAdi, setGorselAdi] = useState("");

  if (!open) return null;

  const katObj = KATEGORILER.find(k => k.ad === kategori);
  const onerVeGorus = kategori === "Öneri" || kategori === "Görüş";
  const itirazMi = ITIRAZ_KATEGORILERI.includes(kategori as CagriKategori);
  // 72 saat itiraz süresi kontrolü — sonuç yayınlandıktan itibaren
  const secilenIlanYerlestirme = alimId ? yerlestirmeler.find(y => y.ilanId === alimId) : null;
  const sureAsimi = !!(itirazMi && secilenIlanYerlestirme && (Date.now() - new Date(secilenIlanYerlestirme.tarih).getTime()) > 72 * 3600 * 1000);
  const canStep1 = !!kategori && !!eposta && !!telefon && (onerVeGorus || (!!altKategori && !!alimId)) && !sureAsimi;
  const canFinish = canStep1 && !!aciklama.trim();

  const reset = () => {
    setStep(1); setKategori(""); setAltKategori(""); setAlimId("");
    setEposta(adayEposta); setTelefon(adayTelefon); setAciklama(""); setGorselAdi("");
  };

  const kaydet = () => {
    if (!canFinish || !kategori) return;
    const cagri = actions.cagriAc({
      adayId, ad: adayAd.split(" ")[0] ?? "", soyad: adayAd.split(" ").slice(1).join(" "),
      eposta, telefon,
      kategori, altKategori: onerVeGorus ? undefined : altKategori,
      alimId: onerVeGorus ? undefined : alimId, aciklama, gorselAdi: gorselAdi || undefined,
    });
    reset();
    onClose();
    alert(`Çağrınız oluşturuldu. Çağrı No: ${cagri.id}`);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-3xl max-h-[92vh] flex flex-col">
        <header className="flex items-center gap-3 px-5 h-[52px] border-b flex-shrink-0" style={{ background: MSB.red, color: "#fff" }}>
          <MessageSquare className="w-4 h-4" />
          <h2 className="text-[14px] font-extrabold uppercase tracking-wide">Yeni Çağrı Açma — Adım {step}/2</h2>
          <button onClick={onClose} className="ml-auto text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </header>

        {/* Step göstergesi */}
        <div className="flex border-b border-[#DDD] bg-[#FAFAFA]">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 flex items-center justify-center gap-2 py-2 text-[12.5px] font-semibold border-b-2 ${step === s ? "border-[#A82232] text-[#A82232]" : "border-transparent text-[#888]"}`}>
              <span className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-bold ${step === s ? "bg-[#A82232] text-white" : step > s ? "bg-[#7BA05B] text-white" : "bg-[#CCC] text-white"}`}>
                {step > s ? <Check className="w-3 h-3" strokeWidth={3} /> : s}
              </span>
              {s === 1 ? "Çağrı Başlangıcı" : "Çağrı Kaydetme"}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {step === 1 && (
            <>
              <div className="p-3 rounded border" style={{ background: MSB.infoBg, borderColor: MSB.infoBrd }}>
                <div className="flex items-start gap-2 text-[12px]" style={{ color: MSB.infoText }}>
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    Sorularınız ve istekleriniz projeyi beklentileriniz doğrultusunda yönlendirecektir.
                    Görüşünüzü yazmadan önce aradığınız konuyla ilgili bir soru-yanıt olup olmadığını kontrol ediniz.
                    Görüşlerin diğer kullanıcıların faydalanması için incelemeye açık olduğunu unutmayınız.
                    Görüş ve Öneri bölümünden <strong>HİZMETE ÖZEL</strong>'den yüksek gizlilik dereceli bilgi gönderilmeyecektir.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ad Soyad <span className="text-[#888] normal-case">(değiştirilemez)</span></label>
                  <input className={inpDis} value={adayAd} disabled />
                </div>
                <div>
                  <label className={lbl}>E-posta {req}</label>
                  <input type="email" className={inp} value={eposta} onChange={e => setEposta(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Telefon Numarası {req}</label>
                  <input className={inp} value={telefon} onChange={e => setTelefon(e.target.value)} />
                </div>
                <div>
                  <label className={lbl}>Çağrı Kategorisi {req}</label>
                  <select className={sel} value={kategori} onChange={e => { setKategori(e.target.value as CagriKategori); setAltKategori(""); }}>
                    <option value="">Seçiniz</option>
                    {KATEGORILER.map(k => <option key={k.ad}>{k.ad}</option>)}
                  </select>
                </div>
              </div>

              {kategori && !onerVeGorus && (
                <>
                  <div>
                    <label className={lbl}>Çağrı Konusu {req}</label>
                    <select className={sel} value={altKategori} onChange={e => setAltKategori(e.target.value)}>
                      <option value="">Seçiniz</option>
                      {katObj?.alt.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>İlgili Alım {req}</label>
                    <select className={sel} value={alimId} onChange={e => setAlimId(e.target.value)}>
                      <option value="">Seçiniz</option>
                      {ilanlar.map(i => <option key={i.id} value={i.id}>{i.baslik}</option>)}
                    </select>
                  </div>
                  {sureAsimi && (
                    <div className="p-3 rounded border md:col-span-2" style={{ background: "#FBECEE", borderColor: "#E8B5BB", color: MSB.red }}>
                      <div className="flex items-start gap-2 text-[12.5px]">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>⏱ İtiraz süresi dolmuştur.</strong> Sonuç yayımlandıktan sonraki <strong>72 saat</strong> içinde bu kategoride çağrı açabilirdiniz. Bu süre aşıldığı için yeni itiraz kaydı oluşturulamaz.
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {onerVeGorus && (
                <div className="p-3 rounded border" style={{ background: MSB.warnBg, borderColor: MSB.warnBrd, color: MSB.orange }}>
                  <div className="flex items-start gap-2 text-[12px]">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>Öneri/Görüş kategorilerinde alt kategori ve alım seçimi yapılmasına gerek yoktur. Doğrudan bir sonraki adıma geçiniz.</div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className={lbl}>Açıklama {req}</label>
                <textarea className={ta} value={aciklama} onChange={e => setAciklama(e.target.value)}
                  placeholder="Talebinizi detaylı bir şekilde yazınız..." />
                <div className="text-[11px] text-[#888] mt-1">{aciklama.length} karakter</div>
              </div>

              <div>
                <label className={lbl}>Görsel Ek <span className="text-[#888] normal-case">(opsiyonel)</span></label>
                {gorselAdi ? (
                  <div className="flex items-center gap-2 p-2 bg-[#F5F5F5] border border-[#DDD] rounded text-[13px]">
                    <ImageIcon className="w-4 h-4 text-[#A82232]" />
                    <span className="flex-1 truncate">{gorselAdi}</span>
                    <button onClick={() => setGorselAdi("")} className="text-[#A82232] hover:underline text-[11.5px]">Kaldır</button>
                  </div>
                ) : (
                  <label className={btnLgt + " cursor-pointer"}>
                    <Upload className="w-3.5 h-3.5" /> Görsel Ekle
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setGorselAdi(f.name); }} />
                  </label>
                )}
              </div>

              {/* Önizleme */}
              <div className="mt-4 border border-[#DDD] rounded bg-[#FAFAFA]">
                <div className="px-3 py-2 bg-[#F0F0F0] border-b border-[#DDD] text-[11.5px] font-bold text-[#555] uppercase tracking-wide">Önizleme</div>
                <div className="p-3 text-[12.5px] space-y-1.5">
                  <div><span className="text-[#666]">Kategori: </span><strong>{kategori}</strong></div>
                  {!onerVeGorus && <div><span className="text-[#666]">Konu: </span>{altKategori}</div>}
                  {!onerVeGorus && alimId && (
                    <div><span className="text-[#666]">Alım: </span>{ilanlar.find(i => i.id === alimId)?.baslik}</div>
                  )}
                  <div><span className="text-[#666]">Ad Soyad: </span>{adayAd}</div>
                  <div><span className="text-[#666]">E-posta: </span>{eposta}</div>
                  <div><span className="text-[#666]">Telefon: </span>{telefon}</div>
                  <div className="pt-2 mt-2 border-t border-[#DDD]"><span className="text-[#666]">Açıklama: </span>{aciklama || <em className="text-[#AAA]">boş</em>}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-between gap-2 flex-shrink-0">
          <button className={btnLgt} onClick={onClose}>Vazgeç</button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button className={btnLgt} onClick={() => setStep(1)}>
                <ChevronLeft className="w-3.5 h-3.5" /> Geri
              </button>
            )}
            {step === 1 && (
              <button className={btnDrk} onClick={() => setStep(2)} disabled={!canStep1} style={!canStep1 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                İleri <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {step === 2 && (
              <button className={btnDrk} style={{ background: MSB.red, borderColor: MSB.redDark }} onClick={kaydet} disabled={!canFinish}>
                <Check className="w-3.5 h-3.5" /> Kaydet
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── Aday çağrı listesi (Çağrı Takip sayfası içeriği) ────────────────────────
export function CagriListesi({ adayId, adayAd, adayEposta, adayTelefon }: {
  adayId: string; adayAd: string; adayEposta: string; adayTelefon: string;
}) {
  const cagrilar = useStore(s => s.cagrilar.filter(c => c.adayId === adayId));
  const [open, setOpen] = useState(false);
  const [secili, setSecili] = useState<Cagri | null>(null);
  const [durum, setDurum] = useState("");
  const [q, setQ] = useState("");

  const filtreli = cagrilar.filter(c =>
    (durum === "" || c.durum === durum) &&
    (q === "" || c.id.toLowerCase().includes(q.toLowerCase()) ||
      c.aciklama.toLowerCase().includes(q.toLowerCase()) ||
      c.kategori.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      {/* Filtre + Yeni Çağrı butonu */}
      <div className="bg-white border border-[#DDDDDD] rounded mb-4 p-3.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#888]" />
          <input className={inp + " max-w-md"} placeholder="Çağrı no veya konu ara..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className={sel + " w-auto"} value={durum} onChange={e => setDurum(e.target.value)}>
          <option value="">Tüm Durumlar</option>
          <option value="acik">Açık</option>
          <option value="islemde">İşlemde</option>
          <option value="yanitlandi">Yanıtlandı</option>
          <option value="kapali">Kapalı</option>
        </select>
        <button className={btnDrk} style={{ background: MSB.red, borderColor: MSB.redDark }} onClick={() => setOpen(true)}>
          <MessageSquare className="w-3.5 h-3.5" /> Yeni Çağrı Aç
        </button>
      </div>

      {/* Liste */}
      <div className="bg-white border border-[#DDDDDD] rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#DDD] bg-[#F5F5F5]">
          <h3 className="text-[13.5px] font-semibold text-[#555]">Açtığım Çağrılar ({filtreli.length})</h3>
        </div>
        {filtreli.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#888] italic">Henüz açılmış çağrı bulunmuyor.</div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ background: MSB.redTable, color: "#fff" }}>
                <th className="px-3 py-2 text-left font-semibold uppercase text-[10.5px] tracking-wide w-[120px]">Çağrı No</th>
                <th className="px-3 py-2 text-left font-semibold uppercase text-[10.5px] tracking-wide">Kategori / Konu</th>
                <th className="px-3 py-2 text-left font-semibold uppercase text-[10.5px] tracking-wide w-[110px]">Tarih</th>
                <th className="px-3 py-2 text-left font-semibold uppercase text-[10.5px] tracking-wide w-[110px]">Durum</th>
                <th className="px-3 py-2 w-[90px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtreli.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                  <td className="px-3 py-2 font-semibold tabular-nums text-[#A82232]">{c.id}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-[#333]">{c.kategori}</div>
                    {c.altKategori && <div className="text-[11.5px] text-[#666] truncate max-w-[400px]">{c.altKategori}</div>}
                  </td>
                  <td className="px-3 py-2 text-[#666]">{new Date(c.olusturma).toLocaleDateString("tr-TR")}</td>
                  <td className="px-3 py-2">
                    {c.durum === "acik" && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] text-[10.5px] font-bold rounded">AÇIK</span>}
                    {c.durum === "islemde" && <span className="px-2 py-0.5 bg-[#FCF3E3] text-[#C87E27] text-[10.5px] font-bold rounded">İŞLEMDE</span>}
                    {c.durum === "yanitlandi" && <span className="px-2 py-0.5 bg-[#DBEAF5] text-[#1F5372] text-[10.5px] font-bold rounded">YANITLANDI</span>}
                    {c.durum === "kapali" && <span className="px-2 py-0.5 bg-[#EEF6E8] text-[#5E7F42] text-[10.5px] font-bold rounded">KAPALI</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => setSecili(c)}>Detay</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CagriAcmaPopup open={open} onClose={() => setOpen(false)}
        adayId={adayId} adayAd={adayAd} adayEposta={adayEposta} adayTelefon={adayTelefon} />

      {/* Çağrı detay */}
      {secili && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSecili(null)} />
          <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-2xl max-h-[92vh] flex flex-col">
            <header className="flex items-center gap-3 px-5 h-[52px] border-b flex-shrink-0" style={{ background: MSB.red, color: "#fff" }}>
              <MessageSquare className="w-4 h-4" />
              <h2 className="text-[14px] font-extrabold uppercase tracking-wide">Çağrı: {secili.id}</h2>
              <button onClick={() => setSecili(null)} className="ml-auto text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </header>
            <div className="flex-1 overflow-auto p-5 space-y-3">
              <div className="text-[13px]"><span className="text-[#666]">Kategori: </span><strong>{secili.kategori}</strong></div>
              {secili.altKategori && <div className="text-[12.5px]"><span className="text-[#666]">Konu: </span>{secili.altKategori}</div>}
              <div className="border-t border-[#EEE] pt-3">
                <h4 className="text-[12px] font-bold text-[#555] uppercase mb-2">Yazışmalar</h4>
                <div className="space-y-2">
                  {secili.mesajlar.map((m, i) => (
                    <div key={i} className={`p-2.5 rounded text-[12.5px] ${m.gonderen === "aday" ? "bg-[#F5F5F5] ml-8" : "bg-[#FBECEE] mr-8 border border-[#E8B5BB]"}`}>
                      <div className="text-[10.5px] font-bold text-[#666] uppercase mb-1">{m.gonderen === "aday" ? "Ben" : "Sistem Yöneticisi"} · {new Date(m.tarih).toLocaleString("tr-TR")}</div>
                      <div>{m.metin}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CagriAcmaPopup;
