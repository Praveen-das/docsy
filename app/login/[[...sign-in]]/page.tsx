"use client";

import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-zinc-50 py-12 sm:px-6 lg:px-8 text-zinc-900 dark:bg-[#09090b] dark:text-[#f4f4f5] transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link
          href="/"
          className="inline-flex items-center mb-5 group focus-visible:outline-none"
          title="Docsy AI Home"
        >
          <Logo size="lg" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Enter your credentials to access your documents and conversations
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md flex justify-center">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#121216] dark:shadow-2xl w-full",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary:
                "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-sm font-semibold",
              footerActionLink:
                "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white",
            },
          }}
          routing="path"
          path="/login"
          signUpUrl="/register"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
