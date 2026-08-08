// Duyuru Yönetimi — CRUD + dosya ekleri, sonuç sorgulama toggle, toplu sonuç yükleme,
// zengin metin editörü (Bold/Italic/H1-3/Liste/Tablo).

import { useState, useRef } from "react";
import {
  Plus, Trash2, Megaphone, Star, Upload, FileText, ToggleLeft, ToggleRight,
  Bold, Italic, Underline, List, ListOrdered, Table as TableIcon, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Palette,
} from "lucide-react";
import { useStore, actions, type Duyuru, type DuyuruEk, type DuyuruSonucKayit } from "../shared/store";
import { DataTable, Pill, Btn, Modal, Field, inputCls, selectCls, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";

const kategoriMap: Record<Duyuru["kategori"], { label: string; tone: "muted" | "info" | "warn" | "success" | "red" }> = {
  genel:       { label: "Genel",         tone: "muted"   },
  sinav:       { label: "Sınav",         tone: "info"    },
  yerlestirme: { label: "Yerleştirme",   tone: "success" },
  belge:       { label: "Belge",         tone: "warn"    },
  sistem:      { label: "Sistem",        tone: "red"     },
};

// ─── Basit zengin metin editörü ──────────────────────────────────────────────
function RichEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };
  const insertTable = () => {
    const rows = Math.max(1, parseInt(prompt("Satır sayısı?", "3") || "0", 10));
    const cols = Math.max(1, parseInt(prompt("Sütun sayısı?", "3") || "0", 10));
    let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0">';
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="border:1px solid #DDD;padding:6px 8px;font-size:13px">&nbsp;</td>`;
      }
      html += "</tr>";
    }
    html += "</table>";
    exec("insertHTML", html);
  };
  const btn = "w-[30px] h-[30px] flex items-center justify-center hover:bg-[#EEE] rounded text-[#555] transition-colors";
  return (
    <div className="border border-[#CCC] rounded-[3px] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-1.5 py-1 bg-[#F5F5F5] border-b border-[#CCC]">
        <button type="button" onClick={() => exec("bold")}       className={btn} title="Kalın (Bold)"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("italic")}     className={btn} title="İtalik"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("underline")}  className={btn} title="Altı Çizili"><Underline className="w-3.5 h-3.5" /></button>
        <span className="w-px h-5 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("formatBlock", "H1")} className={btn} title="Başlık 1"><Heading1 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("formatBlock", "H2")} className={btn} title="Başlık 2"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("formatBlock", "H3")} className={btn} title="Başlık 3"><Heading3 className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("formatBlock", "P")}  className={btn + " text-[11px] font-bold"} title="Paragraf">P</button>
        <span className="w-px h-5 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("insertUnorderedList")} className={btn} title="Madde Listesi"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("insertOrderedList")}   className={btn} title="Numaralı Liste"><ListOrdered className="w-3.5 h-3.5" /></button>
        <span className="w-px h-5 bg-[#CCC] mx-1" />
        <button type="button" onClick={() => exec("justifyLeft")}   className={btn} title="Sola Hizala"><AlignLeft   className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("justifyCenter")} className={btn} title="Ortaya Hizala"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onClick={() => exec("justifyRight")}  className={btn} title="Sağa Hizala"><AlignRight  className="w-3.5 h-3.5" /></button>
        <span className="w-px h-5 bg-[#CCC] mx-1" />
        <label className={btn + " cursor-pointer relative"} title="Yazı Rengi">
          <Palette className="w-3.5 h-3.5" />
          <input type="color" onChange={e => exec("foreColor", e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
        </label>
        <button type="button" onClick={insertTable} className={btn} title="Tablo Ekle"><TableIcon className="w-3.5 h-3.5" /></button>
      </div>
      <div
        ref={ref}
        contentEditable
        className="p-3 text-[13px] min-h-[180px] focus:outline-none prose-sm max-w-none"
        style={{ lineHeight: 1.5 }}
        onInput={e => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value || "<p>Duyuru içeriğinizi buraya yazın…</p>" }}
      />
    </div>
  );
}

export default function DuyuruYonetimi() {
  const store = useStore();
  const [editing, setEditing] = useState<Partial<Duyuru> | null>(null);
  const [aktifSekme, setAktifSekme] = useState<"temel" | "dosyalar" | "sorgulama" | "sonuclar">("temel");
  const [icerik, setIcerik] = useState("");
  const [ekAdi, setEkAdi] = useState(""); const [ekBoyut, setEkBoyut] = useState(0);
  const [sonucJson, setSonucJson] = useState("");

  const openNew = () => {
    setEditing({
      baslik: "", ozet: "", icerik: "",
      kategori: "genel", onemli: false, yayinlayan: "PGM",
      ekler: [], sonucSorgulamaAktif: false, sonuclar: [],
    });
    setIcerik(""); setAktifSekme("temel"); setEkAdi(""); setEkBoyut(0); setSonucJson("");
  };
  const openEdit = (d: Duyuru) => {
    setEditing(d);
    setIcerik(d.icerik ?? "");
    setSonucJson(JSON.stringify(d.sonuclar ?? [], null, 2));
    setAktifSekme("temel");
  };

  const save = () => {
    if (!editing || !editing.baslik) return alert("Başlık zorunlu.");
    let sonuclar = editing.sonuclar;
    if (sonucJson.trim()) {
      try { sonuclar = JSON.parse(sonucJson) as DuyuruSonucKayit[]; }
      catch { alert("Sonuç listesi JSON formatında değil, kaydedilmeyecek."); }
    }
    if (editing.id) {
      actions.duyuruGuncelle(editing.id, {
        ...editing, icerik, sonuclar,
      });
    } else {
      actions.duyuruEkle({
        baslik: editing.baslik,
        ozet: editing.ozet ?? "",
        icerik,
        kategori: (editing.kategori ?? "genel") as Duyuru["kategori"],
        onemli: !!editing.onemli,
        yayinlayan: editing.yayinlayan ?? "PGM",
        ilanId: editing.ilanId,
        ekler: editing.ekler ?? [],
        sonucSorgulamaAktif: editing.sonucSorgulamaAktif,
        sonuclar,
      });
    }
    setEditing(null);
  };

  const sil = (d: Duyuru) => { if (confirm(`"${d.baslik}" silinsin mi?`)) actions.duyuruSil(d.id); };

  const ekEkle = () => {
    if (!ekAdi || !editing) return;
    const yeni: DuyuruEk = { ad: ekAdi, boyutKB: ekBoyut };
    setEditing({ ...editing, ekler: [...(editing.ekler ?? []), yeni] });
    setEkAdi(""); setEkBoyut(0);
  };
  const ekSil = (i: number) => editing && setEditing({ ...editing, ekler: (editing.ekler ?? []).filter((_, j) => j !== i) });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] text-[#666]">
          Toplam <b>{store.duyurular.length}</b> duyuru. Sonuç sorgulama aktif olan duyurular ana sayfa
          duyurular panelinde görünür ve adaylar TCKN ile sonuçlarını sorgulayabilir.
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
                <div className="flex items-center gap-2 mt-1">
                  {r.ekler && r.ekler.length > 0 && (
                    <span className="text-[10.5px] text-[#666] flex items-center gap-1"><FileText className="w-3 h-3" /> {r.ekler.length} dosya</span>
                  )}
                  {r.sonucSorgulamaAktif && (
                    <span className="text-[10.5px] text-[#5E7F42] flex items-center gap-1"><ToggleRight className="w-3 h-3" /> Sonuç sorgulama aktif</span>
                  )}
                  {r.sonuclar && r.sonuclar.length > 0 && (
                    <span className="text-[10.5px] text-[#4A6FA5]">{r.sonuclar.length} kayıt</span>
                  )}
                </div>
              </div>
            ) },
          { key: "kat", header: "Kategori", width: "130px", render: r => <Pill tone={kategoriMap[r.kategori].tone}>{kategoriMap[r.kategori].label}</Pill> },
          { key: "yay", header: "Yayınlayan", width: "120px", render: r => <span className="text-[11.5px] text-[#666]">{r.yayinlayan}</span> },
          { key: "tar", header: "Tarih", width: "130px", render: r => <span className="text-[11.5px] text-[#666]">{trTarih(r.yayinTarihi, true)}</span> },
          { key: "act", header: "", width: "180px", align: "right", render: r => (
              <div className="flex justify-end gap-1">
                <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}>Düzenle</Btn>
                <Btn size="sm" variant="danger" onClick={() => sil(r)}><Trash2 className="w-3 h-3" /></Btn>
              </div>
            ) },
        ]}
        rows={store.duyurular.slice().sort((a, b) => b.yayinTarihi.localeCompare(a.yayinTarihi))}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} size="xl"
        title={editing?.id ? "Duyuru Düzenle" : "Yeni Duyuru"}
        footer={<>
          <Btn variant="ghost" onClick={() => setEditing(null)}>İptal</Btn>
          <Btn onClick={save}><Megaphone className="w-3.5 h-3.5" /> {editing?.id ? "Güncelle" : "Yayınla"}</Btn>
        </>}>
        {editing && (
          <>
            {/* Sekmeler */}
            <div className="flex border-b border-[#DDD] mb-4">
              {([
                ["temel",      "Temel Bilgiler"],
                ["dosyalar",   "Duyuruya İlişkin Dosyalar"],
                ["sorgulama",  "Sonuç Sorgulama"],
                ["sonuclar",   "Sonuç Listesi"],
              ] as const).map(([id, ad]) => (
                <button key={id} onClick={() => setAktifSekme(id)}
                  className={`px-4 py-2 text-[12.5px] font-semibold border-b-2 transition-colors ${aktifSekme === id ? "border-[#A82232] text-[#A82232]" : "border-transparent text-[#888] hover:text-[#333]"}`}>
                  {ad}
                </button>
              ))}
            </div>

            {aktifSekme === "temel" && (
              <div className="space-y-3">
                <Field label="Başlık" required>
                  <input className={inputCls} value={editing.baslik ?? ""} onChange={e => setEditing({ ...editing, baslik: e.target.value })}
                    placeholder="Örn: 2026/3 Sözleşmeli Er Yerleştirme Sonuçları" />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Kategori" required>
                    <select className={selectCls} value={editing.kategori ?? "genel"} onChange={e => setEditing({ ...editing, kategori: e.target.value as Duyuru["kategori"] })}>
                      {Object.entries(kategoriMap).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Yayınlayan Birim">
                    <input className={inputCls} value={editing.yayinlayan ?? ""} onChange={e => setEditing({ ...editing, yayinlayan: e.target.value })}
                      placeholder="PGM / Bilgi İşlem / …" />
                  </Field>
                  <Field label="İlgili İlan (opsiyonel)">
                    <select className={selectCls} value={editing.ilanId ?? ""} onChange={e => setEditing({ ...editing, ilanId: e.target.value || undefined })}>
                      <option value="">İlişkilendirme yok</option>
                      {store.ilanlar.map(i => <option key={i.id} value={i.id}>{i.baslik}</option>)}
                    </select>
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
                <Field label="İçerik (Zengin Metin Editörü)">
                  <RichEditor value={icerik} onChange={setIcerik} />
                </Field>
              </div>
            )}

            {aktifSekme === "dosyalar" && (
              <div className="space-y-3">
                <p className="text-[12.5px] text-[#666]">
                  Bu duyuru altında adayların indireceği ek dosyaları yükleyin (Örn: Taban Puan Tablosu, İlan Kılavuzu).
                  Aday tarafında "Duyuruya İlişkin Dosyalar" bölümünde görünürler.
                </p>
                <div className="border border-dashed border-[#CCC] rounded p-3 bg-[#FAFAFA] flex items-center gap-2">
                  <label className={"cursor-pointer inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-semibold text-[#333] bg-white border border-[#CCC] rounded"}>
                    <Upload className="w-3.5 h-3.5" /> Dosya Seç
                    <input type="file" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) { setEkAdi(f.name); setEkBoyut(Math.round(f.size / 1024)); } }} />
                  </label>
                  <input className={inputCls + " flex-1"} placeholder="Görünen ad (Örn: Görevde Yükselme Taban Puanı Tablosu)"
                    value={ekAdi} onChange={e => setEkAdi(e.target.value)} />
                  <input className={inputCls + " w-24"} type="number" placeholder="KB" value={ekBoyut} onChange={e => setEkBoyut(Number(e.target.value))} />
                  <Btn onClick={ekEkle} size="sm"><Plus className="w-3.5 h-3.5" /> Ekle</Btn>
                </div>
                <div className="border border-[#E0E0E0] rounded overflow-hidden">
                  <table className="w-full text-[12.5px]">
                    <thead className="bg-[#F5F5F5]">
                      <tr><th className="px-3 py-2 text-left text-[11px] uppercase font-bold text-[#555]">Ad</th>
                          <th className="px-3 py-2 text-right text-[11px] uppercase font-bold text-[#555] w-24">Boyut</th>
                          <th className="px-3 py-2 w-16"></th></tr>
                    </thead>
                    <tbody>
                      {(editing.ekler ?? []).length === 0 ? (
                        <tr><td colSpan={3} className="p-4 text-center text-[#888] italic">Henüz dosya eklenmemiş.</td></tr>
                      ) : (editing.ekler ?? []).map((ek, i) => (
                        <tr key={i} className={i % 2 === 0 ? "" : "bg-[#FAFAFA]"}>
                          <td className="px-3 py-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-[#A82232]" /> {ek.ad}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{ek.boyutKB} KB</td>
                          <td className="px-3 py-2 text-right"><button onClick={() => ekSil(i)} className="text-[11.5px] text-[#A82232] hover:underline">Sil</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {aktifSekme === "sorgulama" && (
              <div className="space-y-3">
                <div className="p-4 rounded border" style={{ background: MSB.infoBg, borderColor: MSB.infoBrd, color: MSB.infoText }}>
                  <p className="text-[13px]">
                    <strong>Sonuç Sorgulama Modülü</strong> — Aktif olduğunda aday duyuru sayfasında TC Kimlik No + Captcha ile bireysel sonucunu sorgular.
                    Pasif olduğunda yalnızca bilgilendirme metni ve dosyalar görünür.
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 border border-[#DDD] rounded bg-white">
                  <div>
                    <div className="text-[13px] font-bold text-[#333]">TCKN ile bireysel sonuç sorgulama ekranı</div>
                    <div className="text-[11.5px] text-[#888] mt-0.5">
                      Aktif: Aday görebilir · Pasif: Yalnızca dosyalar ve bilgi metni görünür
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing({ ...editing, sonucSorgulamaAktif: !editing.sonucSorgulamaAktif })}
                    className="flex items-center gap-2 text-[13px] font-bold"
                    style={{ color: editing.sonucSorgulamaAktif ? "#5E7F42" : "#888" }}
                  >
                    {editing.sonucSorgulamaAktif ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    {editing.sonucSorgulamaAktif ? "AKTİF" : "PASİF"}
                  </button>
                </div>
              </div>
            )}

            {aktifSekme === "sonuclar" && (
              <div className="space-y-3">
                <div className="p-4 rounded border" style={{ background: MSB.warnBg, borderColor: MSB.warnBrd, color: MSB.orange }}>
                  <p className="text-[13px]">
                    Yerleştirme simülasyonu sonrası üretilen <strong>nihai Excel/CSV listesini</strong> aşağıdaki alana JSON olarak yapıştırın.
                    Aday TCKN ile sorguladığında sistem bu listeden eşleşen kaydı gösterecektir.
                  </p>
                </div>
                <Field label={`Sonuç Kayıtları (JSON) — Toplam: ${(editing.sonuclar ?? []).length}`}>
                  <textarea className="w-full px-3 py-2 text-[11.5px] font-mono bg-[#FAFAFA] border border-[#CCC] rounded-[3px] min-h-[240px] focus:outline-none focus:border-[#A82232]"
                    value={sonucJson}
                    onChange={e => setSonucJson(e.target.value)}
                    placeholder={`[
  { "tc": "18878273464", "ad": "YUSUF", "soyad": "ÖZDEMİR", "program": "Kara Kuvvetleri Sözleşmeli Er", "statu": "Asil", "sira": 42, "puan": 82.4, "sonucKodu": "SR-2026-042", "sonucTarihi": "2026-07-28T09:00:00.000Z" }
]`} />
                </Field>
                <div className="text-[11.5px] text-[#888]">
                  Alanlar: <code>tc, ad, soyad, program, statu ("Asil"|"Yedek"|"Yerleşemedi"|"Red"), sira, puan, sonucKodu, gerekce, sonucTarihi</code>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
