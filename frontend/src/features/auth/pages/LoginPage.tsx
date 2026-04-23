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
    <div className="grid min-h-screen w-full grid-cols-2 bg-white">

      <div className="relative flex flex-col justify-between p-25 ps-30 bg-linear-to-br from-zinc-50 to-zinc-100/80 border-r border-zinc-200/50">

        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, black 1px, transparent 0)", backgroundSize: "24px 24px" }}
        />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center bg-primary text-black shadow-lg shadow-primary/20 font-bold text-xl">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">Coherence</span>
        </div>

        <div className="relative z-10 flex max-w-lg flex-col gap-12">
          <div className="space-y-6">
            <div className="text-4xl font-bold leading-[1.1] tracking-tight text-zinc-900 flex flex-col gap-2.5">
            <div><h1>Bring Coherence</h1></div>
            <div><h1>to your <span className="text-primary">Chaos.</span></h1></div>
            </div>
            <p className="text-lg text-zinc-600 leading-relaxed">
              The all-in-one platform for smarter restaurant management. Streamline operations, boost efficiency, and delight customers with Coherence.
            </p>
          </div>

          <div className="grid gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/5">
                  <Icon className="h-6 w-6 text-primary" />
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

      <div className="flex items-center justify-center p-8 bg-zinc-50/30">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
