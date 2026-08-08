// Admin (Yönetici) Paneli — üst seviye layout + sub-view routing.
// Alt sayfaların her biri kendi dosyasında; burada sadece kabuk + navigasyon.

import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Users, FileCheck2, Shuffle,
  Megaphone, MessageSquare, Settings, LogOut, Menu, Bell, Search, User as UserIcon,
  UserCheck, Award, CreditCard,
} from "lucide-react";
import { MSB, FONT } from "../shared/theme";
import { useStore, actions, select } from "../shared/store";
import AdminDashboard from "./Dashboard";
import IlanYonetimi from "./IlanYonetimi";
import AdayYonetimi from "./AdayYonetimi";
import BelgeOnay from "./BelgeOnay";
import Yerlestirme from "./Yerlestirme";
import DuyuruYonetimi from "./DuyuruYonetimi";
import MesajYonetimi from "./MesajYonetimi";
import BasvuruYonetimi from "./BasvuruYonetimi";
import KesinKayitYonetimi from "./KesinKayitYonetimi";
import FinansYonetimi from "./FinansYonetimi";

export type AdminView =
  | "dashboard" | "ilanlar" | "basvurular" | "adaylar" | "belgeler"
  | "yerlestirme" | "kesinkayit" | "finans" | "duyurular" | "mesajlar" | "ayarlar";

const menu: { id: AdminView; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; badge?: (s: ReturnType<typeof useStore>) => number | null }[] = [
  { id: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { id: "ilanlar",     label: "İlanlar",         icon: ClipboardList,  badge: s => select.aktifIlanSayisi(s) },
  { id: "basvurular",  label: "Başvuru Yönetimi", icon: UserCheck,      badge: s => s.basvurular.filter(b => b.durum === "gonderildi" || b.durum === "belge_onay_bekliyor").length || null },
  { id: "adaylar",     label: "Adaylar",         icon: Users,           badge: s => select.toplamAday(s) },
  { id: "belgeler",    label: "Belge Onay",      icon: FileCheck2,     badge: s => select.bekleyenBelgeSayisi(s) || null },
  { id: "yerlestirme", label: "Yerleştirme",     icon: Shuffle },
  { id: "kesinkayit",  label: "Kesin Kayıt",     icon: Award, badge: s => s.basvurular.filter(b => b.kesinKayitDurumu === "inceleniyor").length || null },
  { id: "finans",      label: "Finans / İade",    icon: CreditCard, badge: s => s.basvurular.filter(b => b.odemeDurumu === "inceleniyor" || b.odemeDurumu === "iade_edilecek").length || null },
  { id: "duyurular",   label: "Duyurular",       icon: Megaphone },
  { id: "mesajlar",    label: "Mesajlar",        icon: MessageSquare,   badge: s => s.mesajlar.filter(m => !m.okundu && m.alici === "admin").length || null },
  { id: "ayarlar",     label: "Ayarlar",         icon: Settings },
];

export default function AdminScreen({ onLogout }: { onLogout: () => void }) {
  const store = useStore();
  const [view, setView] = useState<AdminView>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const title = menu.find(m => m.id === view)?.label ?? "";

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col" style={{ fontFamily: FONT, color: MSB.ink }}>
      {/* ═════════ TOP BAR ═════════ */}
      <header className="h-[58px] bg-white border-b border-[#E0E0E0] flex items-center px-3 sm:px-5 sticky top-0 z-40">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 mr-2 hover:bg-[#F5F5F5] rounded">
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: MSB.red }}>
            <span className="text-white font-black text-[12px] tracking-tight">MSB</span>
          </div>
          <div className="leading-tight">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.12em]" style={{ color: MSB.red }}>Personel Temin Dairesi</div>
            <div className="text-[13.5px] font-extrabold tracking-tight" style={{ color: MSB.navy }}>Yönetim Konsolu</div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-6 hidden md:block relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" strokeWidth={2} />
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Aday, ilan, belge ara…"
            className="w-full h-[34px] pl-9 pr-3 text-[13px] bg-[#F5F5F5] border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#CCCCCC]" />
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button className="relative p-2 hover:bg-[#F5F5F5] rounded-full" title="Bildirimler">
            <Bell className="w-4.5 h-4.5 text-[#555]" strokeWidth={2} />
            {select.bekleyenBelgeSayisi(store) > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: MSB.red }} />
            )}
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-[#EEE]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: MSB.navy }}>
              <UserIcon className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[12px] font-bold" style={{ color: MSB.ink }}>{store.oturum?.ad ?? "Yönetici"} {store.oturum?.soyad ?? ""}</div>
              <div className="text-[10px] text-[#888]">{store.oturum?.eposta ?? "yonetici@msb.gov.tr"}</div>
            </div>
            <button onClick={() => { actions.cikis(); onLogout(); }} className="p-2 hover:bg-[#F5F5F5] rounded-full ml-1" title="Çıkış">
              <LogOut className="w-4 h-4 text-[#666]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ═════════ BODY ═════════ */}
      <div className="flex-1 flex min-h-0">
        {/* SIDEBAR */}
        <aside className={`w-[232px] flex-shrink-0 border-r border-[#E0E0E0] bg-white flex-col ${mobileOpen ? "flex absolute z-30 h-[calc(100vh-58px)]" : "hidden md:flex"}`}>
          <nav className="flex-1 py-3">
            {menu.map(m => {
              const active = view === m.id;
              const badgeVal = m.badge?.(store) ?? null;
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => { setView(m.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-left transition-colors relative ${
                    active ? "text-white" : "text-[#444] hover:bg-[#F5F5F5]"
                  }`}
                  style={active ? { background: MSB.red } : {}}
                >
                  {active && <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: MSB.redDark }} />}
                  <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                  <span className="flex-1">{m.label}</span>
                  {badgeVal !== null && badgeVal > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full min-w-[20px] text-center tabular-nums ${
                      active ? "bg-white/25 text-white" : "text-white"
                    }`} style={!active ? { background: MSB.red } : {}}>
                      {badgeVal}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t border-[#EEEEEE] text-[10px] text-[#999] leading-relaxed">
            <div className="font-bold uppercase tracking-widest mb-1">T.C. Millî Savunma Bakanlığı</div>
            <div>Personel Temin Dairesi Başkanlığı</div>
            <div className="mt-1 opacity-70">v2.6.0 · {new Date().getFullYear()}</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {/* Page title */}
          <div className="px-5 sm:px-6 py-4 border-b border-[#E0E0E0] bg-white flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888]">Yönetim</div>
              <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: MSB.navy }}>{title}</h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#888]">
              <span className="font-semibold">{new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}</span>
              <span className="w-1 h-1 rounded-full bg-[#CCC]" />
              <span>Yönetici oturumu · <span style={{ color: MSB.green }}>●</span> Çevrimiçi</span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {view === "dashboard"   && <AdminDashboard onGoto={setView} />}
            {view === "ilanlar"     && <IlanYonetimi />}
            {view === "basvurular"  && <BasvuruYonetimi />}
            {view === "adaylar"     && <AdayYonetimi q={q} />}
            {view === "belgeler"    && <BelgeOnay />}
            {view === "yerlestirme" && <Yerlestirme />}
            {view === "kesinkayit"  && <KesinKayitYonetimi />}
            {view === "finans"      && <FinansYonetimi />}
            {view === "duyurular"   && <DuyuruYonetimi />}
            {view === "mesajlar"    && <MesajYonetimi />}
            {view === "ayarlar"     && <AyarlarPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

function AyarlarPanel() {
  const store = useStore();
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-5">
        <h3 className="text-[15px] font-extrabold mb-4" style={{ color: MSB.red }}>Sistem Ayarları</h3>
        <p className="text-[13px] text-[#666] mb-4 leading-relaxed">
          Demo amaçlı depolama <code className="bg-[#F5F5F5] px-1.5 py-0.5 rounded">localStorage</code> üzerinde tutulmaktadır. Production'da bu modülün
          arka planı bir REST/GraphQL servisine geçirilecektir. Aşağıdaki buton tüm demo verisini sıfırlar.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 text-[11.5px]">
          {[
            ["İlan", store.ilanlar.length],
            ["Aday", store.adaylar.length],
            ["Belge", store.belgeler.length],
            ["Duyuru", store.duyurular.length],
            ["Başvuru", store.basvurular.length],
            ["Tercih", store.tercihler.length],
            ["Yerleştirme", store.yerlestirmeler.length],
            ["Mesaj", store.mesajlar.length],
          ].map(([l, v]) => (
            <div key={l as string} className="border border-[#E0E0E0] rounded-[3px] px-3 py-2">
              <div className="text-[10px] uppercase font-bold text-[#888]">{l as string}</div>
              <div className="text-[16px] font-extrabold tabular-nums" style={{ color: MSB.red }}>{v as number}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { if (confirm("Tüm demo verisi sıfırlanacak. Devam?")) actions.resetAll(); }}
          className="h-9 px-4 border rounded-[3px] text-[12.5px] font-semibold text-white"
          style={{ background: MSB.red, borderColor: MSB.redDark }}>
          Demo Verisini Sıfırla
        </button>
      </div>
    </div>
  );
}
