"use client";

import { useState } from "react";
import { api } from '~/trpc/react';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { Copy, ExternalLink, Eye, Trash2, QrCode, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from 'next/image';

export default function ShortLinksPage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [description, setDescription] = useState("");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const utils = api.useUtils();

  const { data: myLinks, isPending } = api.shortLink.getMyLinks.useQuery({
    limit: 50,
  });

  const createMutation = api.shortLink.create.useMutation({
    onSuccess: () => {
      toast.success("Link created successfully", {
        description: "Your short link is ready to use",
      });
      setOriginalUrl("");
      setCustomSlug("");
      setDescription("");
      void utils.shortLink.getMyLinks.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const deleteMutation = api.shortLink.delete.useMutation({
    onSuccess: () => {
      toast.success("Link deleted", {
        description: "The short link has been deleted",
      });
      void utils.shortLink.getMyLinks.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const generateQRMutation = api.shortLink.generateQRCode.useMutation({
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCode);
      setQrDialogOpen(true);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    if (!originalUrl) {
      toast.error("Error", {
        description: "Please enter a URL",
      });
      return;
    }

    createMutation.mutate({
      originalUrl,
      slug: customSlug || undefined,
      description: description || undefined,
    });
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    void navigator.clipboard.writeText(url);
    toast.success("Copied", {
      description: "Link copied to clipboard",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleGenerateQR = (slug: string) => {
    setSelectedSlug(slug);
    generateQRMutation.mutate({ slug, size: 512 });
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qr-${selectedSlug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create Short Link</CardTitle>
          <CardDescription>
            Enter a URL to generate a short link with QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="original-url">Original URL</Label>
            <Input
              id="original-url"
              type="url"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-slug">Custom Slug (Optional)</Label>
            <Input
              id="custom-slug"
              type="text"
              placeholder="my-custom-slug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this link"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? "Creating..." : "Create Short Link"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Links</CardTitle>
          <CardDescription>
            Manage and track your shortened links
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : !myLinks?.links.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No links created yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Link</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLinks.links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono">{link.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {link.clicks}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(link.createdAt), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.isActive ? "default" : "secondary"}>
                        {link.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateQR(link.slug)}
                          disabled={generateQRMutation.isPending}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(link.slug)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/s/${link.slug}`, "_blank")
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access the short link
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <>
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-full max-w-sm border rounded-lg"
                  width={200}
                  height={200}
                />
                <Button onClick={downloadQRCode} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
