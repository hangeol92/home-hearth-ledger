import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import BudgetPage from "@/pages/BudgetPage";
import Charts from "@/pages/Charts";
import SettingsPage from "@/pages/SettingsPage";
import AddTransaction from "@/pages/AddTransaction";
import Members from "@/pages/Members";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/members" element={<Members />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
