"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  const routes = [
    { title: "Dashboard", paths: ["/admin/dashboard"] },
    { title: "Users Master", paths: ["/admin/users-list", "/admin/add-user", "/admin/edit-user", "/admin/view-user"] },
    { title: " Roles", paths: ["/admin/roles", "/admin/add-role", "/admin/edit-role", "/admin/view-role"] },
    { title: " Customers / Bulk Upload", paths: ["/admin/customers", "/admin/add-customer", "/admin/edit-customer", "/admin/view-customer"] },
    { title: "Daily Reports", paths: ["/admin/daily-report", "/admin/add-report", "/admin/edit-daily-report", "/admin/view-daily-report"] },
    { title: "Enquiry", paths: ["/admin/enquiry", "/admin/add-enquiry","/admin/edit-enquiry","/admin/view-enquiry"] },
    { title: "Division", paths: ["/admin/division", "/admin/add-division", "/admin/edit-division", "/admin/view-division"] },
    { title: "States", paths: ["/admin/state", "/admin/add-state","/admin/edit-state","/admin/view-state"] },
    { title: "Models", paths: ["/admin/models", "/admin/edit-model", "/admin/add-model", "/admin/view-model"] },
    { title: "Region", paths: ["/admin/region", "/admin/edit-region", "/admin/add-region", "/admin/view-region"] },
     {title:"Event Enquiry Status", paths:["/admin/enquiry-status","/admin/add-enquiry-status","/admin/edit-enquiry-status","/admin/view-enquiry-status"]},
     { title: "Customer Business Type", paths: ["/admin/customer-business-type", "/admin/edit-type", "/admin/add-type", "/admin/view-type"] },
    { title: "Category", paths: ["/admin/category", "/admin/edit-category", "/admin/add-category", "/admin/view-category"] },
    { title: "Customer Business", paths: ["/admin/customer-business", "/admin/edit-customerBusiness", "/admin/add-customerBusiness", "/admin/view-customerBusiness"] },
   {title:"Order Probability", paths:["/admin/order-probability","/admin/add-order-probability","/admin/edit-order-probability","/admin/view-order-probability"]},
   {title:"Competitior", paths:["/admin/competitor-name","/admin/add-competitor","/admin/edit-competitor","/admin/view-competitor"]},
    {title:"Leave/OD Type", paths:["/admin/leave-type","/admin/add-leaveOd-type","/admin/edit-leaveOd-type","/admin/view-leaveOd-type"]},
    {title:"Leave/OD Status", paths:["/admin/leave-status","/admin/add-status","/admin/edit-status","/admin/view-status"]},
    {title:"ToDo Priority", paths:['/admin/todo-priority','/admin/add-todopriority','/admin/edit-todopriority','/admin/view-todopriority']},
    {title:'ToDo Status', paths:['/admin/todo-status','/admin/add-todostatus','/admin/edit-todostatus','/admin/view-todostatus']},
   
    {title:"Event Probability", paths:['/admin/event-probability','/admin/add-event-probability','/admin/edit-event-probability','/admin/view-event-probability']},
    
  ];
  
  const getTitle = () =>
    routes.find(route => route.paths.some(path => pathname.includes(path)))?.title || "";
  

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </Link>
          </Button> */}
        </div>
      </div>
    </header>
  );
}
