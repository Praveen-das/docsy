"use client";

import React from "react";
import { SignIn } from "@clerk/nextjs";
import { AuthLayout, CLERK_AUTH_APPEARANCE } from "@/components/layout/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your credentials to access your documents and conversations"
    >
      <SignIn
        appearance={CLERK_AUTH_APPEARANCE}
        routing="path"
        path="/login"
        signUpUrl="/register"
        forceRedirectUrl="/"
      />
    </AuthLayout>
  );
}
