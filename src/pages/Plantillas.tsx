import { useNavigate } from "react-router-dom";
import { Building2, Heart, Presentation, PartyPopper, Rocket, FileText, Check } from "lucide-react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { plantillasMock } from "@/data/plantillas";
import { PlantillaCotizacion } from "@/types/cotizacion";

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

  const handleSeleccionarPlantilla = (plantilla: PlantillaCotizacion) => {
    // Navegar a /nueva con los datos de la plantilla
    navigate("/nueva", { state: { plantilla: plantilla.datos } });
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillasMock.map((plantilla) => (
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
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Valor base:</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(calcularTotal(plantilla))}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Comienza con una cotización vacía
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Plantillas;
