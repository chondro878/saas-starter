import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get: (name: string) => {
        if (typeof document === 'undefined') return undefined;
        
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(';').shift();
        }
        return undefined;
      },
      set: (name: string, value: string, options: any) => {
        if (typeof document === 'undefined') return;
        
        let cookieString = `${name}=${value}`;
        
        if (options?.expires) {
          cookieString += `; expires=${options.expires}`;
        }
        if (options?.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options?.path) {
          cookieString += `; path=${options.path}`;
        }
        if (options?.secure) {
          cookieString += `; secure`;
        }
        if (options?.sameSite) {
          cookieString += `; samesite=${options.sameSite}`;
        }
        if (options?.httpOnly) {
          cookieString += `; httponly`;
        }
        
        document.cookie = cookieString;
      },
      remove: (name: string, options: any) => {
        if (typeof document === 'undefined') return;
        
        let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        
        if (options?.domain) {
          cookieString += `; domain=${options.domain}`;
        }
        if (options?.path) {
          cookieString += `; path=${options.path}`;
        }
        
        document.cookie = cookieString;
      },
    },
  }
);