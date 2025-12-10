import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-500 translate-x-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-white" />
            <h2 className="text-2xl font-bold text-white">Your Cart</h2>
            <span className="ml-2 bg-white/30 text-white text-sm font-bold px-3 py-1 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50/50 to-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-16 w-16 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Looks like you haven&apos;t added anything yet.</p>
              <p className="text-purple-600 font-medium mt-4">Start shopping now!</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="bg-white rounded-2xl shadow-md border border-purple-100 p-5 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl shadow-md"
                      />
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {item.quantity}x
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{item.product.name}</h3>
                      <div className="flex gap-3 mt-1 text-sm text-purple-700 font-medium">
                        <span>Size: {item.selectedSize}</span>
                        <span>•</span>
                        <span>Color: {item.selectedColor}</span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-purple-50 rounded-full px-4 py-2">
                          <button
                            onClick={() => updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity - 1
                            )}
                            className="p-1 hover:bg-purple-200 rounded-full transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4 text-purple-700" />
                          </button>
                          <span className="font-bold text-purple-800 w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor,
                              item.quantity + 1
                            )}
                            className="p-1 hover:bg-purple-200 rounded-full transition-colors"
                          >
                            <Plus className="h-4 w-4 text-purple-700" />
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="text-right">
                          <p className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor
                            )}
                            className="mt-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Total & Checkout */}
        {items.length > 0 && (
          <div className="border-t-2 border-purple-100 bg-white p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total:</span>
              <span className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ${getTotalPrice().toFixed(2)}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg py-5 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 transition-all duration-300 shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingBag className="h-6 w-6" />
              Proceed to Checkout
            </button>

            <p className="text-center text-xs text-gray-500">
              Free delivery on orders over $100 • Secure checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}