// Aday Başvuru Detay Timeline — Her ilana ait olay günlüğü (dikey zaman çizelgesi).
// Başvuru → Puan/Kriter → Ödeme → Yerleştirme → İtiraz.

import { useState, useMemo } from "react";
import {
  FileText, Check, X, Clock, Award, AlertCircle, CreditCard, Info,
  Calendar, ChevronRight, MessageSquare, TrendingUp, User as UserIcon,
} from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore } from "../shared/store";

type EventType = "info" | "basari" | "uyari" | "hata";
type TimelineEvent = { icon: React.ComponentType<{ className?: string }>; type: EventType; title: string; body: string; date?: string };

const btnLgt = "inline-flex items-center gap-1.5 h-[30px] px-2.5 text-[12px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";

const eventColor = (t: EventType) => ({
  info:   { dot: MSB.infoText, bg: MSB.infoBg,  brd: MSB.infoBrd,  fg: MSB.infoText },
  basari: { dot: "#5E7F42",    bg: "#EEF6E8",   brd: "#C7DDB0",    fg: "#5E7F42" },
  uyari:  { dot: MSB.orange,   bg: MSB.warnBg,  brd: MSB.warnBrd,  fg: MSB.orange },
  hata:   { dot: MSB.red,      bg: "#FBECEE",   brd: "#E8B5BB",    fg: MSB.red },
})[t];

export default function BasvuruDetayTimeline({ adayId }: { adayId: string }) {
  const basvurular = useStore(s => s.basvurular.filter(b => b.adayId === adayId));
  const ilanlar = useStore(s => s.ilanlar);
  const yerlestirmeler = useStore(s => s.yerlestirmeler);
  const cagrilar = useStore(s => s.cagrilar.filter(c => c.adayId === adayId));
  const tercihler = useStore(s => s.tercihler.filter(t => t.adayId === adayId));
  const [aktifId, setAktifId] = useState<string | null>(basvurular[0]?.id ?? null);
  const aktif = basvurular.find(b => b.id === aktifId);
  const ilan = aktif ? ilanlar.find(i => i.id === aktif.ilanId) : null;

  const olaylar: TimelineEvent[] = useMemo(() => {
    if (!aktif || !ilan) return [];
    const ol: TimelineEvent[] = [];

    // 1. Başvuru
    ol.push({
      icon: FileText, type: "info",
      title: "Başvuru Alındı",
      body: `${ilan.baslik} ilanına başvurunuz sisteme kaydedildi. Tercih listenizde ${tercihler.filter(t => t.ilanId === aktif.ilanId).length || "—"} program bulunuyor.`,
      date: aktif.basvuruTarihi,
    });

    // 2. Puan / Kriter
    if (aktif.puan > 0) {
      ol.push({
        icon: TrendingUp, type: aktif.puan >= ilan.minPuan ? "basari" : "hata",
        title: "Puan ve Kriter Doğrulaması",
        body: `Ham başvuru puanı: ${aktif.puan.toFixed(2)}. Taban puan: ${ilan.minPuan}. ${aktif.bonservisPuani ? `Bonservis puanı: +${aktif.bonservisPuani}. ` : ""}${aktif.puan >= ilan.minPuan ? "Taban puanı geçtiniz." : "Taban puanı sağlamıyorsunuz."}`,
      });
    }

    // 3. Belge onay
    if (aktif.durum === "belge_onay_bekliyor") {
      ol.push({ icon: FileText, type: "uyari", title: "Belge Onayı Bekleniyor", body: "Belgeleriniz komisyon tarafından inceleniyor." });
    } else if (aktif.durum === "onaylandi") {
      ol.push({ icon: Check, type: "basari", title: "Belge Onayı Alındı", body: "Tüm belgeleriniz onaylanmıştır." });
    } else if (aktif.durum === "reddedildi") {
      ol.push({ icon: X, type: "hata", title: "Başvuru Reddedildi", body: aktif.redGerekce ?? aktif.adminGerekce ?? "Belirtilmedi." });
    }

    // 4. Ödeme
    if (ilan.odemeKurali && ilan.odemeKurali !== "yok") {
      if (aktif.odemeDurumu === "alindi") {
        ol.push({ icon: CreditCard, type: "basari", title: "Ödeme Onaylandı", body: `${ilan.ucretTutari} TL başvuru ücreti onaylandı. Referans: ${aktif.referansKodu ?? "—"}`, date: aktif.odemeTarihi });
      } else if (aktif.odemeDurumu === "inceleniyor") {
        ol.push({ icon: CreditCard, type: "uyari", title: "Ödeme İnceleniyor", body: `Dekont yüklendi (${aktif.dekontAdi}). Admin doğrulaması bekleniyor.`, date: aktif.odemeTarihi });
      } else if (aktif.odemeDurumu === "iade_edildi") {
        ol.push({ icon: CreditCard, type: "info", title: "Ödeme İade Edildi", body: "Yerleşemediğiniz için başvuru ücretiniz iade edilmiştir." });
      } else if (aktif.durum !== "yerlestirilmedi") {
        ol.push({ icon: CreditCard, type: "uyari", title: "Ödeme Bekleniyor", body: `${ilan.ucretTutari} TL başvuru ücreti ödemeniz gerekmektedir. Vade: ${ilan.odemeVadeSaat ?? 48} saat.` });
      }
    } else {
      ol.push({ icon: Info, type: "info", title: "Ücretten Muaf", body: "Bu ilan ücretsiz olduğu için ödeme adımı bulunmamaktadır." });
    }

    // 5. Yerleştirme
    const yerl = yerlestirmeler.find(y => y.ilanId === aktif.ilanId && y.yayinlandi);
    const sonuc = yerl?.sonuclar.find(r => r.adayId === adayId);
    if (yerl && sonuc) {
      if (sonuc.durum === "yerlesti") {
        ol.push({ icon: Award, type: "basari", title: "Asil Olarak Yerleştiniz", body: `${sonuc.tercihSirasi}. tercihinize ${sonuc.puan.toFixed(2)} nihai puanla ASİL olarak yerleştiniz.`, date: yerl.tarih });
      } else if (sonuc.durum === "yedek") {
        ol.push({ icon: Clock, type: "uyari", title: `${sonuc.yedekSirasi ?? "—"}. Yedek Sırada Bekliyorsunuz`, body: `${sonuc.puan.toFixed(2)} nihai puanla yedek listesindesiniz. Sıranız asile yükseldiğinde bildirim alacaksınız.`, date: yerl.tarih });
      } else {
        ol.push({ icon: X, type: "hata", title: "Yerleşemediniz", body: aktif.adminGerekce ?? "Kadro dahilinde değerlendirilemediğiniz için yerleşme sağlanamamıştır.", date: yerl.tarih });
      }
    } else if (aktif.durum === "gonderildi" || aktif.durum === "onaylandi") {
      ol.push({ icon: Clock, type: "info", title: "Yerleştirme Bekleniyor", body: "Simülasyon çalıştırıldıktan sonra sonucunuz burada görünecektir." });
    }

    // 6. Kesin Kayıt
    if (aktif.kesinKayitDurumu === "beklemede") {
      ol.push({ icon: FileText, type: "uyari", title: "Kesin Kayıt Dönemi Başladı", body: `Zorunlu evraklarınızı yükleyip kesin kayıt başvurunuzu tamamlayınız. Son gün: ${ilan.kesinKayitBitis ?? "—"}` });
    } else if (aktif.kesinKayitDurumu === "inceleniyor") {
      ol.push({ icon: Clock, type: "uyari", title: "Kesin Kayıt İnceleniyor", body: `Yüklediğiniz ${aktif.kesinKayitEvraklar?.length ?? 0} evrak admin tarafından inceleniyor.` });
    } else if (aktif.kesinKayitDurumu === "onaylandi") {
      ol.push({ icon: Award, type: "basari", title: "Kesin Kayıt Onaylandı", body: "Kayıt Belgeniz (Barkodlu PDF) hazırdır. Kesin Kayıt sekmesinden indirebilirsiniz.", date: aktif.kesinKayitOnayTarihi });
    } else if (aktif.kesinKayitDurumu === "reddedildi") {
      ol.push({ icon: X, type: "hata", title: "Kesin Kayıt Reddedildi", body: aktif.kesinKayitRedNedeni ?? "Eksik/hatalı evrak." });
    } else if (aktif.kesinKayitDurumu === "feragat") {
      ol.push({ icon: X, type: "hata", title: "Kesin Kayıttan Feragat", body: "Bu programa yerleşme hakkınızdan kalıcı olarak feragat ettiniz. Kontenjan yedeğe devredildi." });
    } else if (aktif.kesinKayitDurumu === "sure_asimi") {
      ol.push({ icon: X, type: "hata", title: "Kesin Kayıt Süre Aşımı", body: "Tanınan süre içinde kesin kayıt işlemini tamamlamadınız. Hakkınız yedeğe devredildi." });
    }

    // 7. İtiraz / Çağrı Geçmişi
    const iliskiliCagrilar = cagrilar.filter(c => c.alimId === aktif.ilanId);
    iliskiliCagrilar.forEach(c => {
      ol.push({
        icon: MessageSquare,
        type: c.durum === "yanitlandi" ? "info" : c.durum === "kapali" ? "info" : "uyari",
        title: `Çağrı Açıldı: ${c.kategori}`,
        body: c.aciklama.slice(0, 200) + (c.aciklama.length > 200 ? "..." : ""),
        date: c.olusturma,
      });
      // Admin yanıtı varsa ekle
      const adminYanit = c.mesajlar.find(m => m.gonderen === "admin");
      if (adminYanit) {
        ol.push({
          icon: MessageSquare, type: "basari",
          title: `Çağrıya Admin Yanıtı`,
          body: adminYanit.metin.slice(0, 200) + (adminYanit.metin.length > 200 ? "..." : ""),
          date: adminYanit.tarih,
        });
      }
    });

    // Tarihi olan olayları kronolojik, tarihi olmayanları eklendikleri (mantıksal) sıraya göre koru.
    // Push edildiği doğal sırayı korumak için stable sort — index bazlı fallback:
    const indexed = ol.map((e, i) => ({ e, i }));
    indexed.sort((A, B) => {
      const da = A.e.date, db = B.e.date;
      if (da && db) return da.localeCompare(db);
      if (da && !db) return -1;  // tarihli olan önce
      if (!da && db) return 1;
      return A.i - B.i;          // ikisi de tarihsizse orijinal sıra
    });
    return indexed.map(x => x.e);
  }, [aktif, ilan, yerlestirmeler, cagrilar, tercihler, adayId]);

  if (basvurular.length === 0) {
    return (
      <div className="bg-white border border-[#DDD] rounded p-10 text-center">
        <FileText className="w-12 h-12 mx-auto text-[#CCC] mb-3" />
        <h3 className="text-[15px] font-semibold text-[#555] mb-1">Henüz başvurunuz bulunmuyor.</h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      {/* Sol: Başvuru kartları */}
      <div className="bg-white border border-[#DDD] rounded overflow-hidden">
        <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase">
          Başvurularım ({basvurular.length})
        </div>
        <div className="divide-y divide-[#EEE]">
          {basvurular.map(b => {
            const il = ilanlar.find(x => x.id === b.ilanId);
            const at = aktifId === b.id;
            return (
              <button key={b.id} onClick={() => setAktifId(b.id)}
                className={`w-full text-left px-3 py-2.5 ${at ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                <div className="text-[12.5px] font-bold text-[#333] line-clamp-2 mb-1">{il?.baslik}</div>
                <div className="text-[10.5px] text-[#888]">
                  Başvuru: {new Date(b.basvuruTarihi).toLocaleDateString("tr-TR")}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {b.durum === "yerlestirildi" && <span className="px-2 py-0.5 bg-[#EEF6E8] text-[#5E7F42] text-[10px] font-bold rounded uppercase">Asil</span>}
                  {b.durum === "yedek" && <span className="px-2 py-0.5 bg-[#FCF3E3] text-[#C87E27] text-[10px] font-bold rounded uppercase">Yedek</span>}
                  {b.durum === "reddedildi" && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] text-[10px] font-bold rounded uppercase">Red</span>}
                  {(b.durum === "gonderildi" || b.durum === "onaylandi") && <span className="px-2 py-0.5 bg-[#DBEAF5] text-[#1F5372] text-[10px] font-bold rounded uppercase">İnceleme</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ: Timeline */}
      <div className="bg-white border border-[#DDD] rounded">
        {!aktif || !ilan ? (
          <div className="p-10 text-center text-[#888]">
            <ChevronRight className="w-8 h-8 mx-auto text-[#CCC] mb-2" />
            <div className="text-[13px]">Süreç akışını görüntülemek için soldan bir başvuru seçin.</div>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b bg-[#FAFAFA]">
              <div className="text-[10.5px] font-bold text-[#888] uppercase tracking-widest mb-1">Başvuru Detay Zaman Çizelgesi</div>
              <h2 className="text-[16px] font-bold text-[#333]">{ilan.baslik}</h2>
              <div className="text-[11.5px] text-[#666] mt-1 flex items-center gap-3 flex-wrap">
                <span><Calendar className="w-3 h-3 inline mr-1" />Başvuru: {new Date(aktif.basvuruTarihi).toLocaleDateString("tr-TR")}</span>
                <span>·</span>
                <span>Puan: <strong>{aktif.puan.toFixed(2)}</strong></span>
                <span>·</span>
                <span>Nihai Puan: <strong className="text-[#A82232]">{aktif.nihaiPuan?.toFixed(2) ?? "—"}</strong></span>
              </div>
            </div>

            <div className="p-5">
              <div className="relative pl-8">
                {/* Dikey çizgi */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#E5E5E5]" />
                {olaylar.length === 0 ? (
                  <div className="text-[13px] text-[#888] italic py-4">Henüz olay yok.</div>
                ) : olaylar.map((e, i) => {
                  const c = eventColor(e.type);
                  const Ic = e.icon;
                  return (
                    <div key={i} className="relative mb-4">
                      {/* Nokta */}
                      <div className="absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10"
                        style={{ borderColor: c.dot, color: c.dot }}>
                        <Ic className="w-3 h-3" />
                      </div>
                      {/* Kart */}
                      <div className="border rounded p-3" style={{ background: c.bg, borderColor: c.brd, color: c.fg }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[13px] font-bold">{e.title}</div>
                          {e.date && <div className="text-[10.5px] opacity-70">{new Date(e.date).toLocaleString("tr-TR")}</div>}
                        </div>
                        <div className="text-[12px] leading-relaxed opacity-90">{e.body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
