import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  Header,
  Footer,
  ImageRun,
  AlignmentType,
  WidthType,
  HeadingLevel,
  PageNumber,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { DatosCotizacion } from "@/types/cotizacion";
import encabezadoImg from "@/assets/encabezadoCJproducciones.png";
import pieDePaginaImg from "@/assets/pieDePaginaCJproducciones.png";
import firmaImg from "@/assets/firmaCJproducciones.png";

interface TotalesCalculados {
  subtotal: number;
  descuentoMonto: number;
  subtotalConDescuento: number;
  iva: number;
  total: number;
}

export class WordExportService {
  private static async fetchImageAsUint8Array(url: string): Promise<Uint8Array> {
    const response = await fetch(url);
    const blob = await response.arrayBuffer();
    return new Uint8Array(blob);
  }

  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  private static calcularTotales(datos: DatosCotizacion): TotalesCalculados {
    const subtotal = datos.productos.reduce(
      (acc, p) => acc + p.cantidad * p.precioUnitario,
      0
    );
    const descuentoMonto = subtotal * (datos.descuento / 100);
    const subtotalConDescuento = subtotal - descuentoMonto;
    const ivaPorcentaje = datos.iva ?? 19;
    const iva = subtotalConDescuento * (ivaPorcentaje / 100);
    const total = subtotalConDescuento + iva;

    return { subtotal, descuentoMonto, subtotalConDescuento, iva, total };
  }

  private static formatDate(fecha: string): string {
    if (!fecha) {
      return new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  private static formatDateLong(fecha: Date): string {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${mes} ${dia} del ${año}`;
  }

  private static formatDateLongInverted(fecha: Date): string {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    
    return `${dia} de ${mes} del ${año}`;
  }
  
  private static async crearHeader(): Promise<Header> {
    const encabezadoData = await this.fetchImageAsUint8Array(encabezadoImg);

    return new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: encabezadoData,
              transformation: {
                width: 600,
                height: 100,
              },
              type: "png",
            }),
          ],
        }),
      ],
    });
  }

  private static async crearFooter(): Promise<Footer> {
    const pieDePaginaData = await this.fetchImageAsUint8Array(pieDePaginaImg);

    return new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: pieDePaginaData,
              transformation: {
                width: 600,
                height: 100,
              },
              type: "png",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: "Página ",
              size: 18,
              color: "666666",
            }),
            new TextRun({
              children: [PageNumber.CURRENT],
              size: 18,
              color: "666666",
            }),
            new TextRun({
              text: " de ",
              size: 18,
              color: "666666",
            }),
            new TextRun({
              children: [PageNumber.TOTAL_PAGES],
              size: 18,
              color: "666666",
            }),
          ],
        }),
      ],
    });
  }

  private static crearSeccionIntroduccion(datos: DatosCotizacion): Paragraph[] {
    const fechaHoy = new Date();
    const fechaEvento = datos.fecha ? new Date(datos.fecha) : null;
    return [
      // Fecha actual
      new Paragraph({
        children: [
          new TextRun({
            text: `Medellín, ${this.formatDateLong(fechaHoy)}`,
            size: 22,
          }),
        ],
        spacing: { after: 200 },
      }),
      // Cliente
      new Paragraph({
        children: [
          new TextRun({
            text: "Sr./Sra.",
            size: 22,
          }),
        ],
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.cliente || "Sin especificar",
            bold: true,
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      }),
      // Descripción de CJ Producciones
      new Paragraph({
        children: [
          new TextRun({
            text: "CJ PRODUCCIONES: ",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: "Es una empresa especializada en la producción de bodas, eventos corporativos, espectáculos artísticos y musicales.",
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      }),
      // Párrafo del evento
      new Paragraph({
        children: [
          new TextRun({
            text: "La siguiente es la cotización para: ",
            size: 22,
          }),
          new TextRun({
            text: datos.evento || "el evento",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: ", que se realizará el día ",
            size: 22,
          }),
          new TextRun({
            text: fechaEvento ? this.formatDateLongInverted(fechaEvento) : "a confirmar",
            bold: true,
            size: 22,
          }),
          new TextRun({
            text: ".",
            size: 22,
          }),
        ],
        spacing: { after: 400 },
      }),
    ];
  }

  private static crearSeccionesServicios(datos: DatosCotizacion): Paragraph[] {
    // Agrupar productos por servicio
    const productosPorServicio = datos.productos.reduce((acc, producto) => {
      const nombreServicio = producto.nombreServicio || "Sin servicio";
      if (!acc[nombreServicio]) {
        acc[nombreServicio] = [];
      }
      acc[nombreServicio].push(producto);
      return acc;
    }, {} as Record<string, typeof datos.productos>);

    const elementos: Paragraph[] = [];

    Object.entries(productosPorServicio).forEach(([nombreServicio, productos]) => {
      // Calcular total del servicio
      const totalServicio = productos.reduce(
        (acc, p) => acc + p.cantidad * p.precioUnitario,
        0
      );

      // Encabezado del servicio con el total
      elementos.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${nombreServicio} - ${this.formatCurrency(totalServicio)}`,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );

      // Encabezado "Producto" (sin viñeta)
      elementos.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Productos:",
              bold: true,
              size: 22,
            }),
          ],
          spacing: { after: 50 },
        })
      );

      // Lista de productos con viñetas
      productos.forEach((producto) => {
        elementos.push(
          new Paragraph({
            children: [
              new TextRun({
                text: producto.descripcion,
                size: 22,
              }),
            ],
            bullet: {
              level: 0,
            },
          })
        );
      });

      // Espacio después de cada servicio
      elementos.push(new Paragraph({ spacing: { after: 200 } }));
    });

    return elementos;
  }

  private static crearSeccionTotales(datos: DatosCotizacion): Paragraph[] {
    const totales = this.calcularTotales(datos);
    const ivaPorcentaje = datos.iva ?? 19;
    const paragraphs: Paragraph[] = [new Paragraph({ spacing: { before: 300 } })];

    if (ivaPorcentaje > 0 || datos.descuento > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: "Subtotal: ", size: 22 }),
            new TextRun({ text: this.formatCurrency(totales.subtotal), size: 22 }),
          ],
        })
      );
    }

    if (datos.descuento > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({
              text: `Descuento (${datos.descuento}%): `,
              size: 22,
              color: "22c55e",
            }),
            new TextRun({
              text: `-${this.formatCurrency(totales.descuentoMonto)}`,
              size: 22,
              color: "22c55e",
            }),
          ],
        })
      );
    }

    if (ivaPorcentaje > 0) {
      paragraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: `IVA (${ivaPorcentaje}%): `, size: 22 }),
            new TextRun({ text: this.formatCurrency(totales.iva), size: 22 }),
          ],
        })
      );
    }

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "TOTAL: ", bold: true, size: 28 }),
          new TextRun({ text: this.formatCurrency(totales.total), bold: true, size: 28 }),
        ],
        spacing: { after: 400 },
      })
    );

    return paragraphs;
  }

  private static crearSeccionConsideraciones(datos: DatosCotizacion): Paragraph[] {
    if (!datos.consideraciones || datos.consideraciones.trim() === "") {
      return [];
    }

    const lineas = datos.consideraciones.split("\n").filter((l) => l.trim());

    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: "Consideraciones", bold: true, size: 26 })],
        spacing: { before: 400, after: 200 },
      }),
      ...lineas.map(
        (linea) =>
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: linea.trim(), size: 22 })],
          })
      ),
    ];
  }

  private static async crearSeccionFirma(datos: DatosCotizacion): Promise<Paragraph[]> {
    const firmaData = await this.fetchImageAsUint8Array(firmaImg);

    return [
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({
        children: [
          new ImageRun({
            data: firmaData,
            transformation: {
              width: 150,
              height: 60,
            },
            type: "png",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.nombreEncargado || "Carlos Jaramillo",
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: datos.cargo || "Director general",
            size: 22,
            color: "666666",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "carlos.jaramillo@cjproducciones.com",
            size: 22,
            color: "666666",
          }),
        ],
      }),
    ];
  }

  static async generarDocumento(datos: DatosCotizacion): Promise<void> {
    const header = await this.crearHeader();
    const footer = await this.crearFooter();
    const seccionFirma = await this.crearSeccionFirma(datos);

    const doc = new Document({
      sections: [
        {
          headers: { default: header },
          footers: { default: footer },
          children: [
            ...this.crearSeccionIntroduccion(datos),
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [
                new TextRun({ text: "Los servicios que ofrecemos son los siguientes:", bold: true, size: 26 }),
              ],
              spacing: { after: 200 },
            }),
            ...this.crearSeccionesServicios(datos),
            ...this.crearSeccionTotales(datos),
            ...this.crearSeccionConsideraciones(datos),
            ...seccionFirma,
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = datos.cliente
      ? `cotizacion-${datos.cliente.replace(/\s+/g, "-").toLowerCase()}.docx`
      : "cotizacion.docx";

    saveAs(blob, fileName);
  }
}
