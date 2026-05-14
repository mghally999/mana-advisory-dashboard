import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { isGuest } from "@/lib/guest";

export default async function SettingsPage() {
  const integrations = [
    { name: "Jira Cloud", configured: !!process.env.JIRA_URL, note: "Source of truth for tasks" },
    { name: "Zoho Books", configured: !!process.env.ZOHO_CLIENT_ID, note: "Source of truth for financials" },
    { name: "Postgres", configured: !!process.env.DATABASE_URL, note: "Primary store" },
    { name: "Upstash Redis", configured: !!process.env.UPSTASH_REDIS_REST_URL, note: "Cache + token store" },
  ];
  const guest = await isGuest();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted">Settings</p>
        <h1 className="font-display text-3xl text-ink mt-1">System</h1>
      </div>
      <div className="gold-divider" />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Integrations</CardTitle>
            <CardSubtitle>External services this dashboard connects to</CardSubtitle>
          </div>
          {guest && <Badge tone="gold">Guest Mode</Badge>}
        </CardHeader>
        <CardBody className="divide-y divide-border">
          {integrations.map((i) => (
            <div key={i.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              {i.configured ? (
                <CheckCircle2 size={16} className="text-success shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-warn shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm text-ink">{i.name}</p>
                <p className="text-xs text-muted">{i.note}</p>
              </div>
              <Badge tone={i.configured ? "success" : "warn"}>
                {i.configured ? "Configured" : "Not configured"}
              </Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Net Profit Override</CardTitle>
            <CardSubtitle>Super admins (MM, Nash) can manually enter the monthly net profit</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-muted">
            POST <code className="text-gold">/api/financials/override</code> with body{" "}
            <code className="text-gold">{`{ month: "YYYY-MM", netProfit: number }`}</code>. The
            override sticks until the next monthly Zoho sync, and a UI form for this will land
            in v2 once the auth flow is verified end-to-end.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Data Structures Active</CardTitle>
            <CardSubtitle>Performance-critical structures powering the UI</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ["LRU Cache", "O(1) get/set in front of Redis"],
            ["Trie", "Prefix-search autocomplete in the task search bar"],
            ["MinHeap (top-K)", "Stale-task detection and workload ranking"],
            ["SegmentTree", "O(log n) revenue range sums"],
            ["DoublyLinkedList", "Foundation for the LRU cache"],
            ["SinglyLinkedList", "FIFO queue for the sync pipeline"],
          ].map(([name, note]) => (
            <div key={name} className="flex items-start gap-2 p-3 rounded-md bg-surface-2 border border-border">
              <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-ink font-medium">{name}</p>
                <p className="text-xs text-muted">{note}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
