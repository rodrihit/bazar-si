import { useState } from 'react';
import { Search, ChevronRight, X, Phone, Mail, User, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface OrdersManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

export default function OrdersManager({ orders, onUpdateStatus }: OrdersManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusColors: Record<Order['status'], string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  const statusLabels: Record<Order['status'], string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    await onUpdateStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handlePrint = (order: Order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor habilitá las ventanas emergentes en tu navegador para imprimir.');
      return;
    }
    
    const currentStatusLabel = statusLabels[order.status] || 'Pendiente';
    
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
              <div style="font-size: 12px; font-weight: bold; color: #d97706; text-transform: uppercase;">Estado: ${currentStatusLabel}</div>
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

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      o.customerPhone.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex justify-between items-center bg-white/[0.01] p-1 rounded-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar pedido por nombre, email, teléfono o ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">Pedido / ID</th>
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Monto Total</th>
                <th className="px-6 py-4 font-bold">Método / Pago</th>
                <th className="px-6 py-4 font-bold">Estado</th>
                <th className="px-6 py-4 font-bold">Fecha</th>
                <th className="px-6 py-4 font-bold text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-white">{o.id.substring(0, 10)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">{o.customerName}</span>
                        <span className="text-[10px] text-gray-500">{o.customerEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-display font-medium text-primary text-sm flex items-center gap-1">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{o.paymentMethod || 'WhatsApp'}</td>
                    <td className="px-6 py-4">
                      <select 
                        onClick={(e) => e.stopPropagation()}
                        value={o.status || 'pending'}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                        className={`px-2 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider bg-black/40 cursor-pointer focus:outline-none focus:border-primary ${statusColors[o.status] || statusColors['pending']}`}
                      >
                        <option value="pending" className="bg-surface text-yellow-500 font-bold">Pendiente</option>
                        <option value="confirmed" className="bg-surface text-blue-400 font-bold">Confirmado</option>
                        <option value="shipped" className="bg-surface text-purple-400 font-bold">Enviado</option>
                        <option value="delivered" className="bg-surface text-green-400 font-bold">Entregado</option>
                        <option value="cancelled" className="bg-surface text-red-400 font-bold">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Hoy'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500 opacity-60 italic text-xs">
                    No hay pedidos en la base de datos de Paraná. Realizá compras para verlas aquí.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle del Pedido Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/5 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="font-display font-black uppercase text-sm tracking-widest text-white flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  Pedido ID: {selectedOrder.id.substring(0, 12)}
                </h4>
                <p className="text-[10px] text-gray-500 italic uppercase tracking-wider mt-1">Registrado el {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Client information */}
              <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Datos de Contacto</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User size={14} className="text-primary" />
                    <span className="font-bold">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={14} className="text-primary animate-pulse" />
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 col-span-1 md:col-span-2">
                    <Phone size={14} className="text-[#25D366]" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Order Status Controller inside detail */}
              <div className="flex justify-between items-center py-2 px-1">
                <span className="text-xs font-bold text-gray-300 uppercase">Estado Actual:</span>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider bg-background cursor-pointer focus:outline-none focus:border-primary ${statusColors[selectedOrder.status]}`}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Product list */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Items Solicitados ({selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)})</p>
                <div className="divide-y divide-white/5 max-h-[25vh] overflow-y-auto space-y-2">
                  {selectedOrder.items.map((item, index) => {
                    const activePrice = item.discountPrice || item.price;
                    return (
                      <div key={item.id + index} className="flex gap-4 items-center py-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden glass shrink-0">
                          <img src={item.images?.[0]} className="w-full h-full object-cover grayscale-[0.1]" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {item.quantity} Ud. x {formatCurrency(activePrice)}
                          </p>
                        </div>
                        <div className="font-display font-bold text-primary text-xs">
                          {formatCurrency(activePrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Proof details from customer */}
              {(selectedOrder.paymentProofComment || selectedOrder.paymentProofUrl) && (
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Comprobante Recibido desde la Web</p>
                  </div>
                  <div className="text-xs space-y-2 text-gray-300">
                    {selectedOrder.paymentProofComment && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block">Referencia Informada:</span>
                        <p className="text-white mt-1 text-xs whitespace-pre-line bg-black/30 p-3 rounded-xl border border-white/5 font-medium leading-relaxed">
                          {selectedOrder.paymentProofComment}
                        </p>
                      </div>
                    )}
                    {selectedOrder.paymentProofUrl && (
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Imagen del Recibo:</span>
                        <div className="inline-block relative rounded-xl overflow-hidden glass border border-white/15 cursor-pointer max-w-[200px]" onClick={() => window.open(selectedOrder.paymentProofUrl, '_blank')}>
                          <img src={selectedOrder.paymentProofUrl} className="w-full h-auto max-h-48 object-contain hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        </div>
                        <p className="text-[8px] text-gray-500 mt-1 uppercase italic font-bold">Haz clic en la captura para ampliarla</p>
                      </div>
                    )}
                    {selectedOrder.paymentProofUpdatedAt && (
                      <p className="text-[9px] text-gray-500 mt-1 uppercase block font-black">
                        Fecha de Envío: {new Date(selectedOrder.paymentProofUpdatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary and payment method */}
              <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">Método de Pago elegido</p>
                  <p className="text-xs font-bold text-gray-300 mt-0.5">{selectedOrder.paymentMethod || 'Efectivo / Transferencia'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Monto Total Recibido</p>
                  <p className="text-xl font-display font-black text-primary">{formatCurrency(selectedOrder.total)}</p>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-white/[0.01] border-t border-white/5 flex flex-wrap md:flex-nowrap gap-3">
              <button 
                type="button"
                onClick={() => handlePrint(selectedOrder)}
                className="flex-1 bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-gray-300 hover:text-black py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <FileText size={14} />
                Imprimir Remito
              </button>
              <button 
                onClick={() => {
                  const itemsText = selectedOrder.items.map(item => `- ${item.quantity}x ${item.name} (${formatCurrency((item.discountPrice || item.price) * item.quantity)})`).join('\n');
                  const message = `Hola ${selectedOrder.customerName}! 👋 Te escribimos desde Bazar YES por tu pedido con id *${selectedOrder.id.substring(0, 8)}*. El total es *${formatCurrency(selectedOrder.total)}*.\n\nEl estado de tu pedido es *${statusLabels[selectedOrder.status]}*.\n¿Cómo querés coordinar la entrega? Muchas gracias!`;
                  window.open(`https://wa.me/${selectedOrder.customerPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex-1 bg-[#25D366] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Phone size={14} />
                Chatear con Cliente
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
