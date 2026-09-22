// app/_components/layout/AppShell.tsx
import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* Desktop (md+): sidebar lateral. Mobile: header + bottom nav abaixo. */}
      <AppSidebar />
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <MobileHeader />
        <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
