import {
  FaWhatsapp, FaPhone, FaTelegram, FaEnvelope,
  FaInstagram, FaFacebook, FaTwitter, FaYoutube,
  FaTiktok, FaLinkedin, FaLine, FaGlobe,
} from 'react-icons/fa';

export const PLATFORMS = [
  { key: 'whatsapp',  label: 'WhatsApp',  Icon: FaWhatsapp,  color: '#25D366' },
  { key: 'phone',     label: 'Telepon',   Icon: FaPhone,     color: '#0D0D0D' },
  { key: 'telegram',  label: 'Telegram',  Icon: FaTelegram,  color: '#229ED9' },
  { key: 'email',     label: 'Email',     Icon: FaEnvelope,  color: '#EA4335' },
  { key: 'instagram', label: 'Instagram', Icon: FaInstagram, color: '#E1306C' },
  { key: 'facebook',  label: 'Facebook',  Icon: FaFacebook,  color: '#1877F2' },
  { key: 'twitter',   label: 'Twitter/X', Icon: FaTwitter,   color: '#1DA1F2' },
  { key: 'youtube',   label: 'YouTube',   Icon: FaYoutube,   color: '#FF0000' },
  { key: 'tiktok',    label: 'TikTok',    Icon: FaTiktok,    color: '#0D0D0D' },
  { key: 'linkedin',  label: 'LinkedIn',  Icon: FaLinkedin,  color: '#0A66C2' },
  { key: 'line',      label: 'Line',      Icon: FaLine,      color: '#00C300' },
  { key: 'website',   label: 'Website',   Icon: FaGlobe,     color: '#4D61FF' },
];

export const getPlatform = (key) =>
  PLATFORMS.find(p => p.key === key) ?? { key, label: key, Icon: FaGlobe, color: '#0D0D0D' };
