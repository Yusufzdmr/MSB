// Admin + aday panelleri arasında paylaşılan küçük UI parçaları.
// Mevcut MSB estetiğini korumak için ham Tailwind + inline stil kullanıyoruz.

import React from "react";
import { MSB } from "./theme";

export function StatCard({ label, value, hint, tone = "red", icon }: {
  label: string; value: React.ReactNode; hint?: React.ReactNode;
  tone?: "red" | "green" | "gold" | "navy" | "muted";
  icon?: React.ReactNode;
}) {
  const toneMap = {
    red:   { bar: MSB.red,      text: MSB.red      },
    green: { bar: MSB.green,    text: MSB.greenDark },
    gold:  { bar: MSB.gold,     text: MSB.orange   },
    navy:  { bar: MSB.navy,     text: MSB.navy     },
    muted: { bar: "#999",       text: "#555"       },
  } as const;
  const t = toneMap[tone];
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[4px] px-4 py-3.5 flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: t.bar }} />
      {icon && <div className="mt-0.5" style={{ color: t.text }}>{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888]">{label}</div>
        <div className="text-[24px] font-extrabold leading-tight mt-0.5 tabular-nums" style={{ color: t.text }}>{value}</div>
        {hint && <div className="text-[11.5px] text-[#888] mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}

export function Section({ title, actions, children, dense = false }: {
  title: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; dense?: boolean;
}) {
  return (
    <section className="bg-white border border-[#E0E0E0] rounded-[4px] mb-4">
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-[#EAEAEA]">
        <div className="w-1 h-4 rounded-full" style={{ background: MSB.red }} />
        <h3 className="text-[13.5px] font-extrabold tracking-tight" style={{ color: MSB.red }}>{title}</h3>
        <div className="ml-auto flex items-center gap-1.5">{actions}</div>
      </header>
      <div className={dense ? "" : "p-4"}>{children}</div>
    </section>
  );
}

export function Pill({ children, tone = "muted" }: {
  children: React.ReactNode;
  tone?: "muted" | "success" | "warn" | "danger" | "info" | "red";
}) {
  const map = {
    muted:   { bg: "#F5F5F5", brd: "#DDD",     fg: "#555" },
    success: { bg: "#EEF6E8", brd: "#C7DDB0",  fg: MSB.greenDark },
    warn:    { bg: MSB.warnBg, brd: MSB.warnBrd, fg: MSB.orange   },
    danger:  { bg: "#FBECEE", brd: "#E8B5BB",  fg: MSB.red      },
    info:    { bg: MSB.infoBg, brd: MSB.infoBrd, fg: MSB.infoText },
    red:     { bg: MSB.red,   brd: MSB.redDark, fg: "#fff"       },
  } as const;
  const t = map[tone];
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-widest rounded-[3px] border"
      style={{ background: t.bg, borderColor: t.brd, color: t.fg }}>
      {children}
    </span>
  );
}

export function Btn({ children, variant = "primary", size = "md", className = "", ...rest }: {
  variant?: "primary" | "ghost" | "light" | "danger" | "success";
  size?: "sm" | "md";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizeCls = size === "sm" ? "h-[26px] text-[11.5px] px-2.5" : "h-[32px] text-[12.5px] px-3.5";
  const variantMap = {
    primary: { bg: MSB.red, brd: MSB.redDark, fg: "#fff", hover: MSB.redHover },
    ghost:   { bg: "transparent", brd: "#DDD", fg: MSB.ink, hover: "#F5F5F5" },
    light:   { bg: "#F8F8F8", brd: "#DDD", fg: MSB.ink, hover: "#EEE" },
    danger:  { bg: "#fff", brd: MSB.red, fg: MSB.red, hover: "#FBECEE" },
    success: { bg: MSB.green, brd: MSB.greenDark, fg: "#fff", hover: MSB.greenDark },
  } as const;
  const v = variantMap[variant];
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-[3px] border font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${className}`}
      style={{
        background: v.bg, borderColor: v.brd, color: v.fg,
        // hover via onMouseEnter for inline consistency; Tailwind hover: hard here because bg is inline
      }}
      onMouseEnter={e => { if (!rest.disabled) (e.currentTarget as HTMLButtonElement).style.background = v.hover; }}
      onMouseLeave={e => { if (!rest.disabled) (e.currentTarget as HTMLButtonElement).style.background = v.bg; }}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, required = false, hint }: {
  label: React.ReactNode; children: React.ReactNode; required?: boolean; hint?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-bold text-[#555] mb-1 uppercase tracking-wide">
        {label} {required && <span className="text-[#A82232]">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-[#888] mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full h-[34px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20 transition-colors";

export const selectCls = inputCls + " appearance-none pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22><path fill=%22%23888%22 d=%22M5 6L0 0h10z%22/></svg>')] bg-no-repeat bg-[right_10px_center]";

export const textareaCls =
  "w-full px-3 py-2 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20 transition-colors resize-y min-h-[80px]";

export function Modal({ open, onClose, title, children, size = "md", footer }: {
  open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl"; footer?: React.ReactNode;
}) {
  if (!open) return null;
  const w = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size];
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className={`relative bg-white rounded-[4px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full ${w} max-h-[92vh] flex flex-col`}>
        <header className="flex items-center gap-3 px-5 h-[52px] border-b border-[#DDDDDD] flex-shrink-0" style={{ background: MSB.red, color: "#fff" }}>
          <span className="w-2 h-2 rounded-full bg-white/80" />
          <h2 className="text-[14px] font-extrabold uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="ml-auto text-white/85 hover:text-white p-1" aria-label="Kapat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </header>
        <div className="flex-1 overflow-auto p-5">{children}</div>
        {footer && <footer className="px-5 py-3 border-t border-[#DDDDDD] flex items-center justify-end gap-2 bg-[#FAFAFA] flex-shrink-0">{footer}</footer>}
      </div>
    </div>
  );
}

export function DataTable<T>({ columns, rows, empty = "Kayıt yok", onRowClick, dense = false }: {
  columns: { key: string; header: React.ReactNode; render: (row: T) => React.ReactNode; width?: string; align?: "left" | "right" | "center" }[];
  rows: T[];
  empty?: React.ReactNode;
  onRowClick?: (row: T) => void;
  dense?: boolean;
}) {
  const cellPad = dense ? "px-2.5 py-1.5" : "px-3 py-2.5";
  return (
    <div className="border border-[#E0E0E0] rounded-[3px] overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: MSB.redTable }}>
              {columns.map(c => (
                <th key={c.key} className={`text-white font-bold uppercase tracking-wide text-[10.5px] ${cellPad}`}
                    style={{ width: c.width, textAlign: c.align ?? "left" }}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center text-[#888] py-8 text-[12.5px]">{empty}</td></tr>
            ) : rows.map((row, i) => (
              <tr key={i}
                className={`${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"} ${onRowClick ? "cursor-pointer hover:bg-[#FBECEE]" : ""} border-t border-[#EFEFEF]`}
                onClick={() => onRowClick?.(row)}>
                {columns.map(c => (
                  <td key={c.key} className={cellPad} style={{ textAlign: c.align ?? "left" }}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// TR tarih formatı
export function trTarih(iso?: string, saat = false): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const gg = String(d.getDate()).padStart(2, "0");
  const aylar = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
  const ay = aylar[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return saat ? `${gg} ${ay} ${yyyy} ${hh}:${mm}` : `${gg} ${ay} ${yyyy}`;
}

export function maskTC(tc: string): string {
  if (!tc || tc.length < 11) return tc;
  return `${tc.slice(0, 3)}•••••${tc.slice(-3)}`;
}
