import { createFromSource } from 'fumadocs-core/search/server';
import { userSource } from '~/lib/source';

export const { GET } = createFromSource(userSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: 'multilingual',
});
