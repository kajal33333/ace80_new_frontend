"use client";

import * as React from "react";
import { LucideVegan,Leaf, LucideUser,LucideLayoutDashboard, LucideImage, LucideListChecks, Sprout, Package, Landmark, BookOpen,ShoppingCart, ShoppingBasket,PlayCircle, MessageSquare } from "lucide-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { getCookie, hasCookie } from 'cookies-next';
import { JSONParse } from '@/lib/utils';


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LucideLayoutDashboard,
    },
    {
      title: "Users",
      url: "/admin/users-list",
      icon: LucideUser,
    },
    {
      title: "Roles",
      url: "/admin/crops-list",
      icon: Leaf,
    },
    {
      title: "Product Master",
      url: "/admin/products-list",
      icon: Package,
    },
    {
      title: "Govt Schemes Master",
      url: "/admin/list-schemes",
      icon: Landmark,
    },
    {
      title: "Media Master",
      url: "/admin/media-master",
      icon: LucideImage,
    },
    {
      title: "Tutorials Master",
      url: "/admin/tutorials-list",
      icon: PlayCircle,
    },
    {
      title: "Crops Sale Requests",
      url: "/admin/sale-requests",
      icon: ShoppingBasket,
    },
    {
      title: "Product Order Requests",
      url: "/admin/order-requests",
      icon: ShoppingCart,
    },
  ],
};

export function AppSidebar({ ...props }) {
  // Get current user to determine role-based navigation
  const user = hasCookie('agritech_user') ? JSONParse(getCookie('agritech_user')) : null;
  const userRole = user?.role || 'User';

  // Base navigation items
  let baseNavItems = [];

  if(userRole === 'Support'){
    baseNavItems = []
  }
  else{
      baseNavItems = [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LucideLayoutDashboard,
    },
    {
      title: "User Master",
      url: "/admin/users-list",
      icon: LucideUser,
    },
    {
      title: "Roles",
      url: "/admin/crops-list",
      icon: Leaf,
    },
    {
      title: "Product Master",
      url: "/admin/products-list",
      icon: Package,
    },
    {
      title: "Govt Schemes Master",
      url: "/admin/list-schemes",
      icon: Landmark,
    },
    {
      title: "Media Master",
      url: "/admin/media-master",
      icon: LucideImage,
    },
    {
      title: "Tutorials Master",
      url: "/admin/tutorials-list",
      icon: PlayCircle,
    },
    {
      title: "Crops Sale Requests",
      url: "/admin/sale-requests",
      icon: ShoppingBasket,
    },
    {
      title: "Product Order Requests",
      url: "/admin/order-requests",
      icon: ShoppingCart,
    },
  ];
  }


  // Add chat navigation based on user role
  const chatNavItems = [];
  
  if (userRole === 'Support') {
    chatNavItems.push({
      title: "Support Chat",
      url: "/admin/support-chat",
      icon: MessageSquare,
    });
  }
  
  if (userRole === 'Admin') {
    chatNavItems.push({
      title: "All Conversations",
      url: "/admin/all-conversations",
      icon: MessageSquare,
    });
  }
  
  if (userRole === 'User') {
    chatNavItems.push({
      title: "Contact Support",
      url: "/farmer/support",
      icon: MessageSquare,
    });
  }

  // Combine navigation items
  const navItems = [...baseNavItems, ...chatNavItems];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard">
                <LucideVegan color="green" className="!size-5" />
                <span className="text-base font-semibold text-green-700">AgriTech</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
