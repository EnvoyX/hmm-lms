import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { defineDocs } from 'fumadocs-mdx/macro';
import { icons } from 'lucide-react';
import { createElement } from 'react';

export const userDocs = defineDocs({
  dir: 'content/docs/user',
});

export const adminDocs = defineDocs({
  dir: 'content/docs/admin',
});

export const userSource = loader({
  baseUrl: '/docs/user',
  source: userDocs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  icon(icon) {
      if (!icon) {
        // You may set a default icon
        return;
      }
      if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
    },
});

export const adminSource = loader({
  baseUrl: '/docs/admin',
  source: adminDocs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  icon(icon) {
      if (!icon) {
        // You may set a default icon
        return;
      }
      if (icon in icons) return createElement(icons[icon as keyof typeof icons]);
    },
});
