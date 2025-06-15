
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import AuthPage from "./pages/Auth";
import RachadinhaPage from "./pages/RachadinhaPage";
import CreateRachadinhaPage from "./pages/CreateRachadinhaPage";
import AddParticipantsPage from "./pages/AddParticipantsPage";
import ContactsPage from "./pages/ContactsPage";
import SupportPage from "./pages/SupportPage";
import StorePage from "./pages/StorePage";
import MainLayout from "./layouts/MainLayout";
import ProductDetailPage from "./pages/ProductDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/rachadinha/:id" element={<RachadinhaPage />} />
              <Route path="/create-rachadinha" element={<CreateRachadinhaPage />} />
              <Route path="/rachadinha/:id/add-participants" element={<AddParticipantsPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/store" element={<StorePage />} />
            </Route>

            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
