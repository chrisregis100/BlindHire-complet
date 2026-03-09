interface TxStatusProps {
  error: string;
  lastTxHash: string;
  isLoading: boolean;
}

export function TxStatus({ error, lastTxHash, isLoading }: TxStatusProps) {
  if (isLoading) {
    return (
      <div 
        className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
        <p className="text-sm text-primary">Transaction in progress…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!lastTxHash) return null;

  return (
    <div 
      className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <p className="mb-0.5 text-xs text-muted-foreground">Transaction confirmed</p>
      <p className="break-all font-mono text-xs text-green-500">{lastTxHash}</p>
    </div>
  );
}
