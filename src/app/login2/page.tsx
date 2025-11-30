"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter } from "next/navigation";

import { theme } from "../../../config/theme";

import Input from "@/components/v2/ui/inputs/Input";
import Loader from "@/components/v2/other/Loader";
import PageTitle from "@/components/v2/headings/PageTitle";
import PrimaryButton from "@/components/v2/ui/buttons/PrimaryButton";
import MainBackground from "@/components/v2/other/MainBackground";

import { Mail, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false); // Only stop loading on error
      setError(error.message);
    } else {
      // Keep loading state true during navigation
      router.push("/dashboard2");
      // Don't set loading to false - let the next page take over
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setResetMessage(null);

    setResetMessage("If this email exists, a reset link has been sent.");

    setLoading(false);
  };

  return (
    <MainBackground color={theme.colors.background}>
      <div className="flex flex-col items-center justify-start min-h-screen pt-24 sm:pt-40">
        {/* Always render the form, just overlay loading */}
        <div
          className={`w-full flex flex-col items-center ${
            loading ? "opacity-0 pointer-events-none" : "opacity-100"
          } transition-opacity duration-200`}
        >
          <PageTitle text="Sign In" />

          <form onSubmit={handleLogin} className="w-full max-w-md px-4 sm:px-0">
            <div className="space-y-6">
              <Input
                id="email"
                type="email"
                placeholder="corgi-butt@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={true}
                iconComponent={<Mail size={20} />}
                label="Email"
                required
                focusRingColor={theme.colors.secondary}
                disabled={loading}
                className="w-full sm:w-auto" // responsive width
              />

              <div>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={true}
                  iconComponent={<LockKeyhole size={20} />}
                  label="Password"
                  required
                  focusRingColor={theme.colors.secondary}
                  disabled={loading}
                  className="w-full sm:w-auto" // responsive width
                />

                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-sm text-white hover:underline mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
                {resetMessage && (
                  <p className="text-xs text-white/80 mt-1">{resetMessage}</p>
                )}
              </div>

              <PrimaryButton
                text="Sign In"
                type="submit"
                color={theme.colors.secondary}
                className="mt-12 w-full sm:w-auto px-24 mx-auto" // full width on mobile
                disabled={loading}
              />

              <PrimaryButton
                text="Create Account"
                type="button"
                color={theme.colors.accent}
                className="mt-4 w-full sm:w-auto px-10 mx-auto" // full width on mobile
                onClick={() => router.push("/create-account")}
                disabled={loading}
              />

              {error && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Loader overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader
              primaryColor={theme.colors.secondary}
              secondaryColor={theme.colors.accent}
            />
          </div>
        )}
      </div>
    </MainBackground>
  );
}
