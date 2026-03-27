import { useEffect, useState } from "react";

interface ElapsedTimerProps {
  since: number;
  className?: string;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ElapsedTimer({ since, className }: ElapsedTimerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = now - since;
  const minutes = Math.floor(elapsed / 60_000);
  const isUrgent = minutes >= 5;
  const isWarning = minutes >= 3 && !isUrgent;

  return (
    <span
      className={[
        "font-mono text-lg font-bold tabular-nums",
        isUrgent ? "text-destructive animate-pulse" : isWarning ? "text-warning" : "text-muted-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {formatElapsed(elapsed)}
    </span>
  );
}
