"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "login" | "signup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/settings`,
        });
        if (error) throw error;
        setMessage("Check your email for a reset link.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = {
    login: "Welcome back",
    signup: "Create your account",
    reset: "Reset password",
  };
  const subtitles: Record<Mode, string> = {
    login: "Sign in to your CardVault account",
    signup: "Start tracking your collection for free",
    reset: "Enter your email to receive a reset link",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-black text-sm text-white">
              CV
            </div>
            <span className="text-xl font-semibold">CardVault</span>
          </Link>
          <p className="text-default-500 text-sm mt-3">{subtitles[mode]}</p>
        </div>

        <Card className="border border-default-200 bg-content1" shadow="sm">
          <CardBody className="p-6">
            <h1 className="text-lg font-semibold mb-5">{titles[mode]}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                value={email}
                onValueChange={setEmail}
                placeholder="you@example.com"
                isRequired
                autoComplete="email"
                variant="bordered"
                startContent={<Icon icon="solar:letter-linear" className="text-default-400" width={18} />}
                classNames={{ inputWrapper: "border-default-300" }}
              />

              {mode !== "reset" && (
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  value={password}
                  onValueChange={setPassword}
                  placeholder="Enter password"
                  isRequired
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  variant="bordered"
                  startContent={<Icon icon="solar:lock-password-linear" className="text-default-400" width={18} />}
                  endContent={
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-default-400 hover:text-foreground">
                      <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} width={18} />
                    </button>
                  }
                  classNames={{ inputWrapper: "border-default-300" }}
                />
              )}

              {mode === "login" && (
                <div className="text-right -mt-2">
                  <button type="button" onClick={() => setMode("reset")}
                    className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/10 text-danger text-sm">
                  <Icon icon="solar:danger-circle-linear" width={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-success/10 text-success text-sm">
                  <Icon icon="solar:check-circle-linear" width={16} className="shrink-0" />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                fullWidth
                color="primary"
                className="font-medium mt-1"
              >
                {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </Button>
            </form>

            <Divider className="my-5" />

            <div className="text-center text-sm text-default-500">
              {mode === "login" && (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                    className="text-primary hover:underline font-medium">
                    Sign up free
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                    className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </>
              )}
              {mode === "reset" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                  className="text-primary hover:underline font-medium">
                  &larr; Back to sign in
                </button>
              )}
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-default-400 mt-5">
          Midnight Studios &middot; By signing up you agree to our{" "}
          <Link href="/pricing" className="hover:underline">Terms</Link>
        </p>
      </div>
    </div>
  );
}
