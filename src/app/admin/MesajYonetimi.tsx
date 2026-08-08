// Mesaj Yönetimi — thread listesi, broadcast, kişisel gönderim.

import { useState, useMemo } from "react";
import { Search, Send, Users, MessageSquare, User as UserIcon } from "lucide-react";
import { useStore, actions } from "../shared/store";
import { Btn, Pill, Field, inputCls, textareaCls, selectCls, Modal, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";

export default function MesajYonetimi() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [aktifAdayId, setAktifAdayId] = useState<string | null>(null);
  const [broadcast, setBroadcast] = useState(false);
  const [yeni, setYeni] = useState({ adayId: "", konu: "", icerik: "" });

  // Thread listesi: her aday için son mesaj
  const threads = useMemo(() => {
    const byAday = new Map<string, typeof store.mesajlar>();
    store.mesajlar.forEach(m => {
      const adayId = m.gonderen === "admin" ? m.alici : m.gonderen;
      if (adayId === "broadcast" || adayId === "admin") return;
      const arr = byAday.get(adayId) ?? [];
      arr.push(m);
      byAday.set(adayId, arr);
    });
    return [...byAday.entries()]
      .map(([adayId, arr]) => {
        const sorted = arr.slice().sort((a, b) => b.tarih.localeCompare(a.tarih));
        const aday = store.adaylar.find(a => a.id === adayId);
        const unread = arr.filter(m => !m.okundu && m.alici === "admin").length;
        return { adayId, aday, sonMesaj: sorted[0], unread, count: arr.length };
      })
      .filter(t => !q ||
        (t.aday && `${t.aday.ad} ${t.aday.soyad}`.toLowerCase().includes(q.toLowerCase())) ||
        t.adayId.includes(q) ||
        t.sonMesaj.konu.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.sonMesaj.tarih.localeCompare(a.sonMesaj.tarih));
  }, [store.mesajlar, store.adaylar, q]);

  const aktifThread = aktifAdayId
    ? store.mesajlar.filter(m => (m.alici === aktifAdayId && m.gonderen === "admin") || (m.gonderen === aktifAdayId && m.alici === "admin")).sort((a, b) => a.tarih.localeCompare(b.tarih))
    : [];
  const aktifAday = aktifAdayId ? store.adaylar.find(a => a.id === aktifAdayId) : null;

  const [reply, setReply] = useState("");
  const sendReply = () => {
    if (!aktifAdayId || !reply.trim()) return;
    actions.mesajGonder({ konu: "Yanıt", icerik: reply.trim(), gonderen: "admin", alici: aktifAdayId });
    setReply("");
  };

  const sendBroadcast = () => {
    if (!yeni.konu.trim() || !yeni.icerik.trim()) return alert("Konu ve içerik zorunlu.");
    // Broadcast: tüm aktif adaylara ayrı ayrı mesaj at (daha sonra iş kuralı için tek broadcast kaydı da tutulabilir)
    store.adaylar.filter(a => a.aktif).forEach(a => {
      actions.mesajGonder({ konu: yeni.konu, icerik: yeni.icerik, gonderen: "admin", alici: a.id });
    });
    setBroadcast(false);
    setYeni({ adayId: "", konu: "", icerik: "" });
  };

  const sendSingle = () => {
    if (!yeni.adayId || !yeni.konu.trim() || !yeni.icerik.trim()) return alert("Aday, konu ve içerik zorunlu.");
    actions.mesajGonder({ konu: yeni.konu, icerik: yeni.icerik, gonderen: "admin", alici: yeni.adayId });
    setBroadcast(false);
    setYeni({ adayId: "", konu: "", icerik: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[calc(100vh-190px)]">
      {/* Thread liste */}
      <div className="lg:col-span-1 bg-white border border-[#E0E0E0] rounded-[4px] flex flex-col min-h-0">
        <div className="p-3 border-b border-[#EEE] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" strokeWidth={2} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Sohbet ara…"
              className="w-full h-[32px] pl-9 pr-3 text-[12.5px] bg-[#F5F5F5] border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#CCC]" />
          </div>
          <Btn size="sm" onClick={() => setBroadcast(true)}><Send className="w-3 h-3" /></Btn>
        </div>
        <div className="flex-1 overflow-auto">
          {threads.length === 0 && (
            <div className="text-center text-[#888] text-[12px] py-8 px-4">Sohbet yok. Yeni mesaj göndermek için sağ üstteki butonu kullanın.</div>
          )}
          {threads.map(t => {
            const active = t.adayId === aktifAdayId;
            return (
              <button key={t.adayId} onClick={() => { setAktifAdayId(t.adayId); t.sonMesaj && !t.sonMesaj.okundu && actions.mesajOkundu(t.sonMesaj.id); }}
                className={`w-full text-left px-3 py-3 border-b border-[#EEE] flex items-start gap-3 transition-colors ${
                  active ? "bg-[#FBECEE]" : "hover:bg-[#F8F8F8]"
                }`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: MSB.navy }}>
                  {t.aday ? t.aday.ad[0] + t.aday.soyad[0] : "??"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-bold truncate flex-1">{t.aday ? `${t.aday.ad} ${t.aday.soyad}` : t.adayId}</span>
                    <span className="text-[10px] text-[#888] flex-shrink-0">{trTarih(t.sonMesaj.tarih)}</span>
                  </div>
                  <div className="text-[11.5px] text-[#666] truncate">{t.sonMesaj.konu}</div>
                </div>
                {t.unread > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: MSB.red }}>{t.unread}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sohbet paneli */}
      <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-[4px] flex flex-col min-h-0">
        {!aktifAdayId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#888]">
            <MessageSquare className="w-14 h-14 text-[#DDD] mb-3" strokeWidth={1.2} />
            <div className="text-[14px] font-bold text-[#666]">Bir sohbet seçin</div>
            <div className="text-[12px] mt-1">Sol taraftan aday sohbetini seçin ya da yeni mesaj gönderin.</div>
          </div>
        ) : (
          <>
            <header className="p-3 border-b border-[#EEE] flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: MSB.navy }}>
                {aktifAday ? aktifAday.ad[0] + aktifAday.soyad[0] : "??"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold" style={{ color: MSB.ink }}>{aktifAday ? `${aktifAday.ad} ${aktifAday.soyad}` : aktifAdayId}</div>
                <div className="text-[10.5px] text-[#888] font-mono">{aktifAdayId}</div>
              </div>
              <Pill tone="info">{aktifThread.length} mesaj</Pill>
            </header>
            <div className="flex-1 overflow-auto p-4 space-y-2 bg-[#FAFAFA]">
              {aktifThread.map(m => {
                const admin = m.gonderen === "admin";
                return (
                  <div key={m.id} className={`flex ${admin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-[6px] text-[12.5px] shadow-sm ${admin ? "text-white" : "bg-white text-[#333] border border-[#EEE]"}`}
                      style={admin ? { background: MSB.red } : {}}>
                      <div className="text-[10px] opacity-80 mb-0.5 font-bold uppercase tracking-wide">{admin ? "Yönetici" : "Aday"} · {trTarih(m.tarih, true)}</div>
                      <div className="font-semibold">{m.konu}</div>
                      <div className="whitespace-pre-wrap leading-relaxed mt-0.5">{m.icerik}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-[#EEE] flex items-end gap-2 flex-shrink-0">
              <textarea value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(); }}
                placeholder="Yanıtınızı yazın… (Ctrl+Enter göndermek için)"
                className="flex-1 h-[60px] px-3 py-2 text-[12.5px] bg-white border border-[#CCC] rounded-[3px] focus:outline-none focus:border-[#A82232] resize-none" />
              <Btn onClick={sendReply} disabled={!reply.trim()}><Send className="w-3.5 h-3.5" /> Gönder</Btn>
            </div>
          </>
        )}
      </div>

      <Modal open={broadcast} onClose={() => setBroadcast(false)} size="md"
        title="Yeni Mesaj"
        footer={<>
          <Btn variant="ghost" onClick={() => setBroadcast(false)}>Vazgeç</Btn>
          {yeni.adayId === "__all__" ? (
            <Btn variant="danger" onClick={() => confirm(`${store.adaylar.filter(a => a.aktif).length} aktif adaya broadcast gönderilecek. Devam?`) && sendBroadcast()}>
              <Users className="w-3.5 h-3.5" /> Broadcast Gönder
            </Btn>
          ) : (
            <Btn onClick={sendSingle}><Send className="w-3.5 h-3.5" /> Gönder</Btn>
          )}
        </>}>
        <div className="space-y-3">
          <Field label="Alıcı" required>
            <select className={selectCls} value={yeni.adayId} onChange={e => setYeni({ ...yeni, adayId: e.target.value })}>
              <option value="">Aday seçin…</option>
              <option value="__all__">📣 Tüm Aktif Adaylar (Broadcast)</option>
              <option value="" disabled>─────────</option>
              {store.adaylar.filter(a => a.aktif).map(a => (
                <option key={a.id} value={a.id}>{a.ad} {a.soyad} — {a.id}</option>
              ))}
            </select>
          </Field>
          <Field label="Konu" required>
            <input className={inputCls} value={yeni.konu} onChange={e => setYeni({ ...yeni, konu: e.target.value })} placeholder="Örn: Belge Onayı, Randevu, Bilgilendirme" />
          </Field>
          <Field label="Mesaj" required>
            <textarea className={textareaCls + " min-h-[120px]"} value={yeni.icerik} onChange={e => setYeni({ ...yeni, icerik: e.target.value })} placeholder="Mesaj içeriği…" />
          </Field>
          {yeni.adayId === "__all__" && (
            <div className="bg-[#FCF3E3] border border-[#E7C688] rounded-[3px] p-3 text-[12px]" style={{ color: MSB.orange }}>
              <b>Uyarı:</b> Broadcast tüm aktif adaylara ayrı mesaj olarak gönderilir ({store.adaylar.filter(a => a.aktif).length} kişi).
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
