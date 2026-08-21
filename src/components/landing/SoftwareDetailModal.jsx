import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogClose, DialogContent, DialogFooter,
  DialogHeader, DialogTitle,
} from '../ui/dialog';
import { supaImg } from '../../utils/imageUrl';

/* ─── Software Detail Modal ─────────────────────────────────────────── */
export function SoftwareDetailModal({ sw, open, onClose, transitionTo }) {
  const { t, i18n }  = useTranslation();
  const isEn         = i18n.language === 'en';
  const swName       = sw ? ((isEn && sw.nameEn) ? sw.nameEn : sw.name) : '';
  const swDesc       = sw ? ((isEn && sw.descriptionEn) ? sw.descriptionEn : sw.description) : '';
  const swFeatures   = sw ? ((isEn && sw.featuresEn) ? sw.featuresEn : sw.features) : '';
  const fmt          = (v) => `Rp ${Number(v).toLocaleString('id-ID')}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{swName}</DialogTitle>
          {sw?.category && (
            <span className="font-mono text-xs text-neu-white/50 uppercase">{sw.category}</span>
          )}
        </DialogHeader>

        {sw?.thumbnailUrl && (
          <div className="border-b-2 border-neu-black bg-neu-cream flex-shrink-0">
            <img src={supaImg(sw.thumbnailUrl, { width: 800 })} alt={swName} width="800" height="208" className="w-full h-52 object-cover" loading="lazy" decoding="async" />
          </div>
        )}

        <div className="overflow-y-auto flex-1 divide-y-2 divide-neu-black min-h-0">
          <div className="px-5 py-3 flex items-center justify-between">
            <span className="font-mono text-xs text-neu-black/40 uppercase tracking-widest">Harga</span>
            <span className="font-display font-bold text-xl text-neu-black">{sw ? fmt(sw.price) : ''}</span>
          </div>

          {swDesc && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-2">Deskripsi</p>
              <p className="font-body text-sm text-neu-black/80 leading-relaxed">{swDesc}</p>
            </div>
          )}

          {swFeatures && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-3">Fitur</p>
              <ul className="space-y-2">
                {swFeatures.split('\n').filter(f => f.trim()).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 flex-shrink-0 flex items-center justify-center bg-neu-gold border-2 border-neu-black rounded-neu-sm">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="font-body text-sm text-neu-black">{f.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sw?.techStack && (
            <div className="px-5 py-4">
              <p className="font-mono text-[10px] text-neu-black/40 uppercase tracking-widest mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {sw.techStack.split('\n').filter(s => s.trim()).map(s => (
                  <span key={s} className="font-mono text-[10px] bg-neu-black text-neu-white px-2.5 py-1 border border-neu-black rounded-neu-sm">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          {sw?.demoUrl && (
            <a href={sw.demoUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2.5 border-2 border-neu-black rounded-neu bg-neu-white font-display font-bold text-xs uppercase text-neu-black text-center transition-all duration-150 hover:bg-neu-cream hover:translate-x-[2px] hover:translate-y-[2px]">
              {t('landing.software.demo')}
            </a>
          )}
          <button
            onClick={() => { onClose(); setTimeout(() => transitionTo('/my-software'), 300); }}
            className="flex-1 py-2.5 bg-neu-gold border-2 border-neu-black rounded-neu shadow-neu-solid font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-solid-sm">
            {t('landing.software.buyNow')}
          </button>
          <DialogClose className="px-5 py-2.5 bg-neu-white border-2 border-neu-black rounded-neu shadow-neu-solid font-display font-bold text-xs uppercase text-neu-black transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neu-solid-sm">
            Tutup
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
