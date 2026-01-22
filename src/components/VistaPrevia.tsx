import { forwardRef } from "react";
import { FileText } from "lucide-react";
import { DatosCotizacion } from "@/types/cotizacion";

interface VistaPreviaProps {
  datos: DatosCotizacion;
}

const VistaPrevia = forwardRef<HTMLDivElement, VistaPreviaProps>(({ datos }, ref) => {
  const subtotal = datos.productos.reduce(
    (acc, p) => acc + p.cantidad * p.precioUnitario,
    0
  );
  const descuentoMonto = subtotal * (datos.descuento / 100);
  const subtotalConDescuento = subtotal - descuentoMonto;
  const iva = subtotalConDescuento * 0.19;
  const total = subtotalConDescuento + iva;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div ref={ref} className="bg-card rounded-lg border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Vista Previa de Cotización</h3>

      <div className="bg-card border border-border rounded-lg p-6 text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Cotizaciones</span>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-foreground">COTIZACIÓN</h2>
            <p className="text-muted-foreground text-xs">Fecha: {datos.fecha || formatDate(today)}</p>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-6 text-xs text-muted-foreground">
          <p>Medellín, Colombia</p>
          <p>cjproducciones@gmail.com</p>
          <p>+57 312 2345 6789</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Client Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Cliente</h4>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{datos.cliente || "Nombre del cliente"}</p>
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Evento</h4>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{datos.evento || "Nombre del evento"}</p>
            </div>
          </div>
        </div>
        <div className="border-b border-border mb-6" />

        {/* Detail Table */}
        <div className="mb-6">
          <h4 className="font-semibold text-foreground mb-2">Detalles de los servicios y productos</h4>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Descripción</th>
                  <th className="text-center p-2 font-medium w-12">Cant.</th>
                  <th className="text-right p-2 font-medium w-20">Precio</th>
                  <th className="text-right p-2 font-medium w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {datos.productos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Agrega productos para ver el detalle
                    </td>
                  </tr>
                ) : (
                  datos.productos.map((producto) => (
                    <tr key={producto.id} className="border-t border-border">
                      <td className="p-2">{producto.descripcion}</td>
                      <td className="p-2 text-center">{producto.cantidad}</td>
                      <td className="p-2 text-right">{formatCurrency(producto.precioUnitario)}</td>
                      <td className="p-2 text-right">
                        {formatCurrency(producto.cantidad * producto.precioUnitario)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-48 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {datos.descuento > 0 && (
              <div className="flex justify-between text-success">
                <span>Descuento ({datos.descuento}%):</span>
                <span>-{formatCurrency(descuentoMonto)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (19%):</span>
              <span>{formatCurrency(iva)}</span>
            </div>
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Consideraciones */}
        {datos.consideraciones && (
          <div className="mb-6">
            <h4 className="font-semibold text-foreground mb-2">Consideraciones</h4>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {datos.consideraciones}
            </div>
          </div>
        )}

        {/* Signature */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="text-xs">
            <p className="font-medium text-foreground">{datos.nombreEncargado || "Carlos Jaramillo"}</p>
            <p className="text-muted-foreground">{datos.cargo || "Director general"}</p>
            <p className="text-muted-foreground">carlos.jaramillo@cjproducciones.com</p>
          </div>
        </div>
      </div>
    </div>
  );
});

VistaPrevia.displayName = "VistaPrevia";

export default VistaPrevia;
