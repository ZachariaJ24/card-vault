"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import DashboardLayout from "@/components/DashboardLayout";

export default function CollectionPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">My Collection</h1>
            <p className="text-default-400 text-sm mt-0.5">Catalog and manage your physical cards</p>
          </div>
          <Button size="sm" color="primary" startContent={<Icon icon="solar:add-circle-linear" width={16} />}>
            Add Card
          </Button>
        </div>

        <Card className="border border-default-200 bg-content1">
          <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon="solar:box-linear" className="text-default-300" width={40} />
            <p className="text-default-400 text-sm text-center">Your collection is empty.<br />Start cataloging cards you own.</p>
            <Button as="a" href="/portfolio" size="sm" variant="flat" color="primary" className="mt-1">Go to Portfolio</Button>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
