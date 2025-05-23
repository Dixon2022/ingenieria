"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { APP_NAME, BAKERY_NAME, ROUTES, UI_TEXT } from "@/lib/constants";
import { Home, ShoppingCart, Package, BarChart3, Utensils } from "lucide-react";

const navItems = [
  { href: ROUTES.POS, label: UI_TEXT.POS_TITLE, icon: ShoppingCart },
  { href: ROUTES.INVENTORY, label: UI_TEXT.INVENTORY_TITLE, icon: Package },
  { href: ROUTES.REPORTS, label: UI_TEXT.REPORTS_TITLE, icon: BarChart3 },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href={ROUTES.POS} className="flex items-center gap-2 p-2">
          <Utensils className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-sidebar-foreground">{APP_NAME}</span>
            <span className="text-xs text-sidebar-foreground/70 -mt-1">{BAKERY_NAME}</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== ROUTES.POS && pathname.startsWith(item.href))}
                tooltip={item.label}
                className="justify-start"
              >
                <a> {/* This <a> tag is important when asChild is true and Link is the parent */}
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {/* Can add user info or settings link here */}
        <p className="text-xs text-sidebar-foreground/50 text-center group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} {BAKERY_NAME}
        </p>
      </SidebarFooter>
    </>
  );
}
