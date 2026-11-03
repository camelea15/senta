import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Product, Order, WilayaDeliveryFee, PromoCode, OrderStatus } from '../types';
import {
  X,
  Lock,
  Package,
  ShoppingBag,
  MapPin,
  Tag,
  MessageSquare,
  BarChart3,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  KeyRound,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsUpdated?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onProductsUpdated }) => {
  const { language, t } = useLanguage();
  const isFrench = language === 'fr';

  // Auth State
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginUsername, setLoginUsername] = useState('admin@senta.dz');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'wilayas' | 'promos' | 'contacts' | 'security'>('overview');

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wilayas, setWilayas] = useState<WilayaDeliveryFee[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Order Filters
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Product Editing / Adding
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Promo Adding
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoValue, setNewPromoValue] = useState(10);
  const [newPromoMin, setNewPromoMin] = useState(5000);

  // Password Changing
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState({ text: '', isError: false });

  // Load Dashboard Data when token is set
  const loadDashboardData = async (token: string) => {
    setLoadingData(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, ordersRes, prodsRes, wilayasRes, promosRes, contactsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/products'),
        fetch('/api/admin/wilayas', { headers }),
        fetch('/api/admin/promos', { headers }),
        fetch('/api/admin/contacts', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (prodsRes.ok) setProducts(await prodsRes.json());
      if (wilayasRes.ok) setWilayas(await wilayasRes.json());
      if (promosRes.ok) setPromos(await promosRes.json());
      if (contactsRes.ok) setContacts(await contactsRes.json());
    } catch (e) {
      console.error('Failed loading admin data', e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Identifiants incorrects');
      } else {
        setAuthToken(data.token);
        loadDashboardData(data.token);
      }
    } catch {
      setLoginError('Erreur de connexion au serveur');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(() => {});
    }
    setAuthToken(null);
    setLoginPassword('');
  };

  // Status Updater
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (stats) {
          loadDashboardData(authToken);
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  // Product Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !authToken) return;

    try {
      if (isNewProduct) {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(editingProduct),
        });
        if (res.ok) {
          const added = await res.json();
          setProducts((prev) => [added, ...prev]);
          setEditingProduct(null);
          setIsNewProduct(false);
          onProductsUpdated?.();
        }
      } else if (editingProduct.id) {
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(editingProduct),
        });
        if (res.ok) {
          const updated = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setEditingProduct(null);
          onProductsUpdated?.();
        }
      }
    } catch (e) {
      console.error('Failed saving product', e);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (!authToken || !confirm('Supprimer ce parfum définitivement ?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        onProductsUpdated?.();
      }
    } catch (e) {
      console.error('Failed deleting product', e);
    }
  };

  // Wilaya fee update
  const handleWilayaUpdate = async (code: string, homeFee: number, deskFee: number, available: boolean) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/wilayas/${code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ homeFee, deskFee, available }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWilayas((prev) => prev.map((w) => (w.code === code ? updated : w)));
      }
    } catch (e) {
      console.error('Failed updating wilaya', e);
    }
  };

  // Promo add / toggle / delete
  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !authToken) return;

    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          code: newPromoCode.trim(),
          type: newPromoType,
          value: newPromoValue,
          minOrderAmount: newPromoMin,
          active: true,
        }),
      });
      if (res.ok) {
        const added = await res.json();
        setPromos((prev) => [added, ...prev]);
        setNewPromoCode('');
      }
    } catch (e) {
      console.error('Failed adding promo', e);
    }
  };

  const handleTogglePromo = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/promos/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setPromos((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch (e) {
      console.error('Failed toggling promo', e);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/admin/promos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error('Failed deleting promo', e);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setPwMessage({ text: '', isError: false });

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage({ text: data.error || 'Erreur', isError: true });
      } else {
        setPwMessage({ text: 'Mot de passe modifié avec succès !', isError: false });
        setCurrentPw('');
        setNewPw('');
      }
    } catch {
      setPwMessage({ text: 'Erreur réseau', isError: true });
    }
  };

  if (!isOpen) return null;

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (orderFilterStatus !== 'all' && o.status !== orderFilterStatus) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        o.reference.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phoneNumber.includes(q) ||
        o.wilayaName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div
        className="relative w-full max-w-6xl bg-[#17130F] border border-[#C69A55]/30 rounded-sm shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#C69A55]/20 flex items-center justify-between bg-[#130F0C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#C69A55]/15 border border-[#C69A55]/30 flex items-center justify-center text-[#C69A55]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#F8F1E8]">
                {t('adminTitle')}
              </h2>
              <span className="text-[11px] text-[#C69A55] tracking-wider uppercase">
                SENTA.DZ Management Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authToken && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 border border-[#C69A55]/30 text-[#E8D9C6] hover:text-rose-400 hover:border-rose-400 text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('adminLogout')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55] rounded-full transition-colors"
              aria-label={t('close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated: Secure Login Form */}
        {!authToken ? (
          <div className="p-8 sm:p-12 flex items-center justify-center min-h-[400px]">
            <form onSubmit={handleLogin} className="w-full max-w-md space-y-5 bg-[#1B1612] p-6 sm:p-8 rounded border border-[#C69A55]/25 shadow-xl">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-serif text-2xl font-bold text-[#F8F1E8]">
                  {t('adminLoginTitle')}
                </h3>
                <p className="text-xs text-[#E8D9C6]/60">
                  Accès réservé à l'équipe de gestion de SENTA.DZ
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1">
                  {t('adminUsername')}
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8D9C6] mb-1">
                  {t('adminPassword')}
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="SentaAdmin2026!"
                  className="w-full px-3.5 py-2.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-sm text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-[#C69A55] hover:bg-[#d8af6f] disabled:bg-neutral-800 text-[#17130F] font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loginLoading ? 'Vérification...' : t('adminLoginButton')}
              </button>

              <div className="pt-3 border-t border-[#C69A55]/15 text-[11px] text-[#E8D9C6]/50 text-center">
                Identifiants par défaut : <code className="text-[#C69A55]">admin@senta.dz</code> / <code className="text-[#C69A55]">SentaAdmin2026!</code>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-60 bg-[#130F0C] border-r border-[#C69A55]/20 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>{t('adminTabOverview')}</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center justify-between whitespace-nowrap transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>{t('adminTabOrders')}</span>
                </div>
                {orders.length > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/40">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                  activeTab === 'products'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <Package className="w-4 h-4 shrink-0" />
                <span>{t('adminTabProducts')}</span>
              </button>

              <button
                onClick={() => setActiveTab('wilayas')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                  activeTab === 'wilayas'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{t('adminTabWilayas')}</span>
              </button>

              <button
                onClick={() => setActiveTab('promos')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                  activeTab === 'promos'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <Tag className="w-4 h-4 shrink-0" />
                <span>{t('adminTabPromos')}</span>
              </button>

              <button
                onClick={() => setActiveTab('contacts')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center justify-between whitespace-nowrap transition-colors ${
                  activeTab === 'contacts'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>{t('adminTabContacts')}</span>
                </div>
                {contacts.filter((c) => !c.read).length > 0 && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                    {contacts.filter((c) => !c.read).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`px-3 py-2 text-xs font-medium rounded flex items-center gap-2.5 whitespace-nowrap transition-colors ${
                  activeTab === 'security'
                    ? 'bg-[#C69A55] text-[#17130F] font-bold'
                    : 'text-[#E8D9C6] hover:bg-[#C69A55]/10 hover:text-[#C69A55]'
                }`}
              >
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{t('adminTabSecurity')}</span>
              </button>
            </div>

            {/* Tab Content Stage */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#17130F]">
              {loadingData && (
                <div className="p-4 text-center text-xs text-[#C69A55] flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Chargement des données...</span>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded">
                      <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60">
                        {t('adminTotalRevenue')}
                      </span>
                      <p className="font-mono text-2xl font-bold text-[#C69A55] mt-1 tabular-nums">
                        {stats.totalRevenue?.toLocaleString()} DZD
                      </p>
                    </div>

                    <div className="p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded">
                      <span className="text-[11px] uppercase tracking-wider text-[#E8D9C6]/60">
                        {t('adminTotalOrders')}
                      </span>
                      <p className="font-mono text-2xl font-bold text-[#F8F1E8] mt-1 tabular-nums">
                        {stats.totalOrders}
                      </p>
                    </div>

                    <div className="p-4 bg-[#1B1612] border border-amber-500/25 rounded">
                      <span className="text-[11px] uppercase tracking-wider text-amber-400">
                        {t('adminPendingOrders')}
                      </span>
                      <p className="font-mono text-2xl font-bold text-amber-400 mt-1 tabular-nums">
                        {stats.pendingOrders}
                      </p>
                    </div>

                    <div className="p-4 bg-[#1B1612] border border-emerald-500/25 rounded">
                      <span className="text-[11px] uppercase tracking-wider text-emerald-400">
                        {t('adminCompletedOrders')}
                      </span>
                      <p className="font-mono text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
                        {stats.completedOrders}
                      </p>
                    </div>
                  </div>

                  {/* Quick Summary of Recent Orders */}
                  <div className="border border-[#C69A55]/20 rounded bg-[#1A1511] p-5">
                    <h3 className="font-serif text-lg font-bold text-[#F8F1E8] mb-4">
                      Dernières Commandes Reçues
                    </h3>
                    <div className="divide-y divide-[#C69A55]/10">
                      {orders.slice(0, 5).map((o) => (
                        <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="font-mono font-bold text-[#C69A55]">{o.reference}</span>
                            <span className="mx-2 text-[#E8D9C6]/40">·</span>
                            <span className="text-[#F8F1E8] font-medium">{o.customerName}</span>
                            <span className="mx-2 text-[#E8D9C6]/40">·</span>
                            <span className="text-[#E8D9C6]/70">{o.wilayaName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[#C69A55] tabular-nums">
                              {o.total.toLocaleString()} DZD
                            </span>
                            <span className="capitalize px-2 py-0.5 rounded text-[10px] font-medium bg-[#C69A55]/15 text-[#C69A55]">
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Order Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#C69A55]/70" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Recherche (Réf, Client, Wilaya)..."
                        className="w-full pl-9 pr-3 py-2 bg-[#1B1612] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] focus:outline-none focus:border-[#C69A55]"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                      {['all', 'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'].map(
                        (st) => (
                          <button
                            key={st}
                            onClick={() => setOrderFilterStatus(st)}
                            className={`px-2.5 py-1 text-xs rounded uppercase tracking-wider transition-colors ${
                              orderFilterStatus === st
                                ? 'bg-[#C69A55] text-[#17130F] font-bold'
                                : 'bg-[#1B1612] text-[#E8D9C6]/70 hover:text-[#C69A55]'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="border border-[#C69A55]/20 rounded overflow-x-auto bg-[#1B1612]">
                    <table className="w-full text-left text-xs text-[#E8D9C6]">
                      <thead className="bg-[#120E0B] text-[11px] uppercase tracking-wider text-[#C69A55] border-b border-[#C69A55]/20">
                        <tr>
                          <th className="p-3">Réf</th>
                          <th className="p-3">Client</th>
                          <th className="p-3">Wilaya & Commune</th>
                          <th className="p-3">Articles</th>
                          <th className="p-3">Total (DZD)</th>
                          <th className="p-3">Statut Actuel</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C69A55]/10">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-[#E8D9C6]/60">
                              Aucune commande trouvée.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-[#C69A55]/5 transition-colors">
                              <td className="p-3 font-mono font-bold text-[#C69A55] whitespace-nowrap">
                                {o.reference}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="font-medium text-[#F8F1E8]">{o.customerName}</div>
                                <div className="text-[11px] text-[#E8D9C6]/60 font-mono">{o.phoneNumber}</div>
                              </td>
                              <td className="p-3">
                                <div>{o.wilayaName} ({o.commune})</div>
                                <div className="text-[11px] text-[#E8D9C6]/60 truncate max-w-xs">{o.deliveryAddress}</div>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  {o.items.map((i, idx) => (
                                    <div key={idx} className="whitespace-nowrap">
                                      {i.productName} × <span className="font-mono">{i.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 font-mono font-bold text-[#C69A55] whitespace-nowrap tabular-nums">
                                {o.total.toLocaleString()} DZD
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                  o.status === 'delivered' ? 'bg-emerald-950/60 text-emerald-400' :
                                  o.status === 'cancelled' ? 'bg-rose-950/60 text-rose-400' :
                                  o.status === 'shipped' ? 'bg-indigo-950/60 text-indigo-400' :
                                  'bg-amber-950/60 text-amber-400'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <select
                                  value={o.status}
                                  onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                                  className="bg-[#120E0B] border border-[#C69A55]/30 text-xs text-[#F8F1E8] rounded px-2 py-1 focus:outline-none"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmé</option>
                                  <option value="preparing">En préparation</option>
                                  <option value="shipped">Expédié</option>
                                  <option value="delivered">Livré</option>
                                  <option value="cancelled">Annulé</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-lg font-bold text-[#F8F1E8]">
                      Catalogue Parfums ({products.length})
                    </h3>
                    <button
                      onClick={() => {
                        setEditingProduct({
                          name: '',
                          nameAr: '',
                          category: 'unisex',
                          volume: '100 ml',
                          price: 8500,
                          stockQuantity: 20,
                          descriptionFr: '',
                          descriptionAr: '',
                          image: '/src/assets/images/perfume_eclat_dor_1793742299864.jpg',
                          inStock: true,
                        });
                        setIsNewProduct(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#C69A55] text-[#17130F] font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 hover:bg-[#d8af6f] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('adminAddProduct')}</span>
                    </button>
                  </div>

                  {/* Add / Edit Form Modal */}
                  {editingProduct && (
                    <form onSubmit={handleSaveProduct} className="p-5 bg-[#1B1612] border border-[#C69A55] rounded space-y-4 mb-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-[#C69A55]/20 pb-3">
                        <h4 className="font-serif text-base font-bold text-[#F8F1E8]">
                          {isNewProduct ? 'Nouveau Parfum' : `Modifier: ${editingProduct.name}`}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="text-[#E8D9C6]/60 hover:text-rose-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">Nom (Français)</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">الاسم (بالعربية)</label>
                          <input
                            type="text"
                            value={editingProduct.nameAr || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">{t('adminPrice')}</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">{t('adminStock')}</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.stockQuantity || 0}
                            onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">{t('adminCategory')}</label>
                          <select
                            value={editingProduct.category || 'unisex'}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                          >
                            <option value="women">Femme</option>
                            <option value="men">Homme</option>
                            <option value="unisex">Unisexe</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">Description (FR)</label>
                          <textarea
                            rows={2}
                            value={editingProduct.descriptionFr || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, descriptionFr: e.target.value })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#E8D9C6] mb-1">الوصف (AR)</label>
                          <textarea
                            rows={2}
                            value={editingProduct.descriptionAr || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })}
                            className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#E8D9C6] mb-1">Image URL / Chemin d'image</label>
                        <input
                          type="text"
                          value={editingProduct.image || ''}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8] font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 border border-[#C69A55]/30 text-xs rounded text-[#E8D9C6]"
                        >
                          {t('adminCancel')}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#C69A55] text-[#17130F] font-bold text-xs rounded uppercase tracking-wider"
                        >
                          {t('adminSave')}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="p-3 bg-[#1B1612] border border-[#C69A55]/20 rounded flex gap-3 items-center">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded bg-[#110E0B] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#F8F1E8] truncate">{p.name}</h4>
                          <p className="text-xs text-[#C69A55] font-mono tabular-nums">{p.price.toLocaleString()} DZD</p>
                          <p className="text-[11px] text-[#E8D9C6]/60">Stock : {p.stockQuantity} ({p.category})</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsNewProduct(false);
                            }}
                            className="p-1.5 text-[#E8D9C6]/60 hover:text-[#C69A55]"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-[#E8D9C6]/60 hover:text-rose-400"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: WILAYAS & DELIVERY FEES */}
              {activeTab === 'wilayas' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#F8F1E8]">
                      Tarifs de Livraison des 58 Wilayas d'Algérie
                    </h3>
                    <p className="text-xs text-[#E8D9C6]/60">
                      Ajustez directement les frais à domicile et en bureau (Stop Desk) pour chaque wilaya.
                    </p>
                  </div>

                  <div className="border border-[#C69A55]/20 rounded overflow-x-auto bg-[#1B1612]">
                    <table className="w-full text-left text-xs text-[#E8D9C6]">
                      <thead className="bg-[#120E0B] text-[11px] uppercase tracking-wider text-[#C69A55] border-b border-[#C69A55]/20">
                        <tr>
                          <th className="p-3">Code</th>
                          <th className="p-3">Wilaya</th>
                          <th className="p-3">الولاية</th>
                          <th className="p-3">À Domicile (DZD)</th>
                          <th className="p-3">Stop Desk (DZD)</th>
                          <th className="p-3">Disponible</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C69A55]/10">
                        {wilayas.map((w) => (
                          <tr key={w.code} className="hover:bg-[#C69A55]/5">
                            <td className="p-3 font-mono font-bold text-[#C69A55]">{w.code}</td>
                            <td className="p-3 font-medium text-[#F8F1E8]">{w.nameFr}</td>
                            <td className="p-3 text-right">{w.nameAr}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                defaultValue={w.homeFee}
                                onBlur={(e) =>
                                  handleWilayaUpdate(w.code, Number(e.target.value), w.deskFee, w.available)
                                }
                                className="w-20 px-2 py-1 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                defaultValue={w.deskFee}
                                onBlur={(e) =>
                                  handleWilayaUpdate(w.code, w.homeFee, Number(e.target.value), w.available)
                                }
                                className="w-20 px-2 py-1 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="checkbox"
                                defaultChecked={w.available}
                                onChange={(e) =>
                                  handleWilayaUpdate(w.code, w.homeFee, w.deskFee, e.target.checked)
                                }
                                className="accent-[#C69A55]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: PROMOS */}
              {activeTab === 'promos' && (
                <div className="space-y-6">
                  {/* Add Promo Form */}
                  <form onSubmit={handleAddPromo} className="p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded space-y-3">
                    <h4 className="font-serif text-sm font-bold text-[#F8F1E8]">Créer un Nouveau Code Promo</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#E8D9C6] mb-1">Code</label>
                        <input
                          type="text"
                          required
                          value={newPromoCode}
                          onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                          placeholder="EX: FETE2026"
                          className="w-full px-3 py-1.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#E8D9C6] mb-1">Type</label>
                        <select
                          value={newPromoType}
                          onChange={(e) => setNewPromoType(e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs"
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant Fixe (DZD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#E8D9C6] mb-1">Valeur</label>
                        <input
                          type="number"
                          required
                          value={newPromoValue}
                          onChange={(e) => setNewPromoValue(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#E8D9C6] mb-1">Minimum Achat (DZD)</label>
                        <input
                          type="number"
                          value={newPromoMin}
                          onChange={(e) => setNewPromoMin(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C69A55] text-[#17130F] font-bold text-xs uppercase tracking-wider rounded"
                    >
                      Ajouter le code promo
                    </button>
                  </form>

                  {/* Promo List */}
                  <div className="space-y-2">
                    {promos.map((p) => (
                      <div key={p.id} className="p-3 bg-[#1B1612] border border-[#C69A55]/20 rounded flex items-center justify-between">
                        <div>
                          <span className="font-mono text-base font-bold text-[#C69A55]">{p.code}</span>
                          <span className="mx-2 text-[#E8D9C6]/40">·</span>
                          <span className="text-xs text-[#F8F1E8]">
                            {p.type === 'percentage' ? `${p.value}% de réduction` : `${p.value} DZD offerts`}
                          </span>
                          <span className="mx-2 text-[#E8D9C6]/40">·</span>
                          <span className="text-xs text-[#E8D9C6]/60">Utilisé {p.usedCount} fois</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePromo(p.id)}
                            className={`px-2.5 py-1 text-[11px] rounded font-semibold ${
                              p.active ? 'bg-emerald-950/60 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {p.active ? 'Actif' : 'Désactivé'}
                          </button>
                          <button
                            onClick={() => handleDeletePromo(p.id)}
                            className="p-1.5 text-[#E8D9C6]/50 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-3">
                  <h3 className="font-serif text-lg font-bold text-[#F8F1E8]">
                    Messages des Visiteurs ({contacts.length})
                  </h3>
                  {contacts.length === 0 ? (
                    <p className="text-xs text-[#E8D9C6]/60">Aucun message pour le moment.</p>
                  ) : (
                    contacts.map((c) => (
                      <div key={c.id} className="p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-[#F8F1E8]">{c.name} ({c.phone || c.email})</span>
                          <span className="text-[#E8D9C6]/50 font-mono">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-[#E8D9C6]/85 bg-[#14100D] p-3 rounded">{c.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 7: SECURITY */}
              {activeTab === 'security' && (
                <div className="max-w-md space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#F8F1E8]">
                    Sécurité et Mot de Passe Administrateur
                  </h3>
                  <p className="text-xs text-[#E8D9C6]/60">
                    Modifiez le mot de passe d'accès au panneau de contrôle. L'authentification est vérifiée côté serveur via PBKDF2.
                  </p>

                  {pwMessage.text && (
                    <div className={`p-3 text-xs rounded flex items-center gap-2 ${
                      pwMessage.isError ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {pwMessage.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      <span>{pwMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3 p-4 bg-[#1B1612] border border-[#C69A55]/20 rounded">
                    <div>
                      <label className="block text-xs font-medium text-[#E8D9C6] mb-1">Mot de passe actuel</label>
                      <input
                        type="password"
                        required
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#E8D9C6] mb-1">Nouveau mot de passe (min. 8 car.)</label>
                      <input
                        type="password"
                        required
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="w-full px-3 py-2 bg-[#14100D] border border-[#C69A55]/30 rounded text-xs text-[#F8F1E8]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C69A55] text-[#17130F] font-bold text-xs uppercase tracking-wider rounded"
                    >
                      Mettre à jour
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
