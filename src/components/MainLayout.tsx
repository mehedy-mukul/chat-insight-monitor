
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { LayoutDashboard, List, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="flex items-center justify-between">
            <div className="px-2 py-2 text-lg font-semibold">
              AI Chatbot Monitor
            </div>
            <SidebarTrigger />
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
                      <Link to="/">
                        <LayoutDashboard />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/executions")} tooltip="Executions">
                      <Link to="/executions">
                        <List />
                        <span>Executions</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                <div className="flex items-center justify-between px-2 py-2">
                  <ThemeToggle />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
