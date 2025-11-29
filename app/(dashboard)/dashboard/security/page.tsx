'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/browserClient';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountSettingsPage() {
  const { data: user, mutate: mutateUser } = useSWR<User>('/api/user', fetcher);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!confirm('We will send a password reset link to your email. Do you want to continue?')) {
      return;
    }

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

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
      return;
    }
    
    // TODO: Implement account deletion logic
    alert('Account deletion is not yet implemented. Please contact support.');
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

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        {/* Personal Details Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
            PERSONAL DETAILS
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            {isEditingPersonal ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="text-gray-900 font-medium">
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-900 font-medium">{user?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button 
                    className="text-gray-900 underline hover:text-gray-700 transition-colors text-sm font-medium"
                    onClick={handleEditPersonal}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
            SECURITY
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
            {/* Change Password */}
            <button 
              onClick={handleChangePassword}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-base font-medium text-gray-900">Change password</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Delete Account */}
            <button 
              onClick={handleDeleteAccount}
              className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-base font-medium text-gray-900">Delete account & data</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
            PREFERENCES
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-gray-50 transition-colors text-left">
              <span className="text-base font-medium text-gray-900">Update communication preferences</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
