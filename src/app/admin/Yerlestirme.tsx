// Yerleştirme Motoru — ilan seç, otomatik yerleştir, önizle, manuel değiştir, yayımla.

import { useState, useMemo } from "react";
import { Shuffle, Play, Send, Users, UserCheck, UserX, ClipboardList, Award, Info, ChevronUp, ChevronDown, RotateCcw } from "lucide-react";
import { useStore, actions, type Yerlestirme as YerlType } from "../shared/store";
import { DataTable, Pill, Btn, Section, trTarih, maskTC, Modal } from "../shared/ui";
import { MSB } from "../shared/theme";

export default function Yerlestirme() {
  const store = useStore();
  const [seciliIlanId, setSeciliIlanId] = useState<string>(store.ilanlar[0]?.id ?? "");
  const [confirm, setConfirm] = useState<{ id: string; adet: number } | null>(null);

  const ilan = store.ilanlar.find(i => i.id === seciliIlanId);
  const mevcut = useMemo(() =>
    store.yerlestirmeler
      .filter(y => y.ilanId === seciliIlanId)
      .sort((a, b) => b.tarih.localeCompare(a.tarih))[0],
    [store.yerlestirmeler, seciliIlanId]
  );

  const basvurular = store.basvurular.filter(b => b.ilanId === seciliIlanId);
  const tercihler  = store.tercihler.filter(t => t.ilanId === seciliIlanId);

  const runAuto = () => {
    if (!ilan) return;
    actions.yerlestirmeCalistir(ilan.id, "otomatik", store.oturum?.eposta ?? "yonetici");
  };

  const yayimla = () => {
    if (!mevcut) return;
    const yerlesenSayisi = mevcut.sonuclar.filter(r => r.durum === "yerlesti").length;
    setConfirm({ id: mevcut.id, adet: yerlesenSayisi });
  };

  const confirmYayimla = () => {
    if (!confirm) return;
    actions.yerlestirmeYayinla(confirm.id);
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      {/* İlan seçici */}
      <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <ClipboardList className="w-4 h-4" style={{ color: MSB.red }} />
          <span className="text-[13px] font-bold" style={{ color: MSB.red }}>İlan Seçin:</span>
          <select value={seciliIlanId} onChange={e => setSeciliIlanId(e.target.value)}
            className="flex-1 max-w-md h-[36px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232]">
            {store.ilanlar.map(i => (
              <option key={i.id} value={i.id}>
                {i.id} — {i.baslik} ({i.basvuranSayisi} başvuru / {i.kontenjan} kontenjan)
              </option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-2">
            <Btn variant="light" onClick={runAuto} disabled={!ilan || basvurular.length === 0}>
              <Play className="w-3.5 h-3.5" /> Otomatik Yerleştir
            </Btn>
            {mevcut && !mevcut.yayinlandi && (
              <Btn variant="success" onClick={yayimla}>
                <Send className="w-3.5 h-3.5" /> Yayımla
              </Btn>
            )}
          </div>
        </div>
      </div>

      {ilan && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MiniStat icon={<ClipboardList className="w-4 h-4" />} label="Kontenjan" value={ilan.kontenjan} tone="red" />
          <MiniStat icon={<Users className="w-4 h-4" />} label="Başvuru" value={basvurular.length} tone="navy" />
          <MiniStat icon={<Award className="w-4 h-4" />} label="Min. Puan" value={ilan.minPuan.toFixed(1)} tone="gold" />
          <MiniStat icon={<UserCheck className="w-4 h-4" />} label="Yerleşen"
            value={mevcut?.sonuclar.filter(r => r.durum === "yerlesti").length ?? 0}
            tone={mevcut?.yayinlandi ? "green" : "muted"} />
        </div>
      )}

      {/* Algoritma açıklaması */}
      <div className="bg-[#E7F3F9] border border-[#B6DAEA] rounded-[3px] p-3 flex items-start gap-3">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: MSB.infoText }} />
        <div className="text-[12px] leading-relaxed" style={{ color: MSB.infoText }}>
          <span className="font-bold">Yerleştirme Algoritması:</span> Adaylar önce tercih sırasına
          (1 = en yüksek), tercih eşitliğinde ise sınav puanlarına göre sıralanır. Kontenjan kadar
          aday <b>yerleşti</b>; sonraki %20'lik dilim <b>yedek</b>; kalanı <b>yerleşemedi</b> olarak işaretlenir.
          Bir aday başka bir ilana yerleşmişse bu ilana dahil edilmez. Sonuçlar önizlenip manuel
          düzenlenebilir; <b>Yayımla</b> butonuyla adaylara duyurulur ve mesaj gönderilir.
        </div>
      </div>

      {mevcut ? (
        <Section title={`Yerleştirme Sonuçları — ${trTarih(mevcut.tarih, true)}`}
          actions={
            <>
              <Pill tone={mevcut.yayinlandi ? "success" : "warn"}>
                {mevcut.yayinlandi ? "Yayımlandı" : "Taslak (yayımlanmamış)"}
              </Pill>
              <Pill tone="info">{mevcut.yontem === "otomatik" ? "Otomatik" : "Manuel"}</Pill>
              {!mevcut.yayinlandi && (
                <Btn size="sm" variant="ghost" onClick={runAuto}>
                  <RotateCcw className="w-3 h-3" /> Yeniden Çalıştır
                </Btn>
              )}
            </>
          } dense>
          <SonucTable yerl={mevcut} readonly={mevcut.yayinlandi} />
        </Section>
      ) : ilan && (
        <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-8 text-center">
          <Shuffle className="w-12 h-12 mx-auto text-[#DDD] mb-3" strokeWidth={1.2} />
          <div className="text-[14px] font-bold" style={{ color: MSB.ink }}>Bu ilan için henüz yerleştirme çalıştırılmadı</div>
          <div className="text-[12px] text-[#888] mt-1 mb-4">
            {basvurular.length} başvuru, {tercihler.length} tercih girişi bulunuyor.
          </div>
          <Btn onClick={runAuto} disabled={basvurular.length === 0}>
            <Play className="w-3.5 h-3.5" /> Otomatik Yerleştirmeyi Başlat
          </Btn>
        </div>
      )}

      <Modal open={!!confirm} onClose={() => setConfirm(null)} size="sm"
        title="Sonuçları Yayımla"
        footer={<>
          <Btn variant="ghost" onClick={() => setConfirm(null)}>Vazgeç</Btn>
          <Btn variant="success" onClick={confirmYayimla}><Send className="w-3.5 h-3.5" /> Yayımla</Btn>
        </>}>
        <div className="space-y-3 text-[13px]">
          <div>
            Bu ilana ait yerleştirme sonuçları <b>tüm adaylara</b> duyurulacak, kişisel
            mesajlar gönderilecek ve otomatik duyuru yayınlanacaktır.
          </div>
          <div className="bg-[#F5F5F5] border border-[#DDD] rounded-[3px] p-3 text-[12px]">
            <div>• Yerleşen aday sayısı: <b style={{ color: MSB.green }}>{confirm?.adet}</b></div>
            <div>• Aday başvuruları güncellenecek</div>
            <div>• Sonuç belgeleri aday panelinden indirilebilir olacak</div>
          </div>
          <div className="text-[11.5px] text-[#888]">Bu işlem geri alınamaz.</div>
        </div>
      </Modal>
    </div>
  );
}

function MiniStat({ icon, label, value, tone }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; tone: "red" | "green" | "gold" | "navy" | "muted";
}) {
  const map = {
    red: MSB.red, green: MSB.greenDark, gold: MSB.orange, navy: MSB.navy, muted: "#666",
  } as const;
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[4px] px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded flex items-center justify-center text-white" style={{ background: map[tone] }}>{icon}</div>
      <div>
        <div className="text-[10.5px] uppercase tracking-widest font-bold text-[#888]">{label}</div>
        <div className="text-[18px] font-extrabold tabular-nums" style={{ color: map[tone] }}>{value}</div>
      </div>
    </div>
  );
}

function SonucTable({ yerl, readonly }: { yerl: YerlType; readonly: boolean }) {
  const store = useStore();
  const [filter, setFilter] = useState<"yerlesti" | "yedek" | "yerlesmedi" | "tumu">("tumu");

  const rows = yerl.sonuclar
    .filter(r => filter === "tumu" || r.durum === filter)
    .map(r => ({ ...r, aday: store.adaylar.find(a => a.id === r.adayId) }))
    .sort((a, b) => {
      const durumSira = { yerlesti: 0, yedek: 1, yerlesmedi: 2 };
      if (durumSira[a.durum] !== durumSira[b.durum]) return durumSira[a.durum] - durumSira[b.durum];
      return b.puan - a.puan;
    });

  const sayilar = {
    yerlesti:   yerl.sonuclar.filter(r => r.durum === "yerlesti").length,
    yedek:      yerl.sonuclar.filter(r => r.durum === "yedek").length,
    yerlesmedi: yerl.sonuclar.filter(r => r.durum === "yerlesmedi").length,
  };

  const durumMap = { yerlesti: { tone: "success" as const, label: "Yerleşti" }, yedek: { tone: "warn" as const, label: "Yedek" }, yerlesmedi: { tone: "danger" as const, label: "Yerleşemedi" } };

  const degistir = (adayId: string, yeni: "yerlesti" | "yedek" | "yerlesmedi") => {
    actions.yerlestirmeManuelDegistir(yerl.id, adayId, yeni);
  };

  return (
    <div>
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-[#EEE]">
        <TabPill active={filter === "tumu"}       onClick={() => setFilter("tumu")}       count={yerl.sonuclar.length} label="Tümü" />
        <TabPill active={filter === "yerlesti"}   onClick={() => setFilter("yerlesti")}   count={sayilar.yerlesti}     label="Yerleşen"     tone="success" />
        <TabPill active={filter === "yedek"}      onClick={() => setFilter("yedek")}      count={sayilar.yedek}        label="Yedek"        tone="warn" />
        <TabPill active={filter === "yerlesmedi"} onClick={() => setFilter("yerlesmedi")} count={sayilar.yerlesmedi}   label="Yerleşemeyen" tone="danger" />
      </div>

      <DataTable
        columns={[
          { key: "sira", header: "#", width: "48px", align: "center", render: (_r, /* index */) => "" },
          { key: "aday", header: "Aday", render: r => r.aday ? (
              <div>
                <div className="font-semibold text-[12.5px]">{r.aday.ad} {r.aday.soyad}</div>
                <div className="text-[10.5px] text-[#888] font-mono">{maskTC(r.aday.id)}</div>
              </div>
            ) : <span className="font-mono text-[11px]">{r.adayId}</span> },
          { key: "tercih", header: "Tercih Sırası", width: "120px", align: "center", render: r => (
              r.tercihSirasi >= 999 ? <span className="text-[#999]">—</span> :
                <span className="inline-flex items-center gap-1"><span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: MSB.red }}>{r.tercihSirasi}</span></span>
            ) },
          { key: "puan", header: "Puan", width: "80px", align: "right", render: r => (
              <span className="tabular-nums font-extrabold text-[14px]" style={{ color: MSB.red }}>{r.puan.toFixed(1)}</span>
            ) },
          { key: "durum", header: "Durum", width: "130px", render: r => <Pill tone={durumMap[r.durum].tone}>{durumMap[r.durum].label}</Pill> },
          ...(readonly ? [] : [{
            key: "act", header: "Manuel", width: "180px", align: "right" as const, render: (r: typeof rows[number]) => (
              <div className="flex items-center gap-1 justify-end">
                {r.durum !== "yerlesti" && <Btn size="sm" variant="success" onClick={() => degistir(r.adayId, "yerlesti")}><UserCheck className="w-3 h-3" /></Btn>}
                {r.durum !== "yedek" && <Btn size="sm" variant="ghost" onClick={() => degistir(r.adayId, "yedek")}><ChevronUp className="w-3 h-3" /></Btn>}
                {r.durum !== "yerlesmedi" && <Btn size="sm" variant="danger" onClick={() => degistir(r.adayId, "yerlesmedi")}><UserX className="w-3 h-3" /></Btn>}
              </div>
            )
          }]),
        ]}
        rows={rows}
        dense
      />
    </div>
  );
}

function TabPill({ label, count, active, onClick, tone }: {
  label: string; count: number; active: boolean; onClick: () => void; tone?: "success" | "warn" | "danger";
}) {
  const c = tone === "success" ? MSB.green : tone === "warn" ? MSB.orange : tone === "danger" ? MSB.red : MSB.navy;
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 text-[11.5px] font-bold rounded-[3px] border transition-colors ${
        active ? "text-white" : "text-[#555] border-[#DDD] hover:bg-[#F5F5F5] bg-white"
      }`}
      style={active ? { background: c, borderColor: c } : {}}>
      {label} <span className={`tabular-nums ml-1 ${active ? "opacity-80" : "opacity-60"}`}>({count})</span>
    </button>
  );
}
