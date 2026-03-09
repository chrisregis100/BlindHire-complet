"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetUnix: number;
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function computeTimeLeft(targetUnix: number): TimeLeft {
  const now = Math.floor(Date.now() / 1000);
  const diff = targetUnix - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
    expired: false,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ targetUnix, label, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(computeTimeLeft(targetUnix));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetUnix));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetUnix]);

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
        <span className="text-xs font-medium text-muted-foreground">Expired</span>
      </div>
    );
  }

  // Urgency color
  const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const urgencyClass = totalSeconds < 3600
    ? "text-red-500"
    : totalSeconds < 86400
      ? "text-amber-500 dark:text-amber-400"
      : "text-foreground";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>}
      <div className={`flex items-baseline gap-0.5 font-mono text-sm font-bold tabular-nums ${urgencyClass}`}>
        {timeLeft.days > 0 && (
          <>
            <span>{timeLeft.days}</span>
            <span className="text-[10px] font-normal text-muted-foreground mr-1">d</span>
          </>
        )}
        <span>{pad(timeLeft.hours)}</span>
        <span className="text-muted-foreground animate-pulse">:</span>
        <span>{pad(timeLeft.minutes)}</span>
        <span className="text-muted-foreground animate-pulse">:</span>
        <span>{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
