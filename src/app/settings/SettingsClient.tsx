"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import AppLayout from "@/components/AppLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

interface Props {
  user: User;
  profile: Profile | null;
}

const TIER_LABELS: Record<string, { label: string; color: "default" | "warning" | "primary" }> = {
  free: { label: "Free", color: "default" },
  pro: { label: "Pro", color: "warning" },
  premium: { label: "Premium", color: "primary" },
};

export default function SettingsClient({ user, profile }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

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
    else { setPwMsg("Password updated successfully!"); setNewPw(""); setConfirmPw(""); }
    setPwLoading(false);
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-default-500 mt-1 text-sm">Manage your account and preferences.</p>
        </div>

        {/* Account info */}
        <Card className="border border-default-200 bg-content1 mb-5" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-circle-linear" className="text-primary" width={18} />
              <h2 className="font-semibold text-sm">Account</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5 gap-0">
            <div className="flex items-center justify-between py-3 border-b border-default-100">
              <div>
                <p className="text-xs text-default-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
              <Chip size="sm" color="success" variant="flat">Verified</Chip>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-default-100">
              <div>
                <p className="text-xs text-default-400 uppercase tracking-wider mb-0.5">Subscription</p>
                <p className="font-medium text-sm">{tierInfo.label}</p>
              </div>
              {tier === "free" && (
                <Button as="a" href="/pricing" size="sm" color="primary">Upgrade</Button>
              )}
            </div>
            {isAdmin && (
              <div className="py-3 border-b border-default-100">
                <p className="text-xs text-default-400 uppercase tracking-wider mb-0.5">Role</p>
                <Chip size="sm" color="warning" variant="flat">Administrator</Chip>
              </div>
            )}
            <div className="py-3">
              <p className="text-xs text-default-400 uppercase tracking-wider mb-0.5">Member Since</p>
              <p className="text-sm">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Display name */}
        <Card className="border border-default-200 bg-content1 mb-5" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:pen-linear" className="text-warning" width={18} />
              <h2 className="font-semibold text-sm">Display Name</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5 gap-4">
            <Input label="Display Name" value={displayName} onValueChange={setDisplayName}
              placeholder={user.email?.split("@")[0]} variant="bordered"
              classNames={{ inputWrapper: "border-default-300" }} />
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes("!") ? "text-success" : "text-danger"}`}>{profileMsg}</p>
            )}
            <Button onPress={handleSaveProfile} isLoading={savingProfile} variant="flat" color="primary" className="self-start">
              Save Changes
            </Button>
          </CardBody>
        </Card>

        {/* Change password */}
        <Card className="border border-default-200 bg-content1 mb-5" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:lock-password-linear" className="text-success" width={18} />
              <h2 className="font-semibold text-sm">Change Password</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <Input type="password" label="New Password" value={newPw} onValueChange={setNewPw}
                minLength={6} isRequired variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
              <Input type="password" label="Confirm New Password" value={confirmPw} onValueChange={setConfirmPw}
                isRequired variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
              {pwErr && <p className="text-sm text-danger">{pwErr}</p>}
              {pwMsg && <p className="text-sm text-success">{pwMsg}</p>}
              <Button type="submit" isLoading={pwLoading} variant="flat" color="success" className="self-start">
                Update Password
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Danger zone */}
        <Card className="border border-danger/30 bg-content1" shadow="none">
          <CardHeader className="px-5 pt-5 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:danger-circle-linear" className="text-danger" width={18} />
              <h2 className="font-semibold text-sm text-danger">Danger Zone</h2>
            </div>
          </CardHeader>
          <CardBody className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-xs text-default-400 mt-0.5">Permanently delete your account and all data.</p>
              </div>
              <Button size="sm" variant="flat" color="danger" onPress={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-danger">Delete Account?</ModalHeader>
              <ModalBody>
                <p className="text-default-500 text-sm">
                  This will permanently delete your account, portfolio, watchlist, and all settings. This cannot be undone.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button onPress={handleDeleteAccount} isLoading={deleteLoading} color="danger">
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
