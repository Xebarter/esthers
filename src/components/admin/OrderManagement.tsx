import { useState, useEffect } from 'react';
import { Eye, Truck, X } from 'lucide-react';
import { supabase, Order, formatCurrency } from '../../lib/supabase';

interface OrderWithDetails extends Order {
  customer: Customer;
  items: Array<OrderItem & { product: Product }>;
}

export function OrderManagement() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          const [customerResult, itemsResult] = await Promise.all([
            supabase.from('customers').select('*').eq('id', order.customer_id).single(),
            supabase.from('order_items').select('*').eq('order_id', order.id),
          ]);

          const itemsWithProducts = await Promise.all(
            (itemsResult.data || []).map(async (item) => {
              const { data: product } = await supabase
                .from('products')
                .select('*')
                .eq('id', item.product_id)
                .single();
              return { ...item, product: product! };
            })
          );

          return {
            ...order,
            customer: customerResult.data!,
            items: itemsWithProducts,
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setShowDetails(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  }

  function viewOrderDetails(order: OrderWithDetails) {
    setSelectedOrder(order);
    setShowDetails(true);
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: <span className="font-semibold">{orders.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">
                  {order.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                  <div className="text-sm text-gray-500">{order.customer.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {formatCurrency(order.total_amount)}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDetails && selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDetails(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedOrder.customer.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedOrder.customer.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedOrder.customer.phone}</p>
                      <p><span className="font-medium">Address:</span> {selectedOrder.customer.address}</p>
                      <p>
                        <span className="font-medium">City:</span> {selectedOrder.customer.city}, {selectedOrder.customer.postal_code}
                      </p>
                      <p><span className="font-medium">Country:</span> {selectedOrder.customer.country}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                      <p><span className="font-medium">Total Amount:</span> ${selectedOrder.total_amount.toFixed(2)}</p>
                      <p>
                        <span className="font-medium">Status:</span>{' '}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Size: {item.size} | Color: {item.color}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Order Status</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'pending')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Processing
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Shipped
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Delivered
                    </button>
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
