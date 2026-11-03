import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db, OrderStatus, Product } from './db.js';

export const apiRouter = express.Router();

// In-memory active session tokens for admin
interface SessionInfo {
  username: string;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionInfo>();

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, info] of activeSessions.entries()) {
    if (info.expiresAt < now) {
      activeSessions.delete(token);
    }
  }
}, 3600000);

// Admin Auth Middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expirée ou invalide.' });
  }

  // Slide expiration (extend session by 12 hours)
  session.expiresAt = Date.now() + 12 * 3600 * 1000;
  (req as any).adminUser = session.username;
  next();
}

// ----------------------------------------------------
// PUBLIC STORE ROUTES
// ----------------------------------------------------

// Get all products
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    let products = db.getProducts();
    const { category, sort, search } = req.query;

    if (category && category !== 'all') {
      products = products.filter((p) => p.category === category);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.descriptionFr.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-asc') {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      products = [...products].sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      products = [...products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
  }
});

// Get single product
apiRouter.get('/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Produit non trouvé' });
  }
  res.json(product);
});

// Get Wilayas and delivery rates
apiRouter.get('/wilayas', (_req: Request, res: Response) => {
  res.json(db.getWilayas());
});

// Validate Promo Code
apiRouter.post('/promos/validate', (req: Request, res: Response) => {
  const { code, cartTotal } = req.body;
  if (!code || typeof cartTotal !== 'number') {
    return res.status(400).json({ error: 'Données invalides' });
  }

  const result = db.validatePromo(code, cartTotal);
  if (!result.valid) {
    return res.status(400).json({ error: result.message || 'Code promo invalide' });
  }

  res.json(result);
});

// Validate Algerian phone number: 05/06/07 followed by 8 digits, or with +213
function isValidAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\.]/g, '');
  const algerianRegex = /^(0|\+213|00213)(5|6|7)[0-9]{8}$/;
  return algerianRegex.test(cleaned);
}

// Create New Order
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phoneNumber,
      wilayaCode,
      commune,
      deliveryAddress,
      deliveryMethod,
      items,
      promoCode,
      notes,
    } = req.body;

    // Field validations
    if (!customerName || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Nom complet requis (au moins 2 caractères).' });
    }

    if (!phoneNumber || !isValidAlgerianPhone(phoneNumber)) {
      return res.status(400).json({
        error: 'Numéro de téléphone algérien invalide. Ex: 0550123456 ou 0661234567.',
      });
    }

    if (!wilayaCode) {
      return res.status(400).json({ error: 'Veuillez sélectionner votre wilaya.' });
    }

    const wilaya = db.getWilayas().find((w) => w.code === wilayaCode);
    if (!wilaya || !wilaya.available) {
      return res.status(400).json({ error: 'Wilaya non disponible pour la livraison.' });
    }

    if (!commune || commune.trim().length < 2) {
      return res.status(400).json({ error: 'Commune requise.' });
    }

    if (!deliveryAddress || deliveryAddress.trim().length < 4) {
      return res.status(400).json({ error: 'Adresse de livraison requise.' });
    }

    if (!['home', 'desk'].includes(deliveryMethod)) {
      return res.status(400).json({ error: 'Mode de livraison invalide.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Votre panier est vide.' });
    }

    // Server-side recalculation of subtotal and inventory checks
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Produit introuvable: ${item.productId}` });
      }
      if (prod.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Stock insuffisant pour "${prod.name}" (seulement ${prod.stockQuantity} disponible).`,
        });
      }

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        productId: prod.id,
        productName: prod.name,
        productNameAr: prod.nameAr,
        volume: prod.volume,
        price: prod.price,
        quantity: item.quantity,
        image: prod.image,
      });
    }

    // Delivery fee calculation
    const settings = db.getSettings();
    let deliveryFee = deliveryMethod === 'desk' ? wilaya.deskFee : wilaya.homeFee;

    // Free shipping threshold check
    if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) {
      deliveryFee = 0;
    }

    // Promo code validation
    let discountAmount = 0;
    let appliedPromo = undefined;
    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const promoResult = db.validatePromo(promoCode, subtotal);
      if (promoResult.valid) {
        discountAmount = promoResult.discount;
        appliedPromo = promoCode.trim().toUpperCase();
      }
    }

    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    const newOrder = db.createOrder({
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      wilayaCode: wilaya.code,
      wilayaName: wilaya.nameFr,
      commune: commune.trim(),
      deliveryAddress: deliveryAddress.trim(),
      deliveryMethod,
      deliveryFee,
      items: verifiedItems,
      subtotal,
      discountAmount,
      promoCode: appliedPromo,
      total,
      paymentMethod: 'cod',
      status: 'pending',
      notes: notes ? notes.trim() : undefined,
    });

    res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création de la commande.' });
  }
});

// Order lookup by reference & phone (customer self-check)
apiRouter.get('/orders/lookup/:ref', (req: Request, res: Response) => {
  const ref = req.params.ref.toUpperCase().trim();
  const phone = (req.query.phone as string)?.trim();

  const orders = db.getOrders();
  const order = orders.find(
    (o) =>
      o.reference.toUpperCase() === ref &&
      (!phone || o.phoneNumber.replace(/\s+/g, '').endsWith(phone.replace(/\s+/g, '').slice(-8)))
  );

  if (!order) {
    return res.status(404).json({ error: 'Commande introuvable avec ces coordonnées.' });
  }

  // Return non-sensitive summary
  res.json({
    reference: order.reference,
    customerName: order.customerName,
    wilayaName: order.wilayaName,
    status: order.status,
    total: order.total,
    itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
    deliveryMethod: order.deliveryMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
});

// Submit Contact Message
apiRouter.post('/contact', (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;
  if (!name || !message || message.trim().length < 5) {
    return res.status(400).json({ error: 'Nom et message requis.' });
  }

  const saved = db.addContact({
    name: name.trim(),
    email: email ? email.trim() : '',
    phone: phone ? phone.trim() : '',
    message: message.trim(),
  });

  res.status(201).json({ success: true, message: 'Message reçu avec succès. Merci !', id: saved.id });
});

// Get Store Settings
apiRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

// ----------------------------------------------------
// PROTECTED ADMIN ROUTES
// ----------------------------------------------------

// Admin Login
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
  }

  const isValid = db.verifyAdmin(username, password);
  if (!isValid) {
    return res.status(401).json({ error: 'Identifiants administrateur incorrects.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 24 * 3600 * 1000; // 24 hours
  activeSessions.set(token, { username, expiresAt });

  res.json({
    token,
    user: {
      username,
      role: 'admin',
    },
    expiresAt,
  });
});

// Admin Verify Session
apiRouter.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: {
      username: (req as any).adminUser,
      role: 'admin',
    },
  });
});

// Admin Logout
apiRouter.post('/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// Change Password
apiRouter.post('/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const username = (req as any).adminUser;

  if (!db.verifyAdmin(username, currentPassword)) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
  }

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit comporter au moins 8 caractères.' });
  }

  db.changeAdminPassword(newPassword);
  res.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
});

// Dashboard Statistics
apiRouter.get('/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getStats());
});

// Orders Management
apiRouter.get('/admin/orders', requireAdmin, (req: Request, res: Response) => {
  let orders = db.getOrders();
  const { status, search } = req.query;

  if (status && status !== 'all') {
    orders = orders.filter((o) => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    orders = orders.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phoneNumber.includes(q) ||
        o.wilayaName.toLowerCase().includes(q)
    );
  }

  res.json(orders);
});

// Update Order Status
apiRouter.patch('/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Statut de commande invalide.' });
  }

  const updated = db.updateOrderStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Commande non trouvée.' });
  }

  res.json(updated);
});

// Product Management
apiRouter.post('/admin/products', requireAdmin, (req: Request, res: Response) => {
  const {
    name,
    nameAr,
    category,
    volume,
    price,
    descriptionFr,
    descriptionAr,
    topNotesFr,
    topNotesAr,
    heartNotesFr,
    heartNotesAr,
    baseNotesFr,
    baseNotesAr,
    image,
    inStock,
    stockQuantity,
    isFeatured,
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Nom, prix et catégorie requis.' });
  }

  const created = db.addProduct({
    name,
    nameAr: nameAr || name,
    category,
    volume: volume || '100 ml',
    price: Number(price),
    descriptionFr: descriptionFr || '',
    descriptionAr: descriptionAr || '',
    topNotesFr: topNotesFr || '',
    topNotesAr: topNotesAr || '',
    heartNotesFr: heartNotesFr || '',
    heartNotesAr: heartNotesAr || '',
    baseNotesFr: baseNotesFr || '',
    baseNotesAr: baseNotesAr || '',
    image: image || '/src/assets/images/perfume_eclat_dor_1793742299864.jpg',
    inStock: inStock !== undefined ? Boolean(inStock) : true,
    stockQuantity: Number(stockQuantity) || 10,
    isFeatured: Boolean(isFeatured),
  });

  res.status(201).json(created);
});

apiRouter.put('/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }
  res.json(updated);
});

apiRouter.delete('/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }
  res.json({ success: true });
});

// Wilaya Delivery Fees Management
apiRouter.get('/admin/wilayas', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getWilayas());
});

apiRouter.put('/admin/wilayas/:code', requireAdmin, (req: Request, res: Response) => {
  const { homeFee, deskFee, available } = req.body;
  const updated = db.updateWilayaFee(req.params.code, {
    homeFee: Number(homeFee),
    deskFee: Number(deskFee),
    available: available !== undefined ? Boolean(available) : true,
  });

  if (!updated) {
    return res.status(404).json({ error: 'Wilaya non trouvée.' });
  }
  res.json(updated);
});

// Promo Codes Management
apiRouter.get('/admin/promos', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getPromos());
});

apiRouter.post('/admin/promos', requireAdmin, (req: Request, res: Response) => {
  const { code, type, value, minOrderAmount, active } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'Code, type et valeur requis.' });
  }

  const created = db.addPromo({
    code,
    type,
    value: Number(value),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
    active: active !== undefined ? Boolean(active) : true,
  });

  res.status(201).json(created);
});

apiRouter.patch('/admin/promos/:id/toggle', requireAdmin, (req: Request, res: Response) => {
  const updated = db.togglePromo(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Code promo non trouvé.' });
  res.json(updated);
});

apiRouter.delete('/admin/promos/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deletePromo(req.params.id);
  if (!success) return res.status(404).json({ error: 'Code promo non trouvé.' });
  res.json({ success: true });
});

// Contacts Management
apiRouter.get('/admin/contacts', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getContacts());
});

apiRouter.patch('/admin/contacts/:id/read', requireAdmin, (req: Request, res: Response) => {
  db.markContactRead(req.params.id);
  res.json({ success: true });
});

// Store Settings
apiRouter.get('/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

apiRouter.put('/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});
