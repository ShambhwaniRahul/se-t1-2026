import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
import { ROLE_HOME } from "@/config/types/role";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login, role } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(identifier, password);
    console.log("This is returned: ", result);

    if (result.success) {
      toast.success(result.message ?? "Welcome back!");

      console.log("User Role: ", role)
      if (role && ROLE_HOME[role]) {
        navigate(ROLE_HOME[role]);
      } else {
        navigate("/"); // fallback
      }
    } else {
      toast.error(result.message ?? "Login failed");
    }
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
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full">
            {"Sign in"}
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
