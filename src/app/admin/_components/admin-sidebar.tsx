"use client"

import {
  BarChart3,
  Package,
  ShoppingBag,
  Users,
  UserCheck,
  Mail,
  LogOut,
  ImageIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "User Requests", icon: UserCheck, id: "user-requests" },
  { title: "Product Management", icon: Package, id: "products" },
  { title: "Category Management", icon: Package, id: "category" },
  { title: "User Enquiry", icon: Users, id: "user-enquiry" },
  { title: "Brands", icon: BarChart3, id: "brands" },
  { title: "Contact Us", icon: Mail, id: "contact-us" },
  { title: "Sliding Banners", icon: ImageIcon, id: "sliding-banners" },
]

interface AdminSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  onLogout: () => void
}

export function AdminSidebar({
  activeSection,
  setActiveSection,
  onLogout,
}: AdminSidebarProps) {
  return (
    <Sidebar className="border-r border-rose-200 flex flex-col">
      {/* HEADER */}
      <SidebarHeader className="border-b border-rose-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400 to-pink-500">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-900">
              Cosmetic Admin
            </h2>
            <p className="text-sm text-rose-600">Wholesale Management</p>
          </div>
        </div>
      </SidebarHeader>

      {/* MENU */}
      <SidebarContent className="flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start gap-3 px-3 py-2 text-rose-700 hover:bg-rose-100 hover:text-rose-900 data-[active=true]:bg-rose-200 data-[active=true]:text-rose-900"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* LOGOUT */}
      <div className="border-t border-rose-200 p-3">
        <SidebarMenuButton
          onClick={onLogout}
          className="w-full justify-start gap-3 px-3 py-2 text-red-600 hover:bg-red-100 hover:text-red-700"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </SidebarMenuButton>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}
