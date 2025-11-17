'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Plus, X, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { User, UserAddress } from '@/lib/db/schema';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/browserClient';
import { US_STATES } from '@/lib/us-states';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StripeBillingResponse {
  billingAddress: {
    street: string;
    apartment: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  } | null;
}

export default function AccountSettingsPage() {
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);
  const { data: addresses, error, isLoading, mutate } = useSWR<UserAddress[]>('/api/addresses', fetcher);
  const { data: stripeBilling } = useSWR<StripeBillingResponse>('/api/stripe-billing', fetcher);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isEditingAddress, setIsEditingAddress] = useState<number | null>(null);
  const [editingAddressData, setEditingAddressData] = useState<{
    street: string;
    apartment: string;
    city: string;
    state: string;
    zip: string;
  } | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for adding new address
  const [newAddress, setNewAddress] = useState({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
  });

  // Address validation state
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean;
    result: any | null;
    showSuggestion: boolean;
  }>({
    isValidating: false,
    result: null,
    showSuggestion: false,
  });

  const handleChangePassword = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      alert('Failed to send password reset email. Please try again.');
    }
  };

  const handleEditPersonal = () => {
    setPersonalData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setIsEditingPersonal(true);
  };

  const handleSavePersonal = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await mutateUser();
      setIsEditingPersonal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateAddressFields = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      return;
    }

    setAddressValidation({ isValidating: true, result: null, showSuggestion: false });

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const result = await response.json();
        setAddressValidation({
          isValidating: false,
          result,
          showSuggestion: result.verdict === 'CORRECTABLE' || result.verdict === 'UNDELIVERABLE',
        });
      }
    } catch (error) {
      console.error('Address validation failed:', error);
      setAddressValidation({ isValidating: false, result: null, showSuggestion: false });
    }
  };

  const applySuggestedAddress = () => {
    if (addressValidation.result?.suggestedAddress) {
      setNewAddress(addressValidation.result.suggestedAddress);
      setAddressValidation({ ...addressValidation, showSuggestion: false });
    }
  };

  const handleEditAddress = (address: UserAddress) => {
    setIsEditingAddress(address.id);
    setEditingAddressData({
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
    });
  };

  const handleUpdateAddress = async () => {
    if (!isEditingAddress || !editingAddressData) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/addresses/${isEditingAddress}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingAddressData,
          country: 'United States',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      await mutate();
      setIsEditingAddress(null);
      setEditingAddressData(null);
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      await mutate();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const handleSaveAddress = async () => {
    // Check if address has been validated
    if (!addressValidation.result) {
      alert('Please validate the address first.');
      return;
    }
    
    // Don't proceed if address is undeliverable
    if (addressValidation.result?.verdict === 'UNDELIVERABLE') {
      alert('Please correct the address before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAddress,
          country: 'United States', // Default to US
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      await mutate();
      setIsAddingAddress(false);
      setNewAddress({
        street: '',
        apartment: '',
        city: '',
        state: '',
        zip: '',
      });
      setAddressValidation({ isValidating: false, result: null, showSuggestion: false });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-5xl">
      {/* Personal Details Section */}
      <div className="bg-gray-100 rounded-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-2xl font-medium text-gray-900">Personal details</h2>
          {!isEditingPersonal && (
            <button 
              className="text-gray-900 underline hover:text-gray-700 transition-colors"
              onClick={handleEditPersonal}
            >
              Edit
            </button>
          )}
        </div>

        {isEditingPersonal ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={personalData.firstName}
                  onChange={(e) => setPersonalData({ ...personalData, firstName: e.target.value })}
                  className="mt-1"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={personalData.lastName}
                  onChange={(e) => setPersonalData({ ...personalData, lastName: e.target.value })}
                  className="mt-1"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="mt-1 bg-gray-200 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={personalData.phone}
                onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                className="mt-1"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSavePersonal}
                disabled={isSaving}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingPersonal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Name</h3>
              <p className="text-gray-700">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.name || 'Not set'}
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-700">{user?.email}</p>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">Phone Number</h3>
              <p className="text-gray-700">{user?.phone || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-gray-100 rounded-lg p-8 mb-6">
        <h2 className="text-2xl font-medium text-gray-900 mb-4">Saved addresses</h2>
        <p className="text-sm text-gray-600 mb-8">
          Your default address is your billing address. Other addresses are where you'll receive cards to sign.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg p-6 mb-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <p className="text-red-500 mb-4">Failed to load addresses. Please try again.</p>
        )}

        {/* Stripe Billing Address (Default) */}
        {stripeBilling?.billingAddress && (
          <div className="bg-white rounded-lg p-6 mb-4 border-2 border-gray-900">
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded mb-3">
                  Default (Billing)
                </span>
                <p className="text-gray-900">
                  {stripeBilling.billingAddress.street}
                  {stripeBilling.billingAddress.apartment ? `, ${stripeBilling.billingAddress.apartment}` : ''}
                </p>
                <p className="text-gray-900">
                  {stripeBilling.billingAddress.city}, {stripeBilling.billingAddress.state}, {stripeBilling.billingAddress.zip}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Update billing address in Stripe customer portal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Saved Addresses */}
        {!isLoading && !error && addresses && addresses.length > 0 && (
          <>
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg p-6 mb-4">
                {isEditingAddress === address.id && editingAddressData ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Address</h3>
                      <button
                        onClick={() => {
                          setIsEditingAddress(null);
                          setEditingAddressData(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <Input
                      placeholder="Street Address"
                      value={editingAddressData.street}
                      onChange={(e) => setEditingAddressData({ ...editingAddressData, street: e.target.value })}
                    />
                    <Input
                      placeholder="Apartment, suite, etc."
                      value={editingAddressData.apartment}
                      onChange={(e) => setEditingAddressData({ ...editingAddressData, apartment: e.target.value })}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={editingAddressData.city}
                        onChange={(e) => setEditingAddressData({ ...editingAddressData, city: e.target.value })}
                      />
                      <select
                        value={editingAddressData.state}
                        onChange={(e) => setEditingAddressData({ ...editingAddressData, state: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
                      >
                        <option value="">State</option>
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>{state.name}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="ZIP"
                        value={editingAddressData.zip}
                        onChange={(e) => setEditingAddressData({ ...editingAddressData, zip: e.target.value })}
                        maxLength={5}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleUpdateAddress}
                        disabled={isSaving}
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingAddress(null);
                          setEditingAddressData(null);
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs font-medium px-3 py-1 rounded mb-3">
                        Card Delivery Address
                      </span>
                      <p className="text-gray-900">
                        {address.street}{address.apartment ? `, ${address.apartment}` : ''}
                      </p>
                      <p className="text-gray-900">
                        {address.city}, {address.state}, {address.zip}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="text-gray-900 underline hover:text-gray-700 transition-colors text-sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        Edit
                      </button>
                      <button 
                        className="text-red-600 underline hover:text-red-700 transition-colors text-sm"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!addresses || addresses.length === 0) && !stripeBilling?.billingAddress && (
          <div className="bg-white rounded-lg p-12 text-center mb-4">
            <p className="text-gray-600 mb-4">No saved addresses yet</p>
          </div>
        )}

        <button 
          onClick={() => setIsAddingAddress(true)}
          className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors mt-4"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add card delivery address</span>
        </button>
      </div>

      {/* Update Communication Preferences */}
      <button className="w-full bg-gray-100 rounded-lg p-6 mb-6 flex justify-between items-center hover:bg-gray-200 transition-colors">
        <span className="text-xl font-normal text-gray-900">Update communication preferences</span>
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Change Password */}
      <button 
        onClick={handleChangePassword}
        className="w-full bg-gray-100 rounded-lg p-6 mb-6 flex justify-between items-center hover:bg-gray-200 transition-colors"
      >
        <span className="text-xl font-normal text-gray-900">Change password</span>
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Delete Account & Data */}
      <button className="w-full bg-gray-100 rounded-lg p-6 flex justify-between items-center hover:bg-gray-200 transition-colors">
        <span className="text-xl font-normal text-gray-900">Delete account & data</span>
        <ChevronRight className="w-6 h-6 text-gray-900" />
      </button>

      {/* Add Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">Add Card Delivery Address</h2>
                <p className="text-sm text-gray-600 mt-1">US addresses only</p>
              </div>
              <button onClick={() => setIsAddingAddress(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="street" className="text-gray-900 mb-2">Street Address</Label>
                <Input
                  id="street"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  placeholder="123 Main St"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="apartment" className="text-gray-900 mb-2">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="apartment"
                  value={newAddress.apartment}
                  onChange={(e) => setNewAddress({ ...newAddress, apartment: e.target.value })}
                  placeholder="Apt 4B"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" className="text-gray-900 mb-2">City</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    placeholder="New York"
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="state" className="text-gray-900 mb-2">State</Label>
                  <select
                    id="state"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none text-gray-900"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="zip" className="text-gray-900 mb-2">ZIP Code</Label>
                <Input
                  id="zip"
                  value={newAddress.zip}
                  onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                  placeholder="10001"
                  maxLength={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Address Validation Button */}
            <div className="mb-6">
              <Button
                type="button"
                onClick={validateAddressFields}
                disabled={addressValidation.isValidating || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip}
                variant="outline"
                className="w-full"
              >
                {addressValidation.isValidating ? 'Validating...' : 'Validate Address'}
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Address Validation Messages */}
              {addressValidation.isValidating && (
                <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Validating address...</span>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'CORRECTABLE' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-2">Suggested Address</p>
                      <div className="text-sm text-blue-800 mb-3">
                        <p>{addressValidation.result.suggestedAddress?.street}</p>
                        {addressValidation.result.suggestedAddress?.apartment && (
                          <p>{addressValidation.result.suggestedAddress.apartment}</p>
                        )}
                        <p>
                          {addressValidation.result.suggestedAddress?.city},{' '}
                          {addressValidation.result.suggestedAddress?.state}{' '}
                          {addressValidation.result.suggestedAddress?.zip}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={applySuggestedAddress}
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Use Suggested
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddressValidation({ ...addressValidation, showSuggestion: false })}
                          className="text-xs px-3 py-1"
                        >
                          Keep Original
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {addressValidation.showSuggestion && addressValidation.result?.verdict === 'UNDELIVERABLE' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-1">Address Cannot Be Verified</p>
                      <p className="text-sm text-red-800">
                        {addressValidation.result.message || 'Please check the address and try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddingAddress(false)}
                disabled={isSaving}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={isSaving || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip}
                className="px-6 bg-gray-900 hover:bg-gray-800 text-white"
              >
                {isSaving ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
