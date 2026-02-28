import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { LayoutDashboard, Building2, PlusCircle, LogOut, ShieldAlert } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Companies", url: "/companies", icon: Building2 },
    { title: "Add Company", url: "/companies/new", icon: PlusCircle },
  ];

  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
          <SidebarHeader className="p-6 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl tracking-tight text-foreground">Intelli<span className="text-primary">Credit</span></h1>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3 py-6">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.url}
                        className={`
                          px-4 py-6 rounded-xl transition-all duration-200
                          ${location === item.url 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary hover:text-primary-foreground" 
                            : "text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm"
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full font-medium">
                          <item.icon className="w-5 h-5" />
                          <span className="text-base">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-border/30">
            <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground leading-tight">{user?.firstName} {user?.lastName}</span>
                  <span className="text-xs text-muted-foreground truncate w-24">Analyst</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
