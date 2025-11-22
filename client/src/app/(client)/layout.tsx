import { ReactNode } from "react";
import { ClientSidebar } from "@/components/client-sidebar";
import Footer from "@/components/footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <ClientSidebar />
      <main className="relative max-h-[100dvh] min-h-[100dvh] w-full flex-1">
        {/* <ClientHeader /> */}
        {children}
        <Footer />
      </main>
    </>
  );
};

export default Layout;
