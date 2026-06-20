import type { Role } from '~/app/generated/prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  nim?: string;
  faculty?: string;
  program?: string;
  position?: string;
  role: Role;
  image?: string;
  courseCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
