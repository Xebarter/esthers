import { useState } from 'react';
import { Product, formatCurrency } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Check, X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
    <>
      <div 
        className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-purple-100 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
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
              {formatCurrency(product.price)}
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
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
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

      {/* Product Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              >
                <X className="h-6 w-6 text-gray-800" />
              </button>

              <div className="grid md:grid-cols-2 gap-8 p-6">
                {/* Product Image */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="object-contain w-full h-full max-h-96"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
                    <p className="text-lg text-gray-600 mt-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatCurrency(product.price)}
                    </p>
                    <p className={`text-lg font-medium ${product.stock > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </p>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <label className="block text-lg font-semibold text-purple-800 mb-3">Size</label>
                    <div className="grid grid-cols-4 gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 px-4 rounded-xl font-medium transition-all ${
                            selectedSize === size
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selector */}
                  <div>
                    <label className="block text-lg font-semibold text-purple-800 mb-3">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`py-3 px-4 rounded-xl font-medium transition-all ${
                            selectedColor === color
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
                      product.stock === 0
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}