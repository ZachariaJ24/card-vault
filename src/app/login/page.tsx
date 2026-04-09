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
    <div className="min-h-screen bg-[#060d18] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,180,255,0.07) 0%, transparent 55%)" }}
      />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-[#060d18]"
              style={{ background: "linear-gradient(135deg, #00b4ff, #0088cc)" }}>
              CV
            </div>
            <span className="text-2xl font-bold text-white">CardVault</span>
          </Link>
          <p className="text-[#64748b] text-sm mt-2">{subtitles[mode]}</p>
        </div>

        <Card className="card-glass glow-blue" radius="lg">
          <CardBody className="p-8">
            <h1 className="text-xl font-bold text-white mb-6">{titles[mode]}</h1>

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
                startContent={<Icon icon="solar:letter-bold" className="text-[#64748b]" width={18} />}
                classNames={{
                  inputWrapper: "bg-[#060d18] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
                  input: "text-white",
                  label: "text-[#64748b]",
                }}
              />

              {mode !== "reset" && (
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  value={password}
                  onValueChange={setPassword}
                  placeholder="••••••••"
                  isRequired
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  variant="bordered"
                  startContent={<Icon icon="solar:lock-password-bold" className="text-[#64748b]" width={18} />}
                  endContent={
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-[#64748b] hover:text-white">
                      <Icon icon={showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} width={18} />
                    </button>
                  }
                  classNames={{
                    inputWrapper: "bg-[#060d18] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
                    input: "text-white",
                    label: "text-[#64748b]",
                  }}
                />
              )}

              {mode === "login" && (
                <div className="text-right -mt-2">
                  <button type="button" onClick={() => setMode("reset")}
                    className="text-xs text-[#00b4ff] hover:text-white transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                  <Icon icon="solar:danger-bold" width={16} />
                  {error}
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-sm">
                  <Icon icon="solar:check-circle-bold" width={16} />
                  {message}
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold mt-2"
              >
                {loading ? "Please wait…" : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
              </Button>
            </form>

            <Divider className="my-5 bg-[#00b4ff]/10" />

            <div className="text-center text-sm text-[#64748b]">
              {mode === "login" && (
                <>
                  Don&apos;t have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                    className="text-[#00b4ff] hover:text-white transition-colors font-medium">
                    Sign up free
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                    className="text-[#00b4ff] hover:text-white transition-colors font-medium">
                    Sign in
                  </button>
                </>
              )}
              {mode === "reset" && (
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }}
                  className="text-[#00b4ff] hover:text-white transition-colors font-medium">
                  ← Back to sign in
                </button>
              )}
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-[#64748b] mt-5">
          A <span className="text-[#00b4ff]">Midnight Studios</span> product · By signing up you agree to our{" "}
          <Link href="/pricing" className="hover:text-white transition-colors">Terms</Link>
        </p>
      </div>
    </div>
  );
}
