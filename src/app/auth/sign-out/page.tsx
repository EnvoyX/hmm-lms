"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
  useEffect(() => {
    void signOut({ callbackUrl: "/auth/sign-in" });
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
      <span>Signing you out...</span>
    </div>
  );
}
