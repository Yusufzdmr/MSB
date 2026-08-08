// Duyuru Yönetimi — CRUD.

import { useState } from "react";
import { Plus, Trash2, Megaphone, Star } from "lucide-react";
import { useStore, actions, type Duyuru } from "../shared/store";
import { DataTable, Pill, Btn, Modal, Field, inputCls, selectCls, textareaCls, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";

const kategoriMap: Record<Duyuru["kategori"], { label: string; tone: "muted" | "info" | "warn" | "success" | "red" }> = {
  genel:       { label: "Genel",         tone: "muted"   },
  sinav:       { label: "Sınav",         tone: "info"    },
  yerlestirme: { label: "Yerleştirme",   tone: "success" },
  belge:       { label: "Belge",         tone: "warn"    },
  sistem:      { label: "Sistem",        tone: "red"     },
};

export default function DuyuruYonetimi() {
  const store = useStore();
  const [editing, setEditing] = useState<Partial<Duyuru> | null>(null);

  const openNew = () => setEditing({
    baslik: "", ozet: "", icerik: "",
    kategori: "genel", onemli: false, yayinlayan: "PGM",
  });

  const save = () => {
    if (!editing || !editing.baslik) return alert("Başlık zorunlu.");
    actions.duyuruEkle({
      baslik: editing.baslik,
      ozet: editing.ozet ?? "",
      icerik: editing.icerik ?? "",
      kategori: (editing.kategori ?? "genel") as Duyuru["kategori"],
      onemli: !!editing.onemli,
      yayinlayan: editing.yayinlayan ?? "PGM",
    });
    setEditing(null);
  };

  const sil = (d: Duyuru) => { if (confirm(`"${d.baslik}" silinsin mi?`)) actions.duyuruSil(d.id); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] text-[#666]">
          Toplam <b>{store.duyurular.length}</b> duyuru. Duyurular tüm adaylara panel giriş sayfasında ve
          duyurular sekmesinde görünür.
        </div>
        <Btn onClick={openNew}><Plus className="w-3.5 h-3.5" /> Yeni Duyuru</Btn>
      </div>

      <DataTable<Duyuru>
        columns={[
          { key: "onemli", header: "", width: "38px", render: r => r.onemli ? <Star className="w-4 h-4 fill-current" style={{ color: MSB.orange }} /> : null },
          { key: "baslik", header: "Başlık", render: r => (
              <div>
                <div className="font-semibold text-[12.5px]" style={{ color: MSB.ink }}>{r.baslik}</div>
                <div className="text-[11px] text-[#888] truncate max-w-[520px]">{r.ozet}</div>
              </div>
            ) },
          { key: "kat", header: "Kategori", width: "130px", render: r => <Pill tone={kategoriMap[r.kategori].tone}>{kategoriMap[r.kategori].label}</Pill> },
          { key: "yay", header: "Yayınlayan", width: "120px", render: r => <span className="text-[11.5px] text-[#666]">{r.yayinlayan}</span> },
          { key: "tar", header: "Tarih", width: "130px", render: r => <span className="text-[11.5px] text-[#666]">{trTarih(r.yayinTarihi, true)}</span> },
          { key: "act", header: "", width: "80px", align: "right", render: r => (
              <Btn size="sm" variant="danger" onClick={() => sil(r)}><Trash2 className="w-3 h-3" /></Btn>
            ) },
        ]}
        rows={store.duyurular.slice().sort((a, b) => b.yayinTarihi.localeCompare(a.yayinTarihi))}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} size="md"
        title="Yeni Duyuru"
        footer={<>
          <Btn variant="ghost" onClick={() => setEditing(null)}>İptal</Btn>
          <Btn onClick={save}><Megaphone className="w-3.5 h-3.5" /> Yayınla</Btn>
        </>}>
        {editing && (
          <div className="space-y-3">
            <Field label="Başlık" required>
              <input className={inputCls} value={editing.baslik ?? ""} onChange={e => setEditing({ ...editing, baslik: e.target.value })}
                placeholder="Örn: 2026/3 Sözleşmeli Er Yerleştirme Sonuçları" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori" required>
                <select className={selectCls} value={editing.kategori ?? "genel"} onChange={e => setEditing({ ...editing, kategori: e.target.value as Duyuru["kategori"] })}>
                  {Object.entries(kategoriMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
              <Field label="Yayınlayan Birim">
                <input className={inputCls} value={editing.yayinlayan ?? ""} onChange={e => setEditing({ ...editing, yayinlayan: e.target.value })}
                  placeholder="PGM / Bilgi İşlem / …" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              <input type="checkbox" checked={!!editing.onemli} onChange={e => setEditing({ ...editing, onemli: e.target.checked })}
                className="w-4 h-4 accent-[#A82232]" />
              <Star className="w-3.5 h-3.5" style={{ color: MSB.orange }} />
              <span className="font-semibold">Önemli olarak işaretle (yıldızlı gösterilir)</span>
            </label>
            <Field label="Özet" required>
              <input className={inputCls} value={editing.ozet ?? ""} onChange={e => setEditing({ ...editing, ozet: e.target.value })}
                placeholder="Kart üzerinde gösterilen kısa özet" />
            </Field>
            <Field label="İçerik">
              <textarea className={textareaCls} value={editing.icerik ?? ""} onChange={e => setEditing({ ...editing, icerik: e.target.value })}
                placeholder="Duyurunun detaylı içeriği…" />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
