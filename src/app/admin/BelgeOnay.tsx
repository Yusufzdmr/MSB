// Belge Onay Kuyruğu — bekleyen belgeler tablosu, preview panel, onay/red.

import { useState, useMemo } from "react";
import { FileText, Check, X, RotateCcw, Search, Filter, ClipboardCheck, ImageIcon } from "lucide-react";
import { useStore, actions, type Belge, type BelgeDurum } from "../shared/store";
import { DataTable, Pill, Btn, trTarih, maskTC, Modal, Field, textareaCls } from "../shared/ui";
import { MSB } from "../shared/theme";

const tipLabel: Record<string, string> = {
  kimlik: "Kimlik", diploma: "Diploma", transkript: "Transkript", sinav_sonuc: "Sınav Sonucu",
  saglik_raporu: "Sağlık Raporu", askerlik: "Askerlik Durumu", adli_sicil: "Adli Sicil",
  sertifika: "Sertifika", ehliyet: "Ehliyet", yabanci_dil: "Yabancı Dil", bonservis: "Bonservis", diger: "Diğer",
};

const durumTone = { beklemede: "warn", onaylandi: "success", reddedildi: "danger" } as const;
const durumLabel = { beklemede: "Beklemede", onaylandi: "Onaylı", reddedildi: "Reddedildi" } as const;

export default function BelgeOnay() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [filtreDur, setFiltreDur] = useState<BelgeDurum | "">("beklemede");
  const [seciliBelge, setSeciliBelge] = useState<Belge | null>(null);
  const [redModal, setRedModal] = useState<{ belge: Belge; gerekce: string } | null>(null);

  const rows = useMemo(() => store.belgeler.filter(b => {
    if (filtreDur && b.durum !== filtreDur) return false;
    if (!q) return true;
    const aday = store.adaylar.find(a => a.id === b.adayId);
    return b.ad.toLowerCase().includes(q.toLowerCase()) ||
           b.adayId.includes(q) ||
           (aday && `${aday.ad} ${aday.soyad}`.toLowerCase().includes(q.toLowerCase()));
  }).sort((a, b) => b.yuklemeTarihi.localeCompare(a.yuklemeTarihi)), [store.belgeler, store.adaylar, q, filtreDur]);

  const kuyrukSayilari = {
    beklemede:   store.belgeler.filter(b => b.durum === "beklemede").length,
    onaylandi:   store.belgeler.filter(b => b.durum === "onaylandi").length,
    reddedildi:  store.belgeler.filter(b => b.durum === "reddedildi").length,
    tumu:        store.belgeler.length,
  };

  const onayla = (b: Belge) => {
    actions.belgeOnayla(b.id, store.oturum?.eposta ?? "yonetici");
    if (seciliBelge?.id === b.id) setSeciliBelge(null);
  };

  const openRed = (b: Belge) => setRedModal({ belge: b, gerekce: "" });
  const confirmRed = () => {
    if (!redModal) return;
    if (!redModal.gerekce.trim()) return alert("Ret gerekçesi zorunludur.");
    actions.belgeReddet(redModal.belge.id, store.oturum?.eposta ?? "yonetici", redModal.gerekce.trim());
    if (seciliBelge?.id === redModal.belge.id) setSeciliBelge(null);
    setRedModal(null);
  };

  return (
    <div className="space-y-3">
      {/* Kuyruk özet */}
      <div className="grid grid-cols-4 gap-2">
        <QueueBox label="Bekliyor" val={kuyrukSayilari.beklemede} tone="warn" active={filtreDur === "beklemede"} onClick={() => setFiltreDur("beklemede")} />
        <QueueBox label="Onaylı"   val={kuyrukSayilari.onaylandi}  tone="success" active={filtreDur === "onaylandi"} onClick={() => setFiltreDur("onaylandi")} />
        <QueueBox label="Reddedildi" val={kuyrukSayilari.reddedildi} tone="danger" active={filtreDur === "reddedildi"} onClick={() => setFiltreDur("reddedildi")} />
        <QueueBox label="Tümü"     val={kuyrukSayilari.tumu}       tone="muted" active={filtreDur === ""} onClick={() => setFiltreDur("")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" strokeWidth={2} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Belge adı, TC no, aday adı…"
                className="w-full h-[34px] pl-9 pr-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232]" />
            </div>
            <span className="text-[11.5px] font-semibold text-[#666] tabular-nums">{rows.length} kayıt</span>
          </div>

          <DataTable<Belge>
            onRowClick={setSeciliBelge}
            columns={[
              { key: "tip", header: "Tip", width: "130px", render: r => (
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#888]" />
                    <span className="text-[12px] font-semibold">{tipLabel[r.tip] || r.tip}</span>
                  </div>
                ) },
              { key: "ad", header: "Dosya", render: r => (
                  <div>
                    <div className="font-semibold text-[12.5px] truncate max-w-[220px]">{r.ad}</div>
                    <div className="text-[10.5px] text-[#888]">{(r.boyutKB / 1024).toFixed(2)} MB · {trTarih(r.yuklemeTarihi, true)}</div>
                  </div>
                ) },
              { key: "aday", header: "Aday", width: "180px", render: r => {
                  const a = store.adaylar.find(x => x.id === r.adayId);
                  return a ? (
                    <div>
                      <div className="font-semibold text-[12px]">{a.ad} {a.soyad}</div>
                      <div className="text-[10.5px] text-[#888] font-mono">{maskTC(a.id)}</div>
                    </div>
                  ) : <span className="text-[#888] text-[11px] font-mono">{r.adayId}</span>;
                } },
              { key: "durum", header: "Durum", width: "110px", render: r => <Pill tone={durumTone[r.durum]}>{durumLabel[r.durum]}</Pill> },
              { key: "act", header: "İşlem", width: "170px", align: "right", render: r => (
                  r.durum === "beklemede" ? (
                    <div className="flex items-center gap-1 justify-end">
                      <Btn size="sm" variant="success" onClick={e => { e.stopPropagation(); onayla(r); }}><Check className="w-3 h-3" /> Onayla</Btn>
                      <Btn size="sm" variant="danger"  onClick={e => { e.stopPropagation(); openRed(r); }}><X className="w-3 h-3" /> Reddet</Btn>
                    </div>
                  ) : r.durum === "reddedildi" ? (
                    <Btn size="sm" variant="ghost" onClick={e => { e.stopPropagation(); onayla(r); }}><RotateCcw className="w-3 h-3" /> Yeniden onay</Btn>
                  ) : (
                    <span className="text-[11px] text-[#888]">{trTarih(r.onayTarihi, true)}</span>
                  )
                ) },
            ]}
            rows={rows}
            empty={<>Bu kuyrukta belge yok.</>}
          />
        </div>

        {/* Preview panel */}
        <aside className="bg-white border border-[#E0E0E0] rounded-[4px] p-4 sticky top-4 h-fit">
          {!seciliBelge ? (
            <div className="text-center py-12 text-[#888]">
              <ClipboardCheck className="w-12 h-12 mx-auto text-[#DDD]" strokeWidth={1.2} />
              <div className="mt-2 text-[13px] font-semibold text-[#666]">Belge Önizleme</div>
              <div className="text-[11.5px] mt-1">Sol taraftan bir belge seçin</div>
            </div>
          ) : (
            <BelgePreview belge={seciliBelge} onApprove={() => onayla(seciliBelge)} onReject={() => openRed(seciliBelge)} onClose={() => setSeciliBelge(null)} />
          )}
        </aside>
      </div>

      <Modal open={!!redModal} onClose={() => setRedModal(null)} size="sm"
        title="Belgeyi Reddet"
        footer={<>
          <Btn variant="ghost" onClick={() => setRedModal(null)}>Vazgeç</Btn>
          <Btn variant="danger" onClick={confirmRed}><X className="w-3.5 h-3.5" /> Reddet</Btn>
        </>}>
        {redModal && (
          <div className="space-y-3">
            <div className="text-[12.5px] text-[#666]">
              <span className="font-bold">{redModal.belge.ad}</span> — bu belge adaya "reddedildi" olarak iletilir ve
              adaydan yeniden yükleme yapması istenir.
            </div>
            <Field label="Ret Gerekçesi" required>
              <textarea autoFocus value={redModal.gerekce}
                onChange={e => setRedModal({ ...redModal, gerekce: e.target.value })}
                className={textareaCls}
                placeholder="Örn: Belge okunaklı değil, çözünürlük düşük. 300 DPI olarak yeniden tarayınız." />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}

function QueueBox({ label, val, tone, active, onClick }: {
  label: string; val: number; tone: "warn" | "success" | "danger" | "muted"; active: boolean; onClick: () => void;
}) {
  const colorMap = {
    warn:    { bar: MSB.orange, fg: MSB.orange },
    success: { bar: MSB.green,  fg: MSB.greenDark },
    danger:  { bar: MSB.red,    fg: MSB.red },
    muted:   { bar: "#AAA",     fg: "#666" },
  } as const;
  const c = colorMap[tone];
  return (
    <button onClick={onClick}
      className={`text-left bg-white border rounded-[4px] px-4 py-3 flex items-center gap-3 transition-all ${
        active ? "border-[#A82232] shadow-[0_1px_4px_rgba(168,34,50,0.15)]" : "border-[#E0E0E0] hover:border-[#CCC]"
      }`}>
      <div className="w-1 h-8 rounded-full" style={{ background: c.bar }} />
      <div>
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888]">{label}</div>
        <div className="text-[20px] font-extrabold tabular-nums" style={{ color: c.fg }}>{val}</div>
      </div>
    </button>
  );
}

function BelgePreview({ belge, onApprove, onReject, onClose }: {
  belge: Belge; onApprove: () => void; onReject: () => void; onClose: () => void;
}) {
  const store = useStore();
  const aday = store.adaylar.find(a => a.id === belge.adayId);
  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <div className="text-[10.5px] uppercase font-bold tracking-widest text-[#888]">Önizleme</div>
          <div className="text-[14px] font-extrabold truncate" style={{ color: MSB.ink }}>{belge.ad}</div>
          <div className="text-[11px] text-[#666] mt-0.5">
            {tipLabel[belge.tip] || belge.tip} · {(belge.boyutKB / 1024).toFixed(2)} MB
          </div>
        </div>
        <button onClick={onClose} className="text-[#999] hover:text-[#333] p-1"><X className="w-4 h-4" /></button>
      </div>

      {/* Mock PDF preview */}
      <div className="aspect-[3/4] bg-[#F5F5F5] border border-[#DDD] rounded-[3px] flex flex-col items-center justify-center p-6 text-center mb-3 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-8 bg-[#EEE] border-b border-[#DDD] flex items-center px-3 gap-1">
          <div className="w-2 h-2 rounded-full bg-[#E74C3C]" />
          <div className="w-2 h-2 rounded-full bg-[#F5B041]" />
          <div className="w-2 h-2 rounded-full bg-[#58D68D]" />
          <span className="ml-2 text-[10px] text-[#888] font-mono">{belge.ad}</span>
        </div>
        <ImageIcon className="w-16 h-16 text-[#CCC] mb-2 mt-4" strokeWidth={1.2} />
        <div className="text-[11.5px] text-[#888] italic">Belge önizleme</div>
      </div>

      {belge.ocrAlanlar && (
        <div className="border border-[#E0E0E0] rounded-[3px] p-3 mb-3 bg-[#F9F9F9]">
          <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-1.5">
            OCR ile Çıkarılan Alanlar
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
            {Object.entries(belge.ocrAlanlar).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[#EEE] py-0.5">
                <span className="text-[#666]">{k}</span>
                <span className="font-bold tabular-nums" style={{ color: MSB.red }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-[#EEE] pt-3 space-y-2">
        {aday && (
          <div className="flex items-center gap-2 text-[12px]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: MSB.navy }}>
              {aday.ad[0]}{aday.soyad[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{aday.ad} {aday.soyad}</div>
              <div className="text-[10.5px] text-[#888] font-mono">{maskTC(aday.id)}</div>
            </div>
          </div>
        )}
        <div className="text-[10.5px] text-[#888]">Yükleme: {trTarih(belge.yuklemeTarihi, true)}</div>

        {belge.durum === "beklemede" ? (
          <div className="flex gap-2 pt-1">
            <Btn variant="success" className="flex-1 justify-center" onClick={onApprove}><Check className="w-3.5 h-3.5" /> Onayla</Btn>
            <Btn variant="danger"  className="flex-1 justify-center" onClick={onReject}><X className="w-3.5 h-3.5" /> Reddet</Btn>
          </div>
        ) : (
          <div className="mt-2">
            <Pill tone={durumTone[belge.durum]}>{durumLabel[belge.durum]}</Pill>
            {belge.redGerekce && <div className="text-[11.5px] mt-1.5" style={{ color: MSB.red }}>{belge.redGerekce}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
