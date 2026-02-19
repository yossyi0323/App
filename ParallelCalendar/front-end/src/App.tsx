import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./routes/login";
import ParallelCalendar from "./components/parallel-calendar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { SidebarRight } from "./components/sidebar-right";
import log from "./lib/loglevel";

function App() {
  // import.meta.env.VITE_GOOGLE_CLIENT_ID
  // TODO: Google APIキーを取得して設定する
  const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_PLACEHOLDER";

  log.info("App started");

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>October 2024</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto">
                <ModeToggle />
              </div>
            </header>
            <ParallelCalendar />
            {/* <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted/50 aspect-square rounded-xl"
                  />
                ))}
              </div>
            </div> */}
          </SidebarInset>

          <SidebarRight width="24rem" />
        </SidebarProvider>
        <Toaster />
        {/* <Login /> */}
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
