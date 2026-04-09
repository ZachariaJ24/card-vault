"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import DashboardLayout from "@/components/DashboardLayout";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-default-400 text-sm mt-0.5">Portfolio analytics and market reports</p>
        </div>

        <Card className="border border-default-200 bg-content1">
          <CardBody className="flex flex-col items-center justify-center py-16 gap-3">
            <Icon icon="solar:document-text-linear" className="text-default-300" width={40} />
            <p className="text-default-400 text-sm text-center">Reports are coming soon.<br />Track your portfolio performance and market insights.</p>
            <Button as="a" href="/portfolio" size="sm" variant="flat" color="primary" className="mt-1">View Portfolio</Button>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
