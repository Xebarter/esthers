import { useState } from 'react';
import { Product, formatCurrency } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when adding to cart
    addToCart(product, 1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div 
      className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image container with gradient overlay */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
        
        {/* Badge for featured/new/limited products */}
        {(product.featured || product.is_new || product.is_limited) && (
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full text-black ${
              product.is_limited ? 'bg-yellow-400' : 
              product.is_new ? 'bg-amber-300' : 
              'bg-amber-300'
            }`}>
              {product.is_limited ? 'Limited' : 
               product.is_new ? 'New' : 
               'Featured'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-amber-50 group-hover:text-amber-300 transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-amber-300 text-sm">
            {product.concentration}
          </p>
        </div>

        {/* Price and volume */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-amber-50">
              {formatCurrency(product.price)}
            </p>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <p className="text-sm text-amber-300 line-through">
                {formatCurrency(product.compare_at_price)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-amber-300 text-sm">{product.volume_ml}ml</p>
            <p className="text-amber-300 text-sm">{product.stock} in stock</p>
          </div>
        </div>

        {/* CTA Button - now adds to cart instead of navigating */}
        <button 
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold py-3 px-6 rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Added to Cart
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
}