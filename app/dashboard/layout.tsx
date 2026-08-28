import { DashboardFrame } from "@/components/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
