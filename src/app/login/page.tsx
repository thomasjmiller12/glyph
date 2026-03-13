"use client";

import Nav from "@/components/Nav";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-primary">Sign In</h1>
          <p className="text-sm text-secondary">
            Sign in to save your stats across sessions.
          </p>
          <div className="space-y-3">
            <button
              disabled
              className="w-full rounded-lg border border-border bg-surface py-3 text-secondary opacity-50"
            >
              Continue with Google (Coming Soon)
            </button>
            <button
              disabled
              className="w-full rounded-lg border border-border bg-surface py-3 text-secondary opacity-50"
            >
              Continue with GitHub (Coming Soon)
            </button>
          </div>
          <p className="text-xs text-placeholder">
            Anonymous play works without signing in. Your stats will be saved locally.
          </p>
        </div>
      </main>
    </div>
  );
}
