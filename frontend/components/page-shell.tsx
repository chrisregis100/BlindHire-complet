import { ReactNode } from "react";

import { PageContainer } from "@/components/page-container";

interface PageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
  narrow?: boolean;
}

export function PageShell({ title, subtitle, children, action, narrow }: PageShellProps) {
  return (
    <PageContainer title={title} subtitle={subtitle} action={action} narrow={narrow}>
      {children}
    </PageContainer>
  );
}
