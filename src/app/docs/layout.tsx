import { Banner } from 'fumadocs-ui/components/banner';
import { Inter } from 'next/font/google';

import { DocsProvider } from '~/components/providers/docs-provider';

// import '~/styles/globals.css';
import '~/styles/docs-only.css';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <main className={`${inter.className} flex! flex-col! min-h-screen!`}>
      <DocsProvider>
        <Banner variant="normal" id="banner-warning">
          This guidebook is under construction. Some pages may not be complete or accurate.
        </Banner>

        {children}
      </DocsProvider>
    </main>
  );
}
