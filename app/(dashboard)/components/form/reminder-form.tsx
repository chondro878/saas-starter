

'use client';

import { useState } from 'react';

interface ReminderFormProps {
  defaultValues: {
    firstPerson: { first: string; last: string };
    address: { street: string; city: string; state: string; zip: string };
    relationship: string;
    occasion: string;
    date: Date;
    note: string;
  };
}

export default function ReminderForm({ defaultValues }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    firstName: defaultValues.firstPerson.first,
    lastName: defaultValues.firstPerson.last,
    address: `${defaultValues.address.street}, ${defaultValues.address.city}, ${defaultValues.address.state} ${defaultValues.address.zip}`,
    relationship: defaultValues.relationship,
    occasion: defaultValues.occasion,
    date: defaultValues.date.toISOString().split('T')[0],
    note: defaultValues.note,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Reminder submitted:', formData);
    // send to backend or API
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-md max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className="border p-2 rounded" />
        <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className="border p-2 rounded" />
      </div>

      <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" />

      <div className="grid grid-cols-2 gap-4">
        <select name="relationship" value={formData.relationship} onChange={handleChange} className="border p-2 rounded">
          <option>Friend</option>
          <option>Partner</option>
          <option>Sibling</option>
          <option>Parent</option>
          <option>Colleague</option>
        </select>

        <select name="occasion" value={formData.occasion} onChange={handleChange} className="border p-2 rounded">
          <option>Birthday</option>
          <option>Anniversary</option>
          <option>Holiday</option>
          <option>Graduation</option>
          <option>Other</option>
        </select>
      </div>

      <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border p-2 rounded" />

      <textarea name="note" placeholder="Personal note..." value={formData.note} onChange={handleChange} className="w-full border p-2 rounded" rows={4} />

      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">Set Reminder</button>
    </form>
  );
}