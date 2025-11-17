'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08
});

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Complete the progress bar when route changes
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept all link clicks to start the progress bar
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        // Only start for internal links
        const url = new URL(anchor.href);
        if (url.pathname !== pathname) {
          NProgress.start();
        }
      }
    };

    // Listen for browser back/forward
    const handlePopState = () => {
      NProgress.start();
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  return null;
}

