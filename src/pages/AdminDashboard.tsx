/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactModal from 'react-modal';
import { formatDate } from '../utils/formatDate';
import OrderSummaryCard from '../components/OrderSummaryCard';
import OrderTrackingWidget from '../components/OrderTrackingWidget';
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import CustomerDetail from './AdminDashboard/Customers/CustomerDetail';
import autoTable from 'jspdf-autotable';
import { addProduct, getAllProducts } from '../firebaseHelpers';
import { useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, getDoc, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { LayoutDashboardIcon, ShoppingBagIcon, PackageIcon, UsersIcon, BarChartIcon, SettingsIcon, MenuIcon, XIcon, SearchIcon, BellIcon, ChevronDownIcon, TrendingUpIcon, ClockIcon, UserCheckIcon, DollarSignIcon, ChevronRightIcon, FilterIcon, AlertCircleIcon, PlusIcon, TagIcon, BoxIcon, CreditCardIcon, TrashIcon, EditIcon, DownloadIcon, PrinterIcon, CheckCircleIcon, UserPlusIcon, StarIcon, MessageCircleIcon, RefreshCwIcon, EyeIcon, KeyIcon, RepeatIcon, TruckIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// =============================
// AdminDashboard.tsx
// =============================
// Senior Developer Notes:
// This file implements the main admin dashboard for the e-commerce app, including navigation, analytics, orders, products, customers, reports, and settings.
// It uses React functional components, hooks for state, and Lucide icons for UI.
//
// Key Concepts:
// - React hooks for state and UI control
// - Modular mock data for charts, tables, and detail views
// - Conditional rendering for multi-tab navigation
// - Inline documentation for maintainability and onboarding
// =============================

interface InventoryAlert {
  id: string;
  product: string;
  sku: string;
  stock: number;
  threshold: number;
  image: string;
  category: string;
  lastUpdated: Date;
  status: 'low' | 'adequate' | 'out-of-stock';
}

interface Customer {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  lastLogin: string;
  createdAt: string;
  receiveEmails: boolean;
  ordersCount?: number;
  segment?: 'new' | 'repeat' | 'high';
  totalSpent?: number;
}

// Product type for all usages
type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  category: string[];
  image: string;
  imageUrl?: string;
  inStock: boolean;
  isBestSeller: boolean;
  rating: number;
  stock: number;
  careInstructions: {
    light: string;
    temperature: string;
    warnings: string;
    water: string;
  };
  specifications: {
    Difficulty: string;
    'Growth Rate': string;
    'Light Requirements': string;
    'Mature Height': string;
    'Pet Friendly': string;
    'Pot Size': string;
  };
  relatedProducts: string[];
  reviews: string;
  featured?: boolean;
  lowStockThreshold?: number;
};
type Order = {
  id: string;
  customer?: string;
  date?: string;
  status?: string;
  timeline?: { status: string; date?: string; description?: string }[];
  total?: number;
  paymentMethod?: string;
  shippingMethod?: string;
  items?: any[];
};


export const AdminDashboard: React.FC = () => {
  // Type for dashboard recent orders
  type DashboardOrder = {
    id: string;
    customer: string;
    date: string;
    status: string;
    total: number;
    paymentMethod: string;
    shippingMethod: string;
  };
  // =============================
  // State Management
  // =============================
  // Sales over time chart data (from Firebase)
  const [salesData, setSalesData] = useState<{ month: string; sales: number }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  // Sorting for orders (used by Filter modal)
  const [orderSortField, setOrderSortField] = useState<'none' | 'date' | 'customer' | 'total' | 'payment'>('none');
  const [orderSortDir, setOrderSortDir] = useState<'asc' | 'desc'>('desc');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [customerSegmentFilter, setCustomerSegmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [reportType, setReportType] = useState('sales');
  const [reportTimeframe, setReportTimeframe] = useState('month');
  const [activeSettingsTab, setActiveSettingsTab] = useState('store');
  // Modal state for add product
  const [showAddProductModal, setShowAddProductModal] = useState(false);
   // State for delete confirmation modal
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
    // State for delete feedback
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
    // State for product search
  const [productSearchQuery, setProductSearchQuery] = useState("");
    // State for filter modal
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Pagination state for orders and customers
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [customersCurrentPage, setCustomersCurrentPage] = useState(1);
  // Search query for customers
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  // Bulk selection state for orders and products
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [orderBulkAction, setOrderBulkAction] = useState('Bulk Actions');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productBulkAction, setProductBulkAction] = useState('');
    // Orders state for Orders tab
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  //Invntory Alerts
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<string | null>(null);

    // Firebase: Real-time inventory alerts subscription
  useEffect(() => {
    const inventoryRef = collection(db, 'inventory');
    const lowStockQuery = query(
      inventoryRef,
      where('stock', '<=', 10), // Your threshold
      orderBy('stock', 'asc')
    );

    const unsubscribe = onSnapshot(lowStockQuery, (snapshot) => {
      const alerts: InventoryAlert[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as InventoryAlert));
      setInventoryAlerts(alerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firebase: Restock item function
  const handleRestock = async (itemId: string, currentStock: number) => {
    setRestocking(itemId);
    try {
      const itemRef = doc(db, 'inventory', itemId);
      const itemDoc = await getDoc(itemRef);
      
      if (itemDoc.exists()) {
        const restockQuantity = 25; // Your default quantity
        await updateDoc(itemRef, {
          stock: currentStock + restockQuantity,
          lastUpdated: new Date()
        });
        // Optional: Add success toast/notification
      }
    } catch (error) {
      console.error('Failed to restock:', error);
      // Optional: Add error toast/notification
    } finally {
      setRestocking(null);
    }
  };

  // ==========================
// Customer Orders State + Listener
// ==========================


useEffect(() => {
  if (!selectedCustomer) {
    setCustomerOrders([]);
    return;
  }


  const customer = allCustomers.find((c) => c.id === selectedCustomer);
  if (!customer) return;

  

  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", customer.id));

  console.log("Listening for real-time orders of:", customer.id);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        console.log("No orders found for user:", customer.id);
        setCustomerOrders([]);
        return;
      }

      const formatted = snapshot.docs.map((doc) => {
        const data = doc.data();

        const latestTimeline =
          Array.isArray(data.timeline) && data.timeline.length > 0
            ? data.timeline[data.timeline.length - 1]
            : null;

        return {
          id: doc.id,
          date:
            latestTimeline?.date ||
            data.date ||
            (data.createdAt?.seconds
              ? new Date(data.createdAt.seconds * 1000)
              : null),
          status: latestTimeline?.status || data.status || "Pending",
          total: typeof data.total === "number" ? data.total : 0,
          timeline: data.timeline || [],
        };
      });

      console.log("Realtime fetched orders:", formatted);
      setCustomerOrders(formatted);
    },
    (error) => {
      console.error("Error fetching orders:", error);
      setCustomerOrders([]);
    }
  );

  return () => unsubscribe();
}, [selectedCustomer, allCustomers]);
  // Select / deselect handlers for orders
  const handleSelectAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // select all currently filtered orders
      setSelectedOrderIds((filteredOrders as Order[]).map((o: Order) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  // Select / deselect handlers for products (used in products table)
  const handleSelectAllProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p: any) => String(p.id)));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  // Bulk action for orders
  const handleOrderBulkAction = async () => {
    if (orderBulkAction === 'Export Selected') {
      // Get selected orders
      const selectedOrders = allOrders.filter(o => selectedOrderIds.includes(o.id));
      
      // Convert orders to CSV format
      const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Total', 'Payment Method', 'Shipping Method'];
      const csvRows = [headers];

      selectedOrders.forEach(order => {
        csvRows.push([
          order.id,
          order.customer || '',
          order.date ? new Date(order.date).toLocaleDateString() : '',
          order.status || '',
          order.total?.toString() || '',
          order.paymentMethod || '',
          order.shippingMethod || ''
        ]);
      });

      // Convert to CSV string
      const csvContent = csvRows.map(row => row.join(',')).join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      setSelectedOrderIds([]);
      setOrderBulkAction('Bulk Actions');
    } else if (orderBulkAction === 'Delete Selected') {
      if (!window.confirm(`Delete ${selectedOrderIds.length} selected orders? This cannot be undone.`)) return;
      try {
        for (const id of selectedOrderIds) {
          await deleteDoc(doc(db, 'orders', id));
        }
        setAllOrders((prev: Order[]) => prev.filter(o => !selectedOrderIds.includes(o.id)));
        setDeleteFeedback('Selected orders deleted successfully.');
        setTimeout(() => setDeleteFeedback(null), 3000);
        setSelectedOrderIds([]);
      } catch (err) {
        alert('Failed to delete selected orders.');
        console.error('Bulk delete orders error:', err);
      }
    } else if (orderBulkAction === 'Update Status') {
      const newStatus = window.prompt('Enter new status (e.g. Processing, Shipped, Delivered, Cancelled):');
      if (newStatus === null) return;
      const trimmed = newStatus.trim();
      if (!trimmed) return;
      try {
        const timestamp = new Date().toISOString();
        for (const id of selectedOrderIds) {
          const order = (allOrders as Order[]).find((o: Order) => o.id === id);
          const timeline = Array.isArray(order?.timeline) ? [...order.timeline] : [];
          const newEntry = { status: trimmed, date: timestamp, description: `Status updated to ${trimmed} by admin` };
          const updatedTimeline = [...timeline, newEntry];
          await updateDoc(doc(db, 'orders', id), { timeline: updatedTimeline, status: trimmed });
        }
        setAllOrders((prev: Order[]) => prev.map(o => selectedOrderIds.includes(o.id) ? { ...o, timeline: [...(o.timeline || []), { status: trimmed, date: timestamp, description: `Status updated to ${trimmed} by admin` }], status: trimmed } as Order : o));
        setDeleteFeedback('Order statuses updated.');
        setTimeout(() => setDeleteFeedback(null), 3000);
        setSelectedOrderIds([]);
        setOrderBulkAction('Bulk Actions');
      } catch (err) {
        alert('Failed to update selected orders.');
        console.error('Bulk update orders error:', err);
      }
    }
  };

  // Product bulk action (simple implementation similar to orders)
  const handleProductBulkAction = async () => {
    if (productBulkAction === 'Delete Selected') {
      if (!window.confirm(`Delete ${selectedProductIds.length} selected products? This cannot be undone.`)) return;
      try {
        for (const id of selectedProductIds) {
          await deleteDoc(doc(db, 'products', id));
        }
        setProducts((prev: Product[]) => prev.filter(p => !selectedProductIds.includes(p.id)));
        setDeleteFeedback('Selected products deleted successfully.');
        setTimeout(() => setDeleteFeedback(null), 3000);
        setSelectedProductIds([]);
      } catch (err) {
        alert('Failed to delete selected products.');
        console.error('Bulk delete error:', err);
      }
    } else if (productBulkAction === 'Mark as Featured') {
      try {
        for (const id of selectedProductIds) {
          await updateDoc(doc(db, 'products', id), { featured: true });
        }
        setProducts((prev: Product[]) => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, featured: true } : p));
        setDeleteFeedback('Selected products marked as featured.');
        setTimeout(() => setDeleteFeedback(null), 3000);
        setSelectedProductIds([]);
      } catch (err) {
        alert('Failed to mark as featured.');
        console.error('Bulk feature error:', err);
      }
    } else if (productBulkAction === 'Update Stock') {
      const newStockStr = window.prompt('Enter new stock quantity for selected products:');
      if (newStockStr === null) return;
      const newStock = parseInt(newStockStr);
      if (isNaN(newStock) || newStock < 0) {
        alert('Invalid stock value.');
        return;
      }
      try {
        for (const id of selectedProductIds) {
          const product = products.find(p => p.id === id);
          const updateData: Record<string, unknown> = { stock: newStock };
          if (product && product.stock === 0 && newStock > 0) {
            (updateData as any).inStock = true;
          }
          await updateDoc(doc(db, 'products', id), updateData as any);
        }
        setProducts((prev: Product[]) => prev.map(p => selectedProductIds.includes(p.id) ? { ...p, stock: newStock, inStock: p.stock === 0 && newStock > 0 ? true : p.stock > 0 && newStock === 0 ? false : p.inStock } : p));
        setDeleteFeedback('Stock updated for selected products.');
        setTimeout(() => setDeleteFeedback(null), 3000);
        setSelectedProductIds([]);
      } catch (err) {
        alert('Failed to update stock.');
        console.error('Bulk stock update error:', err);
      }
    }
  };
  type ProductForm = {
    name: string;
    description: string;
    longDescription: string;
    price: string;
    category: string[];
    image: string;
    inStock: boolean;
    isBestSeller: boolean;
    rating: number;
    stock: string;
    careInstructions: {
      light: string;
      temperature: string;
      warnings: string;
      water: string;
    };
    specifications: {
      Difficulty: string;
      'Growth Rate': string;
      'Light Requirements': string;
      'Mature Height': string;
      'Pet Friendly': string;
      'Pot Size': string;
    };
    relatedProducts: string[];
    reviews: string;
  };

  const [addProductForm, setAddProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    longDescription: '',
    price: '',
    category: [],
    image: '',
    inStock: true,
    isBestSeller: false,
    rating: 0,
    stock: '',
    careInstructions: {
      light: '',
      temperature: '',
      warnings: '',
      water: '',
    },
    specifications: {
      Difficulty: '',
      'Growth Rate': '',
      'Light Requirements': '',
      'Mature Height': '',
      'Pet Friendly': '',
      'Pot Size': '',
    },
    relatedProducts: ['', '', ''],
    reviews: '',
  });

  // Edit product modal and form state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  // Use a map/object for specifications with string values
  const [editProductForm, setEditProductForm] = useState<{
    [key: string]: any;
    specifications?: { [key: string]: string };
  } | null>(null);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  // Confirmation popup state for edit product modal
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Edit product form change handler
  const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editProductForm) return;
    const { name, value, type } = e.target;
    if (name.startsWith('careInstructions.')) {
      const key = name.replace('careInstructions.', '');
      setEditProductForm((prev: any) => ({
        ...prev,
        careInstructions: {
          ...prev.careInstructions,
          [key]: value,
        },
      }));
    } else if (name.startsWith('specifications.')) {
      const key = name.replace('specifications.', '');
      setEditProductForm((prev: any) => ({
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [key]: value,
        },
      }));
    } else if (name.startsWith('relatedProducts.')) {
      const idx = parseInt(name.replace('relatedProducts.', ''));
      setEditProductForm((prev: any) => {
        const arr = [...prev.relatedProducts];
        arr[idx] = value;
        return { ...prev, relatedProducts: arr };
      });
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditProductForm((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setEditProductForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Edit product submit handler
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation popup before saving
    setShowEditConfirm(true);
  };

  function deleteProductFromFirestore(productId: string) {
  throw new Error('Function not implemented.');
}

  // Delete product handler
  const handleDeleteProduct = async (productId: string) => {
  try {
    await deleteProductFromFirestore(productId); // your delete function
    setProducts(prev => prev.filter(p => p.id !== productId));
    setDeleteFeedback('Product deleted successfully.');
    setTimeout(() => setDeleteFeedback(null), 4000); // Hide after 4s
  } catch (err) {
    setDeleteFeedback('Error deleting product. Please try again.');
    setTimeout(() => setDeleteFeedback(null), 4000);
  }
};

  // Handler for confirming save changes
  const handleConfirmEditSave = async () => {
    if (!editProductForm || !editProductId) return;
    const updatedProduct = {
      ...editProductForm,
      id: editProductId,
      sku: editProductForm.sku || editProductId,
      price: parseFloat(editProductForm.price),
      stock: editProductForm.stock === '' ? 0 : parseInt(editProductForm.stock),
      inStock: Boolean(editProductForm.inStock),
      isBestSeller: Boolean(editProductForm.isBestSeller),
      rating: Number(editProductForm.rating),
      relatedProducts: editProductForm.relatedProducts
        .filter(Boolean)
        .map((refId: string) => doc(collection(db, 'products'), refId)),
    };
    try {
      // Update Firestore document
      const { doc, collection } = await import('firebase/firestore');
      const productRef = doc(collection(db, 'products'), editProductId);
      await updateDoc(productRef, updatedProduct);
      setProducts((prev: any[]) => prev.map(p => (p.id === editProductId ? updatedProduct : p)));
    } catch (err) {
      alert('Failed to update product.');
      console.error('Firestore update error:', err);
    }
    setShowEditProductModal(false);
    setEditProductForm(null);
    setEditProductId(null);
    setShowEditConfirm(false);
  };

  // Handler for cancelling confirmation
  const handleCancelEditSave = () => {
    setShowEditConfirm(false);
  };

  // Handler for dowloading pdf
const handleDownloadPDF = (order: any) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'pt',
    format: 'a4'
  });

  // === Company Header ===
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(22, 101, 52); // green
  doc.text('Starseedz Nurseries', 40, 60);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text('123 Garden Street, Portland, OR 97201', 40, 80);
  doc.text('Tel: (555) 123-4567 | contact@starseedz.com', 40, 95);

  // === Invoice & Customer Info ===
  const subtotal =
    typeof order.total === 'number'
      ? order.total
      : parseFloat(String(order.total).replace('$', ''));
  const shipping = 5.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('INVOICE', 40, 130);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(`Order #: ${order.id}`, 40, 150);
  doc.text(`Date: ${formatDate(order.date)}`, 40, 165);

  // Bill To section (right side)
  const billX = 360;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  doc.text('Bill To:', billX, 130);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  doc.text(order.customer, billX, 150);
  doc.text('123 Main Street', billX, 165);
  doc.text('Portland, OR 97201', billX, 180);

  // === Items Table ===
  const tableColumn = ['Product', 'Quantity', 'Price', 'Total'];
  const tableRows: string[][] = [];

  (order.items || []).forEach((item: any) => {
    tableRows.push([
      item.name,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);
  });

  autoTable(doc, {
    startY: 210,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: [17, 24, 39],
      lineColor: [229, 231, 235],
      lineWidth: 0.5
    },
    headStyles: {
      fillColor: [249, 250, 251],
      textColor: [17, 24, 39],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255]
    },
    margin: { left: 40, right: 40 }
  });

  // === Totals Section ===
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  const rightEdge = 555;

  const totals = [
    ['Subtotal:', `$${subtotal.toFixed(2)}`],
    ['Shipping:', `$${shipping.toFixed(2)}`],
    ['Tax (8%):', `$${tax.toFixed(2)}`],
    ['Total:', `$${total.toFixed(2)}`]
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  totals.forEach(([label, value], index) => {
    const y = finalY + index * 20;
    doc.text(label, rightEdge - 120, y);
    doc.setFont('helvetica', label === 'Total:' ? 'bold' : 'normal');
    doc.text(value, rightEdge, y, { align: 'right' });
  });

  // === Footer ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text('Thank you for your business!', 40, finalY + 100);
  doc.text(`Payment processed via ${order.paymentMethod}`, 40, finalY + 115);

  // === Save PDF ===
  doc.save(`invoice-${order.id}.pdf`);
};

  // Products from Firebase
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const fbProducts = await getAllProducts();
        setProducts(fbProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);
  const handleAddProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith('careInstructions.')) {
      const key = name.replace('careInstructions.', '');
      setAddProductForm(f => ({ ...f, careInstructions: { ...f.careInstructions, [key]: value } }));
    } else if (name.startsWith('specifications.')) {
      const key = name.replace('specifications.', '');
      setAddProductForm(f => ({ ...f, specifications: { ...f.specifications, [key]: value } }));
    } else if (name.startsWith('relatedProducts.')) {
      const idx = parseInt(name.replace('relatedProducts.', ''));
      setAddProductForm(f => {
        const arr = [...f.relatedProducts];
        arr[idx] = value;
        return { ...f, relatedProducts: arr };
      });
    } else if (name === 'category') {
      // Accept comma-separated string and convert to array
      const categoriesArr = value.split(',').map(cat => cat.trim()).filter(Boolean);
      setAddProductForm(f => ({ ...f, category: categoriesArr }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddProductForm(f => ({ ...f, [name]: checked }));
    } else {
      setAddProductForm(f => ({ ...f, [name]: value }));
    }
  };
  // Helper to generate SKU prefix from category
  function getSkuPrefix(category: string) {
    if (!category) return 'GEN';
    const cat = category.toLowerCase();
    if (cat.includes('plant')) return 'PLT';
    if (cat.includes('pot')) return 'POT';
    if (cat.includes('tool')) return 'TLS';
    if (cat.includes('soil')) return 'SOL';
    if (cat.includes('succulent')) return 'PLT';
    if (cat.includes('supply')) return 'SUP';
    return cat.substring(0, 3).toUpperCase();
  }

  // Generate next SKU for a prefix
  function getNextSku(prefix: string) {
    // Find max number for this prefix in current products
    let max = 0;
    products.forEach(p => {
      if (typeof p.id === 'string' && p.id.startsWith(prefix + '-')) {
        const num = parseInt(p.id.split('-')[1]);
        if (!isNaN(num) && num > max) max = num;
      } else if (typeof p.sku === 'string' && p.sku.startsWith(prefix + '-')) {
        const num = parseInt(p.sku.split('-')[1]);
        if (!isNaN(num) && num > max) max = num;
      }
    });
    return `${prefix}-${(max + 1).toString().padStart(3, '0')}`;
  }

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use first category for SKU prefix, fallback to 'GEN'
    const prefix = getSkuPrefix(addProductForm.category[0] || '');
    const newId = getNextSku(prefix);
    const productToAdd = {
      id: newId,
      sku: newId,
      name: addProductForm.name,
      description: addProductForm.description,
      longDescription: addProductForm.longDescription,
      price: parseFloat(addProductForm.price),
      category: addProductForm.category,
      imageUrl: addProductForm.image,
      inStock: Boolean(addProductForm.inStock),
      isBestSeller: Boolean(addProductForm.isBestSeller),
      rating: Number(addProductForm.rating),
      stock: addProductForm.stock === '' ? 0 : parseInt(addProductForm.stock),
      careInstructions: {
        light: addProductForm.careInstructions.light,
        temperature: addProductForm.careInstructions.temperature,
        warnings: addProductForm.careInstructions.warnings,
        water: addProductForm.careInstructions.water,
      },
      specifications: {
        Difficulty: addProductForm.specifications.Difficulty,
        'Growth Rate': addProductForm.specifications['Growth Rate'],
        'Light Requirements': addProductForm.specifications['Light Requirements'],
        'Mature Height': addProductForm.specifications['Mature Height'],
        'Pet Friendly': addProductForm.specifications['Pet Friendly'],
        'Pot Size': addProductForm.specifications['Pot Size'],
      },
      relatedProducts: addProductForm.relatedProducts.filter(Boolean),
      reviews: addProductForm.reviews,
    };
    try {
      await addProduct(productToAdd);
    } catch (err) {
      // Optionally show error to user
      console.error('Error adding product:', err);
    }
    setShowAddProductModal(false);
    setAddProductForm({
      name: '',
      description: '',
      longDescription: '',
      price: '',
      category: [],
      image: '',
      inStock: true,
      isBestSeller: false,
      rating: 0,
      stock: '',
      careInstructions: {
        light: '',
        temperature: '',
        warnings: '',
        water: '',
      },
      specifications: {
        Difficulty: '',
        'Growth Rate': '',
        'Light Requirements': '',
        'Mature Height': '',
        'Pet Friendly': '',
        'Pot Size': '',
      },
      relatedProducts: ['', '', ''],
      reviews: '',
    });
    window.location.reload();
  };

  // Dashboard Firebase Data
  const [dashboardStats, setDashboardStats] = useState<{
    totalSales: number;
    pendingOrders: number;
    activeCustomers: number;
    recentOrders: DashboardOrder[];
    avgOrderValue: number;
    repeatCustomers: number;
    revenueGrowth: number;
  }>({
    totalSales: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    recentOrders: [],
    avgOrderValue: 0,
    repeatCustomers: 0,
    revenueGrowth: 0,
  });

  useEffect(() => {
    if (activeNav !== 'dashboard') return;
    // Fetch orders
    const fetchDashboardData = async () => {
      // Orders
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      let totalSales = 0;
      let pendingOrders = 0;
      let orderCount = 0;
      let recentOrders: any[] = [];
  // For sales over time (order count, not sales sum)
  const ordersByMonth: Record<string, number> = {};
  // For revenue growth calculation
  const revenueByMonth: Record<string, number> = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      ordersSnap.forEach(doc => {
        const data = doc.data();
        // Debug: log each order's total and date
        console.log('Order:', doc.id, 'total:', data.total, 'date:', data.date);
        // Skip orders without valid total or date
        if (typeof data.total !== 'number' || data.total <= 0) {
          console.log('Skipping order (invalid total):', doc.id, data.total);
          return;
        }
        // Add to totalSales
        totalSales += data.total;
        orderCount++;
        // Handle different date formats
        let date: Date | null = null;
        if (data.date instanceof Date) {
          date = data.date;
        } else if (typeof data.date === 'string') {
          date = new Date(data.date);
        } else if (data.date && typeof data.date === 'object' && data.date.seconds) {
          // Firebase Timestamp object
          date = new Date(data.date.seconds * 1000);
        }
        if (!date || isNaN(date.getTime())) {
          console.log('Skipping order (invalid date):', doc.id, data.date);
          return;
        }
        // Use case-insensitive comparison for 'pending'
        if (typeof data.status === 'string' && data.status.toLowerCase() === 'pending') pendingOrders++;
        // Get the latest status from timeline
        const latestStatus = Array.isArray(data.timeline) && data.timeline.length > 0
          ? data.timeline[data.timeline.length - 1].status
          : 'Order Placed';

        recentOrders.push({
          id: doc.id,
          customer: data.shippingAddress?.firstName + ' ' + data.shippingAddress?.lastName,
          date: data.date || '',
          status: latestStatus,
          total: data.total || 0,
          paymentMethod: data.paymentMethod?.type || '',
          shippingMethod: data.shippingMethod || '',
        });
  // Group order count by month with year consideration
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const key = `${year}-${monthIndex}`;
  ordersByMonth[key] = (ordersByMonth[key] || 0) + 1;
  // Group revenue by month for growth calculation
  revenueByMonth[key] = (revenueByMonth[key] || 0) + data.total;
      });
      // Debug: log final totalSales
      console.log('Total sales calculated:', totalSales);
      // Calculate average order value
      const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;
      // Sort recentOrders by date desc
      recentOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      recentOrders = recentOrders.slice(0, 5);
      // Prepare salesData for chart (show all months, 0 if no sales)
      const now = new Date();
      const salesDataArr = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const monthIndex = d.getMonth();
        const key = `${year}-${monthIndex}`;
        salesDataArr.push({
          month: `${monthNames[monthIndex]}`,
          sales: ordersByMonth[key] || 0
        });
      }
      setSalesData(salesDataArr);
      // Calculate revenue growth (current month vs previous month)
      const now2 = new Date();
      const thisMonthKey = `${now2.getFullYear()}-${now2.getMonth()}`;
      const lastMonth = new Date(now2.getFullYear(), now2.getMonth() - 1, 1);
      const lastMonthKey = `${lastMonth.getFullYear()}-${lastMonth.getMonth()}`;
      const thisMonthRevenue = revenueByMonth[thisMonthKey] || 0;
      const lastMonthRevenue = revenueByMonth[lastMonthKey] || 0;
      let revenueGrowth = 0;
      if (lastMonthRevenue > 0) {
        revenueGrowth = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      } else if (thisMonthRevenue > 0) {
        revenueGrowth = 100;
      }
      // Debug logs for revenue growth
      console.log('Revenue by month:', revenueByMonth);
      console.log('This month revenue:', thisMonthRevenue);
      console.log('Last month revenue:', lastMonthRevenue);
      console.log('Revenue growth (%):', revenueGrowth);
  // Debug logs
  console.log('Processed order count by month:', ordersByMonth);
  console.log('Final chart data (order count):', salesDataArr);
      // Customers
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const activeCustomers = usersSnap.size;

      // Repeat customers: userId appears more than once in orders
      // Build a map of userId to order count
      const userOrderCount: Record<string, number> = {};
      ordersSnap.forEach(doc => {
        const data = doc.data();
        if (typeof data.userId === 'string') {
          userOrderCount[data.userId] = (userOrderCount[data.userId] || 0) + 1;
        }
      });
      // Count userIds with more than one order
      const repeatCustomers = Object.values(userOrderCount).filter(count => count > 1).length;

      setDashboardStats({
        totalSales,
        pendingOrders,
        activeCustomers,
        recentOrders,
        avgOrderValue,
        repeatCustomers,
        revenueGrowth,
      });
    };
    fetchDashboardData();
  }, [activeNav]);
  // =============================
  // Mock Data Definitions
  // =============================
  // Top products chart data (from Firebase)
  const [topProductsData, setTopProductsData] = useState<{ name: string; sales: number; revenue: number }[]>([]);
  const [productsMetric, setProductsMetric] = useState<'sales' | 'revenue'>('sales');

  useEffect(() => {
    if (activeNav !== 'dashboard') return;
    // Fetch top products by sales and revenue from Firebase
    const fetchTopProducts = async () => {
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      // Count sales and revenue per product name
      const productStats: Record<string, { sales: number; revenue: number }> = {};
      ordersSnap.forEach(doc => {
        const data = doc.data();
        if (Array.isArray(data.items)) {
          data.items.forEach((item: any) => {
            if (item && item.name && typeof item.quantity === 'number' && typeof item.price === 'number') {
              if (!productStats[item.name]) productStats[item.name] = { sales: 0, revenue: 0 };
              productStats[item.name].sales += item.quantity;
              productStats[item.name].revenue += item.quantity * item.price;
            }
          });
        }
      });
      // Convert to array and sort by selected metric descending
      const sorted = Object.entries(productStats)
        .map(([name, stats]) => ({ name, sales: stats.sales, revenue: stats.revenue }))
        .sort((a, b) => b[productsMetric] - a[productsMetric])
        .slice(0, 5); // Top 5
      setTopProductsData(sorted);
    };
    fetchTopProducts();
  }, [activeNav, productsMetric]);
  // Extended data for reports
  const salesReportData = [{
  // salesReportData: extended sales data for reports
    date: '2023-07-01',
    revenue: 1240,
    orders: 28,
    avgOrderValue: 44.29
  }, {
    date: '2023-07-02',
    revenue: 1580,
    orders: 32,
    avgOrderValue: 49.38
  }, {
    date: '2023-07-03',
    revenue: 1890,
    orders: 37,
    avgOrderValue: 51.08
  }, {
    date: '2023-07-04',
    revenue: 2390,
    orders: 45,
    avgOrderValue: 53.11
  }, {
    date: '2023-07-05',
    revenue: 1950,
    orders: 38,
    avgOrderValue: 51.32
  }, {
    date: '2023-07-06',
    revenue: 2130,
    orders: 41,
    avgOrderValue: 51.95
  }, {
    date: '2023-07-07',
    revenue: 2590,
    orders: 49,
    avgOrderValue: 52.86
  }];
  const customerReportData = [{
  // customerReportData: extended customer data for reports
    date: '2023-07-01',
    new: 12,
    returning: 16,
    churnRate: 2.1
  }, {
    date: '2023-07-02',
    new: 15,
    returning: 17,
    churnRate: 1.8
  }, {
    date: '2023-07-03',
    new: 18,
    returning: 19,
    churnRate: 1.9
  }, {
    date: '2023-07-04',
    new: 22,
    returning: 23,
    churnRate: 1.7
  }, {
    date: '2023-07-05',
    new: 17,
    returning: 21,
    churnRate: 2.0
  }, {
    date: '2023-07-06',
    new: 19,
    returning: 22,
    churnRate: 1.8
  }, {
    date: '2023-07-07',
    new: 24,
    returning: 25,
    churnRate: 1.6
  }];
  const inventoryReportData = [{
  // inventoryReportData: extended inventory data for reports
    category: 'Indoor Plants',
    inStock: 145,
    lowStock: 12,
    outOfStock: 3
  }, {
    category: 'Outdoor Plants',
    inStock: 98,
    lowStock: 8,
    outOfStock: 2
  }, {
    category: 'Succulents',
    inStock: 72,
    lowStock: 5,
    outOfStock: 1
  }, {
    category: 'Garden Tools',
    inStock: 53,
    lowStock: 7,
    outOfStock: 4
  }, {
    category: 'Pots & Planters',
    inStock: 87,
    lowStock: 9,
    outOfStock: 2
  }];
  // Customer activity data
  const customerActivity = [{
  // customerActivity: recent customer actions for dashboard
    id: 1,
    type: 'signup',
    customer: 'David Anderson',
    time: '10 minutes ago',
    details: 'New customer signed up via email'
  }, {
    id: 2,
    type: 'review',
    customer: 'Lisa Martinez',
    time: '45 minutes ago',
    details: 'Left a 5-star review for "Monstera Deliciosa"'
  }, {
    id: 3,
    type: 'inquiry',
    customer: 'Robert Johnson',
    time: '1 hour ago',
    details: 'Asked about plant care for fiddle leaf fig'
  }, {
    id: 4,
    type: 'signup',
    customer: 'Jennifer Wilson',
    time: '2 hours ago',
    details: 'New customer signed up via Google'
  }, {
    id: 5,
    type: 'review',
    customer: 'Thomas Brown',
    time: '3 hours ago',
    details: 'Left a 4-star review for "Snake Plant"'
  }];
  // Inventory alerts data
  /* const inventoryAlerts = [{
  // inventoryAlerts: low stock and out-of-stock alerts
    id: 1,
    product: 'Monstera Deliciosa',
    sku: 'PLT-001',
    stock: 3,
    threshold: 5,
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 2,
    product: 'Ceramic Pot - Large',
    sku: 'POT-012',
    stock: 2,
    threshold: 10,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 3,
    product: 'Pruning Shears',
    sku: 'TLS-005',
    stock: 4,
    threshold: 8,
    image: 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }, {
    id: 4,
    product: 'Potting Soil - 5L',
    sku: 'SOL-002',
    stock: 6,
    threshold: 15,
    image: 'https://images.unsplash.com/photo-1562847961-8f766d3b8289?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'
  }]; */
  // Mock data for recent orders
  // Handle CSV Export
  const handleExportCSV = (orders: any[]) => {
    // Define the headers for the CSV
    const headers = [
      'Order ID',
      'Customer',
      'Date',
      'Status',
      'Total',
      'Payment Method',
    ];

    // Convert orders to CSV rows
    const rows = orders.map(order => [
      order.id,
      order.customer,
      new Date(order.date).toLocaleDateString(),
      order.status,
      order.total,
      order.paymentMethod,
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print an individual order invoice
  const handlePrintInvoice = (order: any) => {
    // Create container
    const container = document.createElement('div');
    container.className = 'print-only-container';
    container.setAttribute('aria-hidden', 'true');

    // Calculate totals
    const subtotal = typeof order.total === 'number' ? order.total : parseFloat(String(order.total).replace('$', ''));
    const shipping = 5.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Format invoice content with company branding
    const content = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; padding:20px; max-width:800px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:30px;">
          <h1 style="margin:0; color:#166534; font-size:24px;">Starseedz Nurseries</h1>
          <p style="margin:5px 0; color:#374151;">123 Garden Street, Portland, OR 97201</p>
          <p style="margin:5px 0; color:#374151;">Tel: (555) 123-4567 | contact@starseedz.com</p>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
          <div>
            <h2 style="margin:0 0 10px; color:#111827; font-size:20px;">INVOICE</h2>
            <p style="margin:0; color:#374151;">Order #: ${order.id}</p>
            <p style="margin:5px 0; color:#374151;">Date: ${formatDate(order.date)}</p>
          </div>
          <div style="text-align:right;">
            <h3 style="margin:0 0 10px; color:#111827;">Bill To:</h3>
            <p style="margin:0; color:#374151;">${order.customer}</p>
            <p style="margin:5px 0; color:#374151;">123 Main Street</p>
            <p style="margin:5px 0; color:#374151;">Portland, OR 97201</p>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:30px;">
          <thead>
            <tr>
              <th style="border:1px solid #e5e7eb; padding:12px; text-align:left; background:#f9fafb;">Product</th>
              <th style="border:1px solid #e5e7eb; padding:12px; text-align:right; background:#f9fafb;">Quantity</th>
              <th style="border:1px solid #e5e7eb; padding:12px; text-align:right; background:#f9fafb;">Price</th>
              <th style="border:1px solid #e5e7eb; padding:12px; text-align:right; background:#f9fafb;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((item: any) => `
              <tr>
                <td style="border:1px solid #e5e7eb; padding:12px;">${item.name}</td>
                <td style="border:1px solid #e5e7eb; padding:12px; text-align:right;">${item.quantity}</td>
                <td style="border:1px solid #e5e7eb; padding:12px; text-align:right;">$${item.price.toFixed(2)}</td>
                <td style="border:1px solid #e5e7eb; padding:12px; text-align:right;">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; justify-content:flex-end;">
          <div style="width:300px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:#374151;">Subtotal:</span>
              <span style="font-weight:500;">$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:#374151;">Shipping:</span>
              <span style="font-weight:500;">$${shipping.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
              <span style="color:#374151;">Tax (8%):</span>
              <span style="font-weight:500;">$${tax.toFixed(2)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding-top:10px; border-top:2px solid #e5e7eb;">
              <span style="font-weight:600; color:#111827;">Total:</span>
              <span style="font-weight:600; color:#111827;">$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb; text-align:center;">
          <p style="margin:0; color:#374151;">Thank you for your business!</p>
          <p style="margin:5px 0; color:#374151;">Payment processed via ${order.paymentMethod}</p>
        </div>
      </div>
    `;

    container.innerHTML = content;

    // Create print-only style
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-only-style';
    style.appendChild(document.createTextNode(`
      @media print {
        body * { visibility: hidden !important; }
        .print-only-container, .print-only-container * { visibility: visible !important; }
        .print-only-container { position: absolute; left: 0; top: 0; width: 100%; }
      }
      /* Keep container hidden on screen */
      .print-only-container { display: none; }
      @media print { .print-only-container { display: block; } }
    `));

    document.body.appendChild(style);
    document.body.appendChild(container);

    // Trigger print
    try {
      window.print();
    } catch (err) {
      console.error('Print failed:', err);
      window.alert('Print failed: ' + String(err));
    }

    // Cleanup after print dialog
    setTimeout(() => {
      const s = document.getElementById('print-only-style');
      if (s) s.remove();
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 500);
  };

  // Print orders: render a temporary print-only container in-page and call window.print()
  // This avoids popup blockers by not opening a new window.
  const handlePrintOrders = (orders: any[]) => {
    if (!orders || orders.length === 0) {
      window.alert('No orders to print');
      return;
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'print-only-container';
    container.setAttribute('aria-hidden', 'true');

    // Basic styles for printable table
    const content = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; padding:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="margin:0;">Orders</h2>
          <div>${new Date().toLocaleString()}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Order ID</th>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Customer</th>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Date</th>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Status</th>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Total</th>
              <th style="border:1px solid #e5e7eb;padding:6px;text-align:left;background:#f9fafb;">Payment</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td style="border:1px solid #e5e7eb;padding:6px;">${String(o.id ?? '')}</td>
                <td style="border:1px solid #e5e7eb;padding:6px;">${String(o.customer ?? '')}</td>
                <td style="border:1px solid #e5e7eb;padding:6px;">${o.date ? new Date(o.date).toLocaleString() : ''}</td>
                <td style="border:1px solid #e5e7eb;padding:6px;">${String(o.status ?? '')}</td>
                <td style="border:1px solid #e5e7eb;padding:6px;">${String(o.total ?? '')}</td>
                <td style="border:1px solid #e5e7eb;padding:6px;">${String(o.paymentMethod ?? '')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = content;

    // Create print-only style to hide the rest of the page during print
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-only-style';
    style.appendChild(document.createTextNode(`
      @media print {
        body * { visibility: hidden !important; }
        .print-only-container, .print-only-container * { visibility: visible !important; }
        .print-only-container { position: absolute; left: 0; top: 0; width: 100%; }
      }
      /* Keep container hidden on screen */
      .print-only-container { display: none; }
      @media print { .print-only-container { display: block; } }
    `));

    document.body.appendChild(style);
    document.body.appendChild(container);

    // Trigger print
    try {
      window.print();
    } catch (err) {
      console.error('Print failed', err);
      window.alert('Print failed: ' + String(err));
    }

    // Cleanup after a short delay to ensure print dialog has been triggered
    setTimeout(() => {
      const s = document.getElementById('print-only-style');
      if (s) s.remove();
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }, 500);
  };

  // Add a new customer (prompt and persist to Firestore)
  const handleAddCustomer = async () => {
    try {
      const firstName = (window.prompt('First name') || '').trim();
      if (!firstName) {
        window.alert('First name is required');
        return;
      }
      const lastName = (window.prompt('Last name') || '').trim();
      const email = (window.prompt('Email') || '').trim();
      if (!email) {
        window.alert('Email is required');
        return;
      }
      const phone = (window.prompt('Phone (optional)') || '').trim();
      const location = (window.prompt('Location (optional)') || '').trim();
      const now = new Date().toISOString();

      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, {
        firstName,
        lastName,
        email,
        phone: phone || '',
        location: location || '',
        createdAt: now,
        lastLogin: now,
        receiveEmails: true,
      });

      const newCustomer = {
        id: docRef.id,
        uid: docRef.id,
        firstName,
        lastName,
        email,
        phone: phone || '',
        location: location || '',
        lastLogin: now,
        createdAt: now,
        receiveEmails: true,
        ordersCount: 0,
        totalSpent: 0,
        segment: 'new',
      };

      setAllCustomers(prev => [newCustomer, ...prev]);
      window.alert('Customer added successfully');
    } catch (err) {
      console.error('Failed to add customer:', err);
      window.alert('Failed to add customer. See console for details.');
    }
  };



  // Fetch customers and their order data from Firebase
  useEffect(() => {
    const fetchCustomers = async () => {
      if (activeNav !== 'customers') return;
      
      try {
        // Fetch customers
        const customersCollection = collection(db, 'users');
        const customersSnapshot = await getDocs(customersCollection);
        
        // Fetch all orders
        const ordersCollection = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCollection);
        const orders = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            total: data.total,
            shippingAddress: data.shippingAddress
          };
        });

        // Process customer data and combine with order information
        const customersData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
          const customerData = doc.data();
          
          // Get all orders for this customer
          const customerOrders = orders.filter(order => 
            order.userId === doc.id || 
            (order.shippingAddress && 
             order.shippingAddress.email === customerData.email)
          );

          // Calculate total spent
          const totalSpent = customerOrders.reduce((sum, order) => 
            sum + (typeof order.total === 'number' ? order.total : 0), 0);

          // Determine customer segment
          let segment: 'new' | 'repeat' | 'high' = 'new';
          if (customerOrders.length > 0) {
            if (totalSpent > 500) {
              segment = 'high';
            } else if (customerOrders.length > 1) {
              segment = 'repeat';
            }
          }

          return {
            id: doc.id,
            uid: customerData.uid,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
            phone: customerData.phone,
            location: customerData.location,
            lastLogin: customerData.lastLogin,
            createdAt: customerData.createdAt,
            receiveEmails: customerData.receiveEmails,
            ordersCount: customerOrders.length,
            totalSpent,
            segment
          };
        }));

        setAllCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, [activeNav]);

  // Fetch orders from Firebase
  useEffect(() => {
    // Only fetch for Orders tab
    if (activeNav !== 'orders') return;
    const fetchOrders = async () => {
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      const orders: any[] = [];
      ordersSnap.forEach(doc => {
        const data = doc.data();
        // Get the latest status from the timeline if it exists
        const timeline = data.timeline || [];
        const latestStatus = timeline.length > 0 ? timeline[timeline.length - 1].status : 'Order Placed';
        
        orders.push({
          id: doc.id,
          customer: data.shippingAddress?.firstName + ' ' + data.shippingAddress?.lastName,
          date: data.date || '',
          status: latestStatus,
          timeline: timeline,
          total: data.total || 0,
          paymentMethod: data.paymentMethod?.type || '',
          shippingMethod: data.shippingMethod || '',
        });
      });
      setAllOrders(orders);
    };
    fetchOrders();
  }, [activeNav]);
  // Status badge color mapper
  // Customers data for Customers tab
  const customers = [
    {
      id: 1,
      name: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      ordersCount: 8,
      totalSpend: '$425.75',
      lastActive: '2023-07-15',
      segment: 'repeat',
      phone: '(555) 123-4567',
      address: '123 Main St, Portland, OR 97201',
      createdAt: '2022-03-12',
      notes: 'Prefers succulents and indoor plants. Interested in plant care workshops.'
    },
    {
      id: 2,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      ordersCount: 3,
      totalSpend: '$189.50',
      lastActive: '2023-07-14',
      segment: 'repeat',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Portland, OR 97202',
      createdAt: '2022-06-24',
      notes: 'Buys plants as gifts. Interested in gift wrapping services.'
    },
    {
      id: 3,
      name: 'Sarah Davis',
      email: 'sarah.davis@example.com',
      ordersCount: 12,
      totalSpend: '$876.25',
      lastActive: '2023-07-14',
      segment: 'high',
      phone: '(555) 345-6789',
      address: '789 Pine St, Portland, OR 97203',
      createdAt: '2021-11-05',
      notes: 'Gardening enthusiast. Interested in rare plants and special orders.'
    },
    {
      id: 4,
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      ordersCount: 2,
      totalSpend: '$75.25',
      lastActive: '2023-07-13',
      segment: 'new',
      phone: '(555) 456-7890',
      address: '101 Cedar Rd, Portland, OR 97204',
      createdAt: '2023-06-18',
      notes: 'New plant parent. Interested in beginner-friendly plants.'
    },
    {
      id: 5,
      name: 'Patricia Moore',
      email: 'patricia.moore@example.com',
      ordersCount: 5,
      totalSpend: '$312.85',
      lastActive: '2023-07-12',
      segment: 'repeat',
      phone: '(555) 567-8901',
      address: '202 Maple Dr, Portland, OR 97205',
      createdAt: '2022-09-30',
      notes: 'Prefers outdoor plants and garden supplies.'
    },
    {
      id: 6,
      name: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      ordersCount: 1,
      totalSpend: '$67.25',
      lastActive: '2023-07-11',
      segment: 'new',
      phone: '(555) 678-9012',
      address: '303 Birch Ln, Portland, OR 97206',
      createdAt: '2023-07-01',
      notes: 'First-time customer. Purchased a snake plant.'
    },
    {
      id: 7,
      name: 'Jennifer Martinez',
      email: 'jennifer.martinez@example.com',
      ordersCount: 7,
      totalSpend: '$523.75',
      lastActive: '2023-07-11',
      segment: 'high',
      phone: '(555) 789-0123',
      address: '404 Elm St, Portland, OR 97207',
      createdAt: '2022-01-15',
      notes: 'Collector of rare plants. Interested in plant swaps and events.'
    }
  ];
  type OrderStatus = 'Order Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;

  // getStatusBadgeClass: returns CSS class for order status badge
const getStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'Order Placed':
      return 'bg-yellow-100 text-yellow-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800';
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
  // Get activity icon based on type
  type ActivityType = 'signup' | 'review' | 'inquiry' | string;

  // getActivityIcon: returns icon for customer activity type
const getActivityIcon = (type: ActivityType): JSX.Element => {
  switch (type) {
    case 'signup':
      return <UserPlusIcon className="h-5 w-5 text-green-500" />;
    case 'review':
      return <StarIcon className="h-5 w-5 text-yellow-500" />;
    case 'inquiry':
      return <MessageCircleIcon className="h-5 w-5 text-blue-500" />;
    default:
      return <BellIcon className="h-5 w-5 text-gray-500" />;
  }
};

  // Navigation items
  const navItems = [{
  // navItems: sidebar navigation configuration
    id: 'dashboard',
    name: 'Dashboard',
    icon: <LayoutDashboardIcon className="w-5 h-5" />
  }, {
    id: 'orders',
    name: 'Orders',
    icon: <ShoppingBagIcon className="w-5 h-5" />
  }, {
    id: 'products',
    name: 'Products',
    icon: <PackageIcon className="w-5 h-5" />
  }, {
    id: 'customers',
    name: 'Customers',
    icon: <UsersIcon className="w-5 h-5" />
  }, {
    id: 'reports',
    name: 'Reports',
    icon: <BarChartIcon className="w-5 h-5" />
  }, {
    id: 'settings',
    name: 'Settings',
    icon: <SettingsIcon className="w-5 h-5" />
  }];
  // Filter orders by status
  // Apply status filtering first (if any), then apply sorting based on selected field/direction
  const filteredOrders = orderStatusFilter === 'all'
    ? [...allOrders]
    : allOrders.filter(order => {
        const latestStatus = order.timeline && order.timeline.length > 0
          ? order.timeline[order.timeline.length - 1].status
          : 'Order Placed';
        return latestStatus === orderStatusFilter;
      });

  // Sorting helper
  const compareOrders = (a: any, b: any) => {
    if (orderSortField === 'none') return 0;
    let va: any = '';
    let vb: any = '';
    switch (orderSortField) {
      case 'date':
        va = a.date ? new Date(a.date).getTime() : 0;
        vb = b.date ? new Date(b.date).getTime() : 0;
        break;
      case 'customer':
        va = (a.customer || '').toString().toLowerCase();
        vb = (b.customer || '').toString().toLowerCase();
        break;
      case 'total':
        va = Number(a.total || 0);
        vb = Number(b.total || 0);
        break;
      case 'payment':
        va = (a.paymentMethod || '').toString().toLowerCase();
        vb = (b.paymentMethod || '').toString().toLowerCase();
        break;
      default:
        return 0;
    }

    if (va < vb) return orderSortDir === 'asc' ? -1 : 1;
    if (va > vb) return orderSortDir === 'asc' ? 1 : -1;
    return 0;
  };

  if (orderSortField !== 'none') {
    filteredOrders.sort(compareOrders);
  }
  // filteredOrders: orders filtered by status
  // Get product categories for filter (normalize to avoid duplicates)
  // Merge categories from products and allCategories (from Firebase)
  // Normalize for uniqueness, but prettify for display
  // Utility helpers for category normalization and prettifying
  const normalizeCategoryKey = (cat: string) => cat.replace(/\s+/g, '').toLowerCase();
  // Prettify: insert spaces before capital letters (except first), trim, single spaces
  const prettifyCategory = (cat: string) => {
    let s = cat.trim().replace(/\s+/g, ' ');
    // If no spaces, but multiple capitals, insert spaces before capitals
    if (!s.includes(' ')) {
      s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    // Capitalize first letter of each word
    s = s.replace(/\b\w/g, c => c.toUpperCase());
    return s;
  };

  // Filter products by category
  // Filtering: match if any category in product matches the selected filter
  let filteredProducts = productCategoryFilter === 'all'
    ? products
    : products.filter(product =>
        Array.isArray(product.category)
          ? product.category.some((cat: string) => normalizeCategoryKey(cat) === normalizeCategoryKey(productCategoryFilter))
          : normalizeCategoryKey(product.category) === normalizeCategoryKey(productCategoryFilter)
      );
  // Apply product search filter
  if (productSearchQuery.trim() !== "") {
    const query = productSearchQuery.trim().toLowerCase();
    filteredProducts = filteredProducts.filter(product => {
      const name = product.name?.toLowerCase() || "";
      const sku = product.sku?.toLowerCase() || "";
      const category = Array.isArray(product.category)
        ? product.category.map((cat: string) => cat.toLowerCase()).join(" ")
        : (product.category?.toLowerCase() || "");
      return name.includes(query) || sku.includes(query) || category.includes(query);
    });
  }
  // filteredProducts: products filtered by category
  // Paginated data for Products
  const productsPageSize = 10;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPageSize,
    currentPage * productsPageSize
  );
  // Filter customers by segment
  // Paginated data for Orders
  const ordersPageSize = 10;
  const paginatedOrders = filteredOrders.slice(
    (ordersCurrentPage - 1) * ordersPageSize,
    ordersCurrentPage * ordersPageSize
  );

  // Filter customers by segment
  // Apply segment filter first, then apply search query filtering (name, email, uid)
  const filteredCustomers = (customerSegmentFilter === 'all' 
    ? allCustomers 
    : allCustomers.filter(customer => customer.segment === customerSegmentFilter))
    .filter(customer => {
      const q = customerSearchQuery.trim().toLowerCase();
      if (!q) return true;
      const fullName = `${(customer.firstName || '').toString()} ${(customer.lastName || '').toString()}`.toLowerCase();
      const email = (customer.email || '').toString().toLowerCase();
      const uid = (customer.uid || '').toString().toLowerCase();
      return fullName.includes(q) || email.includes(q) || uid.includes(q);
    });
  // Paginated data for Customers
  const customersPageSize = 10;
  const paginatedCustomers = filteredCustomers.slice(
    (customersCurrentPage - 1) * customersPageSize,
    customersCurrentPage * customersPageSize
  );
  // filteredCustomers: customers filtered by segment
  // Get product categories for filter (normalize to avoid duplicates)
  // Merge categories from products and allCategories (from Firebase)
  // Normalize for uniqueness, but prettify for display
  const categoryMap: Record<string, string> = {};
  // Flatten all categories from products and allCategories
  const allCatsFlat = [
    ...products.flatMap(p => Array.isArray(p.category) ? p.category : [p.category]),
    ...((typeof window !== 'undefined' && Array.isArray((window as any).allCategories)) ? (window as any).allCategories : [])
  ];
  allCatsFlat.forEach(cat => {
    if (typeof cat === 'string') {
      const key = normalizeCategoryKey(cat);
      if (!categoryMap[key]) {
        categoryMap[key] = prettifyCategory(cat);
      }
    }
  });
  const uniqueCategories = Object.values(categoryMap);
  const productCategories = ['all', ...uniqueCategories];
  // productCategories: unique product categories for filter dropdown
  // Get current report data based on type
  const getReportData = () => {
  // getReportData: returns report data based on selected type
    switch (reportType) {
      case 'sales':
        return salesReportData;
      case 'customers':
        return customerReportData;
      case 'inventory':
        return inventoryReportData;             
      default:
        return salesReportData;
    }
  };
  // Render order detail view
  const renderOrderDetail = () => {
  // =============================
  // Order Detail View
  // =============================
  // Renders detailed view for a selected order
    if (!selectedOrder) return null;
    const order = allOrders.find(o => o.id === selectedOrder);
    if (!order) return null;
    return <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Order: {order.id}
          </h3>
          <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Timeline */}
            <div className="w-full">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Order Timeline
              </h4>
              <div className="relative px-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-0.5 bg-gray-200"></div>
                </div>
                <div className="relative flex flex-col space-y-8">
                  <div className="flex items-center">
                    <div className="bg-green-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                      <CheckCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Order Placed
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.date)}
                      </p>
                    </div>
                  </div>
                  {order.status !== 'Cancelled' && <>
                      <div className="flex items-center">
                        <div className={`${order.status === 'Pending' ? 'bg-yellow-500' : 'bg-green-500'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                          <CreditCardIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Payment Confirmed
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`${order.status === 'Pending' || order.status === 'Processing' ? 'bg-gray-300' : 'bg-green-500'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                          <BoxIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Order Processed
                          </p>
                          {order.status !== 'Pending' && order.status !== 'Processing' ? <p className="text-xs text-gray-500">
                              {formatDate(order.date)}
                            </p> : <p className="text-xs text-gray-500">Pending</p>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`${order.status === 'Shipped' || order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Order Shipped
                          </p>
                          {order.status === 'Shipped' || order.status === 'Delivered' ? <p className="text-xs text-gray-500">
                              {formatDate(new Date(new Date(order.date).getTime() + 86400000))}
                            </p> : <p className="text-xs text-gray-500">Pending</p>}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className={`${order.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'} rounded-full h-8 w-8 flex items-center justify-center z-10`}>
                          <CheckCircleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Delivered
                          </p>
                          {order.status === 'Delivered' ? <p className="text-xs text-gray-500">
                              {formatDate(new Date(new Date(order.date).getTime() + 172800000))}
                            </p> : <p className="text-xs text-gray-500">Pending</p>}
                        </div>
                      </div>
                    </>}
                  {order.status === 'Cancelled' && <div className="flex items-center">
                      <div className="bg-red-500 rounded-full h-8 w-8 flex items-center justify-center z-10">
                        <XIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Order Cancelled
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.date)}
                        </p>
                      </div>
                    </div>}
                </div>
              </div>
            </div>

            {/* Order Summary And Tracking */}
            <div className="flex flex-col space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                ORDER SUMMARY AND TRACKING
              </h4>
              <div className="flex flex-col space-y-4">
                <OrderSummaryCard
                  items={order.items || []}
                  subtotal={order.subtotal || 0}
                  shipping={order.shipping || 0}
                  tax={order.tax || 0}
                  total={order.total || 0}
                />
                <OrderTrackingWidget
                  status={order.status}
                  estimatedDelivery={order.timeline && order.timeline.length > 0 ? order.timeline[order.timeline.length - 1].date : ''}
                  trackingUrl={order.trackingNumber ? `https://track.aftership.com/${order.trackingNumber}` : undefined}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Customer Information
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900">
                  {order.customer}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  customer@example.com
                </p>
                <p className="text-sm text-gray-600 mt-1">(555) 123-4567</p>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    Shipping Address
                  </p>
                  <p className="text-sm text-gray-600 mt-1">123 Main Street</p>
                  <p className="text-sm text-gray-600">Portland, OR 97201</p>
                </div>
              </div>
            </div>
            {/* Payment & Shipping */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                Payment & Shipping
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.paymentMethod}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Shipping Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.shippingMethod}
                  </p>
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    TRK-{order.id.split('-')[1]}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">
                      {
                        (() => {
                          const totalNum = typeof order.total === 'number'
                            ? order.total
                            : parseFloat(String(order.total).replace('$', ''));
                          return `$${totalNum.toFixed(2)}`;
                        })()
                      }
                    </p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-900">$5.00</p>
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-sm font-medium text-gray-900">
                      {
                        (() => {
                          const totalNum = typeof order.total === 'number'
                            ? order.total
                            : parseFloat(String(order.total).replace('$', ''));
                          return `$${(totalNum * 0.08).toFixed(2)}`;
                        })()
                      }
                    </p>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      {
                        (() => {
                          const totalNum = typeof order.total === 'number'
                            ? order.total
                            : parseFloat(String(order.total).replace('$', ''));
                          return `$${(totalNum + 5 + totalNum * 0.08).toFixed(2)}`;
                        })()
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Order Items */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              Order Items
            </h4>
            <div className="bg-gray-50 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Monstera Deliciosa
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.99
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Ceramic Pot - Medium
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      2
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $19.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $39.98
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Potting Soil - 5L
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      1
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $12.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      $12.99
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => handlePrintInvoice(order)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Invoice
            </button>
            <button 
              onClick={() => handleDownloadPDF(order)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            
          </div>
        </div>
      </div>;
  };
  // Render product detail view
  const renderProductDetail = () => {
  // =============================
  // Product Detail View
  // =============================
  // Renders detailed view for a selected product
    if (!selectedProduct) return null;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return null;
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {product.name}
          </h3>
          <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Product Image */}
            <div className="md:col-span-1">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-center object-cover" />
              </div>
            </div>
            {/* Product Details */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">{product.sku}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
+                    {Array.isArray(product.category) ? product.category.join(', ') : product.category}
+                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.stock} units
                    {product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Low Stock
                      </span>}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.featured ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock Threshold
                  </h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {product.lowStockThreshold} units
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  This {product.name} is a beautiful addition to any home or
                  garden. Perfect for both beginners and experienced plant
                  enthusiasts.
                </p>
              </div>
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales History
                </h4>
                <div className="mt-2 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[{
                    date: '2023-05-15',
                    sales: 5
                  }, {
                    date: '2023-05-22',
                    sales: 8
                  }, {
                    date: '2023-05-29',
                    sales: 12
                  }, {
                    date: '2023-06-05',
                    sales: 10
                  }, {
                    date: '2023-06-12',
                    sales: 15
                  }, {
                    date: '2023-06-19',
                    sales: 18
                  }, {
                    date: '2023-06-26',
                    sales: 14
                  }, {
                    date: '2023-07-03',
                    sales: 20
                  }, {
                    date: '2023-07-10',
                    sales: 16
                  }]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={false} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => {
                    setEditProductId(product.id);
                    setEditProductForm({
                      ...product,
                      image: product.imageUrl || product.image || '',
                      price: product.price?.toString() || '',
                      stock: product.stock?.toString() || '',
                      inStock: product.inStock ?? true,
                      isBestSeller: product.isBestSeller ?? false,
                      rating: product.rating ?? 0,
                      careInstructions: {
                        light: product.careInstructions?.light || '',
                        temperature: product.careInstructions?.temperature || '',
                        warnings: product.careInstructions?.warnings || '',
                        water: product.careInstructions?.water || '',
                      },
                      specifications: {
                        Difficulty: product.specifications?.Difficulty || '',
                        'Growth Rate': product.specifications?.['Growth Rate'] || '',
                        'Light Requirements': product.specifications?.['Light Requirements'] || '',
                        'Mature Height': product.specifications?.['Mature Height'] || '',
                        'Pet Friendly': product.specifications?.['Pet Friendly'] || '',
                        'Pot Size': product.specifications?.['Pot Size'] || '',
                      },
                      relatedProducts: product.relatedProducts 
                        ? product.relatedProducts.map((ref: any) =>
                            typeof ref === 'string'
                              ? ref
                              : ref.id?.value || ref.path?.value || String(ref.id || ref.path || '')
                          )
                        : ['', '', ''],
                      reviews: product.reviews || '',
                    });
                    setSelectedProduct(null); // Hide the detail popup
                    setShowEditProductModal(true);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit Product
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={async () => {
                    const newStockStr = window.prompt('Enter new stock quantity:', product.stock?.toString() || '0');
                    if (newStockStr === null) return;
                    const newStock = parseInt(newStockStr);
                    if (isNaN(newStock) || newStock < 0) {
                      alert('Invalid stock value.');
                      return;
                    }
                    try {
                      const { doc, collection } = await import('firebase/firestore');
                      const productRef = doc(collection(db, 'products'), product.id);
                      await updateDoc(productRef, { stock: newStock });
                      setProducts((prev: any[]) => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p));
                      alert('Stock updated successfully.');
                    } catch (err) {
                      alert('Failed to update stock.');
                      console.error('Update stock error:', err);
                    }
                  }}
                >
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // Render customer detail view
  // =============================
  // Customer Detail View
  // =============================
 const renderCustomerDetail = () => {
  const customer = allCustomers.find((c) => c.id === selectedCustomer);
  if (!customer) return null;

    // Get customer orders and metrics
const orders = customerOrders;
    return <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {customer.name}
          </h3>
          <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-500">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-green-700">
                      {customer.firstName?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {customer.firstName || 'Unknown'} {customer.lastName || ''}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Customer ID: {customer.uid || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.phone}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.location}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Preferences
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {customer.receiveEmails ? 'Subscribed to emails' : 'Not subscribed to emails'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Created
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(customer.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Notes
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">{customer.notes}</p>
                </div>
                <div className="mt-6 flex space-x-3">
                  <button 
                    onClick={() => window.location.href = `mailto:${customer.email}`}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <MessageCircleIcon className="h-4 w-4 mr-2" />
                    Email
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const customerRef = doc(db, 'users', customer.id);
                        await updateDoc(customerRef, {
                          lastLogin: new Date().toISOString()
                        });
                        
                        // Refresh customers list by refetching
                        const customersCollection = collection(db, 'users');
                        const customersSnapshot = await getDocs(customersCollection);
                        
                        // Fetch all orders again to recalculate metrics
                        const ordersCollection = collection(db, 'orders');
                        const ordersSnapshot = await getDocs(ordersCollection);
                        const orders = ordersSnapshot.docs.map(doc => ({
                          id: doc.id,
                          userId: doc.data().userId,
                          total: doc.data().total,
                          shippingAddress: doc.data().shippingAddress
                        }));

                        // Recalculate customer metrics
                        const customersData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
                          const customerData = doc.data();
                          const customerOrders = orders.filter(order => 
                            order.userId === doc.id || 
                            order.shippingAddress?.email === customerData.email
                          );
                          const totalSpent = customerOrders.reduce((sum, order) => 
                            sum + (typeof order.total === 'number' ? order.total : 0), 0);

                          let segment: 'new' | 'repeat' | 'high' = 'new';
                          if (customerOrders.length > 0) {
                            if (totalSpent > 500) {
                              segment = 'high';
                            } else if (customerOrders.length > 1) {
                              segment = 'repeat';
                            }
                          }

                          return {
                            id: doc.id,
                            uid: customerData.uid,
                            firstName: customerData.firstName,
                            lastName: customerData.lastName,
                            email: customerData.email,
                            phone: customerData.phone,
                            location: customerData.location,
                            lastLogin: customerData.lastLogin,
                            createdAt: customerData.createdAt,
                            receiveEmails: customerData.receiveEmails,
                            ordersCount: customerOrders.length,
                            totalSpent,
                            segment
                          };
                        }));

                        setAllCustomers(customersData);
                      } catch (error) {
                        console.error('Error updating customer:', error);
                      }
                    }}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <RefreshCwIcon className="h-4 w-4 mr-2" />
                    Update Info
                  </button>
                </div>
              </div>
            </div>
            {/* Customer Details */}
            <div className="md:col-span-2">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">Orders</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {customer.ordersCount || 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Total Spent
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    ${customer.totalSpent?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Last Active
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    Segment
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 capitalize">
                    {customer.segment || 'new'}
                  </p>
                </div>
              </div>
              {/* Order History */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Order History
                </h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-100 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {customerOrders.length > 0 ? (
                        customerOrders.map((order) => {
                          // Get the latest timeline entry
                          const latestEntry =
                            order.timeline && order.timeline.length > 0
                              ? order.timeline[order.timeline.length - 1]
                              : null;

                          const status = latestEntry?.status || order.status || "Pending";
                          const date = latestEntry?.date || null;
                          const total = typeof order.total === "number" ? order.total : 0;

                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-700 hover:text-green-900">
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedCustomer(null);
                                    setSelectedOrder(order.id);
                                    setActiveNav("orders");
                                  }}
                                >
                                  {order.id}
                                </a>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {date ? new Date(date).toLocaleDateString() : "—"}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                ${total.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-12 text-center text-sm text-gray-500"
                          >
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-300 mb-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                              <p className="font-medium text-gray-900">No orders found</p>
                              <p className="mt-1">
                                This customer hasn't placed any orders yet.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Activity Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Activity Timeline
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center ml-6">
                      <div className="h-full w-0.5 bg-gray-200"></div>
                    </div>
                    <div className="relative space-y-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                            <ShoppingBagIcon className="h-4 w-4 text-green-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Placed order #ORD-7892
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-15 at 10:23 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center z-10">
                            <StarIcon className="h-4 w-4 text-yellow-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Left a 5-star review for "Monstera Deliciosa"
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-10 at 3:45 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                            <MessageCircleIcon className="h-4 w-4 text-blue-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Sent an inquiry about plant care
                          </p>
                          <p className="text-xs text-gray-500">
                            2023-07-05 at 11:20 AM
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center z-10">
                            <UserPlusIcon className="h-4 w-4 text-green-700" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Created account
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(customer.createdAt).toLocaleDateString()}{' '}
                            at 2:15 PM
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
  };
  // Render dashboard content
  const renderDashboardContent = () => <>
      {/* Metrics cards - Firebase data */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Sales */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSignIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sales
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${dashboardStats.totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View all
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Pending Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Orders
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{dashboardStats.pendingOrders}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View all
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Active Customers */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheckIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Customers
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.activeCustomers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View all
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Revenue Growth - Placeholder */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Revenue Growth
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {dashboardStats.revenueGrowth !== undefined && dashboardStats.revenueGrowth !== null
                        ? `${dashboardStats.revenueGrowth > 0 ? '+' : ''}${dashboardStats.revenueGrowth.toFixed(2)}%`
                        : '--'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View report
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Average Order Value - Placeholder */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TagIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      ${dashboardStats.avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View report
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        {/* Repeat Customers - Placeholder */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RepeatIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Repeat Customers
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{dashboardStats.repeatCustomers}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a href="#" className="font-medium text-green-700 hover:text-green-900 flex items-center">
                View details
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Charts section */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Sales Over Time Chart */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Sales Over Time
            </h3>
            <div className="flex items-center">
              <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} activeDot={{
                r: 8
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Products Chart */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            <div className="flex items-center">
              <select
                className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                value={productsMetric}
                onChange={e => setProductsMetric(e.target.value as 'sales' | 'revenue')}
              >
                <option value="sales">By Sales</option>
                <option value="revenue">By Revenue</option>
              </select>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5
              }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value: any) => productsMetric === 'sales' ? `${value} units` : `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}/>
                <Legend />
                <Bar
                  dataKey={productsMetric}
                  name={productsMetric === 'sales' ? 'Units Sold' : 'Revenue'}
                  fill="#16a34a"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Inventory Alerts Widget (NEW) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <AlertCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Inventory Alerts
               {inventoryAlerts.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {inventoryAlerts.length} alert(s)
            </span>
          )}
            </h3>
            <a href="#" className="text-sm font-medium text-green-700 hover:text-green-900">
              View all inventory
            </a>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {inventoryAlerts.map(item => <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img src={item.image} alt={item.product} className="h-10 w-10 rounded-md object-cover" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product}
                        </p>
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.stock}{' '}
                          <span className="text-gray-500">
                            / {item.threshold}
                          </span>
                        </p>
                        <p className="text-xs text-red-500">Low stock</p>
                      </div>
                      <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                          {restocking === item.id ? (
                        <RefreshCwIcon className="h-3.5 w-3.5 animate-spin mr-1" />
                      ) : (
                        <RefreshCwIcon className="h-3.5 w-3.5 mr-1" />
                      )}
                      {restocking === item.id ? 'Restocking...' : 'Restock'}
                      </button>
                    </div>
                  </div>
                </li>)}
            </ul>
          </div>
        </div>
        {/* Customer Activity Feed (NEW) */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Customer Activity
            </h3>
            <a href="#" className="text-sm font-medium text-green-700 hover:text-green-900">
              View all activity
            </a>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {customerActivity.map(activity => <li key={activity.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.customer}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                </li>)}
            </ul>
          </div>
        </div>
      </div>
      {/* Recent Orders Table */}
      {/* Recent Orders Table - Firebase data */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Orders
            </h3>
            <a href="#" onClick={e => {
            e.preventDefault();
            setActiveNav('orders');
          }} className="text-sm font-medium text-green-700 hover:text-green-900">
              View all orders
            </a>
          </div>
          {/* Feedback message for product deletion */}
          {deleteFeedback && (
            <div className="mb-4 px-4 py-2 rounded bg-green-100 text-green-800 border border-green-300 text-center">
              {deleteFeedback}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats.recentOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.date ? new Date(order.date).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-green-700 hover:text-green-900" onClick={e => {
                    e.preventDefault();
                    setSelectedOrder(order.id);
                    setActiveNav('orders');
                  }}>
                        View
                      </a>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>;
  // Render orders content
  const renderOrdersContent = () => <>
      {selectedOrder ? renderOrderDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Orders
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Status:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                    <option value="all">All Orders</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleExportCSV(filteredOrders)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <DownloadIcon className="h-4 w-4 mr-1.5" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handlePrintOrders(filteredOrders)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PrinterIcon className="h-4 w-4 mr-1.5" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        id="select-all"
                        name="select-all"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAllOrders}
                        ref={el => { if (el) el.indeterminate = selectedOrderIds.length > 0 && selectedOrderIds.length < filteredOrders.length; }}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedOrders.map(order => <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          id={`select-${order.id}`}
                          name={`select-${order.id}`}
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={handleSelectOrder(order.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.total}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedOrder(order.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <EditIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select
                  className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={orderBulkAction}
                  onChange={e => setOrderBulkAction(e.target.value)}
                  aria-label="Bulk actions"
                  disabled={selectedOrderIds.length === 0}
                >
                  <option>Bulk Actions</option>
                  <option>Export Selected</option>
                  <option>Update Status</option>
                  <option>Delete Selected</option>
                </select>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleOrderBulkAction}
                  disabled={selectedOrderIds.length === 0 || orderBulkAction === 'Bulk Actions'}
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                {(() => {
                  // --- Pagination logic for Orders ---
                  const pageSize = 10;
                  const totalOrders = filteredOrders.length;
                  const totalPages = Math.ceil(totalOrders / pageSize) || 1;
                  const startIdx = (ordersCurrentPage - 1) * pageSize;
                  const endIdx = Math.min(startIdx + pageSize, totalOrders);
                  let pageNumbers = [];
                  if (totalPages <= 5) {
                    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else {
                    if (ordersCurrentPage <= 3) {
                      pageNumbers = [1, 2, 3, 4, '...', totalPages];
                    } else if (ordersCurrentPage >= totalPages - 2) {
                      pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    } else {
                      pageNumbers = [1, '...', ordersCurrentPage - 1, ordersCurrentPage, ordersCurrentPage + 1, '...', totalPages];
                    }
                  }
                  return <>
                    <span className="text-sm text-gray-700 mr-4">
                      Showing <span className="font-medium">{totalOrders === 0 ? 0 : startIdx + 1}</span> to{' '}
                      <span className="font-medium">{endIdx}</span> of{' '}
                      <span className="font-medium">{totalOrders}</span>{' '}
                      results
                    </span>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        type="button"
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${ordersCurrentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setOrdersCurrentPage(p => Math.max(1, p - 1))}
                        disabled={ordersCurrentPage === 1}
                        aria-label="Previous"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                      </button>
                      {pageNumbers.map((num, idx) =>
                        typeof num === 'number' ? (
                          <button
                            key={num}
                            type="button"
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === ordersCurrentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                            onClick={() => setOrdersCurrentPage(num)}
                            aria-current={num === ordersCurrentPage ? 'page' : undefined}
                          >
                            {num}
                          </button>
                        ) : (
                          <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
                        )
                      )}
                      <button
                        type="button"
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${ordersCurrentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setOrdersCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={ordersCurrentPage === totalPages}
                        aria-label="Next"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </>;
                })()}
              </div>
            </div>
          </div>
        </div>}
    </>;
  // Render products content
  const renderProductsContent = () => <>
      {selectedProduct ? renderProductDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Products
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="relative rounded-md shadow-sm max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search products"
                    value={productSearchQuery}
                    onChange={e => setProductSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Category:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)}>
                    {productCategories.map((category, i) => <option key={category + '-' + i} value={category.replace(/ \(\d+\)$/, '')}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>)}
                  </select>
                </div>
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={() => setShowAddProductModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </button>
                {showAddProductModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowAddProductModal(false)}
                        aria-label="Close"
                      >
                        <XIcon className="h-6 w-6" />
                      </button>
                      <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
                        <PlusIcon className="h-5 w-5" /> Add New Product
                      </h2>
                      <form onSubmit={handleAddProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" name="name" value={addProductForm.name} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                            <textarea name="description" value={addProductForm.description} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                            <textarea name="longDescription" value={addProductForm.longDescription} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input type="text" name="image" value={addProductForm.image} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                              <input type="number" name="price" value={addProductForm.price} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" step="0.01" required />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                              <input type="number" name="stock" value={addProductForm.stock} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                            <input type="text" name="category" value={addProductForm.category} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                              <input type="number" name="rating" value={addProductForm.rating} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="5" />
                            </div>
                            <div className="flex-1 flex items-center gap-2 mt-6">
                              <input type="checkbox" name="inStock" checked={addProductForm.inStock} onChange={handleAddProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                              <label className="text-sm text-gray-700">In Stock</label>
                            </div>
                            <div className="flex-1 flex items-center gap-2 mt-6">
                              <input type="checkbox" name="isBestSeller" checked={addProductForm.isBestSeller} onChange={handleAddProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                              <label className="text-sm text-gray-700">Best Seller</label>
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" name="careInstructions.light" value={addProductForm.careInstructions.light} onChange={handleAddProductChange} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.temperature" value={addProductForm.careInstructions.temperature} onChange={handleAddProductChange} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.warnings" value={addProductForm.careInstructions.warnings} onChange={handleAddProductChange} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="careInstructions.water" value={addProductForm.careInstructions.water} onChange={handleAddProductChange} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                            <div className="grid grid-cols-2 gap-2">
                              <input type="text" name="specifications.Difficulty" value={addProductForm.specifications.Difficulty} onChange={handleAddProductChange} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Growth Rate" value={addProductForm.specifications['Growth Rate']} onChange={handleAddProductChange} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Light Requirements" value={addProductForm.specifications['Light Requirements']} onChange={handleAddProductChange} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Mature Height" value={addProductForm.specifications['Mature Height']} onChange={handleAddProductChange} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Pet Friendly" value={addProductForm.specifications['Pet Friendly']} onChange={handleAddProductChange} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                              <input type="text" name="specifications.Pot Size" value={addProductForm.specifications['Pot Size']} onChange={handleAddProductChange} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                            <div className="grid grid-cols-1 gap-2">
                              {[0, 1, 2].map(i => (
                                <input key={i} type="text" name={`relatedProducts.${i}`} value={addProductForm.relatedProducts[i]} onChange={handleAddProductChange} placeholder={`Related Product ${i + 1}`} className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" />
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                            <input type="text" name="reviews" value={addProductForm.reviews} onChange={handleAddProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-6">
                          <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Add Product
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        id="select-all-products"
                        name="select-all-products"
                        type="checkbox"
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={handleSelectAllProducts}
                        ref={el => { if (el) el.indeterminate = selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length; }}
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map(product => <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          id={`select-product-${product.id}`}
                          name={`select-product-${product.id}`}
                          type="checkbox"
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={handleSelectProduct(product.id)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt={product.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(product.category) ? product.category.join(', ') : product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.stock}
                        {product.stock <= product.lowStockThreshold && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Low
                          </span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.featured ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Featured
                        </span> : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedProduct(product.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => {
                            setEditProductId(product.id);
                            setEditProductForm({
                              ...product,
                              image: product.imageUrl || product.image || '',
                              price: product.price?.toString() || '',
                              stock: product.stock?.toString() || '',
                              inStock: product.inStock ?? true,
                              isBestSeller: product.isBestSeller ?? false,
                              rating: product.rating ?? 0,
                              careInstructions: {
                                light: product.careInstructions?.light || '',
                                temperature: product.careInstructions?.temperature || '',
                                warnings: product.careInstructions?.warnings || '',
                                water: product.careInstructions?.water || '',
                              },
                              specifications: {
                                Difficulty: typeof product.specifications?.Difficulty === 'string' ? product.specifications.Difficulty : '',
                                'Growth Rate': typeof product.specifications?.['Growth Rate'] === 'string' ? product.specifications['Growth Rate'] : '',
                                'Light Requirements': typeof product.specifications?.['Light Requirements'] === 'string' ? product.specifications['Light Requirements'] : '',
                                'Mature Height': typeof product.specifications?.['Mature Height'] === 'string' ? product.specifications['Mature Height'] : '',
                                'Pet Friendly': typeof product.specifications?.['Pet Friendly'] === 'string' ? product.specifications['Pet Friendly'] : '',
                                'Pot Size': typeof product.specifications?.['Pot Size'] === 'string' ? product.specifications['Pot Size'] : '',
                              },
                              relatedProducts: Array.isArray(product.relatedProducts)
                                ? product.relatedProducts.map((ref: any) =>
                                    typeof ref === "string"
                                      ? ref
                                      : String(ref.id || ref.path || "")
                                  )
                                : ['', '', ''],
                              reviews: typeof product.reviews === 'string' ? product.reviews : '',
                            });
                            setShowEditProductModal(true);
                          }}
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-700"
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteProductId(product.id);
                            setShowDeleteProductModal(true);
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        {/* Delete Product Modal (rendered outside button) */}
                        {showDeleteProductModal && deleteProductId && (
                          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-10">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
                              <h3 className="text-lg font-semibold mb-4 text-gray-800 text-center">Confirm Delete Product</h3>
                              <p className="mb-6 text-gray-700 text-center break-words whitespace-pre-line">
                                Are you sure you want to delete this product?
                                <br />
                                <span className="font-semibold text-red-700">This action cannot be undone.</span>
                              </p>
                              <div className="flex justify-center gap-3">
                                <button onClick={() => { setShowDeleteProductModal(false); setDeleteProductId(null); }} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
                                <button
                                  onClick={async () => {
                                    try {
                                      // Use Firestore instance from firebaseHelpers.js
                                      const { doc, deleteDoc } = await import('firebase/firestore');
                                      const { db } = await import('../firebase');
                                      await deleteDoc(doc(db, 'products', deleteProductId));
                                      setProducts((prev: Product[]) => prev.filter(p => p.id !== deleteProductId));
                                      setShowDeleteProductModal(false);
                                      setDeleteProductId(null);
                                      setDeleteFeedback('Product deleted successfully.');
                                      setTimeout(() => setDeleteFeedback(null), 3000);
                                    } catch (err) {
                                      alert('Failed to delete product.');
                                      console.error('Delete error:', err);
                                    }
                                  }}
                                  className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        {deleteFeedback && (
                                <div className="fixed top-5 right-5 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg z-50">
                                  {deleteFeedback}
                                </div>
                              )}
                      </div>
      {/* Edit Product Modal */}
    {showEditProductModal && editProductForm && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center">
    {/* Confirmation Popup */}
    {showEditConfirm && (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Save Changes</h3>
          <p className="mb-6 text-gray-700">Are you sure you want to save changes to this product?</p>
          <div className="flex justify-end gap-3">
            <button onClick={handleCancelEditSave} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300">Cancel</button>
            <button onClick={handleConfirmEditSave} className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800">Confirm</button>
          </div>
        </div>
      </div>
    )}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 relative border border-gray-200 bg-opacity-40">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowEditProductModal(false); setEditProductForm(null); setEditProductId(null); }}
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold mb-6 text-green-800 flex items-center gap-2">
              <EditIcon className="h-5 w-5" /> Edit Product
            </h2>
            <form onSubmit={handleEditProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input type="text" name="name" value={editProductForm.name} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text"name="sku"value={editProductForm.sku ?? ''}onChange={handleEditProductChange}className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"required/>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <textarea name="description" value={editProductForm.description} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                  <textarea name="longDescription" value={editProductForm.longDescription} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input type="text" name="image" value={editProductForm.image} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" name="price" value={editProductForm.price} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" step="0.01" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" name="stock" value={editProductForm.stock} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category (comma separated)</label>
                  <input type="text" name="category" value={editProductForm.category} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input type="number" name="rating" value={editProductForm.rating} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="5" />
                  </div>
                  <div className="flex-1 flex items-center gap-2 mt-6">
                    <input type="checkbox" name="inStock" checked={editProductForm.inStock} onChange={handleEditProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                    <label className="text-sm text-gray-700">In Stock</label>
                  </div>
                  <div className="flex-1 flex items-center gap-2 mt-6">
                    <input type="checkbox" name="isBestSeller" checked={editProductForm.isBestSeller} onChange={handleEditProductChange} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                    <label className="text-sm text-gray-700">Best Seller</label>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Care Instructions</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="careInstructions.light" value={editProductForm.careInstructions.light} onChange={handleEditProductChange} placeholder="Light" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.temperature" value={editProductForm.careInstructions.temperature} onChange={handleEditProductChange} placeholder="Temperature" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.warnings" value={editProductForm.careInstructions.warnings} onChange={handleEditProductChange} placeholder="Warnings" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="careInstructions.water" value={editProductForm.careInstructions.water} onChange={handleEditProductChange} placeholder="Water" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Specifications</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="specifications.Difficulty" value={editProductForm.specifications?.Difficulty ?? ''} onChange={handleEditProductChange} placeholder="Difficulty" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Growth Rate" value={editProductForm.specifications?.['Growth Rate'] ?? ''} onChange={handleEditProductChange} placeholder="Growth Rate" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Light Requirements" value={editProductForm.specifications?.['Light Requirements'] ?? ''} onChange={handleEditProductChange} placeholder="Light Requirements" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Mature Height" value={editProductForm.specifications?.['Mature Height'] ?? ''} onChange={handleEditProductChange} placeholder="Mature Height" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Pet Friendly" value={editProductForm.specifications?.['Pet Friendly'] ?? ''} onChange={handleEditProductChange} placeholder="Pet Friendly" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                    <input type="text" name="specifications.Pot Size" value={editProductForm.specifications?.['Pot Size'] ?? ''} onChange={handleEditProductChange} placeholder="Pot Size" className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Related Products (IDs or paths)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[0, 1, 2].map(i => (
                      <input key={i} type="text" name={`relatedProducts.${i}`} value={editProductForm.relatedProducts[i]} onChange={handleEditProductChange} placeholder={`Related Product ${i + 1}`} className="border border-gray-300 rounded-md px-2 py-1 focus:ring-green-500 flex-1" />
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reviews (path or ID)</label>
                  <input type="text" name="reviews" value={editProductForm.reviews} onChange={handleEditProductChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end mt-6">
                <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <select
                  className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  value={productBulkAction}
                  onChange={e => setProductBulkAction(e.target.value)}
                  aria-label="Bulk actions"
                  disabled={selectedProductIds.length === 0}
                >
                  <option value="">Bulk Actions</option>
                  <option value="Mark as Featured">Mark as Featured</option>
                  <option value="Update Stock">Update Stock</option>
                  <option value="Delete Selected">Delete Selected</option>
                </select>
                <button
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={handleProductBulkAction}
                  disabled={selectedProductIds.length === 0 || !productBulkAction}
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center">
                {/* Pagination State and Logic */}
                {/* ...existing code... */}
                {(() => {
                  // --- Pagination logic ---
                  
                  const pageSize = 10;
                  const totalProducts = filteredProducts.length;
                  const totalPages = Math.ceil(totalProducts / pageSize) || 1;
                  const startIdx = (currentPage - 1) * pageSize;
                  const endIdx = Math.min(startIdx + pageSize, totalProducts);
                  // Only show up to 5 page numbers, with ellipsis if needed
                  let pageNumbers: (number | string)[] = [];
                  if (totalPages <= 5) {
                    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else {
                    if (currentPage <= 3) {
                      pageNumbers = [1, 2, 3, 4, '...', totalPages];
                    } else if (currentPage >= totalPages - 2) {
                      pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    } else {
                      pageNumbers = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                    }
                  }

                  // --- Results Count Display ---
                  return <>
                    <span className="text-sm text-gray-700 mr-4">
                      Showing <span className="font-medium">{totalProducts === 0 ? 0 : startIdx + 1}</span> to{' '}
                      <span className="font-medium">{endIdx}</span> of{' '}
                      <span className="font-medium">{totalProducts}</span>{' '}
                      results
                    </span>
                    {/* Pagination Navigation */}
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* Previous Page Button */}
                      <button
                        type="button"
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        aria-label="Previous"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
                      </button>
                      {/* Page Numbers */}
                      {pageNumbers.map((num, idx) =>
                        typeof num === 'number' ? (
                          <button
                            key={num}
                            type="button"
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === currentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                            onClick={() => setCurrentPage(num)}
                            aria-current={num === currentPage ? 'page' : undefined}
                          >
                            {num}
                          </button>
                        ) : (
                          <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
                        )
                      )}
                      {/* Next Page Button */}
                      <button
                        type="button"
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        aria-label="Next"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </nav>
                  </>;
                })()}
              </div>
            </div>
          </div>
        </div>}
    </>;
  // Render customers content
  const renderCustomersContent = () => <>
      {editingCustomer && (
        <CustomerDetail 
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onSave={() => {
            // After saving, refresh the customers list
            setEditingCustomer(null);
            const fetchCustomers = async () => {
              if (activeNav !== 'customers') return;
              
              try {
                // Fetch customers
                const customersCollection = collection(db, 'users');
                const customersSnapshot = await getDocs(customersCollection);
                
                // Fetch all orders
                const ordersCollection = collection(db, 'orders');
                const ordersSnapshot = await getDocs(ordersCollection);
                const orders = ordersSnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    userId: data.userId,
                    total: data.total,
                    shippingAddress: data.shippingAddress
                  };
                });

                const customersData = await Promise.all(customersSnapshot.docs.map(async (doc) => {
                  const customerData = doc.data();
                  
                  // Get all orders for this customer
                  const customerOrders = orders.filter(order => 
                    order.userId === doc.id || 
                    (order.shippingAddress && 
                     order.shippingAddress.email === customerData.email)
                  );

                  const totalSpent = customerOrders.reduce((sum, order) => 
                    sum + (typeof order.total === 'number' ? order.total : 0), 0);

                  let segment: 'new' | 'repeat' | 'high' = 'new';
                  if (customerOrders.length > 0) {
                    if (totalSpent > 500) {
                      segment = 'high';
                    } else if (customerOrders.length > 1) {
                      segment = 'repeat';
                    }
                  }

                  return {
                    id: doc.id,
                    uid: customerData.uid,
                    firstName: customerData.firstName,
                    lastName: customerData.lastName,
                    email: customerData.email,
                    phone: customerData.phone,
                    location: customerData.location,
                    lastLogin: customerData.lastLogin,
                    createdAt: customerData.createdAt,
                    receiveEmails: customerData.receiveEmails,
                    ordersCount: customerOrders.length,
                    totalSpent,
                    segment
                  };
                }));

                setAllCustomers(customersData);
              } catch (error) {
                console.error('Error fetching customers:', error);
              }
            };
            fetchCustomers();
          }}
        />
      )}
      {selectedCustomer ? renderCustomerDetail() : <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Customers
              </h3>
              <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
                <div className="relative rounded-md shadow-sm max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search customers"
                    value={customerSearchQuery}
                    onChange={e => { setCustomerSearchQuery(e.target.value); setCustomersCurrentPage(1); }}
                    aria-label="Search customers"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Segment:</span>
                  <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={customerSegmentFilter} onChange={e => setCustomerSegmentFilter(e.target.value)}>
                    <option value="all">All Customers</option>
                    <option value="new">New Customers</option>
                    <option value="repeat">Repeat Customers</option>
                    <option value="high">High Value</option>
                  </select>
                </div>
                <button onClick={handleAddCustomer} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spend
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map(customer => <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-green-700">
                              {customer.firstName?.charAt(0) || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${customer.firstName || ''} ${customer.lastName || ''}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.ordersCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${customer.totalSpent?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {customer.lastLogin ? new Date(customer.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.segment === 'new' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>}
                      {customer.segment === 'repeat' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Repeat
                        </span>}
                      {customer.segment === 'high' && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          High Value
                        </span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => setSelectedCustomer(customer.id)} className="text-green-700 hover:text-green-900">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => setEditingCustomer(customer)} 
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <EditIcon className="h-5 w-5" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700">
                          <MessageCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          {/**
 * Table/List Management Footer Component
 * 
 * Purpose: Provides bulk action controls and pagination for data tables/lists
 * 
 * Features:
 * - Bulk action controls (dropdown with export/email options + apply button)
 * - Pagination with previous/next navigation
 * - Results summary showing current view range and total items
 * - Responsive design that stacks vertically on mobile devices
 * 
 * Props/Dependencies:
 * - customers: Array - Total dataset of all items
 * - filteredCustomers: Array - Currently filtered/displayed items subset
 * - ChevronRightIcon: Component - Required icon for pagination arrows
 * 
 * Accessibility:
 * - Screen reader labels for pagination buttons (sr-only)
 * - ARIA labels for navigation elements
 * - Focus management with visible focus rings
 * 
 * Usage: Typically placed below data tables where bulk operations and navigation are needed
 */}
<div className="px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
  <div className="flex flex-col sm:flex-row items-center justify-between">
    {/* Bulk Actions Section - Left side */}
    <div className="flex items-center mb-4 sm:mb-0">
      <select 
        className="mr-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
        aria-label="Bulk actions"
      >
        <option>Bulk Actions</option>
        <option>Export Selected</option>
        <option>Send Email</option>
      </select>
      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
        Apply
      </button>
    </div>

    {/* Pagination & Results Section - Right side */}
    <div className="flex items-center">
      {(() => {
        // --- Pagination logic for Customers ---
        const pageSize = 10;
        const totalCustomers = customers.length;
        const totalPages = Math.ceil(totalCustomers / pageSize) || 1;
        const startIdx = (customersCurrentPage - 1) * pageSize;
        const endIdx = Math.min(startIdx + pageSize, totalCustomers);
        let pageNumbers = [];
        if (totalPages <= 5) {
          pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
          if (customersCurrentPage <= 3) {
            pageNumbers = [1, 2, 3, 4, '...', totalPages];
          } else if (customersCurrentPage >= totalPages - 2) {
            pageNumbers = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
          } else {
            pageNumbers = [1, '...', customersCurrentPage - 1, customersCurrentPage, customersCurrentPage + 1, '...', totalPages];
          }
        }
        return <>
          <span className="text-sm text-gray-700 mr-4">
            Showing <span className="font-medium">{totalCustomers === 0 ? 0 : startIdx + 1}</span> to{' '}
            <span className="font-medium">{endIdx}</span> of{' '}
            <span className="font-medium">{totalCustomers}</span>{' '}
            results
          </span>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              type="button"
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${customersCurrentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setCustomersCurrentPage(p => Math.max(1, p - 1))}
              disabled={customersCurrentPage === 1}
              aria-label="Previous"
            >
              <span className="sr-only">Previous</span>
              <ChevronRightIcon className="h-5 w-5 transform rotate-180" />
            </button>
            {pageNumbers.map((num, idx) =>
              typeof num === 'number' ? (
                <button
                  key={num}
                  type="button"
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 ${num === customersCurrentPage ? 'bg-green-50 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-50'} text-sm font-medium`}
                  onClick={() => setCustomersCurrentPage(num)}
                  aria-current={num === customersCurrentPage ? 'page' : undefined}
                >
                  {num}
                </button>
              ) : (
                <span key={idx} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-400 select-none">…</span>
              )
            )}
            <button
              type="button"
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${customersCurrentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              onClick={() => setCustomersCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={customersCurrentPage === totalPages}
              aria-label="Next"
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </>;
      })()}
    </div>
  </div>
</div>
        </div>}
    </>;
  // Render reports content
  const renderReportsContent = () => <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reports
            </h3>
            <div className="mt-3 md:mt-0 flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Report Type:</span>
                <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option value="sales">Sales Report</option>
                  <option value="customers">Customer Report</option>
                  <option value="inventory">Inventory Report</option>
                </select>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Timeframe:</span>
                <select className="text-sm border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500" value={reportTimeframe} onChange={e => setReportTimeframe(e.target.value)}>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export PDF
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          {reportType === 'sales' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </h4>
                    <DollarSignIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    $11,780
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    +12.5% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Orders
                    </h4>
                    <ShoppingBagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">270</p>
                  <p className="mt-1 text-sm text-green-600">
                    +8.2% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Avg. Order Value
                    </h4>
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    $43.63
                  </p>
                  <p className="mt-1 text-sm text-green-600">
                    +4.3% from previous period
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Revenue Over Time
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesReportData} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Orders by Status
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{
                        name: 'Delivered',
                        value: 180
                      }, {
                        name: 'Shipped',
                        value: 45
                      }, {
                        name: 'Processing',
                        value: 28
                      }, {
                        name: 'Pending',
                        value: 12
                      }, {
                        name: 'Cancelled',
                        value: 5
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => 
  percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : `${name}: 0%`
                                                    }>
                            <Cell fill="#16a34a" />
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#eab308" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Sales by Category
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{
                      name: 'Indoor Plants',
                      sales: 4250
                    }, {
                      name: 'Outdoor Plants',
                      sales: 3200
                    }, {
                      name: 'Succulents',
                      sales: 2100
                    }, {
                      name: 'Garden Tools',
                      sales: 1450
                    }, {
                      name: 'Pots & Planters',
                      sales: 780
                    }]} margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{
                        fontSize: 12
                      }} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {reportType === 'customers' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      New Customers
                    </h4>
                    <UserPlusIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">127</p>
                  <p className="mt-1 text-sm text-green-600">
                    +15.3% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Returning Customers
                    </h4>
                    <RepeatIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">143</p>
                  <p className="mt-1 text-sm text-green-600">
                    +6.7% from previous period
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Churn Rate
                    </h4>
                    <TrendingUpIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">1.8%</p>
                  <p className="mt-1 text-sm text-green-600">
                    -0.3% from previous period
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Customer Growth
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={customerReportData} margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0
                  }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="new" name="New Customers" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="returning" name="Returning Customers" stroke="#16a34a" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Segments
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{
                        name: 'New',
                        value: 35
                      }, {
                        name: 'Repeat',
                        value: 45
                      }, {
                        name: 'High Value',
                        value: 20
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            <Cell fill="#3b82f6" />
                            <Cell fill="#16a34a" />
                            <Cell fill="#8b5cf6" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Customer Retention
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{
                      month: 'Jan',
                      retention: 65
                    }, {
                      month: 'Feb',
                      retention: 68
                    }, {
                      month: 'Mar',
                      retention: 71
                    }, {
                      month: 'Apr',
                      retention: 69
                    }, {
                      month: 'May',
                      retention: 74
                    }, {
                      month: 'Jun',
                      retention: 78
                    }, {
                      month: 'Jul',
                      retention: 82
                    }]} margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0
                    }}>
                          <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="retention" name="Retention Rate (%)" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRetention)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {reportType === 'inventory' && <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Products
                    </h4>
                    <BoxIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">482</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Across 8 categories
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Low Stock Items
                    </h4>
                    <AlertCircleIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">41</p>
                  <p className="mt-1 text-sm text-yellow-600">
                    8.5% of inventory
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-500">
                      Out of Stock
                    </h4>
                    <XIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
                  <p className="mt-1 text-sm text-red-600">2.5% of inventory</p>
                </div>
              </div>
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Inventory Status by Category
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryReportData} margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5
                  }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="category" type="category" width={150} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inStock" name="In Stock" stackId="a" fill="#16a34a" />
                        <Bar dataKey="lowStock" name="Low Stock" stackId="a" fill="#eab308" />
                        <Bar dataKey="outOfStock" name="Out of Stock" stackId="a" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Top Selling Products
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      {topProductsData.map((product, index) => <div key={index} className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1 ml-2">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{
                          width: `${product.sales / topProductsData[0].sales * 100}%`
                        }}></div>
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-medium text-gray-900">
                            {product.sales} units
                          </span>
                        </div>)}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Inventory Value
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={[{
                        name: 'Indoor Plants',
                        value: 12500
                      }, {
                        name: 'Outdoor Plants',
                        value: 8750
                      }, {
                        name: 'Succulents',
                        value: 4200
                      }, {
                        name: 'Garden Tools',
                        value: 7800
                      }, {
                        name: 'Pots & Planters',
                        value: 5400
                      }]} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            <Cell fill="#16a34a" />
                            <Cell fill="#22c55e" />
                            <Cell fill="#3b82f6" />
                            <Cell fill="#8b5cf6" />
                            <Cell fill="#ec4899" />
                          </Pie>
                          <Tooltip formatter={value => `$${value}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </div>;
  // Render settings content
  const renderSettingsContent = () => <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Settings
        </h3>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['store', 'users', 'payment', 'notifications', 'security'].map(tab => <button key={tab} onClick={() => setActiveSettingsTab(tab)} className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${activeSettingsTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab === 'store' && 'Store Settings'}
                {tab === 'users' && 'User Management'}
                {tab === 'payment' && 'Payment Methods'}
                {tab === 'notifications' && 'Notifications'}
                {tab === 'security' && 'Security'}
              </button>)}
        </nav>
      </div>
      <div className="p-4 sm:p-6">
        {activeSettingsTab === 'store' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Store Information
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="store-name" className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-name" id="store-name" defaultValue="Starseedz Nurseries" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="store-email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input type="email" name="store-email" id="store-email" defaultValue="info@starseedz.com" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="store-phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-phone" id="store-phone" defaultValue="(555) 123-4567" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <div className="mt-1">
                    <select id="currency" name="currency" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>CAD ($)</option>
                      <option>AUD ($)</option>
                      <option>TTD ($)</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="store-address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input type="text" name="store-address" id="store-address" defaultValue="Couva, Couva-Tabaquite-Talparo Regional Corporation,
Trinidad and Tobago" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Store Logo
              </h4>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1585676623595-7761e1c5f38b?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Store logo" className="h-full w-full object-cover" />
                </div>
                <div className="ml-5">
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Change
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                      Remove
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, or GIF. Max size 1MB.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Tax Settings
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <div className="mt-1">
                    <input type="text" name="tax-rate" id="tax-rate" defaultValue="8.5" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="tax-name" className="block text-sm font-medium text-gray-700">
                    Tax Name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="tax-name" id="tax-name" defaultValue="Sales Tax" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Shipping Methods
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Standard Shipping
                    </h5>
                    <p className="text-sm text-gray-500">3-5 business days</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-4">
                      $5.00
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Express Shipping
                    </h5>
                    <p className="text-sm text-gray-500">1-2 business days</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-4">
                      $15.00
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Shipping Method
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-5 flex justify-end">
              <button type="button" className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Cancel
              </button>
              <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Save Changes
              </button>
            </div>
          </div>}
        {activeSettingsTab === 'users' && <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  User Management
                </h4>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-green-700">
                              A
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Admin User
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        admin@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Administrator
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-blue-700">
                              J
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              John Smith
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        john@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Manager
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-pink-700">
                              S
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              Sarah Johnson
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        sarah@greenthumb.com
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Staff
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-500 hover:text-gray-700">
                            <EditIcon className="h-5 w-5" />
                          </button>
                          <button className="text-gray-500 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                User Roles
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Administrator
                    </h5>
                    <p className="text-sm text-gray-500">
                      Full access to all settings and data
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Manager
                    </h5>
                    <p className="text-sm text-gray-500">
                      Can manage products, orders, and customers
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">Staff</h5>
                    <p className="text-sm text-gray-500">
                      Can view orders and manage inventory
                    </p>
                  </div>
                  <div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Role
                  </button>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'payment' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        Credit Card
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept Visa, Mastercard, Amex, Discover
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
                      Enabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-blue-100 rounded flex items-center justify-center">
                      <span className="font-bold text-blue-700">PayPal</span>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        PayPal
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept payments via PayPal
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-4">
                      Enabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-16 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="font-bold text-yellow-700">Apple</span>
                    </div>
                    <div className="ml-4">
                      <h5 className="text-sm font-medium text-gray-900">
                        Apple Pay
                      </h5>
                      <p className="text-sm text-gray-500">
                        Accept payments via Apple Pay
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-4">
                      Disabled
                    </span>
                    <button className="text-sm text-gray-500 hover:text-gray-700">
                      <EditIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <PlusIcon className="h-4 w-4 mr-1.5" />
                    Add Payment Method
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Payment Processor
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="processor" className="block text-sm font-medium text-gray-700">
                    Processor
                  </label>
                  <div className="mt-1">
                    <select id="processor" name="processor" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>Stripe</option>
                      <option>Square</option>
                      <option>Authorize.net</option>
                      <option>Braintree</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="mode" className="block text-sm font-medium text-gray-700">
                    Mode
                  </label>
                  <div className="mt-1">
                    <select id="mode" name="mode" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md">
                      <option>Test Mode</option>
                      <option>Live Mode</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-6">
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="mt-1">
                    <input type="password" name="api-key" id="api-key" defaultValue="sk_test_51KGjT..." className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'notifications' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Email Notifications
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      New Order
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when a new order is placed
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Order Status Update
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when an order status changes
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Low Stock Alert
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when product stock is low
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Customer Registration
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send email when a new customer registers
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                SMS Notifications
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Order Status Updates
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send SMS when order status changes
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Delivery Notifications
                    </h5>
                    <p className="text-sm text-gray-500">
                      Send SMS when order is delivered
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Admin Notifications
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="notification-email" className="block text-sm font-medium text-gray-700">
                    Notification Email
                  </label>
                  <div className="mt-1">
                    <input type="email" name="notification-email" id="notification-email" defaultValue="admin@greenthumb.com" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
        {activeSettingsTab === 'security' && <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Two-Factor Authentication
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Enable Two-Factor Authentication
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Password Settings
              </h4>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Require Strong Passwords
                    </h5>
                    <p className="text-sm text-gray-500">
                      Passwords must include letters, numbers, and special
                      characters
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      Password Expiry
                    </h5>
                    <p className="text-sm text-gray-500">
                      Force users to reset password periodically
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                API Access
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      API Access
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                      Allow external applications to access your store data
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <KeyIcon className="h-4 w-4 mr-1.5" />
                    Manage API Keys
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Session Settings
              </h4>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <div className="mt-1">
                    <input type="number" name="session-timeout" id="session-timeout" defaultValue="30" className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </div>
    </div>;
  return <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center">
            <span className="text-xl font-bold text-green-700">
              Admin Panel
            </span>
          </Link>
          <button className="md:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(false)}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navItems.map(item => <a key={item.id} href="#" className={`
                group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors
                ${activeNav === item.id ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-100'}
              `} onClick={e => {
          e.preventDefault();
          setActiveNav(item.id);
          // Reset detail views when changing tabs
          setSelectedOrder(null);
          setSelectedProduct(null);
          setSelectedCustomer(null);
        }}>
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </a>)}
        </nav>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <button className="md:hidden px-4 text-gray-500 focus:outline-none" onClick={() => setSidebarOpen(true)}>
                  <MenuIcon className="h-6 w-6" />
                </button>
                <div className="flex-1 flex items-center md:ml-0">
                  <div className="max-w-lg w-full lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input id="search" name="search" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 sm:text-sm" placeholder="Search" type="search" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                  <span className="sr-only">View notifications</span>
                  <div className="relative">
                    <BellIcon className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </div>
                </button>
                {/* Profile dropdown */}
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center text-white font-medium">
                      A
                    </div>
                    <span className="hidden md:flex md:items-center ml-2">
                      <span className="text-sm font-medium text-gray-700 mr-1">
                        Admin User
                      </span>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'orders' && 'Orders'}
              {activeNav === 'products' && 'Products'}
              {activeNav === 'customers' && 'Customers'}
              {activeNav === 'reports' && 'Reports'}
              {activeNav === 'settings' && 'Settings'}
            </h1>
            {activeNav !== 'settings' && activeNav !== 'reports' && !selectedOrder && !selectedProduct && !selectedCustomer && <div className="mt-3 sm:mt-0 sm:ml-4">
                  <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" onClick={() => setIsFilterOpen(true)}>
                    <FilterIcon className="h-4 w-4 mr-2" />
                    Filter
                  </button>
                </div>}
            {/* Filter Modal */}
            <ReactModal
              isOpen={isFilterOpen}
              onRequestClose={() => setIsFilterOpen(false)}
              className="fixed inset-0 flex items-center justify-center z-50"
              overlayClassName="fixed inset-0 bg-black bg-opacity-30 z-40"
              ariaHideApp={false}
            >
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Filter Options</h2>
                {/* Example filter controls, you can expand as needed */}
                {activeNav === 'products' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={productCategoryFilter}
                      onChange={e => setProductCategoryFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All</option>
                      {Object.entries(categoryMap).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {activeNav === 'orders' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Sort Orders</label>
                    <div className="flex space-x-2 mb-2">
                      <select
                        value={orderSortField}
                        onChange={e => setOrderSortField(e.target.value as any)}
                        className="flex-1 w-full border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="none">None</option>
                        <option value="date">Date</option>
                        <option value="customer">Customer</option>
                        <option value="total">Total</option>
                        <option value="payment">Payment Method</option>
                      </select>
                      <select
                        value={orderSortDir}
                        onChange={e => setOrderSortDir(e.target.value as 'asc' | 'desc')}
                        className="w-32 border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="desc">Desc</option>
                        <option value="asc">Asc</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-500">Note: Sorting is applied on the currently loaded orders.</div>
                  </div>
                )}
                {activeNav === 'customers' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Segment</label>
                    <select
                      value={customerSegmentFilter}
                      onChange={e => setCustomerSegmentFilter(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="retail">Retail</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button
                    className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 mr-2"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Apply
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </ReactModal>
          </div>
          <div className="mt-6">
            {activeNav === 'dashboard' && renderDashboardContent()}
            {activeNav === 'orders' && renderOrdersContent()}
            {activeNav === 'products' && renderProductsContent()}
            {activeNav === 'customers' && renderCustomersContent()}
            {activeNav === 'reports' && renderReportsContent()}
            {activeNav === 'settings' && renderSettingsContent()}
          </div>
        </main>
      </div>
  </div>;
};

export default AdminDashboard;