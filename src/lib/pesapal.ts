import { formatCurrency } from './supabase';

// Environment variables - should be set in .env file
const PESAPAL_BASE_URL = import.meta.env.VITE_PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3';
const PESAPAL_CONSUMER_KEY = import.meta.env.VITE_PESAPAL_CONSUMER_KEY || '';
const PESAPAL_CONSUMER_SECRET = import.meta.env.VITE_PESAPAL_CONSUMER_SECRET || '';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Get access token from Pesapal API
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the token and set expiry (typically 5 minutes)
    cachedToken = data.token;
    tokenExpiry = Date.now() + (data.expiryDate - Date.now()) * 0.9; // Refresh before actual expiry
    
    return data.token;
  } catch (error) {
    console.error('Error getting Pesapal access token:', error);
    throw error;
  }
}

/**
 * Submit order to Pesapal
 */
export async function submitOrder(orderData: {
  id: string;
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  notification_id: string;
  billing_address?: {
    email_address: string;
    phone_number: string;
    country_code: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    line_1: string;
    line_2: string;
    city: string;
    state: string;
    postal_code: string;
    zip_code: string;
  };
}) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit order: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting order to Pesapal:', error);
    throw error;
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(orderTrackingId: string) {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting transaction status from Pesapal:', error);
    throw error;
  }
}

/**
 * Format order data for Pesapal submission
 */
export function formatOrderData(order: any, customer: any, items: any[], returnUrl: string) {
  // Extract country code from country name if possible, or use a default
  let countryCode = '';
  if (customer.country) {
    // Simple mapping for common countries - you may need to expand this
    const countryMap: Record<string, string> = {
      'kenya': 'KE',
      'uganda': 'UG',
      'tanzania': 'TZ',
      'rwanda': 'RW',
      'usa': 'US',
      'united states': 'US',
      'united kingdom': 'GB',
      'uk': 'GB'
    };
    
    const lowerCountry = customer.country.toLowerCase().trim();
    countryCode = countryMap[lowerCountry] || customer.country.substring(0, 2).toUpperCase();
  }
  
  // Ensure we have a proper state/province
  const state = customer.city || '';
  
  // Split name properly
  const nameParts = customer.name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
  const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

  return {
    id: order.id.toString(),
    currency: 'KES', // Kenyan Shillings - change as needed
    amount: order.total_amount,
    description: `Order #${order.id} for ${items.length} items`,
    callback_url: returnUrl,
    notification_id: order.id.toString(),
    billing_address: {
      email_address: customer.email,
      phone_number: customer.phone || '',
      country_code: countryCode,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      line_1: customer.address || '',
      line_2: '',
      city: customer.city || '',
      state: state,
      postal_code: customer.postal_code || '',
      zip_code: customer.postal_code || '',
    }
  };
}
