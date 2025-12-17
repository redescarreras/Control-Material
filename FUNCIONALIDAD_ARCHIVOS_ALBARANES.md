# 📄 Funcionalidad de Archivos en Albaranes

## ✨ Nueva Funcionalidad Añadida

Se ha implementado la capacidad de adjuntar y visualizar archivos PDF/Excel en los albaranes.

## 🎯 Características Principales

### 1. **Subida de Archivos en Albaranes**
- **Ubicación**: Campo "Archivo del Albarán" en el formulario de creación
- **Tipos soportados**: PDF, Excel (.xlsx, .xls), Word (.doc, .docx)
- **Posición**: Aparece después del campo "Observaciones"
- **Opcional**: No es requerido para crear albaranes

### 2. **Visualización en Albaranes**
- **Botón "Ver Albarán"**: Aparece en todas las tarjetas de albarán que tengan archivo adjunto
- **Disponible en**: Albaranes pendientes, recibidos y con material faltante
- **Consistente**: El archivo se mantiene disponible durante todo el ciclo de vida del albarán

### 3. **Modal de Visualización**
- **Diseño moderno**: Modal con header corporativo y footer de acciones
- **Vista previa**: Soporte para imágenes y PDFs
- **Información del archivo**: Nombre, tamaño, fecha de subida, tipo MIME
- **Funciones**: Descarga directa y cierre con tecla Escape

## 🛠️ Detalles Técnicos

### Almacenamiento
- **Método**: Base64 encoding en localStorage
- **Limitación**: Tamaño de archivo dependerá del espacio disponible en localStorage
- **Formato**: Datos URI (data:[tipo];base64,[datos])

### Compatibilidad
- **PDFs**: Vista previa completa con visor integrado
- **Imágenes**: Vista previa directa
- **Otros tipos**: Mensaje informativo + opción de descarga

### Interfaz
- **Botón distintivo**: Color azul (`btn-info`) para diferenciarlo
- **Responsive**: Se adapta a dispositivos móviles
- **Accesibilidad**: Títulos y atributos ARIA apropiados

## 📱 Uso

### Para Crear Albarán con Archivo:
1. Ir a "Nuevo Albarán"
2. Llenar los campos requeridos (ID Obra, Fecha, Cuenta Cargo, Tipo)
3. (Opcional) Añadir archivo en "Archivo del Albarán"
4. Hacer clic en "Crear Albarán"

### Para Ver Albarán:
1. En cualquier tarjeta de albarán con archivo, hacer clic en "📄 Ver Albarán"
2. Se abrirá el modal de visualización
3. Ver la vista previa o descargar el archivo
4. Cerrar con botón "Cerrar" o tecla Escape

## 🎨 Estilos Añadidos

- `.btn-info`: Botón azul para "Ver Albarán"
- `#modalVerArchivo`: Modal específico para visualización
- `.modal-header`, `.modal-footer`: Estilos corporativos
- Responsive design para dispositivos móviles

## 📊 Beneficios

1. **Centralización**: Todos los documentos relacionados en un solo lugar
2. **Acceso rápido**: Sin necesidad de buscar archivos en carpetas externas
3. **Trazabilidad**: Mantiene la documentación asociada al albarán
4. **Flujo completo**: Desde creación hasta recepción, el documento sigue disponible
5. **Flexibilidad**: Soporte para múltiples tipos de archivo comunes

## ⚠️ Consideraciones

- **Espacio de almacenamiento**: Los archivos ocupan espacio en localStorage
- **Tamaño de archivo**: Archivos muy grandes pueden afectar el rendimiento
- **Navegador**: Algunos archivos pueden requerir descarga para abrir correctamente
- **Privacidad**: Los archivos se almacenan localmente en el navegador del usuario

---

*Implementado el 17 de diciembre de 2025*
