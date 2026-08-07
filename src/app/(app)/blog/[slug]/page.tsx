import { RichText } from '@payloadcms/richtext-lexical/react';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { api } from '~/trpc/server';

async function getPost(slug: string) {
  try {
    const data = await api.payload.getPost({ slug });

    return data;
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.meta?.title || post.title,
    description: post.meta?.description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const authors = Array.isArray(post.authors)
    ? post.authors
        .map((a) => (typeof a === 'object' ? a : null))
        .filter((a): a is NonNullable<typeof a> => a !== null)
    : [];
  const featuredImageUrl =
    typeof post.featuredImage === 'object' && post.featuredImage?.url
      ? post.featuredImage.url
      : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Button>
      </Link>

      <article>
        {featuredImageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-8">
            <img
              src={featuredImageUrl}
              alt={typeof post.featuredImage === 'object' ? post?.featuredImage?.alt : post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mb-6">
          {post.category && (
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
          )}
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              {post.publishedAt && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                </div>
              )}
            </div>
            {authors.length > 0 && (
              <div className="flex items-center gap-3">
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
            )}
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            <Tag className="w-4 h-4 text-muted-foreground" />
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {post.excerpt && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">{post.excerpt}</p>
        )}

        <div className="prose dark:prose-invert max-w-none">
          <RichText data={post.content} />
        </div>
      </article>
    </div>
  );
}
