import { useState, useEffect } from 'react';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
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
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
      ]);

      const revenue =
        revenueResult.data?.reduce(
          (sum, order) => sum + Number(order.total_amount),
          0
        ) || 0;

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-50 mb-6 sm:mb-8">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            label: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
          },
          {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue, 'UGX'),
            icon: DollarSign,
          },
          {
            label: 'Pending Orders',
            value: stats.pendingOrders,
            icon: TrendingUp,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-amber-300 mb-1">
                {label}
              </p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-amber-50 truncate">
                {value}
              </p>
            </div>

            <div className="flex-shrink-0 bg-amber-900/50 p-2 sm:p-3 rounded-full">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 sm:mt-8 bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-amber-50 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Manage Products',
              desc: 'Add, edit, or remove products from your inventory',
            },
            {
              title: 'Process Orders',
              desc: 'View and update order statuses',
            },
            {
              title: 'Manage Collections',
              desc: 'Create and manage perfume collections shown on the website',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-4 rounded-lg border border-gray-700 hover:border-amber-600 transition-colors cursor-pointer"
            >
              <h3 className="font-semibold text-amber-50 mb-2 text-sm sm:text-base">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-amber-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
