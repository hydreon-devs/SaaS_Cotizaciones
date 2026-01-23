import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import NuevaCotizacion from "./pages/NuevaCotizacion";
import Plantillas from "./pages/Plantillas";
import Servicios from "./pages/Servicios";
import Productos from "./pages/Productos";
import Database from "./pages/Database";
import CotizacionDetalle from "./pages/CotizacionDetalle";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/admin-panel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cotizaciones/:id"
                element={
                  <ProtectedRoute>
                    <CotizacionDetalle />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/nueva"
                element={
                  <ProtectedRoute>
                    <NuevaCotizacion />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plantillas"
                element={
                  <ProtectedRoute>
                    <Plantillas />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/database"
                element={
                  <ProtectedRoute>
                    <Database />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/servicios"
                element={
                  <ProtectedRoute>
                    <Servicios />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productos"
                element={
                  <ProtectedRoute>
                    <Productos />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="admin-panel"
                element= {
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
