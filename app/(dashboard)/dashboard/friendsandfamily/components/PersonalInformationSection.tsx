'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const RELATIONSHIP_OPTIONS = ['Friend', 'Family', 'Romantic', 'Professional'];

interface PersonalInformationSectionProps {
  formData: {
    firstName: string;
    lastName: string;
    secondFirstName: string;
    secondLastName: string;
    isCouple: boolean;
    relationship: string;
  };
  setFormData: (data: any) => void;
}

export function PersonalInformationSection({ formData, setFormData }: PersonalInformationSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1"
              maxLength={50}
              pattern="[a-zA-Z\s'-]+"
              onKeyPress={(e) => {
                if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1"
              maxLength={50}
              pattern="[a-zA-Z\s'-]+"
              onKeyPress={(e) => {
                if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        {formData.isCouple && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="secondFirstName">Partner's First Name</Label>
              <Input
                id="secondFirstName"
                value={formData.secondFirstName}
                onChange={(e) => setFormData({ ...formData, secondFirstName: e.target.value })}
                className="mt-1"
                maxLength={50}
                pattern="[a-zA-Z\s'-]+"
                onKeyPress={(e) => {
                  if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="secondLastName">Partner's Last Name</Label>
              <Input
                id="secondLastName"
                value={formData.secondLastName}
                onChange={(e) => setFormData({ ...formData, secondLastName: e.target.value })}
                className="mt-1"
                maxLength={50}
                pattern="[a-zA-Z\s'-]+"
                onKeyPress={(e) => {
                  if (!/^[a-zA-Z\s'-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Couple checkbox and relationship below partner's last name */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCouple"
              checked={formData.isCouple}
              onChange={(e) => {
                const isCouple = e.target.checked;
                setFormData({ 
                  ...formData, 
                  isCouple,
                  // Clear second person fields if unchecking couple
                  ...(isCouple ? {} : { secondFirstName: '', secondLastName: '' }),
                  // Clear Romantic relationship if checking couple
                  ...(isCouple && formData.relationship === 'Romantic' ? { relationship: 'Friend' } : {})
                });
              }}
              className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
            />
            <Label htmlFor="isCouple" className="cursor-pointer">Is this a couple?</Label>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="relationship">Relationship</Label>
          <select
            id="relationship"
            value={formData.relationship}
            onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
          >
            {RELATIONSHIP_OPTIONS.filter(rel => {
              // Exclude Romantic when couple is checked
              if (formData.isCouple && rel === 'Romantic') {
                return false;
              }
              return true;
            }).map((rel) => (
              <option key={rel} value={rel}>{rel}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

