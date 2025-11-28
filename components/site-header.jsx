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
    { title: "Crops Master", paths: ["/admin/crops-list", "/admin/add-crops", "/admin/edit-crops", "/admin/view-crops"] },
    { title: "Products Master", paths: ["/admin/products-list", "/admin/add-products", "/admin/edit-products", "/admin/view-products"] },
    { title: "Govt Schemes Master", paths: ["/admin/list-schemes", "/admin/add-schemes", "/admin/edit-schemes", "/admin/view-schemes"] },
    { title: "Media Master", paths: ["/admin/media-master"] },
    { title: "Tutorials Master", paths: ["/admin/tutorials-list", "/admin/add-tutorial", "/admin/edit-tutorial", "/admin/view-tutorial"] },
    { title: "Crops Sale Requests", paths: ["/admin/sale-requests", "/admin/edit-sale-request"] },
    { title: "Product Order Requests", paths: ["/admin/order-requests", "/admin/edit-product-order"] },
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
