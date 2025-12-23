// ===== VARIABLES GLOBALES =====
let albaranes = [];
let albaranSeleccionado = null;
let cables = [];
let subconductos = [];
let devoluciones = [];
let reporteActual = '';

// ===== FILTRO DE FECHAS PARA REPORTES =====
function toggleFiltroFechas() {
    const filtroValue = document.querySelector('input[name="filtroFecha"]:checked').value;
    const rangoFechas = document.getElementById('rangoFechas');
    if (rangoFechas) {
        rangoFechas.style.display = filtroValue === 'rango' ? 'block' : 'none';
    }
}

function obtenerDatosFiltrados(tipo) {
    const filtroValue = document.querySelector('input[name="filtroFecha"]:checked')?.value || 'todo';
    const fechaDesde = document.getElementById('fechaDesde')?.value;
    const fechaHasta = document.getElementById('fechaHasta')?.value;
    
    let datos = [];
    
    // Función auxiliar para filtrar por fecha
    const filtrarPorFecha = (items) => {
        if (filtroValue === 'todo' || !fechaDesde || !fechaHasta) {
            return items;
        }
        const desde = new Date(fechaDesde);
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59); // Fin del día
        
        return items.filter(item => {
            const fechaItem = new Date(item.fecha);
            return fechaItem >= desde && fechaItem <= hasta;
        });
    };
    
    switch(tipo) {
        case 'pendientes':
            datos = filtrarPorFecha(albaranes.filter(a => a.estado === 'pendiente'));
            break;
        case 'recibidos':
            datos = filtrarPorFecha(albaranes.filter(a => a.estado === 'recibido' || a.estado === 'faltante'));
            break;
        case 'faltantes':
            datos = filtrarPorFecha(albaranes.filter(a => a.estado === 'faltante'));
            break;
        case 'completo':
            datos = filtrarPorFecha(albaranes);
            break;
        case 'cables':
            datos = filtrarPorFecha(cables);
            break;
        case 'subconductos':
            datos = filtrarPorFecha(subconductos);
            break;
        case 'devoluciones':
            datos = filtrarPorFecha(devoluciones);
            break;
    }
    
    return datos;
}

function mostrarErrorFechas() {
    const filtroValue = document.querySelector('input[name="filtroFecha"]:checked')?.value;
    if (filtroValue === 'rango') {
        const fechaDesde = document.getElementById('fechaDesde')?.value;
        const fechaHasta = document.getElementById('fechaHasta')?.value;
        if (!fechaDesde || !fechaHasta) {
            mostrarToast('Por favor selecciona ambas fechas', 'error');
            return true;
        }
    }
    return false;
}

// ===== MODAL DE REPORTES =====
function abrirModalReportes(tipo) {
    reporteActual = tipo;
    document.getElementById('modalReportes').classList.add('active');
    
    // Resetear opciones del filtro
    const radioTodo = document.querySelector('input[name="filtroFechaReporte"][value="todo"]');
    if (radioTodo) {
        radioTodo.checked = true;
    }
    toggleFiltroFechasModal();
}

function cerrarModalReportes() {
    document.getElementById('modalReportes').classList.remove('active');
    reporteActual = '';
}

function toggleFiltroFechasModal() {
    const filtroValue = document.querySelector('input[name="filtroFechaReporte"]:checked')?.value || 'todo';
    const rangoFechas = document.getElementById('rangoFechasReporte');
    if (rangoFechas) {
        rangoFechas.style.display = filtroValue === 'rango' ? 'block' : 'none';
    }
}

function iniciarGeneracionReporte() {
    const filtroValue = document.querySelector('input[name="filtroFechaReporte"]:checked')?.value || 'todo';
    const tipoReporte = reporteActual; // Guardar el tipo antes de cerrar
    
    // Sincronizar con el sistema de filtros existente
    const mainFiltroTodo = document.querySelector('input[name="filtroFecha"][value="todo"]');
    const mainFiltroRango = document.querySelector('input[name="filtroFecha"][value="rango"]');
    const mainFechaDesde = document.getElementById('fechaDesde');
    const mainFechaHasta = document.getElementById('fechaHasta');
    const modalFechaDesde = document.getElementById('fechaDesdeReporte');
    const modalFechaHasta = document.getElementById('fechaHastaReporte');
    
    if (filtroValue === 'todo') {
        // Seleccionar "Todo" en el sistema principal
        if (mainFiltroTodo) mainFiltroTodo.checked = true;
        if (mainFiltroRango) mainFiltroRango.checked = false;
        toggleFiltroFechas(); // Actualizar visibilidad del rango en el sistema principal
    } else {
        // Sincronizar fechas y seleccionar "Rango"
        if (mainFiltroRango) mainFiltroRango.checked = true;
        if (mainFiltroTodo) mainFiltroTodo.checked = false;
        
        if (modalFechaDesde && modalFechaHasta && mainFechaDesde && mainFechaHasta) {
            mainFechaDesde.value = modalFechaDesde.value;
            mainFechaHasta.value = modalFechaHasta.value;
        }
        toggleFiltroFechas(); // Actualizar visibilidad del rango en el sistema principal
    }
    
    console.log('📊 Generando reporte:', {
        tipo: tipoReporte,
        filtro: filtroValue,
        fechaDesde: modalFechaDesde?.value,
        fechaHasta: modalFechaHasta?.value
    });
    
    cerrarModalReportes();
    
    // Generar el reporte usando la función guardada
    if (tipoReporte) {
        generarReporte(tipoReporte);
    } else {
        mostrarToast('Error: No se ha seleccionado tipo de reporte', 'error');
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando aplicación...');
    
    // Cargar todos los datos primero
    cargarAlbaranes();
    cargarMateriales();
    cargarDevoluciones();
    
    // Configurar event listeners
    configurarEventListeners();
    establecerFechaActual();
    

    
    // Mostrar datos y actualizar contadores con un pequeño delay para asegurar que todo esté cargado
    mostrarAlbaranes();
    actualizarStockDisplay('cable');
    actualizarStockDisplay('subconducto');
    
    // Actualizar contadores después de un pequeño delay para asegurar sincronización
    setTimeout(() => {
        actualizarContadores();
        console.log('🔄 Contadores actualizados al cargar página');
    }, 100);
});

// ===== GESTIÓN DE ALBARANES =====
function cargarAlbaranes() {
    const datos = localStorage.getItem('albaranes');
    if (datos) {
        albaranes = JSON.parse(datos);
    }
}

function guardarAlbaranes() {
    localStorage.setItem('albaranes', JSON.stringify(albaranes));
}

function generarIdAlbaran() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const contador = albaranes.length + 1;
    return `ALB-${año}${mes}${dia}-${String(contador).padStart(3, '0')}`;
}

// ===== GESTIÓN DE MATERIALES =====
function cargarMateriales() {
    const datosCables = localStorage.getItem('cables');
    if (datosCables) {
        cables = JSON.parse(datosCables);
    }
    
    const datosSubconductos = localStorage.getItem('subconductos');
    if (datosSubconductos) {
        subconductos = JSON.parse(datosSubconductos);
    }
}

function guardarMateriales() {
    localStorage.setItem('cables', JSON.stringify(cables));
    localStorage.setItem('subconductos', JSON.stringify(subconductos));
}

// ===== GESTIÓN DE DEVOLUCIONES =====
function cargarDevoluciones() {
    const datos = localStorage.getItem('devoluciones');
    if (datos) {
        devoluciones = JSON.parse(datos);
    }
}

function guardarDevoluciones() {
    localStorage.setItem('devoluciones', JSON.stringify(devoluciones));
}

function generarIdDevolucion() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const contador = devoluciones.length + 1;
    return `DEV-${año}${mes}${dia}-${String(contador).padStart(3, '0')}`;
}

function generarIdMaterial(tipo) {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const contador = tipo === 'cable' ? cables.length + 1 : subconductos.length + 1;
    return `${tipo === 'cable' ? 'CAB' : 'SUB'}-${año}${mes}${dia}-${String(contador).padStart(3, '0')}`;
}

// ===== EVENT LISTENERS =====
function configurarEventListeners() {
    // Navegación por pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            cambiarTab(tab);
        });
    });

    // Modal nuevo albarán
    document.getElementById('btnNuevoAlbaran').addEventListener('click', abrirModalNuevoAlbaran);
    document.getElementById('formNuevoAlbaran').addEventListener('submit', crearAlbaran);

    // Modal nuevo cable instalación
    document.getElementById('btnNuevoCableInstalacion').addEventListener('click', abrirModalCableInstalacion);
    document.getElementById('formNuevoCable').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarMaterial('cable', new FormData(e.target), 'instalacion');
        cerrarModalCable();
    });

    // Modal entrada cable
    document.getElementById('btnEntradaCable').addEventListener('click', abrirModalEntradaCable);
    document.getElementById('formEntradaCable').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarMaterial('cable', new FormData(e.target), 'entrada');
        cerrarModalEntradaCable();
    });

    // Modal nuevo subconducto instalación
    document.getElementById('btnNuevoSubconductoInstalacion').addEventListener('click', abrirModalSubconductoInstalacion);
    document.getElementById('formNuevoSubconducto').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarMaterial('subconducto', new FormData(e.target), 'instalacion');
        cerrarModalSubconducto();
    });

    // Modal entrada subconducto
    document.getElementById('btnEntradaSubconducto').addEventListener('click', abrirModalEntradaSubconducto);
    document.getElementById('formEntradaSubconducto').addEventListener('submit', function(e) {
        e.preventDefault();
        agregarMaterial('subconducto', new FormData(e.target), 'entrada');
        cerrarModalEntradaSubconducto();
    });

    // Modal nueva devolución
    document.getElementById('btnNuevaDevolucion').addEventListener('click', abrirModalNuevaDevolucion);
    document.getElementById('formNuevaDevolucion').addEventListener('submit', crearDevolucion);

    // Modal buscador
    document.getElementById('btnBuscar').addEventListener('click', abrirBuscador);

    // Modal recepción
    document.querySelectorAll('input[name="estadoRecepcion"]').forEach(radio => {
        radio.addEventListener('change', toggleDetalleFaltante);
    });
    
    // También configurar el event listener cuando se abre el modal
    document.getElementById('modalRecepcion').addEventListener('click', function(e) {
        if (e.target === this) {
            // Modal abierto, configurar listeners de radios
            setTimeout(() => {
                document.querySelectorAll('input[name="estadoRecepcion"]').forEach(radio => {
                    radio.removeEventListener('change', toggleDetalleFaltante);
                    radio.addEventListener('change', toggleDetalleFaltante);
                });
            }, 100);
        }
    });

    // Cerrar modales con clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
                cerrarModalRecepcion();
                cerrarModalCable();
                cerrarModalSubconducto();
                cerrarModalEntradaCable();
                cerrarModalEntradaSubconducto();
                cerrarModalDevolucion();
                cerrarModalBuscador();
                cerrarModalImportar();
                cerrarModalReportes();
            }
        });
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarModalRecepcion();
            cerrarModalCable();
            cerrarModalSubconducto();
            cerrarModalEntradaCable();
            cerrarModalEntradaSubconducto();
            cerrarModalDevolucion();
            cerrarModalBuscador();
            cerrarModalImportar();
            cerrarModalReportes();
        }
    });

}

// ===== NAVEGACIÓN POR PESTAÑAS =====
function cambiarTab(tab) {
    // Actualizar botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tab}`).classList.add('active');

    // Actualizar contadores siempre que se cambie de pestaña
    actualizarContadores();

    // Actualizar contenido mostrado
    if (tab === 'cables') {
        mostrarMateriales('cable');
        actualizarStockDisplay('cable');
    } else if (tab === 'subconductos') {
        mostrarMateriales('subconducto');
        actualizarStockDisplay('subconducto');
    } else if (tab === 'devoluciones') {
        mostrarDevoluciones();
    } else {
        mostrarAlbaranes();
    }
}

function actualizarContadores() {
    // Obtener datos actualizados desde localStorage
    cargarAlbaranes();
    cargarMateriales();
    cargarDevoluciones();
    
    const pendientes = albaranes.filter(a => a.estado === 'pendiente').length;
    const recibidos = albaranes.filter(a => a.estado === 'recibido').length;
    const faltantes = albaranes.filter(a => a.estado === 'faltante').length;
    const cableCount = cables.length;
    const subconductoCount = subconductos.length;
    const devolucionCount = devoluciones.length;

    // Actualizar elementos con verificación de existencia
    const elements = {
        'count-pendientes': pendientes,
        'count-recibidos': recibidos,
        'count-faltantes': faltantes,
        'count-cables': cableCount,
        'count-subconductos': subconductoCount,
        'count-devoluciones': devolucionCount
    };

    for (const [id, valor] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valor;
        } else {
            console.warn(`⚠️ Elemento con ID '${id}' no encontrado en el DOM`);
        }
    }
    
    // Debug info
    console.log('📊 Contadores actualizados:', {
        pendientes,
        recibidos,
        faltantes,
        cables: cableCount,
        subconductos: subconductoCount,
        devoluciones: devolucionCount,
        totalAlbaranes: albaranes.length,
        totalCables: cables.length,
        totalSubconductos: subconductos.length,
        totalDevoluciones: devoluciones.length
    });
}

// ===== GESTIÓN DE ALBARANES =====
function crearAlbaran(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const archivoInput = document.getElementById('archivoAlbaran');
    const archivo = archivoInput.files[0];
    
    // Procesar archivo si se subió
    let archivoInfo = null;
    if (archivo) {
        archivoInfo = {
            nombre: archivo.name,
            tipo: archivo.type,
            tamaño: archivo.size,
            fechaSubida: new Date().toISOString()
        };
        
        // Convertir archivo a base64 para almacenamiento
        const reader = new FileReader();
        reader.onload = function(e) {
            archivoInfo.base64 = e.target.result;
            completarCreacionAlbaran(formData, archivoInfo);
        };
        reader.readAsDataURL(archivo);
    } else {
        completarCreacionAlbaran(formData, archivoInfo);
    }
}

function completarCreacionAlbaran(formData, archivoInfo) {
    const albaran = {
        id: generarIdAlbaran(),
        idObra: formData.get('idObra'),
        fecha: formData.get('fecha'),
        cuentaCargo: formData.get('cuentaCargo'),
        tipoInstalacion: formData.get('tipoInstalacion'),
        jefeObra: formData.get('jefeObra') || '',
        observaciones: formData.get('observaciones') || '',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        fechaRecepcion: null,
        materialFaltante: null,
        archivo: archivoInfo
    };

    albaranes.push(albaran);
    guardarAlbaranes();
    cerrarModal();
    actualizarContadores();
    mostrarAlbaranes();
    mostrarToast('Albarán creado correctamente', 'success');
}

function eliminarAlbaran(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este albarán?')) {
        albaranes = albaranes.filter(a => a.id !== id);
        guardarAlbaranes();
        actualizarContadores();
        mostrarAlbaranes();
        mostrarToast('Albarán eliminado correctamente', 'success');
    }
}

// ===== MOSTRAR ALBARANES =====
function mostrarAlbaranes() {
    const tabActiva = document.querySelector('.tab-btn.active')?.dataset?.tab;
    const contenedor = tabActiva ? document.getElementById(`lista-${tabActiva}`) : null;
    
    // Si no existe el contenedor, salir
    if (!contenedor) {
        console.warn('No se encontró el contenedor para mostrar albaranes');
        return;
    }
    
    let albaranesMostrar = [];
    
    switch(tabActiva) {
        case 'pendientes':
            albaranesMostrar = albaranes.filter(a => a.estado === 'pendiente');
            break;
        case 'recibidos':
            albaranesMostrar = albaranes.filter(a => a.estado === 'recibido');
            break;
        case 'faltantes':
            albaranesMostrar = albaranes.filter(a => a.estado === 'recibido' && a.materialFaltante);
            break;
        default:
            albaranesMostrar = [];
    }

    if (albaranesMostrar.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--neutral-600);">
                <div style="font-size: 64px; margin-bottom: 20px;">📋</div>
                <h3 style="margin-bottom: 10px; color: var(--neutral-900);">
                    ${tabActiva === 'pendientes' ? 'No hay albaranes pendientes' :
                      tabActiva === 'recibidos' ? 'No hay albaranes recibidos' :
                      'No hay albaranes con material faltante'}
                </h3>
                <p>
                    ${tabActiva === 'pendientes' ? 'Los albaranes nuevos aparecerán aquí' :
                      tabActiva === 'recibidos' ? 'Los albaranes confirmados aparecerán aquí' :
                      'Los albaranes con problemas aparecerán aquí'}
                </p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = albaranesMostrar.map(albaran => crearTarjetaAlbaran(albaran)).join('');
}

function crearTarjetaAlbaran(albaran) {
    const fechaFormateada = new Date(albaran.fecha).toLocaleDateString('es-ES');
    const tieneMaterialFaltante = albaran.materialFaltante;
    const estadoClass = albaran.estado === 'pendiente' ? 'status-pendiente' : 
                       tieneMaterialFaltante ? 'status-faltante' : 'status-recibido';
    const estadoText = albaran.estado === 'pendiente' ? 'Pendiente' : 
                      tieneMaterialFaltante ? 'Recibido c/Faltante' : 'Recibido';

    let materialFaltanteHtml = '';
    if (tieneMaterialFaltante) {
        materialFaltanteHtml = `
            <div class="observaciones">
                <strong>Material Faltante:</strong> ${albaran.materialFaltante}
            </div>
        `;
    }

    let observacionesHtml = '';
    if (albaran.observaciones) {
        observacionesHtml = `
            <div class="observaciones">
                <strong>Observaciones:</strong> ${albaran.observaciones}
            </div>
        `;
    }

    let fechaRecepcionHtml = '';
    if (albaran.fechaRecepcion) {
        const fechaRecepcion = new Date(albaran.fechaRecepcion).toLocaleDateString('es-ES');
        fechaRecepcionHtml = `
            <div class="info-row">
                <span class="info-label">Recibido:</span>
                <span class="info-value">${fechaRecepcion}</span>
            </div>
        `;
    }

    let archivoHtml = '';
    if (albaran.archivo) {
        archivoHtml = `
            <button class="btn btn-info" onclick="verArchivoAlbaran('${albaran.id}')" title="Ver archivo del albarán">
                📄 Ver Albarán
            </button>
        `;
    }

    let accionesHtml = '';
    if (albaran.estado === 'pendiente') {
        accionesHtml = `
            <div class="albaran-actions">
                ${archivoHtml}
                <button class="btn btn-success" onclick="abrirModalRecepcion('${albaran.id}')">
                    ✅ Material Recibido
                </button>
                <button class="btn btn-secondary" onclick="eliminarAlbaran('${albaran.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    } else if (tieneMaterialFaltante) {
        accionesHtml = `
            <div class="albaran-actions">
                ${archivoHtml}
                <button class="btn btn-success" onclick="marcarFaltanteRecibido('${albaran.id}')">
                    ✅ Material Faltante Recibido
                </button>
                <button class="btn btn-secondary" onclick="eliminarAlbaran('${albaran.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    } else {
        accionesHtml = `
            <div class="albaran-actions">
                ${archivoHtml}
                <button class="btn btn-secondary" onclick="eliminarAlbaran('${albaran.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    }

    return `
        <div class="albaran-card">
            <div class="albaran-header">
                <div class="albaran-id">${albaran.id}</div>
                <div class="status-badge ${estadoClass}">${estadoText}</div>
            </div>
            <div class="albaran-info">
                <div class="info-row">
                    <span class="info-label">ID Obra:</span>
                    <span class="info-value">${albaran.idObra}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${fechaFormateada}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Cuenta Cargo:</span>
                    <span class="info-value">${albaran.cuentaCargo}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tipo Instalación:</span>
                    <span class="info-value">${albaran.tipoInstalacion}</span>
                </div>
                ${albaran.jefeObra ? `
                <div class="info-row">
                    <span class="info-label">Jefe de Obra:</span>
                    <span class="info-value">${albaran.jefeObra}</span>
                </div>
                ` : ''}
                ${fechaRecepcionHtml}
                ${materialFaltanteHtml}
                ${observacionesHtml}
            </div>
            ${accionesHtml}
        </div>
    `;
}

function verArchivoAlbaran(albaranId) {
    const albaran = albaranes.find(a => a.id === albaranId);
    if (!albaran || !albaran.archivo) {
        mostrarToast('No se encontró el archivo del albarán', 'error');
        return;
    }

    const archivo = albaran.archivo;
    
    // Crear modal para mostrar el archivo
    const modalHtml = `
        <div id="modalVerArchivo" class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 90%; max-height: 90%; width: auto; height: auto;">
                <div class="modal-header">
                    <h3>📄 ${archivo.nombre}</h3>
                    <button type="button" class="modal-close" onclick="cerrarModalVerArchivo()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px; max-height: 70vh; overflow: auto;">
                    <div style="margin-bottom: 15px; padding: 10px; background-color: var(--neutral-100); border-radius: 4px;">
                        <strong>Información del archivo:</strong><br>
                        📎 Nombre: ${archivo.nombre}<br>
                        📊 Tamaño: ${formatearTamanoArchivo(archivo.tamaño)}<br>
                        📅 Subido: ${new Date(archivo.fechaSubida).toLocaleDateString('es-ES')}<br>
                        🔗 Tipo: ${archivo.tipo || 'Desconocido'}
                    </div>
                    <div id="contenidoArchivo" style="text-align: center; padding: 20px;">
                        ${generarVisualizacionArchivo(archivo)}
                    </div>
                </div>
                <div class="modal-footer" style="padding: 15px 20px; border-top: 1px solid var(--neutral-300);">
                    <button class="btn btn-secondary" onclick="descargarArchivoAlbaran('${albaranId}')">
                        💾 Descargar
                    </button>
                    <button class="btn btn-primary" onclick="cerrarModalVerArchivo()">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Añadir modal al body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function generarVisualizacionArchivo(archivo) {
    if (!archivo.base64) {
        return '<p style="color: var(--neutral-600);">No se pudo cargar el archivo para vista previa.</p>';
    }
    
    const tipo = archivo.tipo.toLowerCase();
    
    if (tipo.includes('image')) {
        return `<img src="${archivo.base64}" alt="${archivo.nombre}" style="max-width: 100%; max-height: 60vh; border: 1px solid var(--neutral-300); border-radius: 4px;">`;
    } else if (tipo.includes('pdf')) {
        return `<embed src="${archivo.base64}" type="application/pdf" width="100%" height="60vh" style="border: 1px solid var(--neutral-300); border-radius: 4px;">`;
    } else {
        return `
            <div style="padding: 40px; background-color: var(--neutral-100); border-radius: 8px; border: 2px dashed var(--neutral-400);">
                <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
                <p style="color: var(--neutral-600); margin-bottom: 10px;">
                    Vista previa no disponible para este tipo de archivo
                </p>
                <p style="color: var(--neutral-500); font-size: 0.875rem;">
                    Tipo: ${archivo.tipo}<br>
                    Usa el botón "Descargar" para abrir el archivo
                </p>
            </div>
        `;
    }
}

function formatearTamanoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function descargarArchivoAlbaran(albaranId) {
    const albaran = albaranes.find(a => a.id === albaranId);
    if (!albaran || !albaran.archivo || !albaran.archivo.base64) {
        mostrarToast('No se pudo descargar el archivo', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = albaran.archivo.base64;
    link.download = albaran.archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast('Descarga iniciada', 'success');
}

function cerrarModalVerArchivo() {
    const modal = document.getElementById('modalVerArchivo');
    if (modal) {
        modal.remove();
    }
}

// Añadir evento para cerrar con Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalVerArchivo();
    }
});

// ===== MODALES =====
function abrirModalNuevoAlbaran() {
    document.getElementById('modalNuevoAlbaran').classList.add('active');
    document.getElementById('idObra').focus();
}

function cerrarModal() {
    document.getElementById('modalNuevoAlbaran').classList.remove('active');
    document.getElementById('formNuevoAlbaran').reset();
    
    // Limpiar específicamente el campo de archivo
    const archivoInput = document.getElementById('archivoAlbaran');
    if (archivoInput) {
        archivoInput.value = '';
    }
}

function abrirModalRecepcion(albaranId) {
    albaranSeleccionado = albaranes.find(a => a.id === albaranId);
    if (!albaranSeleccionado) return;

    const infoHtml = `
        <h4 style="margin-bottom: 16px; color: var(--neutral-900);">Albarán: ${albaranSeleccionado.id}</h4>
        <div class="info-row">
            <span class="info-label">ID Obra:</span>
            <span class="info-value">${albaranSeleccionado.idObra}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fecha:</span>
            <span class="info-value">${new Date(albaranSeleccionado.fecha).toLocaleDateString('es-ES')}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Cuenta Cargo:</span>
            <span class="info-value">${albaranSeleccionado.cuentaCargo}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tipo Instalación:</span>
            <span class="info-value">${albaranSeleccionado.tipoInstalacion}</span>
        </div>
        ${albaranSeleccionado.jefeObra ? `
            <div class="info-row">
                <span class="info-label">Jefe de Obra:</span>
                <span class="info-value">${albaranSeleccionado.jefeObra}</span>
            </div>
        ` : ''}
        ${albaranSeleccionado.observaciones ? `
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--neutral-300);">
                <strong>Observaciones:</strong> ${albaranSeleccionado.observaciones}
            </div>
        ` : ''}
    `;

    document.getElementById('infoAlbaranRecepcion').innerHTML = infoHtml;
    document.getElementById('modalRecepcion').classList.add('active');
}

function cerrarModalRecepcion() {
    document.getElementById('modalRecepcion').classList.remove('active');
    document.getElementById('materialFaltante').value = '';
    albaranSeleccionado = null;
}

function toggleDetalleFaltante() {
    const radioIncompleto = document.querySelector('input[name="estadoRecepcion"][value="incompleto"]');
    const detalleDiv = document.getElementById('detalleFaltante');
    
    if (radioIncompleto.checked) {
        detalleDiv.style.display = 'block';
        document.getElementById('materialFaltante').focus();
    } else {
        detalleDiv.style.display = 'none';
        document.getElementById('materialFaltante').value = '';
    }
}

function confirmarRecepcion() {
    if (!albaranSeleccionado) return;

    const estadoRecepcion = document.querySelector('input[name="estadoRecepcion"]:checked').value;
    const materialFaltante = document.getElementById('materialFaltante').value;

    if (estadoRecepcion === 'incompleto' && !materialFaltante.trim()) {
        mostrarToast('Por favor, especifica qué material faltó', 'error');
        return;
    }

    // Actualizar albarán
    albaranSeleccionado.estado = 'recibido'; // Siempre recibido, independientemente del material faltante
    albaranSeleccionado.fechaRecepcion = new Date().toISOString();
    if (materialFaltante.trim()) {
        albaranSeleccionado.materialFaltante = materialFaltante.trim();
    } else {
        albaranSeleccionado.materialFaltante = null;
    }

    guardarAlbaranes();
    actualizarContadores();
    mostrarAlbaranes();
    cerrarModalRecepcion();

    const mensaje = estadoRecepcion === 'completo' ? 
        'Material recibido correctamente' : 
        'Recepción marcada como incompleta';
    mostrarToast(mensaje, estadoRecepcion === 'completo' ? 'success' : 'warning');
}

function marcarFaltanteRecibido(id) {
    const albaran = albaranes.find(a => a.id === id);
    if (!albaran) return;
    
    if (confirm('¿Confirmas que el material faltante ya fue recibido?')) {
        albaran.materialFaltante = null;
        guardarAlbaranes();
        actualizarContadores();
        mostrarAlbaranes();
        mostrarToast('Material faltante marcado como recibido', 'success');
    }
}

// ===== UTILIDADES =====
function establecerFechaActual() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
    
    // Establecer fechas por defecto en formularios de materiales
    document.getElementById('fechaCable').value = hoy;
    document.getElementById('fechaSubconducto').value = hoy;
    document.getElementById('fechaDevolucion').value = hoy;
}

function mostrarToast(mensaje, tipo = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${mensaje}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; font-size: 18px; color: var(--neutral-600);">&times;</button>
        </div>
    `;
    
    toastContainer.appendChild(toast);

    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// ===== GESTIÓN DE DEVOLUCIONES MÚLTIPLES =====
function inicializarBobinas() {
    const container = document.getElementById('bobinasContainer');
    container.innerHTML = '';
    agregarBobina(); // Añadir la primera bobina por defecto
}

function agregarBobina() {
    const container = document.getElementById('bobinasContainer');
    const bobinaIndex = container.children.length + 1;
    
    const bobinaHTML = `
        <div class="bobina-item" data-bobina="${bobinaIndex}">
            <div class="bobina-header">
                <div class="bobina-title">Bobina ${bobinaIndex}</div>
                ${bobinaIndex > 1 ? `<button type="button" class="btn-eliminar-bobina" onclick="eliminarBobina(${bobinaIndex})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Eliminar
                </button>` : ''}
            </div>
            <div class="campos-bobina">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="entregaVacia_${bobinaIndex}" name="entregaVacia_${bobinaIndex}">
                        <span class="checkbox-custom"></span>
                        Entrega Vacía
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label for="tipoMaterial_${bobinaIndex}">Tipo de Material a Devolver *</label>
                <select id="tipoMaterial_${bobinaIndex}" name="tipoMaterial_${bobinaIndex}" required onchange="toggleCamposMaterial(${bobinaIndex})">
                    <option value="">Seleccionar tipo de material...</option>
                    <option value="bobina_con_cable">Bobinas con cable</option>
                    <option value="bobina_vacia">Bobina vacía</option>
                    <option value="otro">Otro tipo de material</option>
                </select>
            </div>
            <div id="camposBobinaCable_${bobinaIndex}" class="campos-bobina" style="display: none;">
                <div class="form-group">
                    <label for="tipoCableDevolucion_${bobinaIndex}">Tipo de Cable *</label>
                    <select id="tipoCableDevolucion_${bobinaIndex}" name="tipoCableDevolucion_${bobinaIndex}" required>
                        <option value="">Seleccionar tipo de cable...</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 8 fo.">Cable de f.o. de exterior PKP holgado de 8 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 16 fo.">Cable de f.o. de exterior PKP holgado de 16 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 24 fo.">Cable de f.o. de exterior PKP holgado de 24 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 32 fo.">Cable de f.o. de exterior PKP holgado de 32 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 48 fo.">Cable de f.o. de exterior PKP holgado de 48 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 64 fo.">Cable de f.o. de exterior PKP holgado de 64 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 128 fo.">Cable de f.o. de exterior PKP holgado de 128 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 256 fo.">Cable de f.o. de exterior PKP holgado de 256 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 512 fo.">Cable de f.o. de exterior PKP holgado de 512 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 768 fo.">Cable de f.o. de exterior KP holgado de 768 fo.</option>
                        <option value="Cable de f.o. de exterior KP compacto de 864 fo.">Cable de f.o. de exterior KP compacto de 864 fo.</option>
                        <option value="Cable de f.o. de exterior KP compacto de 912 fo.">Cable de f.o. de exterior KP compacto de 912 fo.</option>
                        <option value="Cable de f.o. de interior KT de 8 fo.">Cable de f.o. de interior KT de 8 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 16 fo.">Cable de f.o. de interior TKT de 16 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 24 fo.">Cable de f.o. de interior TKT de 24 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 32 fo.">Cable de f.o. de interior TKT de 32 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 48 fo.">Cable de f.o. de interior TKT de 48 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 64 fo.">Cable de f.o. de interior TKT de 64 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 128 fo.">Cable de f.o. de interior TKT de 128 fo.</option>
                        <option value="Cable de f.o. de interior TKT de 256 fo.">Cable de f.o. de interior TKT de 256 fo.</option>
                        <option value="Cable de f.o. de interior KT de 512 fo.">Cable de f.o. de interior KT de 512 fo.</option>
                        <option value="Cable de f.o. 16 VT.">Cable de f.o. 16 VT.</option>
                        <option value="Cable de f.o. 32 VT.">Cable de f.o. 32 VT.</option>
                        <option value="Cable de f.o. 64 VT.">Cable de f.o. 64 VT.</option>
                        <option value="Cable KT 8 fo G.652.D monotubo BLANCO">Cable KT 8 fo G.652.D monotubo BLANCO</option>
                        <option value="Cable KP 16 fo G.652.D (4x4f+2e) BLANCO">Cable KP 16 fo G.652.D (4x4f+2e) BLANCO</option>
                        <option value="Cable FVT micromódulos 16 fo G.657 A2 (4x4f) BLANCO">Cable FVT micromódulos 16 fo G.657 A2 (4x4f) BLANCO</option>
                        <option value="Cable KP 32 fo G.652.D (8x4f) BLANCO">Cable KP 32 fo G.652.D (8x4f) BLANCO</option>
                        <option value="Cable FVT micromódulos 32 fo G.657 A2 (8x4f) BLANCO">Cable FVT micromódulos 32 fo G.657 A2 (8x4f) BLANCO</option>
                        <option value="Cable KP 64 fo G.652.D (8x8f) BLANCO">Cable KP 64 fo G.652.D (8x8f) BLANCO</option>
                        <option value="Cable FVT micromódulos 64 fo G.657 A2 (8x8f) BLANCO">Cable FVT micromódulos 64 fo G.657 A2 (8x8f) BLANCO</option>
                        <option value="Cable de f.o. de interior riser de 16 fo.">Cable de f.o. de interior riser de 16 fo.</option>
                        <option value="Cable de f.o. de interior riser de 24 fo.">Cable de f.o. de interior riser de 24 fo.</option>
                        <option value="Cable de f.o. de interior riser de 32 fo.">Cable de f.o. de interior riser de 32 fo.</option>
                        <option value="Cable de f.o. de interior riser de 48 fo.">Cable de f.o. de interior riser de 48 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 16 fo.">Cable de f.o. de exterior KP holgado de 16 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 32 fo.">Cable de f.o. de exterior KP holgado de 32 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 64 fo.">Cable de f.o. de exterior KP holgado de 64 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 128 fo.">Cable de f.o. de exterior KP holgado de 128 fo.</option>
                        <option value="Cable de f.o. de exterior riser de 16 fo.">Cable de f.o. de exterior riser de 16 fo.</option>
                        <option value="Cable de f.o. de exterior riser de 32 fo.">Cable de f.o. de exterior riser de 32 fo.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="numeroMatriculaCable_${bobinaIndex}">Número de Matrícula *</label>
                    <input type="text" id="numeroMatriculaCable_${bobinaIndex}" name="numeroMatriculaCable_${bobinaIndex}" placeholder="Ej: MAT-001-2024">
                </div>
                <div class="form-group">
                    <label for="metrosCable_${bobinaIndex}">Metros de Cable *</label>
                    <input type="number" id="metrosCable_${bobinaIndex}" name="metrosCable_${bobinaIndex}" min="0" step="0.1" placeholder="Ej: 1800.5">
                </div>
            </div>
            <div id="camposBobinaVacia_${bobinaIndex}" class="campos-bobina" style="display: none;">
                <div class="form-group">
                    <label for="tipoCableDevolucionVacia_${bobinaIndex}">Tipo de Cable *</label>
                    <select id="tipoCableDevolucionVacia_${bobinaIndex}" name="tipoCableDevolucionVacia_${bobinaIndex}">
                        <option value="">Seleccionar tipo de cable...</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 8 fo.">Cable de f.o. de exterior PKP holgado de 8 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 16 fo.">Cable de f.o. de exterior PKP holgado de 16 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 24 fo.">Cable de f.o. de exterior PKP holgado de 24 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 32 fo.">Cable de f.o. de exterior PKP holgado de 32 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 48 fo.">Cable de f.o. de exterior PKP holgado de 48 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 64 fo.">Cable de f.o. de exterior PKP holgado de 64 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 128 fo.">Cable de f.o. de exterior PKP holgado de 128 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 256 fo.">Cable de f.o. de exterior PKP holgado de 256 fo.</option>
                        <option value="Cable de f.o. de exterior PKP holgado de 512 fo.">Cable de f.o. de exterior PKP holgado de 512 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 768 fo.">Cable de f.o. de exterior KP holgado de 768 fo.</option>
                        <option value="Cable de f.o. de exterior KP compacto de 864 fo.">Cable de f.o. de exterior KP compacto de 864 fo.</option>
                        <option value="Cable de f.o. de exterior KP compacto de 912 fo.">Cable de f.o. de exterior KP compacto de 912 fo.</option>
                        <option value="Cable de f.o. de interior KT de 8 fo.">Cable de f.o. de interior KT de 8 fo.</option>
                        <option value="Cable de f.o. de interior KT de 16 fo.">Cable de f.o. de interior KT de 16 fo.</option>
                        <option value="Cable de f.o. de interior KT de 24 fo.">Cable de f.o. de interior KT de 24 fo.</option>
                        <option value="Cable de f.o. de interior KT de 32 fo.">Cable de f.o. de interior KT de 32 fo.</option>
                        <option value="Cable de f.o. de interior KT de 48 fo.">Cable de f.o. de interior KT de 48 fo.</option>
                        <option value="Cable de f.o. de interior KT de 64 fo.">Cable de f.o. de interior KT de 64 fo.</option>
                        <option value="Cable de f.o. de interior KT de 128 fo.">Cable de f.o. de interior KT de 128 fo.</option>
                        <option value="Cable de f.o. de interior KT de 256 fo.">Cable de f.o. de interior KT de 256 fo.</option>
                        <option value="Cable de f.o. de interior KT de 512 fo.">Cable de f.o. de interior KT de 512 fo.</option>
                        <option value="Cable de f.o. 8 VT.">Cable de f.o. 8 VT.</option>
                        <option value="Cable de f.o. 16 VT.">Cable de f.o. 16 VT.</option>
                        <option value="Cable de f.o. 32 VT.">Cable de f.o. 32 VT.</option>
                        <option value="Cable de f.o. 64 VT.">Cable de f.o. 64 VT.</option>
                        <option value="Cable KT 8 fo G.652.D monotubo BLANCO">Cable KT 8 fo G.652.D monotubo BLANCO</option>
                        <option value="Cable KP 16 fo G.652.D (4x4f+2e) BLANCO">Cable KP 16 fo G.652.D (4x4f+2e) BLANCO</option>
                        <option value="Cable FVT micromódulos 16 fo G.657 A2 (4x4f) BLANCO">Cable FVT micromódulos 16 fo G.657 A2 (4x4f) BLANCO</option>
                        <option value="Cable KP 32 fo G.652.D (8x4f) BLANCO">Cable KP 32 fo G.652.D (8x4f) BLANCO</option>
                        <option value="Cable FVT micromódulos 32 fo G.657 A2 (8x4f) BLANCO">Cable FVT micromódulos 32 fo G.657 A2 (8x4f) BLANCO</option>
                        <option value="Cable KP 64 fo G.652.D (8x8f) BLANCO">Cable KP 64 fo G.652.D (8x8f) BLANCO</option>
                        <option value="Cable FVT micromódulos 64 fo G.657 A2 (8x8f) BLANCO">Cable FVT micromódulos 64 fo G.657 A2 (8x8f) BLANCO</option>
                        <option value="Cable de f.o. de interior riser de 16 fo.">Cable de f.o. de interior riser de 16 fo.</option>
                        <option value="Cable de f.o. de interior riser de 24 fo.">Cable de f.o. de interior riser de 24 fo.</option>
                        <option value="Cable de f.o. de interior riser de 32 fo.">Cable de f.o. de interior riser de 32 fo.</option>
                        <option value="Cable de f.o. de interior riser de 48 fo.">Cable de f.o. de interior riser de 48 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 16 fo.">Cable de f.o. de exterior KP holgado de 16 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 32 fo.">Cable de f.o. de exterior KP holgado de 32 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 64 fo.">Cable de f.o. de exterior KP holgado de 64 fo.</option>
                        <option value="Cable de f.o. de exterior KP holgado de 128 fo.">Cable de f.o. de exterior KP holgado de 128 fo.</option>
                        <option value="Cable de f.o. de exterior riser de 16 fo.">Cable de f.o. de exterior riser de 16 fo.</option>
                        <option value="Cable de f.o. de exterior riser de 32 fo.">Cable de f.o. de exterior riser de 32 fo.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="numeroMatriculaVacia_${bobinaIndex}">Número de Matrícula *</label>
                    <input type="text" id="numeroMatriculaVacia_${bobinaIndex}" name="numeroMatriculaVacia_${bobinaIndex}" placeholder="Ej: MAT-002-2024">
                </div>
            </div>
            <div id="camposOtroMaterial_${bobinaIndex}" class="form-group" style="display: none;">
                <label for="descripcionOtroMaterial_${bobinaIndex}">Descripción del Material *</label>
                <input type="text" id="descripcionOtroMaterial_${bobinaIndex}" name="descripcionOtroMaterial_${bobinaIndex}" placeholder="Ej: Cables de conexión, conectores, etc.">
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', bobinaHTML);
    
    // Agregar event listener para el checkbox de entrega vacía
    const checkboxEntregaVacia = document.getElementById(`entregaVacia_${bobinaIndex}`);
    const tipoMaterialSelect = document.getElementById(`tipoMaterial_${bobinaIndex}`);
    
    checkboxEntregaVacia.addEventListener('change', function() {
        if (this.checked) {
            // Si se marca "entrega vacía", configurar automáticamente
            tipoMaterialSelect.value = 'bobina_vacia';
            checkboxEntregaVacia.checked = true; // Asegurar que el checkbox esté marcado
            toggleCamposMaterial(bobinaIndex);
        } else {
            // Si se desmarca, limpiar el tipo de material
            tipoMaterialSelect.value = '';
            checkboxEntregaVacia.checked = false; // Asegurar que el checkbox esté desmarcado
            toggleCamposMaterial(bobinaIndex);
        }
    });
    
    // También agregar event listener para el select de tipo de material
    tipoMaterialSelect.addEventListener('change', function() {
        toggleCamposMaterial(bobinaIndex);
    });
}

function eliminarBobina(bobinaIndex) {
    const container = document.getElementById('bobinasContainer');
    const bobinaItem = container.querySelector(`[data-bobina="${bobinaIndex}"]`);
    if (bobinaItem) {
        bobinaItem.remove();
        // Renumerar las bobinas restantes
        renumerarBobinas();
    }
}

function renumerarBobinas() {
    const container = document.getElementById('bobinasContainer');
    const bobinas = container.querySelectorAll('.bobina-item');
    
    bobinas.forEach((bobina, index) => {
        const nuevoNumero = index + 1;
        bobina.setAttribute('data-bobina', nuevoNumero);
        
        // Actualizar título
        const titulo = bobina.querySelector('.bobina-title');
        titulo.textContent = `Bobina ${nuevoNumero}`;
        
        // Actualizar botón eliminar
        const botonEliminar = bobina.querySelector('.btn-eliminar-bobina');
        if (botonEliminar) {
            botonEliminar.setAttribute('onclick', `eliminarBobina(${nuevoNumero})`);
        } else if (nuevoNumero > 1) {
            // Añadir botón eliminar si no existe
            const header = bobina.querySelector('.bobina-header');
            const botonHTML = `
                <button type="button" class="btn-eliminar-bobina" onclick="eliminarBobina(${nuevoNumero})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Eliminar
                </button>
            `;
            header.insertAdjacentHTML('beforeend', botonHTML);
        }
        
        // Actualizar IDs y names de todos los elementos
        const elementos = bobina.querySelectorAll('[id], [name]');
        elementos.forEach(elemento => {
            const id = elemento.id;
            const name = elemento.name;
            
            if (id && id.includes('_')) {
                const partes = id.split('_');
                partes[partes.length - 1] = nuevoNumero;
                elemento.id = partes.join('_');
            }
            
            if (name && name.includes('_')) {
                const partes = name.split('_');
                partes[partes.length - 1] = nuevoNumero;
                elemento.name = partes.join('_');
            }
        });
    });
}

function toggleCamposMaterial(bobinaIndex) {
    const tipoMaterial = document.getElementById(`tipoMaterial_${bobinaIndex}`).value;
    
    // Ocultar todos los campos y remover required de todos
    document.getElementById(`camposBobinaCable_${bobinaIndex}`).style.display = 'none';
    document.getElementById(`camposBobinaVacia_${bobinaIndex}`).style.display = 'none';
    document.getElementById(`camposOtroMaterial_${bobinaIndex}`).style.display = 'none';
    
    // Remover required de TODOS los campos
    document.getElementById(`tipoCableDevolucion_${bobinaIndex}`).required = false;
    document.getElementById(`numeroMatriculaCable_${bobinaIndex}`).required = false;
    document.getElementById(`metrosCable_${bobinaIndex}`).required = false;
    document.getElementById(`tipoCableDevolucionVacia_${bobinaIndex}`).required = false;
    document.getElementById(`numeroMatriculaVacia_${bobinaIndex}`).required = false;
    document.getElementById(`descripcionOtroMaterial_${bobinaIndex}`).required = false;
    
    // Limpiar valores
    document.getElementById(`tipoCableDevolucion_${bobinaIndex}`).value = '';
    document.getElementById(`numeroMatriculaCable_${bobinaIndex}`).value = '';
    document.getElementById(`metrosCable_${bobinaIndex}`).value = '';
    document.getElementById(`tipoCableDevolucionVacia_${bobinaIndex}`).value = '';
    document.getElementById(`numeroMatriculaVacia_${bobinaIndex}`).value = '';
    document.getElementById(`descripcionOtroMaterial_${bobinaIndex}`).value = '';
    
    // Mostrar campos según la selección y agregar required solo a los visibles
    switch(tipoMaterial) {
        case 'bobina_con_cable':
            document.getElementById(`camposBobinaCable_${bobinaIndex}`).style.display = 'grid';
            document.getElementById(`tipoCableDevolucion_${bobinaIndex}`).required = true;
            document.getElementById(`numeroMatriculaCable_${bobinaIndex}`).required = true;
            document.getElementById(`metrosCable_${bobinaIndex}`).required = true;
            break;
        case 'bobina_vacia':
            document.getElementById(`camposBobinaVacia_${bobinaIndex}`).style.display = 'grid';
            document.getElementById(`tipoCableDevolucionVacia_${bobinaIndex}`).required = true;
            document.getElementById(`numeroMatriculaVacia_${bobinaIndex}`).required = true;
            break;
        case 'otro':
            document.getElementById(`camposOtroMaterial_${bobinaIndex}`).style.display = 'block';
            document.getElementById(`descripcionOtroMaterial_${bobinaIndex}`).required = true;
            break;
    }
}

function crearDevolucion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const container = document.getElementById('bobinasContainer');
    const bobinas = container.querySelectorAll('.bobina-item');
    
    if (bobinas.length === 0) {
        mostrarToast('Debe añadir al menos una bobina', 'error');
        return;
    }
    
    // Recopilar datos de todas las bobinas
    const bobinasData = [];
    
    bobinas.forEach((bobina, index) => {
        const bobinaIndex = index + 1;
        const entregaVacia = formData.get(`entregaVacia_${bobinaIndex}`) === 'on';
        const tipoMaterial = formData.get(`tipoMaterial_${bobinaIndex}`);
        
        if (!tipoMaterial) {
            mostrarToast(`Complete el tipo de material para la bobina ${bobinaIndex}`, 'error');
            return;
        }
        
        const bobinaData = {
            entregaVacia,
            tipoMaterial,
            tipoCableDevolucion: formData.get(`tipoCableDevolucion_${bobinaIndex}`) || '',
            tipoCableDevolucionVacia: formData.get(`tipoCableDevolucionVacia_${bobinaIndex}`) || '',
            numeroMatriculaCable: formData.get(`numeroMatriculaCable_${bobinaIndex}`) || '',
            metrosCableBobina: parseFloat(formData.get(`metrosCable_${bobinaIndex}`)) || 0,
            numeroMatriculaVacia: formData.get(`numeroMatriculaVacia_${bobinaIndex}`) || '',
            descripcionOtroMaterial: formData.get(`descripcionOtroMaterial_${bobinaIndex}`) || ''
        };
        
        // Validar campos específicos según el tipo
        if (tipoMaterial === 'bobina_con_cable' && (!bobinaData.tipoCableDevolucion || !bobinaData.numeroMatriculaCable || !bobinaData.metrosCableBobina)) {
            mostrarToast(`Complete todos los campos de cable para la bobina ${bobinaIndex}`, 'error');
            return;
        }
        
        if (tipoMaterial === 'bobina_vacia' && (!bobinaData.tipoCableDevolucionVacia || !bobinaData.numeroMatriculaVacia)) {
            mostrarToast(`Complete el tipo de cable y número de matrícula para la bobina ${bobinaIndex}`, 'error');
            return;
        }
        
        if (tipoMaterial === 'otro' && !bobinaData.descripcionOtroMaterial) {
            mostrarToast(`Complete la descripción del material para la bobina ${bobinaIndex}`, 'error');
            return;
        }
        
        bobinasData.push(bobinaData);
    });
    
    // Crear devolución con múltiples bobinas
    const devolucion = {
        id: generarIdDevolucion(),
        idObra: formData.get('idObra'),
        fechaEntrega: formData.get('fecha'),
        tipoInstalacion: formData.get('tipoInstalacion'),
        bobinas: bobinasData,
        observaciones: formData.get('observaciones') || '',
        fechaCreacion: new Date().toISOString()
    };

    devoluciones.push(devolucion);
    guardarDevoluciones();
    cerrarModalDevolucion();
    actualizarContadores();
    mostrarDevoluciones();
    mostrarToast('Devolución registrada correctamente', 'success');
}

function eliminarDevolucion(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta devolución?')) {
        devoluciones = devoluciones.filter(d => d.id !== id);
        guardarDevoluciones();
        actualizarContadores();
        mostrarDevoluciones();
        mostrarToast('Devolución eliminada correctamente', 'success');
    }
}

function mostrarDevoluciones() {
    const contenedor = document.getElementById('lista-devoluciones');
    
    if (devoluciones.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--neutral-600);">
                <div style="font-size: 64px; margin-bottom: 20px;">↩️</div>
                <h3 style="margin-bottom: 10px; color: var(--neutral-900);">
                    No hay devoluciones registradas
                </h3>
                <p>
                    Las devoluciones de bobinas y cables aparecerán aquí
                </p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = devoluciones.map(devolucion => crearTarjetaDevolucion(devolucion)).join('');
}

function crearTarjetaDevolucion(devolucion) {
    const fechaFormateada = new Date(devolucion.fechaEntrega).toLocaleDateString('es-ES');
    
    // Generar HTML para todas las bobinas
    let bobinasHtml = '';
    devolucion.bobinas.forEach((bobina, index) => {
        let tipoMaterialText = '';
        let detallesMaterial = '';
        
        switch(bobina.tipoMaterial) {
            case 'bobina_con_cable':
                tipoMaterialText = 'Bobina con Cable';
                detallesMaterial = `
                    <div class="info-row">
                        <span class="info-label">Tipo de Cable:</span>
                        <span class="info-value">${bobina.tipoCableDevolucion || 'No especificado'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nº Matrícula:</span>
                        <span class="info-value">${bobina.numeroMatriculaCable}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Metros de Cable:</span>
                        <span class="info-value">${bobina.metrosCableBobina} m</span>
                    </div>
                `;
                break;
            case 'bobina_vacia':
                tipoMaterialText = 'Bobina Vacía';
                detallesMaterial = `
                    <div class="info-row">
                        <span class="info-label">Nº Matrícula:</span>
                        <span class="info-value">${bobina.numeroMatriculaVacia}</span>
                    </div>
                `;
                break;
            case 'otro':
                tipoMaterialText = 'Otro Material';
                detallesMaterial = `
                    <div class="info-row">
                        <span class="info-label">Material:</span>
                        <span class="info-value">${bobina.descripcionOtroMaterial}</span>
                    </div>
                `;
                break;
        }

        let entregaVaciaText = bobina.entregaVacia ? 'SÍ' : 'NO';

        bobinasHtml += `
            <div class="bobina-info" style="margin-bottom: ${index < devolucion.bobinas.length - 1 ? 'var(--space-md)' : '0'}; padding-bottom: ${index < devolucion.bobinas.length - 1 ? 'var(--space-md)' : '0'}; border-bottom: ${index < devolucion.bobinas.length - 1 ? '1px solid var(--neutral-300)' : 'none'};">
                <div style="font-weight: 600; color: var(--primary-500); margin-bottom: var(--space-sm);">Bobina ${index + 1}</div>
                <div class="info-row">
                    <span class="info-label">Metros Bobina:</span>
                    <span class="info-value">${bobina.tipoMaterial === 'bobina_con_cable' ? bobina.metrosCableBobina + ' m' : '0 m'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Entrega Vacía:</span>
                    <span class="info-value">${entregaVaciaText}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Material:</span>
                    <span class="info-value">${tipoMaterialText}</span>
                </div>
                ${detallesMaterial}
            </div>
        `;
    });

    let observacionesHtml = '';
    if (devolucion.observaciones) {
        observacionesHtml = `
            <div class="observaciones" style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--neutral-300);">
                <strong>Observaciones:</strong> ${devolucion.observaciones}
            </div>
        `;
    }

    return `
        <div class="albaran-card">
            <div class="albaran-header">
                <div class="albaran-id">${devolucion.id}</div>
                <div class="status-badge status-recibido">Devolución</div>
            </div>
            <div class="albaran-info">
                <div class="info-row">
                    <span class="info-label">ID Obra:</span>
                    <span class="info-value">${devolucion.idObra}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha Entrega:</span>
                    <span class="info-value">${fechaFormateada}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Tipo Instalación:</span>
                    <span class="info-value">${devolucion.tipoInstalacion}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total Bobinas:</span>
                    <span class="info-value">${devolucion.bobinas.length}</span>
                </div>
                ${bobinasHtml}
                ${observacionesHtml}
            </div>
            <div class="albaran-actions">
                <button class="btn btn-secondary" onclick="eliminarDevolucion('${devolucion.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
}

function abrirModalNuevaDevolucion() {
    document.getElementById('modalNuevaDevolucion').classList.add('active');
    document.getElementById('idObraDevolucion').focus();
    establecerFechaActual();
    inicializarBobinas(); // Inicializar con una bobina por defecto
}

function cerrarModalDevolucion() {
    document.getElementById('modalNuevaDevolucion').classList.remove('active');
    document.getElementById('formNuevaDevolucion').reset();
    
    // Limpiar contenedor de bobinas
    document.getElementById('bobinasContainer').innerHTML = '';
}



// ===== GESTIÓN DE CABLES Y SUBCONDUCTOS =====
function agregarMaterial(tipo, formData, accion) {
    const material = {
        id: generarIdMaterial(tipo),
        tipoMaterial: tipo,
        idObra: formData.get('idObra') || '',
        tipoCable: formData.get('tipoCable') || formData.get('tipoSubconducto') || '',
        metros: parseFloat(formData.get('metros')) || 0,
        accion: accion, // 'instalacion' o 'entrada'
        fecha: formData.get('fecha') || new Date().toISOString().split('T')[0],
        observaciones: formData.get('observaciones') || ''
    };

    if (tipo === 'cable') {
        cables.push(material);
    } else {
        subconductos.push(material);
    }
    
    guardarMateriales();
    mostrarMateriales(tipo);
    actualizarContadores();
    actualizarStockDisplay(tipo);
    
    const tipoLabel = tipo === 'cable' ? 'Cable' : 'Subconducto';
    const accionLabel = accion === 'instalacion' ? 'instalación' : 'entrada';
    mostrarToast(`${tipoLabel} de ${accionLabel} agregado correctamente`, 'success');
}

// Función eliminada - ya no se usa el sistema de "solicitado"

function eliminarMaterial(tipo, materialId) {
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
        if (tipo === 'cable') {
            cables = cables.filter(m => m.id !== materialId);
        } else {
            subconductos = subconductos.filter(m => m.id !== materialId);
        }
        guardarMateriales();
        mostrarMateriales(tipo);
        actualizarContadores();
        actualizarStockDisplay(tipo);
        mostrarToast('Material eliminado correctamente', 'success');
    }
}

function mostrarMateriales(tipo) {
    const contenedor = document.getElementById(`lista-${tipo}s`);
    const materialArray = tipo === 'cable' ? cables : subconductos;
    
    if (materialArray.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 60px 20px; color: var(--neutral-600);">
                <div style="font-size: 64px; margin-bottom: 20px;">${tipo === 'cable' ? '🔌' : '🛡️'}</div>
                <h3 style="margin-bottom: 10px; color: var(--neutral-900);">
                    No hay ${tipo}s registrados
                </h3>
                <p>
                    Los ${tipo}s utilizados en obras aparecerán aquí
                </p>
            </div>
        `;
        return;
    }

    // Agrupar materiales por tipo
    const materialesPorTipo = {};
    materialArray.forEach(material => {
        const tipoMaterial = material.tipoCable || material.tipoSubconducto || 'Sin especificar';
        if (!materialesPorTipo[tipoMaterial]) {
            materialesPorTipo[tipoMaterial] = [];
        }
        materialesPorTipo[tipoMaterial].push(material);
    });

    // Crear HTML con secciones por tipo
    let html = '';
    Object.keys(materialesPorTipo).sort().forEach(tipoMaterial => {
        const materiales = materialesPorTipo[tipoMaterial];
        const stock = calcularStockPorTipo(tipo === 'cable' ? 'cable' : 'subconducto')[tipoMaterial] || {recibido: 0, instalado: 0, disponible: 0};
        
        html += `
            <div class="tipo-section">
                <div class="tipo-header">
                    <h3>${tipoMaterial}</h3>
                    <div class="tipo-stock">
                        <span class="stock-item">Recibido: ${stock.recibido.toFixed(1)}m</span>
                        <span class="stock-item">Instalado: ${stock.instalado.toFixed(1)}m</span>
                        <span class="stock-item disponible">Disponible: ${stock.disponible.toFixed(1)}m</span>
                    </div>
                </div>
                <div class="materiales-grid">
                    ${materiales.map(material => crearTarjetaMaterial(material)).join('')}
                </div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

function crearTarjetaMaterial(material) {
    const fechaFormateada = new Date(material.fecha).toLocaleDateString('es-ES');
    
    let estadoClass = '';
    let estadoText = '';
    
    if (material.accion === 'entrada') {
        estadoClass = 'status-recibido';
        estadoText = 'Entrada';
    } else if (material.accion === 'instalacion') {
        estadoClass = 'status-faltante';
        estadoText = 'Instalado';
    } else if (material.accion === 'solicitado') {
        estadoClass = 'status-recibido';
        estadoText = 'Solicitado';
    }

    let observacionesHtml = '';
    if (material.observaciones) {
        observacionesHtml = `
            <div class="observaciones">
                <strong>Observaciones:</strong> ${material.observaciones}
            </div>
        `;
    }

    let tipoHtml = '';
    if (material.tipoCable) {
        tipoHtml = `
            <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span class="info-value">${material.tipoCable}</span>
            </div>
        `;
    }

    let idObraHtml = '';
    if (material.idObra) {
        idObraHtml = `
            <div class="info-row">
                <span class="info-label">ID Obra:</span>
                <span class="info-value">${material.idObra}</span>
            </div>
        `;
    }

    // Botones de acción
    let botonesHtml = '';
    const tipoMaterial = material.tipoMaterial || (material.tipoCable ? 'cable' : 'subconducto');
    
    if (tipoMaterial === 'subconducto' && material.accion !== 'entrada') {
        // Para subconductos, mostrar botón Solicitado si no está en entrada
        botonesHtml = `
            <button class="btn btn-warning" onclick="marcarSolicitado('${tipoMaterial}', '${material.id}')" title="Marcar como Solicitado">
                📦 Solicitado
            </button>
            <button class="btn btn-secondary" onclick="eliminarMaterial('${tipoMaterial}', '${material.id}')">
                🗑️ Eliminar
            </button>
        `;
    } else {
        botonesHtml = `
            <button class="btn btn-secondary" onclick="eliminarMaterial('${tipoMaterial}', '${material.id}')">
                🗑️ Eliminar
            </button>
        `;
    }

    return `
        <div class="albaran-card">
            <div class="albaran-header">
                <div class="albaran-id">${material.id}</div>
                <div class="status-badge ${estadoClass}">${estadoText}</div>
            </div>
            <div class="albaran-info">
                ${idObraHtml}
                ${tipoHtml}
                <div class="info-row">
                    <span class="info-label">Metros:</span>
                    <span class="info-value">${material.metros} m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${fechaFormateada}</span>
                </div>
                ${observacionesHtml}
            </div>
            <div class="albaran-actions">
                ${botonesHtml}
            </div>
        </div>
    `;
}

function calcularStock(tipo) {
    const materialArray = tipo === 'cable' ? cables : subconductos;
    
    let totalRecibido = 0;
    let totalInstalado = 0;
    
    materialArray.forEach(material => {
        if (material.accion === 'entrada') {
            totalRecibido += material.metros;
        } else if (material.accion === 'instalacion') {
            totalInstalado += material.metros;
        }
        // Los materiales con acción 'solicitado' no restan del stock disponible
    });
    
    return {
        recibido: totalRecibido,
        instalado: totalInstalado,
        disponible: totalRecibido - totalInstalado
    };
}

// Función para marcar subconducto como solicitado
function marcarSolicitado(tipo, materialId) {
    if (tipo === 'subconducto') {
        const subconducto = subconductos.find(m => m.id === materialId);
        if (subconducto && subconducto.accion === 'instalacion') {
            if (confirm('¿Marcar este subconducto como Solicitado? Esto aumentará el stock disponible.')) {
                // Cambiar el estado a solicitado
                subconducto.accion = 'solicitado';
                subconducto.fechaSolicitado = new Date().toISOString();
                
                guardarMateriales();
                mostrarMateriales('subconducto');
                actualizarContadores();
                actualizarStockDisplay('subconducto');
                mostrarToast('Subconducto marcado como Solicitado', 'success');
            }
        } else {
            mostrarToast('Solo se pueden marcar subconductos instalados', 'warning');
        }
    } else {
        mostrarToast('Esta función solo está disponible para subconductos', 'warning');
    }
}

function calcularStockPorTipo(tipoMaterial) {
    const materialArray = tipoMaterial === 'cable' ? cables : subconductos;
    const stockPorTipo = {};
    
    // Obtener todos los tipos únicos
    const tipos = [...new Set(materialArray.map(m => m.tipoCable || m.tipoSubconducto))];
    
    tipos.forEach(tipo => {
        const materialesDelTipo = materialArray.filter(m => (m.tipoCable || m.tipoSubconducto) === tipo);
        
        let totalRecibido = 0;
        let totalInstalado = 0;
        
        materialesDelTipo.forEach(material => {
            if (material.accion === 'entrada') {
                totalRecibido += material.metros;
            } else if (material.accion === 'instalacion') {
                totalInstalado += material.metros;
            }
        });
        
        stockPorTipo[tipo] = {
            recibido: totalRecibido,
            instalado: totalInstalado,
            disponible: totalRecibido - totalInstalado
        };
    });
    
    return stockPorTipo;
}

// ===== REPORTES PDF =====
function generarReporteMateriales(tipoMaterial) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(255, 85, 0); // Color primario
    doc.text('Redes Carreras S.L.', 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Control de ${tipoMaterial === 'cable' ? 'Cables' : 'Subconductos'}`, 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const fechaReporte = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha del reporte: ${fechaReporte}`, 20, 55);
    
    let yPos = 75;
    
    // Obtener datos filtrados
    const tipoFiltro = tipoMaterial === 'cable' ? 'cables' : 'subconductos';
    const materialArray = obtenerDatosFiltrados(tipoFiltro);
    const stockPorTipo = calcularStockPorTipo(tipoMaterial);
    
    // Resumen por tipo
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Stock por Tipo', 20, yPos);
    yPos += 15;
    
    Object.keys(stockPorTipo).forEach(tipo => {
        const stock = stockPorTipo[tipo];
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(255, 85, 0);
        doc.text(`${tipo}:`, 25, yPos);
        yPos += 6;
        
        doc.setTextColor(0, 0, 0);
        doc.text(`Recibidos: ${stock.recibido.toFixed(1)}m | Instalados: ${stock.instalado.toFixed(1)}m | Disponibles: ${stock.disponible.toFixed(1)}m`, 30, yPos);
        yPos += 10;
    });
    
    yPos += 15;
    
    // Tabla detallada con columnas: ID Obra - Tipo - Acción - Metros - Fecha
    if (materialArray.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detalle de Movimientos', 20, yPos);
        yPos += 15;
        
        // Headers
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(255, 85, 0);
        doc.rect(20, yPos - 8, 170, 8, 'F');
        
        doc.text('ID Obra', 22, yPos - 2);
        doc.text('Tipo', 65, yPos - 2);
        doc.text('Acción', 105, yPos - 2);
        doc.text('Metros', 135, yPos - 2);
        doc.text('Fecha', 165, yPos - 2);
        
        yPos += 12;
        
        // Datos
        doc.setTextColor(0, 0, 0);
        materialArray.forEach((material, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
            
            // Alternar colores de fondo
            if (index % 2 === 0) {
                doc.setFillColor(245, 241, 230);
                doc.rect(20, yPos - 8, 170, 8, 'F');
            }
            
            const tipo = material.tipoCable || material.tipoSubconducto || 'N/A';
            const accion = material.accion === 'entrada' ? 'Entrada' : 
                           material.accion === 'solicitado' ? 'Solicitado' : 'Instalación';
            const fecha = new Date(material.fecha).toLocaleDateString('es-ES');
            const obra = material.idObra || '-';
            
            // Truncar tipo si es muy largo
            const tipoTruncado = doc.splitTextToSize(tipo, 38);
            
            // Calcular altura de la fila basada en el contenido más largo
            const alturaFila = Math.max(8, tipoTruncado.length * 5);
            
            // Verificar si necesita nueva página
            if (yPos + alturaFila > 270) {
                doc.addPage();
                yPos = 30;
            }
            
            // Alternar colores de fondo - ajustar a la altura de la fila
            if (index % 2 === 0) {
                doc.setFillColor(245, 241, 230);
                doc.rect(20, yPos - 8, 170, alturaFila, 'F');
            }
            
            // Usar anchos de columna definidos
            const colObra = 22;
            const colTipo = 65;
            const colAccion = 105;
            const colMetros = 135;
            const colFecha = 165;
            
            // Truncar tipo si es muy largo
            doc.text(tipoTruncado, colTipo, yPos - 2);
            
            // Acción
            doc.text(accion, colAccion, yPos - 2);
            
            // Metros
            doc.text(`${material.metros}m`, colMetros, yPos - 2);
            
            // Fecha
            doc.text(fecha, colFecha, yPos - 2);
            
            // ID Obra
            doc.text(obra, colObra, yPos - 2);
            
            // Mover yPos según la altura de la fila
            yPos += alturaFila;
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por Sistema de Control de Materiales - Redes Carreras S.L.', 20, 290);
        doc.text(`Página ${i} de ${pageCount}`, 170, 290);
    }
    
    // Descargar
    const nombreArchivo = `reporte_${tipoMaterial}s_${fechaReporte.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    mostrarToast(`Reporte de ${tipoMaterial === 'cable' ? 'cables' : 'subconductos'} generado correctamente`, 'success');
}

function generarReporteDevoluciones() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(255, 85, 0); // Color primario
    doc.text('Redes Carreras S.L.', 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Control de Devoluciones', 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const fechaReporte = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha del reporte: ${fechaReporte}`, 20, 55);
    
    let yPos = 75;
    
    // Resumen general
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen General', 20, yPos);
    yPos += 15;
    
    const totalDevoluciones = devoluciones.length;
    let totalBobinas = 0;
    let bobinasConCable = 0;
    let bobinasVacias = 0;
    let otrosMateriales = 0;
    let entregasVacias = 0;
    
    devoluciones.forEach(devolucion => {
        totalBobinas += devolucion.bobinas.length;
        devolucion.bobinas.forEach(bobina => {
            switch(bobina.tipoMaterial) {
                case 'bobina_con_cable':
                    bobinasConCable++;
                    break;
                case 'bobina_vacia':
                    bobinasVacias++;
                    break;
                case 'otro':
                    otrosMateriales++;
                    break;
            }
            if (bobina.entregaVacia) entregasVacias++;
        });
    });
    
    doc.setFontSize(12);
    doc.text(`Total de Devoluciones: ${totalDevoluciones}`, 25, yPos);
    yPos += 8;
    doc.text(`Total de Bobinas: ${totalBobinas}`, 25, yPos);
    yPos += 8;
    doc.text(`Bobinas con Cable: ${bobinasConCable}`, 25, yPos);
    yPos += 8;
    doc.text(`Bobinas Vacías: ${bobinasVacias}`, 25, yPos);
    yPos += 8;
    doc.text(`Otros Materiales: ${otrosMateriales}`, 25, yPos);
    yPos += 8;
    doc.text(`Entregas Vacías: ${entregasVacias}`, 25, yPos);
    yPos += 20;
    
    // Tabla detallada
    if (devoluciones.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detalle de Devoluciones', 20, yPos);
        yPos += 15;
        
        // Headers: ID Obra - Fecha - Tipo Cable/Metros - Estado
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(255, 85, 0);
        doc.rect(20, yPos - 8, 170, 8, 'F');
        
        // Ajustar posiciones de columnas para mejor visualización
        // ID Obra (22-55), Fecha (55-85), Tipo Cable/Metros (85-155), Estado (155-190)
        doc.text('ID Obra', 22, yPos - 2);
        doc.text('Fecha', 55, yPos - 2);
        doc.text('Tipo Cable/Metros', 85, yPos - 2);
        doc.text('Estado', 158, yPos - 2);
        
        yPos += 12;
        
        // Datos detallados
        doc.setTextColor(0, 0, 0);
        devoluciones.forEach((devolucion, index) => {
            const fecha = new Date(devolucion.fechaEntrega).toLocaleDateString('es-ES');
            
            // Generar detalle de bobinas
            let detalleBobinas = '';
            let totalMetros = 0;
            devolucion.bobinas.forEach((bobina, idx) => {
                if (idx > 0) detalleBobinas += '\n';
                if (bobina.tipoMaterial === 'bobina_vacia') {
                    // Para bobina vacía
                    detalleBobinas += `Vacía - ${bobina.tipoCableDevolucionVacia || 'N/A'}`;
                } else if (bobina.tipoMaterial === 'bobina_con_cable') {
                    // Para bobina con cable
                    const metros = bobina.metrosCableBobina || 0;
                    totalMetros += metros;
                    detalleBobinas += `${bobina.tipoCableDevolucion || 'N/A'} - ${metros}m`;
                } else if (bobina.tipoMaterial === 'otro') {
                    // Para otro material
                    detalleBobinas += `${bobina.descripcionOtroMaterial || 'Otro'} - ${bobina.metrosCableBobina || 0}m`;
                }
            });
            
            // Calcular altura de la fila basada en el contenido
            const detalleLineas = doc.splitTextToSize(detalleBobinas, 70);
            const alturaFila = Math.max(8, detalleLineas.length * 5);
            
            // Verificar si necesita nueva página
            if (yPos + alturaFila > 270) {
                doc.addPage();
                yPos = 30;
            }
            
            // Alternar colores de fondo - rectángulo se ajusta a la altura de la fila
            if (index % 2 === 0) {
                doc.setFillColor(245, 241, 230);
                doc.rect(20, yPos - 8, 170, alturaFila, 'F');
            }
            
            // ID Obra - ajustar texto si es muy largo
            const obraText = doc.splitTextToSize(devolucion.idObra || '-', 30);
            doc.text(obraText, 22, yPos - 2);
            
            // Fecha
            doc.text(fecha, 55, yPos - 2);
            
            // Tipo Cable/Metros
            doc.text(detalleLineas, 85, yPos - 2);
            
            // Estado
            doc.text('Completada', 158, yPos - 2);
            
            // Mover yPos según la altura de la fila
            yPos += alturaFila;
        });
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por Sistema de Control de Materiales - Redes Carreras S.L.', 20, 290);
        doc.text(`Página ${i} de ${pageCount}`, 170, 290);
    }
    
    // Descargar
    const nombreArchivo = `reporte_devoluciones_${fechaReporte.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    mostrarToast('Reporte de devoluciones generado correctamente', 'success');
}

function generarReporte(tipo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar fuentes
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(255, 85, 0); // Color primario
    doc.text('Redes Carreras S.L.', 20, 30);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Control de Materiales - Reporte', 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const fechaReporte = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha del reporte: ${fechaReporte}`, 20, 55);
    
    let yPos = 75;
    
    // Función para agregar tabla
    function agregarTabla(albaranesArray, titulo) {
        if (albaranesArray.length === 0) {
            doc.setFontSize(14);
            doc.setTextColor(100, 100, 100);
            doc.text(`${titulo}: No hay datos`, 20, yPos);
            yPos += 20;
            return;
        }

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(titulo, 20, yPos);
        yPos += 15;
        
        // Headers
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(255, 85, 0);
        doc.rect(20, yPos - 8, 170, 8, 'F');
        
        // Posiciones de columnas: ID Obra (22), Fecha (70), Tipo (110), Estado (145), Cuenta (170)
        doc.text('ID Obra', 22, yPos - 2);
        doc.text('Fecha', 70, yPos - 2);
        doc.text('Tipo', 110, yPos - 2);
        doc.text('Estado', 145, yPos - 2);
        doc.text('Cuenta', 170, yPos - 2);
        
        yPos += 12;
        
        // Datos
        doc.setTextColor(0, 0, 0);
        albaranesArray.forEach((albaran, index) => {
            if (yPos > 250) { // Nueva página si es necesario
                doc.addPage();
                yPos = 30;
            }
            
            // Alternar colores de fondo
            if (index % 2 === 0) {
                doc.setFillColor(245, 241, 230);
                doc.rect(20, yPos - 8, 170, 8, 'F');
            }
            
            const fecha = new Date(albaran.fecha).toLocaleDateString('es-ES');
            const estado = albaran.estado === 'pendiente' ? 'Pendiente' : 
                          albaran.estado === 'recibido' ? 'Recibido' : 'Faltante';
            
            // Truncar textos largos para que quepan en sus columnas
            const obraText = albaran.idObra.length > 15 ? albaran.idObra.substring(0, 15) + '...' : albaran.idObra;
            const tipoText = albaran.tipoInstalacion.length > 12 ? albaran.tipoInstalacion.substring(0, 12) + '...' : albaran.tipoInstalacion;
            const cuentaText = albaran.cuentaCargo.length > 15 ? albaran.cuentaCargo.substring(0, 15) + '...' : albaran.cuentaCargo;
            
            doc.text(obraText, 22, yPos - 2);
            doc.text(fecha, 70, yPos - 2);
            doc.text(tipoText, 110, yPos - 2);
            doc.text(estado, 145, yPos - 2);
            doc.text(cuentaText, 170, yPos - 2);
            
            yPos += 8;
        });
        
        yPos += 15;
    }
    
    // Generar según el tipo
    switch(tipo) {
        case 'pendientes':
            const pendientes = obtenerDatosFiltrados('pendientes');
            agregarTabla(pendientes, 'Albaranes Pendientes');
            break;
            
        case 'recibidos':
            const recibidos = obtenerDatosFiltrados('recibidos');
            agregarTabla(recibidos, 'Albaranes Recibidos');
            break;
            
        case 'faltantes':
            const faltantes = obtenerDatosFiltrados('faltantes');
            agregarTabla(faltantes, 'Albaranes con Material Faltante');
            
            // Agregar detalles del material faltante
            if (faltantes.length > 0) {
                yPos += 10;
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text('Detalles del Material Faltante', 20, yPos);
                yPos += 15;
                
                faltantes.forEach(albaran => {
                    if (albaran.materialFaltante) {
                        if (yPos > 250) {
                            doc.addPage();
                            yPos = 30;
                        }
                        
                        doc.setFontSize(10);
                        doc.setTextColor(255, 85, 0);
                        doc.text(`${albaran.id}:`, 25, yPos);
                        yPos += 6;
                        
                        doc.setTextColor(0, 0, 0);
                        const lineas = doc.splitTextToSize(albaran.materialFaltante, 150);
                        lineas.forEach(linea => {
                            doc.text(linea, 30, yPos);
                            yPos += 5;
                        });
                        yPos += 8;
                    }
                });
            }
            break;
            
        case 'cables':
            generarReporteMateriales('cable');
            return;
            
        case 'subconductos':
            generarReporteMateriales('subconducto');
            return;
            
        case 'devoluciones':
            generarReporteDevoluciones();
            return;
            
        case 'completo':
            // Resumen general
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Resumen General', 20, yPos);
            yPos += 15;
            
            const todosAlbaranes = obtenerDatosFiltrados('completo');
            const total = todosAlbaranes.length;
            const pendientesCount = todosAlbaranes.filter(a => a.estado === 'pendiente').length;
            const recibidosCount = todosAlbaranes.filter(a => a.estado === 'recibido').length;
            const faltantesCount = todosAlbaranes.filter(a => a.estado === 'faltante').length;
            
            doc.setFontSize(12);
            doc.text(`Total de Albaranes: ${total}`, 25, yPos);
            yPos += 8;
            doc.text(`Pendientes: ${pendientesCount}`, 25, yPos);
            yPos += 8;
            doc.text(`Recibidos: ${recibidosCount}`, 25, yPos);
            yPos += 8;
            doc.text(`Con Material Faltante: ${faltantesCount}`, 25, yPos);
            yPos += 20;
            
            // Tablas detalladas
            agregarTabla(albaranes.filter(a => a.estado === 'pendiente'), 'Albaranes Pendientes');
            agregarTabla(albaranes.filter(a => a.estado === 'recibido'), 'Albaranes Recibidos');
            agregarTabla(albaranes.filter(a => a.estado === 'faltante'), 'Albaranes con Material Faltante');
            break;
    }
    
    // Footer en cada página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generado por Sistema de Control de Materiales - Redes Carreras S.L.', 20, 290);
        doc.text(`Página ${i} de ${pageCount}`, 170, 290);
    }
    
    // Descargar
    const nombreArchivo = `reporte_albaranes_${tipo}_${fechaReporte.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    mostrarToast('Reporte generado y descargado correctamente', 'success');
}

// ===== FUNCIONES MODALES MATERIALES =====
function abrirModalCableInstalacion() {
    document.getElementById('modalNuevoCable').classList.add('active');
    document.getElementById('idObraCable').focus();
    establecerFechaActualMaterial('Cable');
}

function cerrarModalCable() {
    document.getElementById('modalNuevoCable').classList.remove('active');
    document.getElementById('formNuevoCable').reset();
}

function abrirModalEntradaCable() {
    document.getElementById('modalEntradaCable').classList.add('active');
    document.getElementById('tipoCableEntrada').focus();
    establecerFechaActualMaterial('CableEntrada');
}

function cerrarModalEntradaCable() {
    document.getElementById('modalEntradaCable').classList.remove('active');
    document.getElementById('formEntradaCable').reset();
}

function abrirModalSubconductoInstalacion() {
    document.getElementById('modalNuevoSubconducto').classList.add('active');
    document.getElementById('idObraSubconducto').focus();
    establecerFechaActualMaterial('Subconducto');
}

function cerrarModalSubconducto() {
    document.getElementById('modalNuevoSubconducto').classList.remove('active');
    document.getElementById('formNuevoSubconducto').reset();
}

function abrirModalEntradaSubconducto() {
    document.getElementById('modalEntradaSubconducto').classList.add('active');
    document.getElementById('tipoSubconductoEntrada').focus();
    establecerFechaActualMaterial('SubconductoEntrada');
}

function cerrarModalEntradaSubconducto() {
    document.getElementById('modalEntradaSubconducto').classList.remove('active');
    document.getElementById('formEntradaSubconducto').reset();
}

function establecerFechaActualMaterial(tipo) {
    const hoy = new Date().toISOString().split('T')[0];
    const elementos = [
        `fechaCable`,
        `fechaSubconducto`, 
        `fechaCableEntrada`,
        `fechaSubconductoEntrada`
    ];
    
    elementos.forEach(elemento => {
        const elementoDOM = document.getElementById(elemento);
        if (elementoDOM) {
            elementoDOM.value = hoy;
        }
    });
}

function actualizarStockDisplay(tipo) {
    const stock = calcularStock(tipo);
    const prefijo = tipo === 'cable' ? 'cable' : 'subconducto';
    
    document.getElementById(`${prefijo}-recibido`).textContent = stock.recibido.toFixed(1);
    document.getElementById(`${prefijo}-instalado`).textContent = stock.instalado.toFixed(1);
    document.getElementById(`${prefijo}-disponible`).textContent = stock.disponible.toFixed(1);
}

// ===== FUNCIONES SIMPLES PARA NUEVOS BOTONES =====
// ===== EXPORTAR DATOS =====
function exportarDatos() {
    console.log('📤 Ejecutando exportarDatos()');
    try {
        console.log('📊 Datos a exportar:', {
            albaranes: albaranes.length,
            cables: cables.length,
            subconductos: subconductos.length,
            devoluciones: devoluciones.length
        });
        
        const datosCompletos = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            albaranes: albaranes,
            cables: cables,
            subconductos: subconductos,
            devoluciones: devoluciones,
            metadata: {
                totalAlbaranes: albaranes.length,
                totalCables: cables.length,
                totalSubconductos: subconductos.length,
                totalDevoluciones: devoluciones.length
            }
        };
        
        const datosJson = JSON.stringify(datosCompletos, null, 2);
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `backup_materiales_${fecha}.json`;
        
        console.log('📁 Creando archivo:', nombreArchivo);
        
        // Crear y descargar archivo
        const blob = new Blob([datosJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('✅ Archivo descargado correctamente');
        mostrarToast(`✅ Datos exportados correctamente: ${nombreArchivo}`, 'success');
    } catch (error) {
        console.error('❌ Error al exportar datos:', error);
        mostrarToast('❌ Error al exportar datos', 'error');
    }
}

// ===== IMPORTAR DATOS =====
function abrirModalImportar() {
    console.log('📥 Ejecutando abrirModalImportar()');
    const modal = document.getElementById('modalImportar');
    if (modal) {
        modal.classList.add('active');
        console.log('✅ Modal importar abierto');
        const archivoInput = document.getElementById('archivoImportar');
        const preview = document.getElementById('preview-import');
        const btnConfirmar = document.getElementById('btnConfirmarImportar');
        
        if (archivoInput) archivoInput.value = '';
        if (preview) preview.style.display = 'none';
        if (btnConfirmar) btnConfirmar.disabled = true;
    } else {
        console.error('❌ No se encontró el modal de importar');
    }
}

function cerrarModalImportar() {
    const modal = document.getElementById('modalImportar');
    const archivoInput = document.getElementById('archivoImportar');
    const preview = document.getElementById('preview-import');
    const btnConfirmar = document.getElementById('btnConfirmarImportar');
    
    if (modal) modal.classList.remove('active');
    if (archivoInput) archivoInput.value = '';
    if (preview) preview.style.display = 'none';
    if (btnConfirmar) btnConfirmar.disabled = true;
}

function procesarArchivoImportar() {
    const archivo = document.getElementById('archivoImportar')?.files[0];
    const preview = document.getElementById('preview-import');
    const btnConfirmar = document.getElementById('btnConfirmarImportar');
    
    // Si no hay archivo o los elementos no existen, limpiar y salir
    if (!archivo) {
        if (preview) preview.style.display = 'none';
        if (btnConfirmar) btnConfirmar.disabled = true;
        return;
    }
    
    if (!archivo.name.endsWith('.json')) {
        mostrarToast('❌ Solo se permiten archivos JSON', 'error');
        const archivoInput = document.getElementById('archivoImportar');
        if (archivoInput) archivoInput.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            
            // Validar estructura de datos
            if (!datos.albaranes || !datos.cables || !datos.subconductos || !datos.devoluciones) {
                throw new Error('Estructura de datos inválida');
            }
            
            // Mostrar preview
            mostrarPreviewImport(datos);
            if (btnConfirmar) btnConfirmar.disabled = false;
            
        } catch (error) {
            console.error('Error al procesar archivo:', error);
            mostrarToast('❌ Error al leer el archivo: formato inválido', 'error');
            const archivoInput = document.getElementById('archivoImportar');
            if (archivoInput) archivoInput.value = '';
            if (preview) preview.style.display = 'none';
            if (btnConfirmar) btnConfirmar.disabled = true;
        }
    };
    
    reader.readAsText(archivo);
}

function mostrarPreviewImport(datos) {
    const preview = document.getElementById('preview-import');
    
    if (!preview) {
        console.error('Elemento preview-import no encontrado');
        return;
    }
    
    const stats = {
        albaranes: datos.albaranes.length,
        cables: datos.cables.length,
        subconductos: datos.subconductos.length,
        devoluciones: datos.devoluciones.length
    };
    
    preview.innerHTML = `
        <h4>📊 Preview de Datos</h4>
        <p><strong>Archivo:</strong> ${datos.timestamp ? new Date(datos.timestamp).toLocaleDateString() : 'Fecha no disponible'}</p>
        <div class="import-stats">
            <div class="import-stat">
                <div class="stat-number">${stats.albaranes}</div>
                <div class="stat-label">Albaranes</div>
            </div>
            <div class="import-stat">
                <div class="stat-number">${stats.cables}</div>
                <div class="stat-label">Cables</div>
            </div>
            <div class="import-stat">
                <div class="stat-number">${stats.subconductos}</div>
                <div class="stat-label">Subconductos</div>
            </div>
            <div class="import-stat">
                <div class="stat-number">${stats.devoluciones}</div>
                <div class="stat-label">Devoluciones</div>
            </div>
        </div>
    `;
    
    preview.style.display = 'block';
}

function confirmarImportar() {
    const archivo = document.getElementById('archivoImportar').files[0];
    
    if (!archivo) {
        mostrarToast('❌ No hay archivo seleccionado', 'error');
        return;
    }
    
    if (confirm('⚠️ ¿Estás seguro de que quieres importar estos datos?\n\nEsto reemplazará TODOS los datos actuales y no se puede deshacer.')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const datos = JSON.parse(e.target.result);
                
                // Validar y cargar datos
                albaranes = datos.albaranes || [];
                cables = datos.cables || [];
                subconductos = datos.subconductos || [];
                devoluciones = datos.devoluciones || [];
                
                // Guardar en localStorage
                guardarAlbaranes();
                guardarMateriales();
                guardarDevoluciones();
                
                // Actualizar interfaz
                actualizarContadores();
                mostrarAlbaranes();
                actualizarStockDisplay('cable');
                actualizarStockDisplay('subconducto');
                mostrarDevoluciones();
                
                cerrarModalImportar();
                mostrarToast(`✅ Datos importados correctamente`, 'success');
                
            } catch (error) {
                console.error('Error al importar datos:', error);
                mostrarToast('❌ Error al importar los datos', 'error');
            }
        };
        
        reader.readAsText(archivo);
    }
}

// ===== FUNCIONES SIMPLES PARA NUEVOS BOTONES =====
function abrirBuscador() {
    // Verificar que el modal existe
    const modal = document.getElementById('modalBuscador');
    const buscarInput = document.getElementById('buscarObra');
    const resultadosDiv = document.getElementById('resultados-busqueda');
    
    if (!modal) {
        console.error('Error: Modal del buscador no encontrado');
        mostrarToast('Error: No se puede abrir el buscador', 'error');
        return;
    }
    
    // Abrir modal del buscador
    modal.classList.add('active');
    
    if (buscarInput) {
        buscarInput.value = '';
        buscarInput.focus();
    }
    
    if (resultadosDiv) {
        resultadosDiv.innerHTML = '<div class="no-results"><p>💡 Ingresa un ID de obra para comenzar la búsqueda</p></div>';
    }
}

function cerrarModalBuscador() {
    const modal = document.getElementById('modalBuscador');
    if (modal) {
        modal.classList.remove('active');
    }
}

function mostrarResultadosIniciales() {
    document.getElementById('resultados-busqueda').innerHTML = '<div class="no-results"><p>💡 Ingresa un ID de obra para comenzar la búsqueda</p></div>';
}

function buscarEnTiempoReal() {
    const termino = document.getElementById('buscarObra').value.trim();
    const resultadosContainer = document.getElementById('resultados-busqueda');
    
    if (termino.length < 2) {
        mostrarResultadosIniciales();
        return;
    }
    
    // Buscar en todos los datos
    const resultados = {
        albaranes: buscarAlbaranes(termino),
        cables: buscarCables(termino),
        subconductos: buscarSubconductos(termino),
        devoluciones: buscarDevoluciones(termino)
    };
    
    // Mostrar resultados
    mostrarResultadosBusqueda(resultados);
}

function buscarAlbaranes(termino) {
    return albaranes.filter(albaran => 
        albaran.idObra.toLowerCase().includes(termino.toLowerCase()) ||
        albaran.id.toLowerCase().includes(termino.toLowerCase()) ||
        albaran.cuentaCargo.toLowerCase().includes(termino.toLowerCase())
    );
}

function buscarCables(termino) {
    return cables.filter(cable => 
        (cable.idObra || '').toLowerCase().includes(termino.toLowerCase()) ||
        (cable.id || '').toLowerCase().includes(termino.toLowerCase()) ||
        (cable.tipoCable || '').toLowerCase().includes(termino.toLowerCase())
    );
}

function buscarSubconductos(termino) {
    return subconductos.filter(subconducto => 
        (subconducto.idObra || '').toLowerCase().includes(termino.toLowerCase()) ||
        (subconducto.id || '').toLowerCase().includes(termino.toLowerCase()) ||
        (subconducto.tipoSubconducto || '').toLowerCase().includes(termino.toLowerCase())
    );
}

function buscarDevoluciones(termino) {
    return devoluciones.filter(devolucion => 
        devolucion.idObra.toLowerCase().includes(termino.toLowerCase()) ||
        devolucion.id.toLowerCase().includes(termino.toLowerCase())
    );
}

function mostrarResultadosBusqueda(resultados) {
    const container = document.getElementById('resultados-busqueda');
    const totalResultados = Object.values(resultados).reduce((sum, arr) => sum + arr.length, 0);
    
    if (totalResultados === 0) {
        container.innerHTML = '<div class="resultado-vacio">🔍 No se encontraron resultados para la búsqueda</div>';
        return;
    }
    
    let html = '';
    
    // Albaranes
    if (resultados.albaranes.length > 0) {
        html += '<div class="resultado-seccion">';
        html += '<h3>📋 Albaranes</h3>';
        resultados.albaranes.forEach(albaran => {
            const estadoIcon = albaran.estado === 'pendiente' ? '📋' : 
                              albaran.estado === 'recibido' ? '✅' : '⚠️';
            // Determinar la pestaña correcta según el estado del albarán
            const pestana = albaran.estado === 'pendiente' ? 'pendientes' : 
                           albaran.estado === 'faltantes' ? 'faltantes' : 'recibidos';
            html += `
                <div class="resultado-item" onclick="irAObra('${albaran.idObra}', '${pestana}')" style="cursor: pointer;">
                    <div class="item-header">
                        <span class="item-id">${estadoIcon} ${albaran.id}</span>
                        <span class="item-fecha">${formatDate(albaran.fecha)}</span>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="detail-label">ID Obra:</span>
                            <span class="detail-value">${albaran.idObra}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estado:</span>
                            <span class="detail-value">${albaran.estado.toUpperCase()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Instalación:</span>
                            <span class="detail-value">${albaran.tipoInstalacion}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Cables
    if (resultados.cables.length > 0) {
        html += '<div class="resultado-seccion">';
        html += '<h3>🔌 Cables</h3>';
        resultados.cables.forEach(cable => {
            html += `
                <div class="resultado-item" onclick="irAObra('${cable.idObra}', 'cables')" style="cursor: pointer;">
                    <div class="item-header">
                        <span class="item-id">🔌 ${cable.id}</span>
                        <span class="item-fecha">${formatDate(cable.fecha)}</span>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="detail-label">ID Obra:</span>
                            <span class="detail-value">${cable.idObra}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tipo:</span>
                            <span class="detail-value">${cable.tipoCable}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Metros:</span>
                            <span class="detail-value">${cable.metros} m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Acción:</span>
                            <span class="detail-value">${cable.accion === 'entrada' ? 'Entrada' : 'Instalación'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Subconductos
    if (resultados.subconductos.length > 0) {
        html += '<div class="resultado-seccion">';
        html += '<h3>🛡️ Subconductos</h3>';
        resultados.subconductos.forEach(subconducto => {
            html += `
                <div class="resultado-item" onclick="irAObra('${subconducto.idObra}', 'subconductos')" style="cursor: pointer;">
                    <div class="item-header">
                        <span class="item-id">🛡️ ${subconducto.id}</span>
                        <span class="item-fecha">${formatDate(subconducto.fecha)}</span>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="detail-label">ID Obra:</span>
                            <span class="detail-value">${subconducto.idObra}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tipo:</span>
                            <span class="detail-value">${subconducto.tipoSubconducto}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Metros:</span>
                            <span class="detail-value">${subconducto.metros} m</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Acción:</span>
                            <span class="detail-value">${subconducto.accion === 'entrada' ? 'Entrada' : 'Instalación'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Devoluciones
    if (resultados.devoluciones.length > 0) {
        html += '<div class="resultado-seccion">';
        html += '<h3>↩️ Devoluciones</h3>';
        resultados.devoluciones.forEach(devolucion => {
            const totalBobinas = devolucion.bobinas ? devolucion.bobinas.length : 0;
            html += `
                <div class="resultado-item" onclick="irAObra('${devolucion.idObra}', 'devoluciones')" style="cursor: pointer;">
                    <div class="item-header">
                        <span class="item-id">↩️ ${devolucion.id}</span>
                        <span class="item-fecha">${formatDate(devolucion.fecha)}</span>
                    </div>
                    <div class="item-details">
                        <div class="detail-item">
                            <span class="detail-label">ID Obra:</span>
                            <span class="detail-value">${devolucion.idObra}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Bobinas:</span>
                            <span class="detail-value">${totalBobinas}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Instalación:</span>
                            <span class="detail-value">${devolucion.tipoInstalacion}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Función para ir a la obra encontrada
function irAObra(idObra, pestana) {
    cerrarModalBuscador();
    cambiarTab(pestana);
    mostrarToast(`Navegando a: ${idObra}`, 'info');
}

function calcularTotalMetrosDevolucion(devolucion) {
    if (!devolucion.bobinas) return 0;
    return devolucion.bobinas.reduce((total, bobina) => total + (parseFloat(bobina.metros) || 0), 0);
}

function exportarDatosSimple() {
    try {
        // Crear datos de backup
        const datos = {
            timestamp: new Date().toISOString(),
            albaranes: albaranes,
            cables: cables,
            subconductos: subconductos,
            devoluciones: devoluciones
        };
        
        // Descargar archivo
        const blob = new Blob([JSON.stringify(datos, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('✅ Datos exportados correctamente');
    } catch (error) {
        alert('❌ Error al exportar: ' + error.message);
    }
}

function abrirImportar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const archivo = e.target.files[0];
        if (archivo) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    if (confirm('¿Seguro que quieres importar estos datos? Esto reemplazará todos los datos actuales.')) {
                        albaranes = datos.albaranes || [];
                        cables = datos.cables || [];
                        subconductos = datos.subconductos || [];
                        devoluciones = datos.devoluciones || [];
                        
                        // Guardar datos
                        guardarAlbaranes();
                        guardarMateriales();
                        guardarDevoluciones();
                        
                        // Actualizar interfaz
                        actualizarContadores();
                        mostrarAlbaranes();
                        actualizarStockDisplay('cable');
                        actualizarStockDisplay('subconducto');
                        mostrarDevoluciones();
                        
                        alert('✅ Datos importados correctamente');
                    }
                } catch (error) {
                    alert('❌ Error al leer el archivo: ' + error.message);
                }
            };
            reader.readAsText(archivo);
        }
    };
    input.click();
}

// ===== FORMATO DE FECHA =====
function formatDate(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES');
}