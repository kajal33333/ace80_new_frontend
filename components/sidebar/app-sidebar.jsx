



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
    { title: "Dashboard", url: "/admin/dashboard", icon: LucideLayoutDashboard },
    { title: "Users", url: "/admin/users-list", icon: LucideUser },
    { title: "Roles", url: "/admin/roles", icon: Leaf },
    { title: "Customers", url: "/admin/customers", icon: Package },

    // COLLAPSIBLE ENQUIRY DATA
    {
      title: "Enquiry Data",
      icon: Package,
      children: [
        { title: "Division", url: "/admin/division" },
        { title: "State", url: "/admin/state" },
        { title: "models", url: "/admin/models" },
        { title: "Region", url: "/admin/region" },
        { title: "category", url: "/admin/category" },
        { title: "customer business", url: "/admin/customer-business" },
        { title: "customer business type", url: "/admin/customer-business-type" },
        { title: "order probability", url: "/admin/order-probability" },
        { title: "competitor name", url: "/admin/competitor-name" },
      ],
    },
    {
      title: "Leave/OD",
      icon: Package,
      children: [
        { title: "status", url: "/admin/leave-status" },
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
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-100 rounded cursor-pointer">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {item.title}
                </div>
                <ChevronDown className="w-4 h-4" />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="ml-6 mt-1 flex flex-col gap-1">
                  {item.children.map((sub, i) => (
                    <Link
                      key={`${sub.title}-${i}`}
                      href={sub.url}
                      className="p-2 text-sm hover:bg-gray-100 rounded"
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
          <SidebarMenuButton asChild>
            <Link
              href={item.url || item.link || "#"}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 p-2 rounded text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              <span>{item.menu_name || item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <LucideVegan color="green" className="!size-5" />
                <span className="text-base font-semibold text-green-700">AgriTech</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>{renderNavItems(navItems)}</SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
