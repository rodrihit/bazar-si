import Layout from '../components/Layout';
import PaymentMethods from '../components/PaymentMethods';
import OrderTracker from '../components/OrderTracker';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <Layout>
      <div className="py-12">
        {/* Payments Header */}
        <div className="max-w-7xl mx-auto px-6 mb-12">
          <div className="badge flex gap-1.5 items-center w-fit mb-4">
            <ShieldCheck size={12} className="text-primary" />
            <span>Transacciones 100% Seguras</span>
          </div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tight">
            PAGOS Y <span className="text-primary italic">SEGUIMIENTO</span>
          </h1>
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-1">
            Informá transferencias, revisá promociones y hacé el seguimiento en tiempo real de tu pedido.
          </p>
        </div>

        {/* Medios de Pago grid & simulator */}
        <PaymentMethods />

        {/* Seguimiento de compra real-time backend verification tool */}
        <div className="border-t border-white/5 pt-12">
          <OrderTracker />
        </div>
      </div>
    </Layout>
  );
}
