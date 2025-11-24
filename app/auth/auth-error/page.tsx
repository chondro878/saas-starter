import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">
            Email Verification Failed
          </h1>
          <p className="text-gray-600 text-center">
            We couldn't verify your email address.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            This could be because:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>The verification link has expired</li>
            <li>The link has already been used</li>
            <li>The link is invalid or malformed</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/sign-in"
            className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Back to Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="block w-full text-center border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Create New Account
          </Link>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          Need help? <a href="mailto:support@avoidtherain.com" className="text-blue-600 hover:underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}

