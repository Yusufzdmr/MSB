// Çağrı/Sınav Durumu — adayın başvurduğu ilanların anlık durumunu, admin
// tebligat metinlerini ve sonuç belgesini gösterir.

import { useState } from "react";
import { FileText, Download, Check, X, AlertCircle, Info, MessageSquare, Clock } from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore, type Basvuru, type Ilan } from "../shared/store";
import { dosyaIndir } from "../shared/ui";

const btnLgt = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";
const btnDrk = "inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";

function statuBilgi(b: Basvuru, yedekSira?: number) {
  switch (b.durum) {
    case "hazirlaniyor":         return { label: "Hazırlanıyor", bg: "#F5F5F5", fg: "#555", brd: "#DDD", Ic: FileText };
    case "gonderildi":           return { label: "İnceleniyor / Değerlendirmede", bg: MSB.warnBg, fg: MSB.orange, brd: MSB.warnBrd, Ic: Info };
    case "belge_onay_bekliyor":  return { label: "Belge Onayı Bekliyor", bg: MSB.warnBg, fg: MSB.orange, brd: MSB.warnBrd, Ic: FileText };
    case "onaylandi":            return { label: "Belge Onayı Alındı", bg: "#EEF6E8", fg: "#5E7F42", brd: "#C7DDB0", Ic: Check };
    case "yerlestirildi":        return { label: "Asil Yerleşti", bg: "#EEF6E8", fg: "#5E7F42", brd: "#C7DDB0", Ic: Check };
    case "yedek":                return { label: `Yedek Sırada Bekliyor${yedekSira ? ` (${yedekSira}. Yedek)` : ""}`, bg: MSB.warnBg, fg: MSB.orange, brd: MSB.warnBrd, Ic: Clock };
    case "yerlestirilmedi":      return { label: "Yerleştirilmedi", bg: "#FBECEE", fg: "#A82232", brd: "#E8B5BB", Ic: X };
    case "reddedildi":           return { label: "Reddedildi / Puan Yetersiz", bg: "#FBECEE", fg: "#A82232", brd: "#E8B5BB", Ic: AlertCircle };
  }
}

export default function CagriSinavDurumu({ adayId }: { adayId: string }) {
  const basvurular = useStore(s => s.basvurular.filter(b => b.adayId === adayId));
  const ilanlar    = useStore(s => s.ilanlar);
  const yerlestirmeler = useStore(s => s.yerlestirmeler.filter(y => y.yayinlandi));
  const mesajlar   = useStore(s => s.mesajlar.filter(m => m.alici === adayId));

  const [seciliId, setSeciliId] = useState<string | null>(basvurular[0]?.id ?? null);
  const secili = basvurular.find(b => b.id === seciliId);
  const ilan   = secili ? ilanlar.find(i => i.id === secili.ilanId) : null;
  const yerl   = secili ? yerlestirmeler.find(y => y.ilanId === secili.ilanId) : null;
  const sonuc  = yerl?.sonuclar.find(r => r.adayId === adayId);
  const tebligat = secili ? mesajlar.filter(m => m.konu.toLowerCase().includes("yerleştirme") || m.konu.toLowerCase().includes("başvuru")) : [];

  if (basvurular.length === 0) {
    return (
      <div className="bg-white border border-[#DDDDDD] rounded p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-[#CCC] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#555] mb-1">Henüz başvurunuz bulunmuyor.</h3>
        <p className="text-[13px] text-[#888]">Aktif ilanlara başvurmak için "Tercih Yap" sayfasını kullanabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      {/* Sol: Başvurularım listesi */}
      <div className="bg-white border border-[#DDDDDD] rounded overflow-hidden">
        <div className="px-4 py-2.5 border-b bg-[#F5F5F5]">
          <h3 className="text-[13.5px] font-semibold text-[#555]">Başvurularım</h3>
        </div>
        <div className="divide-y divide-[#EEE]">
          {basvurular.map(b => {
            const il = ilanlar.find(i => i.id === b.ilanId);
            const y = yerlestirmeler.find(x => x.ilanId === b.ilanId);
            const r = y?.sonuclar.find(x => x.adayId === adayId);
            const sb = statuBilgi(b, r?.yedekSirasi ?? b.yedekSirasi);
            const aktif = seciliId === b.id;
            return (
              <button key={b.id} onClick={() => setSeciliId(b.id)}
                className={`w-full text-left px-3 py-2.5 transition-colors ${aktif ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                <div className="text-[12.5px] font-semibold text-[#333] leading-tight mb-1 line-clamp-2">{il?.baslik ?? b.ilanId}</div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10.5px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: sb!.bg, color: sb!.fg, border: `1px solid ${sb!.brd}` }}>
                    {sb!.label}
                  </span>
                </div>
                <div className="text-[10.5px] text-[#888] tabular-nums">Puan: {b.puan.toFixed(2)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ: Detay */}
      <div className="bg-white border border-[#DDDDDD] rounded">
        {!secili ? (
          <div className="p-8 text-center text-[13px] text-[#888]">Solda bir başvuru seçin.</div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-[#DDD] bg-[#FAFAFA]">
              <h2 className="text-[16px] font-bold text-[#333] mb-1">{ilan?.baslik}</h2>
              <div className="text-[12px] text-[#666]">Başvuru No: <strong className="text-[#A82232] tabular-nums">{secili.id}</strong> · Başvuru Tarihi: {new Date(secili.basvuruTarihi).toLocaleDateString("tr-TR")}</div>
            </div>

            <div className="p-5 space-y-4">
              {/* Statü kutusu */}
              {(() => { const sb = statuBilgi(secili, sonuc?.yedekSirasi ?? secili.yedekSirasi); const Ic = sb!.Ic; return (
                <div className="p-4 rounded border-l-4 flex items-start gap-3"
                  style={{ background: sb!.bg, borderColor: sb!.brd, borderLeftColor: sb!.fg, color: sb!.fg }}>
                  <Ic className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[14px] font-bold uppercase mb-1">{sb!.label}</div>
                    <div className="text-[12.5px] opacity-90">
                      {secili.durum === "gonderildi" && "Başvurunuz komisyon tarafından değerlendirilmektedir."}
                      {secili.durum === "belge_onay_bekliyor" && "Belgeleriniz komisyon tarafından inceleniyor. Sonuç Mesajlarım'a düşecektir."}
                      {secili.durum === "onaylandi"  && "Belge onay süreciniz tamamlanmıştır. Yerleştirme aşamasını bekleyiniz."}
                      {secili.durum === "yerlestirildi" && "Tebrikler! İlan kadrosuna asil olarak yerleştirildiniz."}
                      {secili.durum === "yedek" && "Yedek listesindesiniz. Asil listeye yükseldiğinizde bildirim alacaksınız."}
                      {secili.durum === "yerlestirilmedi" && "Kadro dahilinde değerlendirilememişsinizdir."}
                      {secili.durum === "reddedildi" && (secili.redGerekce ?? "Başvurunuz reddedilmiştir.")}
                    </div>
                  </div>
                </div>
              ); })()}

              {/* Admin resmi gerekçesi / açıklaması — rich text HTML render */}
              {secili.adminGerekce && secili.gonderildi && (
                <div className="border border-[#E0E0E0] rounded">
                  <div className="px-4 py-2 border-b bg-[#F5F5F5] text-[12.5px] font-bold text-[#555] flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Resmî Gerekçe / Açıklama (Sistem Yöneticisi)
                  </div>
                  <div className="p-4 text-[13px] text-[#333] leading-relaxed prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: secili.adminGerekce }} />
                  {secili.tebligatBelgesi && (
                    <div className="px-4 py-3 border-t bg-[#FAFAFA] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#A82232]" />
                      <span className="text-[12.5px] font-semibold text-[#333] flex-1">{secili.tebligatBelgesi}</span>
                      <button className={btnDrk} onClick={() => {
                        const icerik = `TEBLİGAT BELGESİ\n\nİlan: ${ilan?.baslik}\n\n${(secili.adminGerekce ?? "").replace(/<[^>]*>/g, "")}\n\nAd: ${secili.tebligatBelgesi}\nGönderim: ${secili.gonderilmeTarihi ? new Date(secili.gonderilmeTarihi).toLocaleString("tr-TR") : "-"}\n`;
                        const blob = new Blob([icerik], { type: "text/plain;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = secili.tebligatBelgesi!.replace(/\.pdf$/i, ".txt");
                        document.body.appendChild(a); a.click(); document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}>
                        <Download className="w-3.5 h-3.5" /> Tebligat PDF İndir
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Yerleştirme sonucu */}
              {sonuc && (
                <div className="border border-[#E0E0E0] rounded">
                  <div className="px-4 py-2 border-b bg-[#F5F5F5] text-[12.5px] font-bold text-[#555]">Yerleştirme Sonucu</div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[12.5px]">
                    <div><div className="text-[#888] text-[10.5px] uppercase font-bold">Statü</div><div className="text-[14px] font-bold text-[#A82232]">{sonuc.durum === "yerlesti" ? "ASİL YERLEŞTİ" : sonuc.durum === "yedek" ? "YEDEK" : "YERLEŞEMEDİ"}</div></div>
                    <div><div className="text-[#888] text-[10.5px] uppercase font-bold">Etkin Puan</div><div className="text-[14px] font-bold tabular-nums">{sonuc.puan.toFixed(2)}</div></div>
                    <div><div className="text-[#888] text-[10.5px] uppercase font-bold">Tercih Sırası</div><div className="text-[14px] tabular-nums">{sonuc.tercihSirasi}</div></div>
                    <div><div className="text-[#888] text-[10.5px] uppercase font-bold">Tarih</div><div className="text-[12.5px]">{new Date(yerl!.tarih).toLocaleDateString("tr-TR")}</div></div>
                  </div>
                  <div className="px-4 py-3 border-t bg-[#FAFAFA] flex items-center gap-2">
                    <button className={btnDrk} style={{ background: MSB.red, borderColor: MSB.redDark }} onClick={() => {
                      const kod = `SR-${sonuc!.tercihSirasi}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
                      dosyaIndir(
                        `T.C. MİLLÎ SAVUNMA BAKANLIĞI\nPERSONEL TEMİN — SONUÇ BELGESİ\n\nİlan: ${ilan?.baslik}\nStatü: ${sonuc!.durum.toUpperCase()}\nTercih Sırası: ${sonuc!.tercihSirasi}\nEtkin Puan: ${sonuc!.puan.toFixed(2)}\nSonuç Kodu: ${kod}\nTarih: ${new Date(yerl!.tarih).toLocaleDateString("tr-TR")}\n\nBu belge tebligat yerine geçmektedir.`,
                        `sonuc-${kod}.txt`
                      );
                    }}>
                      <Download className="w-3.5 h-3.5" /> Sonuç Belgesi İndir (PDF – QR Kodlu)
                    </button>
                    <div className="text-[11px] text-[#888] ml-auto">Bu sonuç tebligat yerine geçmektedir.</div>
                  </div>
                </div>
              )}

              {/* Admin tebligat metinleri */}
              <div className="border border-[#E0E0E0] rounded">
                <div className="px-4 py-2 border-b bg-[#F5F5F5] text-[12.5px] font-bold text-[#555] flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Tebligat / Bilgilendirme Metinleri
                </div>
                {tebligat.length === 0 ? (
                  <div className="p-4 text-[13px] text-[#888] italic">Henüz tebligat bulunmuyor.</div>
                ) : (
                  <div className="divide-y divide-[#EEE]">
                    {tebligat.map(m => (
                      <div key={m.id} className="p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-[13px] font-bold text-[#333]">{m.konu}</h4>
                          <span className="text-[11px] text-[#888]">{new Date(m.tarih).toLocaleString("tr-TR")}</span>
                        </div>
                        <p className="text-[12.5px] text-[#555] leading-relaxed">{m.icerik}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Başvuru özeti */}
              <div className="border border-[#E0E0E0] rounded">
                <div className="px-4 py-2 border-b bg-[#F5F5F5] text-[12.5px] font-bold text-[#555]">İlan Özeti</div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 text-[12.5px]">
                  <div><span className="text-[#888]">Kuvvet: </span>{ilan?.kuvvet}</div>
                  <div><span className="text-[#888]">Sınıf: </span>{ilan?.sinif}</div>
                  <div><span className="text-[#888]">Kontenjan: </span>{ilan?.kontenjan}</div>
                  <div><span className="text-[#888]">Yerleşen: </span>{ilan?.yerlesen}</div>
                  <div><span className="text-[#888]">Bitiş: </span>{ilan?.bitis}</div>
                  <div><span className="text-[#888]">Min. Puan: </span>{ilan?.minPuan}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
