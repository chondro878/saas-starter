'use client';

import { useState, useEffect } from 'react';
import { WelcomeEmail } from '@/lib/email/templates/welcome';
import { OrderCreatedEmail } from '@/lib/email/templates/order-created';
import { SubscriptionStartedEmail } from '@/lib/email/templates/subscription-started';
import { CardCreditPurchasedEmail } from '@/lib/email/templates/card-credit-purchased';
import { CardReminderEmail } from '@/lib/email/templates/card-reminder';
import { MissingAddressEmail } from '@/lib/email/templates/missing-address';
import { render } from '@react-email/components';
import { Monitor, Smartphone, Mail, CheckCircle2, AlertCircle, CreditCard, Clock, MapPin, Gift } from 'lucide-react';

// Sample data for each email template
const sampleData = {
  user: {
    id: 1,
    email: 'sarah@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    name: 'Sarah Johnson',
    passwordHash: '',
    role: 'owner' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    phone: null,
  },
  order: {
    id: 1,
    userId: 1,
    teamId: 1,
    recipientId: 1,
    recipientFirstName: 'Mom',
    recipientLastName: 'Johnson',
    recipientCity: 'San Francisco',
    recipientState: 'CA',
    recipientStreet: '123 Main St',
    recipientApartment: null,
    recipientZip: '94102',
    occasionId: 1,
    occasionType: 'Birthday',
    occasionDate: new Date('2025-12-15'),
    occasionName: 'Birthday',
    occasionNotes: 'Don\'t forget to mention the family reunion!',
    cardType: 'birthday',
    status: 'created' as const,
    printDate: null,
    shipDate: null,
    deliveredDate: null,
    shippingCarrier: null,
    shippingTrackingNumber: null,
    fulfillmentStatus: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

const emailTemplates = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Sent when a new user signs up',
    icon: Mail,
    color: 'bg-blue-500',
    component: <WelcomeEmail user={sampleData.user} />,
  },
  {
    id: 'order-created',
    name: 'Order Created',
    description: 'Sent when a card order is created',
    icon: CheckCircle2,
    color: 'bg-green-500',
    component: (
      <OrderCreatedEmail
        user={sampleData.user}
        order={sampleData.order}
        occasionDate="December 15, 2025"
        daysUntilOccasion={28}
      />
    ),
  },
  {
    id: 'subscription-started',
    name: 'Subscription Started',
    description: 'Sent when subscription becomes active',
    icon: Gift,
    color: 'bg-purple-500',
    component: (
      <SubscriptionStartedEmail
        user={sampleData.user}
        planName="Stress Free"
        cardLimit={12}
      />
    ),
  },
  {
    id: 'card-credit-purchased',
    name: 'Card Credit Purchased',
    description: 'Sent when customer buys card credits',
    icon: CreditCard,
    color: 'bg-indigo-500',
    component: (
      <CardCreditPurchasedEmail
        user={sampleData.user}
        creditsAdded={5}
        totalCredits={8}
      />
    ),
  },
  {
    id: 'card-reminder',
    name: 'Card Reminder',
    description: 'Sent as reminder for upcoming occasions',
    icon: Clock,
    color: 'bg-yellow-500',
    component: (
      <CardReminderEmail
        user={sampleData.user}
        order={sampleData.order}
        occasionDate="December 15, 2025"
        daysUntilOccasion={7}
      />
    ),
  },
  {
    id: 'missing-address',
    name: 'Missing Address',
    description: 'Sent when address is needed',
    icon: AlertCircle,
    color: 'bg-red-500',
    component: (
      <MissingAddressEmail
        user={sampleData.user}
        recipientName="Mom"
        occasionType="Birthday"
        occasionDate="December 15, 2025"
      />
    ),
  },
];

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Render the email to HTML when template changes
  useEffect(() => {
    const renderEmail = async () => {
      setIsLoading(true);
      try {
        const html = await render(selectedTemplate.component);
        setHtmlContent(html);
      } catch (error) {
        console.error('Error rendering email:', error);
        setHtmlContent('<div style="padding: 20px; color: red;">Error rendering email template</div>');
      } finally {
        setIsLoading(false);
      }
    };
    renderEmail();
  }, [selectedTemplate]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📧 Email Preview</h1>
          <p className="text-sm text-gray-600">Development Tool - All Email Templates</p>
        </div>

        {/* Template List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {emailTemplates.map((template) => {
            const Icon = template.icon;
            const isSelected = selectedTemplate.id === template.id;
            
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`${template.color} ${
                      isSelected ? 'opacity-100' : 'opacity-80'
                    } p-2 rounded-lg flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                    <p
                      className={`text-xs ${
                        isSelected ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">
            <strong>Hot Reload:</strong> Edit templates in <code className="bg-gray-200 px-1 rounded">/lib/email/templates/</code>
          </p>
          <p className="text-xs text-gray-500">
            Changes auto-reload in dev mode
          </p>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate.name}</h2>
            <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">Desktop</span>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-sm font-medium">Mobile</span>
            </button>
          </div>
        </div>

        {/* Email Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="flex justify-center">
            <div
              className={`bg-white shadow-2xl transition-all duration-300 relative ${
                viewMode === 'desktop' ? 'w-full max-w-4xl' : 'w-full max-w-sm'
              }`}
              style={{
                minHeight: '600px',
              }}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Rendering email...</p>
                  </div>
                </div>
              )}
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full"
                style={{ minHeight: '600px', border: 'none' }}
                title={`Email Preview: ${selectedTemplate.name}`}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

