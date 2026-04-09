"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardBody, CardHeader, Button, Input, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Select, SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import AppLayout from "@/components/AppLayout";
import PriceChart from "@/components/PriceChart";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import type { Portfolio, Card as CardType } from "@/lib/types";
import { formatCurrency, formatChange, sportEmoji } from "@/lib/utils";
import { GRADE_OPTIONS, MOCK_CARDS, generatePriceHistory } from "@/lib/mock-data";

interface Props {
  user: User;
  isAdmin: boolean;
  portfolio: Portfolio[];
  availableCards: Pick<CardType, "id" | "name" | "player_name" | "sport" | "card_set" | "year">[];
}

const EMPTY_FORM = { card_id: "", purchase_price: "", grade: "PSA 10", quantity: "1", purchase_date: "", notes: "" };

// Mock current prices for cards
function getMockCurrentPrice(cardId: string): number {
  const mock = MOCK_CARDS.find((c) => c.id === cardId);
  return mock ? mock.base_price : 500;
}

export default function PortfolioClient({ user, isAdmin, portfolio, availableCards }: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Use availableCards or fall back to MOCK_CARDS for the dropdown
  const cardOptions = availableCards.length > 0 ? availableCards : MOCK_CARDS.map((c) => ({
    id: c.id,
    name: c.name,
    player_name: c.player_name,
    sport: c.sport,
    card_set: c.card_set,
    year: c.year,
  }));

  const totalCostBasis = portfolio.reduce((s, p) => s + p.purchase_price * (p.quantity ?? 1), 0);
  const totalCards = portfolio.reduce((s, p) => s + (p.quantity ?? 1), 0);

  // Mock current values
  const currentValues = portfolio.map((p) => {
    const currentPrice = getMockCurrentPrice(p.card_id);
    const costBasis = p.purchase_price * (p.quantity ?? 1);
    const currentValue = currentPrice * (p.quantity ?? 1);
    return { ...p, currentValue, gainLoss: currentValue - costBasis, gainLossPct: ((currentValue - costBasis) / costBasis) * 100 };
  });
  const totalCurrentValue = currentValues.reduce((s, p) => s + p.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalCostBasis;

  // Chart data — value over time using mock data
  const chartData = generatePriceHistory(totalCostBasis > 0 ? totalCostBasis : 1000);

  async function handleAdd() {
    if (!form.card_id || !form.purchase_price) return;
    setSaving(true);
    setErr("");
    const { error } = await supabase.from("portfolio").insert({
      user_id: user.id,
      card_id: form.card_id,
      purchase_price: parseFloat(form.purchase_price),
      grade: form.grade,
      quantity: parseInt(form.quantity) || 1,
      purchase_date: form.purchase_date || null,
      notes: form.notes || null,
    });
    if (error) {
      setErr(error.message);
    } else {
      setAddOpen(false);
      setForm(EMPTY_FORM);
      router.refresh();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("portfolio").delete().eq("id", id);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">My Portfolio</h1>
          <p className="text-[#64748b] mt-1 text-sm">Track your collection&apos;s value over time.</p>
        </div>
        <Button onPress={() => setAddOpen(true)}
          className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold glow-gold"
          startContent={<Icon icon="solar:add-circle-bold" width={18} />}>
          Add Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Value", value: formatCurrency(totalCurrentValue), color: "#00b4ff", icon: "solar:wallet-money-bold" },
          { label: "Cost Basis", value: formatCurrency(totalCostBasis), color: "#64748b", icon: "solar:tag-price-bold" },
          { label: "Total P&L", value: formatCurrency(Math.abs(totalGainLoss)), color: totalGainLoss >= 0 ? "#22c55e" : "#ef4444", icon: "solar:graph-up-bold" },
          { label: "Cards Owned", value: String(totalCards), color: "#f59e0b", icon: "solar:layers-bold" },
        ].map((s) => (
          <Card key={s.label} className="card-glass" radius="lg">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#64748b] uppercase tracking-wider">{s.label}</span>
                <Icon icon={s.icon} width={18} style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Value Chart */}
      {portfolio.length > 0 && (
        <Card className="card-glass glow-blue mb-6" radius="lg">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon icon="solar:chart-square-bold" className="text-[#00b4ff]" width={20} />
                <h2 className="font-bold text-white">Portfolio Value</h2>
              </div>
              <span className={`text-sm font-semibold ${totalGainLoss >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                {totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totalGainLoss)} ({formatChange(totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0)})
              </span>
            </div>
          </CardHeader>
          <CardBody className="px-5 pt-0 pb-5">
            <PriceChart data={chartData} color="auto" height={130} />
          </CardBody>
        </Card>
      )}

      {/* Holdings table */}
      <Card className="card-glass" radius="lg">
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <Icon icon="solar:layers-bold" className="text-[#f59e0b]" width={20} />
            <h2 className="font-bold text-white">Holdings</h2>
          </div>
        </CardHeader>
        <CardBody className="p-5">
          {portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Icon icon="solar:wallet-bold" className="text-[#64748b]" width={48} />
              <p className="text-[#64748b] text-center">Your portfolio is empty.<br />Add your first card to start tracking its value.</p>
              <Button onPress={() => setAddOpen(true)}
                className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold mt-2">
                Add First Card
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#00b4ff]/10 text-[#64748b] text-xs uppercase tracking-wider">
                    <th className="pb-3 text-left">Card</th>
                    <th className="pb-3 text-left hidden md:table-cell">Grade</th>
                    <th className="pb-3 text-right">Cost Basis</th>
                    <th className="pb-3 text-right hidden sm:table-cell">Est. Value</th>
                    <th className="pb-3 text-right hidden sm:table-cell">P&L</th>
                    <th className="pb-3 text-right">Qty</th>
                    <th className="pb-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentValues.map((item) => {
                    const card = item.cards as { name?: string; sport?: string } | null;
                    return (
                      <tr key={item.id} className="border-b border-[#00b4ff]/5 hover:bg-[#00b4ff]/5 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span>{sportEmoji(card?.sport ?? null)}</span>
                            <div>
                              <div className="font-medium text-white text-sm">{card?.name ?? "Unknown"}</div>
                              <div className="text-xs text-[#64748b]">{card?.sport}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <Chip size="sm" variant="flat" className="bg-[#00b4ff]/10 text-[#00b4ff] border border-[#00b4ff]/20 text-xs">
                            {item.grade ?? "—"}
                          </Chip>
                        </td>
                        <td className="py-3 text-right font-mono text-white">{formatCurrency(item.purchase_price)}</td>
                        <td className="py-3 text-right font-mono text-white hidden sm:table-cell">
                          {formatCurrency(item.currentValue / (item.quantity ?? 1))}
                        </td>
                        <td className={`py-3 text-right font-semibold hidden sm:table-cell ${item.gainLoss >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                          {formatChange(item.gainLossPct)}
                        </td>
                        <td className="py-3 text-right text-[#64748b]">{item.quantity ?? 1}</td>
                        <td className="py-3 text-right">
                          <Button size="sm" isIconOnly variant="flat"
                            className="bg-[#ef4444]/10 text-[#ef4444] min-w-7 w-7 h-7"
                            onPress={() => setDeleteId(item.id)}>
                            <Icon icon="solar:trash-bin-trash-bold" width={13} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Modal */}
      <Modal isOpen={addOpen} onOpenChange={setAddOpen} size="lg"
        classNames={{
          base: "bg-[#0a1628] border border-[#00b4ff]/20",
          header: "border-b border-[#00b4ff]/10",
          footer: "border-t border-[#00b4ff]/10",
          closeButton: "text-[#64748b] hover:text-white",
        }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-white">Add Card to Portfolio</ModalHeader>
              <ModalBody className="gap-4 py-5">
                <Select
                  label="Card *"
                  selectedKeys={form.card_id ? new Set([form.card_id]) : new Set()}
                  onSelectionChange={(k) => setForm((f) => ({ ...f, card_id: String([...k][0] ?? "") }))}
                  variant="bordered"
                  isRequired
                  classNames={{
                    trigger: "bg-[#060d18] border-[#00b4ff]/20",
                    value: "text-white",
                    label: "text-[#64748b]",
                    listbox: "bg-[#0a1628]",
                    popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20",
                  }}
                >
                  {cardOptions.map((c) => (
                    <SelectItem key={c.id} className="text-white">
                      {c.player_name ?? c.name} — {c.card_set ?? c.sport}
                    </SelectItem>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Purchase Price ($) *" type="number" value={form.purchase_price}
                    onValueChange={(v) => setForm((f) => ({ ...f, purchase_price: v }))}
                    isRequired variant="bordered"
                    classNames={{ inputWrapper: "bg-[#060d18] border-[#00b4ff]/20", input: "text-white", label: "text-[#64748b]" }}
                  />
                  <Select label="Grade" selectedKeys={new Set([form.grade])}
                    onSelectionChange={(k) => setForm((f) => ({ ...f, grade: String([...k][0]) }))}
                    variant="bordered"
                    classNames={{ trigger: "bg-[#060d18] border-[#00b4ff]/20", value: "text-white", label: "text-[#64748b]", listbox: "bg-[#0a1628]", popoverContent: "bg-[#0a1628] border border-[#00b4ff]/20" }}>
                    {GRADE_OPTIONS.map((g) => <SelectItem key={g} className="text-white">{g}</SelectItem>)}
                  </Select>
                  <Input label="Quantity" type="number" value={form.quantity}
                    onValueChange={(v) => setForm((f) => ({ ...f, quantity: v }))}
                    variant="bordered"
                    classNames={{ inputWrapper: "bg-[#060d18] border-[#00b4ff]/20", input: "text-white", label: "text-[#64748b]" }}
                  />
                  <Input label="Purchase Date" type="date" value={form.purchase_date}
                    onValueChange={(v) => setForm((f) => ({ ...f, purchase_date: v }))}
                    variant="bordered"
                    classNames={{ inputWrapper: "bg-[#060d18] border-[#00b4ff]/20", input: "text-white", label: "text-[#64748b]" }}
                  />
                </div>
                <Input label="Notes (optional)" value={form.notes}
                  onValueChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                  variant="bordered"
                  classNames={{ inputWrapper: "bg-[#060d18] border-[#00b4ff]/20", input: "text-white", label: "text-[#64748b]" }}
                />
                {err && <div className="px-3 py-2 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-sm">{err}</div>}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-[#64748b]">Cancel</Button>
                <Button onPress={handleAdd} isLoading={saving} isDisabled={!form.card_id || !form.purchase_price}
                  className="bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#060d18] font-bold">
                  Add to Portfolio
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onOpenChange={() => setDeleteId(null)} size="sm"
        classNames={{ base: "bg-[#0a1628] border border-[#ef4444]/20" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-white">Remove from Portfolio?</ModalHeader>
              <ModalBody>
                <p className="text-[#64748b] text-sm">This will remove the holding from your portfolio.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="text-[#64748b]">Cancel</Button>
                <Button onPress={() => deleteId && handleDelete(deleteId)}
                  className="bg-[#ef4444] text-white font-bold">Remove</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
