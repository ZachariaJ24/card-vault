"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import AppLayout from "@/components/AppLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

interface Props {
  user: User;
  profile: Profile | null;
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "#64748b" },
  pro: { label: "Pro", color: "#f59e0b" },
  premium: { label: "Premium", color: "#00b4ff" },
};

export default function SettingsClient({ user, profile }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isAdmin = profile?.is_admin === true;
  const tier = profile?.subscription_tier ?? "free";
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS.free;

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileMsg("");
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setProfileMsg(error ? error.message : "Profile updated!");
    setSavingProfile(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErr("");
    setPwMsg("");
    if (newPw !== confirmPw) { setPwErr("Passwords don't match."); return; }
    if (newPw.length < 6) { setPwErr("Password must be at least 6 characters."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) setPwErr(error.message);
    else { setPwMsg("Password updated successfully!"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    setPwLoading(false);
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const inputClassNames = {
    inputWrapper: "bg-[#060d18] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
    input: "text-white",
    label: "text-[#64748b]",
  };

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Settings</h1>
          <p className="text-[#64748b] mt-1 text-sm">Manage your account and preferences.</p>
        </div>

        {/* Account info */}
        <Card className="card-glass mb-5" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-circle-bold" className="text-[#00b4ff]" width={20} />
              <h2 className="font-bold text-white">Account</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5 gap-4">
            <div className="flex items-center justify-between py-3 border-b border-[#00b4ff]/10">
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">Email</p>
                <p className="text-white font-medium">{user.email}</p>
              </div>
              <Chip size="sm" className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Verified</Chip>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[#00b4ff]/10">
              <div>
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">Subscription</p>
                <p className="font-medium" style={{ color: tierInfo.color }}>{tierInfo.label}</p>
              </div>
              {tier === "free" && (
                <Button as="a" href="/pricing" size="sm"
                  className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold">
                  Upgrade
                </Button>
              )}
            </div>

            {isAdmin && (
              <div className="py-3 border-b border-[#00b4ff]/10">
                <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">Role</p>
                <Chip size="sm" className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Administrator</Chip>
              </div>
            )}

            <div className="py-3">
              <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">Member Since</p>
              <p className="text-white">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Display name */}
        <Card className="card-glass mb-5" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:pen-bold" className="text-[#f59e0b]" width={20} />
              <h2 className="font-bold text-white">Display Name</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onValueChange={setDisplayName}
              placeholder={user.email?.split("@")[0]}
              variant="bordered"
              classNames={inputClassNames}
            />
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes("!") ? "text-[#22c55e]" : "text-[#ef4444]"}`}>{profileMsg}</p>
            )}
            <Button onPress={handleSaveProfile} isLoading={savingProfile}
              className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 self-start">
              Save Changes
            </Button>
          </CardBody>
        </Card>

        {/* Change password */}
        <Card className="card-glass mb-5" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:lock-password-bold" className="text-[#22c55e]" width={20} />
              <h2 className="font-bold text-white">Change Password</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <Input type="password" label="New Password" value={newPw} onValueChange={setNewPw}
                minLength={6} isRequired variant="bordered" classNames={inputClassNames} />
              <Input type="password" label="Confirm New Password" value={confirmPw} onValueChange={setConfirmPw}
                isRequired variant="bordered" classNames={inputClassNames} />
              {pwErr && <p className="text-sm text-[#ef4444]">{pwErr}</p>}
              {pwMsg && <p className="text-sm text-[#22c55e]">{pwMsg}</p>}
              <Button type="submit" isLoading={pwLoading}
                className="bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 self-start">
                Update Password
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card className="card-glass border-[#ef4444]/20" radius="lg">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:danger-bold" className="text-[#ef4444]" width={20} />
              <h2 className="font-bold text-[#ef4444]">Danger Zone</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white text-sm">Delete Account</p>
                <p className="text-xs text-[#64748b] mt-0.5">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <Button size="sm" variant="flat" className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                onPress={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Delete confirm modal */}
      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen} size="sm"
        classNames={{ base: "bg-[#0a1628] border border-[#ef4444]/20" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-[#ef4444]">Delete Account?</ModalHeader>
              <ModalBody>
                <p className="text-[#64748b] text-sm">
                  This will permanently delete your account, portfolio, watchlist, and all settings. This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-[#64748b]">Cancel</Button>
                <Button onPress={handleDeleteAccount} isLoading={deleteLoading}
                  className="bg-[#ef4444] text-white font-bold">
                  Yes, Delete Everything
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
