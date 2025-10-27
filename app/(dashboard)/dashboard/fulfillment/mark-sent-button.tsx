'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface MarkAsSentButtonProps {
  orderId: number;
  compact?: boolean;
}

export function MarkAsSentButton({ orderId, compact = false }: MarkAsSentButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkSent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/mark-sent`, {
        method: 'POST',
      });

      if (response.ok) {
        router.refresh();
      } else {
        console.error('Failed to mark order as sent');
      }
    } catch (error) {
      console.error('Error marking order as sent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleMarkSent}
        disabled={isLoading}
        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '...' : '✅ Sent'}
      </button>
    );
  }

  return (
    <button
      onClick={handleMarkSent}
      disabled={isLoading}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
    >
      {isLoading ? 'Marking...' : '✅ Mark as Sent'}
    </button>
  );
}

