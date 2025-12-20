import { useState, FormEvent } from 'react';
import { X, Check } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase, formatCurrency } from '../../lib/supabase';
import { submitOrder, formatOrderData, getTransactionStatus } from '../../lib/pesapal';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Checkout({ isOpen, onClose }: CheckoutProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pesapal' | 'cash'>('pesapal');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'pesapal') {
      handlePesapalPayment(e);
    } else {
      handleSubmit(e);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handlePesapalPayment = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if customer already exists by email
      let customer;
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Some other error occurred
        throw fetchError;
      }

      if (existingCustomer) {
        // Customer exists, use existing customer data but update with form data
        customer = existingCustomer;
        
        // Update customer info with latest data from form
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          })
          .eq('id', customer.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        customer = updatedCustomer;
      } else {
        // Customer does not exist, create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          })
          .select()
          .single();

        if (insertError) {
          // Handle unique constraint violation by trying to fetch the customer again
          if (insertError.code === '23505') { // Unique violation error code
            const { data: fetchedCustomer, error: fetchError } = await supabase
              .from('customers')
              .select('*')
              .eq('email', formData.email)
              .single();
            
            if (fetchError) throw fetchError;
            customer = fetchedCustomer;
            
            // Update the existing customer with the new information
            const { data: updatedCustomer, error: updateError } = await supabase
              .from('customers')
              .update({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postal_code: formData.postalCode,
                country: formData.country,
              })
              .eq('id', customer.id)
              .select()
              .single();
              
            if (updateError) throw updateError;
            customer = updatedCustomer;
          } else {
            // If it's another kind of error, rethrow it
            throw insertError;
          }
        } else {
          customer = newCustomer;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: getTotalPrice(),
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        volume_ml: item.product.volume_ml,  // Adding the required volume_ml field
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Prepare order data for Pesapal
      const returnUrl = `${window.location.origin}/payment-result`;
      const pesapalOrderData = formatOrderData(order, customer, items, returnUrl);
      
      // Submit order to Pesapal
      const pesapalResponse = await submitOrder(pesapalOrderData);
      
      // Redirect to Pesapal payment page
      if (pesapalResponse.redirect_url) {
        window.location.href = pesapalResponse.redirect_url;
      } else {
        throw new Error('Failed to get redirect URL from Pesapal');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      // Provide more specific error messages
      if (error.message) {
        alert(`Failed to place order: ${error.message}. Please check your information and try again.`);
      } else {
        alert('Failed to place order. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if customer already exists by email
      let customer;
      const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Some other error occurred
        throw fetchError;
      }

      if (existingCustomer) {
        // Customer exists, use existing customer data but update with form data
        customer = existingCustomer;
        
        // Update customer info with latest data from form
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          })
          .eq('id', customer.id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        customer = updatedCustomer;
      } else {
        // Customer does not exist, create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
          })
          .select()
          .single();

        if (insertError) {
          // Handle unique constraint violation by trying to fetch the customer again
          if (insertError.code === '23505') { // Unique violation error code
            const { data: fetchedCustomer, error: fetchError } = await supabase
              .from('customers')
              .select('*')
              .eq('email', formData.email)
              .single();
            
            if (fetchError) throw fetchError;
            customer = fetchedCustomer;
            
            // Update the existing customer with the new information
            const { data: updatedCustomer, error: updateError } = await supabase
              .from('customers')
              .update({
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                postal_code: formData.postalCode,
                country: formData.country,
              })
              .eq('id', customer.id)
              .select()
              .single();
              
            if (updateError) throw updateError;
            customer = updatedCustomer;
          } else {
            // If it's another kind of error, rethrow it
            throw insertError;
          }
        } else {
          customer = newCustomer;
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total_amount: getTotalPrice(),
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        volume_ml: item.product.volume_ml,  // Adding the required volume_ml field
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderPlaced(true);
      clearCart();

      setTimeout(() => {
        setOrderPlaced(false);
        onClose();
        setFormData({
          name: '', email: '', phone: '', address: '',
          city: '', postalCode: '', country: '',
        });
      }, 4000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success Screen
  if (orderPlaced) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-8 max-w-md w-full my-8 border border-amber-900/50">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-4">
                <Check className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-amber-50 mb-4">Order Confirmed</h2>
              <p className="text-amber-100 mb-6">
                Thank you for your purchase. A confirmation has been sent to your email.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      {/* Changed to flex layout with column direction on mobile */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-none sm:rounded-2xl shadow-2xl max-w-2xl w-full my-0 sm:my-8 border-0 sm:border border-amber-900/50 flex flex-col h-screen sm:h-auto">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-50">Checkout</h2>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-amber-500 hover:text-amber-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pesapal')}
                  className={`p-4 rounded-lg border-2 ${
                    paymentMethod === 'pesapal'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-amber-500'
                  }`}
                >
                  <div className="font-medium text-amber-50">Pay with Pesapal</div>
                  <div className="text-sm text-amber-200">Credit Card, Mobile Money, etc.</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-lg border-2 ${
                    paymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-gray-700 hover:border-amber-500'
                  }`}
                >
                  <div className="font-medium text-amber-50">Cash on Delivery</div>
                  <div className="text-sm text-amber-200">Pay when you receive your order</div>
                </button>
              </div>
            </div>

            {/* Added max-height and overflow for the form */}
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                  Shipping Information
                </h3>
              </div>

              <div>
                <label htmlFor="name" className="block text-amber-100 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-amber-100 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-amber-100 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-amber-100 text-sm font-medium mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-amber-100 text-sm font-medium mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-amber-100 text-sm font-medium mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="country" className="block text-amber-100 text-sm font-medium mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <h3 className="text-lg font-semibold text-amber-50 mb-4 border-b border-amber-900/50 pb-2">
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                      <img
                        src={item.product.image_url || 'https://placehold.co/100'}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-50">{item.product.name}</h4>
                        <p className="text-amber-200 text-sm">
                          {item.product.volume_ml}ml • {formatCurrency(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-amber-50 font-medium">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-amber-900/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-200">Subtotal</span>
                    <span className="text-amber-50">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-amber-200">Shipping</span>
                    <span className="text-amber-50">Free</span>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-amber-900/50">
                    <span className="text-amber-50 font-bold text-lg">Total</span>
                    <span className="text-amber-50 font-bold text-xl">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 mt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-4 px-6 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </span>
                  ) : paymentMethod === 'pesapal' ? (
                    'Proceed to Payment'
                  ) : (
                    'Complete Purchase'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}