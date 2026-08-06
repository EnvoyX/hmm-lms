import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { baseOptions } from '~/lib/layout.shared.admin';
import { adminSource } from '~/lib/source';

export default function Layout({ children }: LayoutProps<'/docs/admin'>) {
  return (
    <DocsLayout tree={adminSource.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
