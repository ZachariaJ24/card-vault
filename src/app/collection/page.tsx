"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardBody, CardHeader, Button, Chip, Divider,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  User as HeroUser,
  Progress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import DashboardLayout from "@/components/DashboardLayout";
import { SportBadge } from "@/components/heroui-pro";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatCurrency, playerInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Portfolio } from "@/lib/types";

const CSV_TEMPLATE = `player_name,card_name,year,card_set,sport,team,grade,purchase_price,quantity,notes
Connor McDavid,2015-16 Upper Deck Young Guns #201,2015,Upper Deck Series 1,Hockey,Edmonton Oilers,PSA 10,1250,1,Bought at card show
Wayne Gretzky,1979-80 O-Pee-Chee #18 RC,1979,O-Pee-Chee,Hockey,Edmonton Oilers,PSA 9,45000,1,
LeBron James,2003-04 Topps Chrome #111 RC,2003,Topps Chrome,Basketball,Cleveland Cavaliers,BGS 9.5,8500,1,Investment piece
Patrick Mahomes,2017 Panini Prizm #269 RC,2017,Panini Prizm,Football,Kansas City Chiefs,PSA 10,3400,2,
Charizard,1999 Base Set #4 Holo,1999,Base Set,Pokemon,,PSA 10,28000,1,1st edition`;

export default function CollectionPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [collection, setCollection] = useState<(Portfolio & { cards?: { name?: string; player_name?: string; sport?: string; image_url?: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ summary: { total: number; inserted: number; errors: number; skipped: number }; results: { row: number; player: string; status: string }[] } | null>(null);
  const [importError, setImportError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("portfolio")
          .select("*, cards(name, player_name, sport, image_url)")
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false });
        setCollection((data ?? []) as typeof collection);
      }
      setLoading(false);
    }
    load();
  }, []);

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cardvault-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      setImportError("");
    }
  }

  async function handleImport() {
    if (!selectedFile || !user) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", user.id);

      const res = await fetch("/api/collection", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) {
        setImportError(data.error);
      } else {
        setImportResult(data);
        // Refresh collection list
        const supabase = createSupabaseBrowserClient();
        const { data: refreshed } = await supabase
          .from("portfolio")
          .select("*, cards(name, player_name, sport, image_url)")
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false });
        setCollection((refreshed ?? []) as typeof collection);
      }
    } catch {
      setImportError("Import request failed");
    }
    setImporting(false);
  }

  const totalValue = collection.reduce((s, p) => s + (p.purchase_price ?? 0) * (p.quantity ?? 1), 0);
  const totalCards = collection.reduce((s, p) => s + (p.quantity ?? 1), 0);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold">My Collection</h1>
            <p className="text-default-400 text-sm mt-0.5">
              {totalCards > 0 ? `${totalCards} cards · ${formatCurrency(totalValue)} total value` : "Catalog and manage your physical cards"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="flat" color="default" onPress={downloadTemplate}
              startContent={<Icon icon="solar:download-linear" width={16} />}>
              CSV Template
            </Button>
            <Button size="sm" variant="flat" color="secondary" onPress={() => setImportOpen(true)}
              startContent={<Icon icon="solar:upload-linear" width={16} />}>
              Import CSV
            </Button>
            <Button size="sm" color="primary" as="a" href="/portfolio"
              startContent={<Icon icon="solar:add-circle-linear" width={16} />}>
              Add Card
            </Button>
          </div>
        </div>

        {/* Collection table */}
        {loading ? (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="py-20 flex items-center justify-center">
              <Progress isIndeterminate size="sm" className="max-w-xs" aria-label="Loading" />
            </CardBody>
          </Card>
        ) : collection.length === 0 ? (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="flex flex-col items-center justify-center py-16 gap-4">
              <Icon icon="solar:box-linear" className="text-default-300" width={40} />
              <div className="text-center">
                <p className="text-default-400 text-sm">Your collection is empty.</p>
                <p className="text-default-400 text-xs mt-1">Import a CSV or add cards manually.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="flat" color="default" onPress={downloadTemplate}
                  startContent={<Icon icon="solar:download-linear" width={14} />}>
                  Download Template
                </Button>
                <Button size="sm" variant="flat" color="secondary" onPress={() => setImportOpen(true)}
                  startContent={<Icon icon="solar:upload-linear" width={14} />}>
                  Import CSV
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="border border-default-200 bg-content1">
            <CardBody className="p-0">
              <Table
                aria-label="Collection"
                removeWrapper
                classNames={{
                  th: "bg-transparent text-default-500 text-[0.65rem] uppercase tracking-wider font-medium border-b border-default-200 py-2.5",
                  td: "py-3",
                  tr: "hover:bg-default-50 transition-colors border-b border-default-100 last:border-0",
                }}
              >
                <TableHeader>
                  <TableColumn>Card</TableColumn>
                  <TableColumn>Grade</TableColumn>
                  <TableColumn align="end">Price Paid</TableColumn>
                  <TableColumn align="end">Qty</TableColumn>
                  <TableColumn className="hidden md:table-cell">Notes</TableColumn>
                </TableHeader>
                <TableBody>
                  {collection.map((item) => {
                    const card = item.cards as { name?: string; player_name?: string; sport?: string; image_url?: string } | null;
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <HeroUser
                            name={card?.player_name ?? card?.name ?? "Unknown"}
                            description={<span className="flex items-center gap-1.5"><SportBadge sport={card?.sport ?? null} size="xs" /><span>{card?.name ?? ""}</span></span>}
                            avatarProps={{
                              radius: "sm",
                              size: "sm",
                              src: card?.image_url ?? undefined,
                              name: playerInitials(card?.player_name ?? null),
                              classNames: { base: "bg-default-200 text-[0.6rem] font-bold text-default-500" },
                            }}
                            classNames={{
                              name: "text-xs font-medium",
                              description: "text-[0.65rem] text-default-400",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" classNames={{ content: "text-[0.65rem] font-mono" }}>
                            {item.grade ?? "RAW"}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-semibold text-xs">{formatCurrency(item.purchase_price)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-default-400">{item.quantity ?? 1}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-default-400 truncate max-w-[200px] block">{item.notes ?? "-"}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Import CSV Modal */}
      <Modal isOpen={importOpen} onOpenChange={setImportOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Import Collection from CSV</ModalHeader>
              <ModalBody className="gap-4 py-4">
                {/* Format info */}
                <Card className="border border-default-200 bg-default-50">
                  <CardBody className="p-4">
                    <h4 className="text-xs font-semibold mb-2">CSV Format</h4>
                    <p className="text-[0.65rem] text-default-500 mb-3">
                      Your CSV must have a header row with these columns. Only <strong>player_name</strong> and <strong>card_name</strong> are required.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="text-[0.6rem] font-mono">
                        <thead>
                          <tr className="text-default-500">
                            <th className="pr-3 pb-1 text-left font-medium">Column</th>
                            <th className="pr-3 pb-1 text-left font-medium">Required</th>
                            <th className="pb-1 text-left font-medium">Example</th>
                          </tr>
                        </thead>
                        <tbody className="text-default-400">
                          <tr><td className="pr-3 py-0.5 text-foreground">player_name</td><td className="pr-3">Yes</td><td>Connor McDavid</td></tr>
                          <tr><td className="pr-3 py-0.5 text-foreground">card_name</td><td className="pr-3">Yes</td><td>2015-16 Upper Deck YG #201</td></tr>
                          <tr><td className="pr-3 py-0.5">year</td><td className="pr-3">No</td><td>2015</td></tr>
                          <tr><td className="pr-3 py-0.5">card_set</td><td className="pr-3">No</td><td>Upper Deck Series 1</td></tr>
                          <tr><td className="pr-3 py-0.5">sport</td><td className="pr-3">No</td><td>Hockey</td></tr>
                          <tr><td className="pr-3 py-0.5">team</td><td className="pr-3">No</td><td>Edmonton Oilers</td></tr>
                          <tr><td className="pr-3 py-0.5">grade</td><td className="pr-3">No</td><td>PSA 10</td></tr>
                          <tr><td className="pr-3 py-0.5">purchase_price</td><td className="pr-3">No</td><td>1250</td></tr>
                          <tr><td className="pr-3 py-0.5">quantity</td><td className="pr-3">No</td><td>1</td></tr>
                          <tr><td className="pr-3 py-0.5">notes</td><td className="pr-3">No</td><td>Bought at card show</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <Button size="sm" variant="flat" color="default" className="mt-3" onPress={downloadTemplate}
                      startContent={<Icon icon="solar:download-linear" width={14} />}>
                      Download Template CSV
                    </Button>
                  </CardBody>
                </Card>

                {/* File upload */}
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div
                    className="border-2 border-dashed border-default-200 rounded-lg p-6 text-center cursor-pointer hover:border-default-300 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Icon icon="solar:file-check-linear" className="text-success" width={20} />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-default-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <Icon icon="solar:upload-linear" className="text-default-300 mx-auto mb-2" width={28} />
                        <p className="text-sm text-default-400">Click to select a CSV file</p>
                        <p className="text-[0.65rem] text-default-300 mt-1">or drag and drop</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Error */}
                {importError && (
                  <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs flex items-center gap-2">
                    <Icon icon="solar:danger-circle-linear" width={14} />
                    {importError}
                  </div>
                )}

                {/* Results */}
                {importResult && (
                  <Card className="border border-default-200 bg-default-50">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="solar:check-circle-linear" className="text-success" width={16} />
                        <span className="text-xs font-semibold">Import Complete</span>
                      </div>
                      <div className="flex gap-4 text-xs mb-3">
                        <span className="text-success font-mono">{importResult.summary.inserted} imported</span>
                        {importResult.summary.errors > 0 && <span className="text-danger font-mono">{importResult.summary.errors} errors</span>}
                        {importResult.summary.skipped > 0 && <span className="text-default-400 font-mono">{importResult.summary.skipped} skipped</span>}
                      </div>
                      {importResult.results.filter((r) => r.status !== "imported").length > 0 && (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {importResult.results.filter((r) => r.status !== "imported").map((r, i) => (
                            <div key={i} className="text-[0.6rem] text-default-400">
                              Row {r.row}: {r.player} — {r.status}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} size="sm">
                  {importResult ? "Done" : "Cancel"}
                </Button>
                {!importResult && (
                  <Button
                    onPress={handleImport}
                    isLoading={importing}
                    isDisabled={!selectedFile || !user}
                    color="primary"
                    size="sm"
                  >
                    Import {selectedFile ? `(${selectedFile.name})` : ""}
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
