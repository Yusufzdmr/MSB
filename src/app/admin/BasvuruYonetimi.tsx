// Admin Başvuru Yönetimi — ilan × aday matrix, durum + rich text gerekçe +
// tebligat PDF + "Adaya Gönder" (kilitler + adayın paneline yansır).

import React, { useState, useRef, useMemo } from "react";
import {
  Users, Send, Lock, FileText, Upload, X, Search, Check,
  Bold, Italic, Underline, Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, Palette,
} from "lucide-react";
import { useStore, actions, type Basvuru } from "../shared/store";
import { Btn, Pill, inputCls, selectCls, trTarih, maskTC } from "../shared/ui";
import { MSB } from "../shared/theme";

const durumMap: Record<Basvuru["durum"], { label: string; tone: "muted" | "info" | "warn" | "success" | "danger" | "red" }> = {
  hazirlaniyor:         { label: "Hazırlanıyor",              tone: "muted"   },
  gonderildi:           { label: "İnceleniyor",               tone: "info"    },
  belge_onay_bekliyor:  { label: "Belge Onayı Bekliyor",      tone: "warn"    },
  onaylandi:            { label: "Kabul Edildi",              tone: "success" },
  yedek:                { label: "Yedek Listede",             tone: "warn"    },
  yerlestirildi:        { label: "Asil Yerleşti",             tone: "success" },
  yerlestirilmedi:      { label: "Yerleştirilmedi",           tone: "danger"  },
  reddedildi:           { label: "Reddedildi / Şart Sağlamıyor", tone: "danger" },
};

const DURUMLAR: Basvuru["durum"][] = ["hazirlaniyor", "gonderildi", "belge_onay_bekliyor", "onaylandi", "yedek", "yerlestirildi", "yerlestirilmedi", "reddedildi"];

// Basit rich text editör — uncontrolled contentEditable (caret jump'ı önlemek için)
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  // Yalnızca mount'ta ve dış value programatik değiştiğinde DOM'u ayarla
  const lastValueRef = useRef<string>("");
  React.useEffect(() => {
    if (ref.current && value !== lastValueRef.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = value ?? "";
      lastValueRef.current = value ?? "";
    }
  }, [value]);
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) { lastValueRef.current = ref.current.innerHTML; onChange(ref.current.innerHTML); }
  };
  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = (e.target as HTMLDivElement).innerHTML;
    lastValueRef.current = html;
    onChange(html);
  };
  const btn = "w-[28px] h-[28px] flex items-center justify-center hover:bg-[#EEE] rounded text-[#555]";
  return (
    <div className="border border-[#CCC] rounded-[3px] overflow-hidden">
      <div className="flex items-center gap-0.5 flex-wrap px-1 py-1 bg-[#F5F5F5] border-b border-[#CCC]">
        <button type="button" onClick={() => exec("bold")} className={btn} title="Kalın"><Bold className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("italic")} className={btn} title="İtalik"><Italic className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("underline")} className={btn} title="Altı Çizili"><Underline className="w-3 h-3" /></button>
        <span className="w-px h-4 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("formatBlock", "H1")} className={btn}><Heading1 className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("formatBlock", "H2")} className={btn}><Heading2 className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("formatBlock", "H3")} className={btn}><Heading3 className="w-3 h-3" /></button>
        <span className="w-px h-4 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={btn}><List className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("insertOrderedList")} className={btn}><ListOrdered className="w-3 h-3" /></button>
        <span className="w-px h-4 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("justifyLeft")} className={btn}><AlignLeft className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("justifyCenter")} className={btn}><AlignCenter className="w-3 h-3" /></button>
        <button type="button" onClick={() => exec("justifyRight")} className={btn}><AlignRight className="w-3 h-3" /></button>
        <label className={btn + " cursor-pointer relative"}>
          <Palette className="w-3 h-3" />
          <input type="color" onChange={e => exec("foreColor", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        className="p-3 text-[13px] min-h-[140px] focus:outline-none"
        style={{ lineHeight: 1.5 }}
        onInput={onInput}
      />
    </div>
  );
}

export default function BasvuruYonetimi() {
  const store = useStore();
  const [seciliIlan, setSeciliIlan] = useState<string>(store.ilanlar[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [durumFiltre, setDurumFiltre] = useState<Basvuru["durum"] | "">("");
  const [seciliBsv, setSeciliBsv] = useState<Basvuru | null>(null);
  const [taslakDurum, setTaslakDurum] = useState<Basvuru["durum"]>("gonderildi");
  const [taslakGerekce, setTaslakGerekce] = useState("");
  const [taslakBelge, setTaslakBelge] = useState("");

  const basvurular = useMemo(() =>
    store.basvurular
      .filter(b => b.ilanId === seciliIlan)
      .filter(b => !durumFiltre || b.durum === durumFiltre)
      .filter(b => {
        if (!q) return true;
        const aday = store.adaylar.find(a => a.id === b.adayId);
        const s = q.toLowerCase();
        return (aday?.ad + " " + aday?.soyad).toLowerCase().includes(s) || b.adayId.includes(s);
      })
      .sort((a, b) => b.puan - a.puan),
    [store.basvurular, store.adaylar, seciliIlan, durumFiltre, q]
  );

  const acDetay = (b: Basvuru) => {
    setSeciliBsv(b);
    setTaslakDurum(b.durum);
    setTaslakGerekce(b.adminGerekce ?? "");
    setTaslakBelge(b.tebligatBelgesi ?? "");
  };

  const onKaydet = () => {
    if (!seciliBsv) return;
    actions.basvuruAdminIslem(seciliBsv.id, {
      durum: taslakDurum, adminGerekce: taslakGerekce, tebligatBelgesi: taslakBelge || undefined,
    }, false);
    alert("Taslak kaydedildi (aday bildirimi yayımlanmadı).");
    setSeciliBsv(null);
  };
  const onGonder = () => {
    if (!seciliBsv) return;
    if (!taslakGerekce.replace(/<[^>]*>/g, "").trim()) return alert("Gerekçe/açıklama boş olamaz.");
    if (!confirm("Bu bildirim ADAY panelinde anında yansıyacak ve kilitlenecektir. Devam edilsin mi?")) return;
    actions.basvuruAdminIslem(seciliBsv.id, {
      durum: taslakDurum, adminGerekce: taslakGerekce, tebligatBelgesi: taslakBelge || undefined,
    }, true);
    alert("Adaya gönderildi. Bildirim yayımlandı.");
    setSeciliBsv(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
      {/* SOL: İlan + aday listesi */}
      <div className="space-y-3">
        <div>
          <label className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase tracking-wide">İlan Seçiniz</label>
          <select className={selectCls} value={seciliIlan} onChange={e => setSeciliIlan(e.target.value)}>
            {store.ilanlar.map(i => <option key={i.id} value={i.id}>{i.baslik}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input className={inputCls + " pl-8"} placeholder="Aday adı/TCKN ara..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className={selectCls + " w-[160px]"} value={durumFiltre} onChange={e => setDurumFiltre(e.target.value as Basvuru["durum"] | "")}>
            <option value="">Tüm durumlar</option>
            {DURUMLAR.map(d => <option key={d} value={d}>{durumMap[d].label}</option>)}
          </select>
        </div>

        <div className="bg-white border border-[#DDD] rounded overflow-hidden">
          <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Başvuranlar ({basvurular.length})
          </div>
          <div className="max-h-[560px] overflow-y-auto divide-y divide-[#EEE]">
            {basvurular.length === 0 ? (
              <div className="p-6 text-center text-[#888] italic text-[12.5px]">Filtreye uyan başvuru yok.</div>
            ) : basvurular.map(b => {
              const aday = store.adaylar.find(a => a.id === b.adayId);
              const aktif = seciliBsv?.id === b.id;
              return (
                <button key={b.id} onClick={() => acDetay(b)}
                  className={`w-full text-left px-3 py-2 transition-colors ${aktif ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="text-[12.5px] font-bold text-[#333] truncate">{aday?.ad} {aday?.soyad}</div>
                    <span className="text-[11px] tabular-nums text-[#A82232] font-bold flex-shrink-0">{b.puan.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10.5px]">
                    <span className="tabular-nums text-[#888]">{maskTC(b.adayId)}</span>
                    <Pill tone={durumMap[b.durum].tone}>{durumMap[b.durum].label}</Pill>
                    {b.gonderildi && <span className="text-[#5E7F42] font-bold flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> KİLİTLİ</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAĞ: Detay + gerekçe */}
      <div className="bg-white border border-[#DDD] rounded">
        {!seciliBsv ? (
          <div className="p-10 text-center text-[13px] text-[#888]">
            <Users className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
            Solda bir başvuru seçin. Adayın profilini görüntüleyip durum güncellemesi ve gerekçe yazabilirsiniz.
          </div>
        ) : (() => {
          const aday = store.adaylar.find(a => a.id === seciliBsv.adayId);
          const profil = store.profiller.find(p => p.adayId === seciliBsv.adayId);
          const ilan = store.ilanlar.find(i => i.id === seciliBsv.ilanId);
          return (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b bg-[#FAFAFA]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[16px] font-bold text-[#333]">{aday?.ad} {aday?.soyad}</h2>
                    <div className="text-[11.5px] text-[#666] mt-0.5">
                      TCKN: <span className="tabular-nums">{maskTC(seciliBsv.adayId)}</span> ·
                      Başvuru: {trTarih(seciliBsv.basvuruTarihi)} ·
                      Puan: <strong className="tabular-nums text-[#A82232]">{seciliBsv.puan.toFixed(2)}</strong>
                    </div>
                    <div className="text-[11.5px] text-[#666] mt-0.5">İlan: <strong>{ilan?.baslik}</strong></div>
                  </div>
                  <Pill tone={durumMap[seciliBsv.durum].tone}>{durumMap[seciliBsv.durum].label}</Pill>
                </div>
                {seciliBsv.gonderildi && (
                  <div className="mt-2 p-2 rounded flex items-start gap-2" style={{ background: "#EEF6E8", color: "#5E7F42", border: "1px solid #C7DDB0" }}>
                    <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="text-[11.5px]">
                      <strong>Bildirim yayımlandı — {trTarih(seciliBsv.gonderilmeTarihi, true)}</strong>. Durum kilitli. Değişiklikler artık aday panelinde tekrar yayımlanmaz.
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Aday profil özeti */}
                <div>
                  <h3 className="text-[12px] font-bold text-[#555] uppercase mb-2">Aday Profili</h3>
                  <div className="border border-[#EEE] rounded p-3 text-[12px] space-y-1">
                    <div><span className="text-[#888]">Doğum: </span>{aday?.dogumTarihi ?? "—"}</div>
                    <div><span className="text-[#888]">Şehir: </span>{aday?.sehir}</div>
                    <div><span className="text-[#888]">Eğitim: </span>{aday?.egitim} — {aday?.mezuniyet ?? "—"} / {aday?.bolum ?? "—"}</div>
                    <div><span className="text-[#888]">GPA: </span>{aday?.ortalama ?? "—"}</div>
                    <div><span className="text-[#888]">İletişim: </span>{aday?.telefon} · {aday?.eposta}</div>
                    <div className="pt-1 border-t border-[#EEE] mt-1">
                      <span className="text-[#888]">Vesikalık: </span>
                      {profil?.kimlik.vesikalikFoto ? "Yüklendi ✓" : "—"}
                    </div>
                    <div><span className="text-[#888]">Sınav kaydı: </span>{profil?.sinavlar.length ?? 0} adet</div>
                    <div><span className="text-[#888]">Eğitim kaydı: </span>{profil?.egitimler.length ?? 0} adet</div>
                  </div>
                </div>

                {/* Durum güncelleme + gerekçe */}
                <div>
                  <h3 className="text-[12px] font-bold text-[#555] uppercase mb-2">Durum Güncelleme</h3>
                  <select className={selectCls + " mb-3"} value={taslakDurum} onChange={e => setTaslakDurum(e.target.value as Basvuru["durum"])}>
                    {DURUMLAR.map(d => <option key={d} value={d}>{durumMap[d].label}</option>)}
                  </select>

                  <label className="block text-[12px] font-bold text-[#555] uppercase mb-1.5">Ek Tebligat Belgesi (Opsiyonel)</label>
                  <div className="flex items-center gap-2 mb-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 h-[30px] px-2.5 text-[12px] font-semibold text-[#333] bg-white border border-[#CCC] rounded">
                      <Upload className="w-3 h-3" /> PDF Seç
                      <input type="file" accept="application/pdf" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setTaslakBelge(f.name); }} />
                    </label>
                    {taslakBelge && (
                      <span className="flex items-center gap-1 text-[11.5px] text-[#333]">
                        <FileText className="w-3 h-3 text-[#A82232]" /> {taslakBelge}
                        <button onClick={() => setTaslakBelge("")} className="text-[#A82232]"><X className="w-3 h-3" /></button>
                      </span>
                    )}
                  </div>
                </div>

                {/* Rich text gerekçe — full width */}
                <div className="md:col-span-2">
                  <h3 className="text-[12px] font-bold text-[#555] uppercase mb-2">Gerekçe / Açıklama (Zengin Metin)</h3>
                  <RichEditor value={taslakGerekce} onChange={setTaslakGerekce} />
                  <div className="mt-1.5 text-[11px] text-[#888]">
                    Örnek red: <em>"YKS Sayısal sıralamanız ilan kılavuzunda belirtilen taban sıralama şartını (ilk 50.000) sağlamamaktadır."</em>
                    Örnek kabul: <em>"Başvurunuz onaylanmıştır. Asil listede yer aldığınız için mülakat tarihleriniz ayrıca tebliğ edilecektir."</em>
                  </div>
                </div>
              </div>

              {/* Alt aksiyonlar */}
              <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2">
                <Btn variant="ghost" onClick={() => setSeciliBsv(null)}>Kapat</Btn>
                <Btn variant="light" onClick={onKaydet}><Check className="w-3.5 h-3.5" /> Taslak Kaydet</Btn>
                <Btn onClick={onGonder} disabled={seciliBsv.gonderildi}>
                  <Send className="w-3.5 h-3.5" /> {seciliBsv.gonderildi ? "Yayımlandı" : "Adaya Gönder / Bildirimi Yayınla"}
                </Btn>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
