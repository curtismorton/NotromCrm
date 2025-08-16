import { ReactNode } from "react";
import { AppShell } from "@/components/ui/AppShell";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}