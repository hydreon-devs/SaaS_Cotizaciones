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

---

## Resumen de Tareas

| Ticket | Descripción                                      | Estado         |
|--------|--------------------------------------------------|----------------|
| HU-01  | Autenticación y Gestión de Roles con Supabase    | ⬜ Sin completar |
| HU-02  | Gestión de Plantillas (CRUD)                     | ⬜ Sin completar |
| HU-03  | Visualización de Plantillas (Cards)              | ⬜ Sin completar |
| HU-04  | Historial y Filtrado de Cotizaciones             | ⬜ Sin completar |
| HU-05  | Exportación a Word (Docx)                        | ⬜ Sin completar |
| HU-06  | Eliminación de Cotizaciones (Solo Admin)         | ⬜ Sin completar |