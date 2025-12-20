import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../components/admin/Dashboard';
import { ProductManagement } from '../components/admin/ProductManagement';
import { OrderManagement } from '../components/admin/OrderManagement';
import { JournalManagement } from '../components/admin/JournalManagement';

interface AdminProps {
  onBackToStore: () => void;
}

export function Admin({ onBackToStore }: AdminProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine current page based on URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/admin/products')) return 'products';
    if (path.includes('/admin/orders')) return 'orders';
    if (path.includes('/admin/journal')) return 'journal';
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'orders' | 'journal'>(getCurrentPage());
  const [loading, setLoading] = useState(true);

  // Update currentPage when location changes
  useEffect(() => {
    setCurrentPage(getCurrentPage());
  }, [location]);

  useEffect(() => {
    // Simulate loading or initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePageChange = (page: 'dashboard' | 'products' | 'orders' | 'journal') => {
    setCurrentPage(page);
    // Navigate to the appropriate URL
    switch (page) {
      case 'products':
        navigate('/admin/products');
        break;
      case 'orders':
        navigate('/admin/orders');
        break;
      case 'journal':
        navigate('/admin/journal');
        break;
      default:
        navigate('/admin');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'journal':
        return <JournalManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout 
      currentPage={currentPage} 
      onPageChange={handlePageChange}
      onBackToStore={onBackToStore}
    >
      {renderPage()}
    </AdminLayout>
  );
}