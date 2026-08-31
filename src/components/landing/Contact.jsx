import { useTranslation } from 'react-i18next';
import { fixContactUrl } from './hooks';

const DEFAULT_CONTACT_ITEMS = [
  {
    type: 'Email',
    title: 'Email',
    info: 'hello@synectra.id',
    icon: 'email',
    url: 'mailto:hello@synectra.id',
    hoverBg: 'hover:bg-primary-container',
  },
  {
    type: 'WhatsApp',
    title: 'WhatsApp',
    info: '+62 812 3456 7890',
    icon: 'chat',
    url: 'https://wa.me/6281234567890',
    hoverBg: 'hover:bg-neu-green',
  },
  {
    type: 'Github',
    title: 'Github',
    info: 'github.com/synectra',
    icon: 'code',
    url: 'https://github.com/synectra',
    hoverBg: 'hover:bg-neu-purple hover:text-neu-white',
  },
];

export function Contact({ contacts, socialMedia, showToast }) {
  const { t } = useTranslation();

  // Combine database contacts with default fallbacks
  const contactList = (contacts && contacts.length > 0)
    ? contacts.map(c => {
        const iconKey = (c.icon || '').toLowerCase();
        const icon = iconKey.includes('mail') ? 'email' : iconKey.includes('phone') || iconKey.includes('wa') || iconKey.includes('chat') ? 'chat' : 'contact_page';
        const hoverBg = icon === 'email' ? 'hover:bg-primary-container' : icon === 'chat' ? 'hover:bg-neu-green' : 'hover:bg-neu-purple hover:text-neu-white';
        return {
          type: c.nama || 'Contact',
          title: c.nama || 'Contact',
          info: c.contactInfo || c.linkUrl,
          icon,
          url: fixContactUrl(c.linkUrl, iconKey),
          hoverBg,
        };
      })
    : DEFAULT_CONTACT_ITEMS;

  return (
    <section id="kontak" className="w-full bg-neu-white py-16 md:py-20 px-4 md:px-8 border-b-4 border-neu-black">
      <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-10 md:gap-16 items-start">
        {/* Left info column */}
        <div className="flex-1">
          <div className="bg-neu-black text-neu-white font-mono text-xs md:text-sm font-bold px-4 py-2 border-4 border-neu-black rounded-lg shadow-[4px_4px_0px_0px_#FFD000] inline-block mb-6 md:mb-8 transform rotate-1 uppercase">
            {t('landing.contact.tag', 'CONTACT')} // ADA PERTANYAAN?
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6 uppercase tracking-tighter text-neu-black">
            MARI BERKOLABORASI
          </h2>
          <p className="font-body text-base md:text-xl text-neu-black leading-relaxed mb-6 md:mb-8 font-medium">
            {t('landing.contact.subtitle', 'Punya ide luar biasa? Atau butuh bantuan untuk masalah teknis? Tim kami siap membantu mengubah visi Anda menjadi realitas digital. Hubungi kami sekarang.')}
          </p>
        </div>

        {/* Right clickable cards */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
          {contactList.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target={item.url.startsWith('mailto:') || item.url.startsWith('tel:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              aria-label={`Hubungi via ${item.title}: ${item.info}`}
              onClick={(e) => {
                if (item.url.startsWith('mailto:')) {
                  const addr = item.url.replace('mailto:', '');
                  try {
                    navigator.clipboard.writeText(addr);
                    if (showToast) showToast(`Email disalin: ${addr}`);
                  } catch {}
                }
              }}
              className={`bg-surface-dim border-4 border-neu-black p-5 md:p-6 rounded-xl shadow-[8px_8px_0px_0px_#0D0D0D] flex items-center gap-4 md:gap-6 hover:-translate-y-2 ${item.hoverBg} transition-all select-none group text-neu-black`}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-neu-black text-neu-white border-4 border-neu-black rounded-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl md:text-4xl">
                  {item.icon}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="font-display text-xl md:text-2xl font-black uppercase text-neu-black group-hover:text-inherit">
                  {item.title}
                </h4>
                <p className="font-mono text-sm md:text-lg font-bold truncate text-neu-black/80 group-hover:text-inherit">
                  {item.info}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
