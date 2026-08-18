/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import OffersPage from './pages/OffersPage';
import AboutPage from './pages/AboutPage';
import PaymentsPage from './pages/PaymentsPage';
import Admin from './pages/Admin';
import { CartProvider } from './context/CartContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <FirebaseProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/ofertas" element={<OffersPage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/pagos" element={<PaymentsPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
        <Toaster position="bottom-left" />
      </CartProvider>
    </FirebaseProvider>
  );
}
