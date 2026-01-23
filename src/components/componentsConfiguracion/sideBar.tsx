import { Sidebar, SidebarContent, SidebarInset, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from "@/components/ui/sidebar"
import { Search, Settings, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { roles } from "@/utils/const"
import { NavLink } from "react-router-dom"

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ComponentType;
  role?: string[];
  type?: string;
};

const ConfigItems: SidebarItem[] = [
  {
    title: "Usuarios",
    icon: User,
    role: [roles.ADMIN, roles.EDITOR, roles.EMPLEADO],
    type: "group"
  },
  {
    title: "Perfil",
    url: "/configuracion/perfil",
    icon: User,
    role: [roles.ADMIN, roles.EDITOR, roles.EMPLEADO],
    type: "content"
  },
  {
    title: "Usuarios",
    url: "/configuracion/usuarios",
    icon: User,
    role: [roles.ADMIN],
    type: "content"
  },
  {
    title: "Invitaciones",
    url: "/configuracion/invitaciones",
    icon: Search,
    role: [roles.ADMIN],
    type: "content"
  },
  {
    title: "Configuración",
    icon: Settings,
    role: [roles.ADMIN, roles.EDITOR],
    type: "group"
  },
  {
    title: "Productos",
    url: "/configuracion/productos",
    icon: Settings,
    role: [roles.ADMIN, roles.EDITOR],
    type: "content"
  },
  {
    title: "Servicios",
    url: "/configuracion/servicios",
    icon: Settings,
    role: [roles.ADMIN, roles.EDITOR],
    type: "content"
  }
]

export function AppSidebarConfig() {
  const { user } = useAuth();
  return (
    <Sidebar variant="inset" collapsible="none">
      <SidebarInset >
        <SidebarContent>
        <SidebarGroup className="flex flex-col gap-y-6">
          <SidebarHeader>
            Configuración
          </SidebarHeader>
          <SidebarGroupContent>
            <SidebarMenu>
              {ConfigItems.map((item) => {
                if (item.role && !item.role.includes(user?.role)) {
                  return null;
                }
                if (item.type && item.type === "group" ){
                  return (
                    <SidebarGroupLabel key={`group-${item.title}`}>
                      {item.title}
                    </SidebarGroupLabel>
                  )
                }
                return (
                <SidebarMenuItem key={`item-${item.title}`}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url ?? ""}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )})}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      </SidebarInset>
    </Sidebar>
  )
}