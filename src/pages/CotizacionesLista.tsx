import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CotizacionesService } from "@/services/cotizacionesService";
import { Cotizacion } from "@/types/cotizacion";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, FileText, Trash2 } from "lucide-react";
import { roles } from "@/utils/const";

const CotizacionesLista = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [clientes, setClientes] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clienteFilter, setClienteFilter] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogEliminarAbierto, setDialogEliminarAbierto] = useState(false);
  const [cotizacionAEliminar, setCotizacionAEliminar] = useState<Cotizacion | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const itemsPerPage = 10;
  const esAdmin = user?.role === roles.ADMIN;

  // Cargar cotizaciones y clientes al montar el componente
  useEffect(() => {
    let activo = true;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [cotizacionesData, clientesData] = await Promise.all([
          CotizacionesService.obtenerTodas(),
          CotizacionesService.obtenerClientes(),
        ]);
        if (!activo) return;
        setCotizaciones(cotizacionesData);
        setClientes(clientesData);
      } catch (error) {
        if (!activo) return;
        toast.error("Error al cargar las cotizaciones");
        console.error(error);
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      activo = false;
    };
  }, []);

  // Convierte fecha dd/mm/yyyy o dd-mm-yyyy a Date para comparación
  const parseFechaCotizacion = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    // Acepta tanto "/" como "-" como separadores (formato dd/mm/yyyy o dd-mm-yyyy)
    const parts = fechaStr.split(/[/-]/);
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  // Convierte fecha del input date (yyyy-mm-dd) a Date local
  const parseFechaInput = (fechaStr: string): Date | null => {
    if (!fechaStr) return null;
    const parts = fechaStr.split("-");
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const filteredData = useMemo(() => {
    return cotizaciones.filter((cot) => {
      // Filtro por cliente
      if (clienteFilter !== "todos" && cot.cliente !== clienteFilter) return false;

      // Filtro por rango de fechas
      const cotFecha = parseFechaCotizacion(cot.fecha);
      if (cotFecha) {
        if (fechaDesde) {
          const desde = parseFechaInput(fechaDesde);
          if (desde && cotFecha < desde) return false;
        }
        if (fechaHasta) {
          const hasta = parseFechaInput(fechaHasta);
          if (hasta) {
            hasta.setHours(23, 59, 59, 999);
            if (cotFecha > hasta) return false;
          }
        }
      }

      return true;
    });
  }, [cotizaciones, clienteFilter, fechaDesde, fechaHasta]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [clienteFilter, fechaDesde, fechaHasta]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLimpiarFiltros = () => {
    setClienteFilter("todos");
    setFechaDesde("");
    setFechaHasta("");
    setCurrentPage(1);
  };

  const handleSeleccionarCotizacion = async (cotizacion: Cotizacion) => {
    try {
      const datos = await CotizacionesService.obtenerPorId(Number(cotizacion.id));
      if (datos) {
        navigate("/nueva", { state: { plantilla: datos } });
      } else {
        toast.error("No se pudo cargar la cotización");
      }
    } catch (error) {
      toast.error("Error al cargar la cotización");
      console.error(error);
    }
  };

  const handleClickEliminar = (cotizacion: Cotizacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setCotizacionAEliminar(cotizacion);
    setDialogEliminarAbierto(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!cotizacionAEliminar) return;

    try {
      setEliminando(true);
      await CotizacionesService.eliminar(Number(cotizacionAEliminar.id));

      // Close dialog and trigger exit animation
      setDialogEliminarAbierto(false);
      setEliminandoId(cotizacionAEliminar.id);

      // Wait for animation then remove from state
      setTimeout(() => {
        setCotizaciones((prev) => prev.filter((c) => c.id !== cotizacionAEliminar.id));
        setCotizacionAEliminar(null);
        setEliminandoId(null);
        toast.success("Cotización eliminada correctamente");
      }, 300);
    } catch (error) {
      toast.error("Error al eliminar la cotización");
      console.error(error);
    } finally {
      setEliminando(false);
    }
  };

  const handleCancelarEliminar = () => {
    setDialogEliminarAbierto(false);
    setCotizacionAEliminar(null);
  };

  return (
    <>
      <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Cotizaciones Anteriores</CardTitle>
                <CardDescription>Consulta y gestiona tus cotizaciones guardadas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filtros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-foreground">Filtrar Cotizaciones</h3>
                <Link to="/nueva">
                  <Button className="group">
                    <span className="transition-transform duration-200 group-hover:scale-110">+</span>
                    Nueva Cotización
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
                  <Select value={clienteFilter} onValueChange={setClienteFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los clientes</SelectItem>
                      {clientes.length === 0 ? (
                        <SelectItem value="sin-clientes" disabled>
                          No hay clientes disponibles
                        </SelectItem>
                      ) : (
                        clientes.map((cliente) => (
                          <SelectItem key={cliente} value={cliente}>
                            {cliente}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha desde</label>
                  <Input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha hasta</label>
                  <Input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleLimpiarFiltros} className="w-full">
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            {cargando ? (
              <div className="text-center py-12">
                <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Cargando cotizaciones...</p>
              </div>
            ) : cotizaciones.length === 0 ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="animate-float">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2 animate-fade-in [animation-delay:200ms]">
                  No hay cotizaciones guardadas
                </h2>
                <p className="text-sm text-muted-foreground mb-6 animate-fade-in [animation-delay:400ms]">
                  Crea tu primera cotización para comenzar
                </p>
                <div className="animate-fade-in [animation-delay:600ms]">
                  <Button onClick={() => navigate("/nueva")} className="group">
                    <span className="transition-transform duration-200 group-hover:rotate-90">+</span>
                    Crear Nueva Cotización
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Resultados ({filteredData.length})
                  </span>
                </div>

                <div className="border rounded-lg overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>N° Cotización</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Monto Total</TableHead>
                        <TableHead className="text-center w-16">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No hay cotizaciones que coincidan con los filtros
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((cotizacion, index) => (
                          <TableRow
                            key={cotizacion.id}
                            className={`
                              cursor-pointer
                              transition-all duration-200 ease-out
                              hover:bg-primary/5 hover:shadow-sm
                              animate-fade-in opacity-0
                              ${eliminandoId === cotizacion.id ? 'animate-slide-out-right !opacity-100' : ''}
                            `}
                            style={{
                              animationDelay: eliminandoId === cotizacion.id ? '0ms' : `${index * 50}ms`,
                              animationFillMode: 'forwards'
                            }}
                            onClick={() => handleSeleccionarCotizacion(cotizacion)}
                          >
                            <TableCell className="font-medium text-primary transition-transform duration-200 group-hover:translate-x-1">
                              {cotizacion.numero}
                            </TableCell>
                            <TableCell>{cotizacion.cliente}</TableCell>
                            <TableCell>{cotizacion.fecha}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cotizacion.montoTotal)}
                            </TableCell>
                            <TableCell className="text-center">
                              {esAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95"
                                  onClick={(e) => handleClickEliminar(cotizacion, e)}
                                >
                                  <Trash2 className="h-4 w-4 transition-transform duration-200 hover:rotate-12" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground order-2 sm:order-1">
                      Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, filteredData.length)} de{" "}
                      {filteredData.length} resultados
                    </span>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        ‹
                      </Button>
                      {/* Mobile: solo página actual */}
                      <span className="sm:hidden px-3 py-1 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      {/* Desktop: números de página */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            if (totalPages <= 5) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                          })
                          .map((page, idx, arr) => (
                            <span key={page} className="flex items-center">
                              {idx > 0 && arr[idx - 1] !== page - 1 && (
                                <span className="px-1 text-muted-foreground">...</span>
                              )}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Button>
                            </span>
                          ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="transition-all duration-200 hover:scale-105 active:scale-95"
                      >
                        ›
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Diálogo de confirmación para eliminar */}

      <Dialog open={dialogEliminarAbierto} onOpenChange={setDialogEliminarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Cotización</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la cotización{" "}
              <span className="font-semibold text-foreground">
                {cotizacionAEliminar?.numero}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelarEliminar}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmarEliminar}
              disabled={eliminando}
            >
              {eliminando ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CotizacionesLista;
