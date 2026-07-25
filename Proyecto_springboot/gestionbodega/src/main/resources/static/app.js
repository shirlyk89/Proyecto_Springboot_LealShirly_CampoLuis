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

            mensaje.textContent = "Conectando al servidor...";
            
            // Petición real usando la función fetchAPI que ya configuramos
            const res = await fetchAPI('/auth/login', 'POST', { 
                username: username, 
                password: password 
            });
            localStorage.setItem('jwt_token', res.token);
            localStorage.setItem('user_role', res.rol);
            localStorage.setItem('username', username);
            
            // 3. Entramos al sistema
            verificarSesion();
           
        } catch (error) {
            mensaje.textContent = error.message || 'Credenciales inválidas';
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
        // Petición real usando tu fetchAPI conectado al backend
        const bodegas = await fetchAPI('/bodegas', 'GET');

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
        console.error("Error al cargar bodegas:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
    }
}

async function cargarBodegasSelect() {
    const selectBodega = document.getElementById('prodBodega');
    if (!selectBodega) return;

    try {
        const response = await fetchAPI('/api/bodegas'); // Ajusta la ruta según tu endpoint de bodegas
        if (!response.ok) {
            throw new Error('Error al cargar las bodegas');
        }

        const bodegas = await response.json();
        
        // Limpiamos opciones previas dejando solo la por defecto
        selectBodega.innerHTML = '<option value="">Seleccione una bodega...</option>';

        bodegas.forEach(bodega => {
            const option = document.createElement('option');
            option.value = bodega.id; // El ID que espera tu entidad Producto -> bodega: { id: ... }
            option.textContent = bodega.nombre; // El nombre visible para el usuario
            selectBodega.appendChild(option);
        });

    } catch (error) {
        console.error('Error al poblar el select de bodegas:', error);
    }
}


// =========================================================
// MÓDULO: BODEGAS
// =========================================================

async function cargarBodegas() {
    const tbody = document.getElementById('tablaBodegasBody');
    if (!tbody) return;

    try {
        const response = await fetchAPI('/api/bodegas');
        if (!response.ok) throw new Error('Error al cargar bodegas');

        const bodegas = await response.json();
        tbody.innerHTML = '';

        if (bodegas.length === 0) {
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
        console.error('Error:', error);
    }
}

// Controles para mostrar/ocultar el formulario de bodegas
document.getElementById('btnNuevaBodega')?.addEventListener('click', () => {
    document.getElementById('formBodega').reset();
    document.getElementById('bodegaId').value = '';
    document.getElementById('formBodegaContainer').classList.remove('hidden');
});

document.getElementById('btnCancelarBodega')?.addEventListener('click', () => {
    document.getElementById('formBodega').reset();
    document.getElementById('bodegaId').value = '';
    document.getElementById('formBodegaContainer').classList.add('hidden');
});

// Guardar o Actualizar Bodega (POST / PUT)
document.getElementById('formBodega')?.addEventListener('submit', async function(event) {
    event.preventDefault();

    const id = document.getElementById('bodegaId').value;
    const esEdicion = id !== "";

    const bodegaData = {
        nombre: document.getElementById('bodegaNombre').value.trim(),
        ubicacion: document.getElementById('bodegaUbicacion')?.value.trim() || ''
    };

    const endpoint = esEdicion ? `/api/bodegas/${id}` : '/api/bodegas';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetchAPI(endpoint, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodegaData)
        });

        if (!response.ok) throw new Error('Error al guardar la bodega');

        alert(esEdicion ? '¡Bodega actualizada exitosamente!' : '¡Bodega creada exitosamente!');
        
        document.getElementById('formBodega').reset();
        document.getElementById('bodegaId').value = '';
        document.getElementById('formBodegaContainer').classList.add('hidden');
        
        cargarBodegas();
        // Actualizamos también los selects de bodegas en otros módulos si es necesario
        if (typeof cargarBodegasSelect === 'function') cargarBodegasSelect();

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar la solicitud.');
    }
});

// Cargar datos en el formulario para editar
async function editarBodega(id) {
    try {
        const response = await fetchAPI(`/api/bodegas/${id}`);
        if (!response.ok) throw new Error('No se pudo obtener la bodega');

        const bodega = await response.json();

        document.getElementById('bodegaId').value = bodega.id;
        document.getElementById('bodegaNombre').value = bodega.nombre;
        document.getElementById('bodegaUbicacion').value = bodega.ubicacion || '';

        document.getElementById('formBodegaContainer').classList.remove('hidden');
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo cargar la bodega.');
    }
}

// Eliminar Bodega (DELETE)
async function eliminarBodega(id) {
    if (!confirm('¿Estás seguro de eliminar esta bodega? Podría afectar a los productos asociados.')) {
        return;
    }

    try {
        const response = await fetchAPI(`/api/bodegas/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('No se pudo eliminar la bodega');

        alert('Bodega eliminada correctamente');
        cargarBodegas();
        if (typeof cargarBodegasSelect === 'function') cargarBodegasSelect();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo eliminar la bodega (puede que tenga productos o movimientos vinculados).');
    }
}

// =========================================================
// MÓDULO: PRODUCTOS
// =========================================================
async function cargarProductos() {
    const tbody = document.getElementById('tablaProductosBody'); // O document.querySelector('#tablaProductosBody');
    if (!tbody) return;

    // Opcional: Verificamos si el switch/checkbox de stock bajo está activo
    const checkboxStockBajo = document.getElementById('filtroStockBajo');
    const soloStockBajo = checkboxStockBajo ? checkboxStockBajo.checked : false;

    try {
        // Seleccionamos dinámicamente la URL según el filtro de stock bajo
        const endpoint = soloStockBajo ? '/api/productos/stock-bajo' : '/api/productos';
        
        const response = await fetchAPI(endpoint);
        
        if (!response.ok) {
            throw new Error('Error al obtener la lista de productos');
        }

        const productos = await response.json();
        tbody.innerHTML = '';

        if (productos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No se encontraron productos</td></tr>`;
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
                    ${window.esAdmin ? `<button class="btn btn-sm btn-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>` : ''}
                </td>
            `;
            
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudieron cargar los productos.');
    }
}



document.getElementById('formProducto').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Recolectamos los datos adaptados a tu entidad de Java
    const productoData = {
        nombre: document.getElementById('prodNombre').value.trim(),
        descripcion: document.getElementById('prodDescripcion')?.value.trim() || '', // Si tienes el campo descripción
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value, 10),
        bodega: {
            id: parseInt(document.getElementById('prodBodega').value, 10) // ID de la bodega seleccionada
        }
    };

    try {
        const response = await fetchAPI('/api/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) {
            throw new Error('Error al registrar el producto');
        }

        alert('¡Producto creado exitosamente!');
        
        // Limpiamos el formulario y refrescamos la tabla
        document.getElementById('formProducto').reset();
        cargarProductos();

    } catch (error) {
        console.error('Error en el registro:', error);
        alert('Hubo un error al guardar el producto.');
    }
});

// Opcional: Función para consultar directamente los productos con stock bajo usando tu endpoint dedicado
async function cargarProductosStockBajo(limite = 10) {
    try {
        const response = await fetchAPI(`/api/productos/stock-bajo?limite=${limite}`);
        if (!response.ok) throw new Error('Error al filtrar stock bajo');
        
        const productosBajos = await response.json();
        console.log('Productos con stock bajo:', productosBajos); // Corregido aquí
        // Aquí puedes renderizar en una sección de alertas o modal independiente
    } catch (error) {
        console.error('Error:', error);
    }
}



async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetchAPI(`/api/productos/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el producto');
        }

        alert('Producto eliminado correctamente');
        cargarProductos(); // Refrescamos la tabla

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo eliminar el producto.');
    }
}


async function editarProducto(id) {
    try {
        const response = await fetchAPI(`/api/productos/${id}`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la información del producto');
        }

        const producto = await response.json();

        // Rellenamos los campos del formulario con los datos actuales
        document.getElementById('productoId').value = producto.id;
        document.getElementById('prodNombre').value = producto.nombre;
        document.getElementById('prodDescripcion').value = producto.descripcion || '';
        document.getElementById('prodPrecio').value = producto.precio;
        document.getElementById('prodStock').value = producto.stock;
        
        // Seleccionamos la bodega correspondiente en el <select>
        if (producto.bodega) {
            document.getElementById('prodBodega').value = producto.bodega.id;
        }

        // Mostramos el contenedor del formulario (si estaba oculto)
        document.getElementById('formProductoContainer').classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo cargar el producto para editar.');
    }
}



document.getElementById('formProducto').addEventListener('submit', async function(event) {
    event.preventDefault(); 

    const id = document.getElementById('productoId').value;
    const esEdicion = id !== ""; // Si tiene ID, estamos editando; si está vacío, es nuevo.

    const productoData = {
        nombre: document.getElementById('prodNombre').value.trim(),
        descripcion: document.getElementById('prodDescripcion')?.value.trim() || '',
        precio: parseFloat(document.getElementById('prodPrecio').value),
        stock: parseInt(document.getElementById('prodStock').value, 10),
        bodega: {
            id: parseInt(document.getElementById('prodBodega').value, 10)
        }
    };

    // Definimos la URL y el método HTTP dependiendo de si es crear o actualizar
    const endpoint = esEdicion ? `/api/productos/${id}` : '/api/productos';
    const metodo = esEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetchAPI(endpoint, {
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el producto');
        }

        alert(esEdicion ? '¡Producto actualizado exitosamente!' : '¡Producto creado exitosamente!');
        
        // Limpiamos el formulario, borramos el ID oculto y refrescamos la tabla
        document.getElementById('formProducto').reset();
        document.getElementById('productoId').value = '';
        document.getElementById('formProductoContainer').classList.add('hidden'); // Ocultar formulario si deseas
        cargarProductos();

    } catch (error) {
        console.error('Error en el guardado:', error);
        alert('Hubo un error al procesar la solicitud.');
    }
});


document.getElementById('btnNuevoProducto').addEventListener('click', function() {
    // Limpiamos el formulario por si quedó algo escrito
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = ''; // Aseguramos que no tenga ID (modo creación)
    
    // Mostramos el contenedor del formulario quitando la clase 'hidden'
    document.getElementById('formProductoContainer').classList.remove('hidden');
});

// Y de paso, si tienes el botón de "Cancelar" dentro del formulario, aprovecha y agrégale esto:
document.getElementById('btnCancelarProducto').addEventListener('click', function() {
    document.getElementById('formProducto').reset();
    document.getElementById('productoId').value = '';
    document.getElementById('formProductoContainer').classList.add('hidden'); // Oculta el formulario
});


// =========================================================
// MÓDULO: MOVIMIENTOS (Versión unificada y conectada)
// =========================================================

// 1. Cargar selects de productos y bodegas, y la tabla de movimientos
async function cargarMovimientosYFormulario() {
    const movProducto = document.getElementById('movProducto');
    const movBodegaOrigen = document.getElementById('movBodegaOrigen');
    const movBodegaDestino = document.getElementById('movBodegaDestino');
    
    // Cargar productos en el select
    if (movProducto) {
        try {
            const resProductos = await fetchAPI('/api/productos');
            if (resProductos.ok) {
                const productos = await resProductos.json();
                movProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
                productos.forEach(prod => {
                    movProducto.innerHTML += `<option value="${prod.id}">${prod.nombre} (Stock: ${prod.stock})</option>`;
                });
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Cargar bodegas en los selects de Origen y Destino
    if (movBodegaOrigen && movBodegaDestino) {
        try {
            const resBodegas = await fetchAPI('/api/bodegas');
            if (resBodegas.ok) {
                const bodegas = await resBodegas.json();
                
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

    // Cargar tabla del historial de movimientos
    const tbody = document.getElementById('tablaMovimientosBody');
    if (!tbody) return;

    try {
        const response = await fetchAPI('/api/movimientos');
        if (!response.ok) throw new Error('Error al cargar los movimientos');

        const movimientos = await response.json();
        tbody.innerHTML = '';

        if (movimientos.length === 0) {
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

// 2. Manejo del envío del formulario de movimientos (POST)
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
        const response = await fetchAPI('/api/movimientos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movimientoData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al registrar el movimiento');
        }

        alert('¡Movimiento registrado exitosamente!');
        this.reset();
        
        // Refrescamos la tabla de movimientos y la de productos para ver el stock actualizado
        cargarMovimientosYFormulario();
        if (typeof cargarProductos === 'function') cargarProductos();

    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo registrar el movimiento: ' + error.message);
    }
});

// 3. Evento para el botón de filtrar movimientos
document.getElementById('btnFiltrarMovimientos')?.addEventListener('click', function(event) {
    event.preventDefault();
    cargarMovimientosYFormulario();
});

// 4. Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarMovimientosYFormulario();
});

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