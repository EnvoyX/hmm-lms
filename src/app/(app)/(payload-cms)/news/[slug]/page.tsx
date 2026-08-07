import { RichText } from '@payloadcms/richtext-lexical/react';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RefreshRouteOnSave } from '~/components/payload/RefreshRouteOnSave';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { api } from '~/trpc/server';

async function getNewsItem(slug: string) {
  try {
    const data = await api.payload.getNewsItem({ slug });

    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const newsItem = await getNewsItem(slug);

  if (!newsItem) {
    return {
      title: 'News Not Found',
    };
  }

  return {
    title: newsItem.title,
    description: newsItem.summary,
  };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const newsItem = await getNewsItem(slug);

  if (!newsItem) {
    notFound();
  }

  const authors = Array.isArray(newsItem.authors)
    ? newsItem.authors
        .map((a) => (typeof a === 'object' ? a : null))
        .filter((a): a is NonNullable<typeof a> => a !== null)
    : [];

  const featuredImageUrl =
    typeof newsItem.featuredImage === 'object' && newsItem.featuredImage?.url
      ? newsItem.featuredImage.url
      : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <RefreshRouteOnSave />
      <Link href="/news">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to News
        </Button>
      </Link>

      <article>
        {featuredImageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={featuredImageUrl}
              alt={
                typeof newsItem.featuredImage === 'object'
                  ? newsItem?.featuredImage?.alt
                  : newsItem.title
              }
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-4">{newsItem.title}</h1>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              {newsItem.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(newsItem.publishedAt), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
            {authors.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 w-fit">
                    <AvatarGroup>
                      {authors.slice(0, 3).map((author) => {
                        const authorName = author.name || author.email || 'Unknown';
                        const authorAvatar =
                          typeof author.avatar === 'object' && author.avatar?.url
                            ? author.avatar.url
                            : null;
                        return (
                          <Avatar key={author.id} className="h-10 w-10 border border-background">
                            {authorAvatar ? (
                              <AvatarImage
                                className="object-cover!"
                                src={authorAvatar}
                                alt={authorName}
                              />
                            ) : null}
                            <AvatarFallback>
                              {authorName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {authors.length - 3 > 0 && (
                        <AvatarGroupCount className="h-10 w-10 border border-background">
                          {`+${authors.length - 3}`}
                        </AvatarGroupCount>
                      )}
                    </AvatarGroup>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {authors.length === 1
                          ? authors[0]?.name || authors[0]?.email
                          : `${authors.length} authors`}
                      </span>
                      {authors.length === 1 && authors[0]?.bio && (
                        <span className="text-sm text-muted-foreground">{authors[0]?.bio}</span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="flex flex-col gap-2 p-3">
                  {authors.map((author) => {
                    const authorName = author.name || author.email || 'Unknown';
                    const authorAvatar =
                      typeof author.avatar === 'object' && author.avatar?.url
                        ? author.avatar.url
                        : null;
                    return (
                      <div key={author.id} className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                          {authorAvatar ? (
                            <AvatarImage
                              className="object-cover!"
                              src={authorAvatar}
                              alt={authorName}
                            />
                          ) : null}
                          <AvatarFallback className="text-xs">
                            {authorName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-xs">{authorName}</span>
                        </div>
                      </div>
                    );
                  })}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {newsItem.tags && newsItem.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {newsItem.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {newsItem.summary && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{newsItem.summary}</p>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <RichText data={newsItem.content} />
        </div>
      </article>
    </div>
  );
}
