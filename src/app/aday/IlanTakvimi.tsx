// Ana sayfada dinamik takvim — İlan başlangıç/bitiş/tercih/sonuç tarihlerini
// otomatik gösterir. Güne tıklayınca etkinlik pop-up'ı açar.

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, X } from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore, type Ilan } from "../shared/store";

type Event = { date: string; ilan: Ilan; tip: "baslangic" | "bitis" | "kesin_kayit" | "ek_tercih" | "sonuc"; renk: string; label: string };

const AY_ADLARI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUN_ADLARI = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

export default function IlanTakvimi({ onDetay }: { onDetay?: (ilanId: string) => void }) {
  const ilanlar = useStore(s => s.ilanlar);
  const [ay, setAy] = useState(new Date().getMonth());
  const [yil, setYil] = useState(new Date().getFullYear());
  const [seciliGun, setSeciliGun] = useState<string | null>(null);

  const eventler: Event[] = useMemo(() => {
    const ev: Event[] = [];
    ilanlar.forEach(i => {
      if (i.baslangic) ev.push({ date: i.baslangic, ilan: i, tip: "baslangic", renk: "#5E7F42", label: "Başvuru Başlangıcı" });
      if (i.bitis)     ev.push({ date: i.bitis,     ilan: i, tip: "bitis",     renk: MSB.red,  label: "Başvuru Bitiş / Tercih Son Günü" });
      if (i.kesinKayitBitis) ev.push({ date: i.kesinKayitBitis, ilan: i, tip: "kesin_kayit", renk: "#C87E27", label: "Kesin Kayıt Son Günü" });
      if (i.ekTercihBitis)   ev.push({ date: i.ekTercihBitis,   ilan: i, tip: "ek_tercih",   renk: "#4A6FA5", label: "Ek Tercih Son Günü" });
    });
    return ev;
  }, [ilanlar]);

  // Ayın günlerini oluştur
  const ilkGun = new Date(yil, ay, 1);
  const sonGun = new Date(yil, ay + 1, 0);
  const gunSayisi = sonGun.getDate();
  const baslangicHaftaGunu = (ilkGun.getDay() + 6) % 7; // Pazartesi = 0

  const gunler: (number | null)[] = [];
  for (let i = 0; i < baslangicHaftaGunu; i++) gunler.push(null);
  for (let i = 1; i <= gunSayisi; i++) gunler.push(i);

  const eventForGun = (g: number): Event[] => {
    const iso = `${yil}-${String(ay + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
    return eventler.filter(e => e.date === iso);
  };

  const oncekiAy = () => { if (ay === 0) { setAy(11); setYil(yil - 1); } else setAy(ay - 1); };
  const sonrakiAy = () => { if (ay === 11) { setAy(0); setYil(yil + 1); } else setAy(ay + 1); };
  const bugun = new Date();
  const bugunGun = bugun.getMonth() === ay && bugun.getFullYear() === yil ? bugun.getDate() : -1;

  const seciliEventler = seciliGun ? eventForGun(parseInt(seciliGun.split("-")[2], 10)) : [];

  return (
    <div className="bg-white border border-[#DDD] rounded overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F5F5F5]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#A82232]" />
          <h3 className="text-[13.5px] font-bold text-[#333]">İLAN TAKVİMİ</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={oncekiAy} className="p-1.5 hover:bg-white rounded"><ChevronLeft className="w-3.5 h-3.5 text-[#666]" /></button>
          <div className="text-[13px] font-bold text-[#333] px-3 tabular-nums min-w-[130px] text-center">{AY_ADLARI[ay]} {yil}</div>
          <button onClick={sonrakiAy} className="p-1.5 hover:bg-white rounded"><ChevronRight className="w-3.5 h-3.5 text-[#666]" /></button>
        </div>
      </div>

      <div className="p-3">
        {/* Gün başlıkları */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {GUN_ADLARI.map(g => (
            <div key={g} className="text-center text-[10.5px] font-bold text-[#888] uppercase py-1">{g}</div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7 gap-1">
          {gunler.map((g, i) => {
            if (g === null) return <div key={i} className="h-[64px]" />;
            const evs = eventForGun(g);
            const iso = `${yil}-${String(ay + 1).padStart(2, "0")}-${String(g).padStart(2, "0")}`;
            const isToday = g === bugunGun;
            const secili = seciliGun === iso;
            return (
              <button
                key={i}
                onClick={() => setSeciliGun(evs.length > 0 ? iso : null)}
                className={`h-[64px] p-1 rounded border transition-all text-left ${
                  secili ? "border-[#A82232] bg-[#FBECEE] ring-1 ring-[#A82232]" :
                  isToday ? "border-[#A82232] bg-white" :
                  "border-[#EEE] bg-white hover:bg-[#FAFAFA]"
                } ${evs.length === 0 ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className={`text-[12px] font-bold tabular-nums ${isToday ? "text-[#A82232]" : "text-[#333]"}`}>{g}</div>
                <div className="mt-0.5 space-y-0.5">
                  {evs.slice(0, 2).map((e, j) => (
                    <div key={j} className="text-[9px] font-semibold truncate rounded px-1 py-0.5 text-white"
                      style={{ background: e.renk }} title={e.label}>
                      {e.tip === "baslangic" ? "▶" : e.tip === "bitis" ? "◼" : e.tip === "kesin_kayit" ? "🎓" : e.tip === "ek_tercih" ? "+" : "★"}
                    </div>
                  ))}
                  {evs.length > 2 && <div className="text-[8.5px] text-[#666]">+{evs.length - 2}</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Renk açıklamaları */}
        <div className="mt-3 pt-3 border-t border-[#EEE] flex items-center gap-3 flex-wrap text-[10.5px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: "#5E7F42" }} /> Başlangıç</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: MSB.red }} /> Bitiş / Tercih Son</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: "#C87E27" }} /> Kesin Kayıt</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded" style={{ background: "#4A6FA5" }} /> Ek Tercih</span>
        </div>
      </div>

      {/* Seçili gün etkinlikleri pop-up */}
      {seciliGun && seciliEventler.length > 0 && (
        <div className="border-t border-[#DDD] bg-[#FAFAFA] p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13px] font-bold text-[#333]">
              {new Date(seciliGun).toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — {seciliEventler.length} Etkinlik
            </h4>
            <button onClick={() => setSeciliGun(null)} className="p-1 hover:bg-white rounded"><X className="w-3.5 h-3.5 text-[#666]" /></button>
          </div>
          <div className="space-y-1.5">
            {seciliEventler.map((e, i) => (
              <button key={i} onClick={() => onDetay?.(e.ilan.id)}
                className="w-full flex items-start gap-2 p-2 bg-white border border-[#DDD] rounded hover:border-[#A82232] hover:bg-[#FBECEE] text-left">
                <span className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: e.renk }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-bold text-[#333] line-clamp-1">{e.ilan.baslik}</div>
                  <div className="text-[10.5px] text-[#666] mt-0.5" style={{ color: e.renk }}>{e.label}</div>
                </div>
                <ExternalLink className="w-3 h-3 text-[#888]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
