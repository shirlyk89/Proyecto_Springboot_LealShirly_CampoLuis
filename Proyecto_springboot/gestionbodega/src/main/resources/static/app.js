// =========================================================
// CONFIGURACIÓN GLOBAL Y ESTADO
// =========================================================
const API_URL = 'http://localhost:8080/api'; // Ajusta al puerto de tu Spring Boot

let currentUser = null;
let currentToken = localStorage.getItem('jwt_token');
let currentRole = localStorage.getItem('user_role');

// Elementos del DOM - Navegación y Layout
const mainNavbar = document.getElementById('mainNavbar');
const systemPanel = document.getElementById('systemPanel');
const sectionAuth = document.getElementById('section-auth');
const navLinks = document.querySelectorAll('.nav-link');

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    configurarEventosNavegacion();
    configurarEventosAuth();
    configurarEventosModulos();
});

// =========================================================
// UTILIDADES PARA API (FETCH CON JWT)
// =========================================================
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        // Manejo de errores de autenticación
        if (response.status === 401 || response.status === 403) {
            cerrarSesion();
            throw new Error('Sesión expirada o sin permisos');
        }

        const data = await response.json().catch(() => ({})); 
        if (!response.ok) throw new Error(data.message || 'Error en la petición');
        return data;
    } catch (error) {
        console.error('Error API:', error);
        alert(error.message);
        throw error;
    }
}

// =========================================================
// NAVEGACIÓN Y SESIÓN (SPA LIGERA)
// =========================================================
function verificarSesion() {
    currentToken = localStorage.getItem('jwt_token');
    currentRole = localStorage.getItem('user_role');
    const username = localStorage.getItem('username');

    if (currentToken) {
        // Mostrar sistema, ocultar login
        sectionAuth.classList.add('hidden');
        mainNavbar.classList.remove('hidden');
        systemPanel.classList.remove('hidden');
        
        // Setear datos de usuario en Navbar
        document.getElementById('userLogueado').textContent = username;
        document.getElementById('rolLogueado').textContent = currentRole;

        // Control de Rol para Auditoría y botones
        if (currentRole === 'ADMIN') {
            document.getElementById('navAuditoria').classList.remove('hidden');
        } else {
            document.getElementById('navAuditoria').classList.add('hidden');
        }

        cargarSeccion('dashboard');
    } else {
        // Mostrar login, ocultar sistema
        sectionAuth.classList.remove('hidden');
        mainNavbar.classList.add('hidden');
        systemPanel.classList.add('hidden');
    }
}

function cargarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
    
    // Mostrar la seleccionada
    document.getElementById(`section-${seccionId}`).classList.remove('hidden');

    // Actualizar estado activo en navbar
    navLinks.forEach(link => {
        if (link.dataset.section === seccionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Cargar datos según la sección
    if (seccionId === 'bodegas') cargarBodegas();
    if (seccionId === 'productos') cargarProductos();
    if (seccionId === 'movimientos') cargarMovimientosYFormulario();
    if (seccionId === 'auditoria' && currentRole === 'ADMIN') cargarAuditoria();
}

function configurarEventosNavegacion() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            cargarSeccion(e.target.dataset.section);
        });
    });

    document.getElementById('navBtnLogout').addEventListener('click', cerrarSesion);
}

function cerrarSesion() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    verificarSesion();
}

// =========================================================
// MÓDULO: AUTENTICACIÓN (LOGIN / REGISTRO)
// =========================================================
function configurarEventosAuth() {
    // Toggle entre Login y Registro
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('registerCard').classList.remove('hidden');
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerCard').classList.add('hidden');
        document.getElementById('loginCard').classList.remove('hidden');
    });

    // Submit Login
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const mensaje = document.getElementById('loginMensaje');
        
        try {
            // Ejemplo de llamada real:
            // const res = await fetchAPI('/auth/login', 'POST', { username, password });
            
            // SIMULACIÓN PARA PRUEBAS (Reemplaza por el código de arriba)
            if (username && password) {
                const simulacionAdmin = username.toLowerCase().includes('admin');
                localStorage.setItem('jwt_token', 'token_simulado_123');
                localStorage.setItem('user_role', simulacionAdmin ? 'ADMIN' : 'USER');
                localStorage.setItem('username', username);
                verificarSesion();
            } else {
                throw new Error('Credenciales inválidas');
            }
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });

    // Submit Registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const rol = document.getElementById('regRol').value;
        const mensaje = document.getElementById('registerMensaje');

        try {
            // await fetchAPI('/auth/register', 'POST', { username, password, rol });
            alert('Usuario registrado con éxito. Por favor inicia sesión.');
            document.getElementById('showLogin').click();
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });
}

// =========================================================
// MÓDULO: BODEGAS
// =========================================================
function configurarEventosModulos() {
    // Toggle formularios
    document.getElementById('btnNuevaBodega').addEventListener('click', () => {
        document.getElementById('formBodega').reset();
        document.getElementById('bodegaId').value = '';
        document.getElementById('formBodegaContainer').classList.toggle('hidden');
    });
    
    document.getElementById('btnCancelarBodega').addEventListener('click', () => {
        document.getElementById('formBodegaContainer').classList.add('hidden');
    });

    // Toggle formulario Productos
    document.getElementById('btnNuevoProducto').addEventListener('click', () => {
        document.getElementById('formProducto').reset();
        document.getElementById('productoId').value = '';
        document.getElementById('formProductoContainer').classList.toggle('hidden');
    });

    document.getElementById('btnCancelarProducto').addEventListener('click', () => {
        document.getElementById('formProductoContainer').classList.add('hidden');
    });

    // Filtros
    document.getElementById('filtroStockBajo').addEventListener('change', cargarProductos);
    document.getElementById('btnFiltrarMovimientos').addEventListener('click', cargarMovimientosYFormulario);
    
    // Descarga Reporte
    document.getElementById('btnDescargarReporte').addEventListener('click', descargarReporteTxt);
}

async function cargarBodegas() {
    const tbody = document.getElementById('tablaBodegasBody');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    
    try {
        // const bodegas = await fetchAPI('/bodegas');
        
        // Simulación de datos
        const bodegas = [
            { id: 1, nombre: 'Bodega Central', ubicacion: 'Norte', capacidad: 1000, encargado: 'Juan Pérez' },
            { id: 2, nombre: 'Bodega Sur', ubicacion: 'Sur', capacidad: 500, encargado: 'Ana Gómez' }
        ];

        tbody.innerHTML = '';
        bodegas.forEach(b => {
            const btnEliminar = currentRole === 'ADMIN' 
                ? `<button class="btn-outline btn-sm btn-danger" onclick="eliminarBodega(${b.id})">Eliminar</button>` 
                : '';
                
            tbody.innerHTML += `
                <tr>
                    <td>${b.nombre}</td>
                    <td>${b.ubicacion}</td>
                    <td>${b.capacidad}</td>
                    <td>${b.encargado}</td>
                    <td class="col-acciones acciones-flex">
                        <button class="btn-outline btn-sm" onclick="editarBodega(${b.id})">Editar</button>
                        ${btnEliminar}
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
    }
}

// =========================================================
// MÓDULO: PRODUCTOS
// =========================================================
async function cargarProductos() {
    const tbody = document.getElementById('tablaProductosBody');
    const soloStockBajo = document.getElementById('filtroStockBajo').checked;
    
    try {
        // Lógica de URL con parámetros
        // let url = '/productos';
        // if (soloStockBajo) url += '?stockMaximo=9';
        // const productos = await fetchAPI(url);

        // Simulación
        let productos = [
            { id: 1, nombre: 'Laptop Dell', categoria: 'Electrónica', stock: 15, precio: 1200.50 },
            { id: 2, nombre: 'Teclado Mecánico', categoria: 'Accesorios', stock: 5, precio: 85.00 },
            { id: 3, nombre: 'Monitor 24"', categoria: 'Electrónica', stock: 8, precio: 210.00 }
        ];

        if (soloStockBajo) productos = productos.filter(p => p.stock < 10);

        tbody.innerHTML = '';
        productos.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td style="color: ${p.stock < 10 ? 'var(--danger-color)' : 'inherit'}">${p.stock}</td>
                    <td>$${p.precio.toFixed(2)}</td>
                    <td class="col-acciones acciones-flex">
                        <button class="btn-outline btn-sm" onclick="editarProducto(${p.id})">Editar</button>
                        <button class="btn-outline btn-sm btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error(error);
    }
}

// =========================================================
// MÓDULO: MOVIMIENTOS
// =========================================================
async function cargarMovimientosYFormulario() {
    // 1. Cargar selects del formulario (Bodegas y Productos)
    // const productos = await fetchAPI('/productos');
    // const bodegas = await fetchAPI('/bodegas');
    
    const movProducto = document.getElementById('movProducto');
    const movBodegaOrigen = document.getElementById('movBodegaOrigen');
    const movBodegaDestino = document.getElementById('movBodegaDestino');
    
    // Simulación llenado de selects
    movProducto.innerHTML = '<option value="1">Laptop Dell</option><option value="2">Teclado Mecánico</option>';
    movBodegaOrigen.innerHTML = '<option value="">Ninguna (Entrada nueva)</option><option value="1">Bodega Central</option>';
    movBodegaDestino.innerHTML = '<option value="1">Bodega Central</option><option value="2">Bodega Sur</option>';

    // 2. Cargar tabla con filtros de fecha
    const fechaDesde = document.getElementById('filtroMovDesde').value;
    const fechaHasta = document.getElementById('filtroMovHasta').value;
    
    const tbody = document.getElementById('tablaMovimientosBody');
    // let url = `/movimientos?desde=${fechaDesde}&hasta=${fechaHasta}`;
    // const movimientos = await fetchAPI(url);
    
    // Simulación
    const movimientos = [
        { fecha: '2023-10-25', tipo: 'ENTRADA', producto: 'Laptop Dell', origen: '-', destino: 'Bodega Central', cantidad: 10 },
        { fecha: '2023-10-26', tipo: 'TRANSFERENCIA', producto: 'Teclado Mecánico', origen: 'Bodega Central', destino: 'Bodega Sur', cantidad: 2 }
    ];

    tbody.innerHTML = '';
    movimientos.forEach(m => {
        tbody.innerHTML += `
            <tr>
                <td>${m.fecha}</td>
                <td><span class="badge-rol">${m.tipo}</span></td>
                <td>${m.producto}</td>
                <td>${m.origen}</td>
                <td>${m.destino}</td>
                <td>${m.cantidad}</td>
            </tr>
        `;
    });
}

// =========================================================
// MÓDULO: AUDITORÍA Y REPORTES
// =========================================================
async function cargarAuditoria() {
    const tbody = document.getElementById('tablaAuditoriaBody');
    // const auditorias = await fetchAPI('/auditoria');
    
    // Simulación
    const auditorias = [
        { fecha: '2023-10-26 14:30', usuario: 'admin', operacion: 'UPDATE', entidad: 'Producto', detalle: 'Actualizó precio ID 1' },
        { fecha: '2023-10-26 15:10', usuario: 'juan', operacion: 'CREATE', entidad: 'Movimiento', detalle: 'Creó entrada ID 5' }
    ];

    tbody.innerHTML = '';
    auditorias.forEach(a => {
        tbody.innerHTML += `
            <tr>
                <td>${a.fecha}</td>
                <td>${a.usuario}</td>
                <td style="color: var(--accent-cyan)">${a.operacion}</td>
                <td>${a.entidad}</td>
                <td>${a.detalle}</td>
            </tr>
        `;
    });

    document.getElementById('reporteStockBodegas').innerHTML = '<p>Bodega Central: 1200 items<br>Bodega Sur: 450 items</p>';
    document.getElementById('reporteProductosMovidos').innerHTML = '<p>1. Laptop Dell<br>2. Teclado Mecánico</p>';
}

function descargarReporteTxt() {
    // Generar archivo de texto basado en los datos mostrados
    const texto = "--- REPORTE DE SISTEMA DE GESTIÓN ---\nGenerado el: " + new Date().toLocaleString() + "\n\nStock Total:\nBodega Central: 1200\nBodega Sur: 450\n";
    
    const blob = new Blob([texto], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte_inventario.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Funciones placeholder para los botones de las tablas
window.editarBodega = (id) => { console.log('Editar bodega', id); document.getElementById('formBodegaContainer').classList.remove('hidden'); };
window.eliminarBodega = (id) => { if(confirm('¿Eliminar bodega?')) console.log('Eliminar bodega', id); };
window.editarProducto = (id) => { console.log('Editar producto', id); document.getElementById('formProductoContainer').classList.remove('hidden'); };
window.eliminarProducto = (id) => { if(confirm('¿Eliminar producto?')) console.log('Eliminar producto', id); };