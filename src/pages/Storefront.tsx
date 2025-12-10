import { useState } from 'react';
import { Header } from '../components/storefront/Header';
import { ProductGrid } from '../components/storefront/ProductGrid';
import { Cart } from '../components/storefront/Cart';
import { Checkout } from '../components/storefront/Checkout';
import { Footer } from '../components/storefront/Footer';

export function Storefront() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setShowCart(true)} />
      <ProductGrid />
      <Footer />
      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={handleCheckout}
      />
      <Checkout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </div>
  );
}
