import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import bcrypt from "bcryptjs";
import { env } from '~/env';

const SALT_ROUNDS = 10; // The cost factor. Higher is more secure but slower. 10-12 is generally good.

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return hashedPassword;
}

export async function verifyPassword(
  password: string,
  hashedPasswordFromDb: string,
): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPasswordFromDb);
  return isValid;
}

// NEW: Add this function to format bytes into a readable string
export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const getCdnUrl = (key: string) => {
  const cdnEndpoint = env.NEXT_PUBLIC_DO_SPACES_CDN_ENDPOINT;
  if (!cdnEndpoint) {
    console.error("CDN endpoint is not configured. Falling back to API route.");
    return ""; // Or a fallback URL
  }
  return `${cdnEndpoint}/${key}`;
};