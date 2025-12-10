import { useState } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Dashboard } from '../components/admin/Dashboard';
import { ProductManagement } from '../components/admin/ProductManagement';
import { OrderManagement } from '../components/admin/OrderManagement';

interface AdminProps {
  onBackToStore: () => void;
}

export function Admin({ onBackToStore }: AdminProps) {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'orders'>('dashboard');

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onBackToStore={onBackToStore}
    >
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'products' && <ProductManagement />}
      {currentPage === 'orders' && <OrderManagement />}
    </AdminLayout>
  );
}
