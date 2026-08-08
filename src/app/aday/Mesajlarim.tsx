// Aday Mesajlarım — sistem bildirimleri (renk kodlu), okundu/okunmadı, detay + tebligat.

import { useState, useMemo } from "react";
import {
  Bell, Info, AlertCircle, CheckCircle2, XCircle, Star, Search,
  Filter, Check, Download, Trash2, FileText,
} from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore, actions, type Mesaj, type MesajTur } from "../shared/store";

const btnLgt = "inline-flex items-center gap-1.5 h-[30px] px-2.5 text-[12px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";
const btnDrk = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const inp = "w-full h-[34px] px-3 text-[13px] bg-white border border-[#CCC] rounded-[3px] focus:outline-none focus:border-[#A82232]";
const sel = inp + " appearance-none pr-8";

function turStyle(t?: MesajTur): { bg: string; brd: string; fg: string; Ic: React.ComponentType<{ className?: string }>; label: string } {
  switch (t) {
    case "basari": return { bg: "#EEF6E8", brd: "#C7DDB0", fg: "#5E7F42", Ic: CheckCircle2, label: "Başarı" };
    case "uyari":  return { bg: MSB.warnBg, brd: MSB.warnBrd, fg: MSB.orange, Ic: AlertCircle, label: "Uyarı" };
    case "hata":   return { bg: "#FBECEE", brd: "#E8B5BB", fg: MSB.red, Ic: XCircle, label: "Hata / Red" };
    case "sistem": return { bg: "#F5F5F5", brd: "#DDD", fg: "#555", Ic: Bell, label: "Sistem" };
    case "bilgi":
    default:       return { bg: MSB.infoBg, brd: MSB.infoBrd, fg: MSB.infoText, Ic: Info, label: "Bilgi" };
  }
}

export default function Mesajlarim({ adayId }: { adayId: string }) {
  const mesajlar = useStore(s => s.mesajlar.filter(m => m.alici === adayId));
  const ilanlar  = useStore(s => s.ilanlar);
  const [q, setQ]   = useState("");
  const [tur, setTur] = useState<MesajTur | "">("");
  const [sadeceOkunmamis, setSadeceOkunmamis] = useState(false);
  const [secili, setSecili] = useState<Mesaj | null>(null);

  const filtreli = useMemo(() => mesajlar
    .filter(m => !tur || m.tur === tur)
    .filter(m => !sadeceOkunmamis || !m.okundu)
    .filter(m => !q || m.konu.toLowerCase().includes(q.toLowerCase()) || m.icerik.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.tarih.localeCompare(a.tarih)),
  [mesajlar, tur, sadeceOkunmamis, q]);

  const okunmamis = mesajlar.filter(m => !m.okundu).length;

  const ac = (m: Mesaj) => {
    setSecili(m);
    if (!m.okundu) actions.mesajOkundu(m.id);
  };
  const hepsiniOku = () => mesajlar.filter(m => !m.okundu).forEach(m => actions.mesajOkundu(m.id));

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="bg-white border border-[#DDD] rounded p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
          <input className={inp + " pl-8"} placeholder="Konu veya içerikte ara..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className={sel + " w-[160px]"} value={tur} onChange={e => setTur(e.target.value as MesajTur | "")}>
          <option value="">Tüm türler</option>
          <option value="bilgi">Bilgi</option>
          <option value="basari">Başarı</option>
          <option value="uyari">Uyarı</option>
          <option value="hata">Hata / Red</option>
          <option value="sistem">Sistem</option>
        </select>
        <label className="flex items-center gap-1.5 text-[12.5px] cursor-pointer">
          <input type="checkbox" checked={sadeceOkunmamis} onChange={e => setSadeceOkunmamis(e.target.checked)} className="w-3.5 h-3.5 accent-[#A82232]" />
          Sadece okunmamış {okunmamis > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-[#A82232] text-white rounded-full">{okunmamis}</span>}
        </label>
        <button onClick={hepsiniOku} disabled={okunmamis === 0} className={btnLgt + " ml-auto disabled:opacity-50"}>
          <Check className="w-3 h-3" /> Tümünü Okundu İşaretle
        </button>
      </div>

      {/* Grid: sol liste + sağ detay */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-3">
        {/* Sol liste */}
        <div className="bg-white border border-[#DDD] rounded overflow-hidden">
          <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> Gelen Mesajlar ({filtreli.length})
          </div>
          <div className="max-h-[560px] overflow-y-auto divide-y divide-[#EEE]">
            {filtreli.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
                <div className="text-[13px] text-[#888] italic">Mesaj bulunamadı.</div>
              </div>
            ) : filtreli.map(m => {
              const t = turStyle(m.tur);
              const Ic = t.Ic;
              const aktif = secili?.id === m.id;
              return (
                <button key={m.id} onClick={() => ac(m)}
                  className={`w-full text-left px-3 py-2.5 transition-colors ${aktif ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.brd}` }}>
                      <Ic className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {!m.okundu && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: MSB.red }} />}
                        {m.onemli && <Star className="w-3 h-3 fill-current" style={{ color: MSB.orange }} />}
                        <div className={`text-[12.5px] truncate ${m.okundu ? "font-medium text-[#555]" : "font-bold text-[#333]"}`}>{m.konu}</div>
                      </div>
                      <div className="text-[11px] text-[#666] truncate max-w-full">{m.icerik.replace(/<[^>]*>/g, "").slice(0, 90)}</div>
                      <div className="text-[10.5px] text-[#888] mt-0.5">{new Date(m.tarih).toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ detay */}
        <div className="bg-white border border-[#DDD] rounded">
          {!secili ? (
            <div className="p-10 text-center text-[#888]">
              <Bell className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
              <div className="text-[13px]">Görüntülemek istediğiniz mesajı soldan seçin.</div>
            </div>
          ) : (() => {
            const t = turStyle(secili.tur);
            const Ic = t.Ic;
            const ilan = secili.ilanId ? ilanlar.find(i => i.id === secili.ilanId) : null;
            return (
              <>
                <div className="px-5 py-3.5 border-b flex items-start gap-3" style={{ background: t.bg, borderLeft: `4px solid ${t.fg}` }}>
                  <Ic className={"w-5 h-5 mt-0.5 flex-shrink-0"} />
                  <div className="flex-1 min-w-0" style={{ color: t.fg }}>
                    <div className="text-[10.5px] font-bold uppercase tracking-widest mb-0.5 opacity-80">{t.label}{secili.onemli && " · ÖNEMLİ"}</div>
                    <h2 className="text-[16px] font-bold leading-tight">{secili.konu}</h2>
                    <div className="text-[11.5px] mt-0.5 opacity-80">Gönderen: {secili.gonderen === "admin" ? "Sistem Yöneticisi" : secili.gonderen} · {new Date(secili.tarih).toLocaleString("tr-TR")}</div>
                    {ilan && <div className="text-[11.5px] mt-0.5 opacity-90">İlgili İlan: <strong>{ilan.baslik}</strong></div>}
                  </div>
                </div>

                <div className="p-5">
                  <div className="text-[13.5px] text-[#333] leading-relaxed prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: secili.icerik }} />
                </div>

                <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center gap-2 flex-wrap">
                  <button className={btnDrk} onClick={() => alert("Tebligat/sonuç belgesi PDF olarak indiriliyor (mock, QR kodlu).")}>
                    <Download className="w-3.5 h-3.5" /> Tebligat Belgesini İndir (PDF)
                  </button>
                  <button className={btnLgt + " ml-auto"} onClick={() => setSecili(null)}>Kapat</button>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
