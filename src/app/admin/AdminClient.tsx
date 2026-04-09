"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardBody, CardHeader, Button, Input, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Tabs, Tab, Pagination, Select, SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import AppLayout from "@/components/AppLayout";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Card as CardType, Profile } from "@/lib/types";
import { formatCurrency, sportEmoji } from "@/lib/utils";
import { SPORTS_LIST, GRADE_OPTIONS } from "@/lib/mock-data";

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

  // Cards tab state
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [cardPage, setCardPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered cards
  const filtered = useMemo(() => {
    return cards.filter((c) => {
      const matchSearch = !search
        || c.name.toLowerCase().includes(search.toLowerCase())
        || (c.player_name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchSport = sportFilter === "all" || c.sport === sportFilter;
      return matchSearch && matchSport;
    });
  }, [cards, search, sportFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((cardPage - 1) * PAGE_SIZE, cardPage * PAGE_SIZE);

  function openAdd() {
    setEditCard(null);
    setForm(EMPTY_FORM);
    setSaveMsg("");
    setSaveErr("");
    setModalOpen(true);
  }

  function openEdit(card: CardType) {
    setEditCard(card);
    setForm({
      name: card.name,
      player_name: card.player_name ?? "",
      year: card.year ? String(card.year) : "",
      card_set: card.card_set ?? "",
      sport: card.sport ?? "Hockey",
      team: card.team ?? "",
      description: card.description ?? "",
    });
    setSaveMsg("");
    setSaveErr("");
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveErr("");
    setSaveMsg("");
    const payload = {
      name: form.name,
      player_name: form.player_name || null,
      year: form.year ? parseInt(form.year) : null,
      card_set: form.card_set || null,
      sport: form.sport,
      team: form.team || null,
      description: form.description || null,
    };
    const { error } = editCard
      ? await supabase.from("cards").update(payload).eq("id", editCard.id)
      : await supabase.from("cards").insert([payload]);
    if (error) {
      setSaveErr(error.message);
    } else {
      setSaveMsg(editCard ? "Card updated!" : "Card added!");
      router.refresh();
      setTimeout(() => setModalOpen(false), 800);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    await supabase.from("cards").delete().eq("id", id);
    setDeleteId(null);
    setDeleting(false);
    router.refresh();
  }

  const KPI_CARDS = [
    { label: "Total Cards", value: stats.cardCount, icon: "solar:layers-bold", color: "#00b4ff" },
    { label: "Total Users", value: stats.userCount, icon: "solar:users-group-rounded-bold", color: "#f59e0b" },
    { label: "Price Records", value: stats.priceCount, icon: "solar:chart-square-bold", color: "#22c55e" },
    { label: "Sports Active", value: 1, icon: "solar:medal-ribbons-star-bold", color: "#a78bfa" },
  ];

  return (
    <AppLayout user={user} isAdmin={true}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chip size="sm" className="bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">Admin</Chip>
          </div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-1">Manage cards, users, and platform data.</p>
        </div>
        <Button onPress={openAdd} className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold"
          startContent={<Icon icon="solar:add-circle-bold" width={18} />}>
          Add Card
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map((k) => (
          <Card key={k.label} className="card-glass" radius="lg">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#64748b] uppercase tracking-wider">{k.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${k.color}18`, border: `1px solid ${k.color}30` }}>
                  <Icon icon={k.icon} width={18} style={{ color: k.color }} />
                </div>
              </div>
              <div className="text-3xl font-black" style={{ color: k.color }}>
                {k.value.toLocaleString()}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs: Cards / Users */}
      <Tabs
        variant="underlined"
        classNames={{
          tabList: "border-b border-[#00b4ff]/10 gap-4",
          tab: "text-[#64748b] data-[selected=true]:text-[#00b4ff]",
          cursor: "bg-[#00b4ff]",
        }}
      >
        {/* Cards Tab */}
        <Tab key="cards" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:layers-bold" width={16} />
            <span>Cards ({cards.length})</span>
          </div>
        }>
          <div className="mt-5">
            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <Input
                placeholder="Search cards or players…"
                value={search}
                onValueChange={(v) => { setSearch(v); setCardPage(1); }}
                variant="bordered"
                startContent={<Icon icon="solar:magnifer-bold" className="text-[#64748b]" width={16} />}
                classNames={{
                  inputWrapper: "bg-[#0a1628] border-[#00b4ff]/20 hover:border-[#00b4ff]/40 max-w-xs",
                  input: "text-white",
                }}
              />
              <Select
                selectedKeys={new Set([sportFilter])}
                onSelectionChange={(keys) => { setSportFilter(String([...keys][0])); setCardPage(1); }}
                variant="bordered"
                className="max-w-[160px]"
                classNames={{
                  trigger: "bg-[#0a1628] border-[#00b4ff]/20 hover:border-[#00b4ff]/40",
                  value: "text-white",
                  listbox: "bg-[#0a1628]",
                  popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20",
                }}
              >
                {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((opt) => (
                  <SelectItem key={opt.key} className="text-white hover:bg-[#00b4ff]/10">{opt.label}</SelectItem>
                ))}
              </Select>
            </div>

            <Card className="card-glass" radius="lg">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Name</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell">Player</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell">Set / Year</th>
                        <th className="px-5 py-3 text-left">Sport</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-[#64748b]">
                            No cards found.
                          </td>
                        </tr>
                      ) : paginated.map((card) => (
                        <tr key={card.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                          <td className="px-5 py-3 text-white font-medium">{card.name}</td>
                          <td className="px-5 py-3 text-[#64748b] hidden md:table-cell">{card.player_name ?? "—"}</td>
                          <td className="px-5 py-3 text-[#64748b] hidden lg:table-cell">
                            {card.card_set ?? "—"}{card.year ? ` · ${card.year}` : ""}
                          </td>
                          <td className="px-5 py-3">
                            <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 text-xs">
                              {sportEmoji(card.sport)} {card.sport ?? "—"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" isIconOnly variant="flat"
                                className="bg-[#00b4ff]/10 text-[#00b4ff] min-w-8 w-8 h-8"
                                onPress={() => openEdit(card)}>
                                <Icon icon="solar:pen-bold" width={14} />
                              </Button>
                              <Button size="sm" isIconOnly variant="flat"
                                className="bg-[#ef4444]/10 text-[#ef4444] min-w-8 w-8 h-8"
                                onPress={() => setDeleteId(card.id)}>
                                <Icon icon="solar:trash-bin-trash-bold" width={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={totalPages}
                  page={cardPage}
                  onChange={setCardPage}
                  classNames={{
                    item: "bg-[#0a1628] text-[#64748b] border border-[#00b4ff]/10",
                    cursor: "bg-[#00b4ff] text-[#060d18] font-bold",
                  }}
                />
              </div>
            )}
          </div>
        </Tab>

        {/* Users Tab */}
        <Tab key="users" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold" width={16} />
            <span>Users ({profiles.length})</span>
          </div>
        }>
          <div className="mt-5">
            <Card className="card-glass" radius="lg">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left">Email</th>
                        <th className="px-5 py-3 text-left">Role</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell">Plan</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell">Joined</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => (
                        <tr key={p.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                          <td className="px-5 py-3 text-white">{p.email ?? "—"}</td>
                          <td className="px-5 py-3">
                            <Chip size="sm" className={p.is_admin
                              ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                              : "bg-[#64748b]/10 text-[#64748b] border border-[#64748b]/20"}>
                              {p.is_admin ? "Admin" : "User"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3 text-[#64748b] hidden md:table-cell capitalize">
                            {p.subscription_tier ?? "free"}
                          </td>
                          <td className="px-5 py-3 text-[#64748b] text-xs hidden lg:table-cell">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-5 py-3 text-[#64748b] text-xs font-mono hidden lg:table-cell">
                            {p.id.slice(0, 8)}…
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        size="2xl"
        classNames={{
          base: "bg-[#0a1628] border border-[#00b4ff]/20",
          header: "border-b border-[#00b4ff]/10",
          footer: "border-t border-[#00b4ff]/10",
          closeButton: "text-[#64748b] hover:text-white",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-white">
                {editCard ? "Edit Card" : "Add New Card"}
              </ModalHeader>
              <ModalBody className="gap-4 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["name", "player_name", "year", "card_set", "team"] as const).map((key) => (
                    <Input
                      key={key}
                      label={key === "name" ? "Card Name *" : key === "player_name" ? "Player Name" : key === "year" ? "Year" : key === "card_set" ? "Set" : "Team"}
                      value={form[key]}
                      onValueChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      type={key === "year" ? "number" : "text"}
                      isRequired={key === "name"}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "bg-[#060d18] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
                        input: "text-white",
                        label: "text-[#64748b]",
                      }}
                    />
                  ))}
                  <Select
                    label="Sport *"
                    selectedKeys={new Set([form.sport])}
                    onSelectionChange={(keys) => setForm((f) => ({ ...f, sport: String([...keys][0]) }))}
                    variant="bordered"
                    classNames={{
                      trigger: "bg-[#060d18] border-[#00b4ff]/20",
                      value: "text-white",
                      label: "text-[#64748b]",
                      listbox: "bg-[#0a1628]",
                      popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20",
                    }}
                  >
                    {SPORTS_LIST.map((s) => (
                      <SelectItem key={s} className="text-white hover:bg-[#00b4ff]/10">{s}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Input
                  label="Description"
                  value={form.description}
                  onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  variant="bordered"
                  classNames={{
                    inputWrapper: "bg-[#060d18] border-[#00b4ff]/20 hover:border-[#00b4ff]/50 data-[focus=true]:border-[#00b4ff]",
                    input: "text-white",
                    label: "text-[#64748b]",
                  }}
                />
                {saveErr && (
                  <div className="px-4 py-3 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">
                    {saveErr}
                  </div>
                )}
                {saveMsg && (
                  <div className="px-4 py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-sm">
                    {saveMsg}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-[#64748b]">Cancel</Button>
                <Button
                  onPress={handleSave}
                  isLoading={saving}
                  isDisabled={!form.name}
                  className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold"
                >
                  {editCard ? "Save Changes" : "Add Card"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        size="sm"
        classNames={{
          base: "bg-[#0a1628] border border-[#ef4444]/20",
          header: "border-b border-[#ef4444]/10",
          footer: "border-t border-[#ef4444]/10",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-white">Delete Card?</ModalHeader>
              <ModalBody>
                <p className="text-[#64748b] text-sm">This action cannot be undone. All associated price history will also be deleted.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-[#64748b]">Cancel</Button>
                <Button
                  onPress={() => deleteId && handleDelete(deleteId)}
                  isLoading={deleting}
                  className="bg-[#ef4444] text-white font-bold"
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
