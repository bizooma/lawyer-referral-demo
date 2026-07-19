import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { user, isLoading, refreshMemberships, setActiveOrgId } = useAuth();
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (token) localStorage.setItem("pending_attorney_invite", token);
  }, [token]);

  const accept = async () => {
    if (!token) return;
    setWorking(true);
    const { data, error } = await (supabase as any).rpc("accept_attorney_invite", { _token: token });
    setWorking(false);
    if (error) return toast.error(error.message);
    localStorage.removeItem("pending_attorney_invite");
    toast.success("Invite accepted");
    await refreshMemberships();
    // AuthContext will re-pick; membership row includes the org.
    const { data: att } = await supabase.from("attorneys").select("organization_id").eq("id", data).maybeSingle();
    if (att?.organization_id) setActiveOrgId(att.organization_id);
    navigate("/attorney", { replace: true });
  };

  if (isLoading) return <div className="min-h-screen grid place-items-center">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader><CardTitle>Accept your attorney invite</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in or create an account with the email your bar association invited, then return to accept.
            </p>
            <div className="flex gap-2">
              <Button asChild><Link to="/login">Sign in</Link></Button>
              <Button asChild variant="outline"><Link to="/signup">Create account</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader><CardTitle>Accept your attorney invite</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You’re signed in as <strong>{user.email}</strong>. Accepting will link this account to your
            attorney record on the bar’s referral panel.
          </p>
          <Button onClick={accept} disabled={working || !token}>
            {working ? "Accepting…" : "Accept invite"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
