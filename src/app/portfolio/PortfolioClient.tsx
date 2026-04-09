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

  const cardOptions = availableCards.length > 0 ? availableCards : MOCK_CARDS.map((c) => ({
    id: c.id, name: c.name, player_name: c.player_name, sport: c.sport, card_set: c.card_set, year: c.year,
  }));

  const totalCostBasis = portfolio.reduce((s, p) => s + p.purchase_price * (p.quantity ?? 1), 0);
  const totalCards = portfolio.reduce((s, p) => s + (p.quantity ?? 1), 0);

  const currentValues = portfolio.map((p) => {
    const currentPrice = getMockCurrentPrice(p.card_id);
    const costBasis = p.purchase_price * (p.quantity ?? 1);
    const currentValue = currentPrice * (p.quantity ?? 1);
    return { ...p, currentValue, gainLoss: currentValue - costBasis, gainLossPct: ((currentValue - costBasis) / costBasis) * 100 };
  });
  const totalCurrentValue = currentValues.reduce((s, p) => s + p.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalCostBasis;

  const chartData = generatePriceHistory(totalCostBasis > 0 ? totalCostBasis : 1000);

  async function handleAdd() {
    if (!form.card_id || !form.purchase_price) return;
    setSaving(true);
    setErr("");
    const { error } = await supabase.from("portfolio").insert({
      user_id: user.id, card_id: form.card_id, purchase_price: parseFloat(form.purchase_price),
      grade: form.grade, quantity: parseInt(form.quantity) || 1, purchase_date: form.purchase_date || null, notes: form.notes || null,
    });
    if (error) { setErr(error.message); } else { setAddOpen(false); setForm(EMPTY_FORM); router.refresh(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await supabase.from("portfolio").delete().eq("id", id);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <AppLayout user={user} isAdmin={isAdmin}>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Portfolio</h1>
          <p className="text-default-500 mt-1 text-sm">Track your collection&apos;s value over time.</p>
        </div>
        <Button onPress={() => setAddOpen(true)} color="primary"
          startContent={<Icon icon="solar:add-circle-linear" width={18} />}>
          Add Card
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Value", value: formatCurrency(totalCurrentValue), color: "text-primary", icon: "solar:wallet-money-linear" },
          { label: "Cost Basis", value: formatCurrency(totalCostBasis), color: "text-default-500", icon: "solar:tag-price-linear" },
          { label: "Total P&L", value: formatCurrency(Math.abs(totalGainLoss)), color: totalGainLoss >= 0 ? "text-success" : "text-danger", icon: "solar:chart-2-linear" },
          { label: "Cards Owned", value: String(totalCards), color: "text-warning", icon: "solar:layers-linear" },
        ].map((s) => (
          <Card key={s.label} className="border border-default-200 bg-content1" shadow="none">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-default-500 uppercase tracking-wider font-medium">{s.label}</span>
                <Icon icon={s.icon} width={18} className={s.color} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Value Chart */}
      {portfolio.length > 0 && (
        <Card className="border border-default-200 bg-content1 mb-5" shadow="none">
          <CardHeader className="px-5 pt-5 pb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon icon="solar:chart-square-linear" className="text-primary" width={18} />
                <h2 className="font-semibold text-sm">Portfolio Value</h2>
              </div>
              <span className={`text-sm font-medium ${totalGainLoss >= 0 ? "text-success" : "text-danger"}`}>
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
      <Card className="border border-default-200 bg-content1" shadow="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <Icon icon="solar:layers-linear" className="text-warning" width={18} />
            <h2 className="font-semibold text-sm">Holdings</h2>
          </div>
        </CardHeader>
        <CardBody className="p-5">
          {portfolio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <Icon icon="solar:wallet-money-linear" className="text-default-300" width={40} />
              <p className="text-default-400 text-center text-sm">Your portfolio is empty.<br />Add your first card to start tracking.</p>
              <Button onPress={() => setAddOpen(true)} color="primary" size="sm" className="mt-1">
                Add First Card
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 text-default-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 text-left font-medium">Card</th>
                    <th className="pb-3 text-left hidden md:table-cell font-medium">Grade</th>
                    <th className="pb-3 text-right font-medium">Cost Basis</th>
                    <th className="pb-3 text-right hidden sm:table-cell font-medium">Est. Value</th>
                    <th className="pb-3 text-right hidden sm:table-cell font-medium">P&L</th>
                    <th className="pb-3 text-right font-medium">Qty</th>
                    <th className="pb-3 text-right font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentValues.map((item) => {
                    const card = item.cards as { name?: string; sport?: string } | null;
                    return (
                      <tr key={item.id} className="border-b border-default-100 hover:bg-default-50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span>{sportEmoji(card?.sport ?? null)}</span>
                            <div>
                              <div className="font-medium text-sm">{card?.name ?? "Unknown"}</div>
                              <div className="text-xs text-default-400">{card?.sport}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <Chip size="sm" variant="flat" className="text-xs">{item.grade ?? "-"}</Chip>
                        </td>
                        <td className="py-3 text-right font-mono">{formatCurrency(item.purchase_price)}</td>
                        <td className="py-3 text-right font-mono hidden sm:table-cell">
                          {formatCurrency(item.currentValue / (item.quantity ?? 1))}
                        </td>
                        <td className={`py-3 text-right font-medium hidden sm:table-cell ${item.gainLoss >= 0 ? "text-success" : "text-danger"}`}>
                          {formatChange(item.gainLossPct)}
                        </td>
                        <td className="py-3 text-right text-default-400">{item.quantity ?? 1}</td>
                        <td className="py-3 text-right">
                          <Button size="sm" isIconOnly variant="light" color="danger"
                            onPress={() => setDeleteId(item.id)}>
                            <Icon icon="solar:trash-bin-trash-linear" width={14} />
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
      <Modal isOpen={addOpen} onOpenChange={setAddOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Card to Portfolio</ModalHeader>
              <ModalBody className="gap-4 py-4">
                <Select
                  label="Card"
                  selectedKeys={form.card_id ? new Set([form.card_id]) : new Set()}
                  onSelectionChange={(k) => setForm((f) => ({ ...f, card_id: String([...k][0] ?? "") }))}
                  variant="bordered"
                  isRequired
                  classNames={{ trigger: "border-default-300", popoverContent: "bg-content1 border border-default-200" }}
                >
                  {cardOptions.map((c) => (
                    <SelectItem key={c.id}>{c.player_name ?? c.name} - {c.card_set ?? c.sport}</SelectItem>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Purchase Price ($)" type="number" value={form.purchase_price}
                    onValueChange={(v) => setForm((f) => ({ ...f, purchase_price: v }))}
                    isRequired variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
                  <Select label="Grade" selectedKeys={new Set([form.grade])}
                    onSelectionChange={(k) => setForm((f) => ({ ...f, grade: String([...k][0]) }))}
                    variant="bordered" classNames={{ trigger: "border-default-300", popoverContent: "bg-content1 border border-default-200" }}>
                    {GRADE_OPTIONS.map((g) => <SelectItem key={g}>{g}</SelectItem>)}
                  </Select>
                  <Input label="Quantity" type="number" value={form.quantity}
                    onValueChange={(v) => setForm((f) => ({ ...f, quantity: v }))}
                    variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
                  <Input label="Purchase Date" type="date" value={form.purchase_date}
                    onValueChange={(v) => setForm((f) => ({ ...f, purchase_date: v }))}
                    variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
                </div>
                <Input label="Notes (optional)" value={form.notes}
                  onValueChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                  variant="bordered" classNames={{ inputWrapper: "border-default-300" }} />
                {err && <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-sm">{err}</div>}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button onPress={handleAdd} isLoading={saving} isDisabled={!form.card_id || !form.purchase_price}
                  color="primary">
                  Add to Portfolio
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteId} onOpenChange={() => setDeleteId(null)} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Remove from Portfolio?</ModalHeader>
              <ModalBody>
                <p className="text-default-500 text-sm">This will remove the holding from your portfolio.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Cancel</Button>
                <Button onPress={() => deleteId && handleDelete(deleteId)} color="danger">Remove</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </AppLayout>
  );
}
