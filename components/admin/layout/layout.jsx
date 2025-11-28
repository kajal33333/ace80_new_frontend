import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const AdminLayout = ({ children }) => {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <SiteHeader />
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
