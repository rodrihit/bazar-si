import { useState } from 'react';
import { Search, Mail, Phone, ShoppingBag, ArrowRight, UserPlus, Trash } from 'lucide-react';
import { Order } from '../../types';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface CustomersManagerProps {
  orders?: Order[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  lastPurchaseDate: string;
}

export default function CustomersManager({ orders = [] }: CustomersManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Dynamic customers extractor + fallback curated Paraná customers
  const defaultParanaCustomers: Customer[] = [
    {
      id: 'cust_1',
      name: 'María Elena Ghiggi',
      email: 'mariatigre@hotmail.com',
      phone: '3435112233',
      city: 'Paraná (Centro)',
      totalOrders: 4,
      totalSpent: 168400,
      lastPurchaseDate: '2026-05-12T14:32:00Z'
    },
    {
      id: 'cust_2',
      name: 'Carlos Alberto Perez',
      email: 'perez.carlos@gmail.com',
      phone: '3434678912',
      city: 'Paraná (San Agustín)',
      totalOrders: 2,
      totalSpent: 42500,
      lastPurchaseDate: '2026-05-14T19:15:00Z'
    },
    {
      id: 'cust_3',
      name: 'Sofía Almada',
      email: 'sofi.almada@yahoo.com.ar',
      phone: '343154800922',
      city: 'Paraná (Thompson)',
      totalOrders: 1,
      totalSpent: 32000,
      lastPurchaseDate: '2026-05-10T11:05:00Z'
    },
    {
      id: 'cust_4',
      name: 'Rodrigo Frison',
      email: 'rodrigofrison88@gmail.com',
      phone: '343155033268',
      city: 'Paraná (Parque)',
      totalOrders: 7,
      totalSpent: 289500,
      lastPurchaseDate: '2026-05-15T18:40:00Z'
    }
  ];

  // Map and group unique clients from orders
  const getCombinedCustomers = (): Customer[] => {
    const clientsMap = new Map<string, Customer>();

    // Add mock ones first
    defaultParanaCustomers.forEach(c => clientsMap.set(c.email.toLowerCase(), c));

    // Overlaid with real purchases from checkout/orders
    orders.forEach(order => {
      const email = order.customerEmail.toLowerCase().trim();
      const existing = clientsMap.get(email);
      if (existing) {
        // Increment their values
        clientsMap.set(email, {
          ...existing,
          name: order.customerName || existing.name,
          phone: order.customerPhone || existing.phone,
          totalOrders: existing.totalOrders + 1,
          totalSpent: existing.totalSpent + order.total,
          lastPurchaseDate: order.createdAt > existing.lastPurchaseDate ? order.createdAt : existing.lastPurchaseDate
        });
      } else {
        // Create new client record
        clientsMap.set(email, {
          id: `cust_${Math.random().toString(36).substr(2, 9)}`,
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          city: 'Paraná (Entre Ríos)',
          totalOrders: 1,
          totalSpent: order.total,
          lastPurchaseDate: order.createdAt || new Date().toISOString()
        });
      }
    });

    return Array.from(clientsMap.values());
  };

  const customers = getCombinedCustomers();

  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Search and Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar clientes por nombre, email, teléfono..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Cartera Clientes</p>
            <p className="text-xl font-display font-black text-white">{customers.length}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-black text-right tracking-widest">Ventas Totales</p>
            <p className="text-sm font-display font-bold text-primary text-right">{formatCurrency(totalSpentAll)}</p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">Cliente</th>
                <th className="px-6 py-4 font-bold">Dirección / Localidad</th>
                <th className="px-6 py-4 font-bold text-center">Nº Pedidos</th>
                <th className="px-6 py-4 font-bold text-right">Inversión Total</th>
                <th className="px-6 py-4 font-bold text-right">Último Pedido</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">{c.name}</span>
                        <span className="text-[10px] text-gray-500">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{c.city}</td>
                    <td className="px-6 py-4 text-center font-bold font-mono text-xs">{c.totalOrders}</td>
                    <td className="px-6 py-4 text-right font-display font-bold text-primary">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {new Date(c.lastPurchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`https://wa.me/${c.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500/10 hover:bg-green-500 hover:text-white text-green-400 p-2 rounded-lg transition-all"
                          title="WhatsApp Directo"
                        >
                          <Phone size={12} />
                        </a>
                        <a 
                          href={`mailto:${c.email}`}
                          className="bg-white/5 hover:bg-white/10 text-gray-300 p-2 rounded-lg transition-all"
                          title="Enviar Email"
                        >
                          <Mail size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500 opacity-60 italic text-xs">
                    Ningún cliente coincide con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Information Dialog */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/5 p-8 rounded-3xl max-w-sm w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mx-auto text-xl font-bold font-display uppercase">
                {selectedCustomer.name.substring(0, 2)}
              </div>
              <h4 className="text-lg font-bold text-white uppercase tracking-tight">{selectedCustomer.name}</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{selectedCustomer.email}</p>
            </div>

            <div className="divide-y divide-white/5 text-xs text-slate-300">
              <div className="flex justify-between py-2">
                <span>Teléfono celular</span>
                <span className="font-bold text-white font-mono">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Zona / Localidad</span>
                <span className="text-white font-bold">{selectedCustomer.city}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Cantidad compras</span>
                <span className="text-white font-bold">{selectedCustomer.totalOrders} Pedidos</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Importe acumulado</span>
                <span className="text-primary font-bold font-display">{formatCurrency(selectedCustomer.totalSpent)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Última Interacción</span>
                <span className="text-gray-400 font-bold">{new Date(selectedCustomer.lastPurchaseDate).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href={`https://wa.me/${selectedCustomer.phone}?text=${encodeURIComponent(`Hola ${selectedCustomer.name}! Te escribimos de Bazar YES, gracias por confiar en nosotros...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <Phone size={14} /> WhatsApp
              </a>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest"
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
