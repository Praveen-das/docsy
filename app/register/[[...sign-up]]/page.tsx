"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";
import { AuthLayout, CLERK_AUTH_APPEARANCE } from "@/components/layout/auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start ingesting documents and asking grounded questions with AI"
    >
      <SignUp
        appearance={CLERK_AUTH_APPEARANCE}
        routing="path"
        path="/register"
        signInUrl="/login"
        forceRedirectUrl="/"
      />
    </AuthLayout>
  );
}
