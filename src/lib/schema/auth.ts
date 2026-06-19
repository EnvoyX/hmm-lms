import z from "zod";

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    nim: z.string().length(8, "NIM must be exactly 8 characters long."),
    email: z
      .string()
      .email("Invalid email address.")
      .endsWith("@mahasiswa.itb.ac.id", "Only ITB student emails are allowed."),
    password: z.string().min(8, "Password must be at least 8 characters long."),
    confirmPassword: z
      .string()
      .min(8, "Confirm Password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
  });

export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  // .regex(/[0-9]{8}@mahasiswa.itb.ac.id$/,
  // {
  //   message: 'Email must be ITB student email',
  // }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' }),
});