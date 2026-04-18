import { useEffect, useState } from "react";

export type UtcClock = {
  date: string; // YYYY.MM.DD
  time: string; // HH:MM:SS
};

function format(d: Date): UtcClock {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
  };
}

export function useUtcClock(): UtcClock {
  const [now, setNow] = useState<UtcClock>(() => format(new Date()));
  useEffect(() => {
    const id = window.setInterval(() => setNow(format(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
