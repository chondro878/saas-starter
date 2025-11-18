'use client';

export function BetaBanner() {
  // Beta banner is controlled by environment variable
  const showBetaBanner = process.env.NEXT_PUBLIC_SHOW_BETA_BANNER === 'true';
  
  if (!showBetaBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
      🚧 Private Beta - Site under development. Payments temporarily disabled.
    </div>
  );
}

