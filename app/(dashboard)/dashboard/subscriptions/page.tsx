import { getTeamForUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { STRIPE_PLANS, getPlanByName, getNextTier, getPlanDetails, type PlanKey } from '@/lib/payments/config';
import { Check, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription & Billing</h1>
        <p className="text-gray-600">Manage your plan and payment information</p>
      </div>

      {/* Payment Alert */}
      {needsPayment && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Subscription Required
              </h3>
              <p className="text-red-700 mb-4">
                You don't have an active subscription. Choose a plan below to start receiving automated card orders.
              </p>
              <a 
                href="/pricing" 
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                View Plans
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Current Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
          
          {currentPlan ? (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasActiveSubscription 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {hasActiveSubscription ? 'Active' : team.subscriptionStatus || 'Inactive'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${currentPlan.price / 100}
                  <span className="text-lg font-normal text-gray-500">/{currentPlan.interval}</span>
                </p>
              </div>

              <div className="border-t pt-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Plan Features:</p>
                <ul className="space-y-2">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {hasActiveSubscription && (
                <ManageBillingButton />
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No active subscription</p>
              <a 
                href="/pricing" 
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Choose a Plan
              </a>
            </div>
          )}
        </div>

        {/* Billing Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="text-sm text-gray-600">
                  {hasActiveSubscription 
                    ? 'Managed through Stripe' 
                    : 'No payment method on file'}
                </p>
              </div>
            </div>

            {hasActiveSubscription && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">What you can manage:</p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Update payment method</li>
                    <li>• View billing history</li>
                    <li>• Download invoices</li>
                    <li>• Update billing information</li>
                    <li>• Cancel subscription</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <ManageBillingButton variant="secondary" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Section */}
      {nextTier && hasActiveSubscription && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-8">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to {STRIPE_PLANS[nextTier].name}
              </h3>
              <p className="text-gray-600 mb-4">
                Get more cards and premium features with our {STRIPE_PLANS[nextTier].name} plan
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Additional Features:</p>
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
                  <p className="text-sm font-medium text-gray-700 mb-2">Pricing:</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    ${STRIPE_PLANS[nextTier].price / 100}
                    <span className="text-lg font-normal text-gray-500">/{STRIPE_PLANS[nextTier].interval}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {STRIPE_PLANS[nextTier].cardsPerYear} cards per year
                  </p>
                </div>
              </div>

              <UpgradeButton priceId={STRIPE_PLANS[nextTier].priceId} planName={STRIPE_PLANS[nextTier].name} />
            </div>
          </div>
        </div>
      )}

      {/* All Plans */}
      {!hasActiveSubscription && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-6">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
              const isRecommended = 'recommended' in plan && plan.recommended;
              return (
                <div 
                  key={key} 
                  className={`border rounded-lg p-6 ${
                    isRecommended 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200'
                  }`}
                >
                  {isRecommended && (
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">
                      MOST POPULAR
                    </span>
                  )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  ${plan.price / 100}
                  <span className="text-lg font-normal text-gray-500">/{plan.interval}</span>
                </p>
                <ul className="space-y-2 mb-6">
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

