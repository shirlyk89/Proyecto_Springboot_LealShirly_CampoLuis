// Referencias a los elementos del DOM
const loginForm = document.getElementById('loginForm');
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginMensaje = document.getElementById('loginMensaje');
const navBtnLogout = document.getElementById('navBtnLogout');
const userLogueado = document.getElementById('userLogueado');

// Referencias para la navegación entre secciones (Dashboard modular)
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.app-section');

// Botones específicos existentes
const btnDescargarReporte = document.getElementById('btnDescargarReporte');

// Verificar si ya hay un token guardado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        mostrarPanelAdmin();
        cargarSeccion('dashboard'); // Vista por defecto al entrar
    }
});

// Evento de Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const rawData = await response.text();
            let token = rawData;
            try {
                const jsonObj = JSON.parse(rawData);
                token = jsonObj.token || jsonObj.jwt || jsonObj.accessToken || rawData;
            } catch (err) {}
            
            localStorage.setItem('jwt_token', token.trim());
            localStorage.setItem('username', username);
            
            mostrarPanelAdmin();
            cargarSeccion('dashboard');
            loginMensaje.innerText = '';
        } else {
            loginMensaje.innerText = 'Credenciales incorrectas. Inténtalo de nuevo.';
        }
    } catch (error) {
        loginMensaje.innerText = 'Error al conectar con el servidor.';
    }
});

// Control de navegación entre las pantallas del panel principal
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        cargarSeccion(targetSection);
    });
});

function cargarSeccion(sectionName) {
    // Ocultar todas las subsecciones del panel de administración
    sections.forEach(sec => sec.classList.add('hidden'));
    
    // Mostrar la sección seleccionada
    const activeSection = document.getElementById(`section-${sectionName}`);
    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    // Ejecutar lógica específica según la sección cargada
    if (sectionName === 'bodegas') {
        obtenerBodegas();
    } else if (sectionName === 'productos') {
        obtenerProductos();
    } else if (sectionName === 'movimientos') {
        obtenerMovimientos();
    } else if (sectionName === 'auditoria') {
        obtenerAuditoria();
    }
}

// Funciones de consumo de APIs protegidas con JWT

async function obtenerBodegas() {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch('/api/bodegas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const bodegas = await response.json();
            // Lógica para renderizar la tabla de bodegas (nombre, ubicación, capacidad, encargado)
            console.log("Bodegas cargadas:", bodegas);
        } else {
            manejarErrorToken(response);
        }
    } catch (error) {
        console.error('Error al cargar bodegas', error);
    }
}

async function obtenerProductos() {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch('/api/productos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const productos = await response.json();
            // Lógica para renderizar la tabla de productos con soporte para filtro de stock bajo (<10)
            console.log("Productos cargados:", productos);
        } else {
            manejarErrorToken(response);
        }
    } catch (error) {
        console.error('Error al cargar productos', error);
    }
}

async function obtenerMovimientos() {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch('/api/movimientos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const movimientos = await response.json();
            // Lógica para mostrar historial de movimientos y filtros por fecha[cite: 1]
            console.log("Movimientos cargados:", movimientos);
        } else {
            manejarErrorToken(response);
        }
    } catch (error) {
        console.error('Error al cargar movimientos', error);
    }
}

async function obtenerAuditoria() {
    const token = localStorage.getItem('jwt_token');
    try {
        const response = await fetch('/api/auditoria', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const auditoria = await response.json();
            // Lógica para la tabla de auditoría visible solo para ADMIN[cite: 1]
            console.log("Auditoría cargada:", auditoria);
        } else {
            manejarErrorToken(response);
        }
    } catch (error) {
        console.error('Error al cargar auditoría', error);
    }
}

// Evento para descargar el reporte de auditoría en TXT
if (btnDescargarReporte) {
    btnDescargarReporte.addEventListener('click', async () => {
        const token = localStorage.getItem('jwt_token');
        
        try {
            const response = await fetch('/api/reportes/auditoria/txt', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reporte_auditoria.txt';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert('No tienes permisos para descargar este reporte o tu sesión ha expirado.');
                cerrarSesion();
            }
        } catch (error) {
            alert('Error de conexión al intentar descargar el archivo.');
        }
    });
}

// Cerrar sesión desde el Navbar
navBtnLogout.addEventListener('click', cerrarSesion);

function cerrarSesion() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    loginPanel.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    navBtnLogout.classList.add('hidden');
    loginForm.reset();
}

function mostrarPanelAdmin() {
    loginPanel.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    navBtnLogout.classList.remove('hidden');
    userLogueado.innerText = localStorage.getItem('username');
}

function manejarErrorToken(response) {
    if (response.status === 401 || response.status === 403) {
        alert('Sesión expirada o sin permisos.');
        cerrarSesion();
    }
}