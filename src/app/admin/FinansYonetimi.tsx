// Admin — Finans / İade ve Mahsup Yönetimi
// Ödeme doğrulama + açıkta kalanlar için IBAN listesi + toplu iade.

import { useState, useMemo } from "react";
import { Check, X, Download, FileText, Search, CreditCard, AlertCircle } from "lucide-react";
import { useStore, actions } from "../shared/store";
import { Btn, Pill, inputCls, selectCls, textareaCls, maskTC } from "../shared/ui";
import { MSB } from "../shared/theme";

export default function FinansYonetimi() {
  const store = useStore();
  const [seciliBsvId, setSeciliBsvId] = useState<string | null>(null);
  const [redGerekce, setRedGerekce] = useState("");
  const [aktifSekme, setAktifSekme] = useState<"inceleniyor" | "iade">("inceleniyor");

  const inceleniyor = useMemo(() => store.basvurular.filter(b => b.odemeDurumu === "inceleniyor"), [store.basvurular]);
  const iadeAdaylar = useMemo(() => store.basvurular.filter(b => b.odemeDurumu === "iade_edilecek"), [store.basvurular]);

  // Açıkta kalıp ödeme yapmış olanları "iade_edilecek" olarak işaretle (mock)
  const iadeAdayCikar = () => {
    const yerlestirmeler = store.yerlestirmeler.filter(y => y.yayinlandi);
    const yedekYerlesemeyen = new Set<string>();
    yerlestirmeler.forEach(y => {
      y.sonuclar.filter(r => r.durum === "yedek" || r.durum === "yerlesmedi").forEach(r => yedekYerlesemeyen.add(r.adayId));
    });
    const iadeGerekenler = store.basvurular.filter(b => yedekYerlesemeyen.has(b.adayId) && b.odemeDurumu === "alindi");
    if (iadeGerekenler.length === 0) return alert("Şu an iade edilmesi gereken kayıt yok.");
    // Mark all
    iadeGerekenler.forEach(b => actions.odemeReddet(b.id, "İade sürecine alındı."));
    alert(`${iadeGerekenler.length} adayın ödemesi iade listesine eklendi.`);
  };

  const iadeIndir = () => {
    const csv = [
      "TCKN;Ad;Soyad;IBAN;Tutar;Referans",
      ...iadeAdaylar.map(b => {
        const aday = store.adaylar.find(a => a.id === b.adayId);
        const ilan = store.ilanlar.find(i => i.id === b.ilanId);
        return `${b.adayId};${aday?.ad ?? ""};${aday?.soyad ?? ""};${(ilan?.banka?.iban ?? "").replace(/\s/g, "")};${ilan?.ucretTutari ?? 0};${b.referansKodu ?? ""}`;
      }),
    ].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `iade-listesi-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const iadeTumu = () => {
    if (iadeAdaylar.length === 0) return;
    if (!confirm(`${iadeAdaylar.length} kaydı 'İade Edildi' olarak işaretlemek istediğinize emin misiniz?`)) return;
    actions.iadeIsaretle(iadeAdaylar.map(b => b.id));
    alert("Kayıtlar iade edildi olarak arşive alındı.");
  };

  const seciliBsv = inceleniyor.find(b => b.id === seciliBsvId) ?? null;
  const seciliAday = seciliBsv ? store.adaylar.find(a => a.id === seciliBsv.adayId) : null;
  const seciliIlan = seciliBsv ? store.ilanlar.find(i => i.id === seciliBsv.ilanId) : null;

  const onayla = () => { if (seciliBsv) { actions.odemeOnayla(seciliBsv.id); setSeciliBsvId(null); } };
  const reddet = () => {
    if (!seciliBsv || !redGerekce.trim()) return alert("Gerekçe girin.");
    actions.odemeReddet(seciliBsv.id, redGerekce);
    setSeciliBsvId(null); setRedGerekce("");
  };

  return (
    <div className="space-y-4">
      {/* Sekmeler */}
      <div className="flex border-b border-[#DDD]">
        <button onClick={() => setAktifSekme("inceleniyor")}
          className={`px-4 py-2 text-[13px] font-semibold border-b-2 ${aktifSekme === "inceleniyor" ? "border-[#A82232] text-[#A82232]" : "border-transparent text-[#888]"}`}>
          Ödeme Doğrulama Kuyruğu ({inceleniyor.length})
        </button>
        <button onClick={() => setAktifSekme("iade")}
          className={`px-4 py-2 text-[13px] font-semibold border-b-2 ${aktifSekme === "iade" ? "border-[#A82232] text-[#A82232]" : "border-transparent text-[#888]"}`}>
          İade / Mahsup ({iadeAdaylar.length})
        </button>
      </div>

      {aktifSekme === "inceleniyor" && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
          <div className="bg-white border border-[#DDD] rounded overflow-hidden">
            <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase">İnceleme Bekleyen ({inceleniyor.length})</div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-[#EEE]">
              {inceleniyor.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-[#888] italic">Bekleyen ödeme yok.</div>
              ) : inceleniyor.map(b => {
                const aday = store.adaylar.find(a => a.id === b.adayId);
                const ilan = store.ilanlar.find(i => i.id === b.ilanId);
                const aktif = seciliBsvId === b.id;
                return (
                  <button key={b.id} onClick={() => setSeciliBsvId(b.id)}
                    className={`w-full text-left px-3 py-2.5 ${aktif ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                    <div className="text-[12.5px] font-bold text-[#333]">{aday?.ad} {aday?.soyad}</div>
                    <div className="text-[10.5px] text-[#888] tabular-nums">{maskTC(b.adayId)}</div>
                    <div className="text-[10px] text-[#666] mt-0.5"><strong>{ilan?.ucretTutari} TL</strong> · Ref: <span className="tabular-nums text-[#A82232]">{b.referansKodu}</span></div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-[#DDD] rounded">
            {!seciliBsv ? (
              <div className="p-10 text-center text-[13px] text-[#888]">
                <CreditCard className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
                Doğrulayacağınız ödemeyi solda seçin.
              </div>
            ) : (
              <>
                <div className="px-5 py-3.5 border-b bg-[#FAFAFA]">
                  <h2 className="text-[16px] font-bold text-[#333]">{seciliAday?.ad} {seciliAday?.soyad}</h2>
                  <div className="text-[11.5px] text-[#666] mt-0.5">TCKN: <span className="tabular-nums">{maskTC(seciliBsv.adayId)}</span> · İlan: {seciliIlan?.baslik}</div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border border-[#EEE] rounded">
                      <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Beklenen Tutar</div>
                      <div className="text-[18px] font-bold text-[#333] tabular-nums">{seciliIlan?.ucretTutari} TL</div>
                    </div>
                    <div className="p-3 border border-[#EEE] rounded">
                      <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Referans Kodu</div>
                      <div className="text-[14px] font-mono font-bold text-[#A82232]">{seciliBsv.referansKodu}</div>
                    </div>
                  </div>
                  <div className="p-3 border border-[#EEE] rounded bg-[#FAFAFA] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#A82232]" />
                    <div className="flex-1"><div className="text-[13px] font-semibold text-[#333]">{seciliBsv.dekontAdi}</div></div>
                    <button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => alert("Dekont açılıyor (mock).")}>Göster</button>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase">Red Gerekçesi (yalnızca reddederken)</label>
                    <textarea className={textareaCls} value={redGerekce} onChange={e => setRedGerekce(e.target.value)}
                      placeholder="Örn: Dekont tutarı eksik. Referans kodu yanlış. Farklı isim/hesap." />
                  </div>
                </div>
                <div className="px-5 py-3 border-t bg-[#FAFAFA] flex justify-end gap-2">
                  <Btn variant="danger" onClick={reddet}><X className="w-3.5 h-3.5" /> Reddet</Btn>
                  <Btn variant="success" onClick={onayla}><Check className="w-3.5 h-3.5" /> Ödemeyi Onayla</Btn>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {aktifSekme === "iade" && (
        <div className="bg-white border border-[#DDD] rounded">
          <div className="px-4 py-3 border-b bg-[#F5F5F5] flex items-center justify-between">
            <h3 className="text-[13.5px] font-bold text-[#555] uppercase">Açıkta Kalanlar — İade Edilecek Ödemeler</h3>
            <div className="flex gap-2">
              <Btn variant="light" onClick={iadeAdayCikar}>Açıkta Kalanları Tara</Btn>
              <Btn variant="light" onClick={iadeIndir}><Download className="w-3.5 h-3.5" /> IBAN Listesi (.CSV)</Btn>
              <Btn variant="success" onClick={iadeTumu}>Tümünü İade Edildi İşaretle</Btn>
            </div>
          </div>
          {iadeAdaylar.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#888] italic">İade edilecek kayıt bulunmuyor. "Açıkta Kalanları Tara" ile listeyi güncelleyin.</div>
          ) : (
            <table className="w-full text-[12.5px]">
              <thead>
                <tr style={{ background: MSB.redTable, color: "#fff" }}>
                  <th className="px-3 py-2 text-left text-[10.5px] uppercase">TCKN</th>
                  <th className="px-3 py-2 text-left text-[10.5px] uppercase">Ad Soyad</th>
                  <th className="px-3 py-2 text-left text-[10.5px] uppercase">İlan</th>
                  <th className="px-3 py-2 text-right text-[10.5px] uppercase">Tutar</th>
                  <th className="px-3 py-2 text-left text-[10.5px] uppercase">Referans</th>
                </tr>
              </thead>
              <tbody>
                {iadeAdaylar.map((b, i) => {
                  const aday = store.adaylar.find(a => a.id === b.adayId);
                  const ilan = store.ilanlar.find(x => x.id === b.ilanId);
                  return (
                    <tr key={b.id} className={i % 2 === 0 ? "" : "bg-[#FAFAFA]"}>
                      <td className="px-3 py-2 tabular-nums">{maskTC(b.adayId)}</td>
                      <td className="px-3 py-2 font-semibold">{aday?.ad} {aday?.soyad}</td>
                      <td className="px-3 py-2 text-[#666] truncate max-w-[300px]">{ilan?.baslik}</td>
                      <td className="px-3 py-2 tabular-nums text-right font-bold">{ilan?.ucretTutari} TL</td>
                      <td className="px-3 py-2 font-mono text-[#A82232]">{b.referansKodu}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
