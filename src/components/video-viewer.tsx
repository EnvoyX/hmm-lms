'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Video, Download, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoFile {
  id: string;
  title: string;
  description: string | null;
  filename: string;
  key: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  uploadedBy: {
    name: string;
  };
}

interface VideoViewerProps {
  video: VideoFile;
}

export default function VideoViewer({ video }: VideoViewerProps) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const getVideoUrl = (videoId: string) => {
    return `/api/videos/${videoId}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(getVideoUrl(video.id));
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = video.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Video downloaded successfully');
    } catch {
      toast.error('Failed to download video');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3">
        <Video className="h-8 w-8 text-blue-500" />
        <div>
          <h4 className="font-medium">{video.title}</h4>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(video.size)} • Uploaded {formatDate(video.createdAt)} by {video.uploadedBy.name}
          </p>
          {video.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {video.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Watch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>{video.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <video
                controls
                className="w-full h-full rounded"
                src={getVideoUrl(video.id)}
                poster={`/api/videos/${video.id}/thumbnail`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}