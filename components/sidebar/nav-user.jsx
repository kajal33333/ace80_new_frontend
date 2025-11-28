"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { JSONParse } from "@/lib/utils";
import { useContext } from "react";
import ThemeContext from "@/context/ThemeContext";
import { Sun,Moon } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

export function NavUser() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const instance = axiosInstance();

  const { isMobile } = useSidebar();
  const router = useRouter()
  const handleLogout = async() => {
    await instance.post("/users/logout")
    deleteCookie('agritech_token')
    deleteCookie('agritech_user')
    router.push('/login')
  }
  const user = hasCookie('agritech_user') ? JSONParse(getCookie('agritech_user')) : null
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.phone}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                  <AvatarFallback className="rounded-lg">{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.phone}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? <Sun /> : <Moon />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
