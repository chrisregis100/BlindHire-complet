import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  narrow?: boolean;
}

export function PageContainer({
  children,
  title,
  subtitle,
  action,
  narrow = false,
}: PageContainerProps) {
  return (
    <main className={`mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 ${narrow ? "max-w-2xl" : "max-w-5xl"}`}>
      {(title || subtitle || action) && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-1.5">
            {title && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="max-w-xl text-sm sm:text-base text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
