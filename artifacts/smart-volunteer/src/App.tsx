import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Volunteers from "@/pages/volunteers";
import Emergencies from "@/pages/emergencies";
import Analyze from "@/pages/analyze";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const NAV_ITEMS = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/volunteers", label: "Volunteers", icon: Users },
  { path: "/emergencies", label: "Emergencies", icon: AlertTriangle },
  { path: "/analyze", label: "AI Analysis", icon: Brain },
];

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const [location] = useLocation();

  return (
    <aside
      className={`${
        mobile
          ? "fixed inset-y-0 left-0 z-50 w-64 shadow-xl"
          : "hidden lg:flex w-64 shrink-0"
      } flex-col bg-sidebar border-r border-sidebar-border`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">VolunteerAI</p>
            <p className="text-xs text-sidebar-foreground/60">Emergency Response</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="text-sidebar-foreground/60 hover:text-sidebar-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">Powered by Gemini AI</p>
      </div>
    </aside>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <Sidebar mobile onClose={() => setMobileOpen(false)} />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center px-4 py-3 border-b bg-background">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">VolunteerAI</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/volunteers" component={Volunteers} />
            <Route path="/emergencies" component={Emergencies} />
            <Route path="/analyze" component={Analyze} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppLayout />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
