'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Coins, UserCircle, Settings, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/grants',
      label: 'Grants',
      icon: Coins,
    },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="w-7 h-7 text-primary" />
          <span className="text-lg font-headline font-semibold tracking-tight">BioMetallica</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="justify-start w-full gap-2 p-2 h-auto">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/40x40" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                        <p className="text-sm font-medium">Demo User</p>
                        <p className="text-xs text-muted-foreground">user@example.com</p>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 mb-2" align="start">
                <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
                        <UserCircle /> Profile
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2">
                        <Settings /> Settings
                    </Button>
                    <Separator />
                     <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-2 text-destructive hover:text-destructive">
                        <LogOut /> Log out
                    </Button>
                </div>
            </PopoverContent>
         </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}
