import { DocsLayout } from 'fumadocs-ui/layouts/docs';

import { baseOptions } from '~/lib/layout.shared.user';
import { userSource } from '~/lib/source';

export default function Layout({ children }: LayoutProps<'/docs/user'>) {
  return (
    <DocsLayout tree={userSource.getPageTree()} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
