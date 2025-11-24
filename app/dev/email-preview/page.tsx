import AddressUrgentIssueEmail from '@/lib/email/templates/address-urgent-issue';
import AddressCorrectedEmail from '@/lib/email/templates/address-corrected';

export default function EmailPreviewPage() {
  const mockUrgentData = {
    recipientName: "John Doe",
    occasionType: "Birthday",
    occasionDate: "December 25, 2025",
    daysUntil: 15,
    userName: "Jane Smith",
    address: {
      street: "123 Main St",
      apartment: "Apt 4B",
      city: "New York",
      state: "NY",
      zip: "10001"
    },
    dashboardLink: "http://localhost:3000/dashboard/friendsandfamily"
  };

  const mockCorrectedData = {
    recipientName: "John Doe",
    userName: "Jane Smith",
    originalAddress: {
      street: "123 main street",
      apartment: null,
      city: "new york",
      state: "ny",
      zip: "10001"
    },
    correctedAddress: {
      street: "123 MAIN ST",
      apartment: null,
      city: "NEW YORK",
      state: "NY",
      zip: "10001-1234"
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Email Template Previews</h1>
        
        {/* Urgent Address Issue Email */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            ⚠️ Address Urgent Issue Email
          </h2>
          <div className="border border-gray-300 rounded">
            <AddressUrgentIssueEmail {...mockUrgentData} />
          </div>
        </div>

        {/* Address Corrected Email */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            ✅ Address Corrected Email
          </h2>
          <div className="border border-gray-300 rounded">
            <AddressCorrectedEmail {...mockCorrectedData} />
          </div>
        </div>
      </div>
    </div>
  );
}
