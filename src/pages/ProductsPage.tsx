import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { mockProducts, categories } from '../lib/mockData';
import { useFirebase } from '../context/FirebaseContext';
import { getProducts } from '../services/dataService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Filter, Grid, Search, X } from 'lucide-react';

export default function ProductsPage() {
  const { db } = useFirebase();
  const { setSelectedProduct } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);

  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';

  useEffect(() => {
    getProducts(db).then(data => {
      if (data.length > 0) setProducts(data);
      else setProducts(mockProducts);
    });
  }, [db]);

  const handleCategorySelect = (categoryName: string) => {
    if (categoryName) {
      searchParams.set('category', categoryName);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const filteredProducts = products.filter(product => {
    // Search query match
    if (activeSearch.trim()) {
      const query = activeSearch.toLowerCase().trim();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Category match
    if (activeCategory) {
      if (activeCategory === 'deals') {
        const hasDiscount = !!(product.discountPrice && product.discountPrice < product.price);
        return hasDiscount;
      }
      return product.category === activeCategory;
    }

    return true;
  });

  return (
    <Layout>
      <div className="py-12 px-6 max-w-7xl mx-auto">
        
        {/* Page title area */}
        <div className="mb-12">
          <div className="badge flex gap-1.5 items-center w-fit mb-4">
            <Filter size={12} className="text-primary" />
            <span>Catálogo Oficial Paraná</span>
          </div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tight">
            NUESTROS <span className="text-primary italic">PRODUCTOS</span>
          </h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">
            Explorá nuestra variedad seleccionada para el equipamiento integral de tu hogar.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-2.5 mb-12">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${!activeCategory ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
          >
            Todos
          </button>
          
          <button
            onClick={() => handleCategorySelect('deals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${activeCategory === 'deals' ? 'bg-accent border-accent text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
          >
            🔥 60% OFF
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${activeCategory === cat.name ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active Filters Summary Header */}
        {(activeCategory || activeSearch) && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 mb-8">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Filtros Activos:</span>
              {activeSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono text-xs border border-primary/25">
                  Búsqueda: "{activeSearch}"
                  <button onClick={() => { searchParams.delete('search'); setSearchParams(searchParams); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-mono text-xs border border-primary/25">
                  Categoría: {activeCategory === 'deals' ? 'Ofertas 60% OFF' : activeCategory}
                  <button onClick={() => handleCategorySelect('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-primary transition-colors border-b border-dashed border-gray-600 hover:border-primary pb-0.5"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, idx) => (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
                <ProductCard product={product} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center glass rounded-3xl border border-white/5">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No encontramos productos con estos filtros.</p>
            <p className="text-xs text-gray-500 mt-2">Intentá con otras palabras clave o revisá nuestras categorías principales.</p>
            <button 
              onClick={clearFilters}
              className="mt-8 text-black bg-primary font-black uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-full hover:scale-105 transition-all"
            >
              Ver todos los productos
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
