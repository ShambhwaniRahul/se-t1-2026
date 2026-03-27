import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
// import { ROLE_HOME } from "@/config/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = login(identifier, password);

    if (result.success) {
      toast.success("Welcome back!");
      // We need to get the role after login to redirect properly
      // Small trick: re-read from the identifier to find the role
      const emp = identifier.trim().toLowerCase();
      // Navigate will happen, useAuth will have the user by then
      // We use a timeout to let state settle
      setTimeout(() => {
        // The user is now set, we can read role from context indirectly
        navigate("/");
      }, 0);
    } else {
      toast.error(result.error ?? "Login failed");
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-sm border-border/50 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          C
        </div>
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Sign in with your employee credentials</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="you@coherence.app or +1 (555) ..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Demo credentials:</p>
            <p>Owner: sarah@coherence.app / owner123</p>
            <p>Manager: elena@coherence.app / manager123</p>
            <p>POS: tomas@coherence.app / pos123</p>
            <p>Kitchen: marco@coherence.app / kitchen123</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link to="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
        </CardFooter>
      </form>
    </Card>
  );
}
