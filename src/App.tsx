import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { CartProvider } from './contexts/CartContext';
import { Storefront } from './pages/Storefront';
import { Admin } from './pages/Admin';
import { ProductDetails } from './components/storefront/ProductDetails';
import { Header } from './components/storefront/Header';
import { Footer } from './components/storefront/Footer';
import { Cart } from './components/storefront/Cart';
import { Checkout } from './components/storefront/Checkout';
import { About } from './components/storefront/About';
import { Journal } from './components/storefront/Journal';
import { JournalPost } from './components/storefront/JournalPost';
import { PaymentResult } from './components/storefront/PaymentResult';

function ProductDetailsPage() {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onCartClick={() => setShowCart(true)} />
      <ProductDetails />
      <Footer />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {}}
      />
    </div>
  );
}

function AboutPage() {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onCartClick={() => setShowCart(true)} />
      <About />
      <Footer />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {}}
      />
    </div>
  );
}

function JournalPage() {
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <Journal />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {}}
      />
    </>
  );
}

function JournalPostPage() {
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <JournalPost />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {}}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Storefront />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/journal/:slug" element={<JournalPostPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/admin/*" element={<Admin onBackToStore={() => window.history.back()} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;