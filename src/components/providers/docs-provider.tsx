'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const getSearchApi = () => {
    if (pathname.startsWith('/docs/admin')) {
      return '/api/search-admin-docs';
    }
    else if (pathname.startsWith('/docs/user')) {
      return '/api/search-user-docs';
    }
    return '/api/search';
  };

  return (
    <RootProvider
      theme={{ enabled: true }}
      search={{
        enabled: true,
        options: {
          api: getSearchApi(),
        },
      }}
    >
      {children}
    </RootProvider>
  );
}
