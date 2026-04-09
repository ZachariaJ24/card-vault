"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardBody, Button, Input, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Tabs, Tab, Pagination, Select, SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import DashboardLayout from "@/components/DashboardLayout";
import { KpiCard } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Card as CardType, Profile } from "@/lib/types";
import { SportBadge } from "@/components/heroui-pro";
import { SPORTS_LIST } from "@/lib/mock-data";

interface Props {
  user: User;
  stats: { cardCount: number; userCount: number; priceCount: number };
  cards: CardType[];
  profiles: Profile[];
}

const EMPTY_FORM = { name: "", player_name: "", year: "", card_set: "", sport: "Hockey", team: "", description: "" };
const PAGE_SIZE = 15;

export default function AdminClient({ user, stats, cards, profiles }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [cardPage, setCardPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => cards.filter((c) => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.player_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (sportFilter === "all" || c.sport === sportFilter);
  }), [cards, search, sportFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((cardPage - 1) * PAGE_SIZE, cardPage * PAGE_SIZE);

  function openAdd() { setEditCard(null); setForm(EMPTY_FORM); setSaveMsg(""); setSaveErr(""); setModalOpen(true); }
  function openEdit(card: CardType) {
    setEditCard(card);
    setForm({ name: card.name, player_name: card.player_name ?? "", year: card.year ? String(card.year) : "", card_set: card.card_set ?? "", sport: card.sport ?? "Hockey", team: card.team ?? "", description: card.description ?? "" });
    setSaveMsg(""); setSaveErr(""); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setSaveErr(""); setSaveMsg("");
    const payload = { name: form.name, player_name: form.player_name || null, year: form.year ? parseInt(form.year) : null, card_set: form.card_set || null, sport: form.sport, team: form.team || null, description: form.description || null };
    const { error } = editCard ? await supabase.from("cards").update(payload).eq("id", editCard.id) : await supabase.from("cards").insert([payload]);
    if (error) setSaveErr(error.message); else { setSaveMsg(editCard ? "Updated!" : "Added!"); router.refresh(); setTimeout(() => setModalOpen(false), 600); }
    setSaving(false);
  }

  async function handleDelete(id: string) { setDeleting(true); await supabase.from("cards").delete().eq("id", id); setDeleteId(null); setDeleting(false); router.refresh(); }

  return (
    <DashboardLayout user={user} isAdmin={true}>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1"><Chip size="sm" color="warning" variant="flat" classNames={{ content: "text-[0.6rem] font-semibold" }}>Admin</Chip></div>
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            <p className="text-default-400 text-sm mt-0.5">Manage cards, users, and data.</p>
          </div>
          <Button onPress={openAdd} color="primary" size="sm" startContent={<Icon icon="solar:add-circle-linear" width={16} />}>Add Card</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Total Cards" value={stats.cardCount.toLocaleString()} change={`${stats.cardCount}`} changeType="positive" icon="solar:layers-linear" />
          <KpiCard title="Total Users" value={stats.userCount.toLocaleString()} change={`${stats.userCount}`} changeType="positive" icon="solar:users-group-rounded-linear" />
          <KpiCard title="Price Records" value={stats.priceCount.toLocaleString()} change={`${stats.priceCount}`} changeType="neutral" icon="solar:chart-square-linear" />
          <KpiCard title="Sports Active" value="1" change="5 soon" changeType="neutral" icon="solar:medal-ribbons-star-linear" />
        </div>

        <Tabs variant="underlined" classNames={{ tabList: "border-b border-default-200 gap-4", cursor: "bg-primary", tab: "text-xs" }}>
          <Tab key="cards" title={<div className="flex items-center gap-2"><Icon icon="solar:layers-linear" width={14} /><span>Cards ({cards.length})</span></div>}>
            <div className="mt-4">
              <div className="flex gap-3 mb-3 flex-wrap">
                <Input placeholder="Search..." value={search} onValueChange={(v) => { setSearch(v); setCardPage(1); }} variant="bordered" size="sm" startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={14} />} className="max-w-xs" classNames={{ inputWrapper: "border-default-300 h-8" }} />
                <Select selectedKeys={new Set([sportFilter])} onSelectionChange={(keys) => { setSportFilter(String([...keys][0])); setCardPage(1); }} variant="bordered" size="sm" className="max-w-[140px]" classNames={{ trigger: "border-default-300 h-8", popoverContent: "bg-content1 border border-default-200" }}>
                  {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((o) => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>
              </div>
              <Card className="border border-default-200 bg-content1"><CardBody className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-default-200 text-default-500 text-[0.65rem] uppercase tracking-wider"><th className="px-4 py-2.5 text-left font-medium">Name</th><th className="px-4 py-2.5 text-left hidden md:table-cell font-medium">Player</th><th className="px-4 py-2.5 text-left hidden lg:table-cell font-medium">Set / Year</th><th className="px-4 py-2.5 text-left font-medium">Sport</th><th className="px-4 py-2.5 text-right font-medium">Actions</th></tr></thead>
                <tbody>{paginated.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-default-400 text-xs">No cards found.</td></tr> : paginated.map((card) => (
                  <tr key={card.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs font-medium">{card.name}</td>
                    <td className="px-4 py-2.5 text-xs text-default-400 hidden md:table-cell">{card.player_name ?? "-"}</td>
                    <td className="px-4 py-2.5 text-xs text-default-400 hidden lg:table-cell">{card.card_set ?? "-"}{card.year ? ` · ${card.year}` : ""}</td>
                    <td className="px-4 py-2.5"><span className="flex items-center gap-1.5"><SportBadge sport={card.sport} size="xs" /><span className="text-[0.65rem]">{card.sport ?? "-"}</span></span></td>
                    <td className="px-4 py-2.5 text-right"><div className="flex justify-end gap-1"><Button size="sm" isIconOnly variant="light" color="primary" onPress={() => openEdit(card)}><Icon icon="solar:pen-linear" width={13} /></Button><Button size="sm" isIconOnly variant="light" color="danger" onPress={() => setDeleteId(card.id)}><Icon icon="solar:trash-bin-trash-linear" width={13} /></Button></div></td>
                  </tr>
                ))}</tbody></table></div></CardBody></Card>
              {totalPages > 1 && <div className="flex justify-center mt-4"><Pagination total={totalPages} page={cardPage} onChange={setCardPage} variant="flat" size="sm" /></div>}
            </div>
          </Tab>
          <Tab key="users" title={<div className="flex items-center gap-2"><Icon icon="solar:users-group-rounded-linear" width={14} /><span>Users ({profiles.length})</span></div>}>
            <div className="mt-4">
              <Card className="border border-default-200 bg-content1"><CardBody className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-default-200 text-default-500 text-[0.65rem] uppercase tracking-wider"><th className="px-4 py-2.5 text-left font-medium">Email</th><th className="px-4 py-2.5 text-left font-medium">Role</th><th className="px-4 py-2.5 text-left hidden md:table-cell font-medium">Plan</th><th className="px-4 py-2.5 text-left hidden lg:table-cell font-medium">Joined</th></tr></thead>
              <tbody>{profiles.map((p) => (
                <tr key={p.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                  <td className="px-4 py-2.5 text-xs">{p.email ?? "-"}</td>
                  <td className="px-4 py-2.5"><Chip size="sm" variant="flat" color={p.is_admin ? "warning" : "default"} classNames={{ content: "text-[0.6rem]" }}>{p.is_admin ? "Admin" : "User"}</Chip></td>
                  <td className="px-4 py-2.5 text-xs text-default-400 hidden md:table-cell capitalize">{p.subscription_tier ?? "free"}</td>
                  <td className="px-4 py-2.5 text-xs text-default-400 hidden lg:table-cell">{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</td>
                </tr>
              ))}</tbody></table></div></CardBody></Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} size="2xl"><ModalContent>{(onClose) => (<>
        <ModalHeader>{editCard ? "Edit Card" : "Add Card"}</ModalHeader>
        <ModalBody className="gap-3 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["name", "player_name", "year", "card_set", "team"] as const).map((key) => (
              <Input key={key} label={key === "name" ? "Card Name" : key === "player_name" ? "Player" : key === "year" ? "Year" : key === "card_set" ? "Set" : "Team"} value={form[key]} onValueChange={(v) => setForm((f) => ({ ...f, [key]: v }))} type={key === "year" ? "number" : "text"} isRequired={key === "name"} variant="bordered" size="sm" classNames={{ inputWrapper: "border-default-300" }} />
            ))}
            <Select label="Sport" selectedKeys={new Set([form.sport])} onSelectionChange={(keys) => setForm((f) => ({ ...f, sport: String([...keys][0]) }))} variant="bordered" size="sm" classNames={{ trigger: "border-default-300", popoverContent: "bg-content1 border border-default-200" }}>
              {SPORTS_LIST.map((s) => <SelectItem key={s}>{s}</SelectItem>)}
            </Select>
          </div>
          {saveErr && <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs">{saveErr}</div>}
          {saveMsg && <div className="px-3 py-2 rounded-lg bg-success/10 text-success text-xs">{saveMsg}</div>}
        </ModalBody>
        <ModalFooter><Button variant="flat" onPress={onClose} size="sm">Cancel</Button><Button onPress={handleSave} isLoading={saving} isDisabled={!form.name} color="primary" size="sm">{editCard ? "Save" : "Add"}</Button></ModalFooter>
      </>)}</ModalContent></Modal>

      <Modal isOpen={!!deleteId} onOpenChange={() => setDeleteId(null)} size="sm"><ModalContent>{(onClose) => (<>
        <ModalHeader>Delete Card?</ModalHeader>
        <ModalBody><p className="text-default-500 text-sm">This cannot be undone.</p></ModalBody>
        <ModalFooter><Button variant="flat" onPress={onClose} size="sm">Cancel</Button><Button onPress={() => deleteId && handleDelete(deleteId)} isLoading={deleting} color="danger" size="sm">Delete</Button></ModalFooter>
      </>)}</ModalContent></Modal>
    </DashboardLayout>
  );
}
