import { ReactNode } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'products' | 'orders';
  onPageChange: (page: 'dashboard' | 'products' | 'orders') => void;
  onBackToStore: () => void;
}

export function AdminLayout({ children, currentPage, onPageChange, onBackToStore }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Esther's Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Footwear Management</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => onPageChange('dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>

          <button
            onClick={() => onPageChange('products')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentPage === 'products'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Package className="h-5 w-5" />
            Products
          </button>

          <button
            onClick={() => onPageChange('orders')}
            className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
              currentPage === 'orders'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            Orders
          </button>

          <div className="border-t border-gray-700 mt-6 pt-6">
            <button
              onClick={onBackToStore}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              <Home className="h-5 w-5" />
              Back to Store
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
