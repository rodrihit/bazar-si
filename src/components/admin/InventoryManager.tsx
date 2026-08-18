import { useState, FormEvent, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Sparkles, Image as ImageIcon, AlertTriangle, Lightbulb, CheckCircle2, Upload } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface InventoryManagerProps {
  products: Product[];
  onSave: (product: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  autoOpenAdd?: boolean;
  onAddClosed?: () => void;
}

export default function InventoryManager({ products, onSave, onDelete, autoOpenAdd, onAddClosed }: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'overstock'>('all');

  useEffect(() => {
    if (autoOpenAdd) {
      handleAddNewClick();
      if (onAddClosed) {
        onAddClosed();
      }
    }
  }, [autoOpenAdd]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    cost: 0,
    stock: 0,
    category: 'Cocina',
    images: [] as string[],
    featured: false,
    dailyPromo: false,
    installments: 3
  });

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

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice || 0,
      cost: p.cost || 0,
      stock: p.stock,
      category: p.category || 'Cocina',
      images: p.images || [],
      featured: !!p.featured,
      dailyPromo: !!p.dailyPromo,
      installments: p.installments || 3
    });
    setIsAddModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      discountPrice: 0,
      cost: 0,
      stock: 5,
      category: 'Cocina',
      images: [''],
      featured: false,
      dailyPromo: false,
      installments: 6
    });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formData.images];
    updated[index] = val;
    handleInputChange('images', updated.filter(u => u !== undefined));
  };

  const addImageUrlInput = () => {
    handleInputChange('images', [...formData.images, '']);
  };

  const removeImageUrlInput = (index: number) => {
    const updated = [...formData.images];
    updated.splice(index, 1);
    handleInputChange('images', updated);
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un formato de imagen válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          
          const currentImages = [...formData.images];
          const emptyIndex = currentImages.findIndex(img => !img || img.trim() === '');
          if (emptyIndex > -1) {
            currentImages[emptyIndex] = compressedBase64;
          } else {
            currentImages.push(compressedBase64);
          }
          
          handleInputChange('images', currentImages);
          toast.success('¡Foto cargada y optimizada con éxito!', { icon: '📸' });
        } else {
          toast.error('No se pudo procesar la imagen.');
        }
      };
      img.onerror = () => {
        toast.error('Error al decodificar la imagen.');
      };
    };
    reader.readAsDataURL(file);
  };

  const generateMockImage = (index: number) => {
    const categoriesKeywords: Record<string, string> = {
      'Cocina': 'pot,pan,kitchen',
      'Mesa y Vajilla': 'plate,glass,dinnerware',
      'Repostería': 'baking,cake,mold',
      'Cafetería y Té': 'coffee,cup,teapot',
      'Electro Hogar': 'toaster,blender,kettle',
      'Organización': 'organizer,bamboo,box',
      'Baño': 'soap,bathroom,towel',
      'Decoración': 'clock,lamp,vase'
    };
    const kw = categoriesKeywords[formData.category] || 'kitchen';
    const randomNum = Math.floor(Math.random() * 1000);
    const generatedUrl = `https://images.unsplash.com/photo-${randomNum === 0 ? '1544190807-c19956461c3c' : '1584990333910-fe907bc4aa76'}?auto=format&fit=crop&q=80&w=800&sig=${randomNum}`;
    
    // Switch to more accurate curated placeholders
    const curated: Record<string, string[]> = {
      'Cocina': ['https://images.unsplash.com/photo-1584990333910-fe907bc4aa76?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1594833238942-961d11a63568?auto=format&fit=crop&q=80&w=800'],
      'Mesa y Vajilla': ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800'],
      'Repostería': ['https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1591117207239-788cd4742244?auto=format&fit=crop&q=80&w=800'],
      'Cafetería y Té': ['https://images.unsplash.com/photo-1544190807-c19956461c3c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'],
      'Electro Hogar': ['https://images.unsplash.com/photo-1594951465551-c07a04949539?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800'],
      'Organización': ['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800'],
      'Baño': ['https://images.unsplash.com/photo-1620626011761-9963d7b59a05?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800'],
      'Decoración': ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800']
    };
    
    const pools = curated[formData.category] || curated['Cocina'];
    const chosen = pools[Math.floor(Math.random() * pools.length)] + `?sig=${Date.now()}`;
    handleImageChange(index, chosen);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Filter out empty image strings
    const validImages = formData.images.filter(img => img.trim() !== '');
    const finalImages = validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1584990333910-fe907bc4aa76?auto=format&fit=crop&q=80&w=800'];

    const savePayload: Omit<Product, 'id' | 'createdAt'> & { id?: string } = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      cost: formData.cost ? Number(formData.cost) : undefined,
      stock: Number(formData.stock),
      category: formData.category,
      images: finalImages,
      featured: formData.featured,
      dailyPromo: formData.dailyPromo,
      installments: Number(formData.installments),
      ...(editingProduct ? { id: editingProduct.id } : {})
    };

    try {
      await onSave(savePayload);
    } catch (err) {
      console.error("Error at onSave:", err);
    } finally {
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setIsDeleteConfirmOpen(id);
  };

  const handleConfirmDelete = async () => {
    if (isDeleteConfirmOpen) {
      try {
        await onDelete(isDeleteConfirmOpen);
      } catch (err) {
        console.error("Error at onDelete:", err);
      } finally {
        setIsDeleteConfirmOpen(null);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'critical') {
      matchesStock = p.stock <= 5;
    } else if (stockFilter === 'overstock') {
      matchesStock = p.stock >= 35;
    }
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalProductsCount = products.length;
  const criticalProductsCount = products.filter(p => p.stock <= 5).length;
  const overstockProductsCount = products.filter(p => p.stock >= 35).length;

  return (
    <div className="space-y-6">
      {/* Stock Health Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Card */}
        <div 
          onClick={() => setStockFilter('all')}
          className={`glass p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
            stockFilter === 'all' ? 'border-primary bg-primary/[0.03] scale-[1.01]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">Total Productos</span>
              <span className="text-3xl font-display font-black text-white">{totalProductsCount}</span>
              <span className="text-[9px] text-gray-400 block font-base uppercase">Catálogo Activo en Paraná</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary border border-white/5">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>

        {/* Critical Stock Card */}
        <div 
          onClick={() => setStockFilter('critical')}
          className={`glass p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
            stockFilter === 'critical' ? 'border-red-500 bg-red-500/[0.03] scale-[1.01]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">Stock Crítico (≤ 5 Uds)</span>
              <span className="text-3xl font-display font-black text-red-400">
                {criticalProductsCount}
                {criticalProductsCount > 0 && (
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75 ml-2 mt-1" />
                )}
              </span>
              <span className="text-[9px] text-red-400/80 block font-medium uppercase font-mono">
                {criticalProductsCount > 0 ? "⚠️ ¡Reponer stock urgente!" : "Sin quiebres de stock"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/10">
              <AlertTriangle size={16} />
            </div>
          </div>
        </div>

        {/* Overstock Card */}
        <div 
          onClick={() => setStockFilter('overstock')}
          className={`glass p-5 rounded-2xl border transition-all cursor-pointer select-none relative overflow-hidden ${
            stockFilter === 'overstock' ? 'border-accent bg-accent/[0.03] scale-[1.01]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black block">Sobre Stock (≥ 35 Uds)</span>
              <span className="text-3xl font-display font-black text-accent">{overstockProductsCount}</span>
              <span className="text-[9px] text-accent block font-medium uppercase font-mono">
                {overstockProductsCount > 0 ? "💡 Ofertas recomendadas" : "Nivel de rotación óptimo"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center border border-accent/10">
              <Lightbulb size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Overstock Commercial Legend suggestion panel (shown dynamically if current filter is overstock or any item has overstock in the view) */}
      {stockFilter === 'overstock' && (
        <div className="bg-accent/5 border border-accent/20 p-5 rounded-3xl space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-accent animate-pulse" />
            <h5 className="font-display font-black text-xs uppercase tracking-widest text-accent">RECOMENDACIÓN COMERCIAL DE ROTACIÓN FÍSICA</h5>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Se ha detectado <strong>sobre-stock comercial</strong> en estos productos. Para agilizar tus ventas, liberar capital de trabajo acumulado y mejorar la rotación de estantería en Paraná, se recomienda <strong>generar una oferta o activar el flag "Promo 60% OFF BAZAR" o configurar un precio de oferta</strong> directamente haciendo clic en editar (<Edit2 size={10} className="inline mr-1" />) el producto.
          </p>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-300 focus:outline-none focus:border-primary cursor-pointer font-bold"
          >
            <option value="all" className="bg-background text-white">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-background text-white">{cat}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleAddNewClick}
          className="w-full md:w-auto bg-primary text-black px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      {/* Main Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold">Precio / Oferta</th>
                <th className="px-6 py-4 font-bold">Stock</th>
                <th className="px-6 py-4 font-bold text-center">Etiquetas</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden glass shrink-0">
                          <img src={p.images?.[0] || 'https://picsum.photos/seed/placeholder/100/100'} className="w-full h-full object-cover grayscale-[0.2]" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <p className="font-bold text-white line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-bold uppercase">{p.category}</td>
                    <td className="px-6 py-4">
                      {p.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="text-accent font-display font-medium text-xs line-through opacity-50">{formatCurrency(p.price)}</span>
                          <span className="text-primary font-display font-bold">{formatCurrency(p.discountPrice)}</span>
                        </div>
                      ) : (
                        <span className="font-display font-bold text-white">{formatCurrency(p.price)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-1 w-max px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          p.stock <= 5 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                            : p.stock >= 35 
                            ? 'bg-accent/10 text-accent border border-accent/20' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }`}>
                          {p.stock <= 5 ? (
                            <>
                              <AlertTriangle size={10} className="animate-pulse" />
                              {p.stock} Uds (Crítico)
                            </>
                          ) : p.stock >= 35 ? (
                            <>
                              <Lightbulb size={10} className="text-accent" />
                              {p.stock} Uds (Sobre Stock)
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={10} />
                              {p.stock} Uds (Saludable)
                            </>
                          )}
                        </span>
                        
                        {/* Context-aware suggestions */}
                        {p.stock <= 5 ? (
                          <span className="text-[8px] text-red-400 font-bold uppercase tracking-wide block">Reponer urgente en Paraná</span>
                        ) : p.stock >= 35 ? (
                          <div className="flex flex-col gap-0.5 max-w-[140px]">
                            <span className="text-[8px] text-accent font-black block uppercase tracking-wide">💡 Generar Oferta</span>
                            <span className="text-[7px] text-gray-400 font-bold block leading-tight lowercase">promover para liquidar remanente</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-1 justify-center">
                        {p.featured && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">DESTACADO</span>
                        )}
                        {p.dailyPromo && (
                          <span className="bg-accent/10 text-accent border border-accent/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">OFERTA 60%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500 opacity-60 italic text-xs">
                    No se encontraron productos coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creación / Edición Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-white/5 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-display font-black uppercase text-sm tracking-widest text-white">
                {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre del Producto *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Set de Mate Calado Inox"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
                />
              </div>

              {/* Categoría y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-background text-white">{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Stock Inicial (Unidades)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white"
                  />
                </div>
              </div>

              {/* Costo de Proveedor e Inteligencia de Margen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-white/5 py-4 my-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Costo Proveedor ($)</label>
                    <span className="text-[9px] text-gray-500">Valor compra</span>
                  </div>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Ej: 20000"
                    value={formData.cost || ''}
                    onChange={(e) => {
                      const costVal = Number(e.target.value);
                      setFormData(prev => {
                        // Automatically suggest sales price using classic 45% margin rule
                        const newPrice = prev.price === 0 ? Math.round(costVal * 1.82) : prev.price;
                        return { ...prev, cost: costVal, price: newPrice };
                      });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-bold block">Margen Neto Teórico</label>
                  <div className="flex items-center h-11 bg-white/5 border border-white/10 rounded-xl px-4 mt-1 text-xs font-mono font-bold text-gray-300">
                    {formData.cost && formData.price ? (
                      (() => {
                        const costNum = Number(formData.cost);
                        const priceNum = Number(formData.price);
                        const marginPercent = Math.round(((priceNum - costNum) / priceNum) * 100);
                        return (
                          <span className={marginPercent >= 35 ? 'text-green-400' : 'text-yellow-400'}>
                            {marginPercent}% {marginPercent >= 35 ? '💰 Óptimo (≥35%)' : '⚠️ Ajustable'}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-gray-500 text-[10px]">Escriba Costo y Precio</span>
                    )}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block pb-0.5">Acción de Margen</label>
                  <button
                    type="button"
                    onClick={() => {
                      const costVal = Number(formData.cost);
                      if (costVal > 0) {
                        // Apply precise standarized 45% profit margin rule: price = cost * 1.82 (replaces human pricing calculation)
                        const automPrice = Math.round(costVal * 1.82);
                        setFormData(prev => ({ ...prev, price: automPrice }));
                        toast.success(`Precio recalculado a $${automPrice} (Precio Sugerido YES 45%)`);
                      } else {
                        toast.error('Cargá un costo de proveedor primero');
                      }
                    }}
                    className="w-full bg-white/10 border border-white/10 hover:bg-primary hover:text-black rounded-xl text-white font-bold h-11 text-[9px] uppercase tracking-wider transition-all"
                  >
                    ⚡ Auto-Calcular Precio (Margen 45%)
                  </button>
                </div>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Precio Regular ($) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    placeholder="Ej: 45000"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono font-bold text-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Precio de Oferta ($) (Opcional)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Ej: 36000 (Dejar 0 si no hay oferta)"
                    value={formData.discountPrice || ''}
                    onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white font-mono font-bold text-accent"
                  />
                </div>
              </div>

              {/* Installments & Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-white/5 py-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cuotas sin Interés</label>
                  <select
                    value={formData.installments}
                    onChange={(e) => handleInputChange('installments', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
                  >
                    {[1, 3, 6, 12, 18].map(num => <option key={num} value={num} className="bg-background text-white">{num} Cuotas</option>)}
                  </select>
                </div>
                
                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 accent-primary"
                  />
                  <label htmlFor="featured" className="text-xs font-bold text-white uppercase cursor-pointer">Destacadísimo</label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input 
                    type="checkbox" 
                    id="dailyPromo"
                    checked={formData.dailyPromo}
                    onChange={(e) => handleInputChange('dailyPromo', e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 accent-accent"
                  />
                  <label htmlFor="dailyPromo" className="text-xs font-bold text-white uppercase cursor-pointer">Promo 60% OFF BAZAR</label>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Descripción Completa</label>
                <textarea 
                  rows={3}
                  placeholder="Descripción detallada del material, usos, medidas y cualidades del producto..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-white resize-none"
                />
              </div>

              {/* Imágenes URL y Subida */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Imágenes del Producto</label>
                  <button 
                    type="button" 
                    onClick={addImageUrlInput}
                    className="text-[9px] font-black uppercase text-primary tracking-widest hover:underline"
                  >
                    + Enlace de internet
                  </button>
                </div>

                {/* Local Image Uploader Box */}
                <div className="border border-dashed border-white/10 hover:border-primary/45 rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-center gap-2.5 relative group cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLocalImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-white block">Subir Foto Local (Desde Celular o PC)</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">La foto se recortará y optimizará automáticamente para evitar que de error.</span>
                  </div>
                </div>

                {/* Helpful error advice details */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2 text-[11px] leading-relaxed text-yellow-200">
                  <div className="flex items-center gap-2 font-black uppercase tracking-wider text-amber-400">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>¿Por qué puede dar error al cargar fotos?</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 pl-0.5">
                    <li><strong>Enlaces web incorrectos:</strong> Si copiaste la dirección de la página entera en lugar de hacer click derecho y tocar <em>"Copiar dirección de imagen"</em> (.jpg o .png).</li>
                    <li><strong>Enlaces a archivos de tu computadora:</strong> Las rutas como <code>C:\Fotos\...</code> no funcionan en internet porque nadie más puede acceder a tu disco. ¡Usa el botón de arriba para subirlas de verdad!</li>
                    <li><strong>Fotos extremadamente pesadas:</strong> Si intentas pegar códigos Base64 enormes o subir imágenes súper pesadas, superan el límite de base de datos de 1MB. El botón de arriba las comprime automáticamente, previniendo errores.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Listado de Enlaces/Rutas Activas:</span>
                  {formData.images.map((imgUrl, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/... o código de imagen"
                        value={imgUrl}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
                      />
                      <button
                        type="button"
                        onClick={() => generateMockImage(idx)}
                        className="px-3 bg-white/5 border border-white/10 rounded-xl text-primary hover:bg-primary/20 hover:text-white transition-all"
                        title="Generar Imagen Demostrativa"
                      >
                        <Sparkles size={14} />
                      </button>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageUrlInput(idx)}
                          className="px-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl uppercase tracking-widest text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-black font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/5 p-8 rounded-3xl max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tight">¿Estás absolutamente seguro?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Esta acción eliminará permanentemente el producto de la base de datos de tu bazar de Paraná. No podrás deshacer esta operación.
            </p>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsDeleteConfirmOpen(null)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl uppercase tracking-widest text-[10px]"
              >
                No, Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white font-black py-3 rounded-xl uppercase tracking-widest text-[10px] hover:bg-red-600 transition-colors"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
