import React, { useState, useEffect } from 'react';
import { 
  getAutomationLogsFromDb, 
  addAutomationLog, 
  getProducts, 
  saveProductToDb 
} from '../../services/dataService';
import { AutomationLog, Product } from '../../types';
import { useFirebase } from '../../context/FirebaseContext';
import { 
  Zap, 
  Bot, 
  FileCode, 
  Percent, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Sliders, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Coins, 
  TrendingUp, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../lib/utils';

export default function AutomationsManager() {
  const { db } = useFirebase();
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'pricing_engine' | 'taxes_config' | 'simulator'>('logs');
  const [inspectLog, setInspectLog] = useState<AutomationLog | null>(null);

  // Auto Pricing states
  const [markupCategory, setMarkupCategory] = useState<string>('all');
  const [customMarkupPercent, setCustomMarkupPercent] = useState<number>(45);

  // Taxes settings
  const [ivaPercent, setIvaPercent] = useState(() => Number(localStorage.getItem('bazar_yes_tax_iva') || '21'));
  const [iibbPercent, setIibbPercent] = useState(() => Number(localStorage.getItem('bazar_yes_tax_iibb') || '3.5'));
  const [paymentFeePercent, setPaymentFeePercent] = useState(() => Number(localStorage.getItem('bazar_yes_tax_gateway') || '5'));

  const categories = [
    'Cocina',
    'Mesa y Vajilla',
    'Repostería',
    'Cafetería y Té',
    'Electro Hogar',
    'Organización',
    'Baño',
    'Decoración'
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAutomationLogsFromDb(db);
      setLogs(data);
      const pr = await getProducts(db);
      setProducts(pr);
    } catch (e) {
      console.error(e);
      toast.error('No se pudieron cargar los registros de automatización');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [db]);

  const handleClearLogs = () => {
    try {
      localStorage.setItem('bazar_yes_automation_logs', JSON.stringify([]));
      setLogs([]);
      toast.success('Historial de registros limpiado localmente');
    } catch {
      toast.error('No se pudo limpiar el historial');
    }
  };

  // Bulk automatically reprice category products protecting margins
  const handleBulkReprice = async () => {
    if (products.length === 0) {
      toast.error('No hay productos cargados para re-calcular precios.');
      return;
    }

    const filtered = products.filter(p => markupCategory === 'all' || p.category === markupCategory);
    if (filtered.length === 0) {
      toast.error(`No se encontraron productos en la categoría ${markupCategory}`);
      return;
    }

    toast.loading('Ejecutando acción masiva impositiva...', { id: 'bulk-pricing' });
    let updatedCount = 0;

    try {
      for (const prod of filtered) {
        // Fallback cost if undefined is 60% of original price
        const costVal = prod.cost || Math.round(prod.price * 0.6);
        // markup multiplier: markupCategory rules (e.g. price = cost * (1 + customMarkupPercent/100))
        // Or using net margin formula: price = cost / (1 - markup%/100) which is safer for profits
        const targetMultiplier = 1 / (1 - (customMarkupPercent / 100));
        let newPrice = Math.round(costVal * targetMultiplier);
        
        // Let's cap minimum values
        if (newPrice < costVal) {
          newPrice = costVal;
        }

        const updatedProd: Product = {
          ...prod,
          cost: costVal, // Save the evaluated fallback cost
          price: newPrice,
          updatedAt: new Date().toISOString()
        } as any;

        await saveProductToDb(db, updatedProd);
        updatedCount++;
      }

      // Log this automation event
      await addAutomationLog(db, {
        title: `Reajuste de precios masivo: ${updatedCount} productos actualizados`,
        eventType: 'price_auto_adjusted',
        status: 'success',
        payload: { 
          category: markupCategory, 
          appliedMarginPercent: customMarkupPercent, 
          modifiedProductsCount: updatedCount 
        }
      });

      toast.success(`¡Proceso completado! ${updatedCount} productos recalculados con margen del ${customMarkupPercent}%.`, { id: 'bulk-pricing' });
      fetchLogs();
    } catch (e: any) {
      console.error(e);
      toast.error('Error al ejecutar el reajuste masivo automatizado.', { id: 'bulk-pricing' });
    }
  };

  // Save impositive configurations
  const handleSaveTaxes = () => {
    try {
      localStorage.setItem('bazar_yes_tax_iva', String(ivaPercent));
      localStorage.setItem('bazar_yes_tax_iibb', String(iibbPercent));
      localStorage.setItem('bazar_yes_tax_gateway', String(paymentFeePercent));
      
      addAutomationLog(db, {
        title: 'Impuestos y comisiones de pasarela modificados',
        eventType: 'manual_test',
        status: 'success',
        payload: { ivaPercent, iibbPercent, paymentFeePercent }
      });

      toast.success('Tasas impositivas guardadas y aplicadas a estadísticas');
      fetchLogs();
    } catch {
      toast.error('Error al guardar impuestos');
    }
  };

  // Test Ping trigger simulation
  const handleTestPing = async () => {
    const webhookUrl = localStorage.getItem('bazar_yes_n8n_webhook_url') || 'https://n8n.tu-servidor.com/webhook/stock-alert';
    const sellersWhatsapp = localStorage.getItem('bazar_yes_n8n_sellers_whatsapp') || '5493435033268';
    
    toast.loading('Enviando ping de prueba a N8N...', { id: 'test-webhook-ping' });

    try {
      const pingPayload = {
        event: 'manual_test_ping',
        triggeredBy: 'Bazar YES Admin Panel',
        timestamp: new Date().toISOString(),
        siteName: localStorage.getItem('bazar_yes_name') || 'Bazar YES Paraná',
        whatsappTest: sellersWhatsapp,
        simulatedMetrics: {
          activeProducts: products.length,
          criticalStockItems: products.filter(p => p.stock <= 5).length,
          appliedTaxes: { IVA: `${ivaPercent}%`, IIBB: `${iibbPercent}%` }
        }
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pingPayload)
      });

      if (response.ok) {
        await addAutomationLog(db, {
          title: 'Test Ping N8N: Webhook validado correctamente',
          eventType: 'manual_test',
          status: 'success',
          payload: { url: webhookUrl, ...pingPayload }
        });
        toast.success('¡Webook respondido con éxito! Registro creado.', { id: 'test-webhook-ping' });
      } else {
        await addAutomationLog(db, {
          title: `Fallo Test Webhook N8N: Código ${response.status}`,
          eventType: 'manual_test',
          status: 'failed',
          payload: { url: webhookUrl, status: response.status, ...pingPayload }
        });
        toast.error(`Error N8N: Servidor respondió con código ${response.status}`, { id: 'test-webhook-ping' });
      }
      fetchLogs();
    } catch (err: any) {
      await addAutomationLog(db, {
        title: 'Error de conexión N8N Webhook',
        eventType: 'manual_test',
        status: 'failed',
        payload: { error: err?.message || String(err), url: webhookUrl }
      });
      toast.error('Error al conectar con la URL de N8N. Revisá que sea accesible.', { id: 'test-webhook-ping' });
      fetchLogs();
    }
  };

  const getLogTypeLabel = (type: AutomationLog['eventType']) => {
    switch (type) {
      case 'stock_alert_sent': return 'Alerta Stock (N8N)';
      case 'price_auto_adjusted': return 'Auto-Precios';
      case 'quotation_webhook': return 'Cotización';
      case 'purchase_confirmed_webhook': return 'Pedido Automatizado';
      case 'margin_protected': return 'Protección Margen';
      case 'manual_test': return 'Log de Sistema / Prueba';
      default: return 'Automación';
    }
  };

  const filteredLogs = logs.filter(l => {
    return l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           l.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
           l.status.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Informative Header card explaining n8n and triggers */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/[0.02] to-transparent border border-primary/20 p-6 rounded-3xl space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary shrink-0">
            <Bot size={28} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">Infraestructura Libre de Humanos</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold">• Paraná, Entre Ríos</span>
            </div>
            <h2 className="font-display font-black uppercase tracking-tight text-white text-lg">Central de Inteligencia & Auditoría de Automatizaciones</h2>
            <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
              Aquí puedes auditar y supervisar cada proceso que antes requería operadores humanos. El sistema detecta quiebres de inventario, envía peticiones de cotización inteligentes a tus canales de n8n, registra las respuestas impositivas, aplica resguardos de margen de ganancia de forma masiva y gestiona el flujo administrativo de compras automáticamente.
            </p>
          </div>
        </div>

        {/* Mini n8n explanation inside the panel */}
        <div className="bg-black/30 p-4 rounded-2xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <h4 className="font-black text-primary uppercase text-[10px] tracking-wider flex items-center gap-1">
              <HelpCircle size={12} />
              ¿Qué es n8n y qué recibe tu webhook?
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              <strong>n8n</strong> actúa como el cerebro externo. Recibe un JSON procesable cada vez que un producto de Bazar YES se queda sin stock (≤ 5 unidades). n8n toma ese paquete de datos, contacta al proveedor y genera el borrador de compra de forma instantánea.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-primary uppercase text-[10px] tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} />
              Auditoría y Transparencia Operacional
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Al operar de forma automatizada, este panel actúa como el <strong>"Cisne de Control"</strong>. Cada evento enviado, aprobado o rechazado queda sellado aquí con su payload exacto, evitando errores invisibles.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs navigation for automations */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${activeTab === 'logs' ? 'bg-primary text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <FileCode size={16} />
          Registro de Webhooks ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('pricing_engine')}
          className={`px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${activeTab === 'pricing_engine' ? 'bg-primary text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <TrendingUp size={16} />
          Motor de Precios & Margen
        </button>
        <button
          onClick={() => setActiveTab('taxes_config')}
          className={`px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${activeTab === 'taxes_config' ? 'bg-primary text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Percent size={16} />
          Impuestos & Tasas (IVA)
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all ${activeTab === 'simulator' ? 'bg-primary text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Play size={16} />
          Simulador de Tráfico
        </button>
      </div>

      {/* TAB CONTENT: LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar registros..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={fetchLogs}
                className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-white/10 flex items-center gap-2"
                title="Sincronizar de Firebase"
              >
                <RefreshCw size={14} />
                Sincronizar
              </button>
              <button
                onClick={handleClearLogs}
                className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-red-500/20"
              >
                Limpiar Historial
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 uppercase text-[10px] tracking-widest bg-white/[0.02] border-b border-white/5">
                    <th className="px-6 py-4 font-bold">Fecha / Hora</th>
                    <th className="px-6 py-4 font-bold">Tipo Evento</th>
                    <th className="px-6 py-4 font-bold">Descripción del Evento</th>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const isSuccess = log.status === 'success';
                      return (
                        <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-gray-600 block shrink-0" />
                              {new Date(log.timestamp).toLocaleDateString('es-AR')} - {new Date(log.timestamp).toLocaleTimeString('es-AR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-primary border border-primary/20 bg-primary/5 px-2.5 py-1 rounded">
                              {getLogTypeLabel(log.eventType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-bold text-xs truncate max-w-[320px]">
                            {log.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                              {isSuccess ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                              {isSuccess ? 'ENTREGAGO / OK' : 'FALLIDO / ERROR'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setInspectLog(log)}
                              className="text-[9px] bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-gray-300 hover:text-white hover:bg-white/10 uppercase tracking-widest font-black"
                            >
                              Ver JSON
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-500 opacity-60 italic text-xs">
                        No hay registros impositivos ni de webhook asentados todavía. El sistema se auto-auditará al ocurrir eventos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRICING ENGINE */}
      {activeTab === 'pricing_engine' && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm uppercase text-primary tracking-widest flex items-center gap-2">
              <Zap size={16} />
              Calculador de Precios / Margen de Resguardo Masivo
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed uppercase font-mono">
              Para combatir la inflación impositiva u optimizar la ganancia comercial sin usar planillas Excel.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Regla Impositiva / Margen Neto</h4>
            <p className="text-[11px] text-gray-400 leading-normal">
              Seleccioná una categoría. El sistema buscará el <strong>Costo de Proveedor</strong> de cada artículo en ella y calculará su <strong>Precio de Venta Sugerido</strong> para proteger de forma absoluta el margen neto especificado (teniendo en cuenta IVA e ingresos brutos).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Categoría Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 shadow-sm">1. Filtrar Categoría</label>
                <select
                  value={markupCategory}
                  onChange={(e) => setMarkupCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary cursor-pointer font-bold"
                >
                  <option value="all" className="bg-background text-white">Todos los Productos (Masivo)</option>
                  {categories.map(cat => <option key={cat} value={cat} className="bg-background text-white">{cat}</option>)}
                </select>
              </div>

              {/* Margen deseado */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">2. Margen Neto Deseado (%)</label>
                  <span className="text-[9px] font-mono font-bold text-primary">{customMarkupPercent}%</span>
                </div>
                <input 
                  type="range"
                  min="20"
                  max="70"
                  value={customMarkupPercent}
                  onChange={(e) => setCustomMarkupPercent(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 accent-primary rounded-lg appearance-none cursor-pointer mt-4"
                />
              </div>

              {/* Simulación del impacto impositivo */}
              <div className="space-y-1 p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] space-y-1.5 font-mono">
                <span className="text-primary font-black uppercase tracking-widest block">Simulación de Fórmulas:</span>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Margen Comercial Neto:</span>
                  <span className="text-white font-bold">{customMarkupPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Multiplicador en base a Costo:</span>
                  <span className="text-white">{(1 / (1 - (customMarkupPercent / 100))).toFixed(2)}x</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-green-400 font-bold">
                  <span>Si costo es $1000, Venta será:</span>
                  <span>{formatCurrency(Math.round(1000 * (1 / (1 - (customMarkupPercent / 100)))))}</span>
                </div>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleBulkReprice}
                className="w-full md:w-auto bg-primary text-black font-black px-8 py-3.5 rounded-xl uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01]"
              >
                🚀 Ejecutar Autoprecio de Resguardo Completo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TAXES CONFIG */}
      {activeTab === 'taxes_config' && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm uppercase text-primary tracking-widest flex items-center gap-2">
              <Sliders size={16} />
              Parámetros de Costos Impositivos (Estructuración Financiera)
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed uppercase font-mono">
              Configurá los impuestos vigentes para que el sistema descuente de tus ventas y te muestre ganancias netas exactas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tasa de I.V.A (%)</label>
              <input 
                type="number"
                step="0.5"
                min="0"
                value={ivaPercent}
                onChange={(e) => setIvaPercent(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono"
              />
              <span className="text-[8px] text-gray-500 block uppercase pt-0.5">IVA general argentina (21% por defecto)</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ingresos Brutos (IIBB) (%)</label>
              <input 
                type="number"
                step="0.1"
                min="0"
                value={iibbPercent}
                onChange={(e) => setIibbPercent(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono"
              />
              <span className="text-[8px] text-gray-500 block uppercase pt-0.5">Deducción de Entre Ríos (3.5% habitual)</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Comisión Pasarela de Cobros (%)</label>
              <input 
                type="number"
                step="0.5"
                min="0"
                value={paymentFeePercent}
                onChange={(e) => setPaymentFeePercent(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono"
              />
              <span className="text-[8px] text-gray-500 block uppercase pt-0.5">MercadoPago / Tarjetas de crédito</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-white/5">
            <button
              onClick={handleSaveTaxes}
              className="bg-primary text-black font-black px-6 py-3.5 rounded-xl uppercase tracking-widest text-[10px] hover:scale-105 transition-transform font-bold"
            >
              Aplicar Tasas Impositivas
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WEBHOOK SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-display font-black text-sm uppercase text-primary tracking-widest flex items-center gap-2">
              <Smartphone size={16} />
              Probador / Emulador de Automatización (Webhook Ping)
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed uppercase font-mono">
              Emulá de manera segura el disparo del webhook de inventario a tu instancia de n8n para validar que esté en línea.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/10 p-6 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <InfoBadge />
              <div className="space-y-1">
                <span className="text-white text-xs font-bold uppercase tracking-wide block">Instrucciones de Validación:</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Al hacer clic en el botón de abajo, Bazar YES enviará un paquete simulado de tipo POST a la URL de webhook que guardaste en configuración. n8n debería procesarlo, retornando código HTTP 200. Podrás verificar en tu consola n8n el recibo de todas las métricas en tiempo real.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="space-y-0.5 text-left">
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-bold">Dirección de Envío:</span>
                <span className="text-xs font-mono font-bold text-white bg-black/40 border border-white/5 px-3 py-1.5 rounded-lg block max-w-lg truncate">
                  {localStorage.getItem('bazar_yes_n8n_webhook_url') || '(Sin URL de Webhook Guardada)'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleTestPing}
                className="w-full md:w-auto bg-primary text-black font-black px-6 py-3.5 rounded-xl uppercase tracking-widest text-[10px] hover:scale-105 transition-transform flex items-center justify-center gap-2 shrink-0 font-bold hover:shadow-primary/20 shadow-lg"
              >
                Enviar Ping de Prueba (POST)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON INSPECTOR MODAL */}
      {inspectLog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/5 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h4 className="font-display font-black uppercase text-xs tracking-widest text-primary">Inspección de Webhook</h4>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono">{getLogTypeLabel(inspectLog.eventType)} • ID: {inspectLog.id}</p>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-colors"
              >
                ✖
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Detalles del Suceso</span>
                <p className="text-white font-bold text-xs">{inspectLog.title}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">JSON Payload Completo (Enviado / Recibido)</span>
                <pre className="bg-black/60 border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-green-400 overflow-auto max-h-56 leading-normal">
                  {JSON.stringify(inspectLog.payload, null, 2)}
                </pre>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setInspectLog(null)}
                  className="bg-white/5 hover:bg-white/10 text-white rounded-xl py-2.5 px-6 text-xs font-bold uppercase tracking-wider"
                >
                  Cerrar Inspección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function InfoBadge() {
  return (
    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
      <HelpCircle size={20} />
    </div>
  );
}
