import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Globe, Copy, CheckCircle2 } from "lucide-react";

const PLATFORM_DOMAIN = "lawyerreferralprogram.com";
const PLATFORM_IP = "185.158.133.1";

type Domain = {
  id: string;
  hostname: string;
  domain_type: "subdomain" | "custom";
  status: "pending" | "verifying" | "active" | "failed";
  verification_token: string;
  is_primary: boolean;
  ssl_status: string;
  created_at: string;
};

const statusVariant: Record<Domain["status"], "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  verifying: "secondary",
  pending: "outline",
  failed: "destructive",
};

export default function AppDomains() {
  const { activeOrgId, activeMembership } = useAuth();
  const isAdmin = activeMembership?.role === "program_admin";

  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState("");
  const [custom, setCustom] = useState("");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!activeOrgId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("organization_domains")
      .select("*")
      .eq("organization_id", activeOrgId)
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else setDomains((data ?? []) as Domain[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId]);

  const addDomain = async (hostname: string, type: "subdomain" | "custom") => {
    if (!activeOrgId || !hostname) return;
    setCreating(true);
    const clean = hostname.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    // Always insert as pending — DNS/token verification is a platform step, not client-driven.
    const { error } = await supabase.from("organization_domains").insert({
      organization_id: activeOrgId,
      hostname: clean,
      domain_type: type,
      status: "pending",
    });
    setCreating(false);
    if (error) {
      if (error.code === "23505" || /duplicate|unique/i.test(error.message)) {
        return toast.error(`${clean} is already claimed by another organization.`);
      }
      return toast.error(error.message);
    }
    toast.success("Domain added — pending verification");
    setSubdomain("");
    setCustom("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this domain?")) return;
    const { error } = await supabase.from("organization_domains").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };


  const setPrimary = async (d: Domain) => {
    if (!activeOrgId) return;
    await supabase.from("organization_domains").update({ is_primary: false }).eq("organization_id", activeOrgId);
    const { error } = await supabase.from("organization_domains").update({ is_primary: true }).eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Primary domain updated");
    load();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold">Domains</h1>
        <p className="text-muted-foreground mt-2">
          Only program administrators can manage domains.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Domains</h1>
        <p className="text-muted-foreground mt-1">
          Host your referral program on a free <code>{PLATFORM_DOMAIN}</code> subdomain or
          connect your own vanity domain.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Add a subdomain
          </CardTitle>
          <CardDescription>
            Instantly live. Format: <code>yourname.{PLATFORM_DOMAIN}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!subdomain) return;
              addDomain(`${subdomain}.${PLATFORM_DOMAIN}`, "subdomain");
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="sub">Subdomain</Label>
              <div className="flex">
                <Input
                  id="sub"
                  value={subdomain}
                  placeholder="countybar"
                  onChange={(e) => setSubdomain(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())}
                  className="rounded-r-none"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted text-sm text-muted-foreground">
                  .{PLATFORM_DOMAIN}
                </span>
              </div>
            </div>
            <Button type="submit" disabled={creating || !subdomain}>
              <Plus className="mr-2 h-4 w-4" />Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Add a custom (vanity) domain
          </CardTitle>
          <CardDescription>
            Use your own domain like <code>referrals.countybar.org</code>. Requires DNS configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!custom) return;
              addDomain(custom, "custom");
            }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="custom">Hostname</Label>
              <Input
                id="custom"
                value={custom}
                placeholder="referrals.yourbar.org"
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={creating || !custom}>
              <Plus className="mr-2 h-4 w-4" />Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Domains</CardTitle>
          <CardDescription>{domains.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : domains.length === 0 ? (
            <p className="text-muted-foreground text-sm">No domains yet. Add one above to get started.</p>
          ) : (
            <div className="space-y-3">
              {domains.map((d) => (
                <div key={d.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium truncate">{d.hostname}</p>
                        <p className="text-xs text-muted-foreground capitalize">{d.domain_type}</p>
                      </div>
                      <Badge variant={statusVariant[d.status]} className="capitalize">{d.status}</Badge>
                      {d.is_primary && <Badge variant="outline">Primary</Badge>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {d.status !== "active" && d.domain_type === "custom" && (
                        <Button size="sm" variant="outline" onClick={() => verify(d)}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />Verify
                        </Button>
                      )}
                      {d.status === "active" && !d.is_primary && (
                        <Button size="sm" variant="outline" onClick={() => setPrimary(d)}>
                          Set primary
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {d.domain_type === "custom" && d.status !== "active" && (
                    <div className="bg-muted/50 rounded p-3 text-xs space-y-2">
                      <p className="font-medium">Add these DNS records at your registrar:</p>
                      <table className="w-full font-mono">
                        <thead className="text-muted-foreground">
                          <tr><th className="text-left">Type</th><th className="text-left">Name</th><th className="text-left">Value</th><th></th></tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>A</td>
                            <td>{d.hostname.split(".")[0]}</td>
                            <td>{PLATFORM_IP}</td>
                            <td><Button size="sm" variant="ghost" onClick={() => copy(PLATFORM_IP)}><Copy className="h-3 w-3" /></Button></td>
                          </tr>
                          <tr>
                            <td>TXT</td>
                            <td>_lrp-verify.{d.hostname}</td>
                            <td className="break-all">{d.verification_token}</td>
                            <td><Button size="sm" variant="ghost" onClick={() => copy(d.verification_token)}><Copy className="h-3 w-3" /></Button></td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-muted-foreground">
                        DNS can take up to 72h to propagate. SSL is provisioned automatically once
                        verified.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
