import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Home,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: 'dashboard' | 'products' | 'orders';
  onPageChange: (page: 'dashboard' | 'products' | 'orders') => void;
  onBackToStore: () => void;
}

export function AdminLayout({
  children,
  currentPage,
  onPageChange,
  onBackToStore
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white shadow-xl">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Alethea Admin</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Mobile & Desktop */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo & Title - Desktop */}
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold">Alethea</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        {/* Mobile Title (when menu open) */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold">Alethea Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:text-purple-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Back to Store Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
          >
            <Home className="h-5 w-5 text-gray-400 group-hover:text-purple-400" />
            <span className="font-medium text-gray-300 group-hover:text-white">Back to Store</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-5 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {currentPage}
          </h2>
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Back to Store
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pt-20 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}