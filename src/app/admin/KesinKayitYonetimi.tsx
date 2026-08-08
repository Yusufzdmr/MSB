// Admin — Kesin Kayıt onay kuyruğu + kayıt dönemi başlatma + yedek çağırma.

import { useState } from "react";
import { Play, Check, X, FileText, Award, Clock, User, ChevronRight } from "lucide-react";
import { useStore, actions } from "../shared/store";
import { Btn, Pill, inputCls, selectCls, textareaCls, trTarih, maskTC } from "../shared/ui";
import { MSB } from "../shared/theme";

export default function KesinKayitYonetimi() {
  const store = useStore();
  const [seciliIlan, setSeciliIlan] = useState<string>(store.ilanlar[0]?.id ?? "");
  const [bitisTarihi, setBitisTarihi] = useState<string>(new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10));
  const [seciliBsvId, setSeciliBsvId] = useState<string | null>(null);
  const [redGerekce, setRedGerekce] = useState("");

  const ilan = store.ilanlar.find(i => i.id === seciliIlan);
  const kuyruk = store.basvurular.filter(b =>
    b.ilanId === seciliIlan && b.kesinKayitDurumu === "inceleniyor"
  );
  const seciliBsv = kuyruk.find(b => b.id === seciliBsvId) ?? null;

  const baslat = () => {
    if (!seciliIlan) return;
    if (!confirm(`"${ilan?.baslik}" için Kesin Kayıt Dönemini başlatmak istediğinize emin misiniz?\nAsil kazanan tüm adaylara bildirim gönderilecek.`)) return;
    actions.kesinKayitBaslat(seciliIlan, bitisTarihi);
    alert("Kesin kayıt dönemi başlatıldı ve asil adaylara bildirim gönderildi.");
  };

  const onayla = () => { if (seciliBsv) { actions.kesinKayitAdminOnay(seciliBsv.id, true); setSeciliBsvId(null); } };
  const reddet = () => {
    if (!seciliBsv || !redGerekce.trim()) return alert("Red gerekçesi zorunludur.");
    actions.kesinKayitAdminOnay(seciliBsv.id, false, redGerekce);
    setSeciliBsvId(null); setRedGerekce("");
  };

  const asilYerlesen = ilan
    ? store.yerlestirmeler.find(y => y.ilanId === seciliIlan && y.yayinlandi)?.sonuclar.filter(r => r.durum === "yerlesti").length ?? 0
    : 0;
  const kesinKayitTamam = ilan
    ? store.basvurular.filter(b => b.ilanId === seciliIlan && b.kesinKayitDurumu === "onaylandi").length : 0;
  const feragatEdenler = ilan
    ? store.basvurular.filter(b => b.ilanId === seciliIlan && b.kesinKayitDurumu === "feragat").length : 0;

  return (
    <div className="space-y-4">
      {/* Üst kontrol */}
      <div className="bg-white border border-[#DDD] rounded p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase">İlan Seçiniz</label>
          <select className={selectCls} value={seciliIlan} onChange={e => setSeciliIlan(e.target.value)}>
            {store.ilanlar.map(i => <option key={i.id} value={i.id}>{i.baslik}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase">Kayıt Bitiş Tarihi</label>
          <input type="date" className={inputCls} value={bitisTarihi} onChange={e => setBitisTarihi(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          {ilan?.kesinKayitAktif ? (
            <>
              <div className="flex-1">
                <div className="text-[12px] text-[#5E7F42] font-semibold mb-1">✓ Kesin Kayıt Dönemi Aktif</div>
                <div className="text-[11px] text-[#666]">Bitiş: {ilan.kesinKayitBitis}</div>
              </div>
              <Btn variant="light" size="sm" onClick={() => {
                if (!confirm(`"${ilan.baslik}" için feragat/süre aşımı olan asillerin kontenjanı sıradaki yedeklere devredilsin mi?\n\nYedeklere 3 gün ek kayıt süresi verilir.`)) return;
                const sayi = actions.yedekCagriTetikle(ilan.id);
                if (sayi === 0) alert("Boşalmış kontenjan yok veya çağrılacak yedek bulunamadı.");
                else alert(`${sayi} yedek aday asil listeye yükseltildi ve bildirim gönderildi.`);
              }}>Yedek Çağrı Listesini Tetikle</Btn>
            </>
          ) : (
            <Btn variant="success" onClick={baslat}><Play className="w-3.5 h-3.5" /> Kesin Kayıt Dönemini Başlat</Btn>
          )}
        </div>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-[#DDD] rounded p-3">
          <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Asil Yerleşen</div>
          <div className="text-[24px] font-black text-[#333] tabular-nums">{asilYerlesen}</div>
        </div>
        <div className="bg-white border border-[#DDD] rounded p-3">
          <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Kayıt Onaylandı</div>
          <div className="text-[24px] font-black text-[#5E7F42] tabular-nums">{kesinKayitTamam}</div>
        </div>
        <div className="bg-white border border-[#DDD] rounded p-3">
          <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Onay Kuyruğu</div>
          <div className="text-[24px] font-black text-[#C87E27] tabular-nums">{kuyruk.length}</div>
        </div>
        <div className="bg-white border border-[#DDD] rounded p-3">
          <div className="text-[10.5px] font-bold text-[#888] uppercase mb-1">Feragat Eden</div>
          <div className="text-[24px] font-black text-[#A82232] tabular-nums">{feragatEdenler}</div>
        </div>
      </div>

      {/* Onay kuyruğu */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
        <div className="bg-white border border-[#DDD] rounded overflow-hidden">
          <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase">Onay Kuyruğu ({kuyruk.length})</div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-[#EEE]">
            {kuyruk.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#888] italic">Bekleyen kayıt başvurusu yok.</div>
            ) : kuyruk.map(b => {
              const aday = store.adaylar.find(a => a.id === b.adayId);
              const aktif = seciliBsvId === b.id;
              return (
                <button key={b.id} onClick={() => setSeciliBsvId(b.id)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2 ${aktif ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                  <User className="w-4 h-4 text-[#666] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-bold text-[#333]">{aday?.ad} {aday?.soyad}</div>
                    <div className="text-[10.5px] text-[#888] tabular-nums">{maskTC(b.adayId)}</div>
                    <div className="text-[10px] text-[#888]">Puan: <strong>{b.puan.toFixed(2)}</strong> · {b.kesinKayitEvraklar?.length ?? 0} belge</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-[#CCC]" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Sağ: Detay */}
        <div className="bg-white border border-[#DDD] rounded">
          {!seciliBsv ? (
            <div className="p-10 text-center text-[13px] text-[#888]">
              <FileText className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
              İnceleyeceğiniz kayıt başvurusunu solda seçin.
            </div>
          ) : (() => {
            const aday = store.adaylar.find(a => a.id === seciliBsv.adayId);
            return (
              <>
                <div className="px-5 py-3.5 border-b bg-[#FAFAFA]">
                  <h2 className="text-[16px] font-bold text-[#333]">{aday?.ad} {aday?.soyad}</h2>
                  <div className="text-[11.5px] text-[#666] mt-0.5">TCKN: <span className="tabular-nums">{maskTC(seciliBsv.adayId)}</span> · Puan: <strong>{seciliBsv.puan.toFixed(2)}</strong> · Taahhüt: {seciliBsv.taahhutOnayi ? "✓ Verildi" : "❌ Yok"}</div>
                </div>

                <div className="p-5">
                  <h3 className="text-[12px] font-bold text-[#555] uppercase mb-3">Yüklenen Evraklar</h3>
                  <div className="space-y-1.5 mb-4">
                    {(seciliBsv.kesinKayitEvraklar ?? []).map((e, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 border border-[#EEE] rounded bg-white">
                        <FileText className="w-4 h-4 text-[#A82232] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-semibold text-[#333]">{e.ad}</div>
                          <div className="text-[10.5px] text-[#888]">{e.tip} · {e.boyutKB} KB</div>
                        </div>
                        <button className="text-[11.5px] text-[#A82232] hover:underline" onClick={() => alert(`${e.ad} açılıyor.`)}>Göster</button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase">Red Gerekçesi (yalnızca reddederken)</label>
                    <textarea className={textareaCls} value={redGerekce} onChange={e => setRedGerekce(e.target.value)}
                      placeholder="Örn: Diploma belgesi okunaklı değil. Adli sicil kaydı güncel değil. Yeni tarihli belge yükleyin." />
                  </div>
                </div>

                <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2">
                  <Btn variant="danger" onClick={reddet}><X className="w-3.5 h-3.5" /> Reddet - Eksik Evrak</Btn>
                  <Btn variant="success" onClick={onayla}><Check className="w-3.5 h-3.5" /> Kesin Kayıt Onayla</Btn>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
