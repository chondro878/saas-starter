'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: number;
  recipientFirstName: string;
  recipientLastName: string;
  occasionType: string;
  occasionDate: Date;
  createdAt: Date;
  mailDate: Date | null;
  status: string;
  cardType: string;
}

interface OrderSectionProps {
  title: string;
  orders: Order[];
  emptyMessage: string;
  ctaText: string;
  ctaLink: string;
  badgeColor: string;
  defaultOpen?: boolean;
}

export function OrderSection({ 
  title, 
  orders, 
  emptyMessage, 
  ctaText, 
  ctaLink, 
  badgeColor,
  defaultOpen = true 
}: OrderSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <span className={`px-3 py-1 rounded text-sm font-medium ${badgeColor}`}>
            {orders.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          {orders.length === 0 ? (
            <div className="text-center py-12 border-t border-gray-200">
              <p className="text-gray-500 text-lg mb-4">{emptyMessage}</p>
              <Link
                href={ctaLink}
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                {ctaText}
              </Link>
            </div>
          ) : (
            <div className="space-y-3 border-t border-gray-200 pt-6">
              {orders.map(order => (
                <div key={order.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {order.recipientFirstName} {order.recipientLastName}
                        </p>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm font-medium text-gray-700">
                          {order.occasionType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Occasion Date: {new Date(order.occasionDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.mailDate && (
                          <p className="text-xs text-gray-500">
                            Mailed: {new Date(order.mailDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    mailed: { 
      bg: 'bg-green-100', 
      text: 'text-green-800', 
      label: 'Sent' 
    },
    printed: { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-800', 
      label: 'Printed' 
    },
    pending: { 
      bg: 'bg-blue-100', 
      text: 'text-blue-800', 
      label: 'Pending' 
    },
    cancelled: { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800', 
      label: 'Cancelled' 
    },
  }[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800', 
    label: status 
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
      {statusConfig.label}
    </span>
  );
}

