'use client';

import { api } from '~/trpc/react';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EditorProvider } from '~/components/ui/shadcn-io/editor';
import type { Content } from '@tiptap/core';

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: announcement, isLoading } = api.announcement.getById.useQuery({
    id,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-40 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Announcement not found</p>
          </Card>
        </div>
      </div>
    );
  }

  const { createdBy, course, replies, createdAt, title, content, scope } = announcement;

  // Parse the JSON content
  const parsedContent: string = typeof content === 'string' ? JSON.parse(content) as string : content;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Announcement Card */}
      <Card className="overflow-hidden border-l-4 border-l-primary">
        <div className="p-8">
          {/* Header Section */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={createdBy.image ?? undefined}
                alt={createdBy.name ?? 'User'}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(createdBy.name ?? 'U')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg text-foreground">
                  {createdBy.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                {scope === 'COURSE' && course && (
                  <Badge variant="secondary" className="text-xs">
                    {course.title}
                  </Badge>
                )}
                {scope === 'GLOBAL' && (
                  <Badge variant="default" className="text-xs">
                    Global
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>

          {/* Content */}
          <div className="text-foreground mb-6">
            <EditorProvider
              content={parsedContent}
              editable={false}
              immediatelyRender={false}
              editorProps={{
                attributes: {
                  class: 'focus:outline-none',
                },
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Replies Section */}
      <div id="replies" className="mt-6">
        {replies.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground mb-4">Replies</h2>
            {replies.map((reply) => (
              <Card key={reply.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={reply.user.image ?? undefined}
                      alt={reply.user.name ?? 'User'}
                    />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {getInitials(reply.user.name ?? 'U')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-foreground">
                        {reply.user.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-foreground">
                      <EditorProvider
                        content={
                          (typeof reply.content === 'string'
                            ? JSON.parse(reply.content)
                            : reply.content) as Content
                        }
                        editable={false}
                        immediatelyRender={false}
                        editorProps={{
                          attributes: {
                            class: 'focus:outline-none',
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
