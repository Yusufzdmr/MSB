// Aday Yönetimi — arama, filtre, tablo, detay drawer (özlük + belgeler + başvurular + tercihler).

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, X, FileText, ClipboardList, ListChecks, MessageSquare, GraduationCap, MapPin, Phone, Mail, Plus, Upload, Download, AlertCircle } from "lucide-react";
import { useStore, actions, type Aday, type EgitimSeviyesi } from "../shared/store";
import { DataTable, Pill, Btn, Modal, trTarih, maskTC, Field, inputCls, selectCls, textareaCls } from "../shared/ui";
import { MSB } from "../shared/theme";

export default function AdayYonetimi({ q: qGlobal = "" }: { q?: string }) {
  const store = useStore();
  const [q, setQ] = useState(qGlobal);
  const [filtreEgt, setFiltreEgt] = useState<EgitimSeviyesi | "">("");
  const [siralama, setSiralama] = useState<"puan" | "kayit" | "ad">("puan");
  const [detay, setDetay] = useState<Aday | null>(null);
  const [manuelAcik, setManuelAcik] = useState(false);
  const [tumTest, setTumTest] = useState<{ kabul: number; red: number; redDetay: { row: any; sebep: string }[]; kabulSatirlari?: any[] } | null>(null);
  const [validasyonYapildi, setValidasyonYapildi] = useState(false);
  const [topluAcik, setTopluAcik] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [yeniAday, setYeniAday] = useState<Partial<Aday> & { basvurulacakIlanId?: string }>({ egitim: "Lise", cinsiyet: "Erkek", ehliyet: [], sinavPuani: 0 });

  const manuelKaydet = () => {
    if (!yeniAday.id || !/^\d{11}$/.test(yeniAday.id)) return alert("Geçerli 11 haneli TCKN girin.");
    if (!yeniAday.ad || !yeniAday.soyad) return alert("Ad ve Soyad zorunlu.");
    const r = actions.adayManuelEkleTamKayit({
      id: yeniAday.id, ad: yeniAday.ad.toLocaleUpperCase("tr"), soyad: yeniAday.soyad.toLocaleUpperCase("tr"),
      eposta: yeniAday.eposta ?? "", telefon: yeniAday.telefon ?? "",
      dogumTarihi: yeniAday.dogumTarihi ?? "2000-01-01",
      cinsiyet: (yeniAday.cinsiyet ?? "Erkek") as "Erkek" | "Kadın" | "Farketmez",
      sehir: yeniAday.sehir ?? "—",
      egitim: (yeniAday.egitim ?? "Lise") as EgitimSeviyesi,
      sinavPuani: Number(yeniAday.sinavPuani ?? 0),
      kvkkOnayi: false,
      basvurulacakIlanId: yeniAday.basvurulacakIlanId,
    });
    if (r.ok) {
      const ilanBilgi = yeniAday.basvurulacakIlanId
        ? `\n\nİlana otomatik başvuru oluşturuldu: ${store.ilanlar.find(x => x.id === yeniAday.basvurulacakIlanId)?.baslik}`
        : "";
      alert(`✓ Aday oluşturuldu.\n\nOtomatik geçici şifre: ${r.sifre}${ilanBilgi}`);
      setManuelAcik(false);
      setYeniAday({ egitim: "Lise", cinsiyet: "Erkek", ehliyet: [], sinavPuani: 0 });
    } else alert(r.error);
  };

  const sablonIndir = () => {
    const csv = "TCKN;Ad;Soyad;EPosta;Telefon;SinavPuani;SehitGaziMi\n" +
      "12345678901;ÖRNEK;ADAY;ornek@ex.com;05551112233;72.5;false\n" +
      "12345678902;İKİNCİ;ÖRNEK;ornek2@ex.com;05551112244;85.1;true\n";
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "aday-toplu-sablon.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Aşama 1: Sadece validasyon — henüz veritabanına yazılmaz
  const csvIsle = () => {
    const satirlar = csvText.split(/\r?\n/).filter(x => x.trim());
    if (satirlar.length < 2) return alert("Boş dosya.");
    const [, ...veri] = satirlar;
    const rows = veri.map(l => l.split(";")).filter(c => c.length >= 6).map(c => ({
      id: c[0].trim(), ad: c[1].trim(), soyad: c[2].trim(),
      eposta: c[3].trim(), telefon: c[4].trim(),
      sinavPuani: Number(c[5].trim() || "0"),
      sehitGaziMi: (c[6] ?? "").trim().toLowerCase() === "true",
    }));
    const { kabul, red } = actions.adaylarTopluDogrula(rows);
    setTumTest({ kabul: kabul.length, red: red.length, redDetay: red, kabulSatirlari: kabul });
    setValidasyonYapildi(true);
  };
  // Aşama 2: Onaylanan satırları veritabanına aktar
  const csvAktar = () => {
    if (!tumTest?.kabulSatirlari?.length) return alert("Aktarılacak hatasız kayıt yok.");
    if (!confirm(`${tumTest.kabul} hatasız kaydı veritabanına aktarmak istediğinize emin misiniz?`)) return;
    const sayi = actions.adaylarTopluAktar(tumTest.kabulSatirlari);
    alert(`✓ ${sayi} aday başarıyla veritabanına aktarıldı.`);
    setTopluAcik(false); setTumTest(null); setCsvText(""); setValidasyonYapildi(false);
  };

  useEffect(() => { if (qGlobal) setQ(qGlobal); }, [qGlobal]);

  const rows = useMemo(() => {
    const filtered = store.adaylar.filter(a =>
      (!filtreEgt || a.egitim === filtreEgt) &&
      (!q ||
        `${a.ad} ${a.soyad}`.toLowerCase().includes(q.toLowerCase()) ||
        a.id.includes(q) ||
        (a.eposta ?? "").toLowerCase().includes(q.toLowerCase()))
    );
    return filtered.sort((a, b) => {
      if (siralama === "puan")  return b.sinavPuani - a.sinavPuani;
      if (siralama === "kayit") return b.kayitTarihi.localeCompare(a.kayitTarihi);
      return `${a.ad} ${a.soyad}`.localeCompare(`${b.ad} ${b.soyad}`, "tr");
    });
  }, [store.adaylar, q, filtreEgt, siralama]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" strokeWidth={2} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ad, soyad, TC no, e-posta…"
            className="w-full h-[34px] pl-9 pr-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232]" />
        </div>
        <Filter className="w-3.5 h-3.5 text-[#888]" strokeWidth={2} />
        <select value={filtreEgt} onChange={e => setFiltreEgt(e.target.value as EgitimSeviyesi | "")}
          className="h-[34px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] w-[160px]">
          <option value="">Tüm eğitim düzeyleri</option>
          <option value="Lise">Lise</option>
          <option value="Ön Lisans">Ön Lisans</option>
          <option value="Lisans">Lisans</option>
          <option value="Yüksek Lisans">Yüksek Lisans</option>
          <option value="Doktora">Doktora</option>
        </select>
        <select value={siralama} onChange={e => setSiralama(e.target.value as typeof siralama)}
          className="h-[34px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] w-[160px]">
          <option value="puan">Puan (yüksek → düşük)</option>
          <option value="kayit">Kayıt tarihi (yeni)</option>
          <option value="ad">Ada göre (A→Z)</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11.5px] font-semibold text-[#666] tabular-nums">{rows.length} aday</span>
          <Btn variant="light" size="sm" onClick={() => setTopluAcik(true)}><Upload className="w-3 h-3" /> Excel Toplu Yükle</Btn>
          <Btn size="sm" onClick={() => setManuelAcik(true)}><Plus className="w-3 h-3" /> Yeni Aday</Btn>
        </div>
      </div>

      {/* Manuel aday modal */}
      <Modal open={manuelAcik} onClose={() => setManuelAcik(false)} size="md"
        title="Yeni Aday Ekle (Manuel)"
        footer={<><Btn variant="ghost" onClick={() => setManuelAcik(false)}>İptal</Btn><Btn onClick={manuelKaydet}>Kaydet & Şifre Oluştur</Btn></>}>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 p-3 rounded border" style={{ background: MSB.warnBg, borderColor: MSB.warnBrd, color: MSB.orange }}>
            <div className="flex items-start gap-2 text-[12px]"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>Bu yöntem yalnızca özel durumlarda (mahkeme kararı, sistem dışı istisna, veri düzeltme) kullanılmalıdır. Sistem mükerrer TCKN kontrolü yapar ve otomatik geçici şifre üretir.</div></div>
          </div>
          <Field label="TCKN" required><input className={inputCls} maxLength={11} value={yeniAday.id ?? ""} onChange={e => setYeniAday({ ...yeniAday, id: e.target.value.replace(/\D/g, "") })} /></Field>
          <Field label="Sınav Puanı" required><input type="number" step={0.1} className={inputCls} value={yeniAday.sinavPuani ?? 0} onChange={e => setYeniAday({ ...yeniAday, sinavPuani: Number(e.target.value) })} /></Field>
          <Field label="Ad" required><input className={inputCls} value={yeniAday.ad ?? ""} onChange={e => setYeniAday({ ...yeniAday, ad: e.target.value })} /></Field>
          <Field label="Soyad" required><input className={inputCls} value={yeniAday.soyad ?? ""} onChange={e => setYeniAday({ ...yeniAday, soyad: e.target.value })} /></Field>
          <Field label="E-posta"><input type="email" className={inputCls} value={yeniAday.eposta ?? ""} onChange={e => setYeniAday({ ...yeniAday, eposta: e.target.value })} /></Field>
          <Field label="Telefon"><input className={inputCls} value={yeniAday.telefon ?? ""} onChange={e => setYeniAday({ ...yeniAday, telefon: e.target.value })} /></Field>
          <Field label="Doğum Tarihi"><input type="date" className={inputCls} value={yeniAday.dogumTarihi ?? ""} onChange={e => setYeniAday({ ...yeniAday, dogumTarihi: e.target.value })} /></Field>
          <Field label="Cinsiyet"><select className={selectCls} value={yeniAday.cinsiyet ?? "Erkek"} onChange={e => setYeniAday({ ...yeniAday, cinsiyet: e.target.value as "Erkek" | "Kadın" })}><option>Erkek</option><option>Kadın</option></select></Field>
          <Field label="Şehir"><input className={inputCls} value={yeniAday.sehir ?? ""} onChange={e => setYeniAday({ ...yeniAday, sehir: e.target.value })} /></Field>
          <Field label="Eğitim"><select className={selectCls} value={yeniAday.egitim ?? "Lise"} onChange={e => setYeniAday({ ...yeniAday, egitim: e.target.value as EgitimSeviyesi })}>
            <option>Lise</option><option>Ön Lisans</option><option>Lisans</option><option>Yüksek Lisans</option><option>Doktora</option>
          </select></Field>
          <div className="col-span-2">
            <Field label="Başvuracağı İlan / Program" hint="Seçilirse aday oluşturulur oluşturulmaz otomatik başvuru kaydı açılır.">
              <select className={selectCls} value={yeniAday.basvurulacakIlanId ?? ""} onChange={e => setYeniAday({ ...yeniAday, basvurulacakIlanId: e.target.value || undefined })}>
                <option value="">Başvuru oluşturma (sadece aday kaydı)</option>
                {store.ilanlar.filter(i => i.durum === "yayin" || i.durum === "taslak").map(i => (
                  <option key={i.id} value={i.id}>{i.baslik}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </Modal>

      {/* Excel toplu modal — iki aşamalı: Doğrula → (rapor) → Aktar */}
      <Modal open={topluAcik} onClose={() => { setTopluAcik(false); setTumTest(null); setCsvText(""); setValidasyonYapildi(false); }} size="lg"
        title="Excel / CSV ile Toplu Aday Yükleme"
        footer={<>
          <Btn variant="ghost" onClick={() => { setTopluAcik(false); setTumTest(null); setCsvText(""); setValidasyonYapildi(false); }}>Kapat</Btn>
          {!validasyonYapildi && <Btn onClick={csvIsle} disabled={!csvText.trim()}>Doğrula & Rapor Al</Btn>}
          {validasyonYapildi && tumTest && tumTest.kabul > 0 && (
            <Btn variant="success" onClick={csvAktar}>Hatasız {tumTest.kabul} Kaydı Aktar</Btn>
          )}
          {validasyonYapildi && (
            <Btn variant="light" onClick={() => { setTumTest(null); setValidasyonYapildi(false); }}>Yeniden Doğrula</Btn>
          )}
        </>}>
        <div className="space-y-3">
          <div className="p-3 rounded border" style={{ background: MSB.infoBg, borderColor: MSB.infoBrd, color: MSB.infoText }}>
            <div className="text-[12.5px]">
              <strong>1)</strong> Şablonu indirin. <strong>2)</strong> Excel'de doldurun ve <strong>.CSV</strong> olarak dışa aktarın.
              <strong>3)</strong> Dosyayı açıp içeriği yapıştırın veya doğrudan yükleyin. Sistem TCKN doğrulama + mükerrer kontrolü yapar.
              <div className="mt-1.5"><strong>Sütunlar</strong>: TCKN;Ad;Soyad;EPosta;Telefon;SinavPuani;SehitGaziMi</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="light" onClick={sablonIndir}><Download className="w-3.5 h-3.5" /> Şablon .XLSX/.CSV İndir</Btn>
            <label className="inline-flex items-center gap-1.5 h-[32px] px-3.5 text-[12.5px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCC] rounded cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Dosya Seç
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={e => {
                const f = e.target.files?.[0]; if (!f) return;
                const r = new FileReader(); r.onload = () => setCsvText(String(r.result)); r.readAsText(f, "utf-8");
              }} />
            </label>
          </div>
          <textarea className="w-full min-h-[220px] px-3 py-2 text-[11.5px] font-mono bg-[#FAFAFA] border border-[#CCC] rounded focus:outline-none focus:border-[#A82232]"
            placeholder="TCKN;Ad;Soyad;EPosta;Telefon;SinavPuani;SehitGaziMi&#10;12345678901;ÖRNEK;ADAY;ornek@ex.com;05551112233;72.5;false"
            value={csvText} onChange={e => setCsvText(e.target.value)} />

          {tumTest && (
            <div className="mt-3 space-y-3">
              {/* Özet bilgi kutusu (spec formatı) */}
              <div className="p-3 rounded border" style={{
                background: tumTest.red > 0 ? MSB.warnBg : "#EEF6E8",
                borderColor: tumTest.red > 0 ? MSB.warnBrd : "#C7DDB0",
                color: tumTest.red > 0 ? MSB.orange : "#5E7F42",
              }}>
                <div className="text-[13px] font-bold mb-1">
                  {tumTest.red > 0 && tumTest.kabul > 0 && `⚠ ${tumTest.red} veri hatalı, düzeltip tekrar yükleyin veya hatasız ${tumTest.kabul} kaydı içeri aktarın.`}
                  {tumTest.red > 0 && tumTest.kabul === 0 && `❌ ${tumTest.red} kayıt hatalı; hatasız kayıt yok. Lütfen dosyayı düzeltip tekrar yükleyin.`}
                  {tumTest.red === 0 && `✓ ${tumTest.kabul} kayıt doğrulama testinden başarıyla geçti. Aktarmak için "Hatasız ${tumTest.kabul} Kaydı Aktar" butonuna basın.`}
                </div>
              </div>
              {/* Hatalı satırlar */}
              {tumTest.red > 0 && (
                <div className="border border-[#E8B5BB] rounded overflow-hidden">
                  <div className="px-3 py-2 bg-[#FBECEE] text-[#A82232] font-bold text-[11.5px] uppercase">Reddedilen Kayıtlar ({tumTest.red})</div>
                  <table className="w-full text-[11.5px]">
                    <thead><tr className="bg-[#FCEEF0] text-[#A82232]"><th className="px-3 py-1.5 text-left">TCKN</th><th className="px-3 py-1.5 text-left">Ad Soyad</th><th className="px-3 py-1.5 text-left">Sebep</th></tr></thead>
                    <tbody>{tumTest.redDetay.map((r, i) => (
                      <tr key={i} className={i % 2 === 0 ? "" : "bg-[#FAFAFA]"}>
                        <td className="px-3 py-1.5 tabular-nums">{r.row.id || <em>boş</em>}</td>
                        <td className="px-3 py-1.5">{r.row.ad} {r.row.soyad}</td>
                        <td className="px-3 py-1.5 text-[#A82232]">{r.sebep}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {/* Kabul edilenlerin önizlemesi */}
              {tumTest.kabul > 0 && tumTest.kabulSatirlari && (
                <div className="border border-[#C7DDB0] rounded overflow-hidden">
                  <div className="px-3 py-2 bg-[#EEF6E8] text-[#5E7F42] font-bold text-[11.5px] uppercase flex items-center justify-between">
                    <span>Hatasız Kayıtlar ({tumTest.kabul}) — Aktarım öncesi önizleme</span>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-[11.5px]">
                      <thead><tr className="bg-[#F5F5F5]"><th className="px-3 py-1.5 text-left">TCKN</th><th className="px-3 py-1.5 text-left">Ad Soyad</th><th className="px-3 py-1.5 text-right">Puan</th><th className="px-3 py-1.5 text-center">Şht/Gazi</th></tr></thead>
                      <tbody>{tumTest.kabulSatirlari.slice(0, 20).map((r, i) => (
                        <tr key={i} className={i % 2 === 0 ? "" : "bg-[#FAFAFA]"}>
                          <td className="px-3 py-1.5 tabular-nums">{r.id}</td>
                          <td className="px-3 py-1.5">{r.ad} {r.soyad}</td>
                          <td className="px-3 py-1.5 tabular-nums text-right">{r.sinavPuani}</td>
                          <td className="px-3 py-1.5 text-center">{r.sehitGaziMi ? "✓" : "—"}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                    {tumTest.kabulSatirlari.length > 20 && (
                      <div className="p-2 text-center text-[11px] text-[#888] italic bg-[#FAFAFA]">
                        ... ve {tumTest.kabulSatirlari.length - 20} kayıt daha
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      <DataTable<Aday>
        onRowClick={setDetay}
        columns={[
          { key: "avatar", header: "", width: "44px", render: r => (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10.5px] font-bold" style={{ background: MSB.navy }}>
                {r.ad[0]}{r.soyad[0]}
              </div>
            ) },
          { key: "ad", header: "Aday", render: r => (
              <div>
                <div className="font-semibold text-[12.5px]" style={{ color: MSB.ink }}>{r.ad} {r.soyad}</div>
                <div className="text-[10.5px] text-[#888] font-mono">{maskTC(r.id)}</div>
              </div>
            ) },
          { key: "egitim", header: "Eğitim", width: "170px", render: r => (
              <div>
                <div className="text-[12px] font-semibold">{r.egitim}</div>
                <div className="text-[10.5px] text-[#888] truncate max-w-[180px]">{r.mezuniyet ?? "—"}</div>
              </div>
            ) },
          { key: "iletisim", header: "İletişim", width: "180px", render: r => (
              <div className="text-[11px]">
                <div className="text-[#333] truncate max-w-[170px]">{r.eposta}</div>
                <div className="text-[#888]">{r.telefon}</div>
              </div>
            ) },
          { key: "puan", header: "Puan", width: "80px", align: "right", render: r => (
              <div className="tabular-nums font-extrabold text-[14px]" style={{ color: MSB.red }}>{r.sinavPuani.toFixed(1)}</div>
            ) },
          { key: "basvuru", header: "Başv.", width: "70px", align: "center", render: r => {
              const n = store.basvurular.filter(b => b.adayId === r.id).length;
              return <Pill tone={n > 0 ? "info" : "muted"}>{n}</Pill>;
            } },
          { key: "durum", header: "Durum", width: "100px", render: r => (
              r.aktif ? <Pill tone="success">Aktif</Pill> : <Pill tone="muted">Pasif</Pill>
            ) },
          { key: "kayit", header: "Kayıt", width: "110px", render: r => (
              <div className="text-[11px] text-[#666]">{trTarih(r.kayitTarihi)}</div>
            ) },
        ]}
        rows={rows}
      />

      {detay && <AdayDetayDrawer aday={detay} onClose={() => setDetay(null)} />}
    </div>
  );
}

function AdayDetayDrawer({ aday, onClose }: { aday: Aday; onClose: () => void }) {
  const store = useStore();
  const [tab, setTab] = useState<"ozet" | "belge" | "basvuru" | "mesaj">("ozet");
  const [mesaj, setMesaj] = useState("");

  const belgeler   = store.belgeler.filter(b => b.adayId === aday.id);
  const basvurular = store.basvurular.filter(b => b.adayId === aday.id);
  const tercihler  = store.tercihler.filter(t => t.adayId === aday.id).sort((a, b) => a.sira - b.sira);
  const mesajlar   = store.mesajlar.filter(m => m.alici === aday.id || m.gonderen === aday.id).sort((a, b) => b.tarih.localeCompare(a.tarih));

  const sendMsg = () => {
    if (!mesaj.trim()) return;
    actions.mesajGonder({ konu: "Yönetici Bildirimi", icerik: mesaj.trim(), gonderen: "admin", alici: aday.id });
    setMesaj("");
  };

  const tabs = [
    { id: "ozet"    as const, label: "Özet",         count: null },
    { id: "belge"   as const, label: "Belgeler",     count: belgeler.length },
    { id: "basvuru" as const, label: "Başvurular",   count: basvurular.length },
    { id: "mesaj"   as const, label: "Mesajlaşma",   count: mesajlar.length },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="relative w-full max-w-[560px] h-full bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right">
        <header className="px-5 py-4 border-b border-[#DDD] flex items-start gap-4" style={{ background: MSB.red, color: "#fff" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/15 text-[16px] font-bold flex-shrink-0">
            {aday.ad[0]}{aday.soyad[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10.5px] uppercase tracking-widest opacity-80 font-bold">Aday Detayı</div>
            <div className="text-[17px] font-extrabold">{aday.ad} {aday.soyad}</div>
            <div className="text-[11.5px] opacity-90 font-mono">{maskTC(aday.id)} · Puan {aday.sinavPuani.toFixed(1)}</div>
          </div>
          <button onClick={onClose} className="text-white/85 hover:text-white p-1" aria-label="Kapat">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </header>

        <nav className="flex border-b border-[#DDD] bg-white flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] border-b-2 transition-colors ${
                tab === t.id ? "font-bold" : "text-[#888] hover:text-[#333]"
              }`}
              style={tab === t.id ? { borderColor: MSB.red, color: MSB.red } : { borderColor: "transparent" }}>
              {t.label} {t.count !== null && <span className="tabular-nums opacity-70">({t.count})</span>}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-auto p-5">
          {tab === "ozet" && (
            <div className="space-y-4 text-[13px]">
              <InfoRow icon={<GraduationCap className="w-3.5 h-3.5" />} label="Eğitim"
                value={<>{aday.egitim} — {aday.mezuniyet ?? "—"}{aday.bolum ? ` (${aday.bolum})` : ""}{aday.ortalama ? ` · GNO ${aday.ortalama.toFixed(2)}` : ""}</>} />
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Adres" value={<>{aday.sehir}{aday.ilce ? `, ${aday.ilce}` : ""}</>} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Telefon" value={aday.telefon} />
              <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="E-posta" value={aday.eposta} />

              <div className="border-t border-[#EEE] pt-3">
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-2">Yabancı Dil</div>
                {aday.yabanciDil?.length ? aday.yabanciDil.map((d, i) => (
                  <Pill key={i} tone="info">{d.dil} · {d.seviye}{d.puan ? ` (${d.puan})` : ""}</Pill>
                )) : <span className="text-[#888] text-[12px]">Bildirilmemiş</span>}
              </div>

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-2">Sertifikalar</div>
                {aday.sertifikalar?.length ? <div className="flex flex-wrap gap-1.5">{aday.sertifikalar.map((s, i) => <Pill key={i}>{s}</Pill>)}</div> : <span className="text-[#888] text-[12px]">Bildirilmemiş</span>}
              </div>

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-2">Ehliyet · Askerlik</div>
                <div className="text-[12.5px]">
                  Ehliyet: {aday.ehliyet?.join(", ") || "—"} · Askerlik: {aday.askerlikDurumu ?? "—"}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-2">Tercihler</div>
                {tercihler.length === 0 ? <span className="text-[#888] text-[12px]">Tercih yapılmamış</span> : (
                  <ol className="space-y-1">
                    {tercihler.map(t => {
                      const il = store.ilanlar.find(i => i.id === t.ilanId);
                      return (
                        <li key={t.ilanId} className="flex items-center gap-2 text-[12.5px]">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: MSB.red }}>{t.sira}</span>
                          <span className="flex-1 truncate">{il?.baslik ?? t.ilanId}</span>
                          <span className="text-[10px] text-[#888]">{il?.kuvvet}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>
          )}

          {tab === "belge" && (
            <div className="space-y-2">
              {belgeler.length === 0 && <div className="text-center text-[#888] py-8 text-[12.5px]">Yüklenmiş belge yok.</div>}
              {belgeler.map(b => (
                <div key={b.id} className="border border-[#E0E0E0] rounded-[3px] p-3 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-[#888] mt-0.5 flex-shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[12.5px]">{b.ad}</span>
                      <Pill tone={b.durum === "onaylandi" ? "success" : b.durum === "reddedildi" ? "danger" : "warn"}>
                        {b.durum === "onaylandi" ? "Onaylı" : b.durum === "reddedildi" ? "Reddedildi" : "Beklemede"}
                      </Pill>
                    </div>
                    <div className="text-[11px] text-[#888] mt-0.5">{b.tip} · {(b.boyutKB / 1024).toFixed(1)} MB · {trTarih(b.yuklemeTarihi, true)}</div>
                    {b.redGerekce && <div className="text-[11px] mt-1" style={{ color: MSB.red }}>Ret gerekçesi: {b.redGerekce}</div>}
                    {b.ocrAlanlar && (
                      <div className="text-[11px] mt-1 text-[#666]">
                        OCR: {Object.entries(b.ocrAlanlar).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "basvuru" && (
            <div className="space-y-2">
              {basvurular.length === 0 && <div className="text-center text-[#888] py-8 text-[12.5px]">Başvuru yok.</div>}
              {basvurular.map(b => {
                const il = store.ilanlar.find(i => i.id === b.ilanId);
                const toneMap = { onaylandi: "success", reddedildi: "danger", yerlestirildi: "info", yerlestirilmedi: "danger", gonderildi: "warn", hazirlaniyor: "muted" } as const;
                return (
                  <div key={b.id} className="border border-[#E0E0E0] rounded-[3px] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="w-4 h-4 text-[#888]" />
                      <span className="font-semibold text-[12.5px] flex-1 min-w-0 truncate">{il?.baslik ?? b.ilanId}</span>
                      <Pill tone={toneMap[b.durum] || "muted"}>{b.durum}</Pill>
                    </div>
                    <div className="text-[11px] text-[#888]">Puan: <span className="font-bold" style={{ color: MSB.red }}>{b.puan.toFixed(1)}</span> · {trTarih(b.basvuruTarihi, true)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "mesaj" && (
            <div className="flex flex-col gap-3 h-full">
              <div className="flex-1 space-y-2 overflow-auto">
                {mesajlar.length === 0 && <div className="text-center text-[#888] py-8 text-[12.5px]">Mesaj yok.</div>}
                {mesajlar.map(m => {
                  const admin = m.gonderen === "admin";
                  return (
                    <div key={m.id} className={`flex ${admin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-[6px] text-[12.5px] ${admin ? "text-white" : "bg-[#F5F5F5] text-[#333]"}`}
                        style={admin ? { background: MSB.red } : {}}>
                        <div className="text-[10px] opacity-80 mb-0.5 font-bold uppercase tracking-wide">{admin ? "Yönetici" : "Aday"} · {trTarih(m.tarih, true)}</div>
                        <div className="font-semibold mb-0.5">{m.konu}</div>
                        <div className="whitespace-pre-wrap leading-relaxed">{m.icerik}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-[#EEE] pt-3">
                <Field label="Yeni Mesaj">
                  <textarea value={mesaj} onChange={e => setMesaj(e.target.value)}
                    className={textareaCls} placeholder="Adaya iletmek istediğiniz mesaj…" />
                </Field>
                <div className="flex justify-end mt-2">
                  <Btn onClick={sendMsg} disabled={!mesaj.trim()}>
                    <MessageSquare className="w-3.5 h-3.5" /> Gönder
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded flex items-center justify-center bg-[#F5F5F5] text-[#666] flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888]">{label}</div>
        <div className="text-[13px] text-[#333] mt-0.5">{value}</div>
      </div>
    </div>
  );
}
