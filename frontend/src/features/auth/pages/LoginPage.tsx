import { LoginForm } from "../components/LoginForm";
import { Zap, ChefHat, Package } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning-fast Checkout",
    description: "Process complex orders with keyboard-first speed.",
  },
  {
    icon: ChefHat,
    title: "Orchestrated Kitchens",
    description: "Seamless ticket flow from table to prep station.",
  },
  {
    icon: Package,
    title: "Intelligent Inventory",
    description: "Real-time tracking and automated stock forecasting.",
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2 bg-white">
      {/* LEFT — Brand Showcase */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex xl:p-20 bg-gradient-to-br from-zinc-50 to-zinc-100/80 border-r border-zinc-200/50">
        {/* Decorative Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Coherence</span>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 flex max-w-lg flex-col gap-12">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-zinc-900 xl:text-6xl">
              Bring Coherence
              <br />
              to your <span className="text-primary">Chaos.</span>
            </h1>
            <p className="text-lg text-zinc-600 leading-relaxed">
              The intelligent operating system designed for the next generation of high-performance hospitality.
            </p>
          </div>

          <div className="grid gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-900">{title}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10">
          <p className="text-sm font-medium text-zinc-400">
            © {new Date().getFullYear()} Coherence OS. Built for scale.
          </p>
        </div>
      </div>

      {/* RIGHT — Auth Wrapper */}
      <div className="flex items-center justify-center p-8 bg-white lg:bg-zinc-50/30">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
