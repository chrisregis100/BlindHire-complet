import { JobView } from "@/lib/types";

interface JobsTableProps {
  jobs: JobView[];
}

function formatTimestamp(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function JobsTable({ jobs }: JobsTableProps) {
  if (!jobs.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <p className="text-sm text-muted-foreground">No jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-background text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Job</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Commit By</th>
            <th className="px-4 py-3">Reveal By</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.jobId}
              className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors duration-150"
            >
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">#{job.jobId}</p>
                <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
                  {job.jobDescription}
                </p>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {job.clientAddress.slice(0, 10)}…
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatTimestamp(job.commitDeadline)}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatTimestamp(job.revealDeadline)}
              </td>
              <td className="px-4 py-3">
                {job.finalized ? (
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                    Finalized
                  </span>
                ) : (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Open
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
