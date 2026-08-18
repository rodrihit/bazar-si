import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Plus,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  Home,
  ChevronDown,
  Sparkles,
  TrendingDown,
  Bot
} from 'lucide-react';
import { mockProducts } from '../lib/mockData';
import { useFirebase } from '../context/FirebaseContext';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  getAdminOrders, 
  getProducts,
  saveProductToDb,
  deleteProductFromDb,
  updateOrderStatusInDb,
  getActiveCarts
} from '../services/dataService';
import toast from 'react-hot-toast';
import { Order, Product } from '../types';

import Logo from '../components/Logo';
import DashboardOverview from '../components/admin/DashboardOverview';
import InventoryManager from '../components/admin/InventoryManager';
import OrdersManager from '../components/admin/OrdersManager';
import CustomersManager from '../components/admin/CustomersManager';
import SettingsManager from '../components/admin/SettingsManager';
import QuotationsManager from '../components/admin/QuotationsManager';
import AutomationsManager from '../components/admin/AutomationsManager';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'replenishment' | 'automations' | 'settings';

export default function Admin() {
  const { user, login, logout, isAdmin, loading, db, bypassAdmin } = useFirebase();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCarts, setActiveCarts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [bypassCode, setBypassCode] = useState('');
  
  // Custom states for quick actions and triggers
  const [autoOpenAddProduct, setAutoOpenAddProduct] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      getAdminOrders(db).then(setOrders);
      getProducts(db).then(data => {
        if (data.length > 0) {
          setProducts(data);
        } else {
          setProducts(mockProducts);
        }
      });
      getActiveCarts(db).then(setActiveCarts);
      
      const interval = setInterval(() => {
        getActiveCarts(db).then(setActiveCarts);
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [db, isAdmin]);

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => {
    try {
      const saved = await saveProductToDb(db, productData);
      setProducts(current => {
        const index = current.findIndex(p => p.id === saved.id);
        if (index > -1) {
          const updated = [...current];
          updated[index] = saved;
          return updated;
        } else {
          return [saved, ...current];
        }
      });
      toast.success(productData.id ? 'Producto actualizado con éxito' : 'Producto agregado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el producto');
      throw error;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductFromDb(db, productId);
      setProducts(current => current.filter(p => p.id !== productId));
      toast.success('Producto eliminado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el producto');
      throw error;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatusInDb(db, orderId, status);
      setOrders(current => current.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success('Estado del pedido actualizado');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el estado del pedido');
      throw error;
    }
  };

  const getTabLabel = (tab: AdminTab) => {
    switch (tab) {
      case 'dashboard': return 'Panel de Control';
      case 'products': return 'Gestión de Productos';
      case 'orders': return 'Pedidos / Ventas';
      case 'customers': return 'Directorio de Clientes';
      case 'replenishment': return 'Reposición de Stock (N8N)';
      case 'automations': return 'Automatización & Webhooks';
      case 'settings': return 'Configuración';
      default: return 'Panel de Administración';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return <DashboardOverview products={products} orders={orders} activeCarts={activeCarts} />;
      case 'products': 
        return (
          <InventoryManager 
            products={products} 
            onSave={handleSaveProduct} 
            onDelete={handleDeleteProduct}
            autoOpenAdd={autoOpenAddProduct}
            onAddClosed={() => setAutoOpenAddProduct(false)}
          />
        );
      case 'orders': 
        return <OrdersManager orders={orders} onUpdateStatus={handleUpdateOrderStatus} />;
      case 'customers': 
        return <CustomersManager orders={orders} />;
      case 'replenishment': 
        return <QuotationsManager />;
      case 'automations':
        return <AutomationsManager />;
      case 'settings': 
        return <SettingsManager />;
      default: 
        return <DashboardOverview products={products} orders={orders} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(0,162,153,0.05)_0%,transparent_70%)]">
        <div className="text-center max-w-sm w-full">
          <Logo className="justify-center mb-12" />
          <h1 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-white">ACCESO ADMINISTRATIVO</h1>
          <p className="text-xs text-gray-400 mb-10 leading-relaxed">Este panel es de administración exclusiva para el equipo de Bazar YES Paraná. Por favor, iniciá sesión para continuar.</p>
          
          <button 
            onClick={login}
            className="w-full primary-gradient text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-primary/20 text-xs"
          >
            Iniciá Sesión con Google
          </button>
          
          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">¿Problemas con Google? Usar Código de Acceso</p>
            <div className="flex gap-2">
              <input 
                type="password"
                placeholder="Código..."
                value={bypassCode}
                onChange={(e) => setBypassCode(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
              />
              <button 
                onClick={() => {
                  if (bypassAdmin(bypassCode)) {
                    toast.success('Acceso autorizado');
                  } else {
                    toast.error('Código incorrecto');
                  }
                }}
                className="bg-white/10 text-white px-6 rounded-xl font-bold uppercase text-[10px] hover:bg-white/20 transition-colors"
              >
                Entrar
              </button>
            </div>
            <p className="text-[9px] text-gray-600 italic">Solicitá tu código YES 2024 de soporte técnico.</p>
          </div>
          
          <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest leading-normal">
            Nota: Si no aparece la ventana, revisá que el navegador no esté bloqueando popups.
          </p>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00a299] hover:underline"
            >
              <ArrowLeft size={14} />
              Volver a la Web Principal
            </Link>
          </div>

          {!isAdmin && user && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-500 text-xs font-bold uppercase tracking-widest">
                Acceso denegado: {user.email} no tiene permisos de administrador.
              </p>
              <button 
                onClick={logout}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-white hover:text-primary underline transition-colors"
              >
                Cerrar sesión e intentar con otra cuenta
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package, label: 'Productos' },
    { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
    { id: 'customers', icon: Users, label: 'Clientes' },
    { id: 'replenishment', icon: TrendingDown, label: 'Reposición N8N' },
    { id: 'automations', icon: Bot, label: 'Automatización' },
    { id: 'settings', icon: Settings, label: 'Configuración' }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      
      {/* Mobile Top Navigation (Dropdown selector for panels on mobile layouts) */}
      <div className="lg:hidden bg-surface/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Logo showYears={false} className="scale-90 origin-left" />
        <div className="flex items-center gap-2.5">
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as AdminTab)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-primary font-black uppercase tracking-wider cursor-pointer"
          >
            <option value="dashboard" className="bg-background text-white">Panel de Control</option>
            <option value="products" className="bg-background text-white">Productos</option>
            <option value="orders" className="bg-background text-white">Pedidos / Ventas</option>
            <option value="customers" className="bg-background text-white">Clientes</option>
            <option value="replenishment" className="bg-background text-white">Reposición N8N</option>
            <option value="automations" className="bg-background text-white">Automatización</option>
            <option value="settings" className="bg-background text-white">Configuración</option>
          </select>
          <button 
            onClick={logout} 
            className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl transition-colors"
            title="Cerrar Sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 space-y-8 hidden lg:flex flex-col bg-surface/50 backdrop-blur-md shrink-0">
        <div>
          <Logo showYears={false} className="mb-6" />
          
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-bold transition-all"
          >
            <ArrowLeft size={16} className="text-primary" />
            Volver a la Tienda
          </Link>
          <div className="border-t border-white/5 mt-3 pt-3" />
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${activeTab === item.id ? 'bg-primary text-black font-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <item.icon size={18} />
              <span className="text-xs uppercase tracking-wider font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 w-full transition-all text-xs font-black uppercase tracking-widest"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black uppercase tracking-tight text-white">
              {getTabLabel(activeTab)}
            </h1>
            <p className="text-gray-500 text-xs italic mt-1 font-mono">Sesión autorizada ({user.email})</p>
          </div>
          
          <div className="flex gap-3">
            {/* Standard Return Button for Easy Catalog Jumps on Desktop */}
            <Link 
              to="/"
              className="hidden md:flex bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest items-center gap-2 transition-all"
            >
              <Home size={14} className="text-primary" />
              Volver a la Web
            </Link>

            {/* Quick Action Interactive Trigger */}
            <div className="relative">
              <button 
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="bg-primary hover:bg-[#00c2b7] text-black px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/10 w-full"
              >
                <Plus size={14} />
                Acción Rápida
                <ChevronDown size={14} className={`transition-transform duration-200 ${isQuickActionOpen ? 'rotate-180' : ''}`} />
              </button>

              {isQuickActionOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsQuickActionOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-white/5 rounded-2xl shadow-xl z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-1.5 text-[8px] font-black uppercase text-gray-500 tracking-widest border-b border-white/5">
                      Atajos Rápidos
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('products');
                        setAutoOpenAddProduct(true);
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-200 hover:bg-primary hover:text-black hover:font-bold transition-all flex items-center gap-2"
                    >
                      <Plus size={14} />
                      Crear Nuevo Producto
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('orders');
                        setIsQuickActionOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-gray-200 hover:bg-primary hover:text-black hover:font-bold transition-all flex items-center gap-2"
                    >
                      <ShoppingCart size={14} />
                      Ver todos los Pedidos
                    </button>
                    <div className="border-t border-white/5 my-1.5" />
                    <button 
                      onClick={() => {
                        setIsQuickActionOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#00a299] hover:bg-white/5 hover:font-bold transition-all flex items-center gap-2"
                    >
                      <ArrowLeft size={14} />
                      Ir al Inicio de la Web
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
