'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Order } from '@/lib/db/schema';

interface SentOrdersSectionProps {
  sentOrders: Order[];
}

export function SentOrdersSection({ sentOrders }: SentOrdersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on search query
  const filteredOrders = sentOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${order.recipientFirstName} ${order.recipientLastName}`.toLowerCase();
    const occasionType = order.occasionType.toLowerCase();
    const city = order.recipientCity.toLowerCase();
    const state = order.recipientState.toLowerCase();
    
    return (
      fullName.includes(query) ||
      occasionType.includes(query) ||
      city.includes(query) ||
      state.includes(query)
    );
  });

  if (sentOrders.length === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">
          Sent Orders ({sentOrders.length})
        </h2>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, occasion, city, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No orders match your search</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-start justify-between bg-white p-4 rounded shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">
                    {order.recipientFirstName} {order.recipientLastName}
                  </p>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-700">
                    {order.occasionType}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    order.cardType === 'subscription' ? 'bg-green-100 text-green-800' :
                    order.cardType === 'bulk' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.cardType === 'subscription' ? 'Subscription' :
                     order.cardType === 'bulk' ? 'Bulk Pack' :
                     'Individual'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  {order.recipientCity}, {order.recipientState} {order.recipientZip}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                  <span>
                    Occasion: {new Date(order.occasionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {order.mailDate && (
                    <span>
                      Mailed: {new Date(order.mailDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="ml-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                  Sent
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

