import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getTransactionStatus } from '../../lib/pesapal';

export function PaymentResult() {
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePaymentResult = async () => {
      // Parse query parameters from Pesapal redirect
      const queryParams = new URLSearchParams(location.search);
      const orderTrackingId = queryParams.get('OrderTrackingId');
      const orderIdParam = queryParams.get('order_id'); // Custom parameter we added
      
      if (!orderTrackingId || !orderIdParam) {
        setPaymentSuccess(false);
        setLoading(false);
        return;
      }

      setOrderId(orderIdParam);

      try {
        // Get transaction status from Pesapal
        const statusResponse = await getTransactionStatus(orderTrackingId);
        
        // Update order status in our database based on Pesapal response
        const newStatus = 
          statusResponse.status === 'COMPLETED' ? 'completed' :
          statusResponse.status === 'FAILED' ? 'failed' :
          statusResponse.status === 'PENDING' ? 'pending' : 'cancelled';
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', parseInt(orderIdParam));
          
        if (updateError) {
          console.error('Error updating order status:', updateError);
        }
        
        setPaymentSuccess(statusResponse.status === 'COMPLETED');
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    handlePaymentResult();
  }, [location]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center border border-amber-900/50">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-amber-50 mb-2">Processing Payment</h2>
          <p className="text-amber-200">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md w-full text-center border border-amber-900/50">
        {paymentSuccess ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/20 mb-4">
              <Check className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-50 mb-2">Payment Successful!</h2>
            <p className="text-amber-200 mb-6">
              Your order #{orderId} has been confirmed. A confirmation email has been sent to you.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-amber-50 mb-2">Payment Failed</h2>
            <p className="text-amber-200 mb-6">
              We couldn't process your payment. Please try again or contact support.
            </p>
          </>
        )}
        
        <button
          onClick={handleContinueShopping}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}