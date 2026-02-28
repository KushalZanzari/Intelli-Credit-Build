import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";

import { AppLayout } from "@/components/layout/app-layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import CompaniesList from "@/pages/companies/list";
import CreateCompany from "@/pages/companies/create";
import CompanyDetails from "@/pages/companies/details";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Route */}
      <Route path="/">
        {user ? <ProtectedRoute component={Dashboard} /> : <Landing />}
      </Route>
      
      {/* Protected Routes */}
      <Route path="/companies">
        <ProtectedRoute component={CompaniesList} />
      </Route>
      <Route path="/companies/new">
        <ProtectedRoute component={CreateCompany} />
      </Route>
      <Route path="/companies/:id">
        <ProtectedRoute component={CompanyDetails} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
