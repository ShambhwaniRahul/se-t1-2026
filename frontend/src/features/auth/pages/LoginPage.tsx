import { LoginForm } from "../components/LoginForm";
import { Zap, ChefHat, Sparkles, ChartNoAxesCombined } from "lucide-react";


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
    icon: Sparkles,
    title: "AI-Powered Inventory & Purchasing",
    description: "Automate inventory management using GenAI OCR.",
  },

  {
    icon: ChartNoAxesCombined,
    title: "Data-Driven Insights & Analytics",
    description: "Analyze performance, forecast sales and make informed decisions with real-time data visualization.",
  }
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2 bg-background selection:bg-primary/20 selection:text-primary">
      {/* LEFT — Brand Showcase */}
      <div className="relative hidden flex-col justify-between p-12 lg:flex xl:p-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-r border-border overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Coherence</span>
        </div>

        {/* Middle: Headline + features */}
        <div className="relative z-10 flex flex-1 flex-col justify-center max-w-lg gap-12 py-12">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700 delay-100 fill-mode-both">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground xl:text-6xl">
              Bring Coherence
              <br />
              to your <span className="text-primary drop-shadow-sm">Chaos.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The intelligent operating system designed for the next generation of high-performance hospitality.
            </p>
          </div>

          <div className="grid gap-8">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="group flex items-start gap-5 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDuration: '500ms', animationDelay: `${200 + i * 150}ms` }}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl glass border border-border shadow-sm transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:-translate-y-1">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-lg">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="relative z-10 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <p className="text-sm font-medium text-muted-foreground/60">
            © {new Date().getFullYear()} Coherence OS. Built for scale.
          </p>
        </div>
      </div>

      {/* RIGHT — Auth Wrapper */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="glass-panel p-8 rounded-3xl">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
