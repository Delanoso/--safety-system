import { MobileSidebarProvider } from "@/contexts/MobileSidebarContext";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileSidebarProvider>
      <div className="flex min-h-screen min-w-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="p-4 sm:p-6 overflow-x-auto flex-1">{children}</main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}
