// ===== VARIABLES GLOBALES =====
let albaranes = [];
let albaranSeleccionado = null;
let cables = [];
let subconductos = [];
let devoluciones = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    cargarAlbaranes();
    cargarMateriales();
    cargarDevoluciones();
    configurarEventListeners();
    establecerFechaActual();
    actualizarContadores();
    mostrarAlbaranes();
    actualizarStockDisplay('cable');
    actualizarStockDisplay('subconducto');
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
    document.getElementById('tipoMaterialDevolucion').addEventListener('change', toggleCamposMaterial);

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
                cerrarModalCable();
                cerrarModalSubconducto();
                cerrarModalEntradaCable();
                cerrarModalEntradaSubconducto();
                cerrarModalDevolucion();
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
    const pendientes = albaranes.filter(a => a.estado === 'pendiente').length;
    const recibidos = albaranes.filter(a => a.estado === 'recibido').length;
    const faltantes = albaranes.filter(a => a.estado === 'faltante').length;
    const cableCount = cables.length;
    const subconductoCount = subconductos.length;
    const devolucionCount = devoluciones.length;

    document.getElementById('count-pendientes').textContent = pendientes;
    document.getElementById('count-recibidos').textContent = recibidos;
    document.getElementById('count-faltantes').textContent = faltantes;
    document.getElementById('count-cables').textContent = cableCount;
    document.getElementById('count-subconductos').textContent = subconductoCount;
    document.getElementById('count-devoluciones').textContent = devolucionCount;
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
        jefeObra: formData.get('jefeObra') || '',
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

// ===== GESTIÓN DE DEVOLUCIONES =====
function crearDevolucion(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const devolucion = {
        id: generarIdDevolucion(),
        idObra: formData.get('idObra'),
        metrosBobina: parseFloat(formData.get('metrosBobina')) || 0,
        entregaVacia: formData.get('entregaVacia') === 'on',
        fechaEntrega: formData.get('fecha'),
        tipoInstalacion: formData.get('tipoInstalacion'),
        tipoMaterial: formData.get('tipoMaterial'),
        numeroMatriculaCable: formData.get('numeroMatriculaCable') || '',
        metrosCableBobina: parseFloat(formData.get('metrosCableBobina')) || 0,
        numeroMatriculaVacia: formData.get('numeroMatriculaVacia') || '',
        descripcionOtroMaterial: formData.get('descripcionOtroMaterial') || '',
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
    
    let tipoMaterialText = '';
    let detallesMaterial = '';
    
    switch(devolucion.tipoMaterial) {
        case 'bobina_con_cable':
            tipoMaterialText = 'Bobina con Cable';
            detallesMaterial = `
                <div class="info-row">
                    <span class="info-label">Nº Matrícula:</span>
                    <span class="info-value">${devolucion.numeroMatriculaCable}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Metros de Cable:</span>
                    <span class="info-value">${devolucion.metrosCableBobina} m</span>
                </div>
            `;
            break;
        case 'bobina_vacia':
            tipoMaterialText = 'Bobina Vacía';
            detallesMaterial = `
                <div class="info-row">
                    <span class="info-label">Nº Matrícula:</span>
                    <span class="info-value">${devolucion.numeroMatriculaVacia}</span>
                </div>
            `;
            break;
        case 'otro':
            tipoMaterialText = 'Otro Material';
            detallesMaterial = `
                <div class="info-row">
                    <span class="info-label">Material:</span>
                    <span class="info-value">${devolucion.descripcionOtroMaterial}</span>
                </div>
            `;
            break;
    }

    let entregaVaciaText = devolucion.entregaVacia ? 'SÍ' : 'NO';

    let observacionesHtml = '';
    if (devolucion.observaciones) {
        observacionesHtml = `
            <div class="observaciones">
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
                    <span class="info-label">Metros Bobina:</span>
                    <span class="info-value">${devolucion.metrosBobina} m</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Entrega Vacía:</span>
                    <span class="info-value">${entregaVaciaText}</span>
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
                    <span class="info-label">Material:</span>
                    <span class="info-value">${tipoMaterialText}</span>
                </div>
                ${detallesMaterial}
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
}

function cerrarModalDevolucion() {
    document.getElementById('modalNuevaDevolucion').classList.remove('active');
    document.getElementById('formNuevaDevolucion').reset();
    
    // Ocultar todos los campos condicionales
    document.getElementById('camposBobinaCable').style.display = 'none';
    document.getElementById('camposBobinaVacia').style.display = 'none';
    document.getElementById('camposOtroMaterial').style.display = 'none';
}

function toggleCamposMaterial() {
    const tipoMaterial = document.getElementById('tipoMaterialDevolucion').value;
    
    // Ocultar todos los campos
    document.getElementById('camposBobinaCable').style.display = 'none';
    document.getElementById('camposBobinaVacia').style.display = 'none';
    document.getElementById('camposOtroMaterial').style.display = 'none';
    
    // Limpiar valores
    document.getElementById('numeroMatriculaCable').value = '';
    document.getElementById('metrosCableBobina').value = '';
    document.getElementById('numeroMatriculaVacia').value = '';
    document.getElementById('descripcionOtroMaterial').value = '';
    
    // Mostrar campos según la selección
    switch(tipoMaterial) {
        case 'bobina_con_cable':
            document.getElementById('camposBobinaCable').style.display = 'block';
            document.getElementById('numeroMatriculaCable').required = true;
            document.getElementById('metrosCableBobina').required = true;
            break;
        case 'bobina_vacia':
            document.getElementById('camposBobinaVacia').style.display = 'block';
            document.getElementById('numeroMatriculaVacia').required = true;
            break;
        case 'otro':
            document.getElementById('camposOtroMaterial').style.display = 'block';
            document.getElementById('descripcionOtroMaterial').required = true;
            break;
    }
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
                <button class="btn btn-secondary" onclick="eliminarMaterial('${material.tipoMaterial}', '${material.id}')">
                    🗑️ Eliminar
                </button>
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
    });
    
    return {
        recibido: totalRecibido,
        instalado: totalInstalado,
        disponible: totalRecibido - totalInstalado
    };
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
    
    const materialArray = tipoMaterial === 'cable' ? cables : subconductos;
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
    
    // Tabla detallada
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
        
        doc.text('ID', 22, yPos - 2);
        doc.text('Tipo', 45, yPos - 2);
        doc.text('Acción', 100, yPos - 2);
        doc.text('Metros', 130, yPos - 2);
        doc.text('Fecha', 155, yPos - 2);
        doc.text('Obra', 180, yPos - 2);
        
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
            const accion = material.accion === 'entrada' ? 'Entrada' : 'Instalación';
            const fecha = new Date(material.fecha).toLocaleDateString('es-ES');
            const obra = material.idObra || '-';
            
            // Ajustar texto
            const tipoText = tipo.length > 20 ? tipo.substring(0, 20) + '...' : tipo;
            const obraText = obra.length > 8 ? obra.substring(0, 8) + '...' : obra;
            
            doc.text(material.id, 22, yPos - 2);
            doc.text(tipoText, 45, yPos - 2);
            doc.text(accion, 100, yPos - 2);
            doc.text(`${material.metros}m`, 130, yPos - 2);
            doc.text(fecha, 155, yPos - 2);
            doc.text(obraText, 180, yPos - 2);
            
            yPos += 8;
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
    const bobinasConCable = devoluciones.filter(d => d.tipoMaterial === 'bobina_con_cable').length;
    const bobinasVacias = devoluciones.filter(d => d.tipoMaterial === 'bobina_vacia').length;
    const otrosMateriales = devoluciones.filter(d => d.tipoMaterial === 'otro').length;
    const entregasVacias = devoluciones.filter(d => d.entregaVacia).length;
    
    doc.setFontSize(12);
    doc.text(`Total de Devoluciones: ${totalDevoluciones}`, 25, yPos);
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
        
        // Headers
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(255, 85, 0);
        doc.rect(20, yPos - 8, 170, 8, 'F');
        
        doc.text('ID', 22, yPos - 2);
        doc.text('ID Obra', 45, yPos - 2);
        doc.text('Material', 80, yPos - 2);
        doc.text('Metros', 130, yPos - 2);
        doc.text('Fecha', 155, yPos - 2);
        doc.text('Vacía', 180, yPos - 2);
        
        yPos += 12;
        
        // Datos
        doc.setTextColor(0, 0, 0);
        devoluciones.forEach((devolucion, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 30;
            }
            
            // Alternar colores de fondo
            if (index % 2 === 0) {
                doc.setFillColor(245, 241, 230);
                doc.rect(20, yPos - 8, 170, 8, 'F');
            }
            
            const fecha = new Date(devolucion.fechaEntrega).toLocaleDateString('es-ES');
            const tipoMaterial = devolucion.tipoMaterial === 'bobina_con_cable' ? 'C/B cable' : 
                               devolucion.tipoMaterial === 'bobina_vacia' ? 'Bobina vacía' : 'Otro';
            const entregaVacia = devolucion.entregaVacia ? 'SÍ' : 'NO';
            
            // Ajustar texto
            const obraText = devolucion.idObra.length > 12 ? devolucion.idObra.substring(0, 12) + '...' : devolucion.idObra;
            const materialText = tipoMaterial.length > 18 ? tipoMaterial.substring(0, 18) + '...' : tipoMaterial;
            
            doc.text(devolucion.id, 22, yPos - 2);
            doc.text(obraText, 45, yPos - 2);
            doc.text(materialText, 80, yPos - 2);
            doc.text(`${devolucion.metrosBobina}m`, 130, yPos - 2);
            doc.text(fecha, 155, yPos - 2);
            doc.text(entregaVacia, 180, yPos - 2);
            
            yPos += 8;
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
        
        doc.text('ID Obra', 22, yPos - 2);
        doc.text('Fecha', 85, yPos - 2);
        doc.text('Tipo', 120, yPos - 2);
        doc.text('Estado', 150, yPos - 2);
        doc.text('Cuenta', 175, yPos - 2);
        
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
            
            // Ajustar texto (sin truncar ID de obra)
            const obraText = albaran.idObra; // Sin truncamiento
            const cuentaText = albaran.cuentaCargo.length > 10 ? albaran.cuentaCargo.substring(0, 10) + '...' : albaran.cuentaCargo;
            
            doc.text(obraText, 22, yPos - 2);
            doc.text(fecha, 85, yPos - 2);
            doc.text(albaran.tipoInstalacion, 120, yPos - 2);
            doc.text(estado, 150, yPos - 2);
            doc.text(cuentaText, 175, yPos - 2);
            
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
            
        case 'cables':
            generarReporteMateriales('cable');
            break;
            
        case 'subconductos':
            generarReporteMateriales('subconducto');
            break;
            
        case 'devoluciones':
            generarReporteDevoluciones();
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