// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/features/auth/hooks/useAuth";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
// import { toast } from "sonner";
// import { ROLE_HOME } from "@/config/types/role";

// export function LoginForm() {
//   const [identifier, setIdentifier] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const result = await login(identifier, password);
//     console.log("This is returned: ", result);

//     if (result.success) {
//       toast.success(result.message ?? "Welcome back!");

//       // read the role from result, context role update is delayed and hinders proper navigation
//       const role = result.data.employee.roles?.[0]?.role_display;
//       console.log(">>> ROLE from result: ", role);

//       if (role && ROLE_HOME[role]) {
//         console.log(">>> ROLE HOME: ", ROLE_HOME[role]);
//         navigate(ROLE_HOME[role]);
//       } else {
//         navigate("/login"); // fallback
//       }
//     } else {
//       toast.error(result.message ?? "Login failed");
//     }
//   };

//   return (
//     <Card className="w-full max-w-sm border border-zinc-200/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
//       <CardHeader className="space-y-1.5 text-center">
//         <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xl shadow-inner">
//           C
//         </div>
//         <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">Welcome back</CardTitle>
//         <CardDescription className="text-zinc-500 font-medium">Sign in with your employee credentials</CardDescription>
//       </CardHeader>
//       <form onSubmit={handleSubmit}>
//         <CardContent className="space-y-5">
//           <div className="space-y-2">
//             <Label htmlFor="identifier" className="text-sm font-semibold text-zinc-700">Email or Phone</Label>
//             <Input
//               id="identifier"
//               type="text"
//               placeholder="you@coherence.app"
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               required
//               autoComplete="email"
//               className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary/50"
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="password" title="Forgot password?" className="text-sm font-semibold text-zinc-700">Password</Label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               autoComplete="current-password"
//               className="h-11 rounded-xl border-zinc-200 bg-zinc-50/50 transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary/50"
//             />
//           </div>
//         </CardContent>
//         <CardFooter className="flex flex-col gap-4 mt-2">
//           <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all duration-200 hover:opacity-90 active:scale-[0.98] rounded-xl">
//             {"Sign in"}
//           </Button>
//             <p className="text-center text-sm font-medium text-zinc-500">
//               Need an account?{" "}
//               <Link to="/signup" className="text-primary hover:underline font-bold">
//                 Sign up
//               </Link>
//             </p>
//         </CardFooter>
//       </form>
//     </Card>
//   );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { toast } from "sonner";
import { ROLE_HOME } from "@/config/types/role";

export function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await login(identifier, password);
    console.log("This is returned: ", result);

    if (result.success) {
      toast.success(result.message ?? "Welcome back!");

      // read the role from result, context role update is delayed and hinders proper navigation
      const role = result.data.employee.roles?.[0]?.role_display;
      console.log(">>> ROLE from result: ", role);

      if (role && ROLE_HOME[role]) {
        console.log(">>> ROLE HOME: ", ROLE_HOME[role]);
        navigate(ROLE_HOME[role]);
      } else {
        navigate("/login"); // fallback
      }
    } else {
      toast.error(result.message ?? "Login failed");
    }
  };

  return (
    <Card className="w-full max-w-md border border-zinc-200/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <CardHeader className="space-y-1 text-center px-6 pt-6">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
          C
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in with your employee credentials</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="9XXXXXXXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="h-12 text-base"
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
              className="h-12 text-base"
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-5">
          <Button type="submit" className="w-full cursor-pointer">
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
