# E-Tickets: SaaS de Cotizaciones

---

## HU-01 - Autenticación y Gestión de Roles con Supabase

**Descripción:**  
El sistema debe permitir a los usuarios (empleados y administradores) iniciar sesión utilizando la autenticación de Supabase. El aplicativo debe identificar el rol del usuario para habilitar o restringir funciones sensibles, como la eliminación de registros.

### Detalles Técnicos

- Integración con Supabase Auth para el login.
- Manejo de roles (Admin/Empleado) definidos en la base de datos.
- La sesión debe persistir y controlar la visibilidad de componentes en la UI.

### Criterios de Aceptación

```gherkin
Escenario: Inicio de sesión exitoso
  Dado que el usuario está en la pantalla de login
  Cuando ingresa credenciales válidas y hace clic en "Ingresar"
  Entonces el sistema autentica contra Supabase y redirige al dashboard

Escenario: Control de permisos por rol
  Dado que el usuario ha iniciado sesión
  Cuando el sistema carga la configuración del usuario
  Entonces determina si es "Administrador" o "Empleado" para habilitar las funciones correspondientes
```

---

## HU-02 - Gestión de Plantillas (CRUD)

**Descripción:**  
Los usuarios deben poder crear plantillas a partir de configuraciones de productos/servicios para eventos frecuentes (ej. bodas). Estas plantillas deben guardarse en la base de datos de Supabase con un nombre personalizado. Tanto administradores como empleados pueden editar o eliminar plantillas existentes.

### Detalles Técnicos

- Tabla de plantillas en Supabase.
- Campos requeridos: Nombre de plantilla, descripción, ID del creador, JSON de productos/servicios.
- Permisos de escritura/borrado abiertos para ambos roles.

### Criterios de Aceptación

```gherkin
Escenario: Crear nueva plantilla
  Dado que el usuario tiene items cargados en el cotizador
  Cuando selecciona "Guardar como plantilla" y asigna un nombre
  Entonces la configuración se guarda en la base de datos con el autor asociado

Escenario: Editar o Eliminar plantilla
  Dado que un usuario (Admin o Empleado) selecciona una plantilla existente
  Cuando elige modificarla o eliminarla
  Entonces los cambios se reflejan o el registro se borra de Supabase
```

---

## HU-03 - Visualización de Plantillas (Cards)

**Descripción:**  
Las plantillas guardadas deben mostrarse en una sección dedicada utilizando un formato de "Tarjeta" (Card). Cada tarjeta debe mostrar información clave para facilitar su identificación.

### Detalles Técnicos

- Componente de UI tipo Card.
- Datos a mostrar: Nombre de la plantilla, Descripción, Nombre del creador.
- Query a la tabla de plantillas en Supabase.

### Criterios de Aceptación

```gherkin
Escenario: Listar plantillas
  Dado que el usuario entra a la sección de Plantillas
  Cuando la página termina de cargar
  Entonces se muestran todas las plantillas disponibles en formato de tarjetas con su título, descripción y autor
```

---

## HU-04 - Historial y Filtrado de Cotizaciones

**Descripción:**  
Interfaz para consultar todas las cotizaciones realizadas. Debe permitir filtrar por nombre de cliente o rango de fechas. Al seleccionar una cotización, esta debe cargarse en la pantalla principal para su edición. Las cotizaciones no tienen estados (todas se tratan igual).

### Detalles Técnicos

- Tabla de cotizaciones en Supabase.
- Filtros en el frontend o query dinámica a la DB (Cliente / Fecha).
- Funcionalidad de "Hydrate" o precarga del estado de la aplicación al hacer click en un item del historial.

### Criterios de Aceptación

```gherkin
Escenario: Filtrar historial
  Dado que el usuario visualiza la lista de cotizaciones
  Cuando aplica un filtro por cliente o fecha
  Entonces la lista muestra solo los registros coincidentes

Escenario: Cargar cotización
  Dado que el usuario hace clic en una cotización del historial
  Cuando el sistema procesa la solicitud
  Entonces redirige a la vista principal con todos los productos y datos de esa cotización cargados
```

---

## HU-05 - Exportación a Word (Docx)

**Descripción:**  
El usuario debe poder descargar la cotización final en formato Microsoft Word (.docx). El documento debe incluir automáticamente una imagen de la firma del dueño y un banner de la empresa en el pie de página.

### Detalles Técnicos

- Librería de generación de documentos (ej. docx o similar).
- Activos estáticos: Las imágenes (firma y banner) están alojadas en el código fuente, no en la BD.
- Layout del documento con Header/Footer configurado.

### Criterios de Aceptación

```gherkin
Escenario: Descargar Word
  Dado que la cotización está lista
  Cuando el usuario presiona "Descargar"
  Entonces se genera y descarga un archivo .docx que incluye el banner y la firma en el pie de página
```

---

## HU-06 - Eliminación de Cotizaciones (Solo Admin)

**Descripción:**  
Permitir la eliminación de cotizaciones de la base de datos para limpieza. Esta acción es exclusiva para usuarios con rol de Administrador.

### Detalles Técnicos

- Validación de Rol en el backend (RLS en Supabase) y frontend.
- Acción DELETE en la tabla de cotizaciones.
- UI: Botón de eliminar oculto para rol "Empleado".

### Criterios de Aceptación

```gherkin
Escenario: Admin elimina cotización
  Dado que el usuario es Administrador
  Cuando confirma la eliminación de una cotización
  Entonces el registro desaparece permanentemente de Supabase

Escenario: Empleado intenta eliminar
  Dado que el usuario es Empleado
  Cuando accede al historial
  Entonces no ve la opción de eliminar o el sistema bloquea la acción
```

### HU-07 - Gestion de Servicios (CRUD)

**Descripcion:**  
El sistema debe permitir crear, listar, editar y eliminar servicios base que luego se usaran para construir cotizaciones. Los servicios se almacenan en Supabase y quedan disponibles para todos los usuarios.

#### Detalles Tecnicos

- Tabla de servicios en Supabase.
- Campos requeridos: nombre, descripcion, precio base, estado (activo/inactivo), fecha de creacion.
- Operaciones CRUD expuestas desde el frontend con validaciones basicas.

#### Criterios de Aceptacion

```gherkin
Escenario: Crear servicio
  Dado que el usuario esta en la seccion de servicios
  Cuando completa el formulario y guarda
  Entonces el servicio se crea en Supabase y aparece en la lista

Escenario: Editar o eliminar servicio
  Dado que el usuario selecciona un servicio existente
  Cuando modifica sus datos o lo elimina
  Entonces los cambios se reflejan o el registro se borra en Supabase
```

---

### HU-08 - Gestion de Productos por Servicio (CRUD)

**Descripcion:**  
Los productos hacen parte de un servicio. El sistema debe permitir crear, listar, editar y eliminar productos asociados a un servicio especifico, persistiendo la relacion en Supabase.

#### Detalles Tecnicos

- Tabla de productos en Supabase con relacion a servicios (FK id_servicio).
- Campos requeridos: nombre, descripcion, unidad, precio, cantidad por defecto, id_servicio.
- CRUD de productos filtrado por servicio seleccionado.

#### Criterios de Aceptacion

```gherkin
Escenario: Crear producto para un servicio
  Dado que el usuario selecciona un servicio
  Cuando agrega un producto con sus datos
  Entonces el producto queda asociado al servicio en Supabase

Escenario: Editar o eliminar producto
  Dado que el usuario visualiza los productos de un servicio
  Cuando edita o elimina uno
  Entonces el cambio se refleja o se elimina en Supabase y la lista se actualiza
```

---

### HU-09 - Listado de Servicios y Productos para Cotizar

**Descripcion:**  
El sistema debe mostrar un listado de servicios con sus productos asociados para que el usuario pueda seleccionarlos al crear una cotizacion.

#### Detalles Tecnicos

- Consulta a Supabase que incluya servicios y sus productos relacionados.
- UI con lista jerarquica (servicio > productos) y controles de seleccion.
- Al seleccionar productos se agregan al estado de la cotizacion en curso.

#### Criterios de Aceptacion

```gherkin
Escenario: Cargar listado de servicios con productos
  Dado que el usuario ingresa a la creacion de una cotizacion
  Cuando la pagina termina de cargar
  Entonces se muestran los servicios con sus productos asociados

Escenario: Seleccionar productos para cotizar
  Dado que el usuario visualiza el listado
  Cuando selecciona productos de un servicio
  Entonces los productos quedan agregados a la cotizacion en curso
```

---

### HU-10 - Guardar Cotizacion con Seleccion Completa

**Descripcion:**  
El sistema debe permitir almacenar la cotizacion con todos los servicios y productos seleccionados, junto con la informacion del cliente, en Supabase.

#### Detalles Tecnicos

- Tabla de cotizaciones en Supabase con referencia al usuario creador.
- Detalle de items (servicio/producto) almacenado como relacion o JSON segun el modelo.
- Accion de guardado desde la UI con confirmacion y manejo de errores.

#### Criterios de Aceptacion

```gherkin
Escenario: Guardar cotizacion
  Dado que el usuario tiene servicios y productos seleccionados
  Cuando presiona guardar cotizacion
  Entonces se crea el registro en Supabase con todos los datos seleccionados

Escenario: Confirmacion de guardado
  Dado que la cotizacion se guarda correctamente
  Cuando el sistema responde
  Entonces se muestra un mensaje de confirmacion al usuario
```

---

### HU-11 - Reutilizacion de Cotizacion desde Historial

**Descripcion:**  
El sistema debe permitir seleccionar una cotizacion del historial para ver su detalle y crear una nueva cotizacion a partir de ella, reutilizando los datos seleccionados.

### Detalles Tecnicos

- Vista de detalle de cotizacion con todos los servicios y productos.
- Accion "Crear nueva desde esta" que clona la informacion en la cotizacion en curso.
- Reutiliza el flujo de hidratacion existente para cargar la nueva cotizacion.

### Criterios de Aceptacion

```gherkin
Escenario: Ver detalle de una cotizacion del historial
  Dado que el usuario esta en el historial
  Cuando selecciona una cotizacion
  Entonces se muestra el detalle completo de la cotizacion

Escenario: Crear nueva cotizacion desde historial
  Dado que el usuario visualiza el detalle de una cotizacion
  Cuando elige crear una nueva cotizacion desde esta
  Entonces se carga una nueva cotizacion con los datos de la seleccion
```

---

### HU-12 - Envío de cotizaciones a clientes por correo

**Descripción:**  
El usuario después de crear la cotización podrá tener la posibilidad de enviar la cotización a los clientes vía email en formato de PDF. Esto facilita la gestión y entrega de las cotizaciones sin salir de la plataforma.

#### Detalles Técnicos

- Integración con servicio de correo (ej. SendGrid, Resend) mediante Supabase Edge Functions o API.
- Generación del PDF (reutilizando lógica de HU-05) para adjuntar o enlazar en el correo.
- Formulario modal para ingresar/confirmar el correo del destinatario.

#### Criterios de Aceptación

```gherkin
Escenario: Enviar cotización por correo
  Dado que la cotización está generada
  Cuando el usuario selecciona "Enviar por correo" y confirma el destinatario
  Entonces el sistema envía el email con el PDF adjunto y notifica éxito

Escenario: Fallo en el envío
  Dado que ocurre un error en el servicio de correo
  Cuando el usuario intenta enviar
  Entonces el sistema muestra un mensaje de error y no marca la cotización como enviada
```

---

### HU-13 - Interfaz de métricas para administradores

**Descripción:**  
El usuario administrador tendrá habilitada una interfaz administrativa en la que podrá visualizar KPI’s relevantes como el total de cotizaciones, cantidad de cotizaciones por cliente, total de plantillas creadas, entre otros.

#### Detalles Técnicos

- Vista de Dashboard protegida por Rol (Solo Admin).
- Consultas de agregación en Supabase (COUNTS, GROUP BY).
- Visualización de datos mediante componentes de tarjetas y gráficos.

#### Criterios de Aceptación

```gherkin
Escenario: Visualizar métricas Clave
  Dado que el usuario es Administrador
  Cuando accede a la sección de Métricas
  Entonces visualiza contadores de total de cotizaciones, desglose por cliente y plantillas

Escenario: Acceso denegado a no administradores
  Dado que el usuario es Empleado
  Cuando intenta ver las métricas
  Entonces el sistema no muestra la opción o deniega el acceso
```

---

## Resumen de Tareas

| Ticket | Descripción                                   | Estado           |
| ------ | --------------------------------------------- | ---------------- |
| HU-01  | Autenticación y Gestión de Roles con Supabase | ⬜ Sin completar |
| HU-02  | Gestión de Plantillas (CRUD)                  | Completado       |
| HU-03  | Visualización de Plantillas (Cards)           | Completado       |
| HU-04  | Historial y Filtrado de Cotizaciones          | ⬜ Sin completar |
| HU-05  | Exportación a Word (Docx)                     | ⬜ Sin completar |
| HU-06  | Eliminación de Cotizaciones (Solo Admin)      | ⬜ Sin completar |
| HU-07  | Gestion de Servicios (CRUD)                   | ⬜ Sin completar |
| HU-08  | Gestion de Productos por Servicio (CRUD)      | ⬜ Sin completar |
| HU-09  | Listado de Servicios y Productos para Cotizar | ⬜ Sin completar |
| HU-10  | Guardar Cotizacion con Seleccion Completa     | ⬜ Sin completar |
| HU-11  | Reutilizacion de Cotizacion desde Historial   | ⬜ Sin completar |
| HU-12  | Envío de cotizaciones a clientes por correo   | ⬜ Sin completar |
| HU-13  | Interfaz de métricas para administradores     | ⬜ Sin completar |
