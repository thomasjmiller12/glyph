"use client";

import Nav from "@/components/Nav";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A0B]">
      <Nav />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="text-2xl font-bold text-[#E8E8E8]">Sign In</h1>
          <p className="text-sm text-[#8B8B8B]">
            Sign in to save your stats across sessions.
          </p>
          <div className="space-y-3">
            <button
              disabled
              className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] py-3 text-[#8B8B8B] opacity-50"
            >
              Continue with Google (Coming Soon)
            </button>
            <button
              disabled
              className="w-full rounded-lg border border-[#2A2A2E] bg-[#141416] py-3 text-[#8B8B8B] opacity-50"
            >
              Continue with GitHub (Coming Soon)
            </button>
          </div>
          <p className="text-xs text-[#5A5A5E]">
            Anonymous play works without signing in. Your stats will be saved locally.
          </p>
        </div>
      </main>
    </div>
  );
}
