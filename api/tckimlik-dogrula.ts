// Vercel serverless endpoint: NVİ (Nüfus ve Vatandaşlık İşleri) resmi
// TCKN doğrulama servisine bağlanır. TCKN + Ad + Soyad + DoğumYılı verilerini
// doğrular, bulunursa true, bulunmazsa false döner.
//
// NOT: KPS servisi yalnızca doğrulama yapar; kişisel bilgi çekmez (KVKK).
// Gerçek MERNIS/KPS entegrasyonu için kurum sözleşmesi gerekir.
//
// Servis: https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx (SOAP 1.1)
// Metod: TCKimlikNoDogrula

type Body = {
  tckimlikNo: string;
  ad: string;
  soyad: string;
  dogumYili: number;
};

type ApiResponse = {
  ok: boolean;
  dogrulandi?: boolean;
  hata?: string;
  detay?: {
    tckimlikNo: string;
    ad: string;
    soyad: string;
    dogumYili: number;
  };
};

// TCKN algoritmik geçerlilik kontrolü (10. ve 11. hane checksum)
function tcknGecerli(tc: string): boolean {
  if (!/^[1-9]\d{10}$/.test(tc)) return false;
  const d = tc.split("").map(Number);
  const oddSum  = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const check10 = ((oddSum * 7) - evenSum) % 10;
  if (check10 !== d[9]) return false;
  const sumFirst10 = d.slice(0, 10).reduce((a, b) => a + b, 0);
  if (sumFirst10 % 10 !== d[10]) return false;
  return true;
}

// XML özel karakter escape (SOAP body içine güvenli yerleştirmek için)
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false, hata: "Yalnızca POST" }); return; }

  try {
    const body: Body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { tckimlikNo, ad, soyad, dogumYili } = body ?? {};

    // Alan doğrulaması
    if (!tckimlikNo || !ad || !soyad || !dogumYili) {
      res.status(400).json({ ok: false, hata: "Eksik alanlar. TCKN, Ad, Soyad ve Doğum Yılı zorunludur." } satisfies ApiResponse);
      return;
    }
    if (!tcknGecerli(tckimlikNo)) {
      res.status(400).json({ ok: false, hata: "Girilen TCKN algoritmik olarak geçersiz." } satisfies ApiResponse);
      return;
    }
    const yy = Number(dogumYili);
    if (!Number.isInteger(yy) || yy < 1900 || yy > new Date().getFullYear()) {
      res.status(400).json({ ok: false, hata: "Doğum yılı geçersiz." } satisfies ApiResponse);
      return;
    }

    // NVİ isimleri BÜYÜK harfle bekler, TR locale
    const adUp    = String(ad).toLocaleUpperCase("tr").trim();
    const soyadUp = String(soyad).toLocaleUpperCase("tr").trim();

    const soap = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
      <TCKimlikNo>${xmlEscape(tckimlikNo)}</TCKimlikNo>
      <Ad>${xmlEscape(adUp)}</Ad>
      <Soyad>${xmlEscape(soyadUp)}</Soyad>
      <DogumYili>${yy}</DogumYili>
    </TCKimlikNoDogrula>
  </soap:Body>
</soap:Envelope>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let dogrulandi = false;
    try {
      const upstream = await fetch("https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "SOAPAction": "http://tckimlik.nvi.gov.tr/WS/TCKimlikNoDogrula",
        },
        body: soap,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const xml = await upstream.text();
      // <TCKimlikNoDogrulaResult>true|false</TCKimlikNoDogrulaResult>
      const m = xml.match(/<TCKimlikNoDogrulaResult>(true|false)<\/TCKimlikNoDogrulaResult>/i);
      dogrulandi = m?.[1]?.toLowerCase() === "true";
    } catch (upstreamErr: any) {
      clearTimeout(timeoutId);
      // NVİ down / timeout — 502
      res.status(502).json({
        ok: false,
        hata: `NVİ servisine erişilemiyor: ${upstreamErr?.message ?? "timeout"}. Lütfen tekrar deneyin.`,
      } satisfies ApiResponse);
      return;
    }

    const response: ApiResponse = {
      ok: true,
      dogrulandi,
      detay: { tckimlikNo, ad: adUp, soyad: soyadUp, dogumYili: yy },
    };
    // Cache 30 saniye — sık sık aynı istek gelmesin
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({ ok: false, hata: err?.message ?? "Bilinmeyen hata" } satisfies ApiResponse);
  }
}
