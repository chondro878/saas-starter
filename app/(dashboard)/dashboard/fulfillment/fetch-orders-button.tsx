'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function FetchOrdersButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleFetchOrders = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/orders/fetch-recent', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (data.created > 0) {
        setMessage(`✓ Created ${data.created} new order${data.created !== 1 ? 's' : ''}`);
      } else {
        setMessage('All orders up to date');
      }

      // Refresh the page to show new orders
      router.refresh();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setMessage('✗ Failed to fetch orders');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleFetchOrders}
        disabled={isLoading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Fetching...' : 'Fetch Recent Orders'}
      </button>
      {message && (
        <span className={`text-sm font-medium ${
          message.startsWith('✓') ? 'text-green-600' : 
          message.startsWith('✗') ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {message}
        </span>
      )}
    </div>
  );
}

