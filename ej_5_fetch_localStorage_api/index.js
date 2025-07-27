/**
 * ======================================================
 * ELEMENTOS DEL DOM - Seleccionamos todos los elementos importantes
 * ======================================================
 */
const seccionLogin = document.getElementById('seccion-login');
const seccionProtegida = document.getElementById('seccion-protegida');
const formularioLogin = document.getElementById('formulario-login');
const mensajeError = document.getElementById('mensaje-error');
const nombreUsuario = document.getElementById('nombre-usuario');
const idUsuario = document.getElementById('id-usuario');
const avatarUsuario = document.getElementById('avatar-usuario');
const botonCerrarSesion = document.getElementById('boton-cerrar-sesion');
const infoUsuario = document.getElementById('info-usuario');
const infoToken = document.getElementById('info-token');
const botonBuscarId = document.getElementById('boton-buscar-id');
const filtroId = document.getElementById('filtro-id');
const botonCargarTodos = document.getElementById('boton-cargar-todos');
const botonOcultarUsuarios = document.getElementById('boton-ocultar-usuarios');
const contenedorTodosUsuarios = document.getElementById('contenedor-todos-usuarios');
const listaUsuarios = document.getElementById('lista-usuarios');
const totalUsuarios = document.getElementById('total-usuarios');

// URL de la API de autenticación y usuarios
const URL_AUTH = 'https://dummyjson.com/auth/login';
const URL_USUARIOS = 'https://dummyjson.com/users';

/**
 * ======================================================
 * FUNCIÓN: Verificar Autenticación
 * DESCRIPCIÓN: Comprueba si el usuario ya está autenticado
 *              al cargar la página y muestra la sección adecuada
 * ======================================================
 */
function verificarAutenticacion() {
    // Obtenemos los datos de usuario del almacenamiento local
    const usuario = localStorage.getItem('usuario');
    const token = localStorage.getItem('token');
    
    // Si existe un token, mostramos la sección protegida
    if (token) {
        mostrarSeccionProtegida();
        mostrarDatosUsuario(JSON.parse(usuario), token);
    }
}

/**
 * ======================================================
 * FUNCIÓN: Mostrar Sección Protegida
 * DESCRIPCIÓN: Oculta el formulario de login y muestra
 *              el contenido protegido
 * ======================================================
 */
function mostrarSeccionProtegida() {
    seccionLogin.classList.add('oculto');
    seccionProtegida.classList.remove('oculto');
}

/**
 * ======================================================
 * FUNCIÓN: Mostrar Formulario Login
 * DESCRIPCIÓN: Oculta el contenido protegido y muestra
 *              el formulario de inicio de sesión
 * ======================================================
 */
function mostrarFormularioLogin() {
    seccionProtegida.classList.add('oculto');
    seccionLogin.classList.remove('oculto');
}

/**
 * ======================================================
 * FUNCIÓN: Manejar Login
 * DESCRIPCIÓN: Procesa el formulario de inicio de sesión
 *              y autentica al usuario con la API
 * @param {Event} evento - Evento de envío del formulario
 * ======================================================
 */
async function manejarLogin(evento) {
    // Prevenimos el comportamiento por defecto del formulario
    evento.preventDefault();
    
    // Obtenemos los valores de los campos de usuario y contraseña
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // Realizamos la petición a la API de autenticación
        const respuesta = await fetch(URL_AUTH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        // Convertimos la respuesta a formato JSON
        const datos = await respuesta.json();
        
        // Verificamos si la autenticación fue exitosa
        if (datos.id) {
            // Guardamos los datos en el almacenamiento local
            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos));
            
            // Mostramos la sección protegida
            mostrarSeccionProtegida();
            mostrarDatosUsuario(datos, datos.token);
            
            // Limpiamos el formulario y ocultamos mensajes de error
            formularioLogin.reset();
            mensajeError.classList.add('oculto');
        } else {
            // Mostramos mensaje de error específico
            const mensaje = datos.message || 'Credenciales incorrectas. Intente de nuevo.';
            mostrarError(mensaje);
        }
    } catch (error) {
        // Mostramos error de conexión si hay problemas de red
        console.error('Error al autenticar:', error);
        mostrarError('Error de conexión. Intente nuevamente.');
    }
}

/**
 * ======================================================
 * FUNCIÓN: Mostrar Error
 * DESCRIPCIÓN: Muestra un mensaje de error en el formulario
 * @param {string} mensaje - Mensaje de error a mostrar
 * ======================================================
 */
function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.classList.remove('oculto');
}

/**
 * ======================================================
 * FUNCIÓN: Mostrar Datos Usuario
 * DESCRIPCIÓN: Muestra los datos del usuario autenticado
 *              en la sección protegida
 * @param {Object} usuario - Datos del usuario
 * @param {string} token - Token de autenticación
 * ======================================================
 */
function mostrarDatosUsuario(usuario, token) {
    // Mostramos el nombre del usuario en el encabezado
    nombreUsuario.textContent = `${usuario.firstName} ${usuario.lastName}`;
    idUsuario.textContent = usuario.id;
    
    // Mostramos el avatar del usuario si está disponible
    if (usuario.image) {
        avatarUsuario.src = usuario.image;
        avatarUsuario.alt = `Avatar de ${usuario.firstName} ${usuario.lastName}`;
    }
    
    // Mostramos información detallada del usuario
    infoUsuario.innerHTML = `
        <p><span class="dato-etiqueta">Nombre:</span> ${usuario.firstName} ${usuario.lastName}</p>
        <p><span class="dato-etiqueta">Correo:</span> ${usuario.email}</p>
        <p><span class="dato-etiqueta">Nombre de usuario:</span> ${usuario.username}</p>
        <p><span class="dato-etiqueta">Teléfono:</span> ${usuario.phone}</p>
        <p><span class="dato-etiqueta">Edad:</span> ${usuario.age || 'N/A'}</p>
        <p><span class="dato-etiqueta">Género:</span> ${usuario.gender}</p>
    `;
    
    // Mostramos información del token de autenticación
    infoToken.innerHTML = `
        <p><span class="dato-etiqueta">Token:</span> ${token.substring(0, 20)}...</p>
        <p><span class="dato-etiqueta">ID de Usuario:</span> ${usuario.id}</p>
        <p><span class="dato-etiqueta">Fecha de Nacimiento:</span> ${usuario.birthDate}</p>
        <p><span class="dato-etiqueta">Dirección:</span> ${usuario.address.address}, ${usuario.address.city}</p>
        <p><span class="dato-etiqueta">Tipo de Sangre:</span> ${usuario.bloodGroup}</p>
    `;
}

/**
 * ======================================================
 * FUNCIÓN: Cerrar Sesión
 * DESCRIPCIÓN: Elimina los datos de sesión y vuelve al login
 * ======================================================
 */
function cerrarSesion() {
    // Eliminamos los datos del almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Mostramos el formulario de inicio de sesión
    mostrarFormularioLogin();
    
    // Ocultamos y limpiamos la lista de usuarios
    ocultarUsuarios();
}

/**
 * ======================================================
 * FUNCIÓN: Buscar Usuario por ID
 * DESCRIPCIÓN: Busca un usuario por su ID y muestra sus datos
 * ======================================================
 */
async function buscarUsuarioPorId() {
    // Obtenemos el ID del campo de entrada
    const id = filtroId.value;
    
    // Validamos que se haya ingresado un ID
    if (!id) {
        mostrarError('Por favor, ingrese un ID válido');
        return;
    }
    
    try {
        // Realizamos la petición a la API de usuarios
        const respuesta = await fetch(`${URL_USUARIOS}/${id}`);
        
        // Verificamos si la respuesta fue exitosa
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            mostrarError(errorData.message || 'Usuario no encontrado');
            return;
        }
        
        // Convertimos la respuesta a JSON
        const usuario = await respuesta.json();
        
        // Mostramos los datos del usuario encontrado
        mostrarDatosUsuario(usuario, 'Token no disponible (solo para usuario autenticado)');
        
    } catch (error) {
        // Mostramos error si hay problemas en la búsqueda
        console.error('Error al buscar usuario:', error);
        mostrarError('Error al buscar usuario. Intente nuevamente.');
    }
}

/**
 * ======================================================
 * FUNCIÓN: Cargar Todos los Usuarios
 * DESCRIPCIÓN: Obtiene y muestra todos los usuarios disponibles
 * ======================================================
 */
async function cargarTodosLosUsuarios() {
    try {
        // Realizamos la petición a la API de usuarios
        const respuesta = await fetch(URL_USUARIOS);
        
        // Verificamos si la respuesta fue exitosa
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            mostrarError(errorData.message || 'Error al cargar usuarios');
            return;
        }
        
        // Convertimos la respuesta a JSON
        const data = await respuesta.json();
        const usuarios = data.users;
        
        // Mostramos el contenedor de usuarios
        contenedorTodosUsuarios.classList.remove('oculto');
        
        // Mostramos el botón para ocultar usuarios
        botonOcultarUsuarios.classList.remove('oculto');
        
        // Actualizamos el contador de usuarios
        totalUsuarios.textContent = usuarios.length;
        
        // Renderizamos los usuarios en tarjetas
        renderizarUsuarios(usuarios);
        
    } catch (error) {
        // Mostramos error si hay problemas al cargar usuarios
        console.error('Error al cargar usuarios:', error);
        mostrarError('Error al cargar usuarios. Intente nuevamente.');
    }
}

/**
 * ======================================================
 * FUNCIÓN: Ocultar Usuarios
 * DESCRIPCIÓN: Oculta la lista de usuarios y limpia el contenedor
 * ======================================================
 */
function ocultarUsuarios() {
    // Ocultamos el contenedor de usuarios
    contenedorTodosUsuarios.classList.add('oculto');
    
    // Ocultamos el botón para ocultar usuarios
    botonOcultarUsuarios.classList.add('oculto');
    
    // Limpiamos la lista de usuarios
    listaUsuarios.innerHTML = '';
}

/**
 * ======================================================
 * FUNCIÓN: Renderizar Usuarios
 * DESCRIPCIÓN: Crea tarjetas para cada usuario y las muestra
 * @param {Array} usuarios - Lista de usuarios a mostrar
 * ======================================================
 */
function renderizarUsuarios(usuarios) {
    // Limpiamos el contenedor de usuarios
    listaUsuarios.innerHTML = '';
    
    // Creamos una tarjeta para cada usuario
    usuarios.forEach(usuario => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-usuario';
        tarjeta.innerHTML = `
            <img src="${usuario.image}" alt="${usuario.firstName} ${usuario.lastName}" class="avatar-usuario">
            <div class="info-usuario">
                <h4>${usuario.firstName} ${usuario.lastName}</h4>
                <p class="dato-usuario"><strong>ID:</strong> ${usuario.id}</p>
                <p class="dato-usuario"><strong>Edad:</strong> ${usuario.age}</p>
                <p class="dato-usuario"><strong>Email:</strong> ${usuario.email}</p>
                <p class="dato-usuario"><strong>Nombre usuario:</strong> ${usuario.username}</p>
            </div>
        `;
        
        // Agregamos la tarjeta al contenedor
        listaUsuarios.appendChild(tarjeta);
    });
}

/**
 * ======================================================
 * FUNCIÓN: Configurar Eventos
 * DESCRIPCIÓN: Asigna los eventos a los elementos del DOM
 * ======================================================
 */
function configurarEventos() {
    // Evento para el formulario de login
    formularioLogin.addEventListener('submit', manejarLogin);
    
    // Evento para el botón de cerrar sesión
    botonCerrarSesion.addEventListener('click', cerrarSesion);
    
    // Evento para el botón de buscar por ID
    botonBuscarId.addEventListener('click', buscarUsuarioPorId);
    
    // Evento para el botón de cargar todos los usuarios
    botonCargarTodos.addEventListener('click', cargarTodosLosUsuarios);
    
    // Evento para el botón de ocultar usuarios
    botonOcultarUsuarios.addEventListener('click', ocultarUsuarios);
    
    // Permitir búsqueda con Enter en el filtro
    filtroId.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            buscarUsuarioPorId();
        }
    });
}

/**
 * ======================================================
 * FUNCIÓN: Iniciar Aplicación
 * DESCRIPCIÓN: Configura la aplicación al cargar la página
 * ======================================================
 */
function iniciarAplicacion() {
    // Configuramos los eventos
    configurarEventos();
    
    // Verificamos si el usuario ya está autenticado
    verificarAutenticacion();
}

// Iniciamos la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', iniciarAplicacion);