import { createFromSource } from 'fumadocs-core/search/server';
import { adminSource } from '~/lib/source';

export const { GET } = createFromSource(adminSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'multilingual',
});
