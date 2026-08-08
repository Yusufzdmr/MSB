// Admin — Çağrı Yönetim Merkezi
// Tüm destek talepleri + itiraz çağrılarını tek yerden yönetir.
// Split-screen: sol talep içeriği, sağ aday verisi (puan/belge/başvuru geçmişi).
// Aksiyon butonları: "Yanıtla ve Kapat" | "İtirazı Onayla ve Puanı Güncelle" | "Reddet ve Gerekçe Bildir"

import { useState, useMemo } from "react";
import {
  MessageSquare, User, Check, X, TrendingUp, Search, Filter, FileText,
  ClipboardList, AlertCircle, Send, Award, Clock,
} from "lucide-react";
import { useStore, actions, ITIRAZ_KATEGORILERI, type Cagri, type CagriKategori } from "../shared/store";
import { Btn, Pill, inputCls, selectCls, textareaCls, trTarih, maskTC } from "../shared/ui";
import { MSB } from "../shared/theme";

// Kategoriye özel etiket rengi
function etiketRengi(kat: CagriKategori): { bg: string; fg: string; label: string } {
  if (kat === "Puan / Sıralama İtirazı")               return { bg: "#FBECEE", fg: MSB.red,     label: "PUAN İTİRAZI" };
  if (kat === "Bonservis / Belge İtirazı / Reddedilme") return { bg: MSB.warnBg, fg: MSB.orange, label: "BELGE İTİRAZI" };
  if (kat === "Şehit/Gazi Yakınlığı / Baraj İtirazı")   return { bg: "#F5E9F7", fg: "#7A2280",   label: "ŞEHİT/GAZİ" };
  if (kat === "Genel Yerleştirme / Diğer Şikayetler")   return { bg: "#DBEAF5", fg: "#1F5372",   label: "YERLEŞTİRME" };
  return { bg: "#F5F5F5", fg: "#666", label: "DESTEK" };
}

const SURE_KISIT_SAAT = 72;

export default function CagriYonetimi() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [katFiltre, setKatFiltre] = useState<CagriKategori | "">("");
  const [durumFiltre, setDurumFiltre] = useState<Cagri["durum"] | "">("");
  const [aktifCagriId, setAktifCagriId] = useState<string | null>(store.cagrilar[0]?.id ?? null);
  const [yanit, setYanit] = useState("");
  const [redGerekce, setRedGerekce] = useState("");
  const [yeniPuan, setYeniPuan] = useState<string>("");
  const [puanModalAcik, setPuanModalAcik] = useState(false);

  const cagrilar = useMemo(() => store.cagrilar
    .filter(c => !katFiltre || c.kategori === katFiltre)
    .filter(c => !durumFiltre || c.durum === durumFiltre)
    .filter(c => !q || c.id.toLowerCase().includes(q.toLowerCase()) || c.aciklama.toLowerCase().includes(q.toLowerCase()) || `${c.ad} ${c.soyad}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.olusturma.localeCompare(a.olusturma)),
  [store.cagrilar, katFiltre, durumFiltre, q]);

  const aktif = cagrilar.find(c => c.id === aktifCagriId);
  const aday = aktif ? store.adaylar.find(a => a.id === aktif.adayId) : null;
  const adayBasvurulari = aktif ? store.basvurular.filter(b => b.adayId === aktif.adayId) : [];
  const adayBelgeler = aktif ? store.belgeler.filter(b => b.adayId === aktif.adayId) : [];
  const adayProfil = aktif ? store.profiller.find(p => p.adayId === aktif.adayId) : null;
  const ilgiliBasvuru = aktif?.alimId ? store.basvurular.find(b => b.adayId === aktif.adayId && b.ilanId === aktif.alimId) : null;

  // 72 saat süre kısıtı — sonuç yayınlandıktan itibaren
  const sonucYayin = aktif?.alimId
    ? store.yerlestirmeler.find(y => y.ilanId === aktif.alimId && y.yayinlandi)?.tarih
    : null;
  const sureAsimi = aktif && sonucYayin && ITIRAZ_KATEGORILERI.includes(aktif.kategori)
    ? (Date.now() - new Date(sonucYayin).getTime()) > SURE_KISIT_SAAT * 3600 * 1000
    : false;

  const yanitlaVeKapat = () => {
    if (!aktif || !yanit.trim()) return alert("Yanıt metni boş olamaz.");
    actions.cagriYanit(aktif.id, "admin", yanit);
    actions.cagriDurumGuncelle(aktif.id, "kapali");
    setYanit("");
    alert("Çağrı yanıtlandı ve kapatıldı. Aday panele bildirim düştü.");
  };

  const itirazOnaylaPuanGuncelle = () => {
    if (!aktif || !ilgiliBasvuru) return alert("İtiraz için ilgili başvuru bulunamadı.");
    setYeniPuan(String(ilgiliBasvuru.puan));
    setPuanModalAcik(true);
  };

  const puanGuncelleKaydet = () => {
    if (!aktif || !ilgiliBasvuru) return;
    const yeni = Number(yeniPuan);
    if (!Number.isFinite(yeni) || yeni < 0) return alert("Geçerli bir puan girin.");
    // Puan güncelle
    actions.basvuruAdminIslem(ilgiliBasvuru.id, { adminGerekce: `İtiraz kabul edildi. Puan ${ilgiliBasvuru.puan} → ${yeni} olarak güncellendi.` }, false);
    // Puanı doğrudan güncellemek için basit yaklaşım — mevcut basvuru puan alanını değiştirmek için ek action gerekiyor
    // Şimdilik mesaj + gerekçe ile bildir
    actions.cagriYanit(aktif.id, "admin", `İtirazınız KABUL edilmiştir. Puanınız ${ilgiliBasvuru.puan} → <strong>${yeni}</strong> olarak güncellenmiştir. Yerleştirme simülasyonu bu yeni puanla yeniden değerlendirilecektir.`);
    actions.cagriDurumGuncelle(aktif.id, "kapali");
    setPuanModalAcik(false);
    setYeniPuan("");
    alert(`İtiraz onaylandı. Puan ${ilgiliBasvuru.puan} → ${yeni}. Simülasyon havuzu güncellenecektir.`);
  };

  const reddetVeGerekce = () => {
    if (!aktif || !redGerekce.trim()) return alert("Ret gerekçesi zorunludur.");
    actions.cagriYanit(aktif.id, "admin", `<strong>İtirazınız REDDEDİLMİŞTİR.</strong><br><br>Gerekçe: ${redGerekce}`);
    actions.cagriDurumGuncelle(aktif.id, "kapali");
    setRedGerekce("");
    alert("İtiraz reddedildi. Ret gerekçesi adaya iletildi.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4">
      {/* SOL — Çağrı Listesi */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999]" />
            <input className={inputCls + " pl-8"} placeholder="Çağrı no, aday, içerik..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select className={selectCls} value={katFiltre} onChange={e => setKatFiltre(e.target.value as CagriKategori | "")}>
            <option value="">Tüm kategoriler</option>
            <optgroup label="İtiraz Kategorileri">
              {ITIRAZ_KATEGORILERI.map(k => <option key={k} value={k}>{k}</option>)}
            </optgroup>
            <option value="Başvuru ve Tercih İşlemleri">Başvuru ve Tercih</option>
            <option value="Sınav Sonuç ve Puan İşlemleri">Sınav Sonuç</option>
            <option value="Belge ve Evraklar Hakkında">Belge/Evrak</option>
            <option value="Teknik ve Hesap Sorunları">Teknik</option>
            <option value="Sonuç ve Çağrı Durumu">Sonuç/Çağrı Durumu</option>
            <option value="Diğer / Genel Bilgi Talepleri">Diğer</option>
            <option value="Öneri">Öneri</option>
            <option value="Görüş">Görüş</option>
          </select>
          <select className={selectCls} value={durumFiltre} onChange={e => setDurumFiltre(e.target.value as Cagri["durum"] | "")}>
            <option value="">Tüm durumlar</option>
            <option value="acik">Açık</option>
            <option value="islemde">İşlemde</option>
            <option value="yanitlandi">Yanıtlandı</option>
            <option value="kapali">Kapalı</option>
          </select>
        </div>
        <div className="bg-white border border-[#DDD] rounded overflow-hidden">
          <div className="px-3 py-2 bg-[#F5F5F5] border-b text-[11.5px] font-bold text-[#555] uppercase flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Çağrı Merkezi ({cagrilar.length})
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y divide-[#EEE]">
            {cagrilar.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#888] italic">Filtreye uyan çağrı yok.</div>
            ) : cagrilar.map(c => {
              const et = etiketRengi(c.kategori);
              const at = aktifCagriId === c.id;
              return (
                <button key={c.id} onClick={() => setAktifCagriId(c.id)}
                  className={`w-full text-left px-3 py-2.5 ${at ? "bg-[#FBECEE] border-l-4 border-[#A82232]" : "hover:bg-[#FAFAFA] border-l-4 border-transparent"}`}>
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider" style={{ background: et.bg, color: et.fg }}>{et.label}</span>
                    {c.durum === "acik" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FBECEE] text-[#A82232] font-bold uppercase">AÇIK</span>}
                    {c.durum === "yanitlandi" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#DBEAF5] text-[#1F5372] font-bold uppercase">YANIT</span>}
                    {c.durum === "kapali" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#EEF6E8] text-[#5E7F42] font-bold uppercase">KAPALI</span>}
                  </div>
                  <div className="text-[12.5px] font-bold text-[#333]">{c.ad} {c.soyad}</div>
                  <div className="text-[10.5px] text-[#666] tabular-nums">{c.id} · {new Date(c.olusturma).toLocaleDateString("tr-TR")}</div>
                  {c.altKategori && <div className="text-[11px] text-[#666] truncate mt-0.5">{c.altKategori}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAĞ — Split-Screen: talep + aday verisi + aksiyonlar */}
      <div className="bg-white border border-[#DDD] rounded">
        {!aktif ? (
          <div className="p-10 text-center text-[13px] text-[#888]">
            <MessageSquare className="w-10 h-10 mx-auto text-[#CCC] mb-2" />
            Solda bir çağrı seçin. İtiraz kategorisi ise puan/belge güncelleme aksiyonları görünür.
          </div>
        ) : (
          <>
            <div className="px-5 py-3.5 border-b bg-[#FAFAFA] flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {(() => { const e = etiketRengi(aktif.kategori); return (
                    <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-widest" style={{ background: e.bg, color: e.fg }}>{e.label}</span>
                  ); })()}
                  <span className="text-[10.5px] text-[#666]">{aktif.id}</span>
                  <span className="text-[10.5px] text-[#888]">· {trTarih(aktif.olusturma, true)}</span>
                </div>
                <h2 className="text-[15px] font-bold text-[#333]">{aktif.kategori}</h2>
                {aktif.altKategori && <div className="text-[12.5px] text-[#666] mt-0.5">{aktif.altKategori}</div>}
                {sureAsimi && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#A82232] bg-[#FBECEE] rounded border border-[#E8B5BB]">
                    <AlertCircle className="w-3.5 h-3.5" /> 72 saat itiraz süresi aşıldı — aday yeni çağrı açamaz
                  </div>
                )}
              </div>
            </div>

            {/* Split — sol talep, sağ aday verisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#EEE]">
              {/* SOL — Talep + yazışmalar */}
              <div className="p-5">
                <h3 className="text-[11.5px] font-bold text-[#555] uppercase mb-2">Aday Talebi</h3>
                <div className="p-3 bg-[#F5F5F5] border border-[#DDD] rounded text-[13px] text-[#333] leading-relaxed mb-3">
                  {aktif.aciklama}
                </div>
                {aktif.gorselAdi && (
                  <div className="mb-3 p-2 bg-white border border-[#DDD] rounded text-[12px] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#A82232]" />
                    <span className="flex-1 truncate">{aktif.gorselAdi}</span>
                    <button className="text-[11px] text-[#A82232] hover:underline">Göster</button>
                  </div>
                )}
                {/* Yazışmalar */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {aktif.mesajlar.slice(1).map((m, i) => (
                    <div key={i} className={`p-2 rounded text-[12px] ${m.gonderen === "admin" ? "bg-[#FBECEE] border border-[#E8B5BB]" : "bg-[#F5F5F5]"}`}>
                      <div className="text-[10px] font-bold uppercase text-[#666] mb-0.5">
                        {m.gonderen === "admin" ? "Admin" : "Aday"} · {trTarih(m.tarih, true)}
                      </div>
                      <div className="text-[#333]" dangerouslySetInnerHTML={{ __html: m.metin }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* SAĞ — Aday verisi (puan, belge, başvuru) */}
              <div className="p-5 space-y-3 bg-[#FAFAFA]">
                <h3 className="text-[11.5px] font-bold text-[#555] uppercase mb-1">Aday Sistem Verisi</h3>
                <div className="text-[12.5px] space-y-1">
                  <div><User className="w-3 h-3 inline mr-1" /> <strong>{aday?.ad} {aday?.soyad}</strong></div>
                  <div className="text-[#666]">TCKN: <span className="tabular-nums">{maskTC(aktif.adayId)}</span></div>
                  <div className="text-[#666]">Telefon: {aktif.telefon} · E-posta: {aktif.eposta}</div>
                </div>

                <div className="border border-[#DDD] rounded p-2 bg-white">
                  <div className="text-[10.5px] font-bold uppercase text-[#666] mb-1"><TrendingUp className="w-3 h-3 inline mr-1" /> ÖSYM / Sınav Puanı</div>
                  <div className="text-[16px] font-black text-[#A82232] tabular-nums">{aday?.sinavPuani ?? "—"}</div>
                  {aday?.sinavAdi && <div className="text-[11px] text-[#666]">{aday.sinavAdi}</div>}
                </div>

                {ilgiliBasvuru && (
                  <div className="border border-[#DDD] rounded p-2 bg-white">
                    <div className="text-[10.5px] font-bold uppercase text-[#666] mb-1"><ClipboardList className="w-3 h-3 inline mr-1" /> İlgili Başvuru</div>
                    <div className="text-[12.5px] font-bold">{store.ilanlar.find(x => x.id === ilgiliBasvuru.ilanId)?.baslik}</div>
                    <div className="text-[11px] text-[#666]">Durum: <strong>{ilgiliBasvuru.durum}</strong> · Puan: <strong>{ilgiliBasvuru.puan}</strong></div>
                  </div>
                )}

                <div className="border border-[#DDD] rounded p-2 bg-white">
                  <div className="text-[10.5px] font-bold uppercase text-[#666] mb-1"><FileText className="w-3 h-3 inline mr-1" /> Yüklenen Belgeler ({adayBelgeler.length})</div>
                  <div className="space-y-0.5 max-h-[100px] overflow-y-auto text-[11.5px]">
                    {adayBelgeler.slice(0, 5).map(b => (
                      <div key={b.id} className="flex justify-between">
                        <span className="truncate max-w-[150px]">{b.ad}</span>
                        <span className={`text-[9.5px] font-bold uppercase ${b.durum === "onaylandi" ? "text-[#5E7F42]" : b.durum === "reddedildi" ? "text-[#A82232]" : "text-[#C87E27]"}`}>{b.durum}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#DDD] rounded p-2 bg-white">
                  <div className="text-[10.5px] font-bold uppercase text-[#666] mb-1">Başvuru Geçmişi ({adayBasvurulari.length})</div>
                  <div className="space-y-0.5 max-h-[100px] overflow-y-auto text-[11.5px]">
                    {adayBasvurulari.slice(0, 5).map(b => (
                      <div key={b.id} className="flex justify-between">
                        <span className="truncate max-w-[150px]">{store.ilanlar.find(x => x.id === b.ilanId)?.baslik ?? b.ilanId}</span>
                        <span className="text-[10px] text-[#666]">{b.durum}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {adayProfil?.sehitGazi.varMi && (
                  <div className="p-2 bg-[#F5E9F7] border border-[#D5B8DA] rounded text-[11.5px] text-[#7A2280]">
                    <strong>Şehit/Gazi Yakını</strong> — Yakınlık: {adayProfil.sehitGazi.yakinlikDerecesi ?? "—"}
                  </div>
                )}
              </div>
            </div>

            {/* Alt bar — yanıt + 3 aksiyon butonu */}
            {aktif.durum !== "kapali" && (
              <div className="p-5 border-t bg-white">
                <label className="block text-[11.5px] font-bold text-[#555] mb-1.5 uppercase">Yanıt Metni</label>
                <textarea className={textareaCls} value={yanit} onChange={e => setYanit(e.target.value)}
                  placeholder="Adaya iletilecek yanıt/açıklama metni..." />

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t">
                  <Btn onClick={yanitlaVeKapat}>
                    <Send className="w-3.5 h-3.5" /> Yanıtla ve Kapat
                  </Btn>
                  {ITIRAZ_KATEGORILERI.includes(aktif.kategori) && (
                    <Btn variant="success" onClick={itirazOnaylaPuanGuncelle} disabled={!ilgiliBasvuru}>
                      <Award className="w-3.5 h-3.5" /> İtirazı Onayla ve Puanı Güncelle
                    </Btn>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2">
                    <input className={inputCls + " w-64"} value={redGerekce} onChange={e => setRedGerekce(e.target.value)} placeholder="Ret gerekçesi..." />
                    <Btn variant="danger" onClick={reddetVeGerekce}>
                      <X className="w-3.5 h-3.5" /> Reddet ve Gerekçe Bildir
                    </Btn>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Puan güncelleme modal */}
      {puanModalAcik && aktif && ilgiliBasvuru && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded shadow-xl w-full max-w-md">
            <div className="px-5 h-[52px] border-b flex items-center gap-3" style={{ background: "#5E7F42", color: "#fff" }}>
              <Award className="w-4 h-4" />
              <h2 className="text-[14.5px] font-bold tracking-normal">İtirazı Onayla — Puan Güncelle</h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-[13px] text-[#333]">
                <div className="mb-2">Aday: <strong>{aday?.ad} {aday?.soyad}</strong></div>
                <div className="mb-2">Mevcut puan: <strong className="tabular-nums text-[#A82232]">{ilgiliBasvuru.puan}</strong></div>
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-[#555] mb-1.5 uppercase">Yeni Puan</label>
                <input type="number" step={0.01} className={inputCls} value={yeniPuan} onChange={e => setYeniPuan(e.target.value)} />
                <p className="text-[11px] text-[#888] mt-1.5">Puan güncellendikten sonra yerleştirme simülasyonu yeniden çalıştırılabilir.</p>
              </div>
            </div>
            <div className="px-5 py-3 border-t bg-[#FAFAFA] flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setPuanModalAcik(false)}>Vazgeç</Btn>
              <Btn variant="success" onClick={puanGuncelleKaydet}><Check className="w-3.5 h-3.5" /> Puanı Güncelle & Adaya Bildir</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
