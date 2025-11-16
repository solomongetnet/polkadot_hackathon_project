import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AdminSidebar variant="inset"/>
     
      <SidebarInset className="rounded-xl overflow">
        <AdminHeader />

        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </>
  );
};

export default AdminLayout;
