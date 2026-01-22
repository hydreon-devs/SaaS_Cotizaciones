import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Building2, Heart, Presentation, PartyPopper, Rocket, FileText, Check, Trash2, Edit, User, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlantillaCotizacion } from "@/types/cotizacion";
import { PlantillasService } from "@/services/plantillasService";
import { toast } from "sonner";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-8 w-8" />,
  Heart: <Heart className="h-8 w-8" />,
  Presentation: <Presentation className="h-8 w-8" />,
  PartyPopper: <PartyPopper className="h-8 w-8" />,
  Rocket: <Rocket className="h-8 w-8" />,
  FileText: <FileText className="h-8 w-8" />,
};


const Plantillas = () => {
  const navigate = useNavigate();
  const [plantillas, setPlantillas] = useState<PlantillaCotizacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogEditarAbierto, setDialogEditarAbierto] = useState(false);
  const [plantillaEditando, setPlantillaEditando] = useState<PlantillaCotizacion | null>(null);
  const [nombreEditar, setNombreEditar] = useState("");
  const [descripcionEditar, setDescripcionEditar] = useState("");

  // Cargar plantillas desde Supabase al montar el componente
  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      setCargando(true);
      const plantillasGuardadas = await PlantillasService.obtenerTodas();
      setPlantillas(plantillasGuardadas);
    } catch (error) {
      toast.error("Error al cargar las plantillas");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const handleSeleccionarPlantilla = (plantilla: PlantillaCotizacion) => {
    // Navegar a /nueva con los datos de la plantilla
    navigate("/nueva", { state: { plantilla: plantilla.datos } });
  };

  const handleAbrirEditar = (plantilla: PlantillaCotizacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlantillaEditando(plantilla);
    setNombreEditar(plantilla.nombre);
    setDescripcionEditar(plantilla.descripcion);
    setDialogEditarAbierto(true);
  };

  const handleGuardarEdicion = async () => {
    if (!plantillaEditando) return;

    if (!nombreEditar.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await PlantillasService.actualizar(plantillaEditando.id, {
        nombre: nombreEditar,
        descripcion: descripcionEditar,
      });

      await cargarPlantillas();
      setDialogEditarAbierto(false);
      toast.success("Plantilla actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la plantilla");
    }
  };

  const handleEliminarPlantilla = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await PlantillasService.eliminar(id);
      await cargarPlantillas();
      toast.success("Plantilla eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la plantilla");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calcularTotal = (plantilla: PlantillaCotizacion) => {
    const subtotal = plantilla.datos.productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioUnitario,
      0
    );
    return subtotal;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Plantillas de Cotización</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona una plantilla para comenzar rápidamente con tu cotización
          </p>
        </div>

        {cargando ? (
          <div className="text-center py-12">
            <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
            <p className="text-sm text-muted-foreground">Cargando plantillas...</p>
          </div>
        ) : plantillas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No hay plantillas guardadas
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Crea tu primera plantilla desde el cotizador
            </p>
            <Button onClick={() => navigate("/nueva")}>
              Crear Nueva Cotización
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plantillas.map((plantilla) => (
            <Card
              key={plantilla.id}
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 group"
              onClick={() => handleSeleccionarPlantilla(plantilla)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`${plantilla.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform`}
                  >
                    {iconMap[plantilla.icono]}
                  </div>
                  {plantilla.datos.descuento > 0 && (
                    <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                      -{plantilla.datos.descuento}% desc.
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{plantilla.nombre}</CardTitle>
                <CardDescription className="text-sm">
                  {plantilla.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {plantilla.datos.productos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Incluye:
                    </div>
                    <ul className="space-y-1.5">
                      {plantilla.datos.productos.slice(0, 3).map((producto) => (
                        <li
                          key={producto.id}
                          className="flex items-center gap-2 text-sm text-foreground"
                        >
                          <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{producto.descripcion}</span>
                        </li>
                      ))}
                      {plantilla.datos.productos.length > 3 && (
                        <li className="text-xs text-muted-foreground pl-5">
                          +{plantilla.datos.productos.length - 3} más
                        </li>
                      )}
                    </ul>
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Valor base:</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(calcularTotal(plantilla))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Creada por: {plantilla.autor}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="py-4 text-center text-sm text-muted-foreground">
                      Comienza con una cotización vacía
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
                      <User className="h-3 w-3" />
                      <span>Creada por: {plantilla.autor}</span>
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => handleAbrirEditar(plantilla, e)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={(e) => handleEliminarPlantilla(plantilla.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </main>

      {/* Diálogo para editar plantilla */}
      <Dialog open={dialogEditarAbierto} onOpenChange={setDialogEditarAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plantilla</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la plantilla.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre-editar">
                Nombre de la plantilla <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre-editar"
                value={nombreEditar}
                onChange={(e) => setNombreEditar(e.target.value)}
                placeholder="Nombre de la plantilla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion-editar">Descripción</Label>
              <Textarea
                id="descripcion-editar"
                value={descripcionEditar}
                onChange={(e) => setDescripcionEditar(e.target.value)}
                placeholder="Descripción de la plantilla"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGuardarEdicion}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Plantillas;
