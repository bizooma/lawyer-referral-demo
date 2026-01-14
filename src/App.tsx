import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DemoLayout } from "@/components/layout/DemoLayout";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import Deployment from "./pages/Deployment";
import Ethics from "./pages/Ethics";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import DemoLogin from "./pages/demo/DemoLogin";
import Dashboard from "./pages/demo/Dashboard";
import IntakeWizard from "./pages/demo/IntakeWizard";
import Matching from "./pages/demo/Matching";
import AttorneyDirectory from "./pages/demo/AttorneyDirectory";
import Reports from "./pages/demo/Reports";
import Settings from "./pages/demo/Settings";
import GuidedTour from "./pages/demo/GuidedTour";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DemoAuthProvider>
          <Routes>
            {/* Marketing Site */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/features" element={<Features />} />
              <Route path="/deployment" element={<Deployment />} />
              <Route path="/ethics" element={<Ethics />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            {/* Demo Application */}
            <Route path="/demo" element={<DemoLogin />} />
            <Route element={<DemoLayout />}>
              <Route path="/demo/dashboard" element={<Dashboard />} />
              <Route path="/demo/intake" element={<IntakeWizard />} />
              <Route path="/demo/matching" element={<Matching />} />
              <Route path="/demo/attorneys" element={<AttorneyDirectory />} />
              <Route path="/demo/reports" element={<Reports />} />
              <Route path="/demo/settings" element={<Settings />} />
              <Route path="/demo/tour" element={<GuidedTour />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DemoAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
