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
import LoginPage from "@/pages/LoginPage";
import SignUpPage from "@/pages/SignUpPage";

const queryClient = new QueryClient();

async function initStatusBar() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });
  } catch {
    // web 환경에서는 StatusBar API 없음 — 무시
  }
}

const App = () => {
  useEffect(() => { initStatusBar(); }, []);
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SyncStatus />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/edit/:id" element={<AddTransaction />} />
          <Route path="/members" element={<Members />} />
          <Route path="/household/setup" element={<HouseholdSetup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
