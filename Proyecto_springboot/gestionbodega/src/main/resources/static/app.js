// Referencias a los elementos del DOM
const loginForm = document.getElementById('loginForm');
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginMensaje = document.getElementById('loginMensaje');
const btnDescargarReporte = document.getElementById('btnDescargarReporte');
const btnCerrarSesion = document.getElementById('btnCerrarSesion');
const userLogueado = document.getElementById('userLogueado');

// Verificar si ya hay un token guardado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        mostrarPanelAdmin();
    }
});

// Evento de Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            // Suponiendo que tu endpoint devuelve el token como un texto plano o un JSON { "token": "..." }
            // Ajusta esto dependiendo de cómo estructuraste la respuesta en tu AuthController
            const data = await response.text(); 
            
            localStorage.setItem('jwt_token', data);
            localStorage.setItem('username', username);
            mostrarPanelAdmin();
            loginMensaje.innerText = '';
        } else {
            loginMensaje.innerText = 'Credenciales incorrectas.';
        }
    } catch (error) {
        loginMensaje.innerText = 'Error al conectar con el servidor.';
    }
});

// Evento para descargar el reporte
btnDescargarReporte.addEventListener('click', async () => {
    const token = localStorage.getItem('jwt_token');
    
    try {
        const response = await fetch('/reportes/auditoria/txt', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Inyectamos el token aquí
            }
        });

        if (response.ok) {
            // Proceso para descargar un archivo desde memoria en el navegador
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
            alert('No tienes permisos para descargar este reporte o el token expiró.');
        }
    } catch (error) {
        alert('Error al descargar el archivo.');
    }
});

// Cerrar sesión
btnCerrarSesion.addEventListener('click', () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('username');
    loginPanel.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    loginForm.reset();
});

function mostrarPanelAdmin() {
    loginPanel.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    userLogueado.innerText = localStorage.getItem('username');
}