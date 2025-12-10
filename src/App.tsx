import { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import { Storefront } from './pages/Storefront';
import { Admin } from './pages/Admin';

function App() {
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('storefront');
    }
  }, []);

  const navigateTo = (view: 'storefront' | 'admin') => {
    setCurrentView(view);
    window.history.pushState({}, '', view === 'admin' ? '/admin' : '/');
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentView(path === '/admin' ? 'admin' : 'storefront');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <CartProvider>
      {currentView === 'admin' ? (
        <Admin onBackToStore={() => navigateTo('storefront')} />
      ) : (
        <Storefront />
      )}
    </CartProvider>
  );
}

export default App;
