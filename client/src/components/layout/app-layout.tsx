import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Building2, PlusCircle, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Add Company", url: "/companies/new", icon: PlusCircle },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="p-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-foreground">
                  Intelli<span className="text-primary">Credit</span>
                </h1>
                <p className="text-xs text-muted-foreground">Credit Decisioning Engine</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {navItems.map((item) => {
                    const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`px-4 py-6 rounded-xl transition-all duration-200 ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md font-semibold"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Link href={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className="w-5 h-5" />
                            <span className="text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-4 px-6 py-4 border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">IntelliCredit</span>
              <span>/</span>
              <span>{navItems.find(n => n.url === "/" ? location === "/" : location.startsWith(n.url))?.title || "Dashboard"}</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 md:p-10">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
