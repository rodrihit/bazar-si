import React, { useState, useEffect, useRef } from 'react';
import { Save, Globe, Smartphone, Bell, Palette, Check, HelpCircle, Image as ImageIcon, Upload, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState<'info' | 'integrations' | 'notifications' | 'design'>('info');
  
  // Dynamic settings with localStorage persistence
  const [siteName, setSiteName] = useState(() => localStorage.getItem('bazar_yes_name') || 'Bazar YES');
  const [tagline, setTagline] = useState(() => localStorage.getItem('bazar_yes_tagline') || 'Tu Bazar desde 1985');
  const [whatsapp, setWhatsapp] = useState(() => localStorage.getItem('bazar_yes_whatsapp') || '5493435033268');
  const [address, setAddress] = useState(() => localStorage.getItem('bazar_yes_address') || 'Paraná, Entre Ríos, Argentina');
  const [emailNotification, setEmailNotification] = useState(() => localStorage.getItem('bazar_yes_email') || 'rodrigofrison88@gmail.com');
  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('bazar_yes_maintenance') === 'true');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('bazar_yes_accent') || '#00A299');
  const [bypassCode, setBypassCode] = useState(() => localStorage.getItem('bazar_yes_bypass') || 'YES2024');

  // Hero Cover showcase image & Background image settings
  const [heroImage, setHeroImage] = useState(() => localStorage.getItem('bazar_yes_hero_image') || 'https://images.unsplash.com/photo-1544190807-c19956461c3c?auto=format&fit=crop&q=80&w=1000');
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('bazar_yes_hero_bg') || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600');
  const [heroVideo, setHeroVideo] = useState(() => localStorage.getItem('bazar_yes_hero_video') || 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-interior-with-modern-furniture-and-plants-41584-large.mp4');

  // N8N Integration configurations
  const [n8nEnabled, setN8nEnabled] = useState(() => localStorage.getItem('bazar_yes_n8n_enabled') !== 'false');
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(() => localStorage.getItem('bazar_yes_n8n_webhook_url') || 'https://n8n.tu-servidor.com/webhook/stock-alert');
  const [n8nSellersWhatsapp, setN8nSellersWhatsapp] = useState(() => localStorage.getItem('bazar_yes_n8n_sellers_whatsapp') || '5493435033268');
  const [n8nSupplierDefaultPhone, setN8nSupplierDefaultPhone] = useState(() => localStorage.getItem('bazar_yes_n8n_supplier_default_phone') || '5493435033268');
  const [n8nReorderAmount, setN8nReorderAmount] = useState(() => Number(localStorage.getItem('bazar_yes_n8n_reorder_amount') || '20'));

  const showcaseFileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const COVER_PRESETS = [
    { url: 'https://images.unsplash.com/photo-1544190807-c19956461c3c?auto=format&fit=crop&q=80&w=1000', label: 'Vajilla Gris' },
    { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000', label: 'Cocina Moderna' },
    { url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=1000', label: 'Especieros' },
    { url: 'https://images.unsplash.com/photo-1530631673369-bc24f5803788?auto=format&fit=crop&q=80&w=1000', label: 'Tazas Clásicas' }
  ];

  const BACKGROUND_PRESETS = [
    { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600', label: 'Cocina Industrial' },
    { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1600', label: 'Estante Moderno' },
    { url: 'https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=1600', label: 'Madera Cálida' }
  ];

  const VIDEO_PRESETS = [
    { url: 'https://assets.mixkit.co/videos/preview/mixkit-kitchen-interior-with-modern-furniture-and-plants-41584-large.mp4', label: 'Cocina y Plantas' },
    { url: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-water-into-a-filter-coffee-maker-34440-large.mp4', label: 'Café de Especialidad' },
    { url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-chef-slicing-vegetables-on-a-wooden-board-40043-large.mp4', label: 'Preparación de Chef' }
  ];

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) { // 15MB warning for videos
      toast.error('El video supera el límite de 15MB. Utilizá mejor un enlace directo de internet para rapidez.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setHeroVideo(event.target?.result as string);
      toast.success('Video cargado con éxito');
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'showcase' | 'bg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = target === 'bg' ? 1000 : 800;
        const MAX_HEIGHT = target === 'bg' ? 700 : 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          if (target === 'showcase') {
            setHeroImage(compressedBase64);
          } else {
            setHeroBg(compressedBase64);
          }
          toast.success('Imagen cargada y procesada con éxito');
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('bazar_yes_name', siteName);
      localStorage.setItem('bazar_yes_tagline', tagline);
      localStorage.setItem('bazar_yes_whatsapp', whatsapp);
      localStorage.setItem('bazar_yes_address', address);
      localStorage.setItem('bazar_yes_email', emailNotification);
      localStorage.setItem('bazar_yes_maintenance', String(maintenanceMode));
      localStorage.setItem('bazar_yes_accent', accentColor);
      localStorage.setItem('bazar_yes_bypass', bypassCode);
      localStorage.setItem('bazar_yes_hero_image', heroImage);
      localStorage.setItem('bazar_yes_hero_bg', heroBg);
      localStorage.setItem('bazar_yes_hero_video', heroVideo);

      // Save N8N automation settings
      localStorage.setItem('bazar_yes_n8n_enabled', String(n8nEnabled));
      localStorage.setItem('bazar_yes_n8n_webhook_url', n8nWebhookUrl);
      localStorage.setItem('bazar_yes_n8n_sellers_whatsapp', n8nSellersWhatsapp);
      localStorage.setItem('bazar_yes_n8n_supplier_default_phone', n8nSupplierDefaultPhone);
      localStorage.setItem('bazar_yes_n8n_reorder_amount', String(n8nReorderAmount));

      toast.success('Configuración guardada y aplicada con éxito');
      
      // Update the active theme/accent color globally in document if they want
      document.documentElement.style.setProperty('--color-primary', accentColor);
    } catch (e) {
      toast.error('Error al guardar configuración');
    }
  };

  const tabs = [
    { id: 'info', icon: Globe, label: 'Información del Sitio', desc: 'Nombre, eslogan y dirección física.' },
    { id: 'integrations', icon: Smartphone, label: 'Integraciones', desc: 'WhatsApp, Pixel y Códigos de Bypass.' },
    { id: 'notifications', icon: Bell, label: 'Notificaciones', desc: 'Alerta de pedidos por Correo o Mensaje.' },
    { id: 'design', icon: Palette, label: 'Diseño Global', desc: 'Personalización de colores del Bazar.' }
  ] as const;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Category selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`glass p-6 rounded-2xl text-left hover:bg-white/5 transition-all group border ${isActive ? 'border-primary bg-primary/5' : 'border-white/5 bg-transparent'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isActive ? 'bg-primary text-black' : 'bg-primary/10 text-primary'}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-xs text-white uppercase tracking-wider line-clamp-1">{tab.label}</h3>
              <p className="text-[10px] text-gray-500 leading-normal mt-1 line-clamp-2">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Editor Content Box */}
      <div className="glass p-8 rounded-3xl space-y-6 border border-white/5">
        <h3 className="font-display font-black uppercase tracking-widest text-sm text-primary flex items-center gap-2">
          {tabs.find(t => t.id === activeTab)?.label}
        </h3>
        
        <div className="space-y-6 py-2">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Comercial del Bazar</label>
                <input 
                  type="text" 
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Ej: Bazar YES"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Eslogan / Año de Fundación</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ej: Desde 1985 con calidad garantizada"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white" 
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dirección Comercial (Física en Paraná)</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej: Corrientes 123, Paraná, Entre Ríos"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white" 
                />
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono de WhatsApp (Destinatario pedidos)</label>
                  <span className="text-[9px] text-gray-500 uppercase">Usar código país sin símbolos</span>
                </div>
                <input 
                  type="text" 
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 5493435033268"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono font-bold" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Código bypass de seguridad (Admin)</label>
                  <span className="text-[9px] text-gray-500 uppercase">Código rápido para panel admin</span>
                </div>
                <input 
                  type="text" 
                  value={bypassCode}
                  onChange={(e) => setBypassCode(e.target.value)}
                  placeholder="Ej: YES2024"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono font-bold" 
                />
              </div>

              {/* N8N Automated Replenishment subsection */}
              <div className="md:col-span-2 border-t border-white/5 pt-6 mt-4 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Flujo de Automatización de Reabastecimiento (N8N)</h4>
                    <p className="text-[10px] text-gray-500 uppercase mt-1">Conecta con N8N al alcanzar stock crítico (≤ 5 unidades)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setN8nEnabled(!n8nEnabled)}
                    className={`w-12 h-6 rounded-full relative p-1 transition-colors ${n8nEnabled ? 'bg-primary' : 'bg-gray-800'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${n8nEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {n8nEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4 md:space-y-0">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">URL del Webhook de N8N</label>
                      <input 
                        type="url" 
                        value={n8nWebhookUrl}
                        onChange={(e) => setN8nWebhookUrl(e.target.value)}
                        placeholder="https://instancia.n8n.cloud/webhook/..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white font-mono" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">WhatsApp del Vendedor / Vendedores</label>
                      <input 
                        type="text" 
                        value={n8nSellersWhatsapp}
                        onChange={(e) => setN8nSellersWhatsapp(e.target.value)}
                        placeholder="Ej: 5493435033268"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white font-mono" 
                      />
                      <span className="text-[8px] text-gray-500 block uppercase pt-0.5">Para la notificación de cotización inicial</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">WhatsApp Proveedor (Predeterminado)</label>
                      <input 
                        type="text" 
                        value={n8nSupplierDefaultPhone}
                        onChange={(e) => setN8nSupplierDefaultPhone(e.target.value)}
                        placeholder="Ej: 5493435033268"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white font-mono" 
                      />
                      <span className="text-[8px] text-gray-500 block uppercase pt-0.5">Destinatario al confirmar pedido de compra</span>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Cantidad Mínima de Compra Propuesta</label>
                      <input 
                        type="number" 
                        value={n8nReorderAmount}
                        onChange={(e) => setN8nReorderAmount(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white font-mono" 
                      />
                      <span className="text-[8px] text-gray-500 block uppercase pt-0.5">Unidades sugeridas por defecto en la alerta del proveedor</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Correo Electrónico para Alertas</label>
                <input 
                  type="email" 
                  value={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.value)}
                  placeholder="Ej: novedades@bazar-yes.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white" 
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wide">Modo de Mantenimiento / Cierre de Tienda</div>
                  <div className="text-[9px] text-gray-500 uppercase mt-0.5">Oculta el catálogo temporalmente para mantenimiento interno</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-12 h-6 rounded-full relative p-1 transition-colors ${maintenanceMode ? 'bg-primary' : 'bg-gray-800'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Color Primario Acercado</label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-12 bg-transparent border border-white/10 rounded-xl cursor-pointer p-1" 
                    />
                    <div>
                      <span className="font-mono text-xs text-white uppercase font-bold">{accentColor}</span>
                      <p className="text-[9px] text-gray-500 uppercase mt-0.5">Define el color de los loaders, botones y precios</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paletas predefinidas de Paraná</label>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setAccentColor('#00A299')}
                      className="w-8 h-8 rounded-full bg-[#00A299] flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
                      title="Verde Esmeralda Bazar"
                    >
                      {accentColor === '#00A299' && <Check size={12} className="text-white font-bold" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAccentColor('#E1B24E')}
                      className="w-8 h-8 rounded-full bg-[#E1B24E] flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
                      title="Dorado YES"
                    >
                      {accentColor === '#E1B24E' && <Check size={12} className="text-white" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAccentColor('#FF3B30')}
                      className="w-8 h-8 rounded-full bg-[#FF3B30] flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
                      title="Rojo Coral"
                    >
                      {accentColor === '#FF3B30' && <Check size={12} className="text-white" />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAccentColor('#BD00D6')}
                      className="w-8 h-8 rounded-full bg-[#BD00D6] flex items-center justify-center border border-white/20 active:scale-90 transition-transform"
                      title="Orquídea Eléctrico"
                    >
                      {accentColor === '#BD00D6' && <Check size={12} className="text-white" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Nuevas opciones de Portada y Fondo */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                    <ImageIcon size={14} className="text-primary" />
                    Personalización de Imágenes de la Portada
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase">
                    Cargá tus propias fotos desde tu computadora o celular para que se reflejen de inmediato en la página principal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Foto de Portada (Der / Showcase) */}
                  <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        1. Foto en Tarjeta Principal (Showcase)
                      </span>
                      <span className="text-[8px] font-mono text-gray-400 uppercase bg-white/5 px-2 py-0.5 rounded">
                        Lado Derecho
                      </span>
                    </div>

                    {/* Previsualización */}
                    <div className="relative aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5 flex items-center justify-center">
                      {heroImage ? (
                        <img 
                          src={heroImage} 
                          alt="Previsualización Portada" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-gray-600 text-xs text-center p-4">Sin imagen seleccionada</div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2.5 py-1 rounded-md text-[8px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                        Vista Previa
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={showcaseFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'showcase')}
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => showcaseFileInputRef.current?.click()}
                        className="flex-1 bg-white/10 border border-white/10 text-white rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-white/15 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={14} />
                        Subir Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroImage('https://images.unsplash.com/photo-1544190807-c19956461c3c?auto=format&fit=crop&q=80&w=1000')}
                        className="bg-white/5 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl p-2.5 text-xs transition-all"
                        title="Restaurar predeterminada"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    {/* Enlace directo */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">O pega un enlace de internet (URL)</label>
                      <input 
                        type="text" 
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-primary text-white font-mono" 
                      />
                    </div>

                    {/* Presets list */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Presets rápidos recomendados</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {COVER_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setHeroImage(preset.url)}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border text-left transition-all truncate hover:bg-white/5 ${heroImage === preset.url ? 'border-primary/50 text-primary bg-primary/5' : 'border-white/5 text-gray-400'}`}
                          >
                            ⭐ {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Foto de Fondo (Hero BG) */}
                  <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                        2. Imagen de Fondo Difuminado
                      </span>
                      <span className="text-[8px] font-mono text-gray-500 uppercase bg-white/5 px-2 py-0.5 rounded">
                        Fondo Completo
                      </span>
                    </div>

                    {/* Previsualización */}
                    <div className="relative aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5 flex items-center justify-center">
                      {heroBg ? (
                        <img 
                          src={heroBg} 
                          alt="Previsualización Fondo" 
                          className="w-full h-full object-cover opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-gray-600 text-xs text-center p-4">Sin imagen seleccionada</div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/70 px-2.5 py-1 rounded-md text-[8px] font-mono font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                        Vista Previa
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        ref={bgFileInputRef}
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'bg')}
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={() => bgFileInputRef.current?.click()}
                        className="flex-1 bg-white/10 border border-white/10 text-white rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-white/15 transition-all flex items-center justify-center gap-2"
                      >
                        <Upload size={14} />
                        Subir Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroBg('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1600')}
                        className="bg-white/5 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl p-2.5 text-xs transition-all"
                        title="Restaurar predeterminada"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>

                    {/* Enlace directo */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">O pega un enlace de internet (URL)</label>
                      <input 
                        type="text" 
                        value={heroBg}
                        onChange={(e) => setHeroBg(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-primary text-white font-mono" 
                      />
                    </div>

                    {/* Presets list */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Presets rápidos recomendados</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BACKGROUND_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setHeroBg(preset.url)}
                            className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border text-left transition-all truncate hover:bg-white/5 ${heroBg === preset.url ? 'border-primary/50 text-primary bg-primary/5' : 'border-white/5 text-gray-400'}`}
                          >
                            ⭐ {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nueva sección de Video de Presentación "Quiénes Somos / Conocenos" */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div>
                  <h4 className="font-display font-black text-xs uppercase text-white tracking-widest flex items-center gap-2 mb-1">
                    🎥 Video de Presentación ("Conocenos")
                  </h4>
                  <p className="text-[10px] text-gray-500 uppercase">
                    Configurá el video que se reproducirá en pantalla completa cuando los clientes hagan clic en el botón "CONOCENOS" de la portada. ideal para presentar al equipo o mostrar la tienda.
                  </p>
                </div>

                <div className="glass p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    
                    {/* Previsualización del Video */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                        Vista Previa del Video
                      </span>
                      <div className="relative aspect-video rounded-xl bg-black/40 overflow-hidden border border-white/5 flex items-center justify-center">
                        {heroVideo ? (
                          <video 
                            key={heroVideo}
                            src={heroVideo} 
                            controls 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-gray-600 text-xs text-center p-4">Sin video configurado</div>
                        )}
                      </div>
                    </div>

                    {/* Controles de carga/edición */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                        Opciones de Video
                      </span>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          ref={videoFileInputRef}
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden" 
                        />
                        <button
                          type="button"
                          onClick={() => videoFileInputRef.current?.click()}
                          className="flex-1 bg-white/10 border border-white/10 text-white rounded-xl py-2.5 px-4 text-xs font-bold uppercase tracking-wider hover:bg-white/15 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload size={14} />
                          Subir Corto (Max 15MB)
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroVideo('https://assets.mixkit.co/videos/preview/mixkit-kitchen-interior-with-modern-furniture-and-plants-41584-large.mp4')}
                          className="bg-white/5 border border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-400 rounded-xl p-2.5 text-xs transition-all"
                          title="Restaurar predeterminado de muestra"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>

                      {/* Enlace directo */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Enlace directo al Video (URL de MP4)</label>
                        <input 
                          type="text" 
                          value={heroVideo}
                          onChange={(e) => setHeroVideo(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:border-primary text-white font-mono" 
                        />
                      </div>

                      {/* Presets list */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest font-bold">Muestras dinámicas de Bazar</label>
                        <div className="flex flex-col gap-1.5">
                          {VIDEO_PRESETS.map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setHeroVideo(preset.url)}
                              className={`px-3 py-2 text-[9px] font-bold rounded-lg border text-left transition-all truncate hover:bg-white/5 ${heroVideo === preset.url ? 'border-primary/50 text-primary bg-primary/5' : 'border-white/5 text-gray-400'}`}
                            >
                              🎬 {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Action Selector button */}
        <div className="pt-4 border-t border-white/5">
          <button 
            type="button"
            onClick={handleSave}
            className="w-full bg-primary text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01]"
          >
            <Save size={16} />
            Aplicar y Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
