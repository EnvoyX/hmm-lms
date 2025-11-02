import { z } from "zod";

export const editProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    position: z
      .string()
      .max(200, "Position is too long")
      .optional()
      .or(z.literal("")),
    image: z.string().optional().or(z.literal("")),
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    // Check if user is trying to change password
    const hasNewPassword =
      data.newPassword && data.newPassword.trim().length > 0;
    const hasCurrentPassword =
      data.currentPassword && data.currentPassword.trim().length > 0;

    // If trying to set new password
    if (hasNewPassword) {
      // Current password is required
      if (!hasCurrentPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current password is required to set a new password",
          path: ["currentPassword"],
        });
      }

      // Validate new password format
      if (data.newPassword && data.newPassword.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters",
          path: ["newPassword"],
        });
      }

      if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword!))) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          path: ["newPassword"],
        });
      }
    }

    // Validate image URL if provided
    if (data.image && data.image.trim().length > 0) {
      try {
        new URL(data.image);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid image URL",
          path: ["image"],
        });
      }
    }
  });

export type EditProfileInput = z.infer<typeof editProfileSchema>;
