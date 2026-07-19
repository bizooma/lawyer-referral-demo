import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMyAttorney } from "@/hooks/useMyAttorney";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AttorneyAvailability() {
  const { data: attorney, isLoading } = useMyAttorney();
  const qc = useQueryClient();
  if (isLoading || !attorney) return <p className="text-muted-foreground">Loading…</p>;

  const toggle = async (v: boolean) => {
    const { error } = await (supabase as any).rpc("set_my_attorney_availability", { _is_active: v });
    if (error) return toast.error(error.message);
    toast.success(v ? "You’re accepting referrals" : "You’re paused");
    qc.invalidateQueries({ queryKey: ["my-attorney"] });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground mt-1">Pause new referrals when you’re at capacity or out of office.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Accepting new referrals</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <Switch checked={!!attorney.is_active} onCheckedChange={toggle} />
          <Label>{attorney.is_active ? "Accepting" : "Paused"}</Label>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Capacity</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Max active referrals: <strong className="text-foreground">{attorney.max_active_referrals}</strong>.
          You can change this on your <a href="/attorney/profile" className="underline">profile</a>.
        </CardContent>
      </Card>
    </div>
  );
}
