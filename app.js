// ===== VARIABLES GLOBALES =====
let albaranes = [];
let albaranSeleccionado = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    cargarAlbaranes();
    configurarEventListeners();
    establecerFechaActual();
    actualizarContadores();
    mostrarAlbaranes();
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

    // Modal recepción
    document.querySelectorAll('input[name="estadoRecepcion"]').forEach(radio => {
        radio.addEventListener('change', toggleDetalleFaltante);
    });

    // Cerrar modales con clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
                cerrarModalRecepcion();
            }
        });
    });

    // Cerrar modales con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarModalRecepcion();
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

    // Actualizar albaranes mostrados
    mostrarAlbaranes();
}

function actualizarContadores() {
    const pendientes = albaranes.filter(a => a.estado === 'pendiente').length;
    const recibidos = albaranes.filter(a => a.estado === 'recibido').length;
    const faltantes = albaranes.filter(a => a.estado === 'faltante').length;

    document.getElementById('count-pendientes').textContent = pendientes;
    document.getElementById('count-recibidos').textContent = recibidos;
    document.getElementById('count-faltantes').textContent = faltantes;
}

// ===== GESTIÓN DE ALBARANES =====
function crearAlbaran(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const albaran = {
        id: generarIdAlbaran(),
        idObra: formData.get('idObra'),
        fecha: formData.get('fecha'),
        cuentaCargo: formData.get('cuentaCargo'),
        tipoInstalacion: formData.get('tipoInstalacion'),
        observaciones: formData.get('observaciones') || '',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString(),
        fechaRecepcion: null,
        materialFaltante: null
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
    const tabActiva = document.querySelector('.tab-btn.active').dataset.tab;
    const contenedor = document.getElementById(`lista-${tabActiva}`);
    
    let albaranesMostrar = [];
    
    switch(tabActiva) {
        case 'pendientes':
            albaranesMostrar = albaranes.filter(a => a.estado === 'pendiente');
            break;
        case 'recibidos':
            albaranesMostrar = albaranes.filter(a => a.estado === 'recibido');
            break;
        case 'faltantes':
            albaranesMostrar = albaranes.filter(a => a.estado === 'faltante');
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
    const estadoClass = albaran.estado === 'pendiente' ? 'status-pendiente' : 
                       albaran.estado === 'recibido' ? 'status-recibido' : 'status-faltante';
    const estadoText = albaran.estado === 'pendiente' ? 'Pendiente' : 
                      albaran.estado === 'recibido' ? 'Recibido' : 'Material Faltante';

    let materialFaltanteHtml = '';
    if (albaran.estado === 'faltante' && albaran.materialFaltante) {
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

    let accionesHtml = '';
    if (albaran.estado === 'pendiente') {
        accionesHtml = `
            <div class="albaran-actions">
                <button class="btn btn-success" onclick="abrirModalRecepcion('${albaran.id}')">
                    ✅ Material Recibido
                </button>
                <button class="btn btn-secondary" onclick="eliminarAlbaran('${albaran.id}')">
                    🗑️ Eliminar
                </button>
            </div>
        `;
    } else {
        accionesHtml = `
            <div class="albaran-actions">
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
                ${fechaRecepcionHtml}
                ${materialFaltanteHtml}
                ${observacionesHtml}
            </div>
            ${accionesHtml}
        </div>
    `;
}

// ===== MODALES =====
function abrirModalNuevoAlbaran() {
    document.getElementById('modalNuevoAlbaran').classList.add('active');
    document.getElementById('idObra').focus();
}

function cerrarModal() {
    document.getElementById('modalNuevoAlbaran').classList.remove('active');
    document.getElementById('formNuevoAlbaran').reset();
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
    albaranSeleccionado.estado = estadoRecepcion === 'completo' ? 'recibido' : 'faltante';
    albaranSeleccionado.fechaRecepcion = new Date().toISOString();
    if (materialFaltante.trim()) {
        albaranSeleccionado.materialFaltante = materialFaltante.trim();
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

// ===== UTILIDADES =====
function establecerFechaActual() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').value = hoy;
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

// ===== REPORTES PDF =====
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
        
        doc.text('ID Albarán', 22, yPos - 2);
        doc.text('ID Obra', 55, yPos - 2);
        doc.text('Fecha', 85, yPos - 2);
        doc.text('Tipo', 110, yPos - 2);
        doc.text('Estado', 135, yPos - 2);
        doc.text('Cuenta', 160, yPos - 2);
        
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
            
            doc.text(albaran.id.substring(0, 10), 22, yPos - 2);
            doc.text(albaran.idObra.substring(0, 12), 55, yPos - 2);
            doc.text(fecha, 85, yPos - 2);
            doc.text(albaran.tipoInstalacion, 110, yPos - 2);
            doc.text(estado, 135, yPos - 2);
            doc.text(albaran.cuentaCargo.substring(0, 10), 160, yPos - 2);
            
            yPos += 8;
        });
        
        yPos += 15;
    }
    
    // Generar según el tipo
    switch(tipo) {
        case 'pendientes':
            const pendientes = albaranes.filter(a => a.estado === 'pendiente');
            agregarTabla(pendientes, 'Albaranes Pendientes');
            break;
            
        case 'recibidos':
            const recibidos = albaranes.filter(a => a.estado === 'recibido');
            agregarTabla(recibidos, 'Albaranes Recibidos');
            break;
            
        case 'faltantes':
            const faltantes = albaranes.filter(a => a.estado === 'faltante');
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
            
        case 'completo':
            // Resumen general
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Resumen General', 20, yPos);
            yPos += 15;
            
            const total = albaranes.length;
            const pendientesCount = albaranes.filter(a => a.estado === 'pendiente').length;
            const recibidosCount = albaranes.filter(a => a.estado === 'recibido').length;
            const faltantesCount = albaranes.filter(a => a.estado === 'faltante').length;
            
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