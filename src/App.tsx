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
import { AppLayout } from "@/components/layout/AppLayout";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoLoginGuard, StaffGuard, ClientGuard, AttorneyGuard } from "@/components/auth/DemoAuthGuard";
import { RequireAuth } from "@/components/auth/RequireAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import Features from "./pages/Features";
import Deployment from "./pages/Deployment";
import Ethics from "./pages/Ethics";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
// Real auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// Real app
import AppDashboard from "./pages/app/AppDashboard";
import AppAttorneys from "./pages/app/AppAttorneys";
import AppMatching from "./pages/app/AppMatching";
import AppSettings from "./pages/app/AppSettings";
import AppDomains from "./pages/app/AppDomains";
import AppCompliance from "./pages/app/AppCompliance";
import AppIntakes from "./pages/app/AppIntakes";
import AppIntakeDetail from "./pages/app/AppIntakeDetail";
import AppReferrals from "./pages/app/AppReferrals";
import AppReports from "./pages/app/AppReports";
// Real attorney portal
import { AttorneyPortalLayout } from "@/components/layout/AttorneyPortalLayout";
import RealAttorneyDashboard from "./pages/attorney/AttorneyDashboard";
import RealAttorneyReferrals from "./pages/attorney/AttorneyReferrals";
import RealAttorneyProfile from "./pages/attorney/AttorneyProfile";
import RealAttorneyAvailability from "./pages/attorney/AttorneyAvailability";
import AcceptInvite from "./pages/attorney/AcceptInvite";
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
          <AuthProvider>
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

                {/* Real authentication pages */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Real authenticated app (multi-tenant) */}
                <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                  <Route path="/app" element={<AppDashboard />} />
                  <Route path="/app/attorneys" element={<AppAttorneys />} />
                  <Route path="/app/intakes" element={<AppIntakes />} />
                  <Route path="/app/intakes/:id" element={<AppIntakeDetail />} />
                  <Route path="/app/matching" element={<AppMatching />} />
                  <Route path="/app/referrals" element={<AppReferrals />} />
                  <Route path="/app/reports" element={<AppReports />} />
                  <Route path="/app/domains" element={<AppDomains />} />
                  <Route path="/app/compliance" element={<AppCompliance />} />
                  <Route path="/app/settings" element={<AppSettings />} />
                </Route>

                {/* Demo Application - Login & Signup (redirect if already logged in) */}
                <Route path="/demo" element={<DemoLoginGuard><DemoLogin /></DemoLoginGuard>} />
                <Route path="/demo/attorney/signup" element={<AttorneySignup />} />
                <Route path="/demo/client/intake" element={<PublicClientIntake />} />

                {/* Demo - Staff Portal */}
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
          </AuthProvider>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
