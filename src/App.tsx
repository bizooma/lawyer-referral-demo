import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DemoLayout } from "@/components/layout/DemoLayout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { AttorneyLayout } from "@/components/layout/AttorneyLayout";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";
import { DemoLoginGuard, StaffGuard, ClientGuard, AttorneyGuard } from "@/components/auth/DemoAuthGuard";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import Deployment from "./pages/Deployment";
import Ethics from "./pages/Ethics";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
// Demo - Staff
import DemoLogin from "./pages/demo/DemoLogin";
import Dashboard from "./pages/demo/Dashboard";
import IntakeWizard from "./pages/demo/IntakeWizard";
import Matching from "./pages/demo/Matching";
import AttorneyDirectory from "./pages/demo/AttorneyDirectory";
import Reports from "./pages/demo/Reports";
import Settings from "./pages/demo/Settings";
import GuidedTour from "./pages/demo/GuidedTour";
// Demo - Client
import ClientDashboard from "./pages/demo/client/ClientDashboard";
import ClientReferrals from "./pages/demo/client/ClientReferrals";
import ClientIntakeWizard from "./pages/demo/client/ClientIntakeWizard";
import ClientProfile from "./pages/demo/client/ClientProfile";
import PublicClientIntake from "./pages/demo/client/PublicClientIntake";
// Demo - Attorney
import AttorneyDashboard from "./pages/demo/attorney/AttorneyDashboard";
import AttorneyReferrals from "./pages/demo/attorney/AttorneyReferrals";
import AttorneyProfile from "./pages/demo/attorney/AttorneyProfile";
import AttorneyAvailability from "./pages/demo/attorney/AttorneyAvailability";
import AttorneySignup from "./pages/demo/attorney/AttorneySignup";

const queryClient = new QueryClient();

// Main App component with SEO and routing
const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
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

              {/* Demo Application - Login & Signup (redirect if already logged in) */}
              <Route path="/demo" element={<DemoLoginGuard><DemoLogin /></DemoLoginGuard>} />
              <Route path="/demo/attorney/signup" element={<AttorneySignup />} />
              <Route path="/demo/client/intake" element={<PublicClientIntake />} />

              {/* Demo - Staff Portal (Intake Specialist & Program Admin) */}
              <Route element={<StaffGuard><DemoLayout /></StaffGuard>}>
                <Route path="/demo/dashboard" element={<Dashboard />} />
                <Route path="/demo/intake" element={<IntakeWizard />} />
                <Route path="/demo/matching" element={<Matching />} />
                <Route path="/demo/attorneys" element={<AttorneyDirectory />} />
                <Route path="/demo/reports" element={<Reports />} />
                <Route path="/demo/settings" element={<Settings />} />
                <Route path="/demo/tour" element={<GuidedTour />} />
              </Route>

              {/* Demo - Client Portal */}
              <Route element={<ClientGuard><ClientLayout /></ClientGuard>}>
                <Route path="/demo/client/dashboard" element={<ClientDashboard />} />
                <Route path="/demo/client/referrals" element={<ClientReferrals />} />
                <Route path="/demo/client/intake" element={<ClientIntakeWizard />} />
                <Route path="/demo/client/profile" element={<ClientProfile />} />
              </Route>

              {/* Demo - Attorney Portal */}
              <Route element={<AttorneyGuard><AttorneyLayout /></AttorneyGuard>}>
                <Route path="/demo/attorney/dashboard" element={<AttorneyDashboard />} />
                <Route path="/demo/attorney/referrals" element={<AttorneyReferrals />} />
                <Route path="/demo/attorney/profile" element={<AttorneyProfile />} />
                <Route path="/demo/attorney/availability" element={<AttorneyAvailability />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DemoAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
