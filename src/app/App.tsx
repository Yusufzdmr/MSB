import { useState, useEffect, useRef } from "react";
import {
  Search, ChevronRight, Bell, Users, Shield, ArrowRight, Check, X,
  Download, Menu, UserCheck, Upload, ClipboardCheck, ListChecks, Award,
  Building2, AlertCircle, Filter, MapPin, GraduationCap, Calendar,
  Clock, FileText, Star, Layers, Info, ChevronDown, Hash, ExternalLink,
  Printer, Share2, BookOpen, Phone, Mail, Globe, Twitter, Youtube,
  CheckCircle2, Circle, Dot, BarChart3, TrendingUp, Zap,
  Lock, Eye, EyeOff, KeyRound, ChevronLeft, Home, Briefcase,
  MessageSquare, Settings, LogOut, User as UserIcon, PieChart, Activity,
  Fingerprint, RotateCcw, BadgeCheck, Landmark, ScrollText, Moon,
  ScanLine, Trophy
} from "lucide-react";
import AdminScreen from "./admin/AdminScreen";
import OcrYukle from "./aday/OcrYukle";
import SonucEkrani from "./aday/SonucEkrani";
import BasvuruSihirbazi from "./aday/BasvuruSihirbazi";
import { CagriListesi } from "./aday/CagriAcma";
import CagriSinavDurumu from "./aday/CagriSinavDurumu";
import TercihEkrani from "./aday/TercihEkrani";
import DuyuruDetay from "./aday/DuyuruDetay";
import Mesajlarim from "./aday/Mesajlarim";
import KesinKayit from "./aday/KesinKayit";
import Odeme from "./aday/Odeme";
import { actions as storeActions, useStore as useSharedStore } from "./shared/store";

// Turkish flag & institutional palette
const TR = {
  red: "#E30A17",
  white: "#FFFFFF",
  gold: "#C9A24B",
  navy: "#0B2545",
};

// Ay-yıldız (crescent-star) crest — inline SVG for institutional feel
function TCCrest({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden fill="none">
      <circle cx="16" cy="16" r="15" fill="#0B2545" stroke="#C9A24B" strokeWidth="1.25" />
      <path d="M13.5 9.5a7.5 7.5 0 1 0 5.5 12.9 5.8 5.8 0 1 1 0-11.3 7.5 7.5 0 0 0-5.5-1.6z" fill="#C9A24B" />
      <path d="M22.8 15.6l1.6.5-1 1.4.1 1.7-1.5-.8-1.6.5.4-1.7-1-1.4 1.6-.1 1-1.4.4 1.3z" fill="#C9A24B" />
    </svg>
  );
}

// Red T.C. institutional top strip — the "this is a real gov site" signal
function GovStrip() {
  const [openLinks, setOpenLinks] = useState(false);

  const kurumsal = [
    { label: "turkiye.gov.tr",      href: "https://www.turkiye.gov.tr" },
    { label: "msb.gov.tr",           href: "https://www.msb.gov.tr" },
    { label: "kkk.tsk.tr (Kara K.K.)",   href: "https://www.kkk.tsk.tr" },
    { label: "hvkk.tsk.tr (Hava K.K.)",  href: "https://www.hvkk.tsk.tr" },
    { label: "dzkk.tsk.tr (Deniz K.K.)", href: "https://www.dzkk.tsk.tr" },
    { label: "jandarma.gov.tr",      href: "https://www.jandarma.gov.tr" },
    { label: "cimer.gov.tr",         href: "https://www.cimer.gov.tr" },
  ];

  return (
    <div className="bg-[#E30A17] border-b border-black/10 relative z-[70]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 h-7 flex items-center justify-between text-white">
        <a href="https://www.turkiye.gov.tr" target="_blank" rel="noreferrer noopener"
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-3.5 h-3.5 rounded-full bg-white/95 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#E30A17]" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase">
            T.C. Türkiye Cumhuriyeti — Resmi Devlet Portalı
          </span>
        </a>
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold tracking-wide relative">
          <a href="https://www.turkiye.gov.tr" target="_blank" rel="noreferrer noopener" className="hover:underline opacity-90">turkiye.gov.tr</a>
          <span className="opacity-40">·</span>
          <a href="https://www.msb.gov.tr" target="_blank" rel="noreferrer noopener" className="hover:underline opacity-90">msb.gov.tr</a>
          <span className="opacity-40">·</span>
          <button
            onClick={() => setOpenLinks(!openLinks)}
            onBlur={() => setTimeout(() => setOpenLinks(false), 200)}
            className="hover:underline opacity-90 inline-flex items-center gap-1 uppercase"
          >
            Kurumsal Bağlantılar
            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${openLinks ? "rotate-180" : ""}`} strokeWidth={2.5} />
          </button>

          {openLinks && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.25)] border border-slate-200 py-1.5 overflow-hidden">
              <div className="px-3 py-2 text-[9.5px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                Kurumsal Bağlantılar
              </div>
              {kurumsal.map(k => (
                <a key={k.href} href={k.href} target="_blank" rel="noreferrer noopener"
                  className="flex items-center justify-between px-3 py-2 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0B2545] transition-colors">
                  <span className="normal-case tracking-normal">{k.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Screen = "listings" | "detail" | "announcements" | "duyuru-detay" | "login" | "register" | "forgot" | "dashboard" | "edevlet"
  | "admin" | "aday-ocr" | "aday-sonuc";

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const LISTINGS = [
  {
    id: "1", status: "open" as const,
    title: "2026 Yılı Muvazzaf Subay Temini",
    sinif: "Subay", quota: 450, filled: 312,
    start: "01 Haz 2026", end: "15 Eyl 2026",
    city: "Türkiye Geneli", education: "Lisans",
    gender: "Erkek / Kadın",
    tag: "Kara Kuvvetleri",
  },
  {
    id: "2", status: "closing" as const,
    title: "Sözleşmeli Er Alımı — 3. Dönem",
    sinif: "Uzman Erbaş", quota: 1200, filled: 1148,
    start: "15 May 2026", end: "20 Ağu 2026",
    city: "Türkiye Geneli", education: "Lise",
    gender: "Erkek",
    tag: "Kara Kuvvetleri",
  },
  {
    id: "3", status: "open" as const,
    title: "Astsubay Meslek Yüksekokulu Temini",
    sinif: "Astsubay", quota: 680, filled: 291,
    start: "10 Haz 2026", end: "30 Eyl 2026",
    city: "Türkiye Geneli", education: "Lise / Ön Lisans",
    gender: "Erkek / Kadın",
    tag: "Hava Kuvvetleri",
  },
  {
    id: "4", status: "open" as const,
    title: "Sivil Memur Alımı — BT & Mühendislik",
    sinif: "Sivil Memur", quota: 95, filled: 28,
    start: "20 Haz 2026", end: "20 Eyl 2026",
    city: "Ankara, İstanbul", education: "Lisans",
    gender: "Erkek / Kadın",
    tag: "MSB Merkez",
  },
  {
    id: "5", status: "upcoming" as const,
    title: "Uzman Erbaş Alımı — 2. Dönem 2026",
    sinif: "Uzman Erbaş", quota: 750, filled: 0,
    start: "01 Eki 2026", end: "30 Kas 2026",
    city: "Türkiye Geneli", education: "Lise",
    gender: "Erkek",
    tag: "Deniz Kuvvetleri",
  },
  {
    id: "6", status: "open" as const,
    title: "Harp Okulu Öğrenci Alımı 2026",
    sinif: "Subay", quota: 675, filled: 512,
    start: "01 Haz 2026", end: "31 Ağu 2026",
    city: "Türkiye Geneli", education: "Lise",
    gender: "Erkek / Kadın",
    tag: "Kara Kuvvetleri",
  },
];

const ANNOUNCEMENTS = [
  {
    id: "a1", date: "28 Tem 2026", cat: "placement" as const, important: true,
    title: "2026/2 Sözleşmeli Er Yerleştirme Sonuçları Açıklandı",
    summary: "2026 yılı 2. dönem sözleşmeli er alımı yerleştirme sonuçları açıklanmıştır. Sonuçlarınızı TC kimlik numaranız ile sorgulayabilirsiniz.",
  },
  {
    id: "a2", date: "22 Tem 2026", cat: "exam" as const, important: false,
    title: "Muvazzaf Subay Temini Mülakat Tarihleri Güncellendi",
    summary: "2026 yılı muvazzaf subay teminine başvuran adayların mülakat tarihleri ve sınav yerleri sistemde güncellenmiştir.",
  },
  {
    id: "a3", date: "18 Tem 2026", cat: "document" as const, important: false,
    title: "OCR ile Belge Yükleme Kılavuzu Güncellendi",
    summary: "Belge yükleme sürecinde yaşanan teknik sorunlara yönelik güncellenen kılavuz yayımlanmıştır. Adayların yeni kılavuzu indirmesi önerilmektedir.",
  },
  {
    id: "a4", date: "12 Tem 2026", cat: "exam" as const, important: false,
    title: "Astsubay Meslek YO Giriş Sınavı Sonuçları Yayımlandı",
    summary: "2026 yılı Astsubay Meslek Yüksekokulu giriş sınavına katılan adayların sonuçları açıklanmıştır.",
  },
  {
    id: "a5", date: "05 Tem 2026", cat: "general" as const, important: false,
    title: "Personel Temin Sistemi v2.4 Güncellemesi",
    summary: "Sistemde yapılan teknik güncelleme ile mobil uyumluluk iyileştirilmiş, bağlantı hızı artırılmış ve güvenlik sertifikaları yenilenmiştir.",
  },
  {
    id: "a6", date: "28 Haz 2026", cat: "placement" as const, important: false,
    title: "Sivil Memur Alımı Ön Değerlendirme Sonuçları",
    summary: "BT ve Mühendislik kadroları için yapılan sivil memur alımı ön değerlendirme sonuçları sisteme yüklenmiştir.",
  },
  {
    id: "a7", date: "15 Haz 2026", cat: "general" as const, important: false,
    title: "Sağlık Muayene Randevu Sistemi Devreye Alındı",
    summary: "Temin sürecinde sağlık muayenesi için randevu alımı artık sistem üzerinden yapılabilmektedir.",
  },
];

const STATUS = {
  open:    { label: "Başvurular Açık", dot: "bg-emerald-400", bg: "bg-emerald-50",    text: "text-emerald-700",  border: "border-emerald-200" },
  closing: { label: "Son 3 Gün",       dot: "bg-amber-400",   bg: "bg-amber-50",      text: "text-amber-700",   border: "border-amber-200"   },
  upcoming:{ label: "Yakında",          dot: "bg-sky-400",     bg: "bg-sky-50",        text: "text-sky-700",     border: "border-sky-200"     },
};

const CAT = {
  exam:      { label: "Sınav Sonuçları", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  placement: { label: "Yerleştirme",    bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200"},
  general:   { label: "Genel",          bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-200" },
  document:  { label: "Belge Talebi",   bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-200"},
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {status !== "upcoming" && <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status !== "upcoming" ? "animate-pulse" : ""}`} />}
      {s.label}
    </span>
  );
}

function CatPill({ cat }: { cat: keyof typeof CAT }) {
  const c = CAT[cat];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      {c.label}
    </span>
  );
}

// Subtle geometric background pattern for hero sections
function HeroPattern({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full" style={{ opacity }} aria-hidden>
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.75" />
        </pattern>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

function Header({ activeScreen, onNav }: { activeScreen: Screen; onNav: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);

  const NAV: { label: string; screen: Screen }[] = [
    { label: "ANA SAYFA",        screen: "listings" },
    { label: "PERSONEL TEMİNİ",  screen: "listings" },
    { label: "ÖĞRENCİ TEMİNİ",   screen: "listings" },
    { label: "DUYURULAR",         screen: "announcements" },
    { label: "KURUMSAL",          screen: "listings" },
    { label: "İLETİŞİM",          screen: "listings" },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-[0_2px_6px_rgba(0,0,0,0.08)]" style={{ fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif" }}>
      {/* Top thin T.C. bar */}
      <div className="bg-[#E30A17] text-white text-[10.5px] font-semibold tracking-widest uppercase">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-6 flex items-center justify-between">
          <span>T.C. Türkiye Cumhuriyeti · Millî Savunma Bakanlığı</span>
          <div className="hidden sm:flex items-center gap-3 text-white/90">
            <a href="https://www.turkiye.gov.tr" target="_blank" rel="noreferrer noopener" className="hover:underline">turkiye.gov.tr</a>
            <span>·</span>
            <a href="https://www.msb.gov.tr" target="_blank" rel="noreferrer noopener" className="hover:underline">msb.gov.tr</a>
          </div>
        </div>
      </div>

      {/* Main white bar with emblem */}
      <div className="bg-white border-b border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-[74px] flex items-center gap-4">
          <button onClick={() => onNav("listings")} className="flex items-center gap-2.5 flex-shrink-0">
            <MSBEmblem size={48} />
            <div className="leading-tight text-left">
              <div className="text-[10px] font-bold tracking-[0.06em]" style={{ color: MSB.red }}>PERSONEL GENEL MÜDÜRLÜĞÜ</div>
              <div className="text-[17px] font-extrabold tracking-tight" style={{ color: MSB.red }}>PERSONEL TEMİN <span className="font-black">DAİRE BAŞKANLIĞI</span></div>
            </div>
          </button>

          {/* Social icons + login on right */}
          <div className="ml-auto flex items-center gap-1">
            <div className="hidden lg:flex items-center gap-1 mr-4">
              {[
                { Icon: () => <span className="text-[13px] font-bold">f</span>, href: "https://facebook.com/tcmsb" },
                { Icon: () => <span className="text-[11px] font-bold">𝕏</span>, href: "https://twitter.com/tcsavunma" },
                { Icon: () => <span className="text-[13px] italic font-bold">◱</span>, href: "https://instagram.com" },
                { Icon: () => <span className="text-[12px] font-bold">▶</span>, href: "https://youtube.com" },
                { Icon: Mail, href: "mailto:info@msb.gov.tr" },
              ].map((s, i) => {
                const Ic: any = s.Icon;
                return (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer noopener"
                    className="w-8 h-8 flex items-center justify-center text-[#666] border border-[#DDD] rounded-full hover:bg-[#A82232] hover:text-white hover:border-[#A82232] transition-colors">
                    {typeof Ic === "function" && !Ic.name?.startsWith("Mail") ? <Ic /> : <Mail className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  </a>
                );
              })}
            </div>
            <button onClick={() => { toast("e-Devlet doğrulaması başarılı", { kind: "success", sub: "Aday paneline yönlendiriliyorsunuz" }); setTimeout(() => onNav("dashboard"), 500); }}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px] shadow-sm transition-colors uppercase tracking-wide">
              <div className="w-5 h-5 rounded bg-[#E30A17] flex items-center justify-center text-white text-[10px] font-black italic">e</div>
              e-Devlet ile Giriş
            </button>
            <button className="md:hidden p-2 hover:bg-[#F5F5F5] rounded transition-colors" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5 text-[#555]" /> : <Menu className="w-5 h-5 text-[#555]" />}
            </button>
          </div>
        </div>

        {/* Red navigation strip */}
        <div style={{ background: MSB.red }} className="border-t border-[#8B1A25]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <nav className="hidden md:flex items-center">
              {NAV.map(n => (
                <button key={n.label} onClick={() => onNav(n.screen)}
                  className={`px-4 lg:px-5 py-3 text-[12.5px] font-bold text-white/90 hover:bg-black/15 transition-colors tracking-wide border-r border-white/10 ${
                    activeScreen === n.screen && (n.label === "ANA SAYFA" || n.label === "PERSONEL TEMİNİ") ? "bg-black/20 text-white" : ""
                  } ${activeScreen === "announcements" && n.label === "DUYURULAR" ? "bg-black/20 text-white" : ""}`}>
                  {n.label}
                </button>
              ))}
              <div className="ml-auto px-3 py-2 text-[11px] text-white/80 flex items-center gap-3">
                <span className="tracking-wider">TR | EN</span>
                <span className="opacity-60">|</span>
                <span className="tracking-wider">Erişilebilirlik</span>
              </div>
            </nav>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-[#DDD] py-2 bg-[#F5F5F5]">
            {NAV.map(n => (
              <button key={n.label} onClick={() => { onNav(n.screen); setOpen(false); }}
                className="block w-full text-left px-5 py-3 text-[13px] font-semibold text-[#333] hover:bg-white border-b border-[#EEE] last:border-0">
                {n.label}
              </button>
            ))}
            <button onClick={() => { setOpen(false); toast("e-Devlet doğrulaması başarılı", { kind: "success", sub: "Aday paneline yönlendiriliyorsunuz" }); setTimeout(() => onNav("dashboard"), 500); }}
              className="mx-4 mt-2 mb-1 inline-flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-white bg-[#4A4A4A] rounded-[3px] uppercase">
              <div className="w-5 h-5 rounded bg-[#E30A17] flex items-center justify-center text-white text-[10px] font-black italic">e</div>
              e-Devlet ile Giriş
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t-[3px]" style={{ borderColor: MSB.red, fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif" }}>
      {/* Institutional links strip */}
      <div className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { title: "Kurumsal", links: [
              { l: "Personel Temin Daire Bşk.", h: "https://personeltemin.msb.gov.tr" },
              { l: "T.C. Millî Savunma Bakanlığı", h: "https://www.msb.gov.tr" },
              { l: "Türk Silahlı Kuvvetleri", h: "https://www.tsk.tr" },
              { l: "Genelkurmay Başkanlığı", h: "https://www.tsk.tr" },
              { l: "Personel Yönetim Bilgi S.", h: "https://www.msb.gov.tr" },
            ]},
            { title: "Kuvvet Komutanlıkları", links: [
              { l: "Kara Kuvvetleri Komutanlığı", h: "https://www.kkk.tsk.tr" },
              { l: "Deniz Kuvvetleri Komutanlığı", h: "https://www.dzkk.tsk.tr" },
              { l: "Hava Kuvvetleri Komutanlığı", h: "https://www.hvkk.tsk.tr" },
              { l: "Jandarma Genel Komutanlığı", h: "https://www.jandarma.gov.tr" },
              { l: "Sahil Güvenlik Komutanlığı", h: "https://www.sg.gov.tr" },
            ]},
            { title: "Eğitim Kurumları", links: [
              { l: "Millî Savunma Üniversitesi", h: "https://www.msu.edu.tr" },
              { l: "Kara Harp Okulu", h: "https://www.kho.edu.tr" },
              { l: "Deniz Harp Okulu", h: "https://www.dho.edu.tr" },
              { l: "Hava Harp Okulu", h: "https://www.hho.edu.tr" },
              { l: "Astsubay Meslek Yüksekokulları", h: "#" },
            ]},
            { title: "Yardım & İletişim", links: [
              { l: "Sıkça Sorulan Sorular", h: "#" },
              { l: "Başvuru Kılavuzu", h: "#" },
              { l: "Teknik Destek", h: "#" },
              { l: "KVKK Aydınlatma Metni", h: "#" },
              { l: "Erişilebilirlik", h: "#" },
              { l: "Bize Ulaşın", h: "#" },
            ]},
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest mb-3 pb-2 border-b border-[#DDD]" style={{ color: MSB.red }}>{col.title}</h4>
              <ul className="space-y-1.5">
                {col.links.map(link => (
                  <li key={link.l}>
                    <a href={link.h} target={link.h.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener"
                      className="text-[12.5px] text-[#444] hover:text-[#A82232] hover:underline transition-colors leading-snug">
                      {link.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Contact + branding row */}
      <div className="bg-white border-b border-[#E0E0E0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="flex items-center gap-3">
            <MSBEmblem size={54} />
            <div className="leading-tight">
              <div className="text-[10px] font-bold tracking-[0.06em]" style={{ color: MSB.red }}>PERSONEL GENEL MÜDÜRLÜĞÜ</div>
              <div className="text-[15px] font-extrabold tracking-tight" style={{ color: MSB.red }}>PERSONEL TEMİN DAİRE BAŞKANLIĞI</div>
              <div className="text-[11.5px] text-[#666] mt-1">T.C. Millî Savunma Bakanlığı — Resmi Personel Temin Portalı</div>
            </div>
          </div>

          <div className="text-[12px] text-[#444] leading-relaxed">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[#A82232]" strokeWidth={2} />
              <span>Cebeci Mah. P.K. 06620 Ankara / TÜRKİYE</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#A82232]" strokeWidth={2} />
                <a href="tel:+903125620543" className="hover:underline">0 (312) 562 05 43</a>
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#A82232]" strokeWidth={2} />
                <a href="mailto:persotem@msb.gov.tr" className="hover:underline">persotem@msb.gov.tr</a>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[
              { c: "f", href: "https://facebook.com/tcmsb" },
              { c: "𝕏", href: "https://twitter.com/tcsavunma" },
              { c: "◱", href: "https://instagram.com" },
              { c: "▶", href: "https://youtube.com" },
            ].map(s => (
              <a key={s.c} href={s.href} target="_blank" rel="noreferrer noopener"
                className="w-9 h-9 flex items-center justify-center text-white bg-[#4A4A4A] hover:bg-[#A82232] rounded transition-colors font-bold">
                {s.c}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="bg-[#2C2C2C] text-white/70 text-[11.5px] text-center py-3">
        MSB © 2026 · Tüm hakları saklıdır &nbsp;|&nbsp; T.C. Millî Savunma Bakanlığı &nbsp;|&nbsp; Sürüm: 1.0.26212.1
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — LISTINGS
// ─────────────────────────────────────────────────────────────────────────────

type LiveItem = { title: string; date?: string; href?: string; category?: string };
type LivePayload = { source: "live" | "fallback"; fetchedAt: string; teminler: LiveItem[]; duyurular: LiveItem[] };

function Screen1({ onDetail, onNav, onDuyuru }: { onDetail: () => void; onNav: (s: Screen) => void; onDuyuru?: (id: string) => void }) {
  const [filter, setFilter] = useState("Tümü");
  const [openDuyuru, setOpenDuyuru] = useState<null | { title: string; date?: string; cat?: string }>(null);
  const [live, setLive] = useState<LivePayload | null>(null);
  const [liveErr, setLiveErr] = useState<string | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLiveLoading(true);
    fetch("/api/msb")
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(data => { if (!cancelled) { setLive(data); setLiveLoading(false); } })
      .catch(err => { if (!cancelled) { setLiveErr(err.message || "hata"); setLiveLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const featuredStatic = [
    {
      cat: "PERSONEL TEMİNİ",
      title: "KARA, DENİZ VE HAVA KUVVETLERİ KOMUTANLIKLARINA 2026 YILI TEKNİK SINIF UZMAN ERBAŞ TEMİNİ (2026/4 DÖNEM)",
      date: "24.07.2026",
      summary: "MSB Kara, Deniz ve Hava Kuvvetleri Komutanlıklarına 2026 yılı 4. dönem teknik sınıf uzman erbaş temini için başvurular alınmaya başlanmıştır.",
      quota: 1200,
      lastDay: "15.09.2026",
      status: "AÇIK",
    },
    {
      cat: "PERSONEL TEMİNİ",
      title: "MSB KARA, DENİZ VE HAVA KUVVETLERİ KOMUTANLIKLARI 2026 YILI (2026/3 DÖNEM) UZMAN ERBAŞ TEMİN FAALİYETİ",
      date: "24.07.2026",
      summary: "2026 yılı 3. dönem uzman erbaş temin faaliyeti kapsamında başvuru duyurusu yayımlanmıştır. Başvuru şartları ve takvim için detayları inceleyiniz.",
      quota: 950,
      lastDay: "10.09.2026",
      status: "AÇIK",
    },
    {
      cat: "PERSONEL TEMİNİ",
      title: "MSB KARA, DENİZ VE HAVA KUVVETLERİ KOMUTANLIKLARI 2026 YILI (2026/2 DÖNEM) SÖZLEŞMELİ ER TEMİN FAALİYETİ",
      date: "24.07.2026",
      summary: "2026 yılı 2. dönem sözleşmeli er temini için başvurular alınmaktadır. Adayların başvuru şartlarını dikkatlice incelemesi rica olunur.",
      quota: 1500,
      lastDay: "05.09.2026",
      status: "AÇIK",
    },
  ];

  const duyurularStatic = [
    { day: "31", ay: "Temmuz",  yil: "2026", gun: "Cuma",       title: "KARA KUVVETLERİ KOMUTANLIĞI SÖZLEŞMELİ ER ADAYI KESİN KAYIT / EĞİTİM DUYURUSU (85'İNCİ DÖNEM)", cat: "Yerleştirme" },
    { day: "21", ay: "Temmuz",  yil: "2026", gun: "Salı",       title: "KARA KUVVETLERİ KOMUTANLIĞI UZMAN ERBAŞ ADAYI KESİN KAYIT / EĞİTİM DUYURUSU", cat: "Yerleştirme" },
    { day: "13", ay: "Temmuz",  yil: "2026", gun: "Pazartesi",  title: "2026 MİLLİ SAVUNMA ÜNİVERSİTESİ ASKERİ ÖĞRENCİ ADAYLARININ KONAKLAMA İÇİN KREDİ VE YURTLAR KURUMUNDAN FAYDALANMASI İLE İLGİLİ DUYURU", cat: "Duyuru" },
    { day: "29", ay: "Haziran", yil: "2026", gun: "Pazartesi",  title: "GÖREVDE YÜKSELME VE UNVAN DEĞİŞİKLİĞİ SÖZLÜ SINAV ÇAĞRI DURUMU", cat: "Sınav" },
  ];

  const stats = [
    { val: "12",     label: "Aktif Temin İlanı" },
    { val: "4.850",  label: "Toplam Kontenjan" },
    { val: "38.200", label: "Aktif Aday" },
    { val: "160+",   label: "Kurumsal Şube" },
  ];

  const filters = ["Tümü", "Personel Temini", "Öğrenci Temini", "Yedek Personel"];

  // ─── Merge live payload into card / timeline shapes ───────────────────────────
  const AY_TR = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const GUN_TR = ["Paz","Pts","Sal","Çar","Per","Cum","Cts"];

  const featured = (live?.teminler && live.teminler.length >= 3)
    ? live.teminler.slice(0, 3).map((t, i): typeof featuredStatic[number] => ({
        cat: i === 1 ? "ÖĞRENCİ TEMİNİ" : "PERSONEL TEMİNİ",
        title: t.title,
        date: t.date || "—",
        summary: "Detaylı bilgi için ilgili duyuruyu inceleyiniz. Başvurular Personel Temin Daire Başkanlığı web sistemi üzerinden alınmaktadır.",
        quota: 500 + i * 150,
        lastDay: t.date || "—",
        status: "AÇIK",
      }))
    : featuredStatic;

  const duyurular = (live?.duyurular && live.duyurular.length >= 3)
    ? live.duyurular.slice(0, 8).map(d => {
        const m = (d.date || "").match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (m) {
          const day = m[1], monthIdx = parseInt(m[2], 10) - 1, year = m[3];
          const dt = new Date(parseInt(year, 10), monthIdx, parseInt(day, 10));
          return { day, ay: AY_TR[monthIdx] || "", yil: year, gun: GUN_TR[dt.getDay()] || "", title: d.title, cat: d.category || "Duyuru" };
        }
        return { day: "—", ay: "", yil: "", gun: "", title: d.title, cat: d.category || "Duyuru" };
      })
    : duyurularStatic;

  const liveLabel = live?.source === "live"
    ? "CANLI"
    : liveLoading ? "YÜKLENİYOR" : "DEMO VERİ";
  const liveColor = live?.source === "live" ? "#7BA05B" : liveLoading ? "#4A6FA5" : "#C87E27";

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif", color: "#333" }}>
      {/* ═════════════ HERO — Atatürk portrait + kurumsal mesaj ═════════════ */}
      <section className="border-b border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-10">
          {/* Atatürk plaque */}
          <div className="mx-auto lg:mx-0">
            <div className="relative w-[260px] bg-[#F5F5F5] border border-[#DDDDDD] p-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="relative aspect-[3/4] bg-gradient-to-b from-[#2C2C2C] via-[#3D3D3D] to-[#1F1F1F] overflow-hidden">
                {/* Stylized portrait silhouette */}
                <svg viewBox="0 0 200 260" className="w-full h-full" aria-hidden>
                  <defs>
                    <radialGradient id="ata-vig" cx="50%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#D4C4A0" stopOpacity="0.9" />
                      <stop offset="60%" stopColor="#8B7A5A" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#1F1F1F" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="200" height="260" fill="url(#ata-vig)" />
                  {/* Shoulders */}
                  <path d="M20 260 Q100 155 180 260 Z" fill="#1F1F1F" opacity="0.85" />
                  {/* Head */}
                  <ellipse cx="100" cy="120" rx="52" ry="65" fill="#4A3F2C" opacity="0.65" />
                  <ellipse cx="100" cy="115" rx="45" ry="58" fill="#3B3323" opacity="0.75" />
                  {/* Hair suggestion */}
                  <path d="M55 90 Q100 55 145 90 Q145 70 100 60 Q55 70 55 90 Z" fill="#1A1610" opacity="0.85" />
                  {/* Collar V */}
                  <path d="M60 260 L100 210 L140 260 Z" fill="#2A2418" />
                </svg>
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[9px] text-white/50 tracking-[0.2em] font-bold">
                  <span>1881</span>
                  <span>—</span>
                  <span>1938</span>
                </div>
              </div>
              <div className="bg-white border-t border-[#DDDDDD] px-3 py-3 text-center">
                <div className="text-[10px] tracking-[0.2em] text-[#A82232] font-bold mb-1">GAZİ MUSTAFA KEMAL</div>
                <div className="text-[16px] font-black text-[#333] tracking-tight leading-none">ATATÜRK</div>
                <div className="text-[9.5px] tracking-widest text-[#888] mt-1.5 uppercase">Türkiye Cumhuriyeti Kurucusu</div>
              </div>
            </div>
          </div>

          {/* Editorial text side */}
          <div className="flex flex-col justify-center">
            <div className="text-[10.5px] font-bold tracking-[0.24em] uppercase mb-3" style={{ color: MSB.red }}>
              Türk Silahlı Kuvvetleri · Personel Temin Portalı
            </div>
            <h1 className="text-[30px] sm:text-[38px] font-extrabold text-[#222] leading-[1.1] tracking-tight mb-5">
              Yurtta sulh, cihanda sulh.
            </h1>
            <p className="text-[15px] text-[#555] leading-relaxed max-w-[640px] mb-6">
              Türk Silahlı Kuvvetleri'nin insan kaynağı temini süreçleri, adayların hak ve menfaatlerini gözeten şeffaf,
              güvenilir ve dijital bir platform üzerinden yürütülmektedir. Muvazzaf subay, astsubay, uzman erbaş, sözleşmeli er,
              sivil memur ve öğrenci temin ilanlarına Personel Temin Daire Başkanlığı web sistemi üzerinden başvurabilirsiniz.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setFilter("Personel Temini"); scrollToId("guncel-teminler"); toast("Personel Temini filtresi uygulandı", { kind: "info" }); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white bg-[#A82232] hover:bg-[#8B1A25] rounded-[3px] tracking-wide uppercase transition-colors shadow-sm">
                <Briefcase className="w-4 h-4" strokeWidth={2} />
                Personel Temini
              </button>
              <button onClick={() => { setFilter("Öğrenci Temini"); scrollToId("guncel-teminler"); toast("Öğrenci Temini filtresi uygulandı", { kind: "info" }); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-[#A82232] bg-white border-2 border-[#A82232] hover:bg-[#FBEEF0] rounded-[3px] tracking-wide uppercase transition-colors">
                <GraduationCap className="w-4 h-4" strokeWidth={2} />
                Öğrenci Temini
              </button>
              <button onClick={() => { toast("e-Devlet doğrulaması başarılı", { kind: "success", sub: "Aday paneline yönlendiriliyorsunuz" }); setTimeout(() => onNav("dashboard"), 500); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px] tracking-wide uppercase transition-colors">
                <div className="w-4.5 h-4.5 rounded bg-[#E30A17] flex items-center justify-center text-white text-[9px] font-black italic">e</div>
                e-Devlet ile Giriş
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#EEE]">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="text-[24px] font-extrabold tabular-nums leading-none" style={{ color: MSB.red }}>{s.val}</div>
                  <div className="text-[11px] text-[#666] mt-1.5 tracking-wide uppercase">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════ Referans 3 — 2 Panel Karşılama (Aksiyon vitrini) ═════════════ */}
      <section className="bg-gradient-to-b from-[#F5F5F5] to-white border-b border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* SOL — Kırmızı/kiremit "GÜNCEL TEMİNLER" (yeni aday için) */}
            <div className="border-[3px] rounded-md overflow-hidden shadow-[0_4px_16px_rgba(168,34,50,0.15)]" style={{ borderColor: MSB.red }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: MSB.red }}>
                <h2 className="text-[15px] font-extrabold uppercase tracking-wider text-white">GÜNCEL TEMİNLER</h2>
                <span className="text-[10.5px] font-bold text-white/85 uppercase tracking-widest">Başvuru Vitrini</span>
              </div>
              <div className="bg-[#FBECEE] divide-y divide-[#E8B5BB]">
                {featured.slice(0, 4).map((f, i) => (
                  <button key={i} onClick={() => onNav("login")}
                    className="w-full text-left px-5 py-3.5 hover:bg-[#F5D6DA] transition-colors group">
                    <div className="text-[13px] font-bold text-[#333] leading-snug mb-1 line-clamp-2 group-hover:text-[#A82232]">{f.title}</div>
                    <div className="flex items-center gap-3 text-[11px] text-[#666]">
                      <span className="font-semibold">{f.cat}</span>
                      <span>·</span>
                      <span>{f.date}</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#A82232]">
                        Başvur <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
                      </span>
                    </div>
                  </button>
                ))}
                {featured.length === 0 && (
                  <div className="px-5 py-6 text-center text-[12.5px] text-[#888] italic">Aktif temin ilanı bulunmuyor.</div>
                )}
              </div>
            </div>

            {/* SAĞ — Gri "GÜNCEL DUYURULAR" (mevcut aday için) */}
            <div className="border-[3px] border-[#4A4A4A] rounded-md overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <div className="px-5 py-3 flex items-center justify-between bg-[#4A4A4A]">
                <h2 className="text-[15px] font-extrabold uppercase tracking-wider text-white">GÜNCEL DUYURULAR</h2>
                <span className="text-[10.5px] font-bold text-white/85 uppercase tracking-widest">Sonuç & Bilgi</span>
              </div>
              <div className="bg-white divide-y divide-[#EEE]">
                {duyurular.slice(0, 4).map((d, i) => (
                  <button key={i} onClick={() => onNav("announcements")}
                    className="w-full text-left px-5 py-3 hover:bg-[#FAFAFA] transition-colors flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center min-w-[46px] py-1 bg-[#F5F5F5] border border-[#DDD] rounded flex-shrink-0">
                      <div className="text-[9.5px] font-bold uppercase text-[#888] tracking-wider">{d.ay}</div>
                      <div className="text-[16px] font-black text-[#333] leading-none tabular-nums">{d.day}</div>
                      <div className="text-[9px] font-semibold text-[#888] italic">{d.gun}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-bold text-[#333] leading-snug line-clamp-2 mb-1">{d.title}</div>
                      <div className="text-[10.5px] text-[#888] uppercase tracking-wider font-semibold">{d.cat}</div>
                    </div>
                  </button>
                ))}
                {duyurular.length === 0 && (
                  <div className="px-5 py-6 text-center text-[12.5px] text-[#888] italic">Duyuru bulunmuyor.</div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#888] flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: MSB.red }} />
              <span>Yeni aday: Sol panelden ilana başvurun</span>
            </span>
            <span className="text-[#CCC]">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4A4A4A]" />
              <span>Mevcut aday: Sağ panelden duyuru/sonuç takip edin</span>
            </span>
          </div>
        </div>
      </section>

      {/* ═════════════ Section Title Bar: Güncel Teminler ═════════════ */}
      <section id="guncel-teminler" className="bg-[#F5F5F5] border-b border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-baseline justify-between flex-wrap gap-4 mb-6 pb-4 border-b-[2px]" style={{ borderColor: MSB.red }}>
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: MSB.red }}>GÜNCEL TEMİNLER</h2>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest px-2 py-1 rounded-[3px] text-white"
                style={{ background: liveColor }}
                title={live?.fetchedAt ? `Kaynak: personeltemin.msb.gov.tr · ${new Date(live.fetchedAt).toLocaleString("tr-TR")}` : (liveErr || "")}>
                {liveLoading ? <RotateCcw className="w-2.5 h-2.5 animate-spin" /> : <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />}
                {liveLabel}
              </span>
              <a href="https://personeltemin.msb.gov.tr" target="_blank" rel="noreferrer noopener" className="text-[11px] text-[#888] hover:text-[#A82232] hover:underline">
                kaynak: personeltemin.msb.gov.tr ↗
              </a>
            </div>
            <div className="flex gap-1 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => { setFilter(f); if (f !== "Tümü") toast(`Filtre: ${f}`, { kind: "info" }); }}
                  className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wide rounded-[3px] border transition-colors ${
                    filter === f ? "bg-[#A82232] text-white border-[#A82232]" : "bg-white text-[#555] border-[#DDD] hover:border-[#A82232] hover:text-[#A82232]"
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          {(() => {
            const filtered = filter === "Tümü" ? featured
              : featured.filter(f =>
                  (filter === "Personel Temini" && f.cat === "PERSONEL TEMİNİ") ||
                  (filter === "Öğrenci Temini"  && f.cat === "ÖĞRENCİ TEMİNİ") ||
                  (filter === "Yedek Personel"  && /YEDEK/i.test(f.title))
                );
            if (filtered.length === 0) return (
              <div className="bg-white border border-dashed border-[#DDD] p-10 text-center">
                <p className="text-[13px] text-[#888] mb-2">Seçtiğiniz kritere uygun ilan bulunamadı.</p>
                <button onClick={() => setFilter("Tümü")} className="text-[13px] font-bold text-[#A82232] hover:underline">Tüm ilanları göster</button>
              </div>
            );
            return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filtered.map((f, i) => (
              <article key={i} onClick={onDetail} className="cursor-pointer bg-white border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow group flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DDDDDD] bg-[#FAFAFA]">
                  <span className="text-[10.5px] font-bold tracking-[0.12em] uppercase" style={{ color: MSB.red }}>{f.cat}</span>
                  <span className="text-[11px] font-bold text-white bg-[#7BA05B] px-2 py-0.5 rounded-[2px] tracking-wide">{f.status}</span>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-[14px] font-bold text-[#222] leading-snug mb-3 group-hover:text-[#A82232] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-[12.5px] text-[#666] leading-relaxed mb-4 flex-1">{f.summary}</p>
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EEE] mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Kontenjan</div>
                      <div className="text-[15px] font-extrabold text-[#333] tabular-nums">{f.quota.toLocaleString("tr")}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Son Başvuru</div>
                      <div className="text-[15px] font-extrabold tabular-nums" style={{ color: MSB.red }}>{f.lastDay}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11.5px] text-[#888]">
                    <span>Yayın: {f.date}</span>
                    <button onClick={onDetail} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#A82232] hover:text-[#8B1A25] hover:underline">
                      Detay & Başvuru <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
            );
          })()}

          <div className="mt-6 text-right">
            <button onClick={() => { onDetail(); toast("Tüm temin ilanları görüntüleniyor", { kind: "info" }); }} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#A82232] hover:underline uppercase tracking-wide">
              Tüm Temin İlanlarını Gör <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═════════════ Güncel Duyurular — timeline ═════════════ */}
      <section>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
          <div>
            <div className="flex items-baseline justify-between mb-6 pb-4 border-b-[2px]" style={{ borderColor: MSB.red }}>
              <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: MSB.red }}>GÜNCEL DUYURULAR</h2>
              <button onClick={() => onNav("announcements")} className="text-[11.5px] font-bold text-[#A82232] hover:underline uppercase tracking-wide">Tümü →</button>
            </div>

            <ul className="border-t border-[#EEE]">
              {duyurular.map((d, i) => (
                <li key={i} onClick={() => setOpenDuyuru({ title: d.title, date: `${d.day} ${d.ay} ${d.yil} ${d.gun}`.trim(), cat: d.cat })}
                  className="flex gap-4 py-4 border-b border-[#EEE] hover:bg-[#FAFAFA] transition-colors px-2 group cursor-pointer">
                  {/* Date badge */}
                  <div className="flex-shrink-0 w-[72px] text-center border-r border-[#EEE] pr-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: MSB.red }}>{d.ay}</div>
                    <div className="text-[26px] font-extrabold tabular-nums leading-none text-[#333] my-0.5">{d.day}</div>
                    <div className="text-[10px] text-[#888] tabular-nums">{d.yil}</div>
                    <div className="text-[10px] italic text-[#B87333] mt-0.5">{d.gun}</div>
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-[2px] mb-1.5 tracking-wider uppercase"
                      style={{ background: d.cat === "Sınav" ? "#4A6FA5" : d.cat === "Yerleştirme" ? "#7BA05B" : "#8B6B47" }}>
                      {d.cat}
                    </span>
                    <h3 className="text-[14.5px] font-semibold text-[#222] leading-snug group-hover:text-[#A82232] transition-colors">
                      {d.title}
                    </h3>
                    <div className="mt-2 text-[11.5px] text-[#888] flex items-center gap-1.5">
                      <span>Devamını oku</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar: hızlı erişim */}
          <aside className="space-y-6">
            <div className="border border-[#DDDDDD] bg-white">
              <h3 className="px-4 py-2.5 text-[12px] font-extrabold text-white uppercase tracking-wider" style={{ background: MSB.red }}>Hızlı Erişim</h3>
              <ul className="divide-y divide-[#EEE]">
                {[
                  { label: "Sınav Sonuçları",         Ic: Award,          action: () => { onNav("login"); toast("Sınav sonuçlarına erişim için giriş yapmalısınız", { kind: "info" }); } },
                  { label: "Başvuru Sorgula",          Ic: Search,         action: () => { onNav("login"); toast("Başvuru sorgulama için giriş gerekli", { kind: "info" }); } },
                  { label: "Belgelerim",               Ic: FileText,       action: () => { onNav("login"); toast("Belgelerim için giriş yapmalısınız", { kind: "info" }); } },
                  { label: "Sağlık Muayene Randevusu", Ic: Calendar,       action: () => { toast("Sağlık muayene randevu sistemi bakımdadır", { kind: "warn", sub: "Tahmini açılış: 05.08.2026" }); } },
                  { label: "Yerleştirme Sonuçları",    Ic: ClipboardCheck, action: () => { onNav("announcements"); toast("Yerleştirme sonuçları duyurular kısmında", { kind: "info" }); } },
                  { label: "İtiraz / Şikayet",         Ic: AlertCircle,    action: () => { onNav("login"); toast("İtiraz süreci için giriş yapınız", { kind: "info" }); } },
                ].map(({ label, Ic, action }) => (
                  <li key={label}>
                    <button onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-[#333] hover:bg-[#FBEEF0] hover:text-[#A82232] transition-colors text-left">
                      <Ic className="w-3.5 h-3.5 text-[#A82232]" strokeWidth={2} />
                      <span className="flex-1">{label}</span>
                      <ChevronRight className="w-3 h-3 text-[#AAA]" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-[#DDDDDD] bg-[#FAFAFA]">
              <h3 className="px-4 py-2.5 text-[12px] font-extrabold text-white uppercase tracking-wider" style={{ background: "#4A4A4A" }}>İletişim Merkezi</h3>
              <div className="p-4 space-y-2.5 text-[12.5px]">
                <div>
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Telefon</div>
                  <a href="tel:+903125620543" className="text-[15px] font-extrabold text-[#A82232] tabular-nums">0 (312) 562 05 43</a>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Adres</div>
                  <div className="text-[12px] text-[#444]">Cebeci Mah. P.K. 06620 Ankara / TÜRKİYE</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#888] uppercase tracking-wider mb-0.5">Çağrı Merkezi</div>
                  <div className="text-[13px] font-bold text-[#333]">7/24 Alo 160</div>
                </div>
              </div>
            </div>

            <div className="border-l-[3px] px-4 py-3 bg-[#FBEEF0]" style={{ borderColor: MSB.red }}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: MSB.red }}>Bilgilendirme</div>
              <p className="text-[12px] text-[#333] leading-relaxed">
                Personel Temin süreçlerinde <strong>hiçbir aracı kişi veya kurum</strong> yetkilendirilmemiştir. Başvurularınızı yalnızca bu resmi sistem üzerinden yapınız.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* ═════════════ ÇAĞRI DURUMU ═════════════ */}
      <section id="cagri-durumu" className="border-t border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-6 pb-4 border-b-[2px]" style={{ borderColor: MSB.red }}>
            <div className="flex items-baseline gap-3">
              <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: MSB.red }}>ÇAĞRI DURUMU</h2>
              <span className="text-[12px] text-[#888]">Aktif sözlü sınav ve mülakat çağrıları</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest px-2 py-1 rounded-[3px] text-white bg-[#7BA05B]">
                <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
                4 AKTİF ÇAĞRI
              </span>
              <button onClick={() => { onNav("login"); toast("Kişisel çağrı durumunuz için giriş yapınız", { kind: "info" }); }}
                className="text-[11.5px] font-bold text-[#A82232] hover:underline uppercase tracking-wide">
                Kişisel Durum Sorgula →
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#DDDDDD] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr style={{ background: MSB.red }} className="text-left text-white">
                    <th className="px-4 py-2.5 font-semibold text-[11.5px] tracking-wide uppercase">Çağrı Konusu</th>
                    <th className="px-4 py-2.5 font-semibold text-[11.5px] tracking-wide uppercase w-[130px]">Çağrı Tarihi</th>
                    <th className="px-4 py-2.5 font-semibold text-[11.5px] tracking-wide uppercase w-[130px]">Sınav Türü</th>
                    <th className="px-4 py-2.5 font-semibold text-[11.5px] tracking-wide uppercase w-[130px]">Durum</th>
                    <th className="px-4 py-2.5 font-semibold text-[11.5px] tracking-wide uppercase w-[80px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { konu: "GÖREVDE YÜKSELME VE UNVAN DEĞİŞİKLİĞİ SÖZLÜ SINAV ÇAĞRISI", tarih: "29.06.2026", tur: "Sözlü Sınav",  durum: "Devam Ediyor",     durumTip: "aktif" },
                    { konu: "2026/3 Dönem Uzman Erbaş Aday Sözlü Mülakat Çağrısı",           tarih: "15.07.2026", tur: "Mülakat",     durum: "Çağrı Yayımlandı", durumTip: "yayin" },
                    { konu: "Muvazzaf Subay Adayı Yazılı Sınav Çağrısı",                     tarih: "10.07.2026", tur: "Yazılı Sınav", durum: "Tamamlandı",       durumTip: "kapali" },
                    { konu: "Astsubay Meslek YO Fiziki Yeterlik Çağrısı",                    tarih: "05.07.2026", tur: "Fiziki Test",  durum: "Tamamlandı",       durumTip: "kapali" },
                    { konu: "Sözleşmeli Er 2026/2 Dönem Sağlık Muayene Çağrısı",             tarih: "28.06.2026", tur: "Sağlık",       durum: "Tamamlandı",       durumTip: "kapali" },
                  ].map((r, i) => {
                    const stColor =
                      r.durumTip === "aktif" ? { bg: "#E8F3DC", txt: "#3D6E1C", dot: "#7BA05B" } :
                      r.durumTip === "yayin" ? { bg: "#DFEEF7", txt: "#1F5372", dot: "#4A6FA5" } :
                                                { bg: "#EFEFEF", txt: "#666666", dot: "#999999" };
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-white hover:bg-[#FBEEF0]" : "bg-[#FAFAFA] hover:bg-[#FBEEF0]"}>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#222] leading-snug">{r.konu}</td>
                        <td className="px-4 py-3 text-[12.5px] text-[#555] tabular-nums">{r.tarih}</td>
                        <td className="px-4 py-3 text-[12.5px] text-[#555]">{r.tur}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[11px] font-bold"
                            style={{ background: stColor.bg, color: stColor.txt }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: stColor.dot }} />
                            {r.durum}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => toast(`Çağrı detayı: ${r.konu.slice(0, 40)}...`, { kind: "info", sub: `Tarih: ${r.tarih}` })}
                            className="text-[12px] font-bold text-[#A82232] hover:underline">Görüntüle</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info banner */}
          <div className="mt-4 flex items-start gap-2.5 p-3 rounded bg-[#DFEEF7] border border-[#B6DAEA]">
            <Info className="w-4 h-4 text-[#1F5372] flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12.5px] text-[#1F5372] leading-snug">
              Çağrı listesinde adınızın olup olmadığını görmek için <button onClick={() => { onNav("login"); toast("Aday girişi gerekli", { kind: "info" }); }} className="font-bold underline hover:no-underline">Aday Girişi</button> yaparak <strong>Çağrı Takip</strong> sekmesinden sorgulama yapabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* ═════════════ Kurumsal / Kuvvet Komutanlıkları grid ═════════════ */}
      <section className="bg-[#F5F5F5] border-t border-[#DDDDDD]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6 pb-4 border-b-[2px]" style={{ borderColor: MSB.red }}>
            <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: MSB.red }}>KURUMSAL BAĞLANTILAR</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Kara Kuvvetleri", sub: "K.K.K.", href: "https://www.kkk.tsk.tr" },
              { label: "Deniz Kuvvetleri", sub: "Dz.K.K.", href: "https://www.dzkk.tsk.tr" },
              { label: "Hava Kuvvetleri", sub: "Hv.K.K.", href: "https://www.hvkk.tsk.tr" },
              { label: "Jandarma Genel K.", sub: "J.G.K.", href: "https://www.jandarma.gov.tr" },
              { label: "Sahil Güvenlik K.", sub: "S.G.K.", href: "https://www.sg.gov.tr" },
              { label: "Millî Savunma Ü.", sub: "M.S.Ü.", href: "https://www.msu.edu.tr" },
            ].map(k => (
              <a key={k.label} href={k.href} target="_blank" rel="noreferrer noopener"
                className="bg-white border border-[#DDDDDD] hover:border-[#A82232] hover:shadow-[0_2px_10px_rgba(168,34,50,0.15)] transition-all p-4 flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-full border-2 border-[#DDDDDD] group-hover:border-[#A82232] flex items-center justify-center mb-3 transition-colors">
                  <Shield className="w-6 h-6 text-[#888] group-hover:text-[#A82232]" strokeWidth={1.5} />
                </div>
                <div className="text-[9.5px] font-bold text-[#888] tracking-widest uppercase mb-0.5">{k.sub}</div>
                <div className="text-[12px] font-semibold text-[#333] group-hover:text-[#A82232] leading-tight">{k.label}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Duyuru detay modal */}
      {openDuyuru && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDuyuru(null)} />
          <div className="relative bg-white w-full max-w-lg rounded-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[#DDDDDD] overflow-hidden">
            <div className="flex items-start justify-between px-5 py-3 border-b border-[#DDDDDD] bg-[#F5F5F5]">
              <div>
                <span className="inline-block text-[10px] font-bold text-white px-2 py-0.5 rounded-[2px] mb-1 tracking-wider uppercase"
                  style={{ background: openDuyuru.cat === "Sınav" ? "#4A6FA5" : openDuyuru.cat === "Yerleştirme" ? "#7BA05B" : "#8B6B47" }}>
                  {openDuyuru.cat || "Duyuru"}
                </span>
                <div className="text-[11px] text-[#666]">{openDuyuru.date}</div>
              </div>
              <button onClick={() => setOpenDuyuru(null)} className="p-1 hover:bg-white rounded text-[#888]">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-[16px] font-bold text-[#222] leading-snug mb-4">{openDuyuru.title}</h3>
              <p className="text-[13px] text-[#555] leading-relaxed mb-4">
                Duyuruya ilişkin detaylı metin, ekli belgeler ve başvuru bilgileri Personel Temin Daire Başkanlığı web sistemi üzerinden yayımlanmıştır. Adayların ilgili duyuruyu dikkatle incelemesi rica olunur.
              </p>
              <div className="p-3 rounded bg-[#FBEEF0] border-l-[3px]" style={{ borderColor: MSB.red }}>
                <p className="text-[12px] text-[#333] leading-relaxed">
                  <strong>Uyarı:</strong> Duyuruda yer alan bilgiler doğrultusunda hareket ediniz. Şüpheli durumlarda 0 (312) 562 05 43 numaralı hattımızı arayabilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#EEE]">
                <button onClick={() => { toast("Duyuru PDF olarak indirildi", { kind: "success", sub: "duyuru_" + Date.now() + ".pdf" }); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12.5px] font-bold text-white bg-[#A82232] hover:bg-[#8B1A25] rounded-[3px]">
                  <Download className="w-3.5 h-3.5" /> PDF İndir
                </button>
                <button onClick={() => { onNav("announcements"); setOpenDuyuru(null); }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-[12.5px] font-bold text-[#333] bg-white border border-[#CCC] hover:bg-[#F5F5F5] rounded-[3px]">
                  Tüm Duyurular
                </button>
                <button onClick={() => setOpenDuyuru(null)} className="ml-auto text-[12.5px] text-[#888] hover:text-[#333]">Kapat</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — DETAIL
// ─────────────────────────────────────────────────────────────────────────────

function Screen2({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState(0);
  const TABS = ["Genel Bilgi", "Aranan Nitelikler", "Başvuru Süreci", "SSS"];

  const criteria = [
    { Icon: Calendar, label: "Yaş Şartı",      value: "18–27 yaş (01.01.2026 itibarıyla)" },
    { Icon: Users,    label: "Boy–Kilo",        value: "Erkek ≥ 165 cm · Kadın ≥ 162 cm · BMI 17–30" },
    { Icon: GraduationCap, label: "Eğitim",    value: "4 yıllık lisans mezunu (herhangi bir bölüm)" },
    { Icon: Shield,   label: "Askerlik",        value: "Erkek adaylar için temin tarihi itibarıyla askerlik yükümlülüğü aranmaz" },
    { Icon: FileText, label: "Sağlık",          value: "A, B veya C sağlık statüsü (Askeri Sağlık Yön.)" },
    { Icon: Star,     label: "Güvenlik",        value: "Güvenlik soruşturması olumlu sonuçlanmış olması" },
  ];

  const steps = [
    { Icon: UserCheck,      label: "TC Kimlik Kaydı",        desc: "e-Devlet üzerinden TC kimlik doğrulama ve hesap oluşturma" },
    { Icon: Upload,         label: "OCR ile Belge Yükleme",  desc: "Sistem belgelerinizi otomatik tanır ve doğrular" },
    { Icon: ClipboardCheck, label: "Bilgi Doğrulama",        desc: "Kişisel bilgileriniz devlet kayıtlarıyla eşleştirilir" },
    { Icon: ListChecks,     label: "Tercih Bildirme",         desc: "Birim ve görev yeri tercihlerinizi sıralayın" },
    { Icon: Award,          label: "Sonuç",                  desc: "SMS ve e-posta bildirimi ile sonuç iletişimi" },
  ];

  const docs = [
    "Nüfus cüzdanı fotokopisi",
    "Diploma veya geçici mezuniyet belgesi",
    "Adli sicil kaydı (son 3 ay içinde alınmış)",
    "Sağlık raporu (tam teşekküllü devlet hastanesi)",
    "İkametgah belgesi (e-Devlet çıktısı)",
    "2 adet biyometrik fotoğraf (6 ay içinde)",
  ];

  const faqs = [
    { q: "Başvurumu sonradan iptal edebilir miyim?", a: "Başvuru bitiş tarihine kadar başvurunuzu dilediğiniz zaman iptal edebilir ya da güncelleyebilirsiniz. İptal işlemi geri alınamaz." },
    { q: "Hangi belge formatları destekleniyor?", a: "PDF, JPG ve PNG formatları desteklenmektedir. Her belge en fazla 5 MB olmalıdır. OCR sistemi yüklenen belgeleri otomatik olarak doğrular." },
    { q: "Sınav tarihini nasıl öğrenebilirim?", a: "Başvurunuz sisteme alındıktan sonra sınav tarihi ve yer bilgisi hesabınıza iletilir. Ek olarak kayıtlı e-posta adresinize bildirim gönderilir." },
    { q: "Yabancı uyruklu adaylar başvurabilir mi?", a: "Hayır. Başvuru yapabilmek için T.C. vatandaşı olmak zorunludur. Çift uyrukluluğa ilişkin değerlendirme Komutanlık tarafından ayrıca yapılmaktadır." },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-slate-500 mb-6">
          <button onClick={onBack} className="hover:text-[#0B2545] transition-colors">Güncel Teminler</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-medium">2026 Yılı Muvazzaf Subay Temini</span>
        </nav>

        {/* Detail hero */}
        <div className="bg-[#0B2545] rounded-2xl p-6 sm:p-8 mb-7 relative overflow-hidden">
          <HeroPattern opacity={0.04} />
          <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <StatusPill status="open" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#C9A24B]/15 text-[#C9A24B] border border-[#C9A24B]/20">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  Son Başvuru: 15 Eylül 2026 · 48 gün kaldı
                </span>
              </div>
              <h1 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-tight mb-3 tracking-tight">
                2026 Yılı Muvazzaf Subay Temini
              </h1>
              <div className="flex flex-wrap gap-4 text-[13px] text-white/55">
                <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" strokeWidth={1.75} />Kara Kuvvetleri Komutanlığı</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" strokeWidth={1.75} />450 Kontenjan</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />Türkiye Geneli</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />01 Haz – 15 Eyl 2026</span>
              </div>
            </div>
            <button className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9A24B] text-[#0B2545] font-extrabold rounded-xl hover:bg-[#dbb456] transition-all text-[15px] shadow-[0_2px_16px_rgba(201,162,75,0.45)] whitespace-nowrap">
              Başvuruya Başla <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Two-column */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex overflow-x-auto border-b border-slate-100 px-2 pt-1">
                {TABS.map((t, i) => (
                  <button key={t} onClick={() => setTab(i)}
                    className={`px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all mr-1 ${tab === i
                      ? "border-[#0B2545] text-[#0B2545]"
                      : "border-transparent text-slate-400 hover:text-slate-700"}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === 0 && (
                  <div className="space-y-5">
                    <p className="text-[14px] text-slate-600 leading-relaxed">
                      Türk Silahlı Kuvvetleri bünyesinde görev yapmak üzere, lisans mezunu erkek ve kadın adaylardan subay alımı yapılacaktır. Başvurular 01 Haziran–15 Eylül 2026 tarihleri arasında dijital ortamda kabul edilecektir.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {criteria.map(({ Icon, label, value }) => (
                        <div key={label} className="flex gap-3 p-4 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-[#0B2545]/[0.07] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#0B2545]" strokeWidth={1.75} />
                          </div>
                          <div>
                            <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
                            <div className="text-[13px] text-slate-700 leading-snug">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 1 && (
                  <div className="space-y-2.5">
                    {criteria.map(({ Icon, label, value }) => (
                      <div key={label} className="flex gap-3.5 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <div className="w-9 h-9 rounded-xl bg-[#0B2545]/[0.07] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#0B2545]" strokeWidth={1.75} />
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-bold text-slate-500 mb-1">{label}</div>
                          <div className="text-[14px] text-slate-800">{value}</div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      </div>
                    ))}
                  </div>
                )}

                {tab === 2 && (
                  <div>
                    <p className="text-[13px] text-slate-500 mb-7">
                      Başvuru süreci 5 adımda tamamlanmaktadır. Her adımı sırasıyla ve eksiksiz tamamlamanız gerekmektedir.
                    </p>
                    <div className="relative pl-5">
                      {/* Connector line */}
                      <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[#0B2545]/30 via-[#0B2545]/20 to-transparent" />
                      {steps.map((step, idx) => (
                        <div key={idx} className="relative flex gap-5 pb-8 last:pb-0">
                          <div className="w-10 h-10 rounded-full bg-[#0B2545] text-white flex items-center justify-center flex-shrink-0 z-10 shadow-[0_0_0_3px_white,0_0_0_4px_rgba(11,37,69,0.15)]">
                            <step.Icon className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <div className="pt-2">
                            <div className="text-[14px] font-bold text-slate-800 mb-1">
                              <span className="text-[#C9A24B] font-extrabold tabular-nums mr-1.5">{idx + 1}.</span>
                              {step.label}
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 3 && (
                  <div className="space-y-3">
                    {faqs.map((f, i) => (
                      <details key={i} className="group border border-slate-200 rounded-xl overflow-hidden">
                        <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-colors list-none">
                          <span className="text-[14px] font-semibold text-slate-800">{f.q}</span>
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 group-open:rotate-180 transition-transform duration-200" />
                        </summary>
                        <div className="px-5 pb-4 text-[13.5px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                          {f.a}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Similar listings */}
            <div>
              <h3 className="text-[15px] font-bold text-slate-700 mb-3">Benzer İlanlar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LISTINGS.slice(1, 4).map(c => (
                  <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
                    <StatusPill status={c.status} />
                    <h4 className="text-[13px] font-semibold text-slate-800 leading-snug my-2 group-hover:text-[#0B2545] transition-colors">{c.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{c.quota.toLocaleString("tr")} kontenjan</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:w-[300px] xl:w-[320px] flex-shrink-0">
            <div className="lg:sticky lg:top-[108px] space-y-4">
              {/* Quota card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="bg-[#0B2545] px-5 py-3.5">
                  <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Kontenjan Özeti</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    ["Toplam Kontenjan", "450"],
                    ["Başvuran Sayısı", "6.842"],
                    ["Mevcut Doluluk", "%69"],
                    ["Kalan Süre", "48 gün"],
                    ["Başvuru Durumu", "Açık"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-[13px] text-slate-500">{label}</span>
                      <span className="text-[13px] font-bold text-slate-800">{val}</span>
                    </div>
                  ))}
                  <div className="pt-1">
                    <div className="flex justify-between text-[11.5px] mb-2">
                      <span className="text-slate-400">Doluluk oranı</span>
                      <span className="font-bold text-slate-600">%69</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B2545] rounded-full" style={{ width: "69%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Gerekli Belgeler</h3>
                <ul className="space-y-2.5">
                  {docs.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded bg-[#0B2545]/[0.08] border border-[#0B2545]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#0B2545]" strokeWidth={2.5} />
                      </div>
                      <span className="text-[12.5px] text-slate-600 leading-snug">{d}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                  PDF olarak indir
                </button>
              </div>

              {/* Share */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bu İlanı Paylaş</h3>
                <div className="grid grid-cols-3 gap-2">
                  {["WhatsApp", "E-posta", "Kopyala"].map(p => (
                    <button key={p} className="py-2 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:border-slate-300 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — ANNOUNCEMENTS
// ─────────────────────────────────────────────────────────────────────────────

function Screen3({ onDuyuru }: { onDuyuru?: (id: string) => void }) {
  const [cat, setCat] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [banner, setBanner] = useState(true);
  const [selected, setSelected] = useState<typeof ANNOUNCEMENTS[0] | null>(null);

  const cats = ["Tümü", "Güncel Duyurular", "Güncel Teminler"];

  const catMap: Record<string, typeof ANNOUNCEMENTS[0]["cat"][]> = {
    "Güncel Duyurular": ["exam", "placement", "general", "document"],
    "Güncel Teminler":  ["general", "document"],
  };

  const filtered = ANNOUNCEMENTS.filter(a => {
    const mc = cat === "Tümü" || catMap[cat]?.includes(a.cat);
    const mq = a.title.toLowerCase().includes(query.toLowerCase()) || a.summary.toLowerCase().includes(query.toLowerCase());
    return mc && mq;
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-7">
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight mb-1">Duyurular</h1>
          <p className="text-[14px] text-slate-400">Temin süreçlerine ait güncel duyurular ve bilgilendirmeler</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-8">
        {/* Important banner */}
        {banner && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-6 flex items-start gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10.5px] font-extrabold text-amber-500 uppercase tracking-widest mb-1">Önemli Duyuru</div>
              <p className="text-[14px] font-semibold text-amber-900 mb-0.5">
                2026/2 Sözleşmeli Er Yerleştirme Sonuçları Açıklandı
              </p>
              <p className="text-[13px] text-amber-700/80">
                TC kimlik numaranızla sisteme giriş yaparak sonucunuzu görüntüleyebilirsiniz.
              </p>
            </div>
            <button onClick={() => setBanner(false)} className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0 mt-0.5">
              <X className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT FILTER PANEL */}
          <aside className="lg:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 lg:sticky lg:top-[108px]">
              {/* Search */}
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text" placeholder="Duyuru ara..."
                  value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 text-[13px] bg-[#F8FAFC] border border-slate-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/30"
                  style={{ paddingLeft: "2rem" }}
                />
              </div>

              {/* Category */}
              <div className="mb-5">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Kategori</div>
                <div className="space-y-0.5">
                  {cats.map(c => (
                    <button key={c} onClick={() => setCat(c)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${cat === c
                        ? "bg-[#0B2545] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">Tarih Aralığı</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10.5px] text-slate-400 mb-1 block">Başlangıç</label>
                    <input type="date" defaultValue="2026-06-01"
                      className="w-full px-3 py-2 text-[12px] bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0B2545]/20" />
                  </div>
                  <div>
                    <label className="text-[10.5px] text-slate-400 mb-1 block">Bitiş</label>
                    <input type="date" defaultValue="2026-07-31"
                      className="w-full px-3 py-2 text-[12px] bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#0B2545]/20" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* RIGHT — TIMELINE LIST */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-slate-500">
                <span className="font-bold text-slate-700">{filtered.length}</span> duyuru
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-3" strokeWidth={1.5} />
                <h3 className="text-[15px] font-semibold text-slate-600 mb-1">Duyuru bulunamadı</h3>
                <p className="text-[13px] text-slate-400">Arama kriterlerinize uygun duyuru mevcut değil.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                {filtered.map((item, idx) => (
                  <div key={item.id}
                    className={`group p-5 sm:p-6 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${idx < filtered.length - 1 ? "border-b border-slate-100" : ""}`}
                    onClick={() => {
                      const t = item.title.toLowerCase();
                      if (onDuyuru && (t.includes("yerleştirme") || t.includes("sonuç") || t.includes("çağrı durumu"))) {
                        onDuyuru("D-001");
                      } else {
                        setSelected(item);
                      }
                    }}
                  >
                    <div className="flex gap-4 sm:gap-5">
                      {/* Date + timeline */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="px-3 py-2 bg-[#F1F5F9] rounded-xl text-center min-w-[60px] border border-slate-200/60">
                          <div className="text-[14px] font-extrabold text-[#0B2545] leading-none">
                            {item.date.split(" ")[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium">
                            {item.date.split(" ")[1]} {item.date.split(" ")[2]}
                          </div>
                        </div>
                        {idx < filtered.length - 1 && (
                          <div className="w-px flex-1 bg-slate-100 mt-2 min-h-[20px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CatPill cat={item.cat} />
                          {item.important && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Önemli
                            </span>
                          )}
                        </div>
                        <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-snug mb-1.5 group-hover:text-[#0B2545] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                          {item.summary}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0B2545] group-hover:text-[#C9A24B] transition-colors">
                          Devamını Oku <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel / modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#0B2545]/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#0B2545] px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <CatPill cat={selected.cat} />
                <h2 className="text-[16px] font-bold text-white mt-2 leading-snug">{selected.title}</h2>
                <p className="text-[12px] text-white/50 mt-1">{selected.date}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-slate-600 leading-relaxed mb-4">{selected.summary}</p>
              <p className="text-[14px] text-slate-600 leading-relaxed mb-6">
                Detaylı bilgi için sistem üzerinden ilgili temin ilanına erişebilir, belgelerinizi indirebilir ve başvuru durumunuzu takip edebilirsiniz.
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 text-[13px] font-semibold text-white bg-[#0B2545] rounded-xl hover:bg-[#0e2f5a] transition-colors">
                  İlgili İlana Git
                </button>
                <button onClick={() => setSelected(null)} className="px-4 py-2.5 text-[13px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SHELL — shared split-screen wrapper for login/register/forgot
// ─────────────────────────────────────────────────────────────────────────────

function AuthShell({
  children, onHome,
  headline = "Kariyer yolculuğun tek bir hesapla.",
  subline = "Türkiye'nin en güvenli devlet kariyer platformunda hesabını yönet.",
}: {
  children: React.ReactNode;
  onHome: () => void;
  headline?: string;
  subline?: string;
}) {
  const features = [
    { Icon: Shield,      title: "KVKK Uyumlu",           desc: "Uçtan uca şifreli, denetlenebilir kimlik altyapısı" },
    { Icon: Zap,         title: "OCR ile Otomatik Form", desc: "Belgeni yükle, sistem saniyeler içinde doldursun" },
    { Icon: BarChart3,   title: "Anlık Başvuru Takibi",  desc: "Tercihlerini, belgelerini ve sonuçlarını tek panelde izle" },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      <GovStrip />
      <div className="flex-1 flex flex-col lg:flex-row">
      {/* LEFT PANEL */}
      <aside className="lg:w-[58%] bg-[#0B2545] relative overflow-hidden flex flex-col justify-between p-8 lg:p-14 min-h-[220px] lg:min-h-[calc(100vh-28px)]">
        <HeroPattern opacity={0.04} />
        <div className="absolute right-0 top-0 bottom-0 w-[60%] opacity-[0.04] hidden lg:block pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 120% at 120% 40%, white 0%, transparent 70%)" }} />

        {/* Top brand — institutional crest */}
        <button onClick={onHome} className="relative flex items-center gap-3.5 self-start group">
          <TCCrest className="w-12 h-12" />
          <div className="text-left leading-tight border-l border-white/15 pl-3.5">
            <div className="text-[9.5px] font-bold text-[#C9A24B] tracking-[0.22em] uppercase mb-0.5">T.C. M.S.B.</div>
            <div className="text-[14px] font-extrabold text-white tracking-tight">Personel Temin Sistemi</div>
            <div className="text-[9.5px] text-white/45 mt-0.5 tracking-wider uppercase">Resmi Başvuru Portalı</div>
          </div>
        </button>

        {/* Middle content */}
        <div className="relative max-w-[460px] hidden lg:block">
          <h2 className="text-[36px] xl:text-[42px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            {headline.split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-[#C9A24B]">{headline.split(" ").slice(-2).join(" ")}</span>
          </h2>
          <p className="text-[15px] text-white/55 leading-relaxed mb-10">{subline}</p>
          <div className="space-y-4">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[#C9A24B]" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-white leading-tight mb-1">{title}</div>
                  <div className="text-[12.5px] text-white/45 leading-snug">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative hidden lg:flex items-center justify-between text-[11px] text-white/30">
          <span>© 2026 T.C. Milli Savunma Bakanlığı</span>
          <div className="flex items-center gap-1.5 text-emerald-400/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
            Sistemler çalışıyor
          </div>
        </div>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14 relative">
        {/* Home link top right */}
        <button onClick={onHome} className="hidden lg:flex absolute top-8 right-8 items-center gap-1.5 text-[12.5px] font-medium text-slate-400 hover:text-[#0B2545] transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Anasayfaya dön
        </button>
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
      </div>
    </div>
  );
}

// TC Kimlik masked input helper
function TcInput({ value, onChange, id = "tc", placeholder = "11 haneli TC Kimlik No" }: {
  value: string; onChange: (v: string) => void; id?: string; placeholder?: string;
}) {
  return (
    <div className="relative">
      <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
      <input
        id={id}
        inputMode="numeric"
        maxLength={11}
        value={value}
        onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 11))}
        placeholder={placeholder}
        className="w-full pl-10 pr-3 py-3 text-[14px] tabular-nums tracking-wide bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40 placeholder:text-slate-400 transition"
      />
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder = "Şifreniz" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-11 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40 placeholder:text-slate-400 transition"
      />
      <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — LOGIN
// ─────────────────────────────────────────────────────────────────────────────

function LoginScreen({ onHome, onRegister, onForgot, onDashboard, onEdevlet, onAdmin }: {
  onHome: () => void; onRegister: () => void; onForgot: () => void; onDashboard: () => void; onEdevlet: () => void; onAdmin: () => void;
}) {
  const [tc, setTc] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tc.length !== 11 || pw.length < 4) {
      setError("TC Kimlik numarası veya şifre hatalı.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Admin kısayolu: 11 haneli 9 → yönetici paneline
      if (tc === "99999999999") { storeActions.girisAdmin("yonetici@msb.gov.tr"); onAdmin(); return; }
      storeActions.girisAday(tc);
      onDashboard();
    }, 900);
  };

  return (
    <AuthShell onHome={onHome}>
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5">Aday Girişi</h1>
        <p className="text-[13.5px] text-slate-500">Hesabına giriş yaparak başvurularını ve belgelerini yönet.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="tc" className="block text-[12px] font-bold text-slate-600 mb-1.5">TC Kimlik Numarası</label>
          <TcInput value={tc} onChange={setTc} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-bold text-slate-600">Şifre</label>
            <button type="button" onClick={onForgot} className="text-[12px] font-semibold text-[#0B2545] hover:text-[#C9A24B] transition-colors">
              Şifremi unuttum
            </button>
          </div>
          <PasswordInput value={pw} onChange={setPw} />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12.5px] text-red-700 font-medium">{error}</p>
          </div>
        )}

        <label className="flex items-center gap-2.5 select-none cursor-pointer">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]/30" />
          <span className="text-[13px] text-slate-600">Bu cihazda beni hatırla</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#0e2f5a] transition-all text-[14px] shadow-[0_2px_8px_rgba(11,37,69,0.25)] disabled:opacity-70"
        >
          {loading ? (
            <><RotateCcw className="w-4 h-4 animate-spin" /> Doğrulanıyor...</>
          ) : (
            <>Giriş Yap <ArrowRight className="w-4 h-4" /></>
          )}
        </button>

        <div className="flex items-center gap-3 py-1">
          <span className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">veya</span>
          <span className="flex-1 h-px bg-slate-200" />
        </div>

        <button type="button" onClick={() => { toast("e-Devlet doğrulaması başarılı", { kind: "success", sub: "Aday paneline yönlendiriliyorsunuz" }); setTimeout(onDashboard, 500); }}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-white border-2 border-[#E30A17]/25 text-slate-800 font-bold rounded-xl hover:bg-[#E30A17]/[0.03] hover:border-[#E30A17]/50 transition-all text-[14px] group">
          <div className="w-6 h-6 rounded bg-[#E30A17] flex items-center justify-center text-white text-[11px] font-black italic tracking-tighter shadow-[0_1px_3px_rgba(227,10,23,0.35)]">e</div>
          <span className="text-[#E30A17]">e-Devlet</span> <span className="text-slate-700">ile Giriş Yap</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#E30A17] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Small footnote link to the demo e-Devlet mock screen */}
        <button type="button" onClick={onEdevlet} className="w-full text-center text-[11px] text-slate-500 hover:text-[#E30A17] transition-colors pt-1">
          e-Devlet mock ekranını göster (demo) →
        </button>

        {/* Admin quick access */}
        <button type="button" onClick={onAdmin}
          className="w-full flex items-center justify-center gap-2 py-2 mt-1 border border-dashed border-[#A82232]/40 rounded-lg text-[11.5px] font-bold text-[#A82232] hover:bg-[#A82232]/[0.04] transition-colors">
          <Shield className="w-3.5 h-3.5" strokeWidth={2} />
          Yönetici Konsoluna Git (Demo)
        </button>

        <p className="text-center text-[13px] text-slate-500 pt-2">
          Hesabın yok mu?{" "}
          <button type="button" onClick={onRegister} className="font-bold text-[#0B2545] hover:text-[#C9A24B] transition-colors">
            TC Kimlik ile Kayıt Ol
          </button>
        </p>

        <p className="text-center text-[10.5px] text-slate-400 leading-relaxed pt-4 border-t border-slate-100">
          Giriş yaparak <a href="#" className="underline hover:text-slate-600">KVKK Aydınlatma Metni</a> ve{" "}
          <a href="#" className="underline hover:text-slate-600">Kullanım Şartları</a>'nı kabul etmiş olursunuz.
        </p>
      </form>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — REGISTER (3-step)
// ─────────────────────────────────────────────────────────────────────────────

function RegisterScreen({ onHome, onLogin, onDashboard }: {
  onHome: () => void; onLogin: () => void; onDashboard: () => void;
}) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    tc: "", ad: "", soyad: "", dogum: "", dogumYili: "", cinsiyet: "",
    email: "", tel: "", il: "",
    pw: "", pw2: "",
  });
  const [kvkk1, setKvkk1] = useState(false);
  const [kvkk2, setKvkk2] = useState(false);

  const STEPS = ["Kimlik Doğrulama", "İletişim Bilgileri", "Şifre Belirleme"];

  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  const step1Valid = f.tc.length === 11 && f.ad && f.soyad && f.dogum && f.cinsiyet && kvkk1 && kvkk2;
  const step2Valid = f.email && f.tel && f.il;
  const step3Valid = f.pw.length >= 8 && f.pw === f.pw2;

  return (
    <AuthShell onHome={onHome} headline="Kayıt ol, kariyerini başlat." subline="Kimliğin doğrulanır, tüm başvurular tek hesapla yönetilir.">
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5">Hesap Oluştur</h1>
        <p className="text-[13.5px] text-slate-500">3 adımda hesabını oluştur, hemen başvuruya başla.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${i <= step ? "bg-[#0B2545]" : "bg-slate-200"}`} />
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  i < step ? "bg-[#0B2545] text-white"
                  : i === step ? "bg-[#C9A24B] text-[#0B2545] shadow-[0_0_0_3px_rgba(201,162,75,0.2)]"
                  : "bg-slate-200 text-slate-400"
                }`}>
                  {i < step ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === step ? "text-[#0B2545]" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">TC Kimlik Numarası</label>
            <TcInput value={f.tc} onChange={v => set("tc", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Ad</label>
              <input value={f.ad} onChange={e => set("ad", e.target.value)}
                className="w-full px-3.5 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Soyad</label>
              <input value={f.soyad} onChange={e => set("soyad", e.target.value)}
                className="w-full px-3.5 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Doğum Tarihi</label>
              <input type="date" value={f.dogum} onChange={e => set("dogum", e.target.value)}
                className="w-full px-3.5 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Doğum Yılı</label>
              <input inputMode="numeric" maxLength={4} value={f.dogumYili}
                onChange={e => set("dogumYili", e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1998"
                className="w-full px-3.5 py-3 text-[14px] tabular-nums bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-2">Cinsiyet</label>
            <div className="grid grid-cols-2 gap-2">
              {["Erkek", "Kadın"].map(g => (
                <label key={g} className={`flex items-center justify-center gap-2 py-3 rounded-[10px] border cursor-pointer transition-all text-[13.5px] font-semibold ${
                  f.cinsiyet === g ? "bg-[#0B2545] text-white border-[#0B2545] shadow-sm"
                  : "bg-[#F8FAFC] text-slate-600 border-slate-200 hover:border-slate-300"
                }`}>
                  <input type="radio" name="cinsiyet" value={g} checked={f.cinsiyet === g}
                    onChange={e => set("cinsiyet", e.target.value)} className="sr-only" />
                  {g}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50 border border-sky-100">
            <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-sky-800 leading-relaxed">
              Bilgilerin <strong>NVİ (Nüfus ve Vatandaşlık İşleri)</strong> üzerinden anlık doğrulanır. Yanlış bilgi girişi hesabının silinmesine yol açabilir.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={kvkk1} onChange={e => setKvkk1(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]/30" />
              <span className="text-[12.5px] text-slate-600 leading-snug">
                <a href="#" className="text-[#0B2545] font-semibold underline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={kvkk2} onChange={e => setKvkk2(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]/30" />
              <span className="text-[12.5px] text-slate-600 leading-snug">
                Kişisel verilerimin belirtilen amaçlarla işlenmesine <strong>açık rıza</strong> gösteriyorum.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">E-posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <input type="email" value={f.email} onChange={e => set("email", e.target.value)}
                placeholder="ornek@eposta.com"
                className="w-full pl-10 pr-3 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Cep Telefonu</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <input value={f.tel} onChange={e => set("tel", e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className="w-full pl-10 pr-3 py-3 text-[14px] tabular-nums bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40" />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Yaşadığın İl</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <select value={f.il} onChange={e => set("il", e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-[14px] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/15 focus:border-[#0B2545]/40 text-slate-700 appearance-none">
                <option value="">İl seçin</option>
                {["Ankara","İstanbul","İzmir","Bursa","Antalya","Konya","Gaziantep","Kayseri","Trabzon","Erzurum"].map(il => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12px] text-amber-900 leading-relaxed">
              E-posta ve telefonuna doğrulama kodu gönderilecek. Bilgilerini doğru girdiğinden emin ol.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Şifre Belirle</label>
            <PasswordInput value={f.pw} onChange={v => set("pw", v)} placeholder="En az 8 karakter" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Şifre Tekrar</label>
            <PasswordInput value={f.pw2} onChange={v => set("pw2", v)} placeholder="Şifreni tekrar gir" />
            {f.pw2 && f.pw !== f.pw2 && (
              <p className="text-[11.5px] text-red-500 font-medium mt-1.5">Şifreler eşleşmiyor.</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">Güçlü şifre için</div>
            <ul className="space-y-1.5">
              {[
                { test: f.pw.length >= 8, txt: "En az 8 karakter" },
                { test: /[A-Z]/.test(f.pw), txt: "En az bir büyük harf" },
                { test: /[0-9]/.test(f.pw), txt: "En az bir rakam" },
                { test: /[^A-Za-z0-9]/.test(f.pw), txt: "En az bir özel karakter (!@#$)" },
              ].map(({ test, txt }) => (
                <li key={txt} className="flex items-center gap-2 text-[12px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${test ? "bg-emerald-500" : "bg-slate-200"}`}>
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <span className={test ? "text-slate-700 font-medium" : "text-slate-400"}>{txt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* NAV BUTTONS */}
      <div className="flex gap-2 mt-8">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)}
            className="px-5 py-3 text-[13.5px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Geri
          </button>
        )}
        <button
          onClick={() => step < 2 ? setStep(step + 1) : onDashboard()}
          disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid) || (step === 2 && !step3Valid)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#0e2f5a] transition-all text-[14px] shadow-[0_2px_8px_rgba(11,37,69,0.25)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step < 2 ? <>Doğrula ve Devam Et <ArrowRight className="w-4 h-4" /></> : <>Hesabı Oluştur <Check className="w-4 h-4" strokeWidth={2.5} /></>}
        </button>
      </div>

      <p className="text-center text-[13px] text-slate-500 pt-5">
        Zaten hesabın var mı?{" "}
        <button type="button" onClick={onLogin} className="font-bold text-[#0B2545] hover:text-[#C9A24B] transition-colors">
          Giriş Yap
        </button>
      </p>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────────────────────

function ForgotScreen({ onHome, onLogin }: { onHome: () => void; onLogin: () => void }) {
  const [tc, setTc] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!sent || timer <= 0) return;
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [sent, timer]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  };

  return (
    <AuthShell onHome={onHome} headline="Şifreni sıfırla, hesabına dön.">
      {!sent ? (
        <>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0B2545]/[0.07] flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6 text-[#0B2545]" strokeWidth={1.75} />
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5">Şifreni mi unuttun?</h1>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">
              TC Kimlik numaranı gir, kayıtlı e-posta ve telefonuna 6 haneli sıfırlama kodu gönderelim.
            </p>
          </div>

          <form onSubmit={e => { e.preventDefault(); if (tc.length === 11) { setSent(true); setTimer(60); } }} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5">TC Kimlik Numarası</label>
              <TcInput value={tc} onChange={setTc} />
            </div>

            <button type="submit" disabled={tc.length !== 11}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#0e2f5a] transition-all text-[14px] shadow-[0_2px_8px_rgba(11,37,69,0.25)] disabled:opacity-40 disabled:cursor-not-allowed">
              Sıfırlama Kodu Gönder <ArrowRight className="w-4 h-4" />
            </button>

            <button type="button" onClick={onLogin}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[13px] font-semibold text-slate-500 hover:text-[#0B2545] transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> Giriş sayfasına dön
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={2} />
            </div>
            <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight mb-1.5">Kod gönderildi</h1>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">
              Kayıtlı iletişim adreslerine <strong className="text-slate-700">6 haneli</strong> kod iletildi. 3 dakika içinde girmelisin.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-2.5">Doğrulama Kodu</label>
              <div className="flex gap-2 justify-between">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => setDigit(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
                    }}
                    className="w-12 h-14 sm:w-[52px] sm:h-16 text-center text-[22px] font-bold tabular-nums text-[#0B2545] bg-[#F8FAFC] border border-slate-200 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/25 focus:border-[#0B2545]/50 transition"
                  />
                ))}
              </div>
            </div>

            <button
              disabled={otp.some(d => !d)}
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0B2545] text-white font-semibold rounded-xl hover:bg-[#0e2f5a] transition-all text-[14px] shadow-[0_2px_8px_rgba(11,37,69,0.25)] disabled:opacity-40 disabled:cursor-not-allowed">
              Doğrula ve Devam Et <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-[12.5px] text-slate-400">
                  Kod almadın mı? Tekrar gönder{" "}
                  <span className="font-bold text-slate-600 tabular-nums">({timer}s)</span>
                </p>
              ) : (
                <button onClick={() => { setTimer(60); setOtp(["","","","","",""]); }}
                  className="text-[12.5px] font-bold text-[#0B2545] hover:text-[#C9A24B] transition-colors">
                  Kodu tekrar gönder
                </button>
              )}
            </div>

            <button onClick={() => setSent(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[13px] font-semibold text-slate-500 hover:text-[#0B2545] transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" /> TC Kimlik değiştir
            </button>
          </div>
        </>
      )}
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6b — e-DEVLET SSO GATEWAY (mock)
// Turkiye.gov.tr'nin resmi giriş ekranını taklit eden mock — demo amaçlıdır.
// ─────────────────────────────────────────────────────────────────────────────

function EDevletScreen({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const [method, setMethod] = useState<"pw" | "mobile" | "eimza" | "kart" | "banka">("pw");
  const [tc, setTc] = useState("");
  const [pw, setPw] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CAPTCHA_CODE = "K4Z9M";

  const methods = [
    { id: "pw",     label: "e-Devlet Şifresi",   Icon: Lock },
    { id: "mobile", label: "Mobil İmza",          Icon: Phone },
    { id: "eimza",  label: "e-İmza",              Icon: FileText },
    { id: "kart",   label: "T.C. Kimlik Kartı",  Icon: Fingerprint },
    { id: "banka",  label: "İnternet Bankacılığı", Icon: Building2 },
  ] as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method !== "pw") { setError("Bu giriş yöntemi demoda desteklenmiyor. Lütfen e-Devlet Şifresi seçin."); return; }
    if (tc.length !== 11) { setError("T.C. Kimlik No 11 hane olmalıdır."); return; }
    if (pw.length < 4)     { setError("e-Devlet şifreniz eksik."); return; }
    if (captcha.toUpperCase() !== CAPTCHA_CODE) { setError("Güvenlik kodu hatalı."); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRedirecting(true);
      setTimeout(onSuccess, 1400);
    }, 900);
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2} />
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 mb-2">Kimlik Doğrulandı</h1>
          <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
            T.C. Kimlik doğrulaması başarılı. <strong className="text-slate-700">Personel Temin Sistemi</strong>'ne yönlendiriliyorsunuz…
          </p>
          <div className="inline-flex items-center gap-2 text-[12px] text-slate-400">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            Oturum aktarılıyor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* e-Devlet RED HEADER — turkiye.gov.tr benzeri */}
      <header className="bg-[#E30A17] text-white">
        {/* Top thin bar */}
        <div className="bg-[#c00813] border-b border-black/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-7 flex items-center justify-between text-[10.5px] font-semibold tracking-wide">
            <a href="https://www.turkiye.gov.tr" target="_blank" rel="noreferrer noopener" className="hover:underline opacity-90">
              🇹🇷 turkiye.gov.tr — Türkiye'nin Dijital Kapısı
            </a>
            <div className="hidden sm:flex items-center gap-3 opacity-90">
              <a href="#" className="hover:underline">Yardım</a>
              <span className="opacity-40">|</span>
              <a href="#" className="hover:underline">İletişim Merkezi 160</a>
              <span className="opacity-40">|</span>
              <span>English</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* turkiye.gov.tr wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-md flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.15)]">
                <div className="text-[#E30A17] font-black text-[22px] italic leading-none tracking-tighter">e</div>
              </div>
              <div className="leading-tight">
                <div className="text-[19px] font-black italic tracking-tight">
                  <span className="opacity-90">türkiye</span>.gov.tr
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase opacity-70 font-semibold mt-0.5">
                  Türkiye Cumhuriyeti Cumhurbaşkanlığı
                </div>
              </div>
            </div>
          </div>

          <button onClick={onCancel} className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-white/85 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" /> Girişi İptal Et
          </button>
        </div>
      </header>

      {/* Info strip: which app is asking for login */}
      <div className="bg-[#F5F5F5] border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TCCrest className="w-8 h-8" />
            <div className="leading-tight">
              <div className="text-[9.5px] font-bold text-slate-500 tracking-[0.18em] uppercase">Uygulama Girişi</div>
              <div className="text-[13px] font-bold text-slate-800">
                T.C. Millî Savunma Bakanlığı — Personel Temin Sistemi
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.25} />
            <span className="text-[11px] font-semibold text-slate-600">Doğrulanmış kurumsal uygulama</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 lg:py-14">
          {/* Demo notice */}
          <div className="max-w-3xl mx-auto mb-6 flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
            <p className="text-[12.5px] text-amber-900 leading-relaxed">
              <strong>Demo Modu:</strong> Bu ekran turkiye.gov.tr tasarımını taklit eden bir tanıtım prototipidir. Herhangi bir 11 haneli TC + 4+ karakter şifre + güvenlik kodu <strong className="tabular-nums bg-white px-1.5 py-0.5 rounded border border-amber-300 mx-0.5">{CAPTCHA_CODE}</strong> ile giriş yapabilirsiniz.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06),0_20px_60px_rgba(0,0,0,0.08)] border border-slate-200 overflow-hidden">
            {/* Title */}
            <div className="border-b border-slate-200 px-6 sm:px-8 py-5">
              <h1 className="text-[20px] font-bold text-slate-800">T.C. Kimlik Numarası ile Giriş</h1>
              <p className="text-[13px] text-slate-500 mt-1">
                Aşağıda listelenen giriş yöntemlerinden birini kullanarak kimliğinizi doğrulayın.
              </p>
            </div>

            {/* Method tabs */}
            <div className="border-b border-slate-200 bg-[#FAFAFA]">
              <div className="flex overflow-x-auto">
                {methods.map(m => (
                  <button key={m.id} onClick={() => { setMethod(m.id); setError(null); }}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                      method === m.id
                        ? "border-[#E30A17] text-[#E30A17] bg-white"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60"
                    }`}>
                    <m.Icon className="w-3.5 h-3.5" strokeWidth={2} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form area */}
            <div className="p-6 sm:p-8">
              {method === "pw" ? (
                <form onSubmit={submit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-600 mb-1.5">T.C. Kimlik No <span className="text-[#E30A17]">*</span></label>
                    <input inputMode="numeric" maxLength={11}
                      value={tc} onChange={e => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="w-full px-3.5 py-3 text-[14px] tabular-nums tracking-wide bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E30A17]/20 focus:border-[#E30A17]/60 transition"
                      placeholder="11 haneli T.C. Kimlik Numaranız" />
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-600 mb-1.5">e-Devlet Şifresi <span className="text-[#E30A17]">*</span></label>
                    <PasswordInput value={pw} onChange={setPw} placeholder="e-Devlet şifreniz" />
                    <p className="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                      <span className="text-[#E30A17] font-semibold">*</span> e-Devlet şifrenizi içeren zarfınızı PTT Merkez Müdürlüklerinden, T.C. Kimlik Kartınızla temin edebilirsiniz.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-600 mb-1.5">Güvenlik Kodu <span className="text-[#E30A17]">*</span></label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border border-slate-300 rounded font-mono text-[18px] font-bold tracking-[0.25em] text-slate-700 select-none relative overflow-hidden">
                        <span className="relative z-10" style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}>{CAPTCHA_CODE}</span>
                        <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
                          <line x1="0" y1="10" x2="100%" y2="80%" stroke="#94a3b8" strokeWidth="1" />
                          <line x1="0" y1="90%" x2="100%" y2="15" stroke="#94a3b8" strokeWidth="1" />
                        </svg>
                      </div>
                      <input value={captcha} onChange={e => setCaptcha(e.target.value.toUpperCase().slice(0, 5))}
                        maxLength={5}
                        className="flex-1 px-3.5 py-2.5 text-[14px] uppercase tracking-widest bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#E30A17]/20 focus:border-[#E30A17]/60 transition"
                        placeholder="Yukarıdaki kodu girin" />
                      <button type="button" onClick={() => setCaptcha("")} className="px-3 py-2.5 border border-slate-300 rounded hover:bg-slate-50 text-slate-500" title="Yenile">
                        <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2.5 p-3 rounded bg-red-50 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <p className="text-[12.5px] text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <a href="https://giris.turkiye.gov.tr/OturumAc/ParolamiUnuttum" target="_blank" rel="noreferrer noopener" className="text-[12px] font-semibold text-[#E30A17] hover:underline">
                      Şifremi Unuttum
                    </a>
                    <div className="flex gap-2">
                      <button type="button" onClick={onCancel}
                        className="px-5 py-2.5 text-[13px] font-semibold text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                        İptal
                      </button>
                      <button type="submit" disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E30A17] text-white font-bold rounded hover:bg-[#c00813] transition-all text-[13px] shadow-[0_2px_8px_rgba(227,10,23,0.35)] disabled:opacity-70">
                        {loading ? (
                          <><RotateCcw className="w-4 h-4 animate-spin" /> Doğrulanıyor...</>
                        ) : (
                          <>Sisteme Giriş Yap <ArrowRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Real e-Devlet redirect (opens giris.turkiye.gov.tr in new tab) */}
                  <div className="pt-4 mt-2 border-t border-slate-200">
                    <div className="flex items-start gap-2.5 p-3 rounded bg-emerald-50 border border-emerald-200 mb-3">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="text-[12.5px] text-emerald-900 font-bold leading-snug">Gerçek e-Devlet doğrulamasını kullanın</p>
                        <p className="text-[11.5px] text-emerald-800/85 leading-snug mt-0.5">
                          Aşağıdaki bağlantı sizi <strong>giris.turkiye.gov.tr</strong> resmi e-Devlet oturum açma sayfasına götürür. Doğrulama sonrası bu sekmeye geri döneceksiniz.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const redirect = encodeURIComponent(window.location.origin + "/?edevlet_callback=1");
                        const url = `https://giris.turkiye.gov.tr/OturumAc/GirisYap/index.html?ReturnUrl=${redirect}`;
                        const w = window.open(url, "_blank", "noopener,noreferrer");
                        toast("e-Devlet giriş sayfası açıldı", { kind: "info", sub: "giris.turkiye.gov.tr yeni sekmede açıldı" });
                        // Simulate post-login callback after 12s (client can come back and see dashboard)
                        setTimeout(() => {
                          if (w && !w.closed) {
                            toast("e-Devlet doğrulaması tamamlandığında bu sekmeye dönün", { kind: "info" });
                          } else {
                            toast("Kimlik doğrulaması tamamlandı", { kind: "success", sub: "Aday paneline yönlendiriliyorsunuz" });
                            setTimeout(onSuccess, 900);
                          }
                        }, 6000);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-white border-2 border-[#E30A17] text-[#E30A17] font-bold rounded hover:bg-[#FFF5F6] transition-colors text-[13px]">
                      <div className="w-5 h-5 rounded bg-[#E30A17] flex items-center justify-center text-white text-[10px] font-black italic">e</div>
                      giris.turkiye.gov.tr'ye git ve gerçek e-Devlet ile doğrula
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-[10.5px] text-slate-500 mt-2 text-center leading-snug">
                      Not: Tam OAuth entegrasyonu için MSB'nin turkiye.gov.tr üzerinde tescil edilmiş bir <code className="bg-slate-100 px-1 rounded">client_id</code> alması gerekir (yalnızca resmi kurumlara verilir).
                    </p>
                  </div>
                </form>
              ) : (
                <div className="max-w-md py-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Info className="w-6 h-6 text-slate-400" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-700 mb-1.5">Bu yöntem demoda etkin değil</h3>
                  <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
                    Bu tanıtım prototipinde yalnızca <strong>e-Devlet Şifresi</strong> ile giriş simüle edilmiştir. Gerçek entegrasyonda tüm yöntemler desteklenir.
                  </p>
                  <button onClick={() => setMethod("pw")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E30A17] text-white font-bold rounded hover:bg-[#c00813] transition-colors text-[13px]">
                    e-Devlet Şifresi ile Devam Et <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Bottom info */}
            <div className="bg-[#FAFAFA] border-t border-slate-200 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                <Lock className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                <span>Bağlantınız <strong className="text-emerald-700">SSL</strong> ile şifrelenmektedir</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <a href="#" className="hover:text-slate-600 hover:underline">Gizlilik ve Güvenlik</a>
                <span>·</span>
                <a href="#" className="hover:text-slate-600 hover:underline">Kullanım Şartları</a>
                <span>·</span>
                <a href="#" className="hover:text-slate-600 hover:underline">KVKK</a>
              </div>
            </div>
          </div>

          {/* Help panels */}
          <div className="max-w-3xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { Icon: Info,       title: "İlk kez mi giriyorsunuz?", desc: "e-Devlet şifresi almak için en yakın PTT Merkez Müdürlüğüne başvurun." },
              { Icon: Phone,      title: "Yardım hattı: 160",       desc: "7/24 Alo 160 İletişim Merkezimizi ücretsiz arayabilirsiniz." },
              { Icon: BookOpen,   title: "Kullanım kılavuzu",        desc: "Sıkça sorulan sorular ve giriş yöntemleri hakkında bilgi alın." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-lg p-4">
                <Icon className="w-4 h-4 text-[#E30A17] mb-2" strokeWidth={2} />
                <h4 className="text-[12.5px] font-bold text-slate-800 mb-1">{title}</h4>
                <p className="text-[11.5px] text-slate-500 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2a2a2a] text-white/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <span>© 2026 Türkiye Cumhuriyeti Cumhurbaşkanlığı Dijital Dönüşüm Ofisi</span>
          <span className="opacity-60">turkiye.gov.tr</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 7 — CANDIDATE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

// MSB PANEL PALETTE — screenshot-faithful
const MSB = {
  red:        "#A82232",  // sidebar deep institutional red
  redDark:    "#8B1A25",  // active sidebar item
  redHover:   "#961D2A",
  redAccent:  "#C13023",  // header text / wizard active
  redTable:   "#B23A48",  // table header (softer red)
  orange:     "#C87E27",  // page title / breadcrumb accent
  breadcrumb: "#B87333",
  ink:        "#333333",  // body text
  muted:      "#6B6B6B",
  label:      "#555555",
  border:     "#E0E0E0",
  borderMid:  "#CCCCCC",
  bgSoft:     "#F5F5F5",
  bgWhite:    "#FFFFFF",
  footer:     "#2C2C2C",
  infoBg:     "#E7F3F9",
  infoBrd:    "#B6DAEA",
  infoText:   "#1F5372",
  warnBg:     "#FCF3E3",
  warnBrd:    "#E7C688",
};

// MSB emblem — red circle with stylized "M" (matches screenshot)
function MSBEmblem({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden>
      <circle cx="22" cy="22" r="20" fill="none" stroke={MSB.red} strokeWidth="2.2" />
      <circle cx="22" cy="22" r="16" fill="none" stroke={MSB.red} strokeWidth="0.6" opacity="0.5" />
      {/* Stylized M/crescent-star mark */}
      <path d="M12 30 L12 14 L16 14 L22 22 L28 14 L32 14 L32 30 L28.5 30 L28.5 19 L22 27 L15.5 19 L15.5 30 Z" fill={MSB.red} />
      <circle cx="22" cy="6" r="1.6" fill={MSB.red} />
    </svg>
  );
}

// Section box header (MSB gray-bordered panel)
function MSBPanel({ title, icon, actions, children }: {
  title?: React.ReactNode; icon?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-[#DDDDDD] rounded shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#DDDDDD] bg-[#F5F5F5]">
          <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#555555]">
            {icon}<span>{title}</span>
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

// MSB "boxy" input
const inputCls = "w-full px-2.5 py-1.5 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20 text-[#333]";
const btnCls   = "inline-flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px] shadow-sm transition-colors";
const btnLight = "inline-flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px] transition-colors";
const btnGhost = "inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold text-[#555] bg-white hover:bg-[#F5F5F5] border border-[#DDDDDD] rounded-[3px] transition-colors";

function DashboardScreen({ onLogout, onOcr, onSonuc }: { onLogout: () => void; onOcr: () => void; onSonuc: () => void }) {
  const [view, setView] = useState<"bilgilerim" | "cagriTakip" | "cagriSinav" | "mesajlar" | "saglik" | "tercihYap" | "tercihlerim" | "kesinkayit" | "odeme">("bilgilerim");
  const [tercihGroupOpen, setTercihGroupOpen] = useState(true);
  const [wizardStep, setWizardStep] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const menuItems = [
    { id: "bilgilerim",   label: "Bilgilerim" },
    { id: "tercihYap",    label: "Tercih Yap" },
    { id: "tercihlerim",  label: "Tercihlerim" },
    { id: "odeme",        label: "Ödemelerim" },
    { id: "kesinkayit",   label: "Kesin Kayıt" },
    { id: "cagriSinav",   label: "Çağrı/Sınav Durumu" },
    { id: "cagriTakip",   label: "Çağrı Takip" },
    { id: "mesajlar",     label: "Mesajlarım" },
    { id: "saglik",       label: "Sağlık Raporlarım" },
  ] as const;

  const titleMap = {
    bilgilerim:  "Başvuru Sihirbazı",
    tercihYap:   "Tercih Yap",
    tercihlerim: "Tercihlerim",
    odeme:       "Ödemelerim",
    kesinkayit:  "Kesin Kayıt İşlemleri",
    cagriSinav:  "Çağrı/Sınav Durumu",
    cagriTakip:  "Çağrı Takip",
    mesajlar:    "Mesajlarım",
    saglik:      "Sağlık Raporlarım",
  } as const;

  const wizardTabs = [
    "Kimlik Bilgileri",
    "Şehit/Gazi Yakını Bilgileri",
    "Eğitim Bilgileri",
    "Sınav Bilgileri",
    "Askerlik Bilgileri",
    "Adres Bilgileri",
    "İletişim Bilgileri",
    "Ehliyet & Yabancı Dil",
  ];

  const kimlikRows = [
    ["Uyruk",                    "T.C."],
    ["Kimlik No",                "18878273464"],
    ["Ad",                       "YUSUF"],
    ["Soyad",                    "ÖZDEMİR"],
    ["Doğum Tarihi",             "13.11.2003"],
    ["Medeni Hal",               "Bekar"],
    ["Cinsiyet",                 "Erkek"],
    ["Doğum Tarihi Değişikliği", "Hayır"],
    ["Doğum Tarihi Düzeltme",    ""],
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif", color: MSB.ink }}>
      {/* ═════════════ TOP HEADER (white, MSB emblem + search + date + user) ═════════════ */}
      <header className="h-[62px] bg-white border-b border-[#DDDDDD] flex items-center px-3 sm:px-5 sticky top-0 z-40">
        {/* Left: emblem + wordmark */}
        <button onClick={() => setView("bilgilerim")} className="flex items-center gap-2.5 flex-shrink-0 group">
          <MSBEmblem size={40} />
          <div className="leading-tight text-left">
            <div className="text-[9.5px] font-bold tracking-[0.06em]" style={{ color: MSB.red }}>PERSONEL GENEL MÜDÜRLÜĞÜ</div>
            <div className="text-[15.5px] font-extrabold tracking-tight" style={{ color: MSB.red }}>PERSONEL TEMİN <span className="font-black">DAİRE BAŞKANLIĞI</span></div>
          </div>
        </button>

        {/* Center: search */}
        <div className="flex-1 max-w-xl mx-6 hidden md:block">
          <input type="text" placeholder="Ara..." onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLInputElement).value) { toast(`Arama: "${(e.target as HTMLInputElement).value}"`, { kind: "info", sub: "0 sonuç bulundu" }); (e.target as HTMLInputElement).value = ""; } }}
            className="w-full px-4 py-1.5 text-[13px] bg-white border border-[#DDDDDD] rounded-full focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20" />
        </div>

        {/* Right: date + user + logout + burger */}
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 leading-tight">
            <div className="text-[26px] font-light text-[#333] tabular-nums">04</div>
            <div className="text-[10px] text-[#666666] leading-[1.15] uppercase tracking-wide">
              <div className="font-semibold">AĞUSTOS</div>
              <div>2026</div>
              <div className="text-[9px] italic">Salı</div>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#444] hover:text-[#A82232] transition-colors tracking-wide">
            <LogOut className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:inline uppercase">Yusuf Özdemir</span>
          </button>
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-1.5 hover:bg-[#F5F5F5] rounded transition-colors">
            <Menu className="w-5 h-5 text-[#555]" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* ═════════════ BODY: sidebar + content ═════════════ */}
      <div className="flex-1 flex">
        {/* SIDEBAR — MSB deep red */}
        <aside className={`w-[240px] flex-shrink-0 flex-col ${mobileNavOpen ? "flex absolute z-30 h-full" : "hidden md:flex"}`} style={{ background: MSB.red }}>
          {/* User at top */}
          <button className="flex items-center justify-between px-4 py-3.5 text-white text-[12.5px] font-semibold border-b border-white/10 hover:bg-black/10 transition-colors">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="uppercase tracking-wide">Yusuf Özdemir</span>
            </div>
          </button>

          {/* Folder group */}
          <button onClick={() => setTercihGroupOpen(!tercihGroupOpen)}
            className="flex items-center gap-2 px-4 py-3 text-white text-[12.5px] font-bold uppercase tracking-wide border-b border-white/10 hover:bg-black/10 transition-colors">
            <svg viewBox="0 0 20 20" className="w-4 h-4 flex-shrink-0" fill="currentColor"><path d="M2 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"/></svg>
            <span className="flex-1 text-left">Tercih İşlemleri</span>
          </button>

          {tercihGroupOpen && (
            <nav className="flex flex-col">
              {menuItems.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setView(m.id); setMobileNavOpen(false); }}
                  className={`relative flex items-center px-6 py-2.5 text-[12.5px] text-white/95 text-left transition-colors ${
                    view === m.id ? "font-bold" : "hover:bg-black/10"
                  }`}
                  style={view === m.id ? { background: MSB.redDark } : {}}
                >
                  <span className="mr-2 text-white/60">-</span>
                  <span>{m.label}</span>
                  {view === m.id && (
                    <span className="absolute top-1/2 right-0 -translate-y-1/2 w-0 h-0"
                      style={{ borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "10px solid white" }} />
                  )}
                </button>
              ))}
            </nav>
          )}

          <div className="mt-auto p-4 border-t border-white/10 text-[10.5px] text-white/50 tracking-wider uppercase">
            T.C. Millî Savunma Bakanlığı
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 min-w-0 bg-white">
          {/* Page title row + help buttons */}
          <div className="px-6 py-5 flex items-start justify-between flex-wrap gap-4 border-b border-[#EEEEEE]">
            <div>
              <h1 className="text-[26px] font-light text-[#666] tracking-tight">{titleMap[view]}</h1>
              {/* breadcrumb */}
              <nav className="flex items-center gap-1.5 mt-4 text-[13.5px]" style={{ color: MSB.breadcrumb }}>
                <ChevronRight className="w-3.5 h-3.5" />
                <a href="#" className="hover:underline">MSB İnternet</a>
                <ChevronRight className="w-3.5 h-3.5" />
                <a href="#" className="hover:underline">Tercih İşlemleri</a>
                <ChevronRight className="w-3.5 h-3.5" />
                <span>{titleMap[view]}</span>
              </nav>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={onOcr}
                className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-bold text-white rounded-[3px] border transition-colors"
                style={{ background: MSB.red, borderColor: MSB.redDark }}
                onMouseEnter={e => (e.currentTarget.style.background = MSB.redHover)}
                onMouseLeave={e => (e.currentTarget.style.background = MSB.red)}>
                <ScanLine className="w-3.5 h-3.5" strokeWidth={2.5} /> OCR ile Belge Yükle
              </button>
              <button onClick={onSonuc}
                className="inline-flex items-center gap-1.5 h-[30px] px-3 text-[12px] font-bold rounded-[3px] border transition-colors bg-white"
                style={{ color: MSB.red, borderColor: MSB.red }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FBECEE")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                <Trophy className="w-3.5 h-3.5" strokeWidth={2.5} /> Sonucumu Gör
              </button>
              <button onClick={() => toast("Yardım kılavuzu açıldı", { kind: "info", sub: "Bilgi doldurma rehberi" })} className={btnGhost}><span className="text-[#A82232] font-bold">?</span> Bilgilerimi nasıl doldururum</button>
              <button onClick={() => toast("Tercih kılavuzu açıldı", { kind: "info", sub: "Tercih yapma rehberi" })} className={btnGhost}><span className="text-[#A82232] font-bold">?</span> Nasıl tercih yaparım</button>
              <button onClick={() => toast("Sayfa yenilendi", { kind: "success" })} className="w-[34px] h-[30px] flex items-center justify-center bg-white border border-[#DDDDDD] rounded-[3px] hover:bg-[#F5F5F5] transition-colors" title="Yenile">
                <RotateCcw className="w-3.5 h-3.5 text-[#666]" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Content by view */}
          <div className="px-6 py-6">

            {/* ═════ BİLGİLERİM — BAŞVURU SİHİRBAZI (yeni modül) ═════ */}
            {view === "bilgilerim" && (
              <BasvuruSihirbazi adayId="18878273464" />
            )}

            {/* ═════ ÇAĞRI TAKİP (destek talepleri) ═════ */}
            {view === "cagriTakip" && (
              <CagriListesi adayId="18878273464"
                adayAd="Yusuf Özdemir"
                adayEposta="yusuf.ozdemir@example.com"
                adayTelefon="0555 111 22 33" />
            )}

            {/* ═════ ÇAĞRI/SINAV DURUMU (başvurularım + sonuç) ═════ */}
            {view === "cagriSinav" && (
              <CagriSinavDurumu adayId="18878273464" />
            )}

            {/* ═════ MESAJLARIM (renkli bildirimler) ═════ */}
            {view === "mesajlar" && (
              <Mesajlarim adayId="18878273464" />
            )}

            {/* ═════ KESIN KAYIT ═════ */}
            {view === "kesinkayit" && (
              <KesinKayit adayId="18878273464" />
            )}

            {/* ═════ ÖDEMELERIM ═════ */}
            {view === "odeme" && (
              <Odeme adayId="18878273464" />
            )}

            {/* ═════ SAĞLIK RAPORLARIM ═════ */}
            {view === "saglik" && (
              <MSBPanel title="Sorgulama Kriterleri" icon={<Search className="w-3.5 h-3.5 text-[#666]" />}
                actions={<button className="text-[#888] hover:text-[#333] text-[16px]">−</button>}>
                <div className="flex items-center gap-3">
                  <label className="w-[140px] text-right text-[13px] text-[#555]">Alımlar <span className="text-[#A82232]">*</span></label>
                  <select className={inputCls + " max-w-md"}>
                    <option>Seçiniz</option>
                    <option>2026 Yılı Muvazzaf Subay Temini</option>
                    <option>Sivil Memur Alımı — BT & Mühendislik</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#EEE]">
                  <button onClick={() => toast("Sağlık raporu sorgulandı", { kind: "success", sub: "1 rapor bulundu — 22.07.2026" })} className={btnCls}><Search className="w-3.5 h-3.5" /> Sorgula</button>
                  <button onClick={() => toast("Kriterler temizlendi", { kind: "info" })} className={btnLight}><RotateCcw className="w-3.5 h-3.5" /> Temizle</button>
                </div>
              </MSBPanel>
            )}

            {/* ═════ TERCİH YAP (2 panelli seçim) ═════ */}
            {view === "tercihYap" && (
              <TercihEkrani adayId="18878273464" />
            )}

            {/* ═════ ESKİ TERCİH YAP — kaldırıldı, referans için tutulmuyor ═════ */}
            {false && (
              <>
                <MSBPanel title="Aktif Başvurunuz">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      ["Alım Adı", "2026 Yılı Muvazzaf Subay Temini"],
                      ["Kuvvet", "Kara Kuvvetleri Komutanlığı"],
                      ["Başvuru Tarihi", "12.07.2026"],
                      ["Son Tercih Tarihi", "15.09.2026"],
                      ["Toplam Kontenjan", "450"],
                      ["Başvuru Durumu", "İncelemede"],
                    ].map(([l, v]) => (
                      <div key={l} className="flex items-center gap-3 py-1.5">
                        <span className="w-[160px] text-right text-[13px] text-[#555]">{l}</span>
                        <span className="text-[13.5px] text-[#222] font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </MSBPanel>

                <MSBPanel title="Tercih Listesi (Sürükleyerek Sıralayabilirsiniz)"
                  actions={<div className="flex gap-1.5"><button onClick={() => toast("Yeni tercih eklendi", { kind: "success" })} className={btnGhost}>+ Tercih Ekle</button><button onClick={() => toast("Tüm tercihler temizlendi", { kind: "warn" })} className={btnGhost}>Temizle</button></div>}>
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr style={{ background: MSB.redTable, color: "white" }} className="text-left">
                        <th className="px-3 py-2 font-semibold w-12">Sıra</th>
                        <th className="px-3 py-2 font-semibold">Sınıf / Branş</th>
                        <th className="px-3 py-2 font-semibold">Görev Yeri</th>
                        <th className="px-3 py-2 font-semibold w-24">Kontenjan</th>
                        <th className="px-3 py-2 font-semibold w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["1", "Muhabere Subayı", "Ankara / Genelkurmay", 12],
                        ["2", "Bilgisayar Müh. Subay", "İstanbul / TBMYO", 8],
                        ["3", "Elektronik Müh. Subay", "İzmir / Hava Kv. Karargahı", 6],
                        ["4", "Ulaştırma Subayı", "Kayseri / Ana Ulaş.", 10],
                      ].map(([s, br, gy, k], i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}>
                          <td className="px-3 py-2 border-b border-[#EEE] tabular-nums font-bold text-[#A82232]">{s}</td>
                          <td className="px-3 py-2 border-b border-[#EEE]">{br}</td>
                          <td className="px-3 py-2 border-b border-[#EEE] text-[#555]">{gy}</td>
                          <td className="px-3 py-2 border-b border-[#EEE] tabular-nums">{k}</td>
                          <td className="px-3 py-2 border-b border-[#EEE] text-right">
                            <button className="text-[#A82232] hover:underline text-[12px]">Kaldır</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#EEE]">
                    <button onClick={() => toast("Tercihleriniz kaydedildi", { kind: "success", sub: "4 tercih başarıyla sisteme aktarıldı" })} className={btnCls}><Check className="w-3.5 h-3.5" /> Tercihleri Kaydet</button>
                    <button className={btnLight}>Vazgeç</button>
                    <span className="ml-auto text-[12px] text-[#888]">Son kayıt: 03.08.2026 17:42</span>
                  </div>
                </MSBPanel>
              </>
            )}

            {/* ═════ TERCİHLERİM ═════ */}
            {view === "tercihlerim" && (
              <>
                <div className="flex items-start gap-2.5 mb-4">
                  <AlertCircle className="w-4 h-4 text-[#A82232] flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13.5px] font-bold" style={{ color: MSB.red }}>
                    Bu sayfa, sınava katılım aşamasındaki aktif tercihlerinizi gösterir. Yerleşmeye dair aktif tercihlerinizi duyurulardan takip ediniz.
                  </p>
                </div>
                <MSBPanel title="Başvurularım">
                  <div className="flex items-center gap-3">
                    <label className="w-[140px] text-right text-[13px] text-[#555]">Başvuru Seçiniz</label>
                    <select className={inputCls + " max-w-md"}>
                      <option>Seçiniz</option>
                      <option>2026 Yılı Muvazzaf Subay Temini</option>
                    </select>
                  </div>
                </MSBPanel>
              </>
            )}

          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#2C2C2C] text-white/70 text-[12.5px] text-center py-2.5 tracking-wide">
        &nbsp;|&nbsp;&nbsp;Milli Savunma Bakanlığı&nbsp;&nbsp;|&nbsp;&nbsp;Sürüm: 1.0.26212.1 - 31.07.2026&nbsp;&nbsp;|&nbsp;
      </footer>
    </div>
  );
}

// Placeholder used to keep legacy references stable — no-op

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN SWITCHER (demo navigation bar)
// ─────────────────────────────────────────────────────────────────────────────

function ScreenTabs({ active, onSwitch }: { active: Screen; onSwitch: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string }[] = [
    { id: "listings",      label: "① Güncel Teminler" },
    { id: "detail",        label: "② İlan Detay" },
    { id: "announcements", label: "③ Duyurular" },
    { id: "login",         label: "④ Giriş" },
    { id: "register",      label: "⑤ Kayıt (3 adım)" },
    { id: "forgot",        label: "⑥ Şifremi Unuttum" },
    { id: "edevlet",       label: "⑦ e-Devlet Girişi" },
    { id: "dashboard",     label: "⑧ Aday Dashboard" },
    { id: "aday-ocr",      label: "⑨ OCR Belge Yükle" },
    { id: "aday-sonuc",    label: "⑩ Yerleştirme Sonucu" },
    { id: "admin",         label: "⑪ Yönetici Konsolu" },
  ];
  return (
    <div className="bg-[#F8FAFC] border-b border-slate-200 shadow-[inset_0_-1px_0_rgba(0,0,0,0.04)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center gap-0 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pr-4 hidden sm:block border-r border-slate-200 mr-2 py-3 whitespace-nowrap">
          Demo Ekranları
        </span>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onSwitch(t.id)}
            className={`px-4 sm:px-5 py-3 text-[12px] font-semibold border-b-2 transition-all whitespace-nowrap ${active === t.id
              ? "border-[#C9A24B] text-[#0B2545]"
              : "border-transparent text-slate-400 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Compact demo switcher used inside auth/dashboard screens (fixed bottom-right)
function DemoSwitcher({ active, onSwitch }: { active: Screen; onSwitch: (s: Screen) => void }) {
  const [open, setOpen] = useState(false);
  const tabs: { id: Screen; label: string }[] = [
    { id: "listings",      label: "① Güncel Teminler" },
    { id: "detail",        label: "② İlan Detay" },
    { id: "announcements", label: "③ Duyurular" },
    { id: "login",         label: "④ Giriş" },
    { id: "register",      label: "⑤ Kayıt (3 adım)" },
    { id: "forgot",        label: "⑥ Şifremi Unuttum" },
    { id: "edevlet",       label: "⑦ e-Devlet Girişi" },
    { id: "dashboard",     label: "⑧ Aday Dashboard" },
    { id: "aday-ocr",      label: "⑨ OCR Belge Yükle" },
    { id: "aday-sonuc",    label: "⑩ Yerleştirme Sonucu" },
    { id: "admin",         label: "⑪ Yönetici Konsolu" },
  ];
  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      {open && (
        <div className="mb-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(11,37,69,0.25)] border border-slate-200 overflow-hidden w-[240px]">
          <div className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-[#F8FAFC]">
            Demo Ekranları
          </div>
          <div className="py-1.5">
            {tabs.map(t => (
              <button key={t.id} onClick={() => { onSwitch(t.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                  active === t.id ? "bg-[#0B2545]/[0.05] text-[#0B2545]" : "text-slate-600 hover:bg-slate-50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-[#0B2545] text-white shadow-[0_4px_20px_rgba(11,37,69,0.35)] hover:bg-[#0e2f5a] transition-all flex items-center justify-center">
        {open ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" strokeWidth={1.75} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL TOAST BUS
// ─────────────────────────────────────────────────────────────────────────────

type ToastKind = "success" | "info" | "warn" | "error";
type ToastItem = { id: number; msg: string; kind: ToastKind; sub?: string };
let toastFn: ((msg: string, opts?: { kind?: ToastKind; sub?: string }) => void) | null = null;
function toast(msg: string, opts?: { kind?: ToastKind; sub?: string }) { toastFn?.(msg, opts); }
function scrollToId(id: string) {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ToastHost({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const kindStyle: Record<ToastKind, { bg: string; border: string; icon: React.ReactNode }> = {
    success: { bg: "bg-white",    border: "border-l-[#7BA05B]", icon: <CheckCircle2 className="w-5 h-5 text-[#7BA05B]" strokeWidth={2} /> },
    info:    { bg: "bg-white",    border: "border-l-[#4A6FA5]", icon: <Info className="w-5 h-5 text-[#4A6FA5]" strokeWidth={2} /> },
    warn:    { bg: "bg-white",    border: "border-l-[#C87E27]", icon: <AlertCircle className="w-5 h-5 text-[#C87E27]" strokeWidth={2} /> },
    error:   { bg: "bg-white",    border: "border-l-[#A82232]", icon: <AlertCircle className="w-5 h-5 text-[#A82232]" strokeWidth={2} /> },
  };
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-[380px] pointer-events-none" style={{ fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif" }}>
      {toasts.map(t => {
        const s = kindStyle[t.kind];
        return (
          <div key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 ${s.bg} border border-[#DDDDDD] ${s.border} border-l-[4px] rounded-[3px] shadow-[0_6px_24px_rgba(0,0,0,0.15)] min-w-[280px]`}>
            <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#222] leading-snug">{t.msg}</p>
              {t.sub && <p className="text-[11.5px] text-[#666] mt-0.5 leading-snug">{t.sub}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="text-[#AAA] hover:text-[#333] p-0.5 flex-shrink-0">
              <X className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("listings");
  const [aktifDuyuruId, setAktifDuyuruId] = useState<string>("D-001");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastFn = (msg, opts) => {
      const id = Date.now() + Math.random();
      const item: ToastItem = { id, msg, kind: opts?.kind || "success", sub: opts?.sub };
      setToasts(t => [...t, item]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
    };
    // Handle e-Devlet callback (?edevlet_callback=1) — user returned from turkiye.gov.tr
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("edevlet_callback") === "1") {
        setScreen("dashboard");
        setTimeout(() => toastFn?.("e-Devlet doğrulaması başarılı", { kind: "success", sub: "Aday paneline hoş geldiniz" }), 300);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    return () => { toastFn = null; };
  }, []);

  // Auto-scroll to top on screen change
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [screen]);

  const isPublic = screen === "listings" || screen === "detail" || screen === "announcements";

  return (
    <div className="min-h-screen bg-[#FDFDFC]" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {isPublic && (
        <>
          <Header activeScreen={screen} onNav={setScreen} />
          <ScreenTabs active={screen} onSwitch={setScreen} />
        </>
      )}

      {screen === "listings"      && <Screen1 onDetail={() => setScreen("detail")} onNav={setScreen} onDuyuru={(id) => { setAktifDuyuruId(id); setScreen("duyuru-detay"); }} />}
      {screen === "detail"        && <Screen2 onBack={() => setScreen("listings")} />}
      {screen === "announcements" && <Screen3 onDuyuru={(id) => { setAktifDuyuruId(id); setScreen("duyuru-detay"); }} />}
      {screen === "duyuru-detay"  && <DuyuruDetay duyuruId={aktifDuyuruId} onBack={() => setScreen("announcements")} />}
      {screen === "login"    && <LoginScreen    onHome={() => setScreen("listings")} onRegister={() => setScreen("register")} onForgot={() => setScreen("forgot")} onDashboard={() => setScreen("dashboard")} onEdevlet={() => setScreen("edevlet")} onAdmin={() => setScreen("admin")} />}
      {screen === "register" && <RegisterScreen onHome={() => setScreen("listings")} onLogin={() => setScreen("login")} onDashboard={() => setScreen("dashboard")} />}
      {screen === "forgot"   && <ForgotScreen   onHome={() => setScreen("listings")} onLogin={() => setScreen("login")} />}
      {screen === "edevlet"  && <EDevletScreen  onCancel={() => setScreen("login")} onSuccess={() => setScreen("dashboard")} />}
      {screen === "dashboard"&& <DashboardScreen onLogout={() => setScreen("login")} onOcr={() => setScreen("aday-ocr")} onSonuc={() => setScreen("aday-sonuc")} />}
      {screen === "admin"       && <AdminScreen  onLogout={() => setScreen("login")} />}
      {screen === "aday-ocr"    && <OcrYukle     onBack={() => setScreen("dashboard")} />}
      {screen === "aday-sonuc"  && <SonucEkrani  onBack={() => setScreen("dashboard")} />}

      {!isPublic && <DemoSwitcher active={screen} onSwitch={setScreen} />}

      <ToastHost toasts={toasts} onDismiss={id => setToasts(t => t.filter(x => x.id !== id))} />
    </div>
  );
}
