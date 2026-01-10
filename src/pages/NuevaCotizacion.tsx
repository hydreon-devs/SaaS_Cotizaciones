import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Header from "@/components/Header";
import VistaPrevia from "@/components/VistaPrevia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatosCotizacion, Producto } from "@/types/cotizacion";
import { serviciosMock } from "@/data/cotizaciones";
import { toast } from "sonner";

const NuevaCotizacion = () => {
  const location = useLocation();
  const plantillaData = location.state?.plantilla as DatosCotizacion | undefined;
  const vistaPreviaRef = useRef<HTMLDivElement>(null);

  const [datos, setDatos] = useState<DatosCotizacion>({
    cliente: "",
    evento: "",
    consideraciones: "",
    descuento: 0,
    fecha: "",
    nombreEncargado: "Carlos Jaramillo",
    cargo: "Director general",
    productos: [],
  });

  useEffect(() => {
    if (plantillaData) {
      setDatos({
        ...plantillaData,
        productos: plantillaData.productos.map((p, index) => ({
          ...p,
          id: `${Date.now()}-${index}`,
        })),
      });
      toast.success("Plantilla cargada correctamente");
    }
  }, []);

  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("");

  const handleInputChange = (field: keyof DatosCotizacion, value: string | number) => {
    setDatos((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgregarProducto = () => {
    if (!servicioSeleccionado) {
      toast.error("Selecciona un servicio");
      return;
    }

    const servicio = serviciosMock.find((s) => s.id === servicioSeleccionado);
    if (!servicio) return;

    const nuevoProducto: Producto = {
      id: `${Date.now()}`,
      descripcion: servicio.nombre,
      cantidad: 1,
      precioUnitario: servicio.precio,
    };

    setDatos((prev) => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto],
    }));

    setServicioSeleccionado("");
    toast.success("Producto agregado");
  };

  const handleEliminarProducto = (id: string) => {
    setDatos((prev) => ({
      ...prev,
      productos: prev.productos.filter((p) => p.id !== id),
    }));
    toast.info("Producto eliminado");
  };

  const handleCantidadChange = (id: string, cantidad: number) => {
    setDatos((prev) => ({
      ...prev,
      productos: prev.productos.map((p) =>
        p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p
      ),
    }));
  };

  const handleGuardarCotizacion = () => {
    if (!datos.cliente) {
      toast.error("Ingresa el nombre del cliente");
      return;
    }
    if (datos.productos.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }
    toast.success("Cotización guardada exitosamente");
  };

  const handleDescargarPDF = async () => {
    if (!vistaPreviaRef.current) return;

    toast.loading("Generando PDF...", { id: "pdf-loading" });

    try {
      const canvas = await html2canvas(vistaPreviaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = datos.cliente
        ? `cotizacion-${datos.cliente.replace(/\s+/g, "-").toLowerCase()}.pdf`
        : "cotizacion.pdf";
      
      pdf.save(fileName);
      toast.success("PDF descargado correctamente", { id: "pdf-loading" });
    } catch (error) {
      toast.error("Error al generar el PDF", { id: "pdf-loading" });
      console.error(error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Generador de cotizaciones</h1>
          <p className="text-sm text-muted-foreground">
            Crea cotizaciones de manera rápida y sencilla
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Información de cotización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Cliente / Empresa
                    </label>
                    <Input
                      placeholder="Ingrese nombre completo"
                      value={datos.cliente}
                      onChange={(e) => handleInputChange("cliente", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Evento</label>
                    <Input
                      placeholder="Nombre del evento"
                      value={datos.evento}
                      onChange={(e) => handleInputChange("evento", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Consideraciones (una por línea)
                  </label>
                  <Textarea
                    placeholder="Consideraciones"
                    value={datos.consideraciones}
                    onChange={(e) => handleInputChange("consideraciones", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Descuento (en porcentaje)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={datos.descuento || ""}
                    onChange={(e) => handleInputChange("descuento", Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Fecha</label>
                    <Input
                      type="date"
                      value={datos.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Nombre del encargado
                    </label>
                    <Input
                      placeholder="Carlos Jaramillo"
                      value={datos.nombreEncargado}
                      onChange={(e) => handleInputChange("nombreEncargado", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cargo</label>
                    <Input
                      placeholder="Director general"
                      value={datos.cargo}
                      onChange={(e) => handleInputChange("cargo", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agregar servicios y productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Servicio</label>
                  <Select value={servicioSeleccionado} onValueChange={setServicioSeleccionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviciosMock.map((servicio) => (
                        <SelectItem key={servicio.id} value={servicio.id}>
                          {servicio.nombre} - {formatCurrency(servicio.precio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAgregarProducto} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar producto a la cotización
                </Button>

                {/* Lista de productos agregados */}
                {datos.productos.length > 0 && (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Producto</th>
                          <th className="text-center p-3 font-medium w-20">Cant.</th>
                          <th className="text-right p-3 font-medium w-24">Total</th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {datos.productos.map((producto) => (
                          <tr key={producto.id} className="border-t border-border">
                            <td className="p-3">{producto.descripcion}</td>
                            <td className="p-3 text-center">
                              <Input
                                type="number"
                                min="1"
                                value={producto.cantidad}
                                onChange={(e) =>
                                  handleCantidadChange(producto.id, Number(e.target.value))
                                }
                                className="w-16 text-center mx-auto"
                              />
                            </td>
                            <td className="p-3 text-right">
                              {formatCurrency(producto.cantidad * producto.precioUnitario)}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEliminarProducto(producto.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="space-y-4">
            <VistaPrevia ref={vistaPreviaRef} datos={datos} />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleDescargarPDF}>
                <Download className="h-4 w-4 mr-2" />
                Descargar Cotización
              </Button>
              <Button onClick={handleGuardarCotizacion}>Guardar Cotización</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevaCotizacion;
