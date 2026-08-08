// Aday paneli — Sene geçişi / çoklu sınav yönetimi uyarı bileşenleri.
// 1) Panel içi turuncu/kırmızı banner
// 2) Tam ekran zorunlu güncelleme modal (aday sisteme girdiğinde)
// 3) Başvuru engelleme pop-up (Tercih Yap tıklandığında güncel yıl sınavı yoksa)

import { useState, useEffect } from "react";
import { AlertCircle, X, ArrowRight, Calendar } from "lucide-react";
import { MSB } from "../shared/theme";
import { useStore } from "../shared/store";

// ─── Aday'da geçerli (arşivlenmemiş & bu yıla ait) sınav var mı? ─────────────
export function guncelSinavVarMi(adayId: string, store: ReturnType<typeof useStore>): boolean {
  const yy = new Date().getFullYear();
  const p = store.profiller.find(x => x.adayId === adayId);
  if (!p) return false;
  return p.sinavlar.some(s => s.sinavYili >= yy && !s.arsivlendi);
}

// ─── Arşivlenmiş / süresi geçmiş sınavların listesi ──────────────────────────
export function arsivlenmisSinavlar(adayId: string, store: ReturnType<typeof useStore>) {
  const p = store.profiller.find(x => x.adayId === adayId);
  return (p?.sinavlar ?? []).filter(s => s.arsivlendi);
}

// ─── Panel içi banner ────────────────────────────────────────────────────────
export function SinavGuncellemeBanner({ adayId }: { adayId: string }) {
  const store = useStore();
  const guncel = guncelSinavVarMi(adayId, store);
  const arsiv = arsivlenmisSinavlar(adayId, store);
  const [gizle, setGizle] = useState(false);
  const yy = new Date().getFullYear();

  if (gizle || guncel) return null;   // Güncel sınav varsa banner gösterme
  if (arsiv.length === 0) return null; // Hiç sınav yoksa banner gösterme

  // Son gün: yıl sonuna kadar
  const sonGun = new Date(yy, 11, 31).toLocaleDateString("tr-TR");

  return (
    <div className="px-4 py-2.5 flex items-center gap-3" style={{ background: "#FFF1E6", borderBottom: `2px solid ${MSB.orange}`, color: MSB.orange }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
      <div className="flex-1 text-[12.5px] font-semibold">
        <strong>Süresi geçen sınav belgeniz bulunuyor.</strong> Yeni döneme ait ({yy}) belgenizi yüklemek için son gün: <strong>{sonGun}</strong>. Güncel belge yüklenmeden yeni ilanlara başvuramazsınız.
      </div>
      <button onClick={() => setGizle(true)} className="p-1 hover:bg-white/50 rounded"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ─── Tam ekran zorunlu güncelleme modalı (aday panele ilk girişte) ─────────────
export function ZorunluSinavGuncellemeModal({ adayId, onGoSinav }: { adayId: string; onGoSinav: () => void }) {
  const store = useStore();
  const guncel = guncelSinavVarMi(adayId, store);
  const arsiv = arsivlenmisSinavlar(adayId, store);
  const [kapatildi, setKapatildi] = useState(false);
  const yy = new Date().getFullYear();

  // Bir kere gösterildikten sonra oturum boyunca kapansın (sessionStorage)
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("sinav-uyari-kapatildi-" + adayId) === "1") {
      setKapatildi(true);
    }
  }, [adayId]);

  if (kapatildi) return null;
  if (guncel) return null;
  if (arsiv.length === 0) return null;

  const kapat = () => {
    setKapatildi(true);
    if (typeof window !== "undefined") sessionStorage.setItem("sinav-uyari-kapatildi-" + adayId, "1");
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: MSB.orange, color: "#fff" }}>
          <AlertCircle className="w-6 h-6" strokeWidth={2.5} />
          <div className="flex-1">
            <div className="text-[10.5px] font-bold uppercase tracking-widest opacity-90">Güncel Sınav Belgesi Yükleme Zorunluluğu</div>
            <h2 className="text-[16px] font-black">Sene Geçişi Uyarısı — {yy}</h2>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-[13.5px] text-[#333] leading-relaxed">
            Sisteminizde bulunan <strong>{arsiv.length} adet</strong> sınav belgesi geçmiş yıllara ait ve <strong className="text-[#A82232]">"Arşivlendi / Süresi Doldu"</strong> statüsünde.
          </p>
          <div className="p-3 bg-[#FBECEE] border border-[#E8B5BB] rounded text-[12.5px] text-[#A82232]">
            <strong>⚠ Kilitli İşlemler:</strong> Güncel belge yüklenmeden:
            <ul className="list-disc ml-5 mt-1 space-y-0.5">
              <li>Yeni ilanlara <strong>başvuru yapamazsınız</strong></li>
              <li>Aktif tercihlerinizi <strong>güncelleyemezsiniz</strong></li>
            </ul>
          </div>
          <p className="text-[12.5px] text-[#555]">
            Lütfen <strong>Bilgilerim → Sınav Bilgileri</strong> sekmesinden {yy} yılına ait güncel belgenizi yükleyin.
          </p>
          <div className="border border-[#EEE] rounded p-2 text-[11.5px] max-h-[120px] overflow-y-auto">
            <div className="font-bold text-[#666] uppercase mb-1">Arşivlenen belgeleriniz:</div>
            {arsiv.map(s => (
              <div key={s.id} className="flex justify-between py-0.5">
                <span>{s.sinav} ({s.sinavYili}) — {s.belgeAdi}</span>
                <span className="text-[#A82232] font-bold">Arşivlendi</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-between gap-2">
          <button onClick={kapat} className="text-[12px] text-[#888] hover:text-[#333]">Şimdi Değil</button>
          <button onClick={() => { kapat(); onGoSinav(); }}
            className="inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-bold text-white rounded-[3px]"
            style={{ background: MSB.red }}>
            Bilgilerim → Sınav Bilgileri Sekmesine Git <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Başvuru engelleme pop-up (kullanıcı manuel çağırır) ──────────────────────
export function BasvuruEngellemePopup({ open, onClose, onGoSinav, ilanBaslik }: { open: boolean; onClose: () => void; onGoSinav: () => void; ilanBaslik?: string }) {
  if (!open) return null;
  const yy = new Date().getFullYear();
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: MSB.red, color: "#fff" }}>
          <AlertCircle className="w-6 h-6" strokeWidth={2.5} />
          <h2 className="text-[15px] font-black flex-1">Başvuru Engeli</h2>
        </div>
        <div className="p-5 text-[13.5px] text-[#333] leading-relaxed">
          <p className="mb-3">
            <strong>Bu ilan için geçerli {yy} sınav sonucunuz bulunmamaktadır.</strong>
          </p>
          <p className="text-[12.5px] text-[#666]">
            Lütfen önce <strong>Bilgilerim → Sınav Bilgileri</strong> sekmesinden güncel belgenizi yükleyiniz.
            {ilanBaslik && <><br /><br />İlan: <em>{ilanBaslik}</em></>}
          </p>
        </div>
        <div className="px-5 py-3 border-t bg-[#FAFAFA] flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-[32px] px-3 text-[13px] font-semibold text-[#333] border border-[#CCC] rounded">İptal</button>
          <button onClick={() => { onClose(); onGoSinav(); }}
            className="inline-flex items-center gap-2 h-[32px] px-3.5 text-[13px] font-bold text-white rounded-[3px]"
            style={{ background: MSB.red }}>
            Sınav Bilgilerime Git <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
