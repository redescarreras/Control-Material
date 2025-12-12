---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3046022100c5ae7279d8dcfacd60ea88e149ca19ad9742b2f97df4ce619ffcc7bea4d7c353022100a8902f936c8e041923ccc015a576b42746c46b6dccf01847c845c95c22d5d2d0
    ReservedCode2: 30440220573d3c724b0833174b36d2073d66a789030706da1bb02ee4411cedab237bf704022029549e8b973c28912f657d4acf1fc13aee1c6a982457a5d0faf9b17bd1a864aa
---

# Aplicación de Control de Materiales - Redes Carreras S.L.

Una aplicación web completa para la gestión de albaranes y control de materiales, diseñada específicamente para empresas de telecomunicaciones.

## 🚀 Características Principales

### ✅ Gestión Completa de Albaranes
- **Creación automática** de albaranes con ID único
- **Campos completos**: ID de Obra, Fecha, Cuenta de Cargo, Tipo de Instalación (FTTH/FTTN/TESA)
- **Observaciones opcionales** para cada albarán

### 📊 Estados de Albaranes
- **Pendientes**: Albaranes nuevos que esperan confirmación
- **Recibidos**: Albaranes entregados correctamente
- **Material Faltante**: Albaranes con problemas de entrega

### 📈 Sistema de Reportes
- **Generación automática** de reportes en PDF
- **Tipos de reportes**:
  - Albaranes pendientes
  - Albaranes recibidos
  - Material faltante
  - Reporte completo general
- **Descarga directa** en formato PDF

### 🎨 Diseño Corporativo
- **Colores corporativos** de Redes Carreras S.L.
- **Logo integrado** en el header
- **Diseño responsive** para móvil, tablet y desktop
- **Interfaz intuitiva** y profesional

## 📱 Navegación

### Pestañas Principales
1. **📋 Pendientes**: Lista de albaranes que no han sido confirmados
2. **✅ Recibidos**: Albaranes entregados correctamente
3. **⚠️ Material Faltante**: Albaranes con problemas de entrega
4. **📊 Reportes**: Generación y descarga de reportes PDF

## 🔧 Funcionalidades

### Crear Nuevo Albarán
1. Clic en **"Nuevo Albarán"** (botón naranja en el header)
2. Completar los campos obligatorios:
   - ID de Obra
   - Fecha (se establece automáticamente la fecha actual)
   - Cuenta de Cargo
   - Tipo de Instalación (desplegable)
3. Agregar observaciones (opcional)
4. Clic en **"Crear Albarán"**

### Confirmar Recepción de Material
1. En la pestaña **"Pendientes"**, clic en **"Material Recibido"**
2. Seleccionar el estado:
   - **"Entregado Correctamente"**: Todo el material fue recibido
   - **"Faltó Material"**: Especificar qué material faltó
3. Clic en **"Confirmar"**

### Generar Reportes
1. Ir a la pestaña **"Reportes"**
2. Seleccionar el tipo de reporte deseado
3. Clic en **"Descargar PDF"**
4. El archivo se descargará automáticamente

## 💾 Almacenamiento

- **LocalStorage**: Los datos se guardan automáticamente en el navegador
- **Persistencia**: Los albaranes se mantienen entre sesiones
- **Backup recomendado**: Exportar reportes regularmente

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, tablet, móvil
- **Sistemas**: Windows, macOS, Linux, Android, iOS

## 🔒 Seguridad

- **Datos locales**: Toda la información se almacena localmente
- **Sin servidor**: No requiere conexión a internet para funcionar
- **Privacidad**: Los datos no salen del dispositivo

## 📋 Campos del Albarán

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| ID Albarán | Auto-generado | ✅ | Código único: ALB-YYYYMMDD-XXX |
| ID de Obra | Texto | ✅ | Identificador de la obra |
| Fecha | Fecha | ✅ | Fecha del albarán |
| Cuenta de Cargo | Texto | ✅ | Cuenta contable |
| Tipo Instalación | Desplegable | ✅ | FTTH, FTTN, TESA |
| Observaciones | Texto | ❌ | Comentarios adicionales |
| Estado | Auto-calculado | ✅ | Pendiente/Recibido/Faltante |
| Material Faltante | Texto | ❌ | Detalle si falta material |

## 🎯 Flujo de Trabajo Recomendado

1. **Crear albarán** al enviar material
2. **Confirmar recepción** cuando llegue el material
3. **Reportar faltantes** si es necesario
4. **Generar reportes** semanalmente para seguimiento
5. **Archivar** eliminando albaranes antiguos

## 🆘 Soporte

Para soporte técnico o sugerencias de mejora, contacta con el departamento de IT de Redes Carreras S.L.

---

**Redes Carreras S.L. - Telecomunicaciones**  
*Sistema de Control de Materiales v1.0*