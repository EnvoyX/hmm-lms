'use client';

import {
  File, Link as LinkIcon, Download, Youtube, FileText, Presentation, BookOpen, Video, FileQuestion, Star
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import type { Prisma } from '@prisma/client';
import { formatBytes } from '~/lib/utils';

export type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: {
    attachment: true;
    link: true;
    uploadedBy: { select: { name: true } };
  };
}>;

interface ResourceItemProps {
  resource: ResourceWithDetails;
  onViewResource: (resource: ResourceWithDetails) => void;
}

const getCategoryIcon = (category: string | null) => {
  // Using theme colors: info, warning, success, error, primary
  switch (category) {
    case 'E_BOOK': return <BookOpen className="h-5 w-5 text-primary" />;
    case 'PRESENTATION': return <Presentation className="h-5 w-5 text-info" />;
    case 'NOTES': return <FileText className="h-5 w-5 text-warning" />;
    case 'VIDEO': return <Video className="h-5 w-5 text-error" />;
    case 'PROBLEMS': return <FileQuestion className="h-5 w-5 text-primary" />;
    case 'SYLLABUS': return <Star className="h-5 w-5 text-success" />;
    default: return <File className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function ResourceItem({ resource, onViewResource }: ResourceItemProps) {
  const icon = getCategoryIcon(resource.category);

  if (resource.type === 'LINK' && resource.link) {
    return (
      <button
        onClick={() => onViewResource(resource)}
        className="w-full text-left flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium break-words">{resource.title}</p>
          {resource.description && (
            <p className="text-sm text-muted-foreground mt-1 break-words">{resource.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {resource.link.source === "YOUTUBE" && <Youtube className="h-4 w-4 text-error" />}
            {resource.link.source === "GOOGLE_DRIVE" && <File className="h-4 w-4 text-primary" />}
            <span className="text-xs text-muted-foreground font-medium">{resource.link.source.replace('_', ' ')}</span>
            <LinkIcon className="h-3 w-3 text-muted-foreground/50 ml-1" />
          </div>
        </div>
      </button>
    );
  }

  if (resource.type === 'FILE' && resource.attachment) {
    return (
      <button
        onClick={() => onViewResource(resource)}
        className="w-full text-left flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex-shrink-0 mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium break-words">{resource.title}</p>
          <p className="text-sm text-muted-foreground mt-1 break-words">{resource.attachment.filename}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{formatBytes(resource.attachment.size)}</span>
            <Download className="h-3 w-3 text-muted-foreground/50" />
          </div>
        </div>
      </button>
    );
  }

  return null;
}