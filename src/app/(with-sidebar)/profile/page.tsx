"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ProfileAvatar } from './profile-avatar';
import { EditProfileDialog } from './edit-profile-dialog';
import { User, Mail, GraduationCap, Calendar, Edit, Shield, BookOpen, Tally5 } from "lucide-react";
import { api } from '~/trpc/react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: userStats, isLoading: statsLoading } = api.lessonTracker.getUserStats.useQuery();
  const { data: user, isLoading: userLoading, refetch: refetchUser } = api.user.getCurrentUser.useQuery();

  if (userLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-4">
        <div className="space-y-4">
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array<number>(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array<number>(2)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto p-4">
        <p>User not found</p>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    try {
      await refetchUser();
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to refresh profile data");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "destructive" as const;
      case "ADMIN":
        return "destructive" as const;
      case "STUDENT":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const coverImage =
    typeof user.coverImage === "string" && user.coverImage.length > 0
      ? user.coverImage
      : null;

  return (
    <div className="container mx-auto max-w-6xl space-y-6">
      <section className="rounded-2xl border bg-background">
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl md:h-56">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={`${user.name}'s cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-cyan-100 via-sky-100 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 px-5 pb-6 md:px-8">
          <div className="-mt-16 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              <div className="relative shrink-0">
                <ProfileAvatar
                  src={user.image ?? ""}
                  name={user.name}
                  size="xl"
                  className="rounded-full ring-4 ring-background"
                />
                <div className="absolute -bottom-1 -right-1">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    <Shield className="mr-1 h-3 w-3" />
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-semibold">{user.name}</h1>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {user.nim && (
                    <p className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>NIM: {user.nim}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setIsEditDialogOpen(true)} className="w-fit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-muted/30 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Courses</span>
          </div>
          <p className="text-2xl font-semibold">
            {statsLoading ? <span className="inline-block h-8 w-8 animate-pulse rounded bg-muted" /> : userStats?.activeCourses ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Active Courses</p>
        </div>

        <div className="rounded-xl border bg-muted/30 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Progress</span>
          </div>
          <p className="text-2xl font-semibold">
            {statsLoading ? <span className="inline-block h-8 w-8 animate-pulse rounded bg-muted" /> : userStats?.weeklyMinutes ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Weekly Learning Minutes</p>
        </div>

        <div className="rounded-xl border bg-muted/30 px-4 py-4">
          <div className="mb-2 flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Tally5 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Tryouts</span>
          </div>
          <p className="text-2xl font-semibold">
            {statsLoading ? <span className="inline-block h-8 w-8 animate-pulse rounded bg-muted" /> : userStats?.totalTryouts ?? 0}
          </p>
          <p className="text-sm text-muted-foreground">Tryout Attempts</p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-background px-5 py-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <GraduationCap className="h-4 w-4" />
            Academic Information
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Faculty</p>
              <p className="text-sm">{user.faculty ?? "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Program</p>
              <p className="text-sm">{user.program ?? "Not specified"}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Position</p>
              <p className="text-sm">{user.position ?? "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-background px-5 py-5">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-4 w-4" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Member Since</p>
              <p className="text-sm">{formatDate(user.createdAt)}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}