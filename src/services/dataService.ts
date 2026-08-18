import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  setDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from '../lib/firebase';
import { Product, Category, Order, Quotation, AutomationLog, Coupon, StockNotification } from '../types';
import { mockProducts } from '../lib/mockData';

// Strips undefined values to prevent Firebase/Firestore crashes
const cleanObject = (obj: any): any => {
  if (obj === null || obj === undefined) return null; // Convert undefined to null or omit
  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanObject(val);
      }
    }
    return cleaned;
  }
  return obj;
};

// Local storage helpers to guarantee persistence
const getLocalProducts = (): Product[] | null => {
  try {
    const data = localStorage.getItem('bazar_yes_products');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

const saveLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem('bazar_yes_products', JSON.stringify(products));
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
};

const getDeletedProductIds = (): string[] => {
  try {
    const data = localStorage.getItem('bazar_yes_deleted_ids');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const addDeletedProductId = (id: string) => {
  try {
    const deleted = getDeletedProductIds();
    if (!deleted.includes(id)) {
      localStorage.setItem('bazar_yes_deleted_ids', JSON.stringify([...deleted, id]));
    }
  } catch (e) {
    console.error(e);
  }
};

const removeDeletedProductId = (id: string) => {
  try {
    const deleted = getDeletedProductIds();
    localStorage.setItem('bazar_yes_deleted_ids', JSON.stringify(deleted.filter(d => d !== id)));
  } catch (e) {
    console.error(e);
  }
};

const getEditedProductsMap = (): Record<string, Product> => {
  try {
    const data = localStorage.getItem('bazar_yes_edited_products');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const saveEditedProduct = (product: Product) => {
  try {
    const edited = getEditedProductsMap();
    edited[product.id] = product;
    localStorage.setItem('bazar_yes_edited_products', JSON.stringify(edited));
  } catch (e) {
    console.error(e);
  }
};

const removeEditedProduct = (id: string) => {
  try {
    const edited = getEditedProductsMap();
    delete edited[id];
    localStorage.setItem('bazar_yes_edited_products', JSON.stringify(edited));
  } catch (e) {
    console.error(e);
  }
};

export const getProducts = async (db: Firestore | null) => {
  const local = getLocalProducts();
  const deletedIds = getDeletedProductIds();
  const editedMap = getEditedProductsMap();

  const applyLocalChanges = (productsList: Product[]) => {
    // 1. Filter out deleted products
    let filtered = productsList.filter(p => !deletedIds.includes(p.id));
    // 2. Overlay edited products or append newly added ones
    const productMap = new Map<string, Product>();
    filtered.forEach(p => productMap.set(p.id, p));
    Object.values(editedMap).forEach(p => {
      if (!deletedIds.includes(p.id)) {
        productMap.set(p.id, p);
      }
    });

    return Array.from(productMap.values());
  };

  if (!db) {
    const validMockIds = new Set(mockProducts.map(p => p.id));
    const userCustomProducts = (local || []).filter(p => p.id.startsWith('prod_'));
    const baseList = [...mockProducts, ...userCustomProducts];
    const finalProducts = applyLocalChanges(baseList);
    saveLocalProducts(finalProducts);
    return finalProducts;
  }
  
  const path = 'products';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    const validMockIds = new Set(mockProducts.map(p => p.id));
    const productMap = new Map<string, Product>();
    mockProducts.forEach(p => productMap.set(p.id, p));
    if (local && local.length > 0) {
      local.filter(p => p.id.startsWith('prod_')).forEach(p => productMap.set(p.id, p));
    }
    if (dbProducts.length > 0) {
      dbProducts.filter(p => p.id.startsWith('prod_') || validMockIds.has(p.id)).forEach(p => productMap.set(p.id, p));
    }
    
    const baseList = Array.from(productMap.values());
    const finalProducts = applyLocalChanges(baseList);
    saveLocalProducts(finalProducts);
    return finalProducts;
  } catch (error) {
    console.warn('Firestore getProducts failed, using local storage fallback:', error);
    const userCustomProducts = (local || []).filter(p => p.id.startsWith('prod_'));
    const baseList = [...mockProducts, ...userCustomProducts];
    const finalProducts = applyLocalChanges(baseList);
    saveLocalProducts(finalProducts);
    return finalProducts;
  }
};

export const saveProductToDb = async (db: Firestore | null, productData: Omit<Product, 'id' | 'createdAt'> & { id?: string }) => {
  const local = getLocalProducts();
  const currentProducts = local || mockProducts;
  const now = new Date().toISOString();
  let updatedProducts: Product[];
  let finalId = productData.id || `prod_${Date.now()}`;

  const finalProduct: Product = {
    ...productData,
    id: finalId,
    createdAt: (currentProducts.find(p => p.id === finalId)?.createdAt) || now
  };

  // Track edits locally to prevent overwritten lists on sync pulls
  removeDeletedProductId(finalId);
  saveEditedProduct(finalProduct);

  if (productData.id) {
    // Update existing
    updatedProducts = currentProducts.map(p => p.id === finalId ? finalProduct : p);
  } else {
    // Add new
    updatedProducts = [finalProduct, ...currentProducts];
  }
  
  saveLocalProducts(updatedProducts);

  if (db) {
    // Run in background without await so UI remains instantaneous
    const docRef = doc(db, 'products', finalId);
    setDoc(docRef, cleanObject(finalProduct), { merge: true }).catch(error => {
      console.warn('Could not save product to Firestore in background:', error);
    });
  }

  // Trigger N8N automated replenishment alert if stock is critical (<= 5)
  try {
    const n8nEnabled = localStorage.getItem('bazar_yes_n8n_enabled') !== 'false';
    const isCritical = finalProduct.stock <= 5;
    if (n8nEnabled && isCritical) {
      const localQuotes = getLocalQuotations();
      // Ensure we don't spam duplicate alerts if there is an active draft
      const existingDraft = localQuotes.find(q => q.productId === finalProduct.id && q.status === 'draft');
      if (!existingDraft) {
        const webhookUrl = localStorage.getItem('bazar_yes_n8n_webhook_url') || '';
        const sellersWhatsapp = localStorage.getItem('bazar_yes_n8n_sellers_whatsapp') || '5493435033268';
        const reorderAmount = Number(localStorage.getItem('bazar_yes_n8n_reorder_amount') || '20');
        const supplierDefaultPhone = localStorage.getItem('bazar_yes_n8n_supplier_default_phone') || '5493435033268';

        const newQuote: Quotation = {
          id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          productId: finalProduct.id,
          productName: finalProduct.name,
          currentStock: finalProduct.stock,
          minQuantity: reorderAmount,
          unitPrice: Math.round(finalProduct.price * 0.6), // Default 60% estimated cost
          status: 'draft',
          createdAt: new Date().toISOString(),
          supplierPhone: supplierDefaultPhone,
          sellerPhone: sellersWhatsapp,
          sourceWebhookUrl: webhookUrl
        };

        saveQuotationToDb(db, newQuote).then(() => {
          if (webhookUrl && webhookUrl.startsWith('http')) {
            triggerN8NWebhook(webhookUrl, newQuote, sellersWhatsapp, reorderAmount).catch(err => {
              console.warn('Error firing background N8N Webhook:', err);
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('N8N check failed:', err);
  }

  return finalProduct;
};

export const deleteProductFromDb = async (db: Firestore | null, productId: string) => {
  // Mark as deleted internally to prevent restore on remote list pulls
  addDeletedProductId(productId);
  removeEditedProduct(productId);

  const local = getLocalProducts();
  const currentProducts = local || mockProducts;
  const updatedProducts = currentProducts.filter(p => p.id !== productId);
  saveLocalProducts(updatedProducts);

  if (db) {
    // Delete in background without awaiting so modal confirms immediately
    const docRef = doc(db, 'products', productId);
    deleteDoc(docRef).catch(error => {
      console.warn('Could not remove product from Firestore in background:', error);
    });
  }
};

export const getCategories = async (db: Firestore | null) => {
  if (!db) return [];
  const path = 'categories';
  try {
    const snapshot = await getDocs(collection(db, path));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

// Local storage helper for orders
const getLocalOrders = (): Order[] => {
  try {
    const data = localStorage.getItem('bazar_yes_orders');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalOrders = (orders: Order[]) => {
  try {
    localStorage.setItem('bazar_yes_orders', JSON.stringify(orders));
  } catch (e) {
    console.error(e);
  }
};

export const createOrder = async (db: Firestore | null, order: Omit<Order, 'id' | 'createdAt'>) => {
  const now = new Date().toISOString();
  const newId = `order_${Date.now()}`;
  const newOrder: Order = {
    ...order,
    id: newId,
    createdAt: now,
    status: 'pending'
  };

  const currentLocalOrders = getLocalOrders();
  saveLocalOrders([newOrder, ...currentLocalOrders]);

  if (db) {
    const docRef = doc(db, 'orders', newId);
    setDoc(docRef, {
      ...order,
      id: newId,
      createdAt: now,
      status: 'pending'
    }).catch(error => {
      console.error('Firestore createOrder failed, saved locally and via WhatsApp:', error);
    });
  }
  return newId;
};

export const getAdminOrders = async (db: Firestore | null) => {
  const localOrders = getLocalOrders();
  if (!db) {
    return localOrders;
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const dbOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    
    // Sync DB and Local
    if (dbOrders.length > 0) {
      // Merge unique orders
      const orderMap = new Map<string, Order>();
      localOrders.forEach(o => orderMap.set(o.id, o));
      dbOrders.forEach(o => orderMap.set(o.id, o));
      const merged = Array.from(orderMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalOrders(merged);
      return merged;
    }
    return localOrders;
  } catch (error) {
    console.warn('Firestore getAdminOrders failed, using local fallback:', error);
    return localOrders;
  }
};

export const getOrderDetailsFromDb = async (db: Firestore | null, orderId: string): Promise<Order | null> => {
  const localOrders = getLocalOrders();
  const localMatch = localOrders.find(o => o.id.trim() === orderId.trim() || o.id.includes(orderId.trim()));
  if (localMatch) return localMatch;

  if (db) {
    try {
      const snapshot = await getDocs(query(collection(db, 'orders'), where('id', '==', orderId.trim())));
      if (!snapshot.empty) {
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Order;
      }
    } catch (e) {
      console.warn('Could not read specific order from DB:', e);
    }
  }
  return null;
};

export const updateOrderStatusInDb = async (db: Firestore | null, orderId: string, status: Order['status']) => {
  const localOrders = getLocalOrders();
  const index = localOrders.findIndex(o => o.id === orderId);
  if (index === -1) return;
  
  const order = localOrders[index];
  
  // Create copy of the order to modify
  const updatedOrder = { ...order, status };
  
  // Stock real handling:
  // Deduct stock if status changes to confirmed or delivered, and wasn't deducted yet.
  const isTargetingDeduction = status === 'confirmed' || status === 'delivered';
  const isPreviousDeducted = !!order.stockDeducted;
  
  if (isTargetingDeduction && !isPreviousDeducted) {
    // Deduct stock
    const products = await getProducts(db);
    for (const item of order.items) {
      const p = products.find(prod => prod.id === item.id);
      if (p) {
        // Prevent stock from going below 0
        p.stock = Math.max(0, p.stock - item.quantity);
        await saveProductToDb(db, p);
      }
    }
    updatedOrder.stockDeducted = true;
  } else if (!isTargetingDeduction && isPreviousDeducted) {
    // If it was deducted and we revert to pending/cancelled, return the stock!
    const products = await getProducts(db);
    for (const item of order.items) {
      const p = products.find(prod => prod.id === item.id);
      if (p) {
        p.stock = p.stock + item.quantity;
        await saveProductToDb(db, p);
      }
    }
    updatedOrder.stockDeducted = false;
  }
  
  // Save updated order
  const updatedList = localOrders.map(o => o.id === orderId ? updatedOrder : o);
  saveLocalOrders(updatedList);

  if (db) {
    // Update in background without awaiting, preventing UI lag!
    const docRef = doc(db, 'orders', orderId);
    setDoc(docRef, updatedOrder, { merge: true }).catch(error => {
      console.error('Firestore updateOrderStatus in background failed:', error);
    });
  }
};

export const submitPaymentProofInDb = async (
  db: Firestore | null, 
  orderId: string, 
  comment: string, 
  proofUrl: string
) => {
  const localOrders = getLocalOrders();
  const index = localOrders.findIndex(o => o.id === orderId);
  
  const updatedData = {
    paymentProofComment: comment,
    paymentProofUrl: proofUrl,
    paymentProofUpdatedAt: new Date().toISOString()
  };

  if (index > -1) {
    const order = localOrders[index];
    localOrders[index] = { ...order, ...updatedData };
    saveLocalOrders(localOrders);
  }

  if (db) {
    try {
      const docRef = doc(db, 'orders', orderId);
      await setDoc(docRef, updatedData, { merge: true });
    } catch (e) {
      console.error('Firestore submitPaymentProof failed:', e);
    }
  }
};

// Real-Time Shopping Carts Synchronization for Admin Insight
export const syncActiveCartToDb = async (
  db: Firestore | null,
  items: any[],
  totalAmount: number,
  user: any
) => {
  let sessionId = localStorage.getItem('bazar_yes_cart_session_id');
  if (!sessionId) {
    sessionId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('bazar_yes_cart_session_id', sessionId);
  }

  const now = new Date().toISOString();
  const cartData = {
    id: sessionId,
    customerName: user?.displayName || 'Cliente Web',
    customerEmail: user?.email || 'N/A',
    items: items,
    total: totalAmount,
    updatedAt: now,
  };

  // Sync to database silently in the background
  if (db) {
    const docRef = doc(db, 'carts', sessionId);
    if (items.length === 0) {
      deleteDoc(docRef).catch(e => console.warn('Silently cleaned up empty cart document in background:', e));
    } else {
      setDoc(docRef, cartData, { merge: true }).catch(e => console.warn('Could not sync active cart in background:', e));
    }
  }
};

export const getActiveCarts = async (db: Firestore | null): Promise<any[]> => {
  if (!db) {
    try {
      const data = localStorage.getItem('bazar_yes_all_active_carts');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  try {
    const q = query(collection(db, 'carts'), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    const carts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    localStorage.setItem('bazar_yes_all_active_carts', JSON.stringify(carts));
    return carts;
  } catch (error) {
    console.warn('Could not fetch active carts from Firestore, reading local fallback list:', error);
    try {
      const data = localStorage.getItem('bazar_yes_all_active_carts');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
};

// Local storage helper for quotations
export const getLocalQuotations = (): Quotation[] => {
  try {
    const data = localStorage.getItem('bazar_yes_quotations');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalQuotations = (quotations: Quotation[]) => {
  try {
    localStorage.setItem('bazar_yes_quotations', JSON.stringify(quotations));
  } catch (e) {
    console.error(e);
  }
};

export const getQuotationsFromDb = async (db: Firestore | null): Promise<Quotation[]> => {
  const localQs = getLocalQuotations();
  if (!db) {
    return localQs;
  }
  const path = 'quotations';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const dbQs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
    
    if (dbQs.length > 0) {
      const qMap = new Map<string, Quotation>();
      localQs.forEach(o => qMap.set(o.id, o));
      dbQs.forEach(o => qMap.set(o.id, o));
      const merged = Array.from(qMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalQuotations(merged);
      return merged;
    }
    return localQs;
  } catch (error) {
    console.warn('Firestore getQuotations failed:', error);
    return localQs;
  }
};

export const saveQuotationToDb = async (db: Firestore | null, quotation: Quotation) => {
  const localQs = getLocalQuotations();
  const updatedList = localQs.map(q => q.id === quotation.id ? quotation : q);
  if (!localQs.some(q => q.id === quotation.id)) {
    updatedList.unshift(quotation);
  }
  saveLocalQuotations(updatedList);

  if (db) {
    try {
      const docRef = doc(db, 'quotations', quotation.id);
      await setDoc(docRef, quotation, { merge: true });
    } catch (error) {
      console.warn('Firestore saveQuotation failed:', error);
    }
  }
  return quotation;
};

// Fire N8N Webhook with actual API calls
export const triggerN8NWebhook = async (
  webhookUrl: string, 
  quotation: Quotation,
  sellersWhatsapp: string,
  reorderAmount: number
): Promise<boolean> => {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.warn('Invalid N8N Webhook URL configured. Skipping request fetch.');
    addAutomationLog(null, {
      title: 'Fallo al disparar N8N: URL no válida o vacía',
      eventType: 'manual_test',
      status: 'failed',
      payload: { webhookUrl, productId: quotation.productId }
    });
    return false;
  }

  try {
    const payloadData = {
      event: 'critical_stock',
      bnd_name: 'Bazar YES Paraná',
      quotationId: quotation.id,
      productId: quotation.productId,
      productName: quotation.productName,
      currentStock: quotation.currentStock,
      suggestedMinQuantity: reorderAmount,
      suggestedUnitPrice: quotation.unitPrice,
      sellers: sellersWhatsapp,
      whatsappPromptUrl: `https://wa.me/${sellersWhatsapp}?text=${encodeURIComponent(
        `Hola! Se detectó Stock Crítico del producto *${quotation.productName}* (${quotation.currentStock} unidades restantes). ¿Querés pedir cotización? \n\n• Cantidad Mínima Propuesta: ${reorderAmount} unidades\n• Precio Estimado Unidad: $${quotation.unitPrice}\n\nPodés confirmar o corregir este pedido desde el panel de Bazar YES.`
      )}`
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadData)
    });

    if (response.ok) {
      console.log('N8N Webhook triggered successfully!');
      addAutomationLog(null, {
        title: `Alerta N8N enviada: Stock crítico de ${quotation.productName}`,
        eventType: 'stock_alert_sent',
        status: 'success',
        payload: payloadData
      });
      return true;
    } else {
      console.warn('N8N Webhook returned non-ok status:', response.status);
      addAutomationLog(null, {
        title: `Fallo N8N: Código ${response.status} en stock de ${quotation.productName}`,
        eventType: 'stock_alert_sent',
        status: 'failed',
        payload: { errorStatus: response.status, url: webhookUrl, ...payloadData }
      });
      return false;
    }
  } catch (err: any) {
    console.error('Error triggering N8N Webhook:', err);
    addAutomationLog(null, {
      title: `Error de red en Webhook N8N: ${err?.message || 'Error desconocido'}`,
      eventType: 'stock_alert_sent',
      status: 'failed',
      payload: { error: err?.message || String(err), webhookUrl }
    });
    return false;
  }
};

// Local storage helper for automation logs
export const getLocalAutomationLogs = (): AutomationLog[] => {
  try {
    const data = localStorage.getItem('bazar_yes_automation_logs');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalAutomationLogs = (logs: AutomationLog[]) => {
  try {
    localStorage.setItem('bazar_yes_automation_logs', JSON.stringify(logs));
  } catch (e) {
    console.error(e);
  }
};

export const addAutomationLog = async (db: Firestore | null, logEntry: Omit<AutomationLog, 'id' | 'timestamp'>) => {
  const newLog: AutomationLog = {
    ...logEntry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };
  const logs = getLocalAutomationLogs();
  // Keep last 150 logs to prevent localStorage bloat
  const updatedLogs = [newLog, ...logs].slice(0, 150);
  saveLocalAutomationLogs(updatedLogs);

  if (db) {
    try {
      const docRef = doc(db, 'automation_logs', newLog.id);
      await setDoc(docRef, cleanObject(newLog), { merge: true });
    } catch (e) {
      console.warn('Firestore addAutomationLog failed:', e);
    }
  }
  return newLog;
};

export const getAutomationLogsFromDb = async (db: Firestore | null): Promise<AutomationLog[]> => {
  const localLogs = getLocalAutomationLogs();
  if (!db) return localLogs;
  try {
    const q = query(collection(db, 'automation_logs'), orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const dbLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AutomationLog));
    if (dbLogs.length > 0) {
      const logMap = new Map<string, AutomationLog>();
      localLogs.forEach(l => logMap.set(l.id, l));
      dbLogs.forEach(l => logMap.set(l.id, l));
      const merged = Array.from(logMap.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 150);
      saveLocalAutomationLogs(merged);
      return merged;
    }
    return localLogs;
  } catch (e) {
    console.warn('Firestore getAutomationLogsFromDb failed:', e);
    return localLogs;
  }
};

// ==========================================
// OPTION 1: SMART COUPONS SYSTEM
// ==========================================
const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'coupon_1',
    code: 'BIENVENIDOCALIDO',
    discountType: 'percentage',
    discountValue: 10,
    isActive: true,
    description: '10% OFF Sin Compra Mínima (Bienvenida!)'
  },
  {
    id: 'coupon_2',
    code: 'PARANA35',
    discountType: 'fixed',
    discountValue: 3500,
    minPurchase: 25000,
    isActive: true,
    description: '$3.500 de Regalo en Compras > $25.000'
  },
  {
    id: 'coupon_3',
    code: 'EFECTIVOMIX',
    discountType: 'percentage',
    discountValue: 15,
    minPurchase: 40000,
    isActive: true,
    description: '15% OFF en Compras Especiales > $40.000'
  }
];

export const getLocalCoupons = (): Coupon[] => {
  try {
    const data = localStorage.getItem('bazar_yes_coupons');
    if (!data) {
      localStorage.setItem('bazar_yes_coupons', JSON.stringify(DEFAULT_COUPONS));
      return DEFAULT_COUPONS;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_COUPONS;
  }
};

export const saveLocalCoupons = (coupons: Coupon[]) => {
  try {
    localStorage.setItem('bazar_yes_coupons', JSON.stringify(coupons));
  } catch (e) {
    console.error(e);
  }
};

export const getCouponsFromDb = async (db: Firestore | null): Promise<Coupon[]> => {
  const local = getLocalCoupons();
  if (!db) return local;
  try {
    const q = query(collection(db, 'coupons'));
    const snapshot = await getDocs(q);
    const dbCoupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
    if (dbCoupons.length > 0) {
      const couponMap = new Map<string, Coupon>();
      local.forEach(c => couponMap.set(c.code.toUpperCase(), c));
      dbCoupons.forEach(c => couponMap.set(c.code.toUpperCase(), c));
      const merged = Array.from(couponMap.values());
      saveLocalCoupons(merged);
      return merged;
    }
    return local;
  } catch (e) {
    console.warn('Firestore getCouponsFromDb failed:', e);
    return local;
  }
};

export const saveCouponToDb = async (db: Firestore | null, coupon: Coupon) => {
  const local = getLocalCoupons();
  const existsIdx = local.findIndex(c => c.id === coupon.id || c.code.toUpperCase() === coupon.code.toUpperCase());
  
  let updated: Coupon[];
  if (existsIdx > -1) {
    updated = [...local];
    updated[existsIdx] = coupon;
  } else {
    updated = [coupon, ...local];
  }
  saveLocalCoupons(updated);

  if (db) {
    try {
      const docRef = doc(db, 'coupons', coupon.id);
      await setDoc(docRef, coupon, { merge: true });
    } catch (e) {
      console.warn('Firestore saveCouponToDb failed:', e);
    }
  }
};

// ==========================================
// OPTION 3: STOCK NOTIFICATIONS CUSTOMER QUEUE
// ==========================================
export const getLocalStockNotifications = (): StockNotification[] => {
  try {
    const data = localStorage.getItem('bazar_yes_stock_notifications');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalStockNotifications = (notifications: StockNotification[]) => {
  try {
    localStorage.setItem('bazar_yes_stock_notifications', JSON.stringify(notifications));
  } catch (e) {
    console.error(e);
  }
};

export const getStockNotificationsFromDb = async (db: Firestore | null): Promise<StockNotification[]> => {
  const local = getLocalStockNotifications();
  if (!db) return local;
  try {
    const q = query(collection(db, 'stock_notifications'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const dbNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockNotification));
    if (dbNotifications.length > 0) {
      const map = new Map<string, StockNotification>();
      local.forEach(n => map.set(n.id, n));
      dbNotifications.forEach(n => map.set(n.id, n));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalStockNotifications(merged);
      return merged;
    }
    return local;
  } catch (e) {
    console.warn('Firestore getStockNotificationsFromDb failed:', e);
    return local;
  }
};

export const addStockNotification = async (
  db: Firestore | null, 
  notification: Omit<StockNotification, 'id' | 'createdAt' | 'status'>
) => {
  const newNotif: StockNotification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const local = getLocalStockNotifications();
  const updated = [newNotif, ...local];
  saveLocalStockNotifications(updated);

  if (db) {
    try {
      const docRef = doc(db, 'stock_notifications', newNotif.id);
      await setDoc(docRef, newNotif, { merge: true });
    } catch (e) {
      console.warn('Firestore addStockNotification failed:', e);
    }
  }
  return newNotif;
};

export const updateStockNotificationStatus = async (
  db: Firestore | null, 
  id: string, 
  status: 'pending' | 'notified'
) => {
  const local = getLocalStockNotifications();
  const updated = local.map(n => {
    if (n.id === id) {
      return { ...n, status, notifiedAt: status === 'notified' ? new Date().toISOString() : undefined };
    }
    return n;
  });
  saveLocalStockNotifications(updated);

  if (db) {
    try {
      const docRef = doc(db, 'stock_notifications', id);
      await updateDoc(docRef, { 
        status, 
        notifiedAt: status === 'notified' ? new Date().toISOString() : null 
      });
    } catch (e) {
      console.warn('Firestore updateStockNotificationStatus failed:', e);
    }
  }
};


