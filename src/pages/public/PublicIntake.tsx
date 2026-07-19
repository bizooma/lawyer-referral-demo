import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";

type Branding = {
  organization_id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  disclaimer_text: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  support_url: string | null;
  widget_intro: string | null;
};

type Disclosure = { id?: string; label?: string; text: string; required?: boolean };

const PRACTICE_AREAS: { value: string; label: string }[] = [
  { value: "personal_injury", label: "Personal Injury" },
  { value: "family_law", label: "Family Law" },
  { value: "criminal_defense", label: "Criminal Defense" },
  { value: "estate_probate", label: "Estate / Probate" },
  { value: "immigration", label: "Immigration" },
  { value: "business", label: "Business" },
];

export default function PublicIntake() {
  const { slug } = useParams<{ slug: string }>();
  const host = typeof window !== "undefined" ? window.location.host : "";

  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<Branding | null>(null);
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [notAccepting, setNotAccepting] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    caller_name: "",
    caller_phone: "",
    caller_email: "",
    area_of_law: "" as string,
    county: "",
    language_preference: "English",
    narrative: "",
    urgency: "normal",
  });
  const [acked, setAcked] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Try host first (production custom domain / subdomain), then slug
      let b: Branding | null = null;
      const { data: byHost } = await supabase.rpc("get_branding_by_host", { _host: host });
      if (Array.isArray(byHost) && byHost[0]) b = byHost[0] as Branding;
      if (!b && slug) {
        const { data: bySlug } = await supabase.rpc("get_branding_by_slug", { _slug: slug });
        if (Array.isArray(bySlug) && bySlug[0]) b = bySlug[0] as Branding;
      }
      setBranding(b);

      if (b?.organization_id) {
        const { data: profile } = await supabase
          .from("org_compliance_profiles")
          .select("status, config")
          .eq("organization_id", b.organization_id)
          .maybeSingle();
        const cfg = (profile?.config ?? {}) as { disclosures?: Disclosure[] };
        setDisclosures(cfg.disclosures ?? []);
        setNotAccepting(profile?.status !== "attested");
      }
      setLoading(false);
    })();
  }, [host, slug]);

  const themeStyle = useMemo(
    () =>
      branding?.primary_color
        ? ({ ["--brand" as string]: branding.primary_color } as React.CSSProperties)
        : undefined,
    [branding?.primary_color]
  );

  const update = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.area_of_law) return toast.error("Please select an area of law");
    if (!acked) return toast.error("Please acknowledge the disclosures to continue");
    setSubmitting(true);
    const { data, error } = await supabase.rpc("public_create_intake", {
      _host: host,
      _slug: slug ?? null,
      _caller_name: form.caller_name,
      _caller_phone: form.caller_phone,
      _caller_email: form.caller_email,
      _area_of_law: form.area_of_law as
        | "personal_injury" | "family_law" | "criminal_defense"
        | "estate_probate" | "immigration" | "business",
      _county: form.county,
      _language_preference: form.language_preference,
      _narrative: form.narrative,
      _urgency: form.urgency,
      _disclosures_acknowledged: acked,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    setSubmittedId(data as unknown as string);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Referral program not found</h1>
          <p className="text-muted-foreground mt-2">
            The link you followed doesn't match a registered referral program.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30" style={themeStyle}>
      <Helmet>
        <title>{`Request a Lawyer Referral · ${branding.name}`}</title>
        <meta name="description" content={`Request a lawyer referral from ${branding.name}.`} />
      </Helmet>

      <header
        className="border-b bg-white"
        style={branding.primary_color ? { borderTopColor: branding.primary_color, borderTopWidth: 4 } : undefined}
      >
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center gap-4">
          {branding.logo_url && (
            <img src={branding.logo_url} alt={`${branding.name} logo`} className="h-10 w-auto" />
          )}
          <div>
            <h1 className="font-semibold text-lg leading-tight">{branding.name}</h1>
            <p className="text-xs text-muted-foreground">Lawyer Referral Request</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {branding.widget_intro && (
          <p className="text-muted-foreground">{branding.widget_intro}</p>
        )}

        {notAccepting ? (
          <Card>
            <CardHeader>
              <CardTitle>Not accepting requests right now</CardTitle>
              <CardDescription>
                {branding.name} is still finalizing their referral program setup and cannot accept
                new intake requests yet. Please check back soon
                {branding.contact_email ? ` or contact ${branding.contact_email}` : ""}.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : submittedId ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Request received
              </CardTitle>
              <CardDescription>
                Thank you. {branding.name} has received your request and will be in touch to match
                you with a qualified attorney.
                {branding.contact_phone && (
                  <> If your matter is urgent, call {branding.contact_phone}.</>
                )}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Tell us about your legal matter</CardTitle>
              <CardDescription>
                Fields marked required help us match you with the right attorney.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" required value={form.caller_name}
                      onChange={(e) => update({ caller_name: e.target.value })} maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" required type="tel" value={form.caller_phone}
                      onChange={(e) => update({ caller_phone: e.target.value })} maxLength={40} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" required type="email" value={form.caller_email}
                      onChange={(e) => update({ caller_email: e.target.value })} maxLength={254} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Input id="county" value={form.county}
                      onChange={(e) => update({ county: e.target.value })} maxLength={100} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Area of law *</Label>
                    <Select value={form.area_of_law} onValueChange={(v) => update({ area_of_law: v })}>
                      <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        {PRACTICE_AREAS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select value={form.urgency} onValueChange={(v) => update({ urgency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lang">Preferred language</Label>
                  <Input id="lang" value={form.language_preference}
                    onChange={(e) => update({ language_preference: e.target.value })} maxLength={60} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="narr">Describe your matter *</Label>
                  <Textarea id="narr" required rows={5} value={form.narrative}
                    onChange={(e) => update({ narrative: e.target.value })} maxLength={5000}
                    placeholder="A short summary of your situation and what you need help with." />
                </div>

                {(disclosures.length > 0 || branding.disclaimer_text) && (
                  <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-2">
                    <p className="font-medium">Required disclosures</p>
                    {branding.disclaimer_text && (
                      <p className="text-muted-foreground whitespace-pre-line">{branding.disclaimer_text}</p>
                    )}
                    {disclosures.map((d, i) => (
                      <p key={d.id ?? i} className="text-muted-foreground">
                        {d.label ? <strong>{d.label}: </strong> : null}{d.text}
                      </p>
                    ))}
                  </div>
                )}

                <label className="flex items-start gap-2 text-sm">
                  <Checkbox checked={acked} onCheckedChange={(v) => setAcked(!!v)} />
                  <span>
                    I have read and acknowledge the disclosures above and consent to
                    {" "}{branding.name}{" "}contacting me about this request.
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={submitting}
                  style={branding.primary_color ? { backgroundColor: branding.primary_color } : undefined}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit request
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Submitting this form does not create an attorney-client relationship.
        </p>
      </main>
    </div>
  );
}
