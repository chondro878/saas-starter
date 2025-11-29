'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { US_STATES } from '@/lib/us-states';

interface AddressSectionProps {
  formData: {
    street: string;
    apartment: string;
    city: string;
    state: string;
    zip: string;
  };
  setFormData: (data: any) => void;
}

export function AddressSection({ formData, setFormData }: AddressSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            className="mt-1"
            maxLength={100}
            pattern="[a-zA-Z0-9\s.,#'-]+"
          />
        </div>
        <div>
          <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
          <Input
            id="apartment"
            value={formData.apartment}
            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
            className="mt-1"
            maxLength={50}
            pattern="[a-zA-Z0-9\s.,#'-]+"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 focus:outline-none"
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              value={formData.zip}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d-]/g, ''); // Only allow digits and hyphens
                // Format: allow 5 digits or 5+4 format
                if (value.length > 5 && !value.includes('-')) {
                  value = value.slice(0, 5) + '-' + value.slice(5, 9);
                }
                if (value.length > 10) value = value.slice(0, 10);
                setFormData({ ...formData, zip: value });
              }}
              className="mt-1"
              maxLength={10}
              inputMode="numeric"
              pattern="\d{5}(-\d{4})?"
              placeholder="12345 or 12345-6789"
              onKeyPress={(e) => {
                if (!/^[\d-]$/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

