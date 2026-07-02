import IncidentsShell from "@/components/IncidentsShell";

export default function IncidentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IncidentsShell>{children}</IncidentsShell>;
}
