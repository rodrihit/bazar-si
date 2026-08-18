import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const whatsappNumber = typeof window !== 'undefined' ? (localStorage.getItem('bazar_yes_whatsapp') || '5493435033268') : '5493435033268';
  return (
    <a 
      href={`https://wa.me/${whatsappNumber}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:scale-110 transition-transform active:scale-95"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={32} fill="white" />
    </a>
  );
}
