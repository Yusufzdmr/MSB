// Duyuru Detay — Referans 4 birebir: başlık, dosya ekleri, SONUÇ SORGULA (TCKN+Captcha), SONUÇ LİSTESİ.

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Download, RotateCw, Search, X, FileText, AlertCircle, Info, Trophy, CheckCircle2, Clock, CreditCard, XCircle } from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore, type Duyuru, type DuyuruSonucKayit } from "../shared/store";

const inp = "w-full h-[36px] px-3 text-[13px] bg-white border border-[#CCCCCC] rounded-[3px] focus:outline-none focus:border-[#A82232] focus:ring-1 focus:ring-[#A82232]/20";
const lbl = "block text-[12px] font-bold text-[#555] mb-1.5 uppercase tracking-wide";
const btnDrk = "inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold text-white bg-[#4A4A4A] hover:bg-[#333] rounded-[3px]";
const btnLgt = "inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold text-[#333] bg-white hover:bg-[#F5F5F5] border border-[#CCCCCC] rounded-[3px]";

// Basit captcha üretici
function generateCaptcha(): string {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

export default function DuyuruDetay({ duyuruId, onBack }: { duyuruId: string; onBack: () => void }) {
  const duyuru = useStore(s => s.duyurular.find(d => d.id === duyuruId)) as Duyuru | undefined;
  const basvurular = useStore(s => s.basvurular);
  const ilanlar = useStore(s => s.ilanlar);
  const [tc, setTc] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [sonucGosterilen, setSonucGosterilen] = useState<DuyuruSonucKayit | "notfound" | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => { setSonucGosterilen(null); setHata(null); }, [duyuruId]);

  if (!duyuru) {
    return (
      <div className="max-w-[1200px] mx-auto p-8">
        <button className={btnLgt + " mb-4"} onClick={onBack}><ArrowLeft className="w-3.5 h-3.5" /> Duyurulara Dön</button>
        <div className="p-8 text-center bg-white border rounded">Duyuru bulunamadı.</div>
      </div>
    );
  }

  const sorgula = () => {
    setHata(null);
    if (!/^\d{11}$/.test(tc)) { setHata("Geçerli bir 11 haneli TC Kimlik No giriniz."); return; }
    if (captchaInput.toUpperCase() !== captcha) { setHata("Güvenlik kodu hatalı. Lütfen tekrar deneyin."); setCaptcha(generateCaptcha()); setCaptchaInput(""); return; }
    const bulunan = duyuru.sonuclar?.find(r => r.tc === tc);
    setSonucGosterilen(bulunan ?? "notfound");
  };

  const yenile = () => {
    setTc(""); setCaptchaInput(""); setCaptcha(generateCaptcha()); setSonucGosterilen(null); setHata(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-6">
      <button className={btnLgt + " mb-4"} onClick={onBack}><ArrowLeft className="w-3.5 h-3.5" /> Duyurulara Dön</button>

      {/* ═══ BAŞLIK ═══ */}
      <div className="bg-white border border-[#DDDDDD] rounded p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          {duyuru.onemli && <span className="px-2 py-0.5 bg-[#FBECEE] text-[#A82232] text-[10.5px] font-bold rounded uppercase tracking-wider">ÖNEMLİ</span>}
          <span className="px-2 py-0.5 bg-[#F5F5F5] text-[#666] text-[10.5px] font-bold rounded uppercase tracking-wider">{duyuru.kategori}</span>
          <span className="text-[11px] text-[#888] ml-auto">{new Date(duyuru.yayinTarihi).toLocaleDateString("tr-TR")}</span>
        </div>
        <h1 className="text-[22px] font-extrabold text-[#333] leading-tight mb-2">{duyuru.baslik}</h1>
        <p className="text-[13.5px] text-[#555]">{duyuru.ozet}</p>
      </div>

      {/* ═══ YÖNLENDİRİCİ KURALLAR — sadece sonuç sorgulama aktifse ═══ */}
      {duyuru.sonucSorgulamaAktif && (
        <div className="bg-white border border-[#DDDDDD] rounded p-5 mb-4">
          <ol className="text-[13px] text-[#333] space-y-1.5 list-decimal ml-5">
            <li>Sonucunuzu görebilmek için aşağıda yer alan <strong>Sonuç Sorgula</strong> alanına TC Kimlik numaranız ile giriş yapmalısınız.</li>
            <li>Taban puanlar ve genel kılavuz/tablo ekleri için aşağıdaki <strong>"Duyuruya İlişkin Dosyalar"</strong> bölümünden ilgili PDF/Excel'i indirebilirsiniz.</li>
          </ol>
        </div>
      )}

      {/* ═══ İÇERİK METNİ (HTML render — numaralı maddeler, tablo vb.) ═══ */}
      {duyuru.icerik && (
        <div className="bg-white border border-[#DDDDDD] rounded p-6 mb-4">
          <div className="text-[13.5px] text-[#333] leading-[1.75] whitespace-pre-line prose-sm max-w-none"
            style={{ fontFamily: "'DM Sans', 'Segoe UI', Arial, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: duyuru.icerik }} />
        </div>
      )}

      {/* ═══ BAŞVURU YAP butonu — ilanId varsa (başvuru duyurusu) ═══ */}
      {duyuru.ilanId && !duyuru.sonucSorgulamaAktif && (
        <div className="bg-[#FBECEE] border-l-4 border-[#A82232] p-4 mb-4 flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-[#A82232] mb-0.5">Başvuru yapmak için tıklayınız</h3>
            <p className="text-[12.5px] text-[#666]">Bu duyuruya ait ilana e-Devlet üzerinden giriş yaparak başvurabilirsiniz.</p>
          </div>
          <button
            onClick={() => alert("Giriş ekranına yönlendiriliyorsunuz — e-Devlet ile giriş yapıp Tercih ekranından başvurunuzu tamamlayınız.")}
            className="inline-flex items-center gap-2 h-[40px] px-5 text-[13.5px] font-bold text-white rounded-[3px] shadow"
            style={{ background: MSB.red }}>
            <FileText className="w-4 h-4" /> Başvuru Yapmak İçin Tıklayınız
          </button>
        </div>
      )}

      {/* ═══ DUYURUYA İLİŞKİN DOSYALAR ═══ */}
      <div className="bg-white border border-[#DDDDDD] rounded mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-[#F5F5F5]">
          <FileText className="w-3.5 h-3.5 text-[#A82232]" />
          <h2 className="text-[13.5px] font-bold text-[#555] uppercase tracking-wide">Duyuruya İlişkin Dosyalar</h2>
        </div>
        <div className="p-4">
          {!duyuru.ekler || duyuru.ekler.length === 0 ? (
            <div className="text-[13px] text-[#888] italic text-center py-4">Ek dosya bulunmamaktadır.</div>
          ) : (
            <ul className="divide-y divide-[#EEE]">
              {duyuru.ekler.map((ek, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <FileText className="w-5 h-5 text-[#A82232] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#333] truncate">{ek.ad}</div>
                    <div className="text-[11px] text-[#888]">{ek.boyutKB} KB · PDF/Excel</div>
                  </div>
                  <button className="inline-flex items-center gap-2 h-[32px] px-3 text-[12px] font-bold text-white bg-[#A82232] hover:bg-[#8B1A25] rounded-[3px]"
                    onClick={() => {
                      const icerik = `${duyuru.baslik}\n\n[Ek Belge: ${ek.ad}]\n\nBu ek belge Personel Temin Dairesi Başkanlığı tarafından yayımlanmıştır.\n\nİndirme Tarihi: ${new Date().toLocaleString("tr-TR")}\n`;
                      const blob = new Blob([icerik], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = ek.ad.replace(/\.(pdf|xlsx?|docx?)$/i, ".txt");
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}>
                    <Download className="w-3.5 h-3.5" /> İndirmek için tıklayınız
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ═══ SONUÇ SORGULA ═══ */}
      {duyuru.sonucSorgulamaAktif && (
        <div className="bg-white border border-[#DDDDDD] rounded mb-4">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-[#F5F5F5]">
            <Search className="w-3.5 h-3.5 text-[#A82232]" />
            <h2 className="text-[13.5px] font-bold text-[#555] uppercase tracking-wide">Sonuç Sorgula</h2>
          </div>
          <div className="p-5 max-w-2xl">
            {hata && (
              <div className="mb-3 p-2.5 rounded border" style={{ background: "#FBECEE", borderColor: "#E8B5BB", color: MSB.red }}>
                <div className="flex items-center gap-2 text-[12.5px] font-semibold">
                  <AlertCircle className="w-4 h-4" /> {hata}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={lbl}>T.C. Kimlik No <span className="text-[#A82232]">*</span></label>
                <input className={inp} value={tc} maxLength={11}
                  onChange={e => setTc(e.target.value.replace(/\D/g, ""))} placeholder="11 haneli TC Kimlik" />
              </div>
              <div>
                <label className={lbl}>Güvenlik Kodu <span className="text-[#A82232]">*</span></label>
                <div className="flex items-center gap-2">
                  <input className={inp} value={captchaInput} onChange={e => setCaptchaInput(e.target.value.toUpperCase())} placeholder="Yandaki kodu giriniz" />
                  <div className="h-[36px] px-3 flex items-center bg-gradient-to-br from-[#F5E7E9] to-[#F0DCE0] border border-[#E8B5BB] rounded-[3px] font-mono text-[15px] font-black tracking-[0.35em] text-[#8B1A25] italic select-none"
                    style={{ transform: "skewX(-6deg)", textDecoration: "line-through", textDecorationStyle: "wavy", textDecorationColor: "rgba(139,26,37,0.4)" }}>
                    {captcha}
                  </div>
                  <button onClick={() => setCaptcha(generateCaptcha())} className="w-[36px] h-[36px] flex items-center justify-center bg-[#4A6FA5] hover:bg-[#365688] text-white rounded-[3px]" title="Yenile">
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className={btnDrk} style={{ background: MSB.red, borderColor: MSB.redDark }} onClick={sorgula}>
                <Search className="w-3.5 h-3.5" /> Sorgula
              </button>
              <button className={btnLgt} onClick={yenile}>
                <X className="w-3.5 h-3.5" /> Temizle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SONUÇ LİSTESİ ═══ */}
      {sonucGosterilen !== null && (
        <div className="bg-white border border-[#DDDDDD] rounded mb-4">
          <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[#F5F5F5]">
            <h2 className="text-[13.5px] font-bold text-[#555] uppercase tracking-wide">Sonuç Listesi</h2>
            <button className="text-[#888] hover:text-[#333] text-[16px]">−</button>
          </div>
          {sonucGosterilen === "notfound" ? (
            <div className="p-6">
              <div className="p-4 rounded border" style={{ background: MSB.warnBg, borderColor: MSB.warnBrd, color: MSB.orange }}>
                <div className="flex items-center gap-2 text-[13px] font-semibold">
                  <Info className="w-4 h-4" /> Bu TC Kimlik Numarası bu duyuru için sistemde bulunamadı.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              {/* Üst özet kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="border border-[#DDD] rounded p-3">
                  <div className="text-[10.5px] font-bold text-[#888] uppercase tracking-widest mb-1">T.C. Kimlik No</div>
                  <div className="text-[15px] font-bold text-[#333] tabular-nums">{sonucGosterilen.tc.slice(0, 3)}******{sonucGosterilen.tc.slice(-2)}</div>
                </div>
                <div className="border border-[#DDD] rounded p-3">
                  <div className="text-[10.5px] font-bold text-[#888] uppercase tracking-widest mb-1">Adı Soyadı</div>
                  <div className="text-[15px] font-bold text-[#333]">{sonucGosterilen.ad} {sonucGosterilen.soyad}</div>
                </div>
                <div className="border border-[#DDD] rounded p-3">
                  <div className="text-[10.5px] font-bold text-[#888] uppercase tracking-widest mb-1">Sınav / Temin Adı</div>
                  <div className="text-[13px] font-bold text-[#333] leading-tight">{duyuru.baslik}</div>
                </div>
              </div>

              {/* Ödeme Durumu (yeni) */}
              {(() => {
                const bsv = basvurular.find(b => b.adayId === sonucGosterilen.tc && (b.ilanId === duyuru.ilanId || (duyuru.ilanId === undefined && b.durum === "yerlestirildi")));
                const ilan = bsv ? ilanlar.find(i => i.id === bsv.ilanId) : null;
                if (!bsv || !ilan?.odemeKurali || ilan.odemeKurali === "yok") return null;
                let bg = "#F5F5F5", brd = "#DDD", fg = "#666", label = "", icon: React.ReactNode = null, extra: React.ReactNode = null;
                if (sonucGosterilen.statu === "Yedek") {
                  bg = "#DBEAF5"; brd = "#B6C7DE"; fg = "#1F5372"; label = "🔵 Yedek Listede Bekliyor (Ücret Gerekmiyor)"; icon = <Clock className="w-5 h-5" />;
                  extra = <div className="text-[11.5px] mt-1 opacity-90">Sıranız asil listeye yükselene kadar herhangi bir ödeme yapmanız gerekmemektedir. Yerleştirmede sıranız geldiğinde bilgilendirileceksiniz.</div>;
                } else if (bsv.odemeDurumu === "alindi") {
                  bg = "#EEF6E8"; brd = "#C7DDB0"; fg = "#5E7F42"; label = "🟢 Ödeme Onaylandı / Aktif Aday"; icon = <CheckCircle2 className="w-5 h-5" />;
                } else if (bsv.odemeDurumu === "iptal") {
                  bg = "#FBECEE"; brd = "#E8B5BB"; fg = MSB.red; label = "🔴 Ödeme Süresi Aşımı — Hak İptal Edildi"; icon = <XCircle className="w-5 h-5" />;
                  extra = <div className="text-[11.5px] mt-1 opacity-90">Tanınan süre içinde ödeme yapılmadığı/dekont onaylanmadığı için hakkınız düşürülmüş ve sıradaki yedeğe devredilmiştir.</div>;
                } else {
                  bg = MSB.warnBg; brd = MSB.warnBrd; fg = MSB.orange; label = "🟡 Ödeme Bekleniyor";
                  icon = <CreditCard className="w-5 h-5" />;
                  extra = <div className="mt-2 space-y-1 text-[12px]">
                    <div>• <strong>IBAN</strong>: <span className="font-mono">{ilan.banka?.iban ?? "TR33 0006 1005 1978 6457 8413 26"}</span></div>
                    <div>• <strong>Referans Kodu</strong>: <span className="font-mono">{bsv.referansKodu ?? "—"}</span></div>
                    <div>• <strong>Tutar</strong>: {ilan.ucretTutari} TL</div>
                    <div>• <strong>Kalan Süre</strong>: {ilan.odemeVadeSaat ?? 48} saat</div>
                  </div>;
                }
                return (
                  <div className="mb-4 p-4 rounded border-l-4" style={{ background: bg, borderColor: brd, borderLeftColor: fg, color: fg }}>
                    <div className="flex items-start gap-3">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold uppercase mb-1">{label}</div>
                        {extra}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Gerekçe uyarısı */}
              {sonucGosterilen.gerekce && (
                <div className="mb-4 p-3.5 rounded border" style={{ background: "#FBECEE", borderColor: "#E8B5BB", color: MSB.red }}>
                  <div className="flex items-start gap-2 text-[13px] font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>{sonucGosterilen.gerekce}</div>
                  </div>
                </div>
              )}

              {/* Sonuç tablosu */}
              <table className="w-full text-[13px] border border-[#EEE] rounded overflow-hidden mb-4">
                <thead>
                  <tr className="bg-[#F5F5F5] text-[#666]">
                    <th className="px-3 py-2 text-left text-[11.5px] uppercase font-bold">Yerleşilen Program</th>
                    <th className="px-3 py-2 text-left text-[11.5px] uppercase font-bold">Statü</th>
                    <th className="px-3 py-2 text-right text-[11.5px] uppercase font-bold">Sıra</th>
                    <th className="px-3 py-2 text-right text-[11.5px] uppercase font-bold">Etkin Puan</th>
                    <th className="px-3 py-2 text-left text-[11.5px] uppercase font-bold">Sonuç Kodu</th>
                    <th className="px-3 py-2 text-left text-[11.5px] uppercase font-bold">Sonuç Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2.5">{sonucGosterilen.program ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                        sonucGosterilen.statu === "Asil" ? "bg-[#EEF6E8] text-[#5E7F42]" :
                        sonucGosterilen.statu === "Yedek" ? "bg-[#FCF3E3] text-[#C87E27]" :
                        "bg-[#FBECEE] text-[#A82232]"
                      }`}>{sonucGosterilen.statu.toUpperCase()}</span>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{sonucGosterilen.sira ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-bold">{sonucGosterilen.puan?.toFixed(2) ?? "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums">{sonucGosterilen.sonucKodu ?? "—"}</td>
                    <td className="px-3 py-2.5">{new Date(sonucGosterilen.sonucTarihi).toLocaleDateString("tr-TR")}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex items-center gap-3 flex-wrap">
                <button className={btnDrk} onClick={() => {
                  const s = sonucGosterilen as DuyuruSonucKayit;
                  const kod = s.sonucKodu ?? "SR-" + s.tc.slice(0, 6);
                  const icerik =
`T.C. MİLLÎ SAVUNMA BAKANLIĞI
PERSONEL TEMİN DAİRESİ BAŞKANLIĞI

═══════════════════════════════════════════
SONUÇ BELGESİ
═══════════════════════════════════════════

Sınav / Temin Adı : ${duyuru.baslik}
T.C. Kimlik No     : ${s.tc.slice(0, 3)}******${s.tc.slice(-2)}
Adı Soyadı         : ${s.ad} ${s.soyad}
Yerleşilen Program : ${s.program ?? "-"}
Statü              : ${s.statu.toUpperCase()}
Sıra               : ${s.sira ?? "-"}
Etkin Puan         : ${s.puan?.toFixed(2) ?? "-"}
Sonuç Kodu         : ${kod}
Sonuç Tarihi       : ${new Date(s.sonucTarihi).toLocaleDateString("tr-TR")}
${s.gerekce ? "\nGerekçe: " + s.gerekce : ""}

Doğrulama: bu belgenin doğruluğu ${window.location.origin} adresinden
sonuç sorgulama panelinden TCKN + Kontrol Kodu ile teyit edilebilir.

Kontrol Kodu: ${kod}
Barkod / Karekod: Bu belgenin doğruluğu Kontrol Kodu ile teyit edilir

Bu sonuç TEBLİGAT YERİNE GEÇMEKTEDİR.
Asil adayların kayıt/katılış işlemlerini belirtilen tarihte
ilgili okul/birlik komutanlığına yapması zorunludur.
═══════════════════════════════════════════`;
                  const blob = new Blob([icerik], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `sonuc-${kod}.txt`;
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}>
                  <Download className="w-3.5 h-3.5" /> Sonuç Belgesi İndir (PDF – QR Kodlu)
                </button>
                <div className="text-[11.5px] text-[#888] flex-1 min-w-[200px]">
                  Bu sonuç <strong>tebligat yerine geçmektedir</strong>. Asil adayların kayıt/katılış işlemleri tarihine kadar ilgili okul/birlik komutanlığına yapılmalıdır.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sorgulama aktif değilse bilgi */}
      {!duyuru.sonucSorgulamaAktif && (
        <div className="p-4 rounded border mb-4" style={{ background: MSB.infoBg, borderColor: MSB.infoBrd, color: MSB.infoText }}>
          <div className="flex items-start gap-2 text-[13px]">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>Bu duyuru için henüz kişisel sonuç sorgulama modülü aktifleştirilmemiştir. Genel liste/tablolar için yukarıdaki dosya eklerine bakabilirsiniz.</div>
          </div>
        </div>
      )}
    </div>
  );
}
