"use client";

import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({ items }) {
  const pathname = usePathname();
  const isActive = (url) => pathname === url;

  const routeGroups = {
    "/admin/dashboard": ["/admin/dashboard"],
    "/admin/users-list": ["/admin/users-list", "/admin/add-user", "/admin/edit-user", "/admin/view-user"],
    "/admin/crops-list": ["/admin/crops-list", "/admin/add-crops", "/admin/edit-crops", "/admin/view-crops"],
    "/admin/products-list": ["/admin/products-list", "/admin/add-products", "/admin/edit-products", "/admin/view-products"],
    "/admin/sale-requests": ["/admin/sale-requests", "/admin/edit-sale-request"],
    "/admin/list-schemes": ["/admin/list-schemes", "/admin/add-schemes", "/admin/edit-schemes", "/admin/view-schemes"],
    "/admin/media-master": ["/admin/media-master"],
    "/admin/tutorials-list": ["/admin/tutorials-list", "/admin/add-tutorial", "/admin/edit-tutorial", "/admin/view-tutorial"],
    "/admin/order-requests": ["/admin/order-requests", "/admin/edit-product-order"],
  };
  
  const getUrl = (url) => {
    const group = Object.entries(routeGroups).find(([, paths]) =>
      paths.includes(pathname)
    );
    return group?.[0] === url;
  };
  


  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <Link href={item.url} key={item.title}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={getUrl(item.url)}
                  tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
