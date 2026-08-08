// İlan Yönetimi — CRUD, filtre, kontenjan/puan/tarih düzenleme.

import { useState, useMemo } from "react";
import { Plus, Edit3, Trash2, Search, Filter, Eye, Send, Archive, Play, Award, Upload, FileText, X } from "lucide-react";
import { useStore, actions, type Ilan, type Kuvvet, type Sinif, type EgitimSeviyesi, type Cinsiyet, type IlanDurum, type AltBirim, type SinavTuru } from "../shared/store";
import { DataTable, Pill, Btn, Modal, Field, inputCls, selectCls, textareaCls, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";

const KUV: Kuvvet[] = ["Kara", "Deniz", "Hava", "Jandarma", "Sahil Güvenlik", "MSB Merkez"];
const SIN: Sinif[] = ["Subay", "Astsubay", "Uzman Erbaş", "Sözleşmeli Er", "Sivil Memur"];
const EGT: EgitimSeviyesi[] = ["Lise", "Ön Lisans", "Lisans", "Yüksek Lisans", "Doktora"];
const CIN: Cinsiyet[] = ["Erkek", "Kadın", "Farketmez"];
const DUR: IlanDurum[] = ["taslak", "yayin", "kapali", "yerlestirildi"];

const durumTone = { taslak: "muted", yayin: "success", kapali: "warn", yerlestirildi: "info" } as const;
const durumLabel = { taslak: "Taslak", yayin: "Aktif (Yayında)", kapali: "Süresi Doldu / İncelemede", yerlestirildi: "Sonuçlandı" } as const;

const SINAVLAR: SinavTuru[] = ["YDS", "YKS", "AGS", "TUS", "DUS", "YDT", "MSÜ", "DGS", "KPSS Lisans", "KPSS Ön Lisans", "ALES", "TR-YÖS"];

const bosIlan: Omit<Ilan, "id" | "yerlesen" | "basvuranSayisi" | "olusturmaTarihi"> = {
  baslik: "", kurum: "", kuvvet: "Kara", sinif: "Subay",
  kontenjan: 100, kontenjanYedek: 30,
  baslangic: new Date().toISOString().slice(0, 10), baslangicSaat: "09:00",
  bitis: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10), bitisSaat: "23:59",
  minPuan: 70, egitim: "Lisans", cinsiyet: "Farketmez",
  yasMin: 21, yasMax: 30, aciklama: "", sehir: "Türkiye Geneli", durum: "taslak", kriterler: [],
  altBirimler: [],
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

  const save = (overrideDurum?: IlanDurum) => {
    if (!editing || !editing.baslik) return alert("Başlık zorunlu.");
    const payload = overrideDurum ? { ...editing, durum: overrideDurum } : editing;
    if (payload.id) {
      actions.ilanGuncelle(payload.id, payload);
    } else {
      actions.ilanEkle(payload as Omit<Ilan, "id" | "yerlesen" | "basvuranSayisi" | "olusturmaTarihi" | "durum"> & { durum?: IlanDurum });
    }
    close();
  };

  const yayinla = (i: Ilan) => actions.ilanGuncelle(i.id, { durum: "yayin" });
  const kapat   = (i: Ilan) => actions.ilanGuncelle(i.id, { durum: "kapali" });
  const sil     = (i: Ilan) => { if (confirm(`"${i.baslik}" silinsin mi?`)) actions.ilanSil(i.id); };
  const runSimulasyon = (id: string) => {
    const y = actions.yerlestirmeCalistir(id, "otomatik", "yonetici");
    alert(y ? `Simülasyon çalıştırıldı. ${y.sonuclar.length} aday değerlendirildi. Sonuçları yayınlamak için "Sonuçları Yayınla" tuşuna basın.` : "Simülasyon çalıştırılamadı.");
  };
  const yayinlaSonuc = (id: string) => {
    const y = store.yerlestirmeler.find(x => x.ilanId === id && !x.yayinlandi);
    if (!y) return alert("Önce simülasyonu çalıştırın.");
    actions.yerlestirmeYayinla(y.id);
    alert("Sonuçlar yayınlandı. İlan artık 'Güncel Duyurular' panelinde görünür.");
  };
  const ekTercihBaslatFn = (id: string) => {
    const bitis = prompt("Ek tercih bitiş tarihi (YYYY-MM-DD)?", new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
    if (!bitis) return;
    actions.ekTercihBaslat(id, bitis);
    alert(`Ek tercih dönemi başlatıldı. Bitiş: ${bitis}. Kalan kontenjanlar sıralamadaki adaylara yeniden açıldı.`);
  };
  const ekTercihSimulasyonFn = (id: string) => {
    const indirimStr = prompt("Ek tercih için taban puan İNDİRİMİ (0 = aynı taban)? Örn: 10 → taban 70 → 60", "0");
    if (indirimStr === null) return;
    const indirim = Number(indirimStr) || 0;
    const y = actions.ekTercihSimulasyonuCalistir(id, { tabanIndirimi: indirim });
    if (!y || y.sonuclar.length === 0) return alert("Boş kontenjan kalmadı ya da ek tercih için uygun aday bulunamadı.");
    const yerlesen = y.sonuclar.filter(r => r.durum === "yerlesti").length;
    alert(`Ek tercih simülasyonu tamamlandı.\n\n• Boş kontenjan doldurulan: ${yerlesen} aday\n• Değerlendirilen: ${y.sonuclar.length}\n\nSonuçları yayınlamak için "Sonuçları Yayınla" tuşunu kullanın.`);
  };
  const kesinKayitBaslatFn = (id: string) => {
    const bitis = prompt("Kesin kayıt bitiş tarihi (YYYY-MM-DD)?", new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
    if (!bitis) return;
    actions.kesinKayitBaslat(id, bitis);
    alert(`Kesin kayıt dönemi başlatıldı. Bitiş: ${bitis}. Asil adaylara bildirim gönderildi.`);
  };

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
          { key: "act", header: "İşlem", width: "340px", align: "right", render: r => (
              <div className="flex items-center gap-1 justify-end flex-wrap">
                {r.durum === "taslak" && <Btn size="sm" variant="success" onClick={() => yayinla(r)}><Send className="w-3 h-3" /> Yayınla</Btn>}
                {r.durum === "yayin"  && <Btn size="sm" variant="ghost"   onClick={() => kapat(r)}><Archive className="w-3 h-3" /> Süreyi Bitir</Btn>}
                {r.durum === "kapali" && <Btn size="sm" variant="ghost"   onClick={() => runSimulasyon(r.id)}><Play className="w-3 h-3" /> Simülasyon</Btn>}
                {r.durum === "kapali" && <Btn size="sm" variant="success" onClick={() => yayinlaSonuc(r.id)}><Award className="w-3 h-3" /> Sonuçları Yayınla</Btn>}
                {r.durum === "yerlestirildi" && !r.kesinKayitAktif && <Btn size="sm" variant="light" onClick={() => kesinKayitBaslatFn(r.id)}>Kesin Kayıt Başlat</Btn>}
                {r.durum === "yerlestirildi" && !r.ekTercihAktif && <Btn size="sm" variant="light" onClick={() => ekTercihBaslatFn(r.id)}>Ek Tercih Aç</Btn>}
                {r.durum === "yerlestirildi" && r.ekTercihAktif && <Btn size="sm" variant="ghost" onClick={() => ekTercihSimulasyonFn(r.id)}><Play className="w-3 h-3" /> Ek Tercih Simülasyonu</Btn>}
                {r.durum === "yerlestirildi" && r.ekTercihAktif && <Btn size="sm" variant="ghost" onClick={() => { actions.ekTercihKapat(r.id); alert("Ek tercih dönemi kapatıldı."); }}>Ek Tercihi Kapat</Btn>}
                <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}><Edit3 className="w-3 h-3" /></Btn>
                <Btn size="sm" variant="danger" onClick={() => sil(r)}><Trash2 className="w-3 h-3" /></Btn>
              </div>
            ) },
        ]}
        rows={filtered}
        empty={<>Filtreye uyan ilan yok. <button onClick={openNew} className="underline" style={{ color: MSB.red }}>Yeni ilan oluştur</button>.</>}
      />

      {/* Edit / New modal */}
      <Modal open={!!editing} onClose={close} size="xl"
        title={editing?.id ? `İlan Düzenle — ${editing.id}` : "Yeni İlan Oluştur (Sihirbaz)"}
        footer={<>
          <Btn variant="ghost" onClick={close}>İptal</Btn>
          <Btn onClick={() => save("taslak")}>Taslak Kaydet</Btn>
          <Btn onClick={() => save("yayin")}><Send className="w-3.5 h-3.5" /> İlanı Yayınla</Btn>
        </>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">1. Temel Bilgiler</h4>
            </div>
            <div className="col-span-2">
              <Field label="İlan Adı / Başlığı" required>
                <input value={editing.baslik ?? ""} onChange={e => setEditing({ ...editing, baslik: e.target.value })}
                  className={inputCls} placeholder="Örn: KARA, DENİZ VE HAVA KUVVETLERİ KOMUTANLIKLARINA UZMAN ERBAŞ TEMİNİ" />
              </Field>
            </div>
            <Field label="Kurum / Birim">
              <input value={editing.kurum ?? ""} onChange={e => setEditing({ ...editing, kurum: e.target.value })}
                className={inputCls} placeholder="Örn: Personel Genel Müdürlüğü — Temin Daire Bşk." />
            </Field>
            <Field label="Şehir(ler)">
              <input className={inputCls} value={editing.sehir ?? ""} onChange={e => setEditing({ ...editing, sehir: e.target.value })} />
            </Field>

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

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">2. Takvim ve Zaman Planlaması</h4>
              <p className="text-[10.5px] text-[#888] mt-0.5">Bitiş tarih/saati dolduğunda sistem otomatik olarak tercih butonlarını kapatır ve ilanı "Süresi Doldu / İncelemede" statüsüne alır.</p>
            </div>

            <Field label="Başvuru Başlangıç Tarihi" required>
              <input type="date" className={inputCls} value={editing.baslangic}
                onChange={e => setEditing({ ...editing, baslangic: e.target.value })} />
            </Field>
            <Field label="Başlangıç Saati">
              <input type="time" className={inputCls} value={editing.baslangicSaat ?? "09:00"}
                onChange={e => setEditing({ ...editing, baslangicSaat: e.target.value })} />
            </Field>
            <Field label="Başvuru Bitiş Tarihi" required>
              <input type="date" className={inputCls} value={editing.bitis}
                onChange={e => setEditing({ ...editing, bitis: e.target.value })} />
            </Field>
            <Field label="Bitiş Saati">
              <input type="time" className={inputCls} value={editing.bitisSaat ?? "23:59"}
                onChange={e => setEditing({ ...editing, bitisSaat: e.target.value })} />
            </Field>

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">3. İlan Kılavuzu (PDF)</h4>
            </div>
            <div className="col-span-2">
              <Field label="Resmi Kılavuz PDF (Aday tercih ekranında incelenir)">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 h-[34px] px-3 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCC] rounded-[3px] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> Dosya Seç
                    <input type="file" accept="application/pdf" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setEditing({ ...editing, kilavuzAdi: f.name }); }} />
                  </label>
                  {editing.kilavuzAdi && (
                    <span className="flex items-center gap-1.5 text-[12.5px] text-[#333]">
                      <FileText className="w-3.5 h-3.5 text-[#A82232]" /> {editing.kilavuzAdi}
                      <button onClick={() => setEditing({ ...editing, kilavuzAdi: undefined })} className="text-[#A82232]"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                </div>
              </Field>
            </div>

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">4. Kontenjan Tanımlama</h4>
            </div>
            <Field label="Toplam Asil Kontenjan" required>
              <input type="number" min={1} className={inputCls} value={editing.kontenjan}
                onChange={e => setEditing({ ...editing, kontenjan: Number(e.target.value) })} />
            </Field>
            <Field label="Toplam Yedek Kontenjan">
              <input type="number" min={0} className={inputCls} value={editing.kontenjanYedek ?? 0}
                onChange={e => setEditing({ ...editing, kontenjanYedek: Number(e.target.value) })} />
            </Field>

            <div className="col-span-2">
              <Field label="Alt Birimler (Opsiyonel — her alt birim için asil/yedek)" hint="Örn: Kara Harp Okulu: 100 Asil / 50 Yedek">
                <div className="space-y-1.5">
                  {(editing.altBirimler ?? []).map((ab, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <input className={inputCls + " flex-1"} placeholder="Alt birim adı" value={ab.ad}
                        onChange={e => setEditing({ ...editing, altBirimler: (editing.altBirimler ?? []).map((x, j) => j === i ? { ...x, ad: e.target.value } : x) })} />
                      <input type="number" className={inputCls + " w-24"} placeholder="Asil" value={ab.kontenjanAsil}
                        onChange={e => setEditing({ ...editing, altBirimler: (editing.altBirimler ?? []).map((x, j) => j === i ? { ...x, kontenjanAsil: Number(e.target.value) } : x) })} />
                      <input type="number" className={inputCls + " w-24"} placeholder="Yedek" value={ab.kontenjanYedek}
                        onChange={e => setEditing({ ...editing, altBirimler: (editing.altBirimler ?? []).map((x, j) => j === i ? { ...x, kontenjanYedek: Number(e.target.value) } : x) })} />
                      <button onClick={() => setEditing({ ...editing, altBirimler: (editing.altBirimler ?? []).filter((_, j) => j !== i) })}
                        className="text-[#A82232] p-1"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <Btn variant="light" size="sm" onClick={() => setEditing({ ...editing, altBirimler: [...(editing.altBirimler ?? []), { ad: "", kontenjanAsil: 0, kontenjanYedek: 0 } as AltBirim] })}>
                    <Plus className="w-3.5 h-3.5" /> Alt Birim Ekle
                  </Btn>
                </div>
              </Field>
            </div>

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">5. Kriter ve Koşul Tanımları</h4>
            </div>

            <Field label="Sınav Şartı" hint="Bu ilana başvurmak için zorunlu sınav">
              <select className={selectCls} value={editing.sinavSarti ?? ""} onChange={e => setEditing({ ...editing, sinavSarti: (e.target.value || undefined) as SinavTuru | undefined })}>
                <option value="">Şart yok</option>
                {SINAVLAR.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Min. Puan (Taban)" required>
              <input type="number" min={0} max={500} step={0.1} className={inputCls} value={editing.minPuan}
                onChange={e => setEditing({ ...editing, minPuan: Number(e.target.value) })} />
            </Field>
            <Field label="Ön Eleme: Min Sıralama" hint="Örn: ilk 50.000 sıralamayı geç">
              <input type="number" min={0} className={inputCls} value={editing.kriterOnEleme?.minSiralama ?? ""}
                onChange={e => setEditing({ ...editing, kriterOnEleme: { ...editing.kriterOnEleme, minSiralama: e.target.value ? Number(e.target.value) : undefined } })} />
            </Field>
            <Field label="Maksimum Tercih Adedi" hint="Aday kaç adet tercih yazabilir (Örn: 4)">
              <input type="number" min={1} max={30} className={inputCls} value={editing.maxTercih ?? ""}
                onChange={e => setEditing({ ...editing, maxTercih: e.target.value ? Number(e.target.value) : undefined })} />
            </Field>

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">Yerleştirme Algoritması</h4>
            </div>
            <div className="col-span-2 space-y-2">
              <label className="flex items-start gap-2.5 p-3 border border-[#DDD] rounded cursor-pointer hover:bg-[#FAFAFA]">
                <input type="radio" name="algoritma" className="mt-1 accent-[#A82232]" checked={(editing.algoritma ?? "havuz") === "havuz"}
                  onChange={() => setEditing({ ...editing, algoritma: "havuz" })} />
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#333]">Seçenek A — Havuz / Puan Üstünlüğü</div>
                  <div className="text-[11.5px] text-[#666] mt-0.5">
                    Adaylar Nihai Puana (Ham × K_tercih) göre yüksekten düşüğe sıralanır. Puan üstünlüğü esas alınır. Şehit/Gazi eşitlik önceliği + K_tercih (1.05/1.02/1.00) uygulanır.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-2.5 p-3 border border-[#DDD] rounded cursor-pointer hover:bg-[#FAFAFA]">
                <input type="radio" name="algoritma" className="mt-1 accent-[#A82232]" checked={editing.algoritma === "osym_iteratif"}
                  onChange={() => setEditing({ ...editing, algoritma: "osym_iteratif" })} />
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-[#333]">Seçenek B — ÖSYM Mantığı / Tercih Öncelikli İteratif</div>
                  <div className="text-[11.5px] text-[#666] mt-0.5">
                    <strong>Tur 1</strong>: Tüm adayların <strong>1. tercihleri</strong> puan sırasına göre yerleştirilir; dolan program dışındakiler <strong>2. tercihe</strong> gider.<br />
                    <strong>Tur 2+</strong>: Yerleşememişler sırasıyla 2., 3., ... tercihlerine kaydırılır. Tercih sırası merkez alınır.
                  </div>
                </div>
              </label>
              <div className="text-[11px] text-[#888] italic">
                ⓘ İki algoritmanın da Ham Puan formülü aynıdır: <strong>ÖSYM Sınav Puanı + Bonservis Puanı</strong>. Fark, yerleştirme mantığındadır.
              </div>
            </div>

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

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">6. Mali ve Ödeme Ayarları</h4>
            </div>

            <Field label="Ödeme Kuralı">
              <select className={selectCls} value={editing.odemeKurali ?? "yok"} onChange={e => setEditing({ ...editing, odemeKurali: e.target.value as any })}>
                <option value="yok">Ücretsiz İlan (Pasif)</option>
                <option value="once_tercih_sonra_odeme">A. Önce Tercih, Sonra Ödeme (Önerilen)</option>
                <option value="once_odeme_sonra_tercih">B. Önce Ödeme, Sonra Tercih</option>
              </select>
            </Field>
            <Field label="Ücret Tutarı (TL)">
              <input type="number" min={0} className={inputCls} value={editing.ucretTutari ?? 0}
                onChange={e => setEditing({ ...editing, ucretTutari: Number(e.target.value) })}
                disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
            </Field>
            <Field label="Ödeme Vadesi (saat)" hint="Ödeme adımı başladığından itibaren tanınan süre">
              <input type="number" min={1} className={inputCls} value={editing.odemeVadeSaat ?? 48}
                onChange={e => setEditing({ ...editing, odemeVadeSaat: Number(e.target.value) })}
                disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
            </Field>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-[12.5px] cursor-pointer" title="Şehit/gazi yakınları için ödeme adımını atla">
                <input type="checkbox" className="w-4 h-4 accent-[#A82232]" checked={!!editing.sehitGaziUcretMuaf}
                  onChange={e => setEditing({ ...editing, sehitGaziUcretMuaf: e.target.checked })}
                  disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
                <span>Şehit / Gazi yakınları <strong>ücretten muaf</strong></span>
              </label>
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#A82232]" checked={!!editing.iadeMekanizmasi}
                  onChange={e => setEditing({ ...editing, iadeMekanizmasi: e.target.checked })}
                  disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
                <span><strong>İade Mekanizması Aktif</strong> — Yerleşemeyen adaylar başvuru ücretini geri alır</span>
              </label>
              <span className="text-[11px] text-[#888]">Pasifse aday tercih verirken iade olmayacağını bilir.</span>
            </div>

            <Field label="Banka Adı">
              <input className={inputCls} value={editing.banka?.ad ?? ""}
                onChange={e => setEditing({ ...editing, banka: { ...(editing.banka ?? { ad: "", iban: "", alici: "" }), ad: e.target.value } })}
                disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
            </Field>
            <Field label="IBAN">
              <input className={inputCls} placeholder="TR33 0006 1005 1978 6457 8413 26"
                value={editing.banka?.iban ?? ""}
                onChange={e => setEditing({ ...editing, banka: { ...(editing.banka ?? { ad: "", iban: "", alici: "" }), iban: e.target.value } })}
                disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
            </Field>
            <div className="col-span-2">
              <Field label="Alıcı Adı">
                <input className={inputCls} placeholder="MSB Personel Temin Dairesi Başkanlığı"
                  value={editing.banka?.alici ?? ""}
                  onChange={e => setEditing({ ...editing, banka: { ...(editing.banka ?? { ad: "", iban: "", alici: "" }), alici: e.target.value } })}
                  disabled={!editing.odemeKurali || editing.odemeKurali === "yok"} />
              </Field>
            </div>

            <div className="col-span-2 pb-1 border-b border-[#EEE] mb-1 mt-3">
              <h4 className="text-[11.5px] font-bold text-[#A82232] uppercase tracking-widest">7. Diğer</h4>
            </div>

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
