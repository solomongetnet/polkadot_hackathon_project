import { ReactNode } from "react";
import { ClientSidebar } from "@/components/client-sidebar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ClientSidebar />
      <main className="relative max-h-[100dvh] min-h-[100dvh] w-full flex-1">
        {/* <ClientHeader /> */}
        {children}
      </main>
    </>
  );
};

export default Layout;
