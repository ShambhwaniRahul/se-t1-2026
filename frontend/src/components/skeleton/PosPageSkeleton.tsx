import { Shimmer } from "@/components/ui/shimmer";

export default function PosPageSkeleton() {
  return (
    <div className="-m-4 md:-m-6 flex h-[calc(100svh-3.5rem)] flex-col">

      {/* Category bar */}
      <div className="border-b bg-card px-4 py-3 flex gap-2">
        {[...Array(6)].map((_, i) => (
          <Shimmer key={i} className="h-8 w-24" />
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Items grid */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <Shimmer className="h-24 w-full" />
                <Shimmer className="h-4 w-3/4" />
                <Shimmer className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart panel */}
        <div className="hidden md:flex w-[500px] lg:w-[600px] xl:w-[650px] border-l p-4 flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="space-y-2">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-20" />
              </div>
              <Shimmer className="h-6 w-16" />
            </div>
          ))}

          <div className="mt-auto space-y-2">
            <Shimmer className="h-5 w-full" />
            <Shimmer className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Bottom checkout bar */}
      <div className="p-4 border-t flex justify-between items-center">
        <Shimmer className="h-6 w-32" />
        <Shimmer className="h-10 w-40" />
      </div>
    </div>
  );
}
