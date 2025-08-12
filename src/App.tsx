import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Hospedagens from "./pages/Hospedagens";
import HospedagemDetalhes from "./pages/HospedagemDetalhes";
import ConsultarReserva from "./pages/ConsultarReserva";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminHospedagens from "./pages/AdminHospedagens";
import AdminReservas from "./pages/AdminReservas";
import AdminRelatorios from "./pages/AdminRelatorios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hospedagens" element={<Hospedagens />} />
          <Route path="/hospedagem/:id" element={<HospedagemDetalhes />} />
          <Route path="/consultar-reserva" element={<ConsultarReserva />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/hospedagens" element={<AdminHospedagens />} />
          <Route path="/admin/reservas" element={<AdminReservas />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
