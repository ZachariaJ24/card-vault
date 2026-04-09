"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { SportBadge } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { playerInitials } from "@/lib/utils";
import type { Order } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "primary" | "danger" | "default"> = {
  pending_payment: "warning",
  paid: "primary",
  shipped: "primary",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
  refunded: "danger",
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid — Awaiting Shipment",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrdersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipModal, setShipModal] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const res = await fetch(`/api/orders?user_id=${user.id}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
    }
    setLoading(false);
  }

  async function handleShip(orderId: string) {
    if (!user) return;
    setActionLoading(true);
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, user_id: user.id, action: "ship", tracking_number: trackingNumber }),
    });
    setShipModal(null);
    setTrackingNumber("");
    setActionLoading(false);
    loadOrders();
  }

  async function handleConfirmDelivery(orderId: string) {
    if (!user) return;
    setActionLoading(true);
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, user_id: user.id, action: "confirm_delivery" }),
    });
    setActionLoading(false);
    loadOrders();
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">My Orders</h1>
          <p className="text-default-400 text-sm mt-0.5">Track your purchases and sales</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Card key={i} className="border border-default-200 bg-content1"><CardBody className="h-24" /></Card>)}
          </div>
        ) : orders.length === 0 ? (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
              <Icon icon="solar:bag-check-linear" className="text-default-300" width={40} />
              <p className="text-default-400 text-sm">No orders yet.</p>
              <Button as={Link} href="/marketplace" size="sm" variant="flat" color="primary">Browse Marketplace</Button>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const listing = order.listings as { cards?: { name?: string; player_name?: string; sport?: string; grade?: string; image_url?: string } } | null;
              const card = listing?.cards;
              const isBuyer = order.buyer_id === user?.id;
              const isSeller = order.seller_id === user?.id;

              return (
                <Card key={order.id} className="border border-default-200 bg-content1">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      {/* Card info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded border border-default-200 bg-default-100 flex items-center justify-center overflow-hidden shrink-0">
                          {card?.image_url ? (
                            <img src={card.image_url} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[0.5rem] font-mono text-default-400">{playerInitials(card?.player_name ?? null)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{card?.player_name ?? card?.name ?? "Card"}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <SportBadge sport={card?.sport ?? null} size="xs" />
                            {card?.grade && <Chip size="sm" variant="flat" classNames={{ content: "text-[0.5rem] font-mono" }}>{card.grade}</Chip>}
                          </div>
                          <p className="text-[0.65rem] text-default-400 mt-1">
                            {isBuyer ? "Purchased" : "Sold"} &middot; {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Price + status */}
                      <div className="text-right">
                        <p className="font-mono font-semibold text-sm">{formatPrice(order.price)}</p>
                        {isSeller && <p className="text-[0.6rem] text-default-400 font-mono">Payout: {formatPrice(order.seller_payout)}</p>}
                        <Chip
                          size="sm"
                          variant="flat"
                          color={STATUS_COLOR[order.status] ?? "default"}
                          classNames={{ content: "text-[0.6rem] font-medium" }}
                          className="mt-1"
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </Chip>
                      </div>
                    </div>

                    {/* Tracking */}
                    {order.tracking_number && (
                      <div className="mt-3 p-2.5 rounded-lg bg-default-50 border border-default-100 flex items-center gap-2">
                        <Icon icon="solar:box-linear" className="text-default-400" width={14} />
                        <span className="text-xs text-default-400">Tracking:</span>
                        <span className="text-xs font-mono font-medium">{order.tracking_number}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      {/* Seller: mark as shipped */}
                      {isSeller && order.status === "paid" && (
                        <Button size="sm" color="primary" variant="flat" onPress={() => setShipModal(order.id)}
                          startContent={<Icon icon="solar:box-linear" width={14} />}>
                          Mark as Shipped
                        </Button>
                      )}
                      {/* Buyer: confirm delivery */}
                      {isBuyer && order.status === "shipped" && (
                        <Button size="sm" color="success" variant="flat" isLoading={actionLoading}
                          onPress={() => handleConfirmDelivery(order.id)}
                          startContent={<Icon icon="solar:check-circle-linear" width={14} />}>
                          Confirm Delivery
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ship modal */}
      <Modal isOpen={!!shipModal} onOpenChange={() => setShipModal(null)} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Ship Order</ModalHeader>
              <ModalBody>
                <Input
                  label="Tracking Number"
                  value={trackingNumber}
                  onValueChange={setTrackingNumber}
                  variant="bordered"
                  placeholder="Enter tracking number"
                  classNames={{ inputWrapper: "border-default-300" }}
                />
                <p className="text-[0.65rem] text-default-400">Optional — helps the buyer track their package.</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} size="sm">Cancel</Button>
                <Button color="primary" size="sm" isLoading={actionLoading}
                  onPress={() => shipModal && handleShip(shipModal)}>
                  Confirm Shipped
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
