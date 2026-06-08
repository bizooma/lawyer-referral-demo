import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash; the client picks it up automatically.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setReady(true); // still allow rendering — user may see error on submit
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <SEO title="Set New Password" description="Set a new password for your account." canonical="/reset-password" />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
