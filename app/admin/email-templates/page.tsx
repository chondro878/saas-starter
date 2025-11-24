'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ExternalLink, Mail, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/lib/email/templates/welcome';
import { OrderCreatedEmail } from '@/lib/email/templates/order-created';
import { SubscriptionStartedEmail } from '@/lib/email/templates/subscription-started';
import { CardReminderEmail } from '@/lib/email/templates/card-reminder';
import { CardCreditPurchasedEmail } from '@/lib/email/templates/card-credit-purchased';
import { MissingAddressEmail } from '@/lib/email/templates/missing-address';
import AddressUrgentIssueEmail from '@/lib/email/templates/address-urgent-issue';
import AddressCorrectedEmail from '@/lib/email/templates/address-corrected';

type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  filePath: string;
  subject: string;
  trigger: string;
  component: React.ReactElement;
  category: 'transactional' | 'notification' | 'alert';
};

const EmailPreview = ({ component }: { component: React.ReactElement }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderEmail = async () => {
      if (iframeRef.current) {
        setIsLoading(true);
        try {
          // Ensure render is awaited in case it returns a Promise
          const htmlString = await Promise.resolve(render(component));
          const iframe = iframeRef.current;
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (doc) {
            doc.open();
            doc.write(htmlString);
            doc.close();
          }
        } catch (error) {
          console.error('Error rendering email:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    renderEmail();
  }, [component]);

  return (
    <div className="relative w-full h-[600px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Rendering email...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        title="Email Preview"
        className="w-full h-full border-0 rounded-lg"
        sandbox="allow-same-origin"
      />
    </div>
  );
};

const EmailTemplatesPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['transactional', 'notification', 'alert']);

  // Mock data for all email templates
  const mockUser = {
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
  };

  const mockOrder = {
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
    returnName: 'Sarah Johnson',
    returnStreet: '456 Oak Ave',
    returnApartment: null,
    returnCity: 'Seattle',
    returnState: 'WA',
    returnZip: '98101',
    occasionId: 1,
    occasionType: 'Birthday',
    occasionDate: new Date('2025-12-15'),
    occasionNotes: "Don't forget to mention the family reunion!",
    cardType: 'subscription' as const,
    status: 'pending' as const,
    printDate: null,
    mailDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Email',
      description: 'Sent when a new user signs up',
      filePath: 'lib/email/templates/welcome.tsx',
      subject: 'Welcome to Avoid the Rain! 🎉',
      trigger: 'User signs up',
      category: 'transactional',
      component: <WelcomeEmail user={mockUser} />,
    },
    {
      id: 'order-created',
      name: 'Order Created',
      description: 'Confirmation when a card order is created',
      filePath: 'lib/email/templates/order-created.tsx',
      subject: "Your Birthday card for Mom is being prepared! 💌",
      trigger: 'Cron job creates order (15 days before occasion)',
      category: 'notification',
      component: <OrderCreatedEmail user={mockUser} order={mockOrder} occasionDate="December 15, 2025" daysUntilOccasion={28} />,
    },
    {
      id: 'subscription-started',
      name: 'Subscription Started',
      description: 'Sent when user subscribes to a paid plan',
      filePath: 'lib/email/templates/subscription-started.tsx',
      subject: 'Welcome to Stress Free! 🎉',
      trigger: 'User completes Stripe checkout for subscription',
      category: 'transactional',
      component: <SubscriptionStartedEmail user={mockUser} planName="Stress Free" cardLimit={12} />,
    },
    {
      id: 'card-reminder',
      name: 'Card Reminder',
      description: 'Reminder 3 days before an occasion',
      filePath: 'lib/email/templates/card-reminder.tsx',
      subject: "⏰ Reminder: Mom's Birthday is in 3 days!",
      trigger: 'Cron job (3 days before occasion date)',
      category: 'notification',
      component: <CardReminderEmail user={mockUser} order={mockOrder} occasionDate="December 15, 2025" daysUntilOccasion={3} />,
    },
    {
      id: 'card-credit-purchased',
      name: 'Card Credit Purchased',
      description: 'Thank you email after buying card credits',
      filePath: 'lib/email/templates/card-credit-purchased.tsx',
      subject: 'Thank you for your purchase! 🎉',
      trigger: 'User completes Stripe checkout for credits',
      category: 'transactional',
      component: <CardCreditPurchasedEmail user={mockUser} creditsAdded={5} totalCredits={8} />,
    },
    {
      id: 'missing-address',
      name: 'Missing Address',
      description: 'Warning when address is missing before shipping',
      filePath: 'lib/email/templates/missing-address.tsx',
      subject: '⚠️ Action Required: Add your card delivery address',
      trigger: 'Cron job tries to create order but user has no default address',
      category: 'alert',
      component: <MissingAddressEmail user={mockUser} recipientName="Mom" occasionType="Birthday" occasionDate="December 15, 2025" />,
    },
    {
      id: 'address-urgent-issue',
      name: 'Address Urgent Issue',
      description: 'Alert when address is invalid and occasion is <15 days away',
      filePath: 'lib/email/templates/address-urgent-issue.tsx',
      subject: '⚠️ Action Required: Verify Address',
      trigger: 'Address validation fails for urgent occasion (<15 days)',
      category: 'alert',
      component: (
        <AddressUrgentIssueEmail
          userName="Sarah"
          recipientName="Mom Johnson"
          occasionType="Birthday"
          occasionDate="December 15, 2025"
          daysUntil={12}
          address={{
            street: '123 Main St',
            apartment: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zip: '10001',
          }}
          dashboardLink="http://localhost:3000/dashboard"
        />
      ),
    },
    {
      id: 'address-corrected',
      name: 'Address Corrected',
      description: 'Info email when USPS auto-corrects an address',
      filePath: 'lib/email/templates/address-corrected.tsx',
      subject: '✅ Address Corrected',
      trigger: 'USPS validates and standardizes address',
      category: 'notification',
      component: (
        <AddressCorrectedEmail
          userName="Sarah"
          recipientName="Mom Johnson"
          originalAddress={{
            street: '123 main street',
            city: 'new york',
            state: 'ny',
            zip: '10001',
          }}
          correctedAddress={{
            street: '123 MAIN ST',
            city: 'NEW YORK',
            state: 'NY',
            zip: '10001-1234',
          }}
        />
      ),
    },
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const groupedTemplates = {
    transactional: emailTemplates.filter((t) => t.category === 'transactional'),
    notification: emailTemplates.filter((t) => t.category === 'notification'),
    alert: emailTemplates.filter((t) => t.category === 'alert'),
  };

  const categoryLabels = {
    transactional: '💳 Transactional Emails',
    notification: '🔔 Notification Emails',
    alert: '⚠️ Alert Emails',
  };

  const categoryDescriptions = {
    transactional: 'Emails triggered by user actions (signup, purchase, subscription)',
    notification: 'Informational emails about orders and reminders',
    alert: 'Urgent emails requiring user action',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Email Template Manager</h1>
              <p className="text-gray-600">View and edit all automated emails sent by Avoid the Rain</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-900 font-medium mb-1">How to edit email templates:</p>
              <p className="text-blue-800 text-sm">
                Click on any email below to preview it. To edit the content, styling, or subject line, 
                click "Edit Template File" to open the source file in your code editor. Changes will be 
                reflected immediately in both development and production.
              </p>
            </div>
          </div>
        </div>

        {/* Template List */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Template List */}
          <div className="lg:col-span-1 space-y-4">
            {Object.entries(groupedTemplates).map(([category, templates]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.includes(category) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {templates.length}
                  </span>
                </button>
                
                {expandedCategories.includes(category) && (
                  <div className="border-t border-gray-200">
                    <p className="px-4 py-2 text-xs text-gray-600 bg-gray-50">
                      {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                    </p>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`w-full px-4 py-3 text-left border-t border-gray-100 hover:bg-blue-50 transition-colors ${
                          selectedTemplate === template.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Supabase Auth Emails Info */}
            <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-4">
              <div className="flex items-start gap-2 mb-2">
                <Mail className="w-4 h-4 text-amber-600 mt-0.5" />
                <h3 className="font-semibold text-amber-900 text-sm">Auth Emails (Supabase)</h3>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Email verification and password reset emails are managed in your Supabase Dashboard.
              </p>
              <a
                href="https://supabase.com/dashboard/project/_/auth/templates"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium"
              >
                Edit in Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Right Panel - Email Preview */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                {(() => {
                  const template = emailTemplates.find((t) => t.id === selectedTemplate);
                  if (!template) return null;

                  return (
                    <>
                      {/* Template Header */}
                      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{template.name}</h2>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              template.category === 'transactional'
                                ? 'bg-blue-100 text-blue-800'
                                : template.category === 'notification'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {template.category}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium">Subject Line:</p>
                            <p className="text-gray-900">{template.subject}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Trigger:</p>
                            <p className="text-gray-900">{template.trigger}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <a
                            href={`vscode://file${process.cwd()}/${template.filePath}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Edit Template File
                          </a>
                          <button
                            onClick={() => {
                              const code = `file://${process.cwd()}/${template.filePath}`;
                              navigator.clipboard.writeText(code);
                              alert('File path copied to clipboard!');
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Copy File Path
                          </button>
                        </div>
                      </div>

                      {/* Email Preview */}
                      <div className="p-6 bg-gray-100">
                        <div className="bg-white rounded-lg shadow-inner overflow-hidden">
                          <EmailPreview component={template.component} />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Select an email template
                  </h3>
                  <p className="text-gray-600">
                    Choose a template from the left sidebar to preview and edit
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatesPage;

