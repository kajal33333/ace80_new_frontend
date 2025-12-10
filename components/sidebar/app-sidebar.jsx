



"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { getCookie, hasCookie } from "cookies-next";
import { JSONParse } from "@/lib/utils";
import {
  LucideVegan,
  Leaf,
  LucideUser,
  LucideLayoutDashboard,
  Package,
  ChevronDown,
  
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSidebar({ ...props }) {
  const instance = axiosInstance();
  const [dynamicNav, setDynamicNav] = useState([]);

  const user = hasCookie("agritech_user")
    ? JSONParse(getCookie("agritech_user"))
    : null;

  // Static navigation
  const baseNavItems = [
    { title: "Dashboard", link: "/admin/dashboard", icon: LucideLayoutDashboard },
    { title: "Users", link: "/admin/users-list", icon: LucideUser },
    { title: "Roles", link: "/admin/roles", icon: Leaf },
    { title: "Customers", link: "/admin/customers", icon: Package },

    // COLLAPSIBLE ENQUIRY DATA
    {
      title: "Enquiry Data",
      icon: Package,
      children: [
        { title: "Division", url: "/admin/division" },
        { title: "State", url: "/admin/state" },
        { title: "Models", url: "/admin/models" },
        { title: "Region", url: "/admin/region" },
        { title: "Category", url: "/admin/category" },
        { title: "Customer business", url: "/admin/customer-business" },
        { title: "Customer business type", url: "/admin/customer-business-type" },
        { title: "Order probability", url: "/admin/order-probability" },
        { title: "Competitor name", url: "/admin/competitor-name" },
      ],
    },
    {
      title: "Leave/OD",
      icon: Package,
      children: [
        { title: "Status", url: "/admin/leave-status" },
        { title: " Type", url: "/admin/leave-type" },

      ],
    },
    {
      title: "ToDo",
      icon: Package,
      children: [
          { title: "Priority", url: "/admin/todo-priority" },
        { title: "Status", url: "/admin/todo-status" },
      

      ],
    },
    {
      title: "Events",
      icon: Package,
      children: [
        { title: " Enquiry Status", url: "/admin/enquiry-status" },
        { title: "Probability", url: "/admin/event-probability" },

      ],
    },
  ];

  useEffect(() => {
    const fetchDynamicNav = async () => {
      try {
        const response = await instance.get("/permissions/sidebar");

        const items =
          response.data?.data[0]?.children?.map((item) => ({
            ...item,
            children: [],
          })) || [];

        setDynamicNav(items);
      } catch (err) {
        console.error("Failed to fetch nav items:", err);
      }
    };

    fetchDynamicNav();
  }, []);

  const navItems = [...baseNavItems, ...dynamicNav];

  const renderNavItems = (items) => {
    return items.map((item, index) => {
      const Icon = item.icon || LucideVegan;
      const hasChildren = item.children && item.children.length > 0;

      // COLLAPSIBLE MENU
      if (hasChildren) {
        return (
          <SidebarMenuItem key={`${item.title}-${index}`}>
            <Collapsible>
             <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-[#F77A04] rounded cursor-pointer  text-sm text-white font-medium">
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4" />
    <span>{item.title}</span>      
  </div>
  <ChevronDown className="w-4 h-4" />
</CollapsibleTrigger>

              <CollapsibleContent>
                <div className="ml-6 mt-1 flex flex-col gap-1 ">
                  {item.children.map((sub, i) => (
                    <Link
  key={`${sub.title}-${i}`}
  href={sub.url}
  className="flex items-center w-full p-2 text-sm rounded-md hover:bg-[#F77A04] hover:text-accent-foreground transition-colors"
>
  {sub.title}
</Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        );
      }

      // NORMAL MENU ITEM
      return (
       
          <SidebarMenuItem key={`${item.title}-${index}`}>
  <SidebarMenuButton
    asChild
    className="flex items-center w-full gap-2 p-2 text-white rounded-md bg-black hover:bg-[#F77A04] transition-colors"
  >
    <Link href={item.link || "#"} className="flex items-center w-full gap-2">
      <Icon className="w-4 h-4" />
      <span>{item.menu_name || item.title}</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

       
      );
    });
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}  className="bg-black text-white">
     <SidebarHeader className="bg-black text-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
            <Link href="/admin/dashboard" className="flex items-center w-full">
  <img 
    src="/Ace80.png" 
    alt="Ace 80 Logo"
    className="
      h-10 w-auto object-contain
      mx-auto
      md:ml-10
      lg:ml-14
    "
  />
</Link>


            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

    <SidebarContent className="bg-black text-white">

        <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>
      </SidebarContent>

     <SidebarFooter className="bg-black text-white">

        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
