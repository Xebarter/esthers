import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';
import { supabase, formatCurrency } from '../../lib/supabase';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [productsResult, ordersResult, revenueResult, pendingResult] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount'),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const revenue = revenueResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue: revenue,
        pendingOrders: pendingResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue, 'UGX')}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove products from your inventory</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Process Orders</h3>
            <p className="text-sm text-gray-600">View and update order statuses</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600">Track sales and performance metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}
