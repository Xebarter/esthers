import { useState } from 'react';
import { Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select a size and color');
      return;
    }

    addToCart(product, selectedSize, selectedColor, 1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-purple-100">
      {/* Image Container */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Featured Badge */}
        {product.featured && (
          <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            Featured
          </span>
        )}

        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Stock */}
        <div className="flex items-center justify-between">
          <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </p>
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-purple-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </p>
        </div>

        {/* Size Selector */}
        <div>
          <label className="block text-sm font-semibold text-purple-800 mb-2">Size</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-purple-50/50 text-gray-800 font-medium"
          >
            {product.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Color Selector */}
        <div>
          <label className="block text-sm font-semibold text-purple-800 mb-2">Color</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all bg-purple-50/50 text-gray-800 font-medium"
          >
            {product.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${product.stock === 0
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : showSuccess
              ? 'bg-green-600 text-white shadow-green-200'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transform hover:-translate-y-1'
            }`}
        >
          {showSuccess ? (
            <>
              <Check className="h-6 w-6" />
              Added to Cart!
            </>
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="h-6 w-6" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-ping once">
            <div className="w-32 h-32 bg-green-400 rounded-full opacity-20" />
          </div>
        </div>
      )}
    </div>
  );
}