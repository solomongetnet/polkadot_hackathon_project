import type { Metadata } from "next";

//@ts-ignore
import "@/assets/styles/globals.css";
//@ts-ignore
import "@/assets/styles/gradient.css";
import { Toaster } from "@/components/ui/sonner";
import LogoImage from "@/assets/images/logo.webp";
import TanstackQueryProvider from "@/providers/tanstack-query.provider";
import { ThemeProvider } from "@/providers/theme.provider";
import { UpgradeModal } from "@/components/upgrade-modal";
import { CustomToastContainer } from "@/components/shared/custom-toast";
import ComponentPreloader from "./component-preloader";
import { AuthSynchronizer } from "@/components/auth-synchronizer";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Charapia - AI Assistant",
  description:
    "Charapia is an AI assistant that helps you with your daily tasks.",
  icons: [
    {
      rel: "icon",
      type: "image/webp",
      url: LogoImage.src,
    },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: any;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body>
        <Toaster
          position="top-center"
          duration={4000}
          toastOptions={{
            style: {
              borderRadius: "9999px", // Fully rounded corners
              background: "white",
              color: "black",
              padding: "1rem 2rem", // Add some padding for better appearance
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Optional: add a subtle shadow
              zIndex: 1000,
            },
            className: "my-sonner-toast", // Optional: for additional custom CSS if needed
          }}
        />

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TanstackQueryProvider>
            <SidebarProvider>
              {children}
              {modal}
            </SidebarProvider>

            <AuthSynchronizer />
            <ComponentPreloader />

            <UpgradeModal />
            <CustomToastContainer />
          </TanstackQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
