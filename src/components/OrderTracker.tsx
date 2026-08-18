import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { getOrderDetailsFromDb, submitPaymentProofInDb } from '../services/dataService';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { Search, Loader2, Upload, CheckCircle, Clock, ShoppingCart, Truck, CheckCircle2, ChevronRight, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderTracker() {
  const { db } = useFirebase();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Payment proof form state
  const [comment, setComment] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = orderId.trim();
    if (!cleanId) return;

    setLoading(true);
    try {
      const details = await getOrderDetailsFromDb(db, cleanId);
      if (details) {
        setOrder(details);
        setComment(details.paymentProofComment || '');
        setProofImage(details.paymentProofUrl || '');
        toast.success('Pedido encontrado');
      } else {
        setOrder(null);
        toast.error('No se encontró ningún pedido con ese ID');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al consultar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setProofImage(e.target.result as string);
        toast.success('Comprobante cargado exitosamente');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const fileInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!comment && !proofImage) {
      toast.error('Ingresá una referencia de pago o subí un comprobante');
      return;
    }

    setIsSubmittingProof(true);
    try {
      await submitPaymentProofInDb(db, order.id, comment.trim(), proofImage);
      
      // Update local state is crucial
      setOrder(prev => prev ? {
        ...prev,
        paymentProofComment: comment.trim(),
        paymentProofUrl: proofImage,
        paymentProofUpdatedAt: new Date().toISOString()
      } : null);
      
      toast.success('¡Comprobante informado con éxito!');
    } catch (e) {
      console.error(e);
      toast.error('Error al guardar comprobante');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const statusProgress: Record<Order['status'], number> = {
    pending: 1,
    confirmed: 2,
    shipped: 3,
    delivered: 4,
    cancelled: 0,
  };

  const statusTexts: Record<Order['status'], { title: string; desc: string; color: string }> = {
    pending: { title: 'Pendiente de Pago', desc: 'Registramos tu pedido. Subí tu transferencia para confirmarlo.', color: 'text-yellow-500' },
    confirmed: { title: 'Pago Confirmado', desc: '¡Recibimos tu pago! Estamos preparando tus productos.', color: 'text-blue-400' },
    shipped: { title: 'Pedido Enviado', desc: 'Tu paquete ya fue despachado en viaje.', color: 'text-purple-400' },
    delivered: { title: 'Entregado', desc: '¡Pedido entregado con éxito en tu dirección!', color: 'text-green-400' },
    cancelled: { title: 'Cancelado', desc: 'El pedido ha sido anulado por el administrador.', color: 'text-red-400' },
  };

  const handlePrint = () => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Por favor habilitá las ventanas emergentes en tu navegador para imprimir.');
      return;
    }
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 11px;">BY-${item.id.substring(0, 8).toUpperCase()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-family: sans-serif; font-size: 12px; font-weight: bold; color: #111;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; font-family: sans-serif; font-size: 12px; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace; font-size: 12px;">${formatCurrency(item.discountPrice || item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace; font-size: 12px; font-weight: bold;">${formatCurrency((item.discountPrice || item.price) * item.quantity)}</td>
      </tr>
    `).join('');

    const couponHtml = order.couponApplied ? `
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; color: #059669; font-weight: bold;">
        <span>Cupón de Descuento [${order.couponApplied.code}]:</span>
        <span>-${formatCurrency(order.couponApplied.discountAmount)}</span>
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Remito de Preparación - Bazar YES #${order.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.4; }
            .header { border-bottom: 3px solid #000; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
            .company { font-size: 26px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
            .company span { color: #00F0FF; background: #000; padding: 2px 8px; border-radius: 4px; color: #fff; margin-left: 2px; }
            .details { margin-bottom: 30px; display: flex; gap: 20px; }
            .details-block { flex: 1; padding: 15px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb; }
            .details-title { font-weight: 800; margin-bottom: 8px; text-transform: uppercase; font-size: 10px; color: #4b5563; letter-spacing: 0.5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            th { background: #f3f4f6; padding: 12px 10px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 800; text-transform: uppercase; font-size: 10px; color: #4b5563; }
            .total-box { float: right; width: 320px; padding: 20px; border: 2px solid #000; border-radius: 12px; background: #fff; box-shadow: 4px 4px 0px #000; }
            .footer-info { margin-top: 120px; text-align: center; font-size: 10px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
            @media print {
              body { padding: 0; }
              .details-block { background: none; }
              .total-box { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="company">BAZAR <span>YES</span></div>
              <p style="font-size: 9px; color: #4b5563; margin: 5px 0 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Paraná, Entre Ríos • Tienda de Decoración y Bazar Doméstico</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; background: #000; color: #fff; padding: 3px 10px; border-radius: 4px; display: inline-block;">Remito de Preparación</div>
              <p style="font-size: 12px; font-family: monospace; color: #111; margin: 8px 0 0 0; font-weight: bold;">ID: ${order.id}</p>
              <p style="font-size: 10px; color: #4b5563; margin: 2px 0 0 0;">Pedido el: ${new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div class="details">
            <div class="details-block">
              <div class="details-title">👤 Datos del Cliente</div>
              <div style="font-size: 14px; font-weight: bold; color: #111;">${order.customerName}</div>
              <div style="font-size: 12px; margin-top: 5px; color: #374151;">WhatsApp: ${order.customerPhone}</div>
              <div style="font-size: 12px; color: #374151;">Email: ${order.customerEmail}</div>
            </div>
            <div class="details-block">
              <div class="details-title">🚚 Logística y Despacho</div>
              <div style="font-size: 14px; font-weight: bold; color: #111;">Zona de Entrega: Paraná Centro</div>
              <div style="font-size: 12px; margin-top: 5px; color: #374151;">Método: Envío Sin Cargo (Paraná)</div>
              <div style="font-size: 12px; font-weight: bold; color: #d97706; text-transform: uppercase;">Estado: ${order.status === 'pending' ? 'PREPARACION PENDIENTE DE TRANSFERENCIA' : 'PAGO CONFIRMADO - LISTO PARA DESPACHO'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 120px;">SKU / CÓDIGO</th>
                <th>DESCRIPCIÓN DEL ARTÍCULO</th>
                <th style="width: 80px; text-align: center;">CANTIDAD</th>
                <th style="width: 110px; text-align: right;">P. UNITARIO</th>
                <th style="width: 110px; text-align: right;">TOTAL NETO</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="width: 100%; overflow: hidden; margin-top: 10px;">
            <div class="total-box">
              <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #4b5563;">
                <span>Subtotal Neto:</span>
                <span>${formatCurrency(order.items.reduce((acc, it) => acc + (it.discountPrice || it.price) * it.quantity, 0))}</span>
              </div>
              ${couponHtml}
              <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 2px dashed #000; padding-top: 8px; margin-top: 8px; text-transform: uppercase;">
                <span>Total Final:</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div class="footer-info">
            ¡Muchas gracias por elegirnos! • Bazar YES Paraná - Casa de Diseños Cálidos
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => { window.close(); }, 800);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <section id="seguimiento" className="py-24 px-6 max-w-4xl mx-auto scroll-mt-20">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-4xl font-display font-black uppercase tracking-tight">
          SEGUIMIENTO <span className="text-primary italic">DE PEDIDOS</span>
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-xs uppercase tracking-wider">
          Ingresá el Identificador de tu compra para verificar su estado en tiempo real y subir tu comprobante de pago.
        </p>
        <div className="h-1 w-24 bg-primary rounded-full mx-auto" />
      </div>

      <div className="space-y-8">
        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              required
              placeholder="Ej: order_17283948..." 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-6 py-4 text-sm focus:outline-none focus:border-primary text-white font-mono"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-[#00c2b7] text-black px-8 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            <span>Buscar</span>
          </button>
        </form>

        {/* Display Order Details if Found */}
        {order ? (
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 space-y-8">
            
            {/* Upper status summary bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">ID de Pedido</span>
                  <span className="font-mono text-sm font-black text-white">{order.id}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-gray-300 hover:text-black font-black uppercase text-[9px] tracking-widest px-3 h-9 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <FileText size={12} />
                  <span>Imprimir Remito</span>
                </button>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">Estado del Envío</span>
                <span className={`text-sm font-black uppercase tracking-widest ${statusTexts[order.status].color}`}>
                  {statusTexts[order.status].title}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1">{statusTexts[order.status].desc}</span>
              </div>
            </div>

            {/* Visual Stepper tracker bar (not shown for cancelled) */}
            {order.status !== 'cancelled' && (
              <div className="space-y-4">
                <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${((statusProgress[order.status] - 1) / 3) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-4 text-center">
                  <div className={`space-y-1 text-left ${statusProgress[order.status] >= 1 ? 'text-primary' : 'text-gray-600'}`}>
                    <Clock size={16} className="mx-auto md:mx-0" />
                    <span className="hidden md:block text-[9px] uppercase font-black tracking-widest">Pendiente</span>
                  </div>
                  <div className={`space-y-1 text-center ${statusProgress[order.status] >= 2 ? 'text-primary' : 'text-gray-600'}`}>
                    <CheckCircle size={16} className="mx-auto" />
                    <span className="hidden md:block text-[9px] uppercase font-black tracking-widest">Pago Recibido</span>
                  </div>
                  <div className={`space-y-1 text-center ${statusProgress[order.status] >= 3 ? 'text-primary' : 'text-gray-600'}`}>
                    <Truck size={16} className="mx-auto" />
                    <span className="hidden md:block text-[9px] uppercase font-black tracking-widest">Despachado</span>
                  </div>
                  <div className={`space-y-1 text-right ${statusProgress[order.status] >= 4 ? 'text-primary' : 'text-gray-600'}`}>
                    <CheckCircle2 size={16} className="mx-auto md:ml-auto md:mr-0" />
                    <span className="hidden md:block text-[9px] uppercase font-black tracking-widest">Entregado</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recipient Details & Items breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-2 border-b border-white/5">
                  <FileText size={14} className="text-primary" />
                  Resumen de Entrega
                </h4>
                <div className="space-y-2 text-xs text-gray-300 font-bold uppercase tracking-wider">
                  <p className="flex justify-between"><span className="text-gray-500">Destinatario:</span> <span className="text-white">{order.customerName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">WhatsApp:</span> <span className="text-[#25D366]">{order.customerPhone}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="text-white truncate max-w-[200px]">{order.customerEmail}</span></p>
                  <p className="flex justify-between"><span className="text-gray-500">Medio Pago:</span> <span className="text-primary">{order.paymentMethod}</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2 pb-2 border-b border-white/5">
                  <ShoppingCart size={14} className="text-primary" />
                  Artículos Comprados
                </h4>
                <div className="divide-y divide-white/5 max-h-[150px] overflow-y-auto space-y-2">
                  {order.items.map((item, id) => (
                    <div key={item.id + id} className="flex justify-between items-center text-xs py-1.5">
                      <span className="text-gray-300 font-bold line-clamp-1 truncate max-w-[200px]">{item.name} <span className="text-primary">x{item.quantity}</span></span>
                      <span className="font-mono text-primary font-bold">
                        {formatCurrency((item.discountPrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between items-center font-display font-black">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total del Pedido</span>
                  <span className="text-base text-primary">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Inform Payment section only for pending orders */}
            {order.status === 'pending' && (
              <div className="mt-8 border-t border-white/5 pt-8 space-y-4">
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
                  <Upload size={14} className="text-primary" />
                  Informar Pago de Transferencia
                </h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-relaxed">
                  Para confirmar tu pedido en Paraná, por favor envíanos los datos de tu transferencia bancaria o billetera (MercadoPago/Miriada) y opcionalmente adjunta tu captura de pantalla de comprobante.
                </p>

                <form onSubmit={handleSubmitProof} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Text comment */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Referencia / Banco Origen</label>
                      <textarea 
                        rows={5}
                        required
                        placeholder="Ej: Transferí desde Brubank. Cta origen a nombre de Juan Perez. Referencia de transf: #283949."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white resize-none"
                      />
                    </div>

                    {/* Right: Drag and Drop photo */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Captura del Recibo / Comprobante</label>
                      
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`w-full h-[105px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all relative ${
                          proofImage ? 'border-primary/40 bg-primary/5' : dragActive ? 'border-primary bg-white/5' : 'border-white/10 bg-white/[0.01] hover:bg-white/5'
                        }`}
                      >
                        {proofImage ? (
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle2 size={24} className="text-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Comprobante Listo</span>
                            <button 
                              type="button" 
                              onClick={() => setProofImage('')}
                              className="text-[8px] text-red-400 font-bold uppercase tracking-widest hover:underline mt-1"
                            >
                              Eliminar y Cambiar
                            </button>
                          </div>
                        ) : (
                          <div className="text-center space-y-1">
                            <Upload size={20} className="text-gray-500 mx-auto" />
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                              Elegí o Arrastrá Imagen
                            </p>
                            <label className="text-[8px] text-primary font-bold cursor-pointer hover:underline block uppercase">
                              Buscar Archivo
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={fileInputHandler} 
                                className="hidden" 
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingProof}
                    className="w-full bg-primary hover:bg-[#00c2b7] text-black h-12 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    {isSubmittingProof ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                    <span>Registrar Comprobante de Pago</span>
                  </button>
                </form>
              </div>
            )}

            {/* Display receipt proof summary if already uploaded */}
            {order.paymentProofUpdatedAt && (
              <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Comprobante Informado Exitosamente</span>
                </div>
                <div className="text-xs space-y-1 font-bold">
                  <p className="text-gray-400 uppercase text-[9px] tracking-wider font-bold">Detalle Registrado:</p>
                  <p className="text-white bg-white/5 px-3 py-2 rounded-xl text-xs whitespace-pre-line font-medium leading-relaxed">{order.paymentProofComment}</p>
                  {order.paymentProofUrl && (
                    <div className="pt-2">
                      <span className="text-gray-400 uppercase text-[9px] tracking-wider font-bold block mb-1">Adjunto Guardado:</span>
                      <div className="inline-block w-24 h-24 rounded-lg overflow-hidden border border-white/10 glass cursor-pointer hover:border-primary/5" onClick={() => window.open(order.paymentProofUrl, '_blank')}>
                        <img src={order.paymentProofUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest pt-2 font-bold">Fecha de Carga: {new Date(order.paymentProofUpdatedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="bg-white/[0.01] border border-white/5 py-12 px-6 rounded-3xl text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
              <AlertCircle size={20} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ingresá tu código arriba para realizar el seguimiento.</p>
          </div>
        )}
      </div>
    </section>
  );
}
