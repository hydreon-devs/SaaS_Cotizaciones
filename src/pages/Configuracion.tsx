import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarConfig } from "@/components/componentsConfiguracion/sideBar";
import { Outlet } from "react-router-dom";

export default function Configuracion () {
  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-64px)] w-full">
        <AppSidebarConfig />

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </SidebarProvider>
  )
}