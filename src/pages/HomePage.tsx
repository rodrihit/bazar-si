import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import Testimonials from '../components/Testimonials';
import Layout from '../components/Layout';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../lib/mockData';
import { useFirebase } from '../context/FirebaseContext';
import { getProducts } from '../services/dataService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { db } = useFirebase();
  const { setSelectedProduct } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts(db).then(data => {
      const items = data.length > 0 ? data : mockProducts;
      // Filter out some unique items or just take first 4 as featured items
      setFeaturedProducts(items.slice(0, 4));
    });
  }, [db]);

  const handleSelectCategory = (category: string) => {
    if (category) {
      navigate(`/productos?category=${encodeURIComponent(category)}`);
    } else {
      navigate('/productos');
    }
  };

  const handleDealsClick = () => {
    navigate('/ofertas');
  };

  return (
    <Layout>
      <Hero onDealsClick={handleDealsClick} />
      
      <Categories onSelectCategory={handleSelectCategory} />

      {/* Featured Products Section in Homepage */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
          <div className="space-y-4">
            <div className="badge inline-flex gap-1 items-center">
              <Sparkles size={12} className="text-primary" />
              <span>Exclusividad YES</span>
            </div>
            <h2 className="text-4xl font-display font-black uppercase tracking-tight">
              Diseños <span className="text-primary italic">Destacados</span>
            </h2>
            <p className="text-xs text-gray-400 font-bold max-w-md uppercase tracking-wider">
              La selección favorita de Paraná para cambiar la personalidad de tus ambientes.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/productos')}
            className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors py-2 px-1 border-b border-primary/20 hover:border-white"
          >
            <span>Ver Todo el Catálogo</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, idx) => (
            <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </Layout>
  );
}
