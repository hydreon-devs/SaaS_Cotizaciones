import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import StatusBadge from "@/components/StatusBadge";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cotizacionesMock } from "@/data/cotizaciones";
import { EstadoCotizacion } from "@/types/cotizacion";

const CotizacionesLista = () => {
  const [clienteFilter, setClienteFilter] = useState("");
  const [fechaDesde, setFechaDesde] = useState("01/01/2023");
  const [fechaHasta, setFechaHasta] = useState("31/12/2023");
  const [estadoFilter, setEstadoFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(cotizacionesMock.length / itemsPerPage);

  const filteredData = cotizacionesMock.filter((cot) => {
    if (estadoFilter !== "todos" && cot.estado !== estadoFilter) return false;
    if (clienteFilter && !cot.cliente.toLowerCase().includes(clienteFilter.toLowerCase())) return false;
    return true;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleLimpiarFiltros = () => {
    setClienteFilter("");
    setFechaDesde("01/01/2023");
    setFechaHasta("31/12/2023");
    setEstadoFilter("todos");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
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
                  <Button>Nueva Cotización</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Cliente</label>
                  <Select value={clienteFilter || "todos"} onValueChange={(v) => setClienteFilter(v === "todos" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los clientes</SelectItem>
                      <SelectItem value="Grupo Empresarial XYZ">Grupo Empresarial XYZ</SelectItem>
                      <SelectItem value="Constructora Edificar S.A.">Constructora Edificar S.A.</SelectItem>
                      <SelectItem value="Comercial Monterrey">Comercial Monterrey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha desde</label>
                  <Input
                    type="text"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="bg-primary/5 border-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fecha hasta</label>
                  <Input
                    type="text"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Estado</label>
                  <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="aprobada">Aprobada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="rechazada">Rechazada</SelectItem>
                      <SelectItem value="expirada">Expirada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleLimpiarFiltros}>
                  Limpiar filtros
                </Button>
                <Button>Buscar</Button>
              </div>
            </div>

            {/* Resultados */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Resultados ({filteredData.length})
                </span>
                <Select defaultValue="reciente">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reciente">Fecha (más reciente)</SelectItem>
                    <SelectItem value="antiguo">Fecha (más antiguo)</SelectItem>
                    <SelectItem value="monto">Monto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>N° Cotización</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Monto Total</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((cotizacion) => (
                      <TableRow key={cotizacion.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-primary">
                          {cotizacion.numero}
                        </TableCell>
                        <TableCell>{cotizacion.cliente}</TableCell>
                        <TableCell>{cotizacion.fecha}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(cotizacion.montoTotal)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={cotizacion.estado} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, filteredData.length)} de{" "}
                  {filteredData.length} resultados
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CotizacionesLista;
