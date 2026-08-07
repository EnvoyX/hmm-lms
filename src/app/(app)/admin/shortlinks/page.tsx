"use client";

import { useState } from "react";
import { api } from '~/trpc/react';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import {
  Copy,
  ExternalLink,
  Eye,
  Trash2,
  Search,
  BarChart3,
  QrCode,
  Download,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Image from 'next/image';
import Link from 'next/link';

export default function AdminShortLinksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const utils = api.useUtils();

  const { data: stats } = api.shortLink.getStats.useQuery();

  const { data: allLinks, isLoading } = api.shortLink.getAllLinks.useQuery({
    limit: 50,
    search: search || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
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

  const adminDeleteMutation = api.shortLink.adminDelete.useMutation({
    onSuccess: () => {
      toast.success("Link deleted", {
        description: "The short link has been deleted",
      });
      void utils.shortLink.getAllLinks.invalidate();
      void utils.shortLink.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const adminUpdateMutation = api.shortLink.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Link updated", {
        description: "The short link has been updated",
      });
      void utils.shortLink.getAllLinks.invalidate();
      void utils.shortLink.getStats.invalidate();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    void navigator.clipboard.writeText(url);
    toast.success("Copied", {
      description: "Link copied to clipboard",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      adminDeleteMutation.mutate({ id });
    }
  };

  const toggleStatus = (id: string, currentStatus: boolean) => {
    adminUpdateMutation.mutate({
      id,
      isActive: !currentStatus,
    });
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
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Links</h1>
        <Button asChild>
          <Link href='shortlinks/create'>
            Create</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Links</CardDescription>
            <CardTitle className="text-3xl">{stats?.totalLinks ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Links</CardDescription>
            <CardTitle className="text-3xl">{stats?.activeLinks ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              {stats?.totalClicks ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Links Today</CardDescription>
            <CardTitle className="text-3xl">{stats?.linksToday ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Links</CardTitle>
          <CardDescription>
            View and manage all shortened links
          </CardDescription>
          <div className="flex gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by slug, URL, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : !allLinks?.links.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No links found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allLinks.links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono">{link.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {link.originalUrl}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{link.createdBy.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {link.createdBy.email}
                        </span>
                      </div>
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
                      <Badge
                        variant={link.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStatus(link.id, link.isActive)}
                      >
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
