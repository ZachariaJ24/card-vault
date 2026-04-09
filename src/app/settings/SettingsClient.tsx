"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import DashboardLayout from "@/components/DashboardLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

interface Props { user: User; profile: Profile | null; }

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
    setSavingProfile(true); setProfileMsg("");
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setProfileMsg(error ? error.message : "Profile updated!"); setSavingProfile(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault(); setPwErr(""); setPwMsg("");
    if (newPw !== confirmPw) { setPwErr("Passwords don't match."); return; }
    if (newPw.length < 6) { setPwErr("Minimum 6 characters."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) setPwErr(error.message); else { setPwMsg("Password updated!"); setNewPw(""); setConfirmPw(""); }
    setPwLoading(false);
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true); await supabase.auth.signOut(); router.push("/"); router.refresh();
  }

  return (
    <DashboardLayout user={user} isAdmin={isAdmin}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-default-400 text-sm mt-0.5">Manage your account and preferences.</p>
        </div>

        <Card className="border border-default-200 bg-content1 mb-4">
          <CardHeader className="px-4 pt-4 pb-0">
            <div className="flex items-center gap-2">
              <Icon icon="solar:user-circle-linear" className="text-primary" width={18} />
              <h2 className="font-semibold text-sm">Account</h2>
            </div>
          </CardHeader>
          <CardBody className="p-4 gap-0">
            <div className="flex items-center justify-between py-3 border-b border-default-100">
              <div><p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-0.5">Email</p><p className="text-sm font-medium">{user.email}</p></div>
              <Chip size="sm" color="success" variant="flat">Verified</Chip>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-default-100">
              <div><p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-0.5">Subscription</p><p className="text-sm font-medium">{tierInfo.label}</p></div>
              {tier === "free" && <Button as="a" href="/pricing" size="sm" color="primary">Upgrade</Button>}
            </div>
            {isAdmin && <div className="py-3 border-b border-default-100"><p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-0.5">Role</p><Chip size="sm" color="warning" variant="flat">Admin</Chip></div>}
            <div className="py-3"><p className="text-[0.65rem] text-default-400 uppercase tracking-wider mb-0.5">Member Since</p><p className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "-"}</p></div>
          </CardBody>
        </Card>

        <Card className="border border-default-200 bg-content1 mb-4">
          <CardHeader className="px-4 pt-4 pb-0"><div className="flex items-center gap-2"><Icon icon="solar:pen-linear" className="text-warning" width={18} /><h2 className="font-semibold text-sm">Display Name</h2></div></CardHeader>
          <CardBody className="p-4 gap-3">
            <Input label="Display Name" value={displayName} onValueChange={setDisplayName} placeholder={user.email?.split("@")[0]} variant="bordered" size="sm" classNames={{ inputWrapper: "border-default-300" }} />
            {profileMsg && <p className={`text-xs ${profileMsg.includes("!") ? "text-success" : "text-danger"}`}>{profileMsg}</p>}
            <Button onPress={handleSaveProfile} isLoading={savingProfile} variant="flat" color="primary" size="sm" className="self-start">Save</Button>
          </CardBody>
        </Card>

        <Card className="border border-default-200 bg-content1 mb-4">
          <CardHeader className="px-4 pt-4 pb-0"><div className="flex items-center gap-2"><Icon icon="solar:lock-password-linear" className="text-success" width={18} /><h2 className="font-semibold text-sm">Change Password</h2></div></CardHeader>
          <CardBody className="p-4">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <Input type="password" label="New Password" value={newPw} onValueChange={setNewPw} minLength={6} isRequired variant="bordered" size="sm" classNames={{ inputWrapper: "border-default-300" }} />
              <Input type="password" label="Confirm" value={confirmPw} onValueChange={setConfirmPw} isRequired variant="bordered" size="sm" classNames={{ inputWrapper: "border-default-300" }} />
              {pwErr && <p className="text-xs text-danger">{pwErr}</p>}
              {pwMsg && <p className="text-xs text-success">{pwMsg}</p>}
              <Button type="submit" isLoading={pwLoading} variant="flat" color="success" size="sm" className="self-start">Update Password</Button>
            </form>
          </CardBody>
        </Card>

        <Card className="border border-danger/30 bg-content1">
          <CardHeader className="px-4 pt-4 pb-0"><div className="flex items-center gap-2"><Icon icon="solar:danger-circle-linear" className="text-danger" width={18} /><h2 className="font-semibold text-sm text-danger">Danger Zone</h2></div></CardHeader>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Delete Account</p><p className="text-xs text-default-400 mt-0.5">Permanently delete everything.</p></div>
              <Button size="sm" variant="flat" color="danger" onPress={() => setDeleteOpen(true)}>Delete</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal isOpen={deleteOpen} onOpenChange={setDeleteOpen} size="sm">
        <ModalContent>{(onClose) => (<><ModalHeader className="text-danger">Delete Account?</ModalHeader><ModalBody><p className="text-default-500 text-sm">This cannot be undone.</p></ModalBody><ModalFooter><Button variant="flat" onPress={onClose}>Cancel</Button><Button onPress={handleDeleteAccount} isLoading={deleteLoading} color="danger">Delete</Button></ModalFooter></>)}</ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
