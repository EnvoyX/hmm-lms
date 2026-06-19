"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { MessageSquare, ChevronDown, Send, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type RouterOutputs, api } from "~/trpc/react";
import { EditorProvider } from "~/components/ui/shadcn-io/editor";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import MotionImageDialog from "~/components/motion/dialog";

type AnnouncementWithRelations =
  RouterOutputs["announcement"]["getAll"][number];

interface AnnouncementCardProps {
  announcement: AnnouncementWithRelations;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const {
    createdBy,
    course,
    _count,
    createdAt,
    title,
    content,
    scope,
    id,
    images,
  } = announcement;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // Get replies when expanded
  const { data: announcementWithReplies } = api.announcement.getById.useQuery(
    { id },
    { enabled: showReplies },
  );

  const addReplyMutation = api.announcement.addReply.useMutation({
    onSuccess: () => {
      toast.success("Reply added successfully");
      setReplyContent("");
      void utils.announcement.getById.invalidate({ id });
      void utils.announcement.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse the JSON content
  const parsedContent: string =
    typeof content === "string" ? (JSON.parse(content) as string) : content;

  // Check if content height exceeds threshold after editor renders
  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const editorElement = contentRef.current.querySelector(".ProseMirror");
        if (editorElement) {
          const height = editorElement.scrollHeight;
          setShowSeeMore(height > 150);
          return true;
        }
      }
      return false;
    };

    if (checkHeight()) return;

    const observer = new MutationObserver(() => {
      if (checkHeight()) {
        observer.disconnect();
      }
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    const timeout = setTimeout(() => {
      checkHeight();
      observer.disconnect();
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    addReplyMutation.mutate({
      announcementId: id,
      content: replyContent,
    });
  };

  return (
    <Card className="border-border/60 bg-card/80 overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="px-6 py-5 sm:px-7">
        {/* Header Section */}
        <div className="mb-5 flex items-start gap-4">
          <Avatar className="ring-primary/10 h-9 w-9 ring-2">
            <AvatarImage
              src={createdBy.image ?? undefined}
              alt={createdBy.name ?? "User"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(createdBy.name ?? "U")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-foreground text-sm font-semibold">
                {createdBy.name}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              {scope === "COURSE" && course && (
                <Badge variant="secondary" className="text-xs">
                  {course.title}
                </Badge>
              )}
              {scope === "GLOBAL" && (
                <Badge variant="default" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Global
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-foreground mb-3 text-lg font-semibold sm:text-xl">
          {title}
        </h3>

        {/* Images Section */}
        {images && images.length > 0 && (
          <div className="mb-5">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <MotionImageDialog
                    layoutId={`announcement-${id}-image-${index}`}
                    src={imageUrl}
                    alt={`${title} - Image ${index + 1}`}
                    width={500}
                    height={500}
                    className="h-32 w-auto rounded-lg object-cover sm:h-36"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content - Rendered with EditorProvider (read-only) */}
        <div
          ref={contentRef}
          className={`text-foreground relative mb-4 ${
            !isExpanded && showSeeMore ? "max-h-[150px] overflow-hidden" : ""
          }`}
        >
          <EditorProvider
            content={parsedContent}
            editable={false}
            immediatelyRender={false}
            editorProps={{
              attributes: {
                class: "focus:outline-none",
              },
            }}
            className="text-sm leading-relaxed"
          />
          {!isExpanded && showSeeMore && (
            <div className="from-card pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t to-transparent" />
          )}
        </div>

        {/* See More Button */}
        {showSeeMore && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary mb-4 rounded-full px-3"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "See less" : "See more"}
            <ChevronDown
              className={`ml-1 h-4 w-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        )}

        {/* Footer */}
        <div className="border-border flex items-center gap-4 border-t pt-4">
          <button
            className="text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary inline-flex items-center gap-2 rounded-full border border-transparent px-2.5 py-1 text-sm transition-colors"
            onClick={() => setShowReplies(!showReplies)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {_count.replies} {_count.replies === 1 ? "Reply" : "Replies"}
            </span>
          </button>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="border-border/70 mt-4 space-y-4 border-t pt-4">
            {/* Reply Form */}
            <div className="relative">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="border-border bg-background/80 text-foreground focus:ring-primary min-h-[88px] w-full resize-none rounded-xl border p-3 pr-24 text-sm shadow-inner focus:ring-2 focus:outline-none"
                disabled={addReplyMutation.isPending}
              />
              <div className="absolute right-2 bottom-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={addReplyMutation.isPending || !replyContent.trim()}
                >
                  {addReplyMutation.isPending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Reply</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Replies List */}
            {announcementWithReplies?.replies &&
              announcementWithReplies.replies.length > 0 && (
                <div className="space-y-3">
                  {announcementWithReplies.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="border-border/60 bg-muted/35 flex gap-3 rounded-xl border p-3"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={reply.user.image ?? undefined}
                          alt={reply.user.name ?? "User"}
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {getInitials(reply.user.name ?? "U")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-foreground text-xs font-semibold">
                            {reply.user.name}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        <div className="text-foreground text-sm">
                          <p className="">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    </Card>
  );
}
