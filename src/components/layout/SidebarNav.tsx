
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { APP_NAME, BAKERY_NAME, ROUTES, UI_TEXT } from "@/lib/constants";
import { 
  ShoppingCart, 
  LayoutDashboard, // For Inventory Overview
  BarChart3, 
  Utensils, 
  Briefcase, 
  Users,
  ClipboardList, 
  Beaker,       
  Truck,        
  BookCopy,
  ClipboardPlus, // Purchase Orders
  Receipt,       // Sales Orders
  FileEdit,      // Inventory Adjustments
  ArrowRightLeft,// Stock Transfers
  Cog,           // Production Orders (Factory not available)
  Archive // Section icon for Documents
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

const 문서_관리_섹션 = [
  { href: ROUTES.PURCHASE_ORDERS, label: UI_TEXT.PURCHASE_ORDERS_TITLE, icon: ClipboardPlus },
  { href: ROUTES.SALES_ORDERS, label: UI_TEXT.SALES_ORDERS_TITLE, icon: Receipt },
  { href: ROUTES.INVENTORY_ADJUSTMENTS, label: UI_TEXT.INVENTORY_ADJUSTMENTS_TITLE, icon: FileEdit },
  { href: ROUTES.STOCK_TRANSFERS, label: UI_TEXT.STOCK_TRANSFERS_TITLE, icon: ArrowRightLeft },
  { href: ROUTES.PRODUCTION_ORDERS, label: UI_TEXT.PRODUCTION_ORDERS_TITLE, icon: Cog },
];


const 관리_섹션 = [
  { href: ROUTES.BRANCHES, label: UI_TEXT.BRANCHES_TITLE, icon: Briefcase },
  { href: ROUTES.USERS, label: UI_TEXT.USERS_TITLE, icon: Users },
  { href: ROUTES.REPORTS, label: UI_TEXT.REPORTS_TITLE, icon: BarChart3 },
];

const renderNavItems = (items: { href: string; label: string; icon: React.ElementType }[], pathname: string) => {
  return items.map((item) => (
    <SidebarMenuItem key={item.href}>
      <Link href={item.href} legacyBehavior passHref>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.href || (item.href !== ROUTES.POS && pathname.startsWith(item.href))}
          tooltip={item.label}
          className="justify-start"
        >
          <a> 
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
         <SidebarMenuItem>
          <div className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 flex items-center group-data-[collapsible=icon]:justify-center">
            <Archive className="h-4 w-4 mr-2 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Documentos</span>
          </div>
        </SidebarMenuItem>
        {renderNavItems(문서_관리_섹션, pathname)}
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
