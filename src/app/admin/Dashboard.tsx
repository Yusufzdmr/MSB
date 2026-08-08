// Admin Dashboard — KPI kartları + basit chart'lar + hızlı erişim.

import { Users, ClipboardList, FileCheck2, UserCheck, TrendingUp, ArrowRight, Award, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { useStore, select } from "../shared/store";
import { StatCard, Section, Pill, Btn, trTarih } from "../shared/ui";
import { MSB } from "../shared/theme";
import type { AdminView } from "./AdminScreen";

const KUV_COLORS: Record<string, string> = {
  "Kara":            MSB.red,
  "Deniz":           MSB.navy,
  "Hava":            "#4A6FA5",
  "Jandarma":        MSB.orange,
  "Sahil Güvenlik":  "#3AA6C0",
  "MSB Merkez":      "#6B6B6B",
};

export default function AdminDashboard({ onGoto }: { onGoto: (v: AdminView) => void }) {
  const store = useStore();

  const aktifIlan   = select.aktifIlanSayisi(store);
  const toplamAday  = select.toplamAday(store);
  const bekleyen    = select.bekleyenBelgeSayisi(store);
  const yerlesen    = select.toplamYerlesen(store);

  // Kuvvete göre başvuru dağılımı
  const kuvDagilim = store.ilanlar.reduce<Record<string, number>>((acc, i) => {
    acc[i.kuvvet] = (acc[i.kuvvet] || 0) + i.basvuranSayisi;
    return acc;
  }, {});
  const pieData = Object.entries(kuvDagilim).map(([name, value]) => ({ name, value }));

  // Kontenjan doluluk
  const kontenjanData = store.ilanlar
    .filter(i => i.durum === "yayin")
    .slice(0, 6)
    .map(i => ({
      ad: i.baslik.length > 22 ? i.baslik.slice(0, 22) + "…" : i.baslik,
      Başvuru: i.basvuranSayisi,
      Kontenjan: i.kontenjan,
    }));

  // Son 7 gün başvuru trendi (mock, seed'e uygun sabit desen)
  const trend = [
    { gun: "Pzt", basvuru: 62 },
    { gun: "Sal", basvuru: 78 },
    { gun: "Çar", basvuru: 91 },
    { gun: "Per", basvuru: 84 },
    { gun: "Cum", basvuru: 112 },
    { gun: "Cmt", basvuru: 45 },
    { gun: "Paz", basvuru: 38 },
  ];

  const sonBelgeler = [...store.belgeler]
    .filter(b => b.durum === "beklemede")
    .sort((a, b) => b.yuklemeTarihi.localeCompare(a.yuklemeTarihi))
    .slice(0, 5);

  const sonBasvurular = [...store.basvurular]
    .sort((a, b) => b.basvuruTarihi.localeCompare(a.basvuruTarihi))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Aktif İlan" value={aktifIlan} hint={`${store.ilanlar.length} toplam`}
          tone="red" icon={<ClipboardList className="w-5 h-5" strokeWidth={2} />} />
        <StatCard label="Kayıtlı Aday" value={toplamAday.toLocaleString("tr-TR")} hint="Sisteme kayıtlı"
          tone="navy" icon={<Users className="w-5 h-5" strokeWidth={2} />} />
        <StatCard label="Bekleyen Belge" value={bekleyen} hint={bekleyen > 0 ? "İncelemeniz gerekiyor" : "Kuyruk boş"}
          tone={bekleyen > 0 ? "gold" : "muted"} icon={<FileCheck2 className="w-5 h-5" strokeWidth={2} />} />
        <StatCard label="Yerleşen Aday" value={yerlesen} hint="Tüm ilanlarda"
          tone="green" icon={<UserCheck className="w-5 h-5" strokeWidth={2} />} />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-[4px]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EEE]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: MSB.red }} />
              <h3 className="text-[13.5px] font-extrabold" style={{ color: MSB.red }}>Kontenjan Doluluk</h3>
            </div>
            <Pill tone="info">Aktif ilanlar</Pill>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kontenjanData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                <XAxis dataKey="ad" tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Başvuru" fill={MSB.red} radius={[2, 2, 0, 0]} />
                <Bar dataKey="Kontenjan" fill={MSB.orange} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-[4px]">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#EEE]">
            <div className="w-1 h-4 rounded-full" style={{ background: MSB.red }} />
            <h3 className="text-[13.5px] font-extrabold" style={{ color: MSB.red }}>Kuvvete Göre Başvuru</h3>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={KUV_COLORS[d.name] || "#888"} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E0E0E0] rounded-[4px]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#EEE]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: MSB.red }} />
              <h3 className="text-[13.5px] font-extrabold" style={{ color: MSB.red }}>Son 7 Gün — Başvuru Trendi</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: MSB.green }}>
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} /> +18%
            </div>
          </div>
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                <XAxis dataKey="gun" tick={{ fontSize: 10, fill: "#666" }} />
                <YAxis tick={{ fontSize: 10, fill: "#666" }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="basvuru" stroke={MSB.red} strokeWidth={2.5} dot={{ fill: MSB.red, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E0E0E0] rounded-[4px] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#EEE]">
            <Bell className="w-3.5 h-3.5" style={{ color: MSB.red }} strokeWidth={2.5} />
            <h3 className="text-[13.5px] font-extrabold" style={{ color: MSB.red }}>Hızlı Erişim</h3>
          </div>
          <div className="p-3 flex flex-col gap-2 flex-1">
            <QuickBtn icon={<FileCheck2 className="w-4 h-4" />} label="Belge Onay Kuyruğu" hint={`${bekleyen} bekleyen`} onClick={() => onGoto("belgeler")} />
            <QuickBtn icon={<ClipboardList className="w-4 h-4" />} label="Yeni İlan Yayınla" hint="İlan yönetimi" onClick={() => onGoto("ilanlar")} />
            <QuickBtn icon={<Award className="w-4 h-4" />} label="Yerleştirme Motoru" hint="Otomatik/Manuel" onClick={() => onGoto("yerlestirme")} />
            <QuickBtn icon={<Bell className="w-4 h-4" />} label="Duyuru Yayınla" hint="Tüm adaylara" onClick={() => onGoto("duyurular")} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Son Yüklenen Belgeler" actions={
          <Btn size="sm" variant="ghost" onClick={() => onGoto("belgeler")}>Tümü <ArrowRight className="w-3 h-3" /></Btn>
        } dense>
          <div className="divide-y divide-[#EEE]">
            {sonBelgeler.length === 0 && (
              <div className="text-center text-[#888] py-6 text-[12.5px]">Bekleyen belge yok.</div>
            )}
            {sonBelgeler.map(b => {
              const aday = store.adaylar.find(a => a.id === b.adayId);
              return (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-[#F5F5F5] text-[#666]">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold truncate">{b.ad}</div>
                    <div className="text-[11px] text-[#888]">{aday ? `${aday.ad} ${aday.soyad}` : b.adayId} · {trTarih(b.yuklemeTarihi, true)}</div>
                  </div>
                  <Pill tone="warn">Bekliyor</Pill>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Son Başvurular" actions={
          <Btn size="sm" variant="ghost" onClick={() => onGoto("adaylar")}>Tümü <ArrowRight className="w-3 h-3" /></Btn>
        } dense>
          <div className="divide-y divide-[#EEE]">
            {sonBasvurular.map(b => {
              const aday = store.adaylar.find(a => a.id === b.adayId);
              const ilan = store.ilanlar.find(i => i.id === b.ilanId);
              const toneMap = { onaylandi: "success", reddedildi: "danger", yerlestirildi: "info", yerlestirilmedi: "danger", gonderildi: "warn", hazirlaniyor: "muted" } as const;
              return (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: MSB.navy }}>
                    {aday ? aday.ad[0] + aday.soyad[0] : "??"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold truncate">{aday ? `${aday.ad} ${aday.soyad}` : b.adayId}</div>
                    <div className="text-[11px] text-[#888] truncate">{ilan?.baslik ?? b.ilanId} · <span className="tabular-nums">{b.puan.toFixed(1)}</span></div>
                  </div>
                  <Pill tone={toneMap[b.durum] || "muted"}>{b.durum}</Pill>
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function QuickBtn({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 border border-[#E0E0E0] rounded-[3px] hover:bg-[#F8F8F8] transition-colors text-left group">
      <div className="w-8 h-8 rounded flex items-center justify-center text-white" style={{ background: MSB.red }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-bold" style={{ color: MSB.ink }}>{label}</div>
        <div className="text-[10.5px] text-[#888]">{hint}</div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-[#AAA] group-hover:text-[#666] transition-colors" strokeWidth={2} />
    </button>
  );
}
