import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export default function Signup() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the auth user (profile auto-created by trigger)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: { display_name: displayName },
        },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.session) {
        toast.success("Check your email to confirm your account, then sign in to finish setup.");
        navigate("/login");
        return;
      }

      // 2. Create the org + grant program_admin atomically via SECURITY DEFINER RPC.
      //    Prevents any client from self-granting a role on an arbitrary org.
      const baseSlug = slugify(orgName) || `org-${Date.now()}`;
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: newOrgId, error: rpcError } = await supabase.rpc(
        "create_organization_with_admin",
        {
          _name: orgName,
          _slug: slug,
          _contact_email: email,
          _plan_tier: "local_bar",
        }
      );
      if (rpcError) throw rpcError;

      if (newOrgId) localStorage.setItem("active_org_id", newOrgId as string);
      toast.success(`Welcome — ${orgName} is ready`);
      navigate("/app");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <SEO
        title="Create Account"
        description="Create a Lawyer Referral Program account for your bar association."
        canonical="/signup"
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Start a referral program for your bar association</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgName">Bar Association Name</Label>
              <Input
                id="orgName"
                required
                placeholder="e.g., Duval County Bar Association"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
