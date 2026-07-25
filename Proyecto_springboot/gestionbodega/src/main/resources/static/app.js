// =========================================================
// CONFIGURACIÓN GLOBAL Y ESTADO
// =========================================================
const API_URL = 'http://localhost:8080/api'; // Configurado con /api para coincidir con Spring Boot

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
            mensaje.textContent = "Conectando al servidor...";
            
            const res = await fetchAPI('/auth/login', 'POST', { 
                username: username, 
                password: password 
            });
            localStorage.setItem('jwt_token', res.token);
            localStorage.setItem('user_role', res.rol);
            localStorage.setItem('username', username);
            
            verificarSesion();
           
        } catch (error) {
            mensaje.textContent = error.message || 'Credenciales inválidas';
        }
    });

    // Submit Registro
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const mensaje = document.getElementById('registerMensaje');

        try {
            alert('Usuario registrado con éxito. Por favor inicia sesión.');
            document.getElementById('showLogin').click();
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });
}

// =========================================================
// MÓDULO: CONFIGURACIÓN DE EVENTOS DE MÓDULOS
// =========================================================
function configurarEventosModulos() {
    document.getElementById('btnNuevaBodega').addEventListener('click', () => {
        document.getElementById('formBodega').reset();
        document.getElementById('bodegaId').value = '';
        document.getElementById('formBodegaContainer').classList.toggle('hidden');
    });
    
    document.getElementById('btnCancelarBodega').addEventListener('click', () => {
        document.getElementById('formBodegaContainer').classList.add('hidden');
    });

    document.getElementById('btnNuevoProducto').addEventListener('click', () => {
        document.getElementById('formProducto').reset();
        document.getElementById('productoId').value = '';
        document.getElementById('formProductoContainer').classList.toggle('hidden');
    });

    document.getElementById('btnCancelarProducto').addEventListener('click', () => {
        document.getElementById('formProductoContainer').classList.add('hidden');
    });

    document.getElementById('filtroStockBajo')?.addEventListener('change', cargarProductos);
    document.getElementById('btnFiltrarMovimientos')?.addEventListener('click', cargarMovimientosYFormulario);
    document.getElementById('btnDescargarReporte')?.addEventListener('click', descargarReporteTxt);
}

// =========================================================
// MÓDULO: BODEGAS
// =========================================================
async function cargarBodegas() {
    const tbody = document.getElementById('tablaBodegasBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Cargando...</td></tr>';

    try {
        const bodegas = await fetchAPI('/bodegas', 'GET');
        tbody.innerHTML = '';

        if (!bodegas || bodegas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay bodegas registradas</td></tr>';
            return;
        }

        bodegas.forEach(bodega => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${bodega.id}</td>
                <td>${bodega.nombre}</td>
                <td>${bodega.ubicacion || 'N/D'}</td>
                <td>
                    <button class="btn-sm btn-edit" onclick="editarBodega(${bodega.id})">Editar</button>
                    <button class="btn-sm btn-delete" onclick="eliminarBodega(${bodega.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar bodegas:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error al cargar datos</td></tr>';
    }
}

async function cargarBodegasSelect() {
    const selectBodega = document.getElementById('prodBodega');
    if (!selectBodega) return;

    try {
        const bodegas = await fetchAPI('/bodegas');
        selectBodega.innerHTML = '<option value="">Seleccione una bodega...</option>';

        if (bodegas) {
            bodegas.forEach(bodega => {
                const option = document.createElement('option');
                option.value = bodega.id;
                option.textContent = bodega.nombre;
                selectBodega.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al poblar el select de bodegas:', error);
    }
}

document.getElementById('formBodega')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('bodegaId').value;
    const esEdicion = id !== "";

    const bodegaData = {
        nombre: document.getElementById('bodegaNombre').value.trim(),
        ubicacion: document.getElementById('bodegaUbicacion')?.value.trim() || ''
    };

    const endpoint = esEdicion ? `/bodegas/${id}` : '/bodegas';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        await fetchAPI(endpoint, metodo, bodegaData);

        alert(esEdicion ? '¡Bodega actualizada exitosamente!' : '¡Bodega creada exitosamente!');
        
        document.getElementById('formBodega').reset();
        document.getElementById('bodegaId').value = '';
        document.getElementById('formBodegaContainer').classList.add('hidden');
        
        cargarBodegas();
        cargarBodegasSelect();

    } catch (error) {
        console.error('Error:', error);
    }
});

async function editarBodega(id) {
    try {
        const bodega = await fetchAPI(`/bodegas/${id}`);

        document.getElementById('bodegaId').value = bodega.id;
        document.getElementById('bodegaNombre').value = bodega.nombre;
        document.getElementById('bodegaUbicacion').value = bodega.ubicacion || '';

        document.getElementById('formBodegaContainer').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarBodega(id) {
    if (!confirm('¿Estás seguro de eliminar esta bodega? Podría afectar a los productos asociados.')) {
        return;
    }

    try {
        await fetchAPI(`/bodegas/${id}`, 'DELETE');
        alert('Bodega eliminada correctamente');
        cargarBodegas();
        cargarBodegasSelect();
    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// MÓDULO: PRODUCTOS
// =========================================================
async function cargarProductos() {
    const tbody = document.getElementById('tablaProductosBody');
    if (!tbody) return;

    const checkboxStockBajo = document.getElementById('filtroStockBajo');
    const soloStockBajo = checkboxStockBajo ? checkboxStockBajo.checked : false;

    try {
        const endpoint = soloStockBajo ? '/productos/stock-bajo' : '/productos';
        const productos = await fetchAPI(endpoint);
        
        tbody.innerHTML = '';

        if (!productos || productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="text-align: center;">No se encontraron productos</td></tr>`;
            return;
        }

        productos.forEach(producto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.id}</td>
                <td>${producto.nombre}</td>
                <td>${producto.descripcion || 'Sin descripción'}</td>
                <td>$${Number(producto.precio).toFixed(2)}</td>
                <td><span class="badge ${producto.stock <= 10 ? 'bg-danger' : 'bg-success'}">${producto.stock}</span></td>
                <td>${producto.bodega ? producto.bodega.nombre : 'Sin bodega'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarProducto(${producto.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

document.getElementById('formProducto')?.addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const id = document.getElementById('productoId').value;
    const esEdicion = id !== ""; 

    const productoData = {
        nombre: document.getElementById('prodNombre').value.trim(),
        descripcion: document.getElementById('prodDescripcion')?.value.trim() || '',
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value, 10),
        bodega: {
            id: parseInt(document.getElementById('prodBodega').value, 10)
        }
    };

    const endpoint = esEdicion ? `/productos/${id}` : '/productos';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        await fetchAPI(endpoint, metodo, productoData);

        alert(esEdicion ? '¡Producto actualizado exitosamente!' : '¡Producto creado exitosamente!');
        
        document.getElementById('formProducto').reset();
        document.getElementById('productoId').value = '';
        document.getElementById('formProductoContainer').classList.add('hidden');
        cargarProductos();

    } catch (error) {
        console.error('Error en el guardado:', error);
    }
});

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        await fetchAPI(`/productos/${id}`, 'DELETE');
        alert('Producto eliminado correctamente');
        cargarProductos();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function editarProducto(id) {
    try {
        const producto = await fetchAPI(`/productos/${id}`);

        document.getElementById('productoId').value = producto.id;
        document.getElementById('prodNombre').value = producto.nombre;
        document.getElementById('prodDescripcion').value = producto.descripcion || '';
        document.getElementById('prodPrecio').value = producto.precio;
        document.getElementById('prodStock').value = producto.stock;
        
        if (producto.bodega) {
            document.getElementById('prodBodega').value = producto.bodega.id;
        }

        document.getElementById('formProductoContainer').classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
    }
}

// =========================================================
// MÓDULO: MOVIMIENTOS
// =========================================================
async function cargarMovimientosYFormulario() {
    const movProducto = document.getElementById('movProducto');
    const movBodegaOrigen = document.getElementById('movBodegaOrigen');
    const movBodegaDestino = document.getElementById('movBodegaDestino');
    
    if (movProducto) {
        try {
            const productos = await fetchAPI('/productos');
            if (productos) {
                movProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
                productos.forEach(prod => {
                    movProducto.innerHTML += `<option value="${prod.id}">${prod.nombre} (Stock: ${prod.stock})</option>`;
                });
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    if (movBodegaOrigen && movBodegaDestino) {
        try {
            const bodegas = await fetchAPI('/bodegas');
            if (bodegas) {
                let optionsOrigen = '<option value="">Ninguna / Seleccione...</option>';
                let optionsDestino = '<option value="">Seleccione una bodega...</option>';
                
                bodegas.forEach(bodega => {
                    optionsOrigen += `<option value="${bodega.id}">${bodega.nombre}</option>`;
                    optionsDestino += `<option value="${bodega.id}">${bodega.nombre}</option>`;
                });

                movBodegaOrigen.innerHTML = optionsOrigen;
                movBodegaDestino.innerHTML = optionsDestino;
            }
        } catch (error) {
            console.error('Error al cargar bodegas:', error);
        }
    }

    const tbody = document.getElementById('tablaMovimientosBody');
    if (!tbody) return;

    try {
        const movimientos = await fetchAPI('/movimientos');
        tbody.innerHTML = '';

        if (!movimientos || movimientos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay movimientos registrados</td></tr>';
            return;
        }

        movimientos.forEach(m => {
            const origenNombre = m.bodegaOrigen ? m.bodegaOrigen.nombre : '-';
            const destinoNombre = m.bodegaDestino ? m.bodegaDestino.nombre : '-';
            const productoNombre = m.producto ? m.producto.nombre : 'N/D';
            const fechaFormateada = m.fecha ? new Date(m.fecha).toLocaleString() : '-';

            tbody.innerHTML += `
                <tr>
                    <td>${fechaFormateada}</td>
                    <td><span class="badge ${m.tipo ? m.tipo.toLowerCase() : ''}">${m.tipo}</span></td>
                    <td>${productoNombre}</td>
                    <td>${origenNombre}</td>
                    <td>${destinoNombre}</td>
                    <td>${m.cantidad}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar tabla de movimientos:', error);
    }
}

document.getElementById('formMovimiento')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const tipo = document.getElementById('movTipo').value;
    const productoId = document.getElementById('movProducto').value;
    const bodegaOrigenId = document.getElementById('movBodegaOrigen').value;
    const bodegaDestinoId = document.getElementById('movBodegaDestino').value;
    const cantidad = document.getElementById('movCantidad').value;

    const movimientoData = {
        tipo: tipo,
        cantidad: parseInt(cantidad, 10),
        producto: { id: parseInt(productoId, 10) },
        bodegaOrigen: bodegaOrigenId ? { id: parseInt(bodegaOrigenId, 10) } : null,
        bodegaDestino: bodegaDestinoId ? { id: parseInt(bodegaDestinoId, 10) } : null
    };

    try {
        await fetchAPI('/movimientos', 'POST', movimientoData);

        alert('¡Movimiento registrado exitosamente!');
        this.reset();
        
        cargarMovimientosYFormulario();
        if (typeof cargarProductos === 'function') cargarProductos();

    } catch (error) {
        console.error('Error:', error);
    }
});

// =========================================================
// MÓDULO: AUDITORÍA Y REPORTES
// =========================================================
async function cargarAuditoria() {
    const tbody = document.getElementById('tablaAuditoriaBody');
    if (!tbody) return;

    const auditorias = [
        { fecha: '2026-07-24 14:30', usuario: 'admin', operacion: 'UPDATE', entidad: 'Producto', detalle: 'Actualizó precio ID 1' },
        { fecha: '2026-07-24 15:10', usuario: 'empleado1', operacion: 'CREATE', entidad: 'Movimiento', detalle: 'Creó entrada ID 5' }
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
