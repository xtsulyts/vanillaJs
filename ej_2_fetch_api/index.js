/* 
  ================================================
  REFERENCIAS A ELEMENTOS DEL DOM (INTERFAZ DE USUARIO)
  ================================================
 "ganchos" para manipular elementos HTML desde JavaScript.
  Usar document.getElementById para encontrar elementos por su ID.
*/
const cardContainer = document.getElementById('card-container'); // Contenedor donde mostraremos las tarjetas
const searchInput = document.getElementById('search-input');     // Input de búsqueda
const prevBtn = document.getElementById('prev-btn');             // Botón para página anterior
const nextBtn = document.getElementById('next-btn');             // Botón para página siguiente

/* 
  ================================================
  VARIABLES DE ESTADO (DATOS QUE CAMBIAN)
  ================================================
  información que puede cambiar durante la ejecución:
*/
let paginaActual = 1;    // Página actual que estamos viendo
let totalPages = 0;      // Total de páginas disponibles (lo sabremos después de hacer una petición)
let searchTerm = '';     // Término de búsqueda que escribe el usuario

/* 
  ================================================
  FUNCIÓN PRINCIPAL: getCharacters()
  ================================================
  Propósito: Obtiene personajes de la API según la página y término de búsqueda actual.
  Es asíncrona porque trabaja con operaciones que toman tiempo (peticiones a servidor).
*/
async function getCharacters() {
    try {
        showLoading(); // Muestra un mensaje de carga mientras se obtienen datos
        
        // Construir la URL dinámicamente:
        const url = searchTerm 
            ? `https://rickandmortyapi.com/api/character?name=${searchTerm}&page=${paginaActual}`  // Con búsqueda
            : `https://rickandmortyapi.com/api/character?page=${paginaActual}`;                    // Sin búsqueda
        
        // petición a la API y esperamos la respuesta (await)
        const response = await fetch(url);
        
        // Verificamos si la respuesta es exitosa (código 200-299)
        if (!response.ok) {
            if (response.status === 404) {
                showError("No se encontraron personajes"); // Caso especial: búsqueda sin resultados
            } else {
                throw new Error(`Error HTTP: ${response.status}`); // Otros errores (500, etc.)
            }
            return; // Salimos de la función
        }
        
        // Convertir la respuesta a formato JSON (estructura de datos de JavaScript)
        const data = await response.json();
        
        // EXTRAEr DATOS IMPORTANTES:
        totalPages = data.info.pages; // La API devuelve "info" con el total de páginas
        updatePagination();            // Actualizar los botones de paginación
        displayCharacters(data.results); // Mostrar los personajes (results es el array)
        
    } catch (error) {
        // Manejo de errores generales (problemas de red, etc.)
        showError(error.message);
        console.error("Error en getCharacters:", error); // Para depuración en consola
    }
}

/* 
  ================================================
  FUNCIÓN: displayCharacters(characters)
  ================================================
  Propósito: Crear y mostrar tarjetas de personajes en el DOM
  
  characters: Array de objetos con información de personajes
*/
function displayCharacters(characters) {
    cardContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos elementos
    
    // Validación por si no hay personajes
    if (!characters || characters.length === 0) {
        showError("No se encontraron personajes");
        return;
    }
    
    // Recorrer cada personaje con forEach
    characters.forEach(character => {
        // PASO 1: Creamos elementos HTML
        const card = document.createElement('div'); // Contenedor principal
        card.className = 'character-card';          // Clase CSS para estilos
        
        const img = document.createElement('img');  // Imagen del personaje
        img.src = character.image;                  // URL de la imagen
        img.alt = character.name;                   // Texto alternativo
        
        const infoContainer = document.createElement('div'); // Contenedor de texto
        infoContainer.className = 'character-info';         // Clase CSS
        
        // Elementos de información:
        const name = document.createElement('h3');
        name.textContent = character.name;          // Nombre
        
        const species = document.createElement('p');
        species.textContent = `Especie: ${character.species}`;
        
        const status = document.createElement('p');
        // Usamos innerHTML para agregar un span con clase dinámica (para color de estado)
        status.innerHTML = `Estado: <span class="status-${character.status.toLowerCase()}">${character.status}</span>`;
        
        const origin = document.createElement('p');
        origin.textContent = `Origen: ${character.origin.name}`;
        
        // PASO 2: Ensamblamos la estructura
        // Agregar elementos de texto al contenedor de información
        infoContainer.appendChild(name);
        infoContainer.appendChild(species);
        infoContainer.appendChild(status);
        infoContainer.appendChild(origin);
        
        // Agregar imagen y contenedor de info a la tarjeta
        card.appendChild(img);
        card.appendChild(infoContainer);
        
        // PASO 3: Agregar la tarjeta completa al contenedor principal
        cardContainer.appendChild(card);
    });
}

/* 
  ================================================
  FUNCIÓN: updatePagination()
  ================================================
  Propósito: Actualizar estado de botones de paginación
*/
function updatePagination() {
    // Deshabilita botón "Anterior" si estamos en la página 1
    prevBtn.disabled = paginaActual <= 1;
    
    // Deshabilita botón "Siguiente" si estamos en la última página
    nextBtn.disabled = paginaActual >= totalPages;
}

/* 
  ================================================
  FUNCIÓN: showLoading()
  ================================================
  Propósito: Mostrar mensaje de carga mientras se obtienen datos
*/
function showLoading() {
    cardContainer.innerHTML = ''; // Limpiamos el contenedor
    const loading = document.createElement('div');
    loading.className = 'loading';             // Clase para estilos CSS
    loading.textContent = 'Cargando personajes...';
    cardContainer.appendChild(loading);
}

/* 
  ================================================
  FUNCIÓN: showError()
  ================================================
  Propósito: Mostrar mensajes de error al usuario
*/
function showError(message) {
    cardContainer.innerHTML = ''; // Limpiamos el contenedor
    const error = document.createElement('div');
    error.className = 'error'; // Clase para estilos CSS
    error.textContent = `Error: ${message}`;
    cardContainer.appendChild(error);
}

/* 
  ================================================
  EVENT LISTENERS (MANEJADORES DE EVENTOS)
  ================================================
*/

// Botón "Anterior": Disminuye la página actual y recarga personajes
prevBtn.addEventListener('click', () => {
    if (paginaActual > 1) {
        paginaActual--; // Disminuimos el contador de página
        getCharacters(); // Volvemos a cargar datos
    }
});

// Botón "Siguiente": Aumenta la página actual y recarga personajes
nextBtn.addEventListener('click', () => {
    if (paginaActual < totalPages) {
        paginaActual++; // Aumentamos el contador de página
        getCharacters(); // Volvemos a cargar datos
    }
});

// Búsqueda con retardo (debounce) para evitar demasiadas peticiones
let searchTimeout; // Guardamos el temporizador
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout); // Cancelamos el temporizador anterior
    
    // Guardamos el término de búsqueda (sin espacios al inicio/fin)
    searchTerm = e.target.value.trim();
    
    // Reseteamos a la primera página en cada nueva búsqueda
    paginaActual = 1;
    
    // Configuramos un nuevo temporizador (ejecuta la búsqueda después de 500ms)
    searchTimeout = setTimeout(() => {
        getCharacters();
    }, 500);
});

/* 
  ================================================
  INICIALIZACIÓN
  ================================================
  Cuando el documento HTML está completamente cargado, ejecutamos:
*/
document.addEventListener('DOMContentLoaded', getCharacters);