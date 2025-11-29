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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        {/* Upgrade Section - Now at Top, Pricing Removed */}
        {nextTier && hasActiveSubscription && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-purple-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Upgrade to {STRIPE_PLANS[nextTier].name}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-purple-100">
                  Get more cards and premium features
                </p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
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
                  <UpgradeButton priceId={STRIPE_PLANS[nextTier].priceId} planName={STRIPE_PLANS[nextTier].name} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing & Payment Methods Section */}
        {hasActiveSubscription && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
              BILLING & PAYMENT METHODS
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {/* Payment Method */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 font-medium">Payment Method</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Managed through Stripe
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500">
                    Click "Manage Billing" to update your payment method, billing information, view invoices, or cancel your subscription.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ManageBillingButton variant="link" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Section - Now at Bottom, Pricing Removed */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
            CURRENT SUBSCRIPTION
          </h2>

          {currentPlan ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">{currentPlan.name}</h3>
                    <p className="text-sm sm:text-base text-gray-600">
                      Your next billing date is {team.subscriptionStatus === 'active' ? 'upcoming' : 'N/A'}.
                    </p>
                  </div>
                  {hasActiveSubscription && (
                    <div className="flex-shrink-0">
                      <ManageBillingButton variant="link" text="Manage subscription" />
                    </div>
                  )}
                </div>
              </div>

              {!hasActiveSubscription && (
                <div className="p-4 sm:p-6 lg:p-8 bg-amber-50 border-t border-amber-200">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <p className="text-gray-500 text-base sm:text-lg mb-6">No active subscription</p>
              <a 
                href="/pricing" 
                className="inline-block bg-gray-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Choose a Plan
              </a>
            </div>
          )}
        </div>

        {/* Available Plans */}
        {!hasActiveSubscription && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xs uppercase tracking-wider text-gray-600 font-semibold mb-4 sm:mb-6">
              AVAILABLE PLANS
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

