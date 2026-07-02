import AppointmentsShell from "@/components/AppointmentsShell";

export default function AppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppointmentsShell>{children}</AppointmentsShell>;
}
