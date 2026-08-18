import React, { useState, useEffect } from 'react';
import { 
  getQuotationsFromDb, 
  saveQuotationToDb, 
  triggerN8NWebhook 
} from '../../services/dataService';
import { Quotation } from '../../types';
import { useFirebase } from '../../context/FirebaseContext';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Send, 
  Edit2, 
  RefreshCw, 
  PhoneCall, 
  Trash2,
  Settings,
  CircleDollarSign,
  Package,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationsManager() {
  const { db } = useFirebase();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form edit states
  const [editQty, setEditQty] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSupplierPhone, setEditSupplierPhone] = useState<string>('');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await getQuotationsFromDb(db);
      setQuotations(data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [db]);

  const handleStartEdit = (q: Quotation) => {
    setEditingId(q.id);
    setEditQty(q.minQuantity);
    setEditPrice(q.unitPrice);
    setEditSupplierPhone(q.supplierPhone || '5493435033268');
  };

  const handleSaveEdit = async (q: Quotation) => {
    try {
      const updated: Quotation = {
        ...q,
        minQuantity: editQty,
        unitPrice: editPrice,
        supplierPhone: editSupplierPhone,
        updatedAt: new Date().toISOString()
      };
      await saveQuotationToDb(db, updated);
      toast.success('Cambios en la cotización guardados');
      setEditingId(null);
      fetchQuotations();
    } catch {
      toast.error('No se pudo guardar la modificación');
    }
  };

  const handleAnnulQuotation = async (q: Quotation) => {
    try {
      const updated: Quotation = {
        ...q,
        status: 'annulled',
        updatedAt: new Date().toISOString()
      };
      await saveQuotationToDb(db, updated);
      toast.success('Cotización anulada con éxito');
      fetchQuotations();
    } catch {
      toast.error('Error al anular cotización');
    }
  };

  const handleConfirmQuotation = async (q: Quotation) => {
    try {
      const actualQty = editingId === q.id ? editQty : q.minQuantity;
      const actualPrice = editingId === q.id ? editPrice : q.unitPrice;
      const actualSupplier = editingId === q.id ? editSupplierPhone : (q.supplierPhone || '5493435033268');

      const updated: Quotation = {
        ...q,
        minQuantity: actualQty,
        unitPrice: actualPrice,
        supplierPhone: actualSupplier,
        status: 'confirmed',
        updatedAt: new Date().toISOString()
      };

      await saveQuotationToDb(db, updated);
      setEditingId(null);
      
      // Calculate total for supplier note
      const totalCost = actualQty * actualPrice;
      const formattedTotal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(totalCost);
      const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(actualPrice);

      // Trigger actual WhatsApp re-direction to supplier with the finalized specs
      const supplierMessage = `Hola! 👋 Te escribo de *Bazar YES Paraná*. \n\nConfirmamos el pedido de compra para reposición de stock del producto *${q.productName}*:\n\n• *Cantidad*: ${actualQty} unidades\n• *Precio negociado unitario*: ${formattedPrice}\n• *Total de la Orden*: ${formattedTotal}\n\nQuedamos a la espera de la entrega y facturación en el local. ¡Muchas gracias!`;
      
      const whatsappUrl = `https://wa.me/${actualSupplier.replace(/[^\d]/g, '')}?text=${encodeURIComponent(supplierMessage)}`;
      
      toast.success('Cotización aprobada. Redirigiendo al WhatsApp del Proveedor...');
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);

      fetchQuotations();
    } catch {
      toast.error('No se pudo confirmar la cotización');
    }
  };

  const handleRetryN8N = async (q: Quotation) => {
    const webhookUrl = localStorage.getItem('bazar_yes_n8n_webhook_url') || '';
    const sellersWhatsapp = localStorage.getItem('bazar_yes_n8n_sellers_whatsapp') || '5493435033268';
    
    if (!webhookUrl) {
      toast.error('Configurá la webhook url en la sección Integraciones');
      return;
    }

    toast.loading('Enviando petición a N8N...', { id: 'n8n-pulse' });
    const success = await triggerN8NWebhook(webhookUrl, q, sellersWhatsapp, q.minQuantity);
    
    if (success) {
      toast.success('Petición N8N enviada con éxito', { id: 'n8n-pulse' });
    } else {
      toast.error('Hubo un problema al conectar con N8N. Revisá que la URL sea válida.', { id: 'n8n-pulse' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
            <TrendingDown className="text-red-400" />
            Reposición Inteligente & N8N Webhooks
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">
            Monitoreo en tiempo real de stock crítico con alertas a vendedores y confirmación a proveedores
          </p>
        </div>
        <button 
          onClick={fetchQuotations}
          className="bg-white/5 hover:bg-white/10 text-white font-black text-[10px] tracking-widest uppercase px-4 py-3 rounded-xl flex items-center gap-2 border border-white/10 transition-colors self-start md:self-auto"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quotations.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-white/5">
          <Package className="mx-auto text-gray-600 mb-4 animate-bounce" size={40} />
          <h3 className="font-bold text-white uppercase tracking-wider mb-2">Sin reposiciones pendientes</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            ¡Excelente! Todos los productos de Bazar YES Paraná gozan actualmente de niveles de inventario óptimos (superiores a 5 unidades).
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 pb-2 border-b border-white/5">
            Historial de Alertas de Stock Crítico ({quotations.length})
          </div>

          <div className="grid grid-cols-1 gap-4">
            {quotations.map((q) => {
              const isEditing = editingId === q.id;
              const formattedDate = new Date(q.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div 
                  key={q.id}
                  className={`border rounded-2xl p-6 transition-all bg-surface/40 backdrop-blur-sm ${
                    q.status === 'confirmed' 
                      ? 'border-green-500/20 bg-green-950/5' 
                      : q.status === 'annulled' 
                        ? 'border-gray-800 opacity-60' 
                        : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Primary Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase text-white tracking-wide">
                          {q.productName}
                        </span>
                        
                        {/* Status badge */}
                        {q.status === 'draft' && (
                          <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Borrador / Pendiente de Revisión
                          </span>
                        )}
                        {q.status === 'confirmed' && (
                          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            ✓ Confirmado con Proveedor
                          </span>
                        )}
                        {q.status === 'annulled' && (
                          <span className="bg-gray-800 text-gray-400 border border-white/5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Anulada / Descartada
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle size={11} /> Stock Actual: {q.currentStock} unidades
                        </span>
                        <span>• Alerta: {formattedDate}</span>
                        {q.sourceWebhookUrl && (
                          <span className="text-primary font-mono text-[9px] uppercase tracking-normal">
                            N8N Webhook OK
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Trigger re-fire N8N */}
                    {q.status === 'draft' && (
                      <button
                        onClick={() => handleRetryN8N(q)}
                        className="self-start md:self-auto text-[9px] font-black tracking-widest text-[#00a299] hover:underline flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10"
                        title="Re-enviar payload directo de prueba a N8N"
                      >
                        <RefreshCw size={10} />
                        Disparar N8N
                      </button>
                    )}
                  </div>

                  {/* Pricing and parameters correction workspace */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Box quantity */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase block tracking-wider">
                        Cantidad Mínima Re-compra
                      </label>
                      {isEditing ? (
                        <input 
                          type="number"
                          value={editQty}
                          onChange={(e) => setEditQty(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary text-white"
                        />
                      ) : (
                        <div className="text-sm font-bold text-white font-mono">
                          {q.minQuantity} Unidades
                        </div>
                      )}
                    </div>

                    {/* Box unit price */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase block tracking-wider">
                        Precio Costo Est. Unidad
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs text-gray-500 font-bold">$</span>
                          <input 
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-6 pr-3 py-2 text-xs font-mono focus:outline-none focus:border-primary text-white"
                          />
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-white font-mono">
                          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(q.unitPrice || 0)}
                        </div>
                      )}
                    </div>

                    {/* Supplier WhatsApp destination */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase block tracking-wider">
                        WhatsApp Proveedor / Mayorista
                      </label>
                      {isEditing ? (
                        <input 
                          type="text"
                          value={editSupplierPhone}
                          onChange={(e) => setEditSupplierPhone(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary text-white"
                          placeholder="Código país sin símbolos"
                        />
                      ) : (
                        <div className="text-xs font-bold text-gray-300 font-mono flex items-center gap-1">
                          <PhoneCall size={10} className="text-green-400" />
                          {q.supplierPhone || '5493435033268'}
                        </div>
                      )}
                    </div>

                    {/* Computed Total Cost */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-500 font-black uppercase block tracking-wider">
                        Total de la Inversión sugerida
                      </label>
                      <div className="text-xs font-mono font-black text-primary/90">
                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                          (isEditing ? editQty * editPrice : q.minQuantity * q.unitPrice) || 0
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Actions Bar for Draft items */}
                  {q.status === 'draft' && (
                    <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap justify-end gap-2.5">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(q)}
                            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                          >
                            <Check size={11} />
                            Aplicar Corrección
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                          >
                            <X size={11} />
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(q)}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                            title="Corregir cantidad, precio o teléfono del proveedor"
                          >
                            <Edit2 size={11} className="text-primary" />
                            Corregir Cantidad / Precio
                          </button>

                          <button
                            onClick={() => handleAnnulQuotation(q)}
                            className="bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                            title="Descartar esta cotización de abastecimiento"
                          >
                            <Trash2 size={11} />
                            Anular
                          </button>

                          <button
                            onClick={() => handleConfirmQuotation(q)}
                            className="bg-primary hover:bg-[#00c2b7] text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                            title="Confirmar y re-enviar pedido al proveedor por WhatsApp"
                          >
                            <Send size={11} />
                            Aprobar y Enviar a Proveedor
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Summary footprint for non-draft items */}
                  {q.status !== 'draft' && q.updatedAt && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-500 uppercase font-black tracking-widest">
                      <span>Procesado el {new Date(q.updatedAt).toLocaleDateString()}</span>
                      <span className={q.status === 'confirmed' ? 'text-green-500/80' : 'text-gray-500'}>
                        {q.status === 'confirmed' ? 'Pedido enviado vía WhatsApp ✔' : 'Ignorado'}
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
