"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { ProfileAvatar } from "./profile-avatar";
import { editProfileSchema, type EditProfileInput } from "~/lib/schema/profile";
import { Loader2, Save, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Separator } from "~/components/ui/separator";

type User = {
  id: string;
  name: string;
  email: string;
  nim: string | null;
  faculty: string | null;
  program: string | null;
  position: string | null;
  role: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: () => void;
}

export function EditProfileDialog({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditProfileDialogProps) {
  const utils = api.useUtils();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.user.getCurrentUser.invalidate();
      toast.success("Profile updated successfully!");
      onUpdate();
      handleClose();
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile. Please try again.");
    },
  });

  const form = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user.name,
      position: user.position ?? "",
      image: user.image ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: user.name,
        position: user.position ?? "",
        image: user.image ?? "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [isOpen, user]);

  const onSubmit = (data: EditProfileInput) => {
    updateProfileMutation.mutate({
      name: data.name,
      position: data.position ?? undefined,
      image: data.image ?? undefined,
      currentPassword: data.currentPassword ?? undefined,
      newPassword: data.newPassword ?? undefined,
    });
  };

  const handleImageChange = (image: string) => {
    form.setValue("image", image, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleClose = () => {
    if (!updateProfileMutation.isPending) {
      form.reset();
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center space-y-2">
              <ProfileAvatar
                src={form.watch("image") ?? user.image ?? undefined}
                name={user.name}
                size="xl"
                editable
                onImageChange={handleImageChange}
              />
              <p className="text-sm text-muted-foreground">
                Click on the avatar to change your profile picture
              </p>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        disabled={updateProfileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Student, Teaching Assistant, Lecturer"
                        {...field}
                        disabled={updateProfileMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Your role or position in the organization
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Read-only fields */}
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              {user.nim && (
                <div>
                  <Label>NIM</Label>
                  <Input value={user.nim} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground mt-1">
                    NIM cannot be changed
                  </p>
                </div>
              )}

              {user.faculty && (
                <div>
                  <Label>Faculty</Label>
                  <Input value={user.faculty} disabled className="bg-muted" />
                </div>
              )}

              {user.program && (
                <div>
                  <Label>Program</Label>
                  <Input value={user.program} disabled className="bg-muted" />
                </div>
              )}
            </div>

            <Separator />

            {/* Password Change Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                  Leave blank if you don't want to change your password
                </p>
              </div>

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                          disabled={updateProfileMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          disabled={updateProfileMutation.isPending}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          {...field}
                          disabled={updateProfileMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={updateProfileMutation.isPending}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Must be at least 8 characters with uppercase, lowercase,
                      and numbers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          {...field}
                          disabled={updateProfileMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={updateProfileMutation.isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateProfileMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  updateProfileMutation.isPending || !form.formState.isDirty
                }
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
