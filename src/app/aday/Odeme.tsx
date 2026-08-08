// Aday Ödeme — IBAN, referans kodu, dekont yükleme, statü takibi.

import { useState, useMemo } from "react";
import { Upload, FileText, Copy, Check, X, AlertCircle, CreditCard, Info } from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore, actions } from "../shared/store";

const btnDrk = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const btnLgt = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";
const btnGrn = "inline-flex items-center gap-2 h-[34px] px-3.5 text-[13px] font-semibold text-white bg-[#5E7F42] hover:bg-[#4A6634] rounded-[3px]";

// Referans kod üretici (aday × ilan)
function refKod(adayId: string, ilanId: string): string {
  const hash = (adayId + ilanId).split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  return `TRK-${new Date().getFullYear()}-${Math.abs(hash % 100000).toString().padStart(5, "0")}`;
}

export default function Odeme({ adayId }: { adayId: string }) {
  const basvurular = useStore(s => s.basvurular.filter(b => b.adayId === adayId));
  const ilanlar = useStore(s => s.ilanlar);
  const [aktifId, setAktifId] = useState<string | null>(basvurular[0]?.id ?? null);
  const [dekontAdi, setDekontAdi] = useState("");
  const [kopyalandi, setKopyalandi] = useState<string | null>(null);

  const aktif = basvurular.find(b => b.id === aktifId);
  const ilan = aktif ? ilanlar.find(i => i.id === aktif.ilanId) : null;

  const odemeGereken = useMemo(() => basvurular.filter(b => {
    const il = ilanlar.find(i => i.id === b.ilanId);
    return il?.odemeKurali && il.odemeKurali !== "yok" && il.ucretTutari && b.odemeDurumu !== "alindi" && b.odemeDurumu !== "iade_edildi";
  }), [basvurular, ilanlar]);

  const kopyala = (t: string, ne: string) => {
    navigator.clipboard.writeText(t);
    setKopyalandi(ne);
    setTimeout(() => setKopyalandi(null), 1500);
  };

  const gonder = () => {
    if (!aktif || !ilan) return;
    if (!dekontAdi) return alert("Dekont dosyası zorunludur.");
    actions.odemeBildir(aktif.id, dekontAdi, refKod(aktif.adayId, aktif.ilanId));
    setDekontAdi("");
    alert("Ödeme bildiriminiz sisteme iletildi. Admin doğrulaması sonrası 'Ödeme Alındı' statüsüne geçecektir.");
  };

  if (odemeGereken.length === 0) {
    return (
      <div className="bg-white border border-[#DDD] rounded p-10 text-center">
        <CreditCard className="w-12 h-12 mx-auto text-[#CCC] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#555] mb-1">Ödenmesi gereken bir başvuru bulunmuyor.</h3>
        <p className="text-[13px] text-[#888]">Ücretli ilanlarda tercih kayıt sonrası ödeme talebi burada görünür.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      {/* Sol: ödeme gereken başvurular */}
      <div className="bg-white border border-[#DDD] rounded overflow-hidden">
        <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase">Ödeme Bekleyen</div>
        <div className="divide-y divide-[#EEE]">
          {odemeGereken.map(b => {
            const il = ilanlar.find(x => x.id === b.ilanId);
            const at = aktifId === b.id;
            return (
              <button key={b.id} onClick={() => { setAktifId(b.id); setDekontAdi(""); }}
                className={`w-full text-left px-3 py-2.5 ${at ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                <div className="text-[12.5px] font-bold text-[#333] line-clamp-2 mb-0.5">{il?.baslik}</div>
                <div className="flex items-center gap-1.5 text-[10.5px]">
                  <span className="text-[#A82232] font-bold">{il?.ucretTutari} TL</span>
                  {b.odemeDurumu === "bekleniyor" && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] font-bold rounded uppercase">Bekleniyor</span>}
                  {b.odemeDurumu === "inceleniyor" && <span className="px-2 py-0.5 bg-[#FCF3E3] text-[#C87E27] font-bold rounded uppercase">İnceleniyor</span>}
                  {!b.odemeDurumu && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] font-bold rounded uppercase">Bekleniyor</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ: Ödeme ekranı */}
      <div className="bg-white border border-[#DDD] rounded">
        {!aktif || !ilan ? (
          <div className="p-10 text-center text-[#888]">Solda ödemek istediğiniz başvuruyu seçin.</div>
        ) : (
          <>
            <div className="px-5 py-4 border-b bg-[#FAFAFA]">
              <h2 className="text-[16px] font-bold text-[#333]">{ilan.baslik}</h2>
              <div className="text-[12px] text-[#666] mt-1">
                Ödenecek Tutar: <strong className="text-[16px] text-[#A82232]">{ilan.ucretTutari} TL</strong>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Uyarı */}
              <div className="p-3 rounded border" style={{ background: MSB.infoBg, borderColor: MSB.infoBrd, color: MSB.infoText }}>
                <div className="flex items-start gap-2 text-[12.5px]">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    EFT/Havale yaparken açıklama kısmına <strong>Referans Kodunuzu</strong> mutlaka yazınız. Kod olmadan ödemeniz eşleştirilemez.
                    <br />
                    {ilan.odemeKurali === "once_odeme_sonra_tercih" && <span className="font-semibold">⚠️ Bu ilanda önce ödeme, sonra tercih kuralı geçerlidir.</span>}
                  </div>
                </div>
              </div>

              {/* Banka bilgileri */}
              <div className="border border-[#DDD] rounded overflow-hidden">
                <div className="px-4 py-2 bg-[#F5F5F5] border-b text-[12px] font-bold text-[#555] uppercase">Ödeme Bilgileri</div>
                <div className="p-4 space-y-2.5">
                  {[
                    ["Banka Adı", ilan.banka?.ad ?? "T.C. Ziraat Bankası A.Ş.", "banka"],
                    ["Alıcı Adı", ilan.banka?.alici ?? "MSB Personel Temin Dairesi Başkanlığı", "alici"],
                    ["IBAN", ilan.banka?.iban ?? "TR33 0006 1005 1978 6457 8413 26", "iban"],
                    ["Referans Kodu (Açıklama)", refKod(adayId, ilan.id), "ref"],
                    ["Tutar", `${ilan.ucretTutari} TL`, "tutar"],
                  ].map(([l, v, k]) => (
                    <div key={k} className="flex items-center gap-3">
                      <div className="w-[180px] text-[12px] text-[#666] flex-shrink-0">{l}:</div>
                      <div className={`flex-1 text-[13px] font-mono font-bold ${k === "ref" ? "text-[#A82232]" : "text-[#333]"}`}>{v}</div>
                      <button onClick={() => kopyala(v, k)} className="p-1.5 hover:bg-[#F5F5F5] rounded text-[#666]" title="Kopyala">
                        {kopyalandi === k ? <Check className="w-3.5 h-3.5 text-[#5E7F42]" strokeWidth={3} /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dekont yükleme */}
              <div className="border border-[#DDD] rounded overflow-hidden">
                <div className="px-4 py-2 bg-[#F5F5F5] border-b text-[12px] font-bold text-[#555] uppercase">Dekont Yükleme</div>
                <div className="p-4">
                  {dekontAdi ? (
                    <div className="flex items-center gap-3 p-3 bg-[#F5F5F5] border border-[#DDD] rounded">
                      <FileText className="w-6 h-6 text-[#A82232]" />
                      <div className="flex-1"><div className="text-[13px] font-semibold text-[#333]">{dekontAdi}</div></div>
                      <button onClick={() => setDekontAdi("")} className="text-[#A82232] p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <label className={btnLgt + " cursor-pointer inline-flex"}>
                      <Upload className="w-3.5 h-3.5" /> Dekont (PDF/PNG) Seç
                      <input type="file" accept="application/pdf,image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setDekontAdi(f.name); }} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EEE]">
                <button className={btnGrn} onClick={gonder} disabled={!dekontAdi} style={!dekontAdi ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                  <Check className="w-3.5 h-3.5" /> Ödeme Bildirimi Gönder
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
