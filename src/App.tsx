import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import SyncStatus from "@/components/SyncStatus";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import Charts from "@/pages/Charts";
import SettingsPage from "@/pages/SettingsPage";
import AddTransaction from "@/pages/AddTransaction";
import Members from "@/pages/Members";
import NotFound from "@/pages/NotFound";
import HouseholdSetup from "@/pages/HouseholdSetup";
import CalendarPage from "@/pages/CalendarPage";
import NotificationsPage from "@/pages/NotificationsPage";
import JarsPage from "@/pages/JarsPage";
import SpecialExpensesPage from "@/pages/SpecialExpensesPage";
import BudgetPage from "@/pages/BudgetPage";
import JarAllocPage from "@/pages/settings/JarAllocPage";
import HelpPage from "@/pages/settings/HelpPage";
import UtilityBillsPage from "@/pages/settings/UtilityBillsPage";
import LanguagePage from "@/pages/settings/LanguagePage";
import CurrencyPage from "@/pages/settings/CurrencyPage";
import { SubscriptionProvider } from "@/components/SubscriptionProvider";
import { useSubscription } from "@/hooks/useSubscription";
import PaywallSheet from "@/components/paywall/PaywallSheet";
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

async function initStatusBar() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // Blue header extends into status bar — use light (white) icons
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#2563d9' });
  } catch {
    // web 환경에서는 StatusBar API 없음 — 무시
  }
}

function PaywallBridge() {
  const { showPaywall } = useSubscription();
  return showPaywall ? <PaywallSheet /> : null;
}

const App = () => {
  useEffect(() => { initStatusBar(); }, []);
  return (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SubscriptionProvider>
        <PaywallBridge />
        <SyncStatus />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/jars" element={<JarsPage />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/edit/:id" element={<AddTransaction />} />
          <Route path="/members" element={<Members />} />
          <Route path="/household/setup" element={<HouseholdSetup />} />
          <Route path="/special-expenses" element={<SpecialExpensesPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/settings/jars" element={<JarAllocPage />} />
          <Route path="/settings/utility" element={<UtilityBillsPage />} />
          <Route path="/settings/language" element={<LanguagePage />} />
          <Route path="/settings/currency" element={<CurrencyPage />} />
          <Route path="/settings/help" element={<HelpPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
        </SubscriptionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
