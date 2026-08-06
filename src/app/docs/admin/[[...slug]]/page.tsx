import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMDXComponents } from '~/components/mdx';
import { adminSource } from '~/lib/source';

export default async function Page(props: PageProps<'/docs/admin/[[...slug]]'>) {
  const params = await props.params;
  const page = adminSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(adminSource, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return adminSource.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/docs/admin/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = adminSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
