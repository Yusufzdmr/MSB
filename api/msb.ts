// Vercel serverless endpoint: personeltemin.msb.gov.tr'den güncel teminler
// ve duyuruları scrape eder, JSON döner. 30 dakika cache'lenir.

type Item = {
  title: string;
  date?: string;
  category?: string;
  href?: string;
  summary?: string;
};

// HTML entity decode + whitespace normalize
const clean = (s: string): string =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Best-effort parser — MSB HTML sometimes changes; if empty we fall back to static.
function parseMsb(html: string): { teminler: Item[]; duyurular: Item[] } {
  const teminler: Item[] = [];
  const duyurular: Item[] = [];

  // Try to find blocks marked "TEMİN" or announcement-like patterns
  // Strategy: extract all <a href=...>...</a> that look like content links,
  // then classify by nearby date pattern (DD.MM.YYYY).
  const linkRe =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]{0,220}?(\d{2}\.\d{2}\.\d{4})/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const text = clean(m[2]);
    const date = m[3];
    if (!text || text.length < 20) continue;
    const key = text.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);

    const item: Item = { title: text, date, href };

    const upper = text.toUpperCase();
    const isTemin =
      upper.includes("TEMİN") ||
      upper.includes("ALIM") ||
      upper.includes("KONTENJAN");
    const isDuyuru =
      upper.includes("DUYURU") ||
      upper.includes("SONUÇ") ||
      upper.includes("SINAV") ||
      upper.includes("YERLEŞTİRME") ||
      upper.includes("SONUCU");

    if (isTemin && teminler.length < 8) {
      item.category = "Temin";
      teminler.push(item);
    } else if (isDuyuru && duyurular.length < 12) {
      item.category = upper.includes("SONUÇ") || upper.includes("SONUCU")
        ? "Sonuç"
        : upper.includes("SINAV")
        ? "Sınav"
        : upper.includes("YERLEŞTİRME")
        ? "Yerleştirme"
        : "Duyuru";
      duyurular.push(item);
    } else if (teminler.length < 8 && !isDuyuru) {
      item.category = "Temin";
      teminler.push(item);
    } else if (duyurular.length < 12) {
      item.category = "Duyuru";
      duyurular.push(item);
    }
  }

  return { teminler, duyurular };
}

// Static fallback — only used when scrape yields nothing.
const FALLBACK = {
  teminler: [
    {
      title:
        "KARA, DENİZ VE HAVA KUVVETLERİ KOMUTANLIKLARINA 2026 YILI TEKNİK SINIF UZMAN ERBAŞ TEMİNİ",
      date: "24.07.2026",
      category: "Temin",
      href: "https://personeltemin.msb.gov.tr",
    },
    {
      title: "MİLLÎ SAVUNMA ÜNİVERSİTESİ 2026 YILI ÖĞRENCİ ALIMI DUYURUSU",
      date: "22.07.2026",
      category: "Temin",
      href: "https://personeltemin.msb.gov.tr",
    },
    {
      title:
        "MİLLÎ SAVUNMA BAKANLIĞI 2026 YILI SİVİL MEMUR ALIMI — BT & MÜHENDİSLİK",
      date: "20.07.2026",
      category: "Temin",
      href: "https://personeltemin.msb.gov.tr",
    },
  ],
  duyurular: [
    {
      title: "2026/2 Sözleşmeli Er Yerleştirme Sonuçları Açıklandı",
      date: "31.07.2026",
      category: "Yerleştirme",
    },
    {
      title: "Muvazzaf Subay Temini Mülakat Tarihleri Güncellendi",
      date: "28.07.2026",
      category: "Sınav",
    },
    {
      title: "OCR ile Belge Yükleme Kılavuzu Güncellendi",
      date: "22.07.2026",
      category: "Duyuru",
    },
    {
      title: "Astsubay Meslek YO Giriş Sınavı Sonuçları Yayımlandı",
      date: "18.07.2026",
      category: "Sonuç",
    },
  ],
};

// Try multiple sources in order — first one that yields data wins.
const SOURCES = [
  "https://personeltemin.msb.gov.tr/",
  "https://www.msb.gov.tr/SlaytHaber/",
  "https://www.msb.gov.tr/",
  // Google cache fallback if MSB blocks (best-effort)
  "https://webcache.googleusercontent.com/search?q=cache:personeltemin.msb.gov.tr",
];

const UA_POOL = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
];

export default async function handler(_req: Request): Promise<Response> {
  let source: "live" | "fallback" = "fallback";
  let parsed = FALLBACK;
  const errors: string[] = [];
  let usedTarget = SOURCES[0];

  for (const target of SOURCES) {
    try {
      const ua = UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
      const res = await fetch(target, {
        headers: {
          "User-Agent": ua,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
          "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });
      if (!res.ok) { errors.push(`${target}: HTTP ${res.status}`); continue; }
      const html = await res.text();
      const scraped = parseMsb(html);
      if (scraped.teminler.length + scraped.duyurular.length >= 2) {
        parsed = {
          teminler: scraped.teminler.length ? scraped.teminler : FALLBACK.teminler,
          duyurular: scraped.duyurular.length ? scraped.duyurular : FALLBACK.duyurular,
        };
        source = "live";
        usedTarget = target;
        break;
      } else {
        errors.push(`${target}: parse yield ${scraped.teminler.length + scraped.duyurular.length}`);
      }
    } catch (e) {
      errors.push(`${target}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const target = usedTarget;
  const fetchError = errors.length && source === "fallback" ? errors.join(" · ") : null;

  return new Response(
    JSON.stringify({
      source,
      fetchedAt: new Date().toISOString(),
      target,
      error: fetchError,
      counts: {
        teminler: parsed.teminler.length,
        duyurular: parsed.duyurular.length,
      },
      ...parsed,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        // 30 minute edge cache to be gentle on MSB
        "cache-control":
          "public, s-maxage=1800, stale-while-revalidate=3600",
        "access-control-allow-origin": "*",
      },
    }
  );
}

export const config = { runtime: "edge" };
