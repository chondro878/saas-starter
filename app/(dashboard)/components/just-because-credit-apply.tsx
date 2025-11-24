'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Sparkles, CreditCard, ArrowRight, Check } from 'lucide-react';
import { Team } from '@/lib/db/schema';
import { getJustBecauseLabel } from '@/lib/just-because-utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface JustBecauseRecipient {
  id: number;
  firstName: string;
  lastName: string;
  partnerFirstName: string | null;
  partnerLastName: string | null;
  relationship: string;
  occasionId: number;
  cardVariation: string | null;
  computedSendDate: Date | null;
}

export function JustBecauseCreditApply() {
  const { data: team, mutate: mutateTeam } = useSWR<Team>('/api/team', fetcher);
  const { data: justBecauseRecipients, mutate: mutateRecipients } = useSWR<JustBecauseRecipient[]>(
    '/api/just-because/recipients',
    fetcher
  );

  const [selectedOccasionId, setSelectedOccasionId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cardCredits = team?.cardCredits || 0;
  const hasRecipients = justBecauseRecipients && justBecauseRecipients.length > 0;

  const handleApplyCredit = async () => {
    if (!selectedOccasionId) {
      setErrorMessage('Please select a recipient');
      return;
    }

    if (cardCredits < 1) {
      setErrorMessage('You need at least 1 card credit to apply');
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/just-because/apply-credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasionId: selectedOccasionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply credit');
      }

      const selectedRecipient = justBecauseRecipients?.find(
        (r) => r.occasionId === selectedOccasionId
      );
      
      const recipientName = selectedRecipient
        ? `${selectedRecipient.firstName} ${selectedRecipient.lastName}`
        : 'recipient';

      setSuccessMessage(`🎉 Credit applied! ${recipientName} will receive their card.`);
      setSelectedOccasionId(null);

      // Refresh data
      mutateTeam();
      mutateRecipients();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('Error applying credit:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to apply credit. Please try again.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Don't show the component if no Just Because recipients exist
  if (!hasRecipients) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-2xl p-6 sm:p-8 mb-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl font-light text-gray-900">
              Apply Credit to "Just Because"
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-700 mb-2">
            Use a card credit for a surprise "Just Because" card
          </p>
          <p className="text-sm text-gray-600">
            Send an unexpected card to someone special – we'll handle the timing!
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* Selection and Apply */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* Recipient Dropdown */}
          <div className="flex-1">
            <label htmlFor="recipient-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Recipient
            </label>
            <select
              id="recipient-select"
              value={selectedOccasionId || ''}
              onChange={(e) => {
                setSelectedOccasionId(e.target.value ? Number(e.target.value) : null);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-900"
              disabled={isApplying}
            >
              <option value="">Choose a recipient...</option>
              {justBecauseRecipients?.map((recipient) => {
                const fullName = recipient.partnerFirstName
                  ? `${recipient.firstName} & ${recipient.partnerFirstName} ${recipient.lastName}`
                  : `${recipient.firstName} ${recipient.lastName}`;
                
                const cardLabel = getJustBecauseLabel(recipient.relationship);

                return (
                  <option key={recipient.occasionId} value={recipient.occasionId}>
                    {fullName} - {cardLabel}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Apply Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleApplyCredit}
              disabled={isApplying || !selectedOccasionId || cardCredits < 1}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-base font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Use 1 Credit
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Credit Info */}
        <div className="flex items-center justify-between pt-4 border-t border-purple-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Available Credits:</span>{' '}
            <span className="font-semibold text-purple-700">{cardCredits}</span>
          </div>
          <div className="text-xs text-gray-500">
            Card will be sent automatically on a surprise date
          </div>
        </div>
      </div>
    </section>
  );
}

