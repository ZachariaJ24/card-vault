"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, Divider, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { ScrollingTicker } from "@/components/heroui-pro";
import { TICKER_DATA } from "@/lib/mock-data";

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
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/settings` });
        if (error) throw error;
        setMessage("Check your email for a reset link.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Account created! Check email to confirm, then sign in.");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, string> = { login: "Sign in", signup: "Create account", reset: "Reset password" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Ticker at top for brand feel */}
      <ScrollingTicker items={TICKER_DATA} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-black text-sm text-black">
                CV
              </div>
              <span className="text-xl font-semibold tracking-tight">CardVault</span>
            </Link>
            <p className="text-default-400 text-sm">
              {mode === "login" && "Sign in to access the market"}
              {mode === "signup" && "Start tracking your collection"}
              {mode === "reset" && "We'll send you a reset link"}
            </p>
          </div>

          <Card className="border border-default-200 bg-content1" shadow="sm">
            <CardBody className="p-6">
              <h1 className="text-base font-semibold mb-4">{titles[mode]}</h1>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onValueChange={setEmail}
                  placeholder="you@example.com"
                  isRequired
                  autoComplete="email"
                  variant="bordered"
                  size="sm"
                  startContent={<Icon icon="solar:letter-linear" className="text-default-400" width={16} />}
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
                    size="sm"
                    startContent={<Icon icon="solar:lock-password-linear" className="text-default-400" width={16} />}
                    endContent={
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-default-400 hover:text-foreground">
                        <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} width={16} />
                      </button>
                    }
                    classNames={{ inputWrapper: "border-default-300" }}
                  />
                )}

                {mode === "login" && (
                  <div className="text-right -mt-1">
                    <button type="button" onClick={() => setMode("reset")} className="text-[0.7rem] text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs">
                    <Icon icon="solar:danger-circle-linear" width={14} className="shrink-0" />
                    {error}
                  </div>
                )}
                {message && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 text-success text-xs">
                    <Icon icon="solar:check-circle-linear" width={14} className="shrink-0" />
                    {message}
                  </div>
                )}

                <Button type="submit" isLoading={loading} fullWidth color="primary" size="sm" className="font-medium mt-1">
                  {loading ? "Please wait..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                </Button>
              </form>

              <Divider className="my-4" />

              <div className="text-center text-xs text-default-500">
                {mode === "login" && (<>No account? <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="text-primary hover:underline font-medium">Sign up free</button></>)}
                {mode === "signup" && (<>Have an account? <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-primary hover:underline font-medium">Sign in</button></>)}
                {mode === "reset" && (<button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-primary hover:underline font-medium">&larr; Back to sign in</button>)}
              </div>
            </CardBody>
          </Card>

          <p className="text-center text-[0.65rem] text-default-400 mt-4">
            Midnight Studios &middot; <Link href="/pricing" className="hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
