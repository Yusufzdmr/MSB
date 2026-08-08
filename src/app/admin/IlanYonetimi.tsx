// İlan Yönetimi — CRUD, filtre, kontenjan/puan/tarih düzenleme.

import { useState, useMemo } from "react";
import { Plus, Edit3, Trash2, Search, Filter, Eye, Send, Archive } from "lucide-react";
import { useStore, actions, type Ilan, type Kuvvet, type Sinif, type EgitimSeviyesi, type Cinsiyet, type IlanDurum } from "../shared/store";
import { DataTable, Pill, Btn, Modal, Field, inputCls, selectCls, textareaCls, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";

const KUV: Kuvvet[] = ["Kara", "Deniz", "Hava", "Jandarma", "Sahil Güvenlik", "MSB Merkez"];
const SIN: Sinif[] = ["Subay", "Astsubay", "Uzman Erbaş", "Sözleşmeli Er", "Sivil Memur"];
const EGT: EgitimSeviyesi[] = ["Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];
const CIN: Cinsiyet[] = ["Erkek", "Kadın", "Farketmez"];
const DUR: IlanDurum[] = ["taslak", "yayin", "kapali", "yerlestirildi"];

const durumTone = { taslak: "muted", yayin: "success", kapali: "danger", yerlestirildi: "info" } as const;
const durumLabel = { taslak: "Taslak", yayin: "Yayında", kapali: "Kapalı", yerlestirildi: "Yerleştirildi" } as const;

const bosIlan: Omit<Ilan, "id" | "yerlesen" | "basvuranSayisi" | "olusturmaTarihi"> = {
  baslik: "", kuvvet: "Kara", sinif: "Subay", kontenjan: 100,
  baslangic: new Date().toISOString().slice(0, 10),
  bitis: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
  minPuan: 70, egitim: "Lisans", cinsiyet: "Farketmez",
  yasMin: 21, yasMax: 30, aciklama: "", sehir: "Türkiye Geneli", durum: "taslak", kriterler: [],
};

export default function IlanYonetimi() {
  const store = useStore();
  const [filtreKuv, setFiltreKuv] = useState<Kuvvet | "">("");
  const [filtreDur, setFiltreDur] = useState<IlanDurum | "">("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Ilan> | null>(null);
  const [krtInput, setKrtInput] = useState("");

  const filtered = useMemo(() => store.ilanlar.filter(i =>
    (!filtreKuv || i.kuvvet === filtreKuv) &&
    (!filtreDur || i.durum === filtreDur) &&
    (!q || i.baslik.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase()))
  ), [store.ilanlar, filtreKuv, filtreDur, q]);

  const openNew  = () => { setEditing({ ...bosIlan }); setKrtInput(""); };
  const openEdit = (i: Ilan) => { setEditing(i); setKrtInput(""); };
  const close    = () => { setEditing(null); setKrtInput(""); };

  const save = () => {
    if (!editing || !editing.baslik) return alert("Başlık zorunlu.");
    if (editing.id) {
      actions.ilanGuncelle(editing.id, editing);
    } else {
      actions.ilanEkle(editing as Omit<Ilan, "id" | "yerlesen" | "basvuranSayisi" | "olusturmaTarihi" | "durum"> & { durum?: IlanDurum });
    }
    close();
  };

  const yayinla = (i: Ilan) => actions.ilanGuncelle(i.id, { durum: "yayin" });
  const kapat   = (i: Ilan) => actions.ilanGuncelle(i.id, { durum: "kapali" });
  const sil     = (i: Ilan) => { if (confirm(`"${i.baslik}" silinsin mi?`)) actions.ilanSil(i.id); };

  const addKriter = () => {
    if (!krtInput.trim() || !editing) return;
    setEditing({ ...editing, kriterler: [...(editing.kriterler ?? []), krtInput.trim()] });
    setKrtInput("");
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" strokeWidth={2} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Başlık veya ID ile ara…"
            className={inputCls.replace("w-full", "w-full") + " pl-9"} />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#888]" strokeWidth={2} />
          <select value={filtreKuv} onChange={e => setFiltreKuv(e.target.value as Kuvvet | "")} className={selectCls + " w-[150px]"}>
            <option value="">Tüm kuvvetler</option>
            {KUV.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={filtreDur} onChange={e => setFiltreDur(e.target.value as IlanDurum | "")} className={selectCls + " w-[140px]"}>
            <option value="">Tüm durumlar</option>
            {DUR.map(d => <option key={d} value={d}>{durumLabel[d]}</option>)}
          </select>
        </div>
        <div className="ml-auto">
          <Btn onClick={openNew}><Plus className="w-3.5 h-3.5" /> Yeni İlan</Btn>
        </div>
      </div>

      <DataTable<Ilan>
        columns={[
          { key: "id", header: "İlan No", width: "120px", render: r => <span className="font-mono text-[11.5px] text-[#666]">{r.id}</span> },
          { key: "baslik", header: "Başlık", render: r => (
              <div>
                <div className="font-semibold text-[12.5px]" style={{ color: MSB.ink }}>{r.baslik}</div>
                <div className="text-[10.5px] text-[#888]">{r.kuvvet} · {r.sinif} · {r.egitim}</div>
              </div>
            ) },
          { key: "kontenjan", header: "Kontenjan", width: "120px", align: "right", render: r => (
              <div>
                <div className="tabular-nums font-bold">{r.basvuranSayisi} / {r.kontenjan}</div>
                <div className="text-[10px] text-[#888]">başvuru / kontenjan</div>
              </div>
            ) },
          { key: "tarih", header: "Başv. Tarihi", width: "160px", render: r => (
              <div className="text-[11.5px] text-[#666]">
                <div>{trTarih(r.baslangic)}</div>
                <div>→ {trTarih(r.bitis)}</div>
              </div>
            ) },
          { key: "durum", header: "Durum", width: "110px", render: r => <Pill tone={durumTone[r.durum]}>{durumLabel[r.durum]}</Pill> },
          { key: "act", header: "İşlem", width: "230px", align: "right", render: r => (
              <div className="flex items-center gap-1 justify-end">
                {r.durum === "taslak" && <Btn size="sm" variant="success" onClick={() => yayinla(r)}><Send className="w-3 h-3" /> Yayınla</Btn>}
                {r.durum === "yayin" && <Btn size="sm" variant="ghost" onClick={() => kapat(r)}><Archive className="w-3 h-3" /> Kapat</Btn>}
                <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit3 className="w-3 h-3" /></Btn>
                <Btn size="sm" variant="danger" onClick={() => sil(r)}><Trash2 className="w-3 h-3" /></Btn>
              </div>
            ) },
        ]}
        rows={filtered}
        empty={<>Filtreye uyan ilan yok. <button onClick={openNew} className="underline" style={{ color: MSB.red }}>Yeni ilan oluştur</button>.</>}
      />

      {/* Edit / New modal */}
      <Modal open={!!editing} onClose={close} size="lg"
        title={editing?.id ? `İlan Düzenle — ${editing.id}` : "Yeni İlan Oluştur"}
        footer={<>
          <Btn variant="ghost" onClick={close}>İptal</Btn>
          <Btn onClick={save}>Kaydet</Btn>
        </>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Başlık" required>
                <input value={editing.baslik ?? ""} onChange={e => setEditing({ ...editing, baslik: e.target.value })}
                  className={inputCls} placeholder="Örn: 2026 Yılı Muvazzaf Subay Temini" />
              </Field>
            </div>

            <Field label="Kuvvet Komutanlığı" required>
              <select className={selectCls} value={editing.kuvvet} onChange={e => setEditing({ ...editing, kuvvet: e.target.value as Kuvvet })}>
                {KUV.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Sınıf" required>
              <select className={selectCls} value={editing.sinif} onChange={e => setEditing({ ...editing, sinif: e.target.value as Sinif })}>
                {SIN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>

            <Field label="Kontenjan" required>
              <input type="number" min={1} className={inputCls} value={editing.kontenjan}
                onChange={e => setEditing({ ...editing, kontenjan: Number(e.target.value) })} />
            </Field>
            <Field label="Min. Puan (KPSS/YKS)" required>
              <input type="number" min={0} max={100} step={0.1} className={inputCls} value={editing.minPuan}
                onChange={e => setEditing({ ...editing, minPuan: Number(e.target.value) })} />
            </Field>

            <Field label="Başvuru Başlangıç" required>
              <input type="date" className={inputCls} value={editing.baslangic}
                onChange={e => setEditing({ ...editing, baslangic: e.target.value })} />
            </Field>
            <Field label="Başvuru Bitiş" required>
              <input type="date" className={inputCls} value={editing.bitis}
                onChange={e => setEditing({ ...editing, bitis: e.target.value })} />
            </Field>

            <Field label="Eğitim Seviyesi" required>
              <select className={selectCls} value={editing.egitim} onChange={e => setEditing({ ...editing, egitim: e.target.value as EgitimSeviyesi })}>
                {EGT.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Cinsiyet" required>
              <select className={selectCls} value={editing.cinsiyet} onChange={e => setEditing({ ...editing, cinsiyet: e.target.value as Cinsiyet })}>
                {CIN.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>

            <Field label="Yaş Min">
              <input type="number" min={17} max={50} className={inputCls} value={editing.yasMin}
                onChange={e => setEditing({ ...editing, yasMin: Number(e.target.value) })} />
            </Field>
            <Field label="Yaş Max">
              <input type="number" min={17} max={50} className={inputCls} value={editing.yasMax}
                onChange={e => setEditing({ ...editing, yasMax: Number(e.target.value) })} />
            </Field>

            <Field label="Boy (cm) — opsiyonel">
              <input type="number" className={inputCls} value={editing.boyMin ?? ""}
                onChange={e => setEditing({ ...editing, boyMin: e.target.value ? Number(e.target.value) : undefined })} />
            </Field>
            <Field label="Şehir(ler)">
              <input className={inputCls} value={editing.sehir ?? ""} onChange={e => setEditing({ ...editing, sehir: e.target.value })} />
            </Field>

            <div className="col-span-2">
              <Field label="Açıklama">
                <textarea className={textareaCls} value={editing.aciklama ?? ""}
                  onChange={e => setEditing({ ...editing, aciklama: e.target.value })}
                  placeholder="Bu ilana ilişkin genel bilgiler, süreç detayları, iletişim bilgileri…" />
              </Field>
            </div>

            <div className="col-span-2">
              <Field label="Özel Kriterler" hint="Enter ile ekle. Aday panelinde başvuru gerekliliği olarak gösterilir.">
                <div className="flex gap-1">
                  <input className={inputCls} value={krtInput} onChange={e => setKrtInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKriter(); } }}
                    placeholder="Örn: Sağlık raporu, İngilizce YDS 70+, Ehliyet B sınıfı…" />
                  <Btn variant="light" onClick={addKriter}><Plus className="w-3.5 h-3.5" /></Btn>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(editing.kriterler ?? []).map((k, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] rounded-full border" style={{ background: MSB.bgSoft, borderColor: MSB.border }}>
                      {k}
                      <button onClick={() => setEditing({ ...editing, kriterler: (editing.kriterler ?? []).filter((_, j) => j !== i) })}
                        className="text-[#999] hover:text-[#A82232] font-bold">×</button>
                    </span>
                  ))}
                </div>
              </Field>
            </div>

            <Field label="Durum">
              <select className={selectCls} value={editing.durum ?? "taslak"} onChange={e => setEditing({ ...editing, durum: e.target.value as IlanDurum })}>
                {DUR.map(d => <option key={d} value={d}>{durumLabel[d]}</option>)}
              </select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
}
