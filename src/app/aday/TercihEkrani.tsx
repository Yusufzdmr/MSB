// Tercih Ekranı — Referansgorsel2 birebir 2 panel: sol Aktif Tercihler ağacı,
// sağ Kaydedilmiş Tercihler dinamik sıralamalı liste.

import { useState, useMemo, Fragment } from "react";
import {
  AlertCircle, Info, Check, X, Trash2, ChevronDown, ChevronRight,
  ArrowUp, ArrowDown, FileText, Users,
} from "lucide-react";
import { MSB } from "../shared/theme";
import { actions, useStore, type Ilan } from "../shared/store";

const btnLgt = "inline-flex items-center gap-1.5 h-[28px] px-2.5 text-[11.5px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";

// Programları ilan.kuvvet ve id'sine göre gruplayan mock alt program üretici
type AltProgram = { id: string; ad: string; grup: string; bitis: string; kontenjanAsil: number; kontenjanYedek: number; cinsiyet: string };

function altProgramlar(ilan: Ilan): { grup: string; programlar: AltProgram[] }[] {
  if (ilan.baslik.toLowerCase().includes("harp") || ilan.baslik.toLowerCase().includes("msü")) {
    return [
      { grup: "HARP OKULLARI", programlar: [
        { id: ilan.id + "-KHO", ad: "ASKERİ ÖĞRENCİ/HARP OKULLARI/KARA HARP OKULU", grup: "HARP OKULLARI", bitis: ilan.bitis, kontenjanAsil: 100, kontenjanYedek: 30, cinsiyet: "Erkek/Kadın" },
        { id: ilan.id + "-HHO", ad: "ASKERİ ÖĞRENCİ/HARP OKULLARI/HAVA HARP OKULU", grup: "HARP OKULLARI", bitis: ilan.bitis, kontenjanAsil: 60,  kontenjanYedek: 20, cinsiyet: "Erkek/Kadın" },
        { id: ilan.id + "-SGK", ad: "ASKERİ ÖĞRENCİ/HARP OKULLARI/SAHİL GÜVENLİK KOMUTANLIĞI NAMINA DENİZ HARP OKULU", grup: "HARP OKULLARI", bitis: ilan.bitis, kontenjanAsil: 25, kontenjanYedek: 10, cinsiyet: "Erkek" },
        { id: ilan.id + "-DHO", ad: "ASKERİ ÖĞRENCİ/HARP OKULLARI/DENİZ HARP OKULU", grup: "HARP OKULLARI", bitis: ilan.bitis, kontenjanAsil: 50, kontenjanYedek: 15, cinsiyet: "Erkek/Kadın" },
      ]},
      { grup: "ASB. MYO", programlar: [
        { id: ilan.id + "-MYO-K", ad: "ASTSUBAY MYO/KARA", grup: "ASB. MYO", bitis: ilan.bitis, kontenjanAsil: 300, kontenjanYedek: 100, cinsiyet: "Erkek" },
        { id: ilan.id + "-MYO-H", ad: "ASTSUBAY MYO/HAVA", grup: "ASB. MYO", bitis: ilan.bitis, kontenjanAsil: 180, kontenjanYedek: 60, cinsiyet: "Erkek/Kadın" },
      ]},
    ];
  }
  // Diğer ilanlar için tek grup
  return [{
    grup: ilan.sinif.toUpperCase(),
    programlar: [
      { id: ilan.id + "-A", ad: `${ilan.baslik} / A GRUBU`, grup: ilan.sinif, bitis: ilan.bitis, kontenjanAsil: Math.floor(ilan.kontenjan * 0.6), kontenjanYedek: Math.floor(ilan.kontenjan * 0.2), cinsiyet: String(ilan.cinsiyet) },
      { id: ilan.id + "-B", ad: `${ilan.baslik} / B GRUBU`, grup: ilan.sinif, bitis: ilan.bitis, kontenjanAsil: Math.floor(ilan.kontenjan * 0.3), kontenjanYedek: Math.floor(ilan.kontenjan * 0.1), cinsiyet: String(ilan.cinsiyet) },
    ],
  }];
}

// Süre bitmiş mi kontrol
function sureDoldu(bitis: string): boolean {
  return new Date(bitis) < new Date();
}

export default function TercihEkrani({ adayId }: { adayId: string }) {
  const ilanlar = useStore(s => s.ilanlar.filter(i => i.durum === "yayin"));
  const kayitli = useStore(s => s.tercihler
    .filter(t => t.adayId === adayId)
    .sort((a, b) => a.sira - b.sira));

  const [acikIlan, setAcikIlan] = useState<Record<string, boolean>>({});
  const [acikGrup, setAcikGrup] = useState<Record<string, boolean>>({});
  const [detay, setDetay] = useState<AltProgram | null>(null);
  const [ekleOnay, setEkleOnay] = useState<AltProgram | null>(null);

  // Kayıtlı tercihleri programa göre çözümle
  const kayitliCozumlu = useMemo(() => {
    return kayitli.map((t, idx) => {
      // altProgramId formatı: `${ilanId}-<suffix>` — exact prefix eşleşmesi için `-` sınırlayıcısı zorunlu.
      // En uzun eşleşen ilan id'sini seç (birden fazla eşleşme olasılığına karşı)
      const eslesenIlanlar = ilanlar
        .filter(i => t.ilanId === i.id || t.ilanId.startsWith(i.id + "-"))
        .sort((a, b) => b.id.length - a.id.length);
      const ilan = eslesenIlanlar[0] ?? null;
      const grup = ilan ? altProgramlar(ilan).flatMap(g => g.programlar).find(p => p.id === t.ilanId) : null;
      return { sira: idx + 1, tercih: t, ilan, program: grup };
    });
  }, [kayitli, ilanlar]);

  const kayitli_ids = new Set(kayitli.map(t => t.ilanId));

  const toggleIlan = (id: string) => setAcikIlan(m => ({ ...m, [id]: !m[id] }));
  const toggleGrup = (k: string) => setAcikGrup(m => ({ ...m, [k]: !m[k] }));

  const yaz = (siralar: { ilanId: string; sira: number }[]) => actions.tercihKaydet(adayId, siralar);

  const ekle = (p: AltProgram) => {
    const yeni = [...kayitli.map((t, i) => ({ ilanId: t.ilanId, sira: i + 1 })), { ilanId: p.id, sira: kayitli.length + 1 }];
    yaz(yeni);
    setEkleOnay(null);
  };
  const sil = (id: string) => {
    const yeni = kayitli.filter(t => t.ilanId !== id).map((t, i) => ({ ilanId: t.ilanId, sira: i + 1 }));
    yaz(yeni);
  };
  const yer = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= kayitli.length) return;
    const kopya = kayitli.map((t, k) => ({ ilanId: t.ilanId, sira: k + 1 }));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
    yaz(kopya.map((t, k) => ({ ilanId: t.ilanId, sira: k + 1 })));
  };

  return (
    <>
      {/* DİKKAT kutusu */}
      <div className="bg-white border border-[#DDDDDD] rounded p-4 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#A82232] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <h3 className="text-[14px] font-extrabold text-[#A82232] mb-1.5 uppercase tracking-wide">DİKKAT</h3>
              <ol className="text-[12.5px] text-[#555] space-y-0.5 list-decimal ml-5">
                <li>Tercih yapmadan önce mutlaka başvuru kılavuzunu dikkatlice okuyunuz.</li>
                <li>Yerleştirmelerde tercih sıranız dikkate alınacağından tercih sıranızı kontrol ediniz.</li>
              </ol>
            </div>
          </div>
          {/* Kılavuz İncele (Özlük) — referans2'de sol üstte "Özlük" tuşu */}
          <button className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-bold text-white bg-[#4A6FA5] hover:bg-[#365688] rounded-[3px] flex-shrink-0"
            onClick={() => alert("İlanın resmi PDF kılavuzu tam ekran açılacak (admin tarafından yüklenmiş dosya).")}>
            <FileText className="w-3.5 h-3.5" /> Kılavuz İncele
          </button>
        </div>
        <button className="inline-flex items-center gap-2 h-[30px] px-3 text-[12px] font-bold text-white rounded-[3px]"
          style={{ background: "#7BA05B" }}
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
          <Check className="w-3.5 h-3.5" /> Tercihlerimi Göster
        </button>
      </div>

      {/* 2 Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SOL — Aktif Tercihler ağacı */}
        <div className="bg-white border border-[#DDDDDD] rounded overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[#F5F5F5]">
            <h3 className="text-[13.5px] font-semibold text-[#555]">Aktif Tercihler</h3>
            <button className="text-[16px] text-[#888] hover:text-[#333]">−</button>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[#E5E5E5] text-[#555]">
                <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase">Alımlar</th>
                <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase w-[150px]">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {ilanlar.length === 0 && (
                <tr><td colSpan={2} className="p-8 text-center text-[#888] italic">Aktif ilan bulunmuyor.</td></tr>
              )}
              {ilanlar.map(il => (
                <Fragment key={il.id}>
                  <tr className="border-t border-[#EEE] bg-white hover:bg-[#FAFAFA]">
                    <td colSpan={2} className="px-2 py-1.5">
                      <button onClick={() => toggleIlan(il.id)} className="flex items-center gap-1.5 w-full text-left">
                        {acikIlan[il.id] ? <ChevronDown className="w-3.5 h-3.5 text-[#A82232]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#A82232]" />}
                        <span className="inline-block w-1 h-4 bg-[#A82232] rounded" />
                        <span className="text-[12.5px] font-semibold text-[#333]">{il.baslik}</span>
                      </button>
                    </td>
                  </tr>
                  {acikIlan[il.id] && altProgramlar(il).map(grup => (
                    <Fragment key={il.id + grup.grup}>
                      <tr className="bg-[#FAFAFA] border-t border-[#EEE]">
                        <td colSpan={2} className="pl-8 py-1.5">
                          <button onClick={() => toggleGrup(il.id + grup.grup)} className="flex items-center gap-1.5">
                            {acikGrup[il.id + grup.grup] ? <ChevronDown className="w-3 h-3 text-[#666]" /> : <ChevronRight className="w-3 h-3 text-[#666]" />}
                            <span className="inline-block w-0.5 h-3 bg-[#888]" />
                            <span className="text-[12px] font-bold text-[#333] uppercase">{grup.grup}</span>
                          </button>
                        </td>
                      </tr>
                      {acikGrup[il.id + grup.grup] && grup.programlar.map(p => {
                        const dolu = sureDoldu(p.bitis);
                        const varMi = kayitli_ids.has(p.id);
                        return (
                          <tr key={p.id} className="border-t border-[#EEE]">
                            <td className="pl-12 pr-2 py-1.5">
                              <span className="inline-block w-1 h-4 bg-[#E7C688] mr-1.5 align-middle" />
                              <span className="text-[11.5px] text-[#444]">{p.ad}</span>
                              <span className="text-[11px] text-[#888] ml-1">(Bitiş: {new Date(p.bitis).toLocaleDateString("tr-TR")})</span>
                            </td>
                            <td className="px-2 py-1.5 whitespace-nowrap">
                              <button onClick={() => setDetay(p)} className="inline-flex items-center justify-center w-[26px] h-[26px] bg-[#4A4A4A] hover:bg-[#333] text-white rounded-[3px] mr-1" title="Detay">
                                <span className="text-[11px] italic font-bold">i</span>
                              </button>
                              {varMi ? (
                                <button disabled className="inline-flex items-center gap-1 h-[26px] px-2.5 text-[11px] font-bold text-white bg-[#4A4A4A] rounded-[3px] opacity-90 cursor-default">
                                  <span className="italic">i</span> Tercih Yapıldı
                                </button>
                              ) : dolu ? (
                                <button disabled className="inline-flex items-center gap-1 h-[26px] px-2.5 text-[11px] font-bold text-white bg-[#AAA] rounded-[3px] cursor-not-allowed">
                                  Süresi Doldu
                                </button>
                              ) : (
                                <button onClick={() => setEkleOnay(p)} className="inline-flex items-center gap-1 h-[26px] px-2.5 text-[11px] font-bold text-white bg-[#5E7F42] hover:bg-[#4A6634] rounded-[3px]">
                                  <Check className="w-3 h-3" /> Tercih Yap
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* SAĞ — Kaydedilmiş Tercihler */}
        <div className="bg-white border border-[#DDDDDD] rounded overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[#F5F5F5]">
            <h3 className="text-[13.5px] font-semibold text-[#555]">Kaydedilmiş Tercihlerim</h3>
            <button className="text-[16px] text-[#888] hover:text-[#333]">−</button>
          </div>
          <div className="p-2.5 border-b border-[#EEE] bg-[#FAFAFA] text-[11px] text-[#666] flex items-center justify-end">
            Sayfada 10 kayıt ▾
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[#E5E5E5] text-[#555]">
                <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase w-[90px]">Tercih Sıralama</th>
                <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase">Tercihler</th>
                <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase w-[100px]">Sıralama Değiştir</th>
                <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase w-[110px]">Diğer İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {kayitliCozumlu.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-[#888] italic">Henüz tercih eklenmedi. Sol paneldeki programlardan "Tercih Yap" ile ekleyiniz.</td></tr>
              )}
              {kayitliCozumlu.map((row, i) => (
                <Fragment key={row.tercih.ilanId}>
                  {i === 0 && row.ilan && (
                    <tr className="bg-[#F5F5F5] border-t border-[#EEE]">
                      <td colSpan={4} className="px-3 py-2 text-[12.5px] font-bold text-[#333]">{row.ilan.baslik}</td>
                    </tr>
                  )}
                  {(i === 0 || kayitliCozumlu[i - 1].ilan?.id !== row.ilan?.id) && (
                    <tr className="bg-[#FAFAFA] border-t border-[#EEE]">
                      <td colSpan={4} className="pl-6 py-1.5 text-[11.5px] font-bold text-[#555] uppercase">
                        <span className="inline-block w-1 h-3 bg-[#888] mr-1.5 align-middle" />
                        {row.program?.grup ?? "GRUP"}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-[#EEE]">
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#A82232] text-white font-bold text-[12px]">{row.sira}</span>
                    </td>
                    <td className="px-3 py-2 text-[11.5px] text-[#333]">
                      {row.program?.ad ?? row.tercih.ilanId}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => yer(i, -1)} disabled={i === 0} className="inline-flex items-center justify-center w-[26px] h-[26px] bg-white border border-[#CCC] rounded-[3px] hover:bg-[#F5F5F5] mr-0.5 disabled:opacity-40">
                        <ArrowUp className="w-3 h-3 text-[#666]" />
                      </button>
                      <button onClick={() => yer(i, +1)} disabled={i === kayitliCozumlu.length - 1} className="inline-flex items-center justify-center w-[26px] h-[26px] bg-white border border-[#CCC] rounded-[3px] hover:bg-[#F5F5F5] disabled:opacity-40">
                        <ArrowDown className="w-3 h-3 text-[#666]" />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => sil(row.tercih.ilanId)} className="inline-flex items-center gap-1 h-[24px] px-2 text-[11px] font-bold text-white bg-[#A82232] rounded-[3px] mr-1 mb-0.5">
                        <Trash2 className="w-3 h-3" /> Sil
                      </button>
                      <button onClick={() => row.program && setDetay(row.program)} className="inline-flex items-center gap-1 h-[24px] px-2 text-[11px] font-bold text-white bg-[#4A6FA5] rounded-[3px]">
                        <span className="italic">i</span> Durum
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detay pop-up */}
      {detay && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetay(null)} />
          <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-lg">
            <header className="flex items-center gap-3 px-5 h-[52px] border-b" style={{ background: MSB.red, color: "#fff" }}>
              <Info className="w-4 h-4" />
              <h2 className="text-[13.5px] font-extrabold uppercase tracking-wide flex-1">Program Detayı</h2>
              <button onClick={() => setDetay(null)} className="text-white/85 hover:text-white p-1"><X className="w-4 h-4" /></button>
            </header>
            <div className="p-5 space-y-2.5 text-[13px]">
              <div><span className="text-[#666]">Program: </span><strong>{detay.ad}</strong></div>
              <div className="grid grid-cols-2 gap-2 border-t pt-2.5">
                <div><Users className="w-3.5 h-3.5 inline text-[#5E7F42] mr-1" /><span className="text-[#666]">Asil: </span><strong className="tabular-nums">{detay.kontenjanAsil}</strong></div>
                <div><Users className="w-3.5 h-3.5 inline text-[#C87E27] mr-1" /><span className="text-[#666]">Yedek: </span><strong className="tabular-nums">{detay.kontenjanYedek}</strong></div>
                <div><span className="text-[#666]">Cinsiyet Şartı: </span><strong>{detay.cinsiyet}</strong></div>
                <div><span className="text-[#666]">Son Başvuru: </span><strong>{new Date(detay.bitis).toLocaleDateString("tr-TR")}</strong></div>
              </div>
              <div className="border-t pt-2.5 text-[12px] text-[#666]">
                <strong>Süreç:</strong> Belge kontrol → mülakat → sağlık muayenesi → yerleştirme.
                Programa özel kriterler ilanın kılavuzunda ayrıntılı olarak açıklanmıştır.
              </div>
            </div>
            <footer className="px-5 py-3 border-t bg-[#FAFAFA] flex justify-end">
              <button className={btnLgt} onClick={() => setDetay(null)}>Kapat</button>
            </footer>
          </div>
        </div>
      )}

      {/* Ekle onayı */}
      {ekleOnay && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEkleOnay(null)} />
          <div className="relative bg-white rounded shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-md">
            <div className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-[#C87E27] flex-shrink-0" />
                <div>
                  <h3 className="text-[14px] font-bold text-[#333] mb-1">Tercih Ekleme Onayı</h3>
                  <p className="text-[12.5px] text-[#555]">Bu programı tercih listenize eklemek istediğinize emin misiniz?</p>
                  <div className="mt-2 p-2 bg-[#F5F5F5] rounded text-[12px] text-[#444]"><strong>{ekleOnay.ad}</strong></div>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-[#FAFAFA] flex justify-end gap-2">
              <button className={btnLgt} onClick={() => setEkleOnay(null)}>Vazgeç</button>
              <button className="inline-flex items-center gap-1.5 h-[28px] px-3 text-[12px] font-bold text-white bg-[#5E7F42] hover:bg-[#4A6634] rounded-[3px]" onClick={() => ekle(ekleOnay)}>
                <Check className="w-3.5 h-3.5" /> Evet, Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
