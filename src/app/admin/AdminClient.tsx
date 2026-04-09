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
import { sportEmoji } from "@/lib/utils";
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
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [cardPage, setCardPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState<CardType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setEditCard(null); setForm(EMPTY_FORM); setSaveMsg(""); setSaveErr(""); setModalOpen(true);
  }

  function openEdit(card: CardType) {
    setEditCard(card);
    setForm({
      name: card.name, player_name: card.player_name ?? "", year: card.year ? String(card.year) : "",
      card_set: card.card_set ?? "", sport: card.sport ?? "Hockey", team: card.team ?? "", description: card.description ?? "",
    });
    setSaveMsg(""); setSaveErr(""); setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true); setSaveErr(""); setSaveMsg("");
    const payload = {
      name: form.name, player_name: form.player_name || null, year: form.year ? parseInt(form.year) : null,
      card_set: form.card_set || null, sport: form.sport, team: form.team || null, description: form.description || null,
    };
    const { error } = editCard
      ? await supabase.from("cards").update(payload).eq("id", editCard.id)
      : await supabase.from("cards").insert([payload]);
    if (error) { setSaveErr(error.message); } else { setSaveMsg(editCard ? "Card updated!" : "Card added!"); router.refresh(); setTimeout(() => setModalOpen(false), 800); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    await supabase.from("cards").delete().eq("id", id);
    setDeleteId(null); setDeleting(false); router.refresh();
  }

  const KPI_CARDS = [
    { label: "Total Cards", value: stats.cardCount, icon: "solar:layers-linear", color: "text-primary" },
    { label: "Total Users", value: stats.userCount, icon: "solar:users-group-rounded-linear", color: "text-warning" },
    { label: "Price Records", value: stats.priceCount, icon: "solar:chart-square-linear", color: "text-success" },
    { label: "Sports Active", value: 1, icon: "solar:medal-ribbons-star-linear", color: "text-secondary" },
  ];

  return (
    <AppLayout user={user} isAdmin={true}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Chip size="sm" color="warning" variant="flat">Admin</Chip>
          </div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-default-500 text-sm mt-1">Manage cards, users, and platform data.</p>
        </div>
        <Button onPress={openAdd} color="primary"
          startContent={<Icon icon="solar:add-circle-linear" width={18} />}>
          Add Card
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_CARDS.map((k) => (
          <Card key={k.label} className="border border-default-200 bg-content1" shadow="none">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-default-500 uppercase tracking-wider font-medium">{k.label}</span>
                <Icon icon={k.icon} width={18} className={k.color} />
              </div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value.toLocaleString()}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Tabs variant="underlined" classNames={{
        tabList: "border-b border-default-200 gap-4",
        cursor: "bg-primary",
      }}>
        <Tab key="cards" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:layers-linear" width={16} />
            <span>Cards ({cards.length})</span>
          </div>
        }>
          <div className="mt-5">
            <div className="flex gap-3 mb-4 flex-wrap">
              <Input placeholder="Search cards or players..." value={search}
                onValueChange={(v) => { setSearch(v); setCardPage(1); }}
                variant="bordered"
                startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" width={16} />}
                className="max-w-xs"
                classNames={{ inputWrapper: "border-default-300" }}
              />
              <Select selectedKeys={new Set([sportFilter])}
                onSelectionChange={(keys) => { setSportFilter(String([...keys][0])); setCardPage(1); }}
                variant="bordered" className="max-w-[160px]"
                classNames={{ trigger: "border-default-300", popoverContent: "bg-content1 border border-default-200" }}>
                {[{ key: "all", label: "All Sports" }, ...SPORTS_LIST.map((s) => ({ key: s, label: s }))].map((opt) => (
                  <SelectItem key={opt.key}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>

            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left font-medium">Name</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell font-medium">Player</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell font-medium">Set / Year</th>
                        <th className="px-5 py-3 text-left font-medium">Sport</th>
                        <th className="px-5 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-default-400">No cards found.</td>
                        </tr>
                      ) : paginated.map((card) => (
                        <tr key={card.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                          <td className="px-5 py-3 font-medium">{card.name}</td>
                          <td className="px-5 py-3 text-default-400 hidden md:table-cell">{card.player_name ?? "-"}</td>
                          <td className="px-5 py-3 text-default-400 hidden lg:table-cell">
                            {card.card_set ?? "-"}{card.year ? ` · ${card.year}` : ""}
                          </td>
                          <td className="px-5 py-3">
                            <Chip size="sm" variant="flat" className="text-xs">
                              {sportEmoji(card.sport)} {card.sport ?? "-"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" isIconOnly variant="light" color="primary" onPress={() => openEdit(card)}>
                                <Icon icon="solar:pen-linear" width={14} />
                              </Button>
                              <Button size="sm" isIconOnly variant="light" color="danger" onPress={() => setDeleteId(card.id)}>
                                <Icon icon="solar:trash-bin-trash-linear" width={14} />
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
                <Pagination total={totalPages} page={cardPage} onChange={setCardPage} variant="flat" />
              </div>
            )}
          </div>
        </Tab>

        <Tab key="users" title={
          <div className="flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-linear" width={16} />
            <span>Users ({profiles.length})</span>
          </div>
        }>
          <div className="mt-5">
            <Card className="border border-default-200 bg-content1" shadow="none">
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                        <th className="px-5 py-3 text-left font-medium">Email</th>
                        <th className="px-5 py-3 text-left font-medium">Role</th>
                        <th className="px-5 py-3 text-left hidden md:table-cell font-medium">Plan</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell font-medium">Joined</th>
                        <th className="px-5 py-3 text-left hidden lg:table-cell font-medium">ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => (
                        <tr key={p.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                          <td className="px-5 py-3">{p.email ?? "-"}</td>
                          <td className="px-5 py-3">
                            <Chip size="sm" variant="flat" color={p.is_admin ? "warning" : "default"}>
                              {p.is_admin ? "Admin" : "User"}
                            </Chip>
                          </td>
                          <td className="px-5 py-3 text-default-400 hidden md:table-cell capitalize">{p.subscription_tier ?? "free"}</td>
                          <td className="px-5 py-3 text-default-400 text-xs hidden lg:table-cell">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-5 py-3 text-default-400 text-xs font-mono hidden lg:table-cell">
                            {p.id.slice(0, 8)}...
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
      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editCard ? "Edit Card" : "Add New Card"}</ModalHeader>
              <ModalBody className="gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["name", "player_name", "year", "card_set", "team"] as const).map((key) => (
                    <Input key={key}
                      label={key === "name" ? "Card Name" : key === "player_name" ? "Player Name" : key === "year" ? "Year" : key === "card_set" ? "Set" : "Team"}
                      value={form[key]}
                      onValueChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                      type={key === "year" ? "number" : "text"}
                      isRequired={key === "name"}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-default-300" }}
                    />
                  ))}
                  <Select label="Sport" selectedKeys={new Set([form.sport])}
                    onSelectionChange={(keys) => setForm((f) => ({ ...f, sport: String([...keys][0]) }))}
                    variant="bordered" classNames={{ trigger: "border-default-300", popoverContent: "bg-content1 border border-default-200" }}>
                    {SPORTS_LIST.map((s) => <SelectItem key={s}>{s}</SelectItem>)}
                  </Select>
                </div>
                <Input label="Description" value={form.description}
                  onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
                {saveErr && <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm">{saveErr}</div>}
                {saveMsg && <div className="px-3 py-2 rounded-lg bg-success/10 text-success text-sm">{saveMsg}</div>}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button onPress={handleSave} isLoading={saving} isDisabled={!form.name} color="primary">
                  {editCard ? "Save Changes" : "Add Card"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onOpenChange={() => setDeleteId(null)} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Card?</ModalHeader>
              <ModalBody>
                <p className="text-default-500 text-sm">This action cannot be undone. All associated price history will also be deleted.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button onPress={() => deleteId && handleDelete(deleteId)} isLoading={deleting} color="danger">Delete</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
