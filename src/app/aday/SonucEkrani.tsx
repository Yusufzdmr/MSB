// Aday — Yerleştirme Sonuç Ekranı + PDF çıktı.
// Aday'ın yayımlanmış son yerleştirmesini gösterir; window.print() ile PDF olarak alınabilir.

import { useRef } from "react";
import { ArrowLeft, Award, Printer, Download, CheckCircle2, XCircle, Clock, MapPin, Calendar, Users, Fingerprint } from "lucide-react";
import { useStore, select } from "../shared/store";
import { MSB, FONT } from "../shared/theme";
import { Btn, Pill, trTarih, maskTC } from "../shared/ui";

export default function SonucEkrani({ onBack }: { onBack: () => void }) {
  const store = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  const adayId = store.oturum?.tc ?? store.adaylar[0]?.id ?? "18878273464";
  const aday = store.adaylar.find(a => a.id === adayId);
  const yerl = select.adayYerlestirmesi(store, adayId);
  const ilan = yerl ? store.ilanlar.find(i => i.id === yerl.yerlestirme.ilanId) : null;
  const basvurular = store.basvurular.filter(b => b.adayId === adayId);

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8]" style={{ fontFamily: FONT, color: MSB.ink }}>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-area { box-shadow: none !important; border: 1px solid #333 !important; }
        }
      `}</style>

      <header className="h-[58px] bg-white border-b border-[#E0E0E0] flex items-center px-4 sticky top-0 z-30 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-[12.5px] font-semibold text-[#555] hover:text-[#A82232]">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} /> Aday Paneline Dön
        </button>
        <div className="mx-auto flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: MSB.red }}>
            <Award className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-extrabold" style={{ color: MSB.red }}>Yerleştirme Sonucum</span>
        </div>
        {yerl && (
          <Btn onClick={printPDF}><Printer className="w-3.5 h-3.5" /> Sonuç Belgesini İndir</Btn>
        )}
      </header>

      <div className="max-w-4xl mx-auto p-5">
        {!yerl ? (
          <BeklemedeGorunum basvurular={basvurular.length} onBack={onBack} />
        ) : yerl.sonuc.durum === "yerlesti" ? (
          <YerlestiGorunum aday={aday!} ilan={ilan!} yerl={yerl.yerlestirme} sonuc={yerl.sonuc} printRef={printRef} />
        ) : yerl.sonuc.durum === "yedek" ? (
          <YedekGorunum aday={aday!} ilan={ilan!} yerl={yerl.yerlestirme} sonuc={yerl.sonuc} />
        ) : (
          <YerlesemediGorunum aday={aday!} ilan={ilan!} yerl={yerl.yerlestirme} />
        )}
      </div>
    </div>
  );
}

function BeklemedeGorunum({ basvurular, onBack }: { basvurular: number; onBack: () => void }) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-10 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: MSB.warnBg, borderWidth: 2, borderColor: MSB.warnBrd, borderStyle: "solid" }}>
        <Clock className="w-10 h-10" style={{ color: MSB.orange }} strokeWidth={2} />
      </div>
      <h2 className="text-[22px] font-extrabold" style={{ color: MSB.orange }}>Yerleştirme Süreci Devam Ediyor</h2>
      <p className="text-[13px] text-[#666] mt-2 max-w-lg mx-auto leading-relaxed">
        Başvurunuz alındı ve değerlendirme aşamasındadır. Yerleştirme sonuçları yayımlandığında
        panelinize bildirim düşecek ve size mesaj gönderilecektir.
      </p>
      <div className="mt-6 inline-flex items-center gap-4 border border-[#EEE] rounded-[3px] px-5 py-3 bg-[#FAFAFA]">
        <div><div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888]">Aktif Başvurunuz</div><div className="text-[24px] font-extrabold tabular-nums" style={{ color: MSB.red }}>{basvurular}</div></div>
      </div>
      <div className="mt-6"><Btn variant="ghost" onClick={onBack}><ArrowLeft className="w-3.5 h-3.5" /> Panele Dön</Btn></div>
    </div>
  );
}

function YerlestiGorunum({ aday, ilan, yerl, sonuc, printRef }: {
  aday: NonNullable<ReturnType<typeof useStore>["adaylar"][number]>;
  ilan: NonNullable<ReturnType<typeof useStore>["ilanlar"][number]>;
  yerl: { tarih: string; id: string };
  sonuc: { puan: number; tercihSirasi: number };
  printRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="space-y-4">
      {/* Tebrik başlığı */}
      <div className="rounded-[4px] p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${MSB.green} 0%, ${MSB.greenDark} 100%)` }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90">TEBRİK EDERİZ</div>
            <div className="text-[24px] font-extrabold leading-tight mt-1">Yerleştirmeniz Tamamlandı</div>
            <div className="text-[13px] opacity-95 mt-1">
              Aşağıdaki program için asil olarak yerleştirilmiş bulunmaktasınız.
            </div>
          </div>
        </div>
      </div>

      {/* Sonuç belgesi */}
      <div ref={printRef} className="print-area bg-white border-[3px] border-[#333] p-8 shadow-lg" style={{ fontFamily: FONT }}>
        {/* Devlet başlığı */}
        <div className="text-center border-b-2 border-[#333] pb-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg viewBox="0 0 44 44" width={44} height={44}>
              <circle cx="22" cy="22" r="20" fill="none" stroke={MSB.red} strokeWidth="2.2" />
              <text x="22" y="28" textAnchor="middle" fontSize="14" fontWeight="900" fill={MSB.red}>MSB</text>
            </svg>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest">T.C. Millî Savunma Bakanlığı</div>
          <div className="text-[13px] font-extrabold uppercase tracking-wider" style={{ color: MSB.red }}>Personel Genel Müdürlüğü</div>
          <div className="text-[11px] font-semibold uppercase text-[#666] mt-0.5">Personel Temin Daire Başkanlığı</div>
          <div className="text-[16px] font-extrabold mt-4" style={{ color: MSB.ink }}>YERLEŞTİRME SONUÇ BELGESİ</div>
        </div>

        {/* Aday bilgileri */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
          <BelgeRow label="T.C. Kimlik No" value={aday.id} mono />
          <BelgeRow label="Ad Soyad" value={`${aday.ad} ${aday.soyad}`} />
          <BelgeRow label="Doğum Tarihi" value={new Date(aday.dogumTarihi).toLocaleDateString("tr-TR")} />
          <BelgeRow label="Sınav Puanı" value={sonuc.puan.toFixed(3)} />
          <BelgeRow label="Eğitim" value={aday.egitim} />
          <BelgeRow label="Belge No" value={yerl.id} mono />
        </div>

        {/* Sonuç kutusu */}
        <div className="border-[2px] border-[#7BA05B] bg-[#EEF6E8] rounded-[3px] p-5 mb-5">
          <div className="text-[10.5px] font-bold uppercase tracking-widest text-center mb-3" style={{ color: MSB.greenDark }}>
            YERLEŞTİRME SONUCU
          </div>
          <div className="text-center">
            <div className="text-[22px] font-extrabold" style={{ color: MSB.greenDark }}>ASİL YERLEŞTİ</div>
            <div className="text-[13.5px] font-bold mt-2" style={{ color: MSB.ink }}>{ilan.baslik}</div>
            <div className="text-[12px] text-[#666] mt-1">{ilan.kuvvet} · {ilan.sinif}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#C7DDB0]">
            <BelgeMeta label="Tercih Sırası" value={sonuc.tercihSirasi === 999 ? "—" : sonuc.tercihSirasi.toString()} />
            <BelgeMeta label="Yerleştirme Puanı" value={sonuc.puan.toFixed(3)} />
            <BelgeMeta label="İlan No" value={ilan.id} mono />
          </div>
        </div>

        {/* Program detayı */}
        <div className="mb-6">
          <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#888] mb-2">Program Detayı</div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#888]" /><span>{ilan.sehir}</span></div>
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[#888]" /><span>{trTarih(ilan.baslangic)} — {trTarih(ilan.bitis)}</span></div>
            <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-[#888]" /><span>Kontenjan: {ilan.kontenjan}</span></div>
            <div className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-[#888]" /><span>Min. Puan: {ilan.minPuan}</span></div>
          </div>
        </div>

        {/* Yapılması gerekenler */}
        <div className="border border-[#B6DAEA] bg-[#E7F3F9] rounded-[3px] p-4 mb-6">
          <div className="text-[11.5px] font-bold uppercase tracking-widest mb-2" style={{ color: MSB.infoText }}>Sonraki Adımlar</div>
          <ol className="text-[12px] leading-relaxed list-decimal list-inside space-y-1" style={{ color: MSB.infoText }}>
            <li>Belirtilen tarihte evrak teslim işlemleri için ilgili birime başvurunuz.</li>
            <li>Sağlık muayenesi randevunuzu Bilgilerim &gt; Sağlık sekmesinden alınız.</li>
            <li>Askerî kimlik kartı düzenleme işlemleri için hazırlıklarınızı yapınız.</li>
            <li>Adres değişikliği ve iletişim bilgilerinizi güncel tutmayı unutmayınız.</li>
          </ol>
        </div>

        {/* Alt imza / doğrulama */}
        <div className="border-t border-[#333] pt-4 flex items-end justify-between">
          <div className="text-[11px] text-[#666] leading-relaxed max-w-md">
            <div>Bu belge <b>T.C. Millî Savunma Bakanlığı Personel Temin Sistemi</b> tarafından
              elektronik olarak düzenlenmiştir ve barkod ile doğrulanabilir.</div>
            <div className="mt-1 font-mono text-[10.5px]">Doğrulama kodu: <span style={{ color: MSB.red }}>{yerl.id}-{aday.id.slice(-4)}</span></div>
            <div className="mt-1">Yayın: {trTarih(yerl.tarih, true)}</div>
          </div>
          <div className="text-right">
            <div className="w-24 h-24 border-2 border-[#333] flex items-center justify-center bg-white">
              <Fingerprint className="w-14 h-14 text-[#333]" strokeWidth={1.2} />
            </div>
            <div className="text-[9px] text-[#666] mt-1">e-İmza / Karekod</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 no-print">
        <Btn variant="ghost" onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Yazdır</Btn>
        <Btn onClick={() => window.print()}><Download className="w-3.5 h-3.5" /> PDF Olarak İndir</Btn>
      </div>
    </div>
  );
}

function YedekGorunum({ aday, ilan, yerl, sonuc }: {
  aday: NonNullable<ReturnType<typeof useStore>["adaylar"][number]>;
  ilan: NonNullable<ReturnType<typeof useStore>["ilanlar"][number]>;
  yerl: { tarih: string };
  sonuc: { puan: number; tercihSirasi: number };
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[4px] p-6 text-white" style={{ background: `linear-gradient(135deg, ${MSB.orange} 0%, ${MSB.breadcrumb} 100%)` }}>
        <div className="flex items-center gap-4">
          <Clock className="w-14 h-14 flex-shrink-0" strokeWidth={2} />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90">SONUÇ</div>
            <div className="text-[22px] font-extrabold leading-tight mt-1">Yedek Listesindesiniz</div>
            <div className="text-[13px] opacity-95 mt-1">Boş kalan kontenjanlarda öncelikli olarak çağrılacaksınız.</div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-6">
        <div className="text-[12px] font-bold uppercase text-[#888] mb-3">İlan Bilgisi</div>
        <div className="text-[14px] font-extrabold mb-1">{ilan.baslik}</div>
        <div className="text-[12px] text-[#666] mb-4">{ilan.kuvvet} · {ilan.sinif} · {ilan.sehir}</div>
        <div className="grid grid-cols-3 gap-4 border-t border-[#EEE] pt-4">
          <BelgeMeta label="Puanınız" value={sonuc.puan.toFixed(3)} />
          <BelgeMeta label="Tercih Sıranız" value={sonuc.tercihSirasi === 999 ? "—" : sonuc.tercihSirasi.toString()} />
          <BelgeMeta label="Sonuç Tarihi" value={trTarih(yerl.tarih)} />
        </div>
      </div>
      <div className="bg-[#FCF3E3] border border-[#E7C688] rounded-[3px] p-4 text-[12.5px] leading-relaxed" style={{ color: MSB.orange }}>
        Yedek listesinde bulunan adaylar, yerleşen adayların çeşitli sebeplerle vazgeçmesi durumunda sırayla çağrılır.
        Panelinizi ve iletişim bilgilerinizi güncel tutunuz.
      </div>
    </div>
  );
}

function YerlesemediGorunum({ aday, ilan, yerl }: {
  aday: NonNullable<ReturnType<typeof useStore>["adaylar"][number]>;
  ilan: NonNullable<ReturnType<typeof useStore>["ilanlar"][number]>;
  yerl: { tarih: string };
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[4px] p-6 text-white" style={{ background: `linear-gradient(135deg, ${MSB.red} 0%, ${MSB.redDark} 100%)` }}>
        <div className="flex items-center gap-4">
          <XCircle className="w-14 h-14 flex-shrink-0" strokeWidth={2} />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] opacity-90">SONUÇ</div>
            <div className="text-[22px] font-extrabold leading-tight mt-1">Yerleşemediniz</div>
            <div className="text-[13px] opacity-95 mt-1">Katılımınız için teşekkür ederiz.</div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#E0E0E0] rounded-[4px] p-6">
        <div className="text-[12px] text-[#666] leading-relaxed">
          <b>{ilan.baslik}</b> ilanı için yapmış olduğunuz başvuru değerlendirilmiş, ancak
          kadro dahilinde yer bulamadığınız için yerleştirmeniz gerçekleştirilememiştir.
          Yeni ilanlar için Güncel Teminler sekmesini takip edebilirsiniz.
        </div>
        <div className="mt-3 text-[11px] text-[#888]">Sonuç tarihi: {trTarih(yerl.tarih, true)}</div>
      </div>
    </div>
  );
}

function BelgeRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">{label}</div>
      <div className={`text-[13px] font-bold ${mono ? "font-mono" : ""}`} style={{ color: MSB.ink }}>{value}</div>
    </div>
  );
}

function BelgeMeta({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[#888]">{label}</div>
      <div className={`text-[16px] font-extrabold mt-0.5 ${mono ? "font-mono" : ""}`} style={{ color: MSB.red }}>{value}</div>
    </div>
  );
}
