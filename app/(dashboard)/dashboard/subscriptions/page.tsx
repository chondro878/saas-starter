import { getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { STRIPE_PLANS, getPlanByName, getNextTier, getPlanDetails, type PlanKey } from '@/lib/payments/config';
import { Check, CreditCard, AlertCircle, TrendingUp, Edit } from 'lucide-react';
import { ManageBillingButton } from './manage-billing-button';
import { UpgradeButton } from './upgrade-button';

export default async function SubscriptionsPage() {
  const team = await getTeamForUser();

  if (!team) {
    redirect('/sign-in');
  }

  const currentPlanKey = getPlanByName(team.planName);
  const currentPlan = currentPlanKey ? getPlanDetails(currentPlanKey) : null;
  const nextTier = currentPlanKey ? getNextTier(currentPlanKey) : 'essentials';
  const hasActiveSubscription = team.subscriptionStatus === 'active';
  const needsPayment = !team.subscriptionStatus || team.subscriptionStatus === 'canceled' || team.subscriptionStatus === 'unpaid' || team.subscriptionStatus === 'trialing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto py-16 px-8">
        {/* Current Subscription Section */}
        <div className="mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-6">
            CURRENT SUBSCRIPTION
          </h2>

          {currentPlan ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{currentPlan.name}</h3>
                    <p className="text-4xl font-bold text-gray-900">
                      ${currentPlan.price / 100}
                      <span className="text-lg font-normal text-gray-500"> per {currentPlan.interval}</span>
                    </p>
                  </div>
                  {hasActiveSubscription && (
                    <ManageBillingButton />
                  )}
                </div>
                
                <p className="text-gray-600">
                  Your next billing date is {team.subscriptionStatus === 'active' ? 'upcoming' : 'N/A'}.
                </p>
              </div>

              {!hasActiveSubscription && (
                <div className="p-8 bg-amber-50 border-t border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900 mb-1">Subscription Inactive</p>
                      <p className="text-sm text-amber-700 mb-4">
                        Choose a plan to get started or reactivate your subscription.
                      </p>
                      <a 
                        href="/pricing" 
                        className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors text-sm"
                      >
                        View Plans
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg mb-6">No active subscription</p>
              <a 
                href="/pricing" 
                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Choose a Plan
              </a>
            </div>
          )}
        </div>

        {/* Payment Methods Section */}
        {hasActiveSubscription && (
          <div className="mb-12">
            <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-6">
              PAYMENT METHODS
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 font-medium">Managed through Stripe</span>
                </div>
                <ManageBillingButton variant="link" />
              </div>
              <p className="text-sm text-gray-500">
                Click "Manage Billing" to update your payment method, view invoices, or cancel your subscription.
              </p>
            </div>
          </div>
        )}

        {/* Billing Information Section */}
        {hasActiveSubscription && (
          <div className="mb-12">
            <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-6">
              BILLING INFORMATION
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-gray-900 font-medium">{team.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{team.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="border-t pt-6">
                <ManageBillingButton variant="link" text="Update information" />
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {nextTier && hasActiveSubscription && (
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-purple-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-white" />
                  <h3 className="text-2xl font-bold text-white">
                    Upgrade to {STRIPE_PLANS[nextTier].name}
                  </h3>
                </div>
                <p className="text-purple-100">
                  Get more cards and premium features
                </p>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Additional Features
                    </p>
                    <ul className="space-y-2">
                      {STRIPE_PLANS[nextTier].features.slice(currentPlan?.features.length || 0).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Pricing
                    </p>
                    <p className="text-4xl font-bold text-gray-900 mb-1">
                      ${STRIPE_PLANS[nextTier].price / 100}
                      <span className="text-lg font-normal text-gray-500">/{STRIPE_PLANS[nextTier].interval}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      {STRIPE_PLANS[nextTier].cardsPerYear} cards per year
                    </p>
                    <UpgradeButton priceId={STRIPE_PLANS[nextTier].priceId} planName={STRIPE_PLANS[nextTier].name} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Plans */}
        {!hasActiveSubscription && (
          <div className="mb-12">
            <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-6">
              AVAILABLE PLANS
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
                const isRecommended = 'recommended' in plan && plan.recommended;
                return (
                  <div 
                    key={key} 
                    className="bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg"
                    style={{
                      borderColor: isRecommended ? 'rgb(168, 85, 247)' : 'rgb(229, 231, 235)'
                    }}
                  >
                    <div className="p-6">
                      {isRecommended && (
                        <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block uppercase tracking-wide">
                          Recommended
                        </span>
                      )}
                      <h3 className="text-xl font-bold mb-1 text-gray-900">{plan.name}</h3>
                      <p className="text-3xl font-bold text-gray-900 mb-6">
                        ${plan.price / 100}
                        <span className="text-base font-normal text-gray-500">/{plan.interval}</span>
                      </p>
                      <ul className="space-y-2 mb-8">
                        {plan.features.slice(0, 5).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <a 
                        href="/pricing"
                        className={`block w-full py-3 px-6 rounded-lg text-center font-medium transition-colors ${
                          isRecommended
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                        }`}
                      >
                        Select Plan
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

