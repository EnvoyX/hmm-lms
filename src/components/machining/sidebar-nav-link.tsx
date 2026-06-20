"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useSidebar } from "~/components/ui/sidebar";

/**
 * Closes the mobile sheet sidebar on tap, without waiting for the route
 * change (avoids the drawer staying open while the next page loads).
 */
export function SidebarNavLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Link
      {...props}
      onClick={(e) => {
        if (isMobile) setOpenMobile(false);
        onClick?.(e);
      }}
    />
  );
}
