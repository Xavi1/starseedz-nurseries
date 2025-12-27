// src/AdminDashboard/views/Dashboard/DashboardView.tsx
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { InventoryAlert } from '../../types';

interface DashboardViewProps {
  setActiveNav: (nav: string) => void;
  setOrderStatusFilter: (status: string) => void;
  setSelectedOrder: (id: string | null) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveNav,
  setOrderStatusFilter,
  setSelectedOrder,
}) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    recentOrders: [] as any[],
    avgOrderValue: 0,
    repeatCustomers: 0,
    revenueGrowth: 0,
  });

  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [productsMetric, setProductsMetric] = useState<'sales' | 'revenue'>(
    'sales'
  );
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);

  /* ===========================
     DASHBOARD STATS
  ============================ */
  useEffect(() => {
    const fetchDashboardStats = async () => {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const customersSnap = await getDocs(collection(db, 'customers'));

      let totalSales = 0;
      let pendingOrders = 0;
      const recentOrders: any[] = [];
      const customerOrderCount: Record<string, number> = {};

      ordersSnap.forEach((doc) => {
        const data = doc.data();
        totalSales += data.total || 0;

        if (data.status === 'pending') pendingOrders++;

        if (recentOrders.length < 5) {
          recentOrders.push({ id: doc.id, ...data });
        }

        if (data.customerId) {
          customerOrderCount[data.customerId] =
            (customerOrderCount[data.customerId] || 0) + 1;
        }
      });

      const repeatCustomers = Object.values(customerOrderCount).filter(
        (count) => count > 1
      ).length;

      setStats({
        totalSales,
        pendingOrders,
        activeCustomers: customersSnap.size,
        recentOrders,
        avgOrderValue: ordersSnap.size
          ? totalSales / ordersSnap.size
          : 0,
        repeatCustomers,
        revenueGrowth: 0, // calculated elsewhere if needed
      });
    };

    fetchDashboardStats();
  }, []);

  /* ===========================
     SALES CHART DATA
  ============================ */
  useEffect(() => {
    const fetchSalesData = async () => {
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'asc')
      );

      const snap = await getDocs(q);
      const map: Record<string, number> = {};

      snap.forEach((doc) => {
        const data = doc.data();
        const date = data.createdAt?.toDate().toLocaleDateString();

        if (!date) return;
        map[date] = (map[date] || 0) + (data.total || 0);
      });

      setSalesData(
        Object.entries(map).map(([date, total]) => ({
          date,
          total,
        }))
      );
    };

    fetchSalesData();
  }, []);

  /* ===========================
     TOP PRODUCTS DATA
  ============================ */
  useEffect(() => {
    const fetchTopProducts = async () => {
      const snap = await getDocs(collection(db, 'orderItems'));
      const map: Record<
        string,
        { sales: number; revenue: number }
      > = {};

      snap.forEach((doc) => {
        const data = doc.data();
        const name = data.productName;

        if (!map[name]) {
          map[name] = { sales: 0, revenue: 0 };
        }

        map[name].sales += data.quantity || 0;
        map[name].revenue +=
          (data.price || 0) * (data.quantity || 0);
      });

      setTopProductsData(
        Object.entries(map).map(([name, values]) => ({
          name,
          ...values,
        }))
      );
    };

    fetchTopProducts();
  }, []);

  /* ===========================
     INVENTORY ALERTS (LIVE)
  ============================ */
  useEffect(() => {
    const q = query(
      collection(db, 'inventory'),
      where('stock', '<=', 5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const alerts: InventoryAlert[] = [];
      snap.forEach((doc) =>
        alerts.push({ id: doc.id, ...(doc.data() as any) })
      );
      setInventoryAlerts(alerts);
    });

    return () => unsub();
  }, []);

  return (
    <>
      {/* JSX stays exactly as documented */}
    </>
  );
};

export default DashboardView;
