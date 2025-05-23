
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { APP_NAME, BAKERY_NAME, ROUTES, UI_TEXT } from "@/lib/constants";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Utensils, 
  Briefcase, 
  Users,
  ClipboardList, // For Products
  Beaker,       // For Raw Materials
  Truck,        // For Suppliers
  BookCopy,     // For Recipes
  LayoutDashboard // For Inventory Overview
} from "lucide-react";

const 판매_및_재고_섹션 = [
  { href: ROUTES.POS, label: UI_TEXT.POS_TITLE, icon: ShoppingCart },
  { href: ROUTES.INVENTORY, label: UI_TEXT.INVENTORY_TITLE, icon: LayoutDashboard },
];

const 제품_관리_섹션 = [
  { href: ROUTES.PRODUCTS, label: UI_TEXT.PRODUCTS_TITLE, icon: ClipboardList },
  { href: ROUTES.RAW_MATERIALS, label: UI_TEXT.RAW_MATERIALS_TITLE, icon: Beaker },
  { href: ROUTES.RECIPES, label: UI_TEXT.RECIPES_TITLE, icon: BookCopy },
  { href: ROUTES.SUPPLIERS, label: UI_TEXT.SUPPLIERS_TITLE, icon: Truck },
];

const 관리_섹션 = [
  { href: ROUTES.BRANCHES, label: UI_TEXT.BRANCHES_TITLE, icon: Briefcase },
  { href: ROUTES.USERS, label: UI_TEXT.USERS_TITLE, icon: Users },
  { href: ROUTES.REPORTS, label: UI_TEXT.REPORTS_TITLE, icon: BarChart3 },
];

const renderNavItems = (items: typeof 판매_및_재고_섹션, pathname: string) => {
  return items.map((item) => (
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
  ));
};

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
      
      <SidebarMenu className="flex-1 p-2 space-y-1">
        {renderNavItems(판매_및_재고_섹션, pathname)}
        <SidebarSeparator className="my-2" />
        {renderNavItems(제품_관리_섹션, pathname)}
        <SidebarSeparator className="my-2" />
        {renderNavItems(관리_섹션, pathname)}
      </SidebarMenu>
      
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} {BAKERY_NAME}
        </p>
      </SidebarFooter>
    </>
  );
}
