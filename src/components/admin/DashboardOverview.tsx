import { motion } from 'motion/react';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles,
  Coins,
  Percent,
  ShieldCheck
} from 'lucide-react';
import { Product, Order } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface DashboardOverviewProps {
  products: Product[];
  orders: Order[];
  activeCarts?: any[];
}

export default function DashboardOverview({ products, orders, activeCarts = [] }: DashboardOverviewProps) {
  // Calculate dynamic stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const lowStockItems = products.filter(p => p.stock < 5);

  const stats = [
    { 
      label: 'Ventas Totales', 
      value: formatCurrency(totalRevenue), 
      trend: `${orders.length} pedidos`, 
      icon: BarChart3,
      color: 'text-primary'
    },
    { 
      label: 'Pedidos Pendientes', 
      value: pendingOrders.length.toString(), 
      trend: pendingOrders.length > 0 ? '¡Responder!' : 'Al día', 
      icon: ShoppingCart,
      color: 'text-yellow-500' 
    },
    { 
      label: 'Stock Bajo (< 5 Uds)', 
      value: `${lowStockItems.length} ítems`, 
      trend: lowStockItems.length > 0 ? 'Falta stock' : 'Suficiente', 
      icon: Package,
      color: 'text-red-400'
    },
    { 
      label: 'Catálogo de Artículos', 
      value: `${products.length} productos`, 
      trend: 'Activos', 
      icon: Users,
      color: 'text-blue-400'
    }
  ];

  // Dynamic cost and tax deductions calculation engine (replaces human books keeper)
  const ivaPercent = Number(localStorage.getItem('bazar_yes_tax_iva') || '21');
  const iibbPercent = Number(localStorage.getItem('bazar_yes_tax_iibb') || '3.5');
  const gatewayPercent = Number(localStorage.getItem('bazar_yes_tax_gateway') || '5');

  const validOrders = orders.filter(o => o.status !== 'cancelled');
  let totalCostOfSales = 0;

  validOrders.forEach(o => {
    o.items?.forEach(item => {
      // Find the cost in products db, fallback to 60% of item's sale price if not written yet
      const registeredCost = products.find(p => p.id === item.id)?.cost;
      const unitCost = (registeredCost !== undefined && registeredCost !== 0) ? registeredCost : Math.round(item.price * 0.60);
      totalCostOfSales += unitCost * item.quantity;
    });
  });

  const grossProfitMargin = Math.max(0, totalRevenue - totalCostOfSales);
  
  // Impositive taxes and payment charges computations
  const ivaDeductionAmount = totalRevenue * (ivaPercent / 100);
  const iibbDeductionAmount = totalRevenue * (iibbPercent / 100);
  const gatewayServiceFees = totalRevenue * (gatewayPercent / 100);
  const totalTaxDeductions = ivaDeductionAmount + iibbDeductionAmount + gatewayServiceFees;
  const netEarningsAmount = Math.max(0, grossProfitMargin - totalTaxDeductions);
  const netPercentRentability = totalRevenue > 0 ? Math.round((netEarningsAmount / totalRevenue) * 100) : 0;

  const rentabilityCategoryLabel = () => {
    if (netPercentRentability >= 25) return '💰 Rentabilidad Extraordinaria';
    if (netPercentRentability >= 15) return '📈 Negocio Saludable (Óptimo)';
    if (netPercentRentability >= 5) return '⚖️ Margen Ajustado';
    return '🚩 Alerta de Margen Comercial';
  };

  // Get recent 4 orders
  const recentOrders = orders.slice(0, 4);

  // Group products by category to show distribution
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="glass p-6 rounded-3xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary">
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className="text-[10px] font-black text-accent uppercase tracking-wider">{stat.trend}</span>
            </div>
            <div className="text-2xl font-display font-black mb-1 text-white">{stat.value}</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* NEW: Automated Profit & Loss Impositive Bento Box */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass p-6 md:p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.01] via-transparent to-transparent space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1">
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
              <Coins size={16} className="text-primary animate-pulse" />
              Auditoría de Margen & Rentabilidad Automática
            </h3>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">Simulación de ganancias neta de caja descontando mercadería, impuestos e ingresos brutos</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-white/5 border border-white/10 text-gray-400 px-3 py-1.5 rounded-xl font-mono">
              Fórmula: Venta - Costo MP - Impuestos
            </span>
            <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">
              {rentabilityCategoryLabel()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column A: Gross Profits */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00c2b7] block">A. Ganancia Bruta Operativa</span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Ventas Brutas Concretadas:</span>
                <span className="text-white font-bold">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Costo Mercadería Vendida (CMV):</span>
                <span className="text-red-400">-{formatCurrency(totalCostOfSales)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-white font-bold">
                <span className="text-[10px] uppercase font-sans font-black">Utilidad Bruta Teórica:</span>
                <span className="text-primary">{formatCurrency(grossProfitMargin)}</span>
              </div>
            </div>
          </div>

          {/* Column B: Taxes & gateway fees */}
          <div className="space-y-3.5 border-t md:border-t-0 md:border-l md:border-r border-white/5 md:px-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 block">B. Deducciones e Impuestos</span>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Alícuota IVA ({ivaPercent}%):</span>
                <span>{formatCurrency(ivaDeductionAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Alícuota IIBB Entre Ríos ({iibbPercent}%):</span>
                <span>{formatCurrency(iibbDeductionAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Servicio Pasarela MP ({gatewayPercent}%):</span>
                <span>{formatCurrency(gatewayServiceFees)}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 text-red-400 font-bold">
                <span className="text-[10px] uppercase font-sans font-black">Retenciones Totales:</span>
                <span>-{formatCurrency(totalTaxDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Column C: Dynamic Real Net Profit */}
          <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary block">C. Rentabilidad Neta de Caja (EBITDA)</span>
              <div className="text-3xl font-display font-black text-white">{formatCurrency(netEarningsAmount)}</div>
            </div>
            
            <div className="space-y-1 border-t border-white/5 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 uppercase text-[9px] font-black tracking-widest">Margen de Retorno Neto:</span>
                <span className="text-primary font-mono font-black text-sm">{netPercentRentability}%</span>
              </div>
              {/* Decorative progress bars */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, netPercentRentability * 2.5)}%` }} // Scaled view
                />
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Charts & Lists split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent purchases ledger */}
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <div>
              <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
                <Clock size={14} className="text-primary animate-pulse" />
                Ventas Recientes
              </h4>
              <p className="text-[9px] text-gray-500 uppercase">Últimos pedidos registrados de Paraná</p>
            </div>
          </div>

          <div className="divide-y divide-white/5 space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between items-center pt-3 select-none">
                  <div>
                    <span className="text-xs font-bold text-white block">{o.customerName}</span>
                    <span className="text-[10px] text-gray-500">
                      {o.items.reduce((sum, item) => sum + item.quantity, 0)} {o.items.length === 1 ? 'artículo' : 'artículos'} • {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-display font-bold text-primary block">{formatCurrency(o.total)}</span>
                    <span className="text-[9px] font-bold text-accent uppercase tracking-widest">{o.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 italic text-xs">
                No hay transacciones registradas todavía. ¡Empezá a vender!
              </div>
            )}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
              <TrendingUp size={14} className="text-primary" />
              Surtido por Categoría
            </h4>
            <p className="text-[9px] text-gray-500 uppercase">Cantidad de productos por departamento</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.keys(categoryCounts).length > 0 ? (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const totalProds = products.length || 1;
                const percentage = Math.round((count / totalProds) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-300 uppercase text-[10px] tracking-wider">{cat}</span>
                      <span className="text-primary font-mono">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 italic text-xs">
                No hay productos en el catálogo.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Shopping Carts Feed Section */}
      <div className="glass p-6 rounded-3xl border border-white/5 space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <div>
            <h4 className="font-display font-black text-xs uppercase tracking-widest text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping mr-1" />
              Carritos Activos en la Web ({activeCarts.length})
            </h4>
            <p className="text-[9px] text-gray-500 uppercase">Monitoreo Comercial de Clientes Armajando Pedidos en Bazar YES</p>
          </div>
          <span className="text-[9px] bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-widest hidden md:inline-block">
            LIVE SYNC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCarts.length > 0 ? (
            activeCarts.map((cart, idx) => {
              const itemsList = cart.items || [];
              const totalAmount = cart.total || 0;
              return (
                <div 
                  key={cart.id || idx} 
                  className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-white block truncate max-w-[185px]">{cart.customerName}</span>
                        <span className="text-[10px] text-gray-500 block truncate max-w-[185px]">{cart.customerEmail}</span>
                      </div>
                      <span className="text-[9px] text-gray-400 font-mono tracking-tighter bg-white/5 px-2 py-0.5 rounded-md">
                        {cart.updatedAt ? new Date(cart.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'}
                      </span>
                    </div>

                    {/* Tag rendering of cart items */}
                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                      {itemsList.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-[10.5px] text-gray-300 bg-white/5 border border-white/[0.03] rounded-lg px-2 py-1">
                          <span className="truncate max-w-[150px] font-medium">{item.name}</span>
                          <span className="text-primary font-black ml-1.5 shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-3 border-t border-white/5">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block font-black">Subtotal Estimado</span>
                      <span className="text-sm font-display font-black text-primary">{formatCurrency(totalAmount)}</span>
                    </div>

                    <button 
                      onClick={() => {
                        const itemsStr = itemsList.map((item: any) => `${item.quantity}x ${item.name}`).join(', ');
                        const message = `Hola! 👋 Te escribimos desde el soporte de Bazar YES Paraná. Vimos que guardaste los siguientes productos: *${itemsStr}* por un valor de *${formatCurrency(totalAmount)}* en tu carrito. ¿Te gustaría que te ayudemos a concretar tu pedido o consultar por los envíos gratis? 😊`;
                        window.open(`https://wa.me/5493435033268?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="bg-primary hover:bg-[#00c2b7] text-black hover:scale-105 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-transform shrink-0"
                    >
                      Ayudar / Cerrar
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 italic text-xs border border-dashed border-white/5 rounded-2xl select-none">
              No hay carritos activos en este momento en la web de Paraná. La actividad se mostrará en directo cuando los clientes comiencen a elegir artículos.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
