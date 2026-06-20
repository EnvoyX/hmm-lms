"use client";

import { api } from "~/trpc/react";
import { Role } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EditUserDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditUserDialog({
  userId,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nim: "",
    faculty: "",
    program: "",
    position: "",
    role: Role.STUDENT as Role,
  });

  const { data: user, isLoading } = api.user.getById.useQuery(
    { id: userId },
    { enabled: open }
  );

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      onOpenChange(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        nim: user.nim,
        faculty: user.faculty ?? "",
        program: user.program ?? "",
        position: user.position ?? "",
        role: user.role,
      });
    }
  }, [user]);

  const handleSave = () => {
    if (!user) return;

    updateUser.mutate({
      id: user.id,
      ...formData,
      faculty: formData.faculty ?? undefined,
      program: formData.program ?? undefined,
      position: formData.position ?? undefined,
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) return null;

  const resetPassword = api.auth.resetPasswordByAdmin.useMutation({
    onSuccess: (data) => {
      // Show the new password so the admin can copy it
      toast.success(`Password reset. New password: ${data.newPassword}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nim">NIM</Label>
            <Input
              id="nim"
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Input
              id="faculty"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={resetPassword.isPending || !user}
            onClick={() => {
              if (!user) return;
              const ok = window.confirm(
                `Reset password for ${user.name}? The user will lose their current password.`,
              );
              if (!ok) return;
              resetPassword.mutate({ userId: user.id });
            }}
          >
            Reset password
          </Button>

          <Button onClick={handleSave} disabled={updateUser.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}