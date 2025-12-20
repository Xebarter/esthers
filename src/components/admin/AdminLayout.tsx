import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BookOpen, 
  LogOut, 
  Tag,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { JournalManagement } from './JournalManagement';
import { CategoriesManagement } from './CategoriesManagement';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'products' | 'orders' | 'journal';
  onPageChange: (page: 'dashboard' | 'products' | 'orders' | 'journal') => void;
  onBackToStore: () => void;
}

export function AdminLayout({
  children,
  currentPage,
  onPageChange,
  onBackToStore
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(currentPage);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-amber-50 shadow-xl">
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
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-900 text-amber-50 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo & Title - Desktop */}
        <div className="hidden lg:flex items-center gap-3 p-6 border-b border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-50">Alethea</h1>
            <p className="text-xs text-amber-300">Admin Panel</p>
          </div>
        </div>

        {/* Mobile Title (when menu open) */}
        <div className="lg:hidden flex items-center gap-3 p-6 border-b border-gray-700">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg flex items-center justify-center font-bold text-xl">
            A
          </div>
          <h1 className="text-2xl font-bold text-amber-50">Alethea Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              activeSection === 'dashboard'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <LayoutDashboard className="mr-3 h-6 w-6" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveSection('products')}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              activeSection === 'products'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Package className="mr-3 h-6 w-6" />
            Products
          </button>

          <button
            onClick={() => setActiveSection('categories')}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              activeSection === 'categories'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Tag className="mr-3 h-6 w-6" />
            Categories
          </button>

          <button
            onClick={() => setActiveSection('orders')}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              activeSection === 'orders'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <ShoppingCart className="mr-3 h-6 w-6" />
            Orders
          </button>

          <button
            onClick={() => setActiveSection('journal')}
            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              activeSection === 'journal'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <BookOpen className="mr-3 h-6 w-6" />
            Journal
          </button>
        </nav>

        {/* Back to Store Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onBackToStore}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
          >
            <Home className="h-5 w-5 text-amber-300 group-hover:text-amber-400" />
            <span className="font-medium text-amber-200 group-hover:text-amber-50">Back to Store</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-gray-900 border-b border-gray-700 px-8 py-5 shadow-sm">
          <h2 className="text-2xl font-bold text-amber-50 capitalize">
            {activeSection}
          </h2>
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Home className="h-4 w-4" />
            Back to Store
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'products' && <ProductManagement />}
          {activeSection === 'categories' && <CategoriesManagement />}
          {activeSection === 'orders' && <OrderManagement />}
          {activeSection === 'journal' && <JournalManagement />}
        </main>
      </div>
    </div>
  );
}