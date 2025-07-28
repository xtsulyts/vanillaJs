// ====== SECCIÓN 1: OBTENER ELEMENTOS DEL DOM ======
// --------------------------------------------------
// Aquí seleccionamos elementos HTML usando sus IDs para poder interactuar con ellos
const cryptoGrid = document.getElementById('cryptoGrid');          // Contenedor de las tarjetas de criptomonedas
const searchInput = document.getElementById('searchInput');        // Campo de búsqueda
const refreshBtn = document.getElementById('refreshBtn');          // Botón de actualizar
const updateTime = document.getElementById('updateTime');          // Elemento para mostrar la última actualización
const filterTop = document.getElementById('filterTop');            // Botón de filtro "Top 20"
const filterGainers = document.getElementById('filterGainers');    // Botón de filtro "Ganadoras"
const filterLosers = document.getElementById('filterLosers');      // Botón de filtro "Perdedoras"
const btcPrice = document.getElementById('btcPrice');              // Elemento para precio de Bitcoin
const ethPrice = document.getElementById('ethPrice');              // Elemento para precio de Ethereum
const marketCap = document.getElementById('marketCap');            // Elemento para capitalización de mercado total
const volume24h = document.getElementById('volume24h');            // Elemento para volumen total en 24h

// ====== SECCIÓN 2: VARIABLES GLOBALES ======
// -------------------------------------------
// Estas variables almacenan datos que necesitamos en varias partes del código
let cryptoData = [];            // Almacena los datos de todas las criptomonedas obtenidas de la API
let currentFilter = 'top';      // Guarda el filtro actual (top, gainers, losers)
let chartDataCache = {};        // Almacena datos históricos de gráficos para evitar pedirlos múltiples veces

// ====== SECCIÓN 3: FUNCIONES PRINCIPALES ======
// ----------------------------------------------

/**
 * Función para obtener datos de criptomonedas desde la API
 * Esta función es asíncrona (async) porque hace una solicitud a internet
 */
async function fetchCryptoData() {
    console.log(fetchCryptoData)
    try {
        // Mostrar mensaje de carga mientras se obtienen los datos
        cryptoGrid.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando datos de criptomonedas...</p>
            </div>
        `;
        
        // Hacer la solicitud a la API de CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h');
        
        // Convertir la respuesta a formato JSON
        const data = await response.json();
        
        // Verificar si recibimos datos válidos
        if (!data || data.length === 0) {
            throw new Error('No se encontraron datos');
        }
        
        // Guardar los datos en nuestra variable global
        cryptoData = data;
        
        // Mostrar los datos en la página
        displayCryptoData(cryptoData);
        
        // Actualizar las estadísticas globales
        updateStats(data);
        
        // Actualizar la hora de la última actualización
        updateLastRefreshTime();
        
    } catch (error) {
        // Manejar errores mostrando un mensaje al usuario
        cryptoGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;"></i>
                <p>Error al cargar datos: ${error.message}</p>
                <p>Intenta actualizar la página</p>
            </div>
        `;
        console.error('Error fetching crypto data:', error);
    }
}

/**
 * Función para obtener datos históricos de precios (para gráficos)
 * @param {string} cryptoId - ID de la criptomoneda (ej: "bitcoin")
 * @returns {Array} Datos de precios históricos
 */
async function fetchHistoricalData(cryptoId) {
    // Primero revisamos si ya tenemos estos datos en caché
    if (chartDataCache[cryptoId]) {
        return chartDataCache[cryptoId];  // Si están en caché, los devolvemos directamente
    }
    
    try {
        // Hacer solicitud a la API para datos históricos (7 días)
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=7&interval=daily`);
        const data = await response.json();
        
        // Verificar si recibimos datos válidos
        if (!data || !data.prices) {
            throw new Error('No se encontraron datos históricos');
        }
        
        // Guardar en caché para futuras solicitudes
        chartDataCache[cryptoId] = data.prices;
        
        return data.prices;
        
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return null;  // Devolver null si hay error
    }
}

/**
 * Función para crear un gráfico de precios
 * @param {string} canvasId - ID del elemento canvas donde se dibujará
 * @param {Array} prices - Datos de precios históricos
 * @param {string} cryptoName - Nombre de la criptomoneda
 */
function createPriceChart(canvasId, prices, cryptoName) {
    // Obtener el contexto del canvas (lienzo de dibujo)
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Preparar arrays para las etiquetas y datos del gráfico
    const labels = [];
    const dataPoints = [];
    
    // Procesar cada punto de datos
    prices.forEach(([timestamp, price], index) => {
        // Convertir timestamp a fecha legible (ej: "5 Jul")
        const date = new Date(timestamp);
        labels.push(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
        
        // Guardar el precio
        dataPoints.push(price);
    });
    
    // Determinar color según si el precio subió o bajó
    const firstPrice = dataPoints[0];    // Primer precio en el rango
    const lastPrice = dataPoints[dataPoints.length - 1];  // Último precio
    
    // Verde si subió, rojo si bajó
    const chartColor = lastPrice >= firstPrice ? 'rgba(46, 204, 113, 0.8)' : 'rgba(231, 76, 60, 0.8)';
    
    // Crear y devolver el gráfico usando Chart.js
    return new Chart(ctx, {
        type: 'line',  // Tipo de gráfico: línea
        data: {
            labels: labels,  // Eje X: fechas
            datasets: [{
                label: `Precio de ${cryptoName}`,
                data: dataPoints,  // Eje Y: precios
                borderColor: chartColor,          // Color de la línea
                backgroundColor: chartColor.replace('0.8', '0.1'),  // Color de fondo más transparente
                borderWidth: 2,                   // Grosor de la línea
                pointRadius: 0,                   // Ocultar puntos en la línea
                pointHoverRadius: 5,              // Mostrar puntos al pasar el ratón
                tension: 0.4,                     // Suavizado de la curva
                fill: true                        // Rellenar área bajo la curva
            }]
        },
        options: {
            responsive: true,            // Hacer el gráfico responsivo
            maintainAspectRatio: false,  // No mantener proporción de aspecto
            plugins: {
                legend: {
                    display: false  // Ocultar leyenda
                },
                tooltip: {
                    mode: 'index',      // Mostrar tooltip cuando el ratón pasa cerca
                    intersect: false,   // No requerir estar exactamente sobre un punto
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Fondo del tooltip
                    callbacks: {
                        label: function(context) {
                            // Personalizar texto del tooltip
                            return `Precio: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { display: false },  // Ocultar eje X
                y: { display: false }   // Ocultar eje Y
            }
        }
    });
}

/**
 * Función para mostrar los datos de criptomonedas en el grid
 * @param {Array} data - Datos de criptomonedas
 */
async function displayCryptoData(data) {
    // Limpiar el contenedor antes de agregar nuevos elementos
    cryptoGrid.innerHTML = '';
    
    // Filtrar datos según el filtro seleccionado
    let filteredData = [...data];  // Copiar el array original
    
    if (currentFilter === 'top') {
        // Tomar solo las primeras 20 criptomonedas (top por capitalización)
        filteredData = filteredData.slice(0, 20);
        
    } else if (currentFilter === 'gainers') {
        // Filtrar criptos con ganancias en 24h, ordenar de mayor a menor ganancia
        filteredData = filteredData
            .filter(crypto => crypto.price_change_percentage_24h > 0)
            .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
            .slice(0, 20);
            
    } else if (currentFilter === 'losers') {
        // Filtrar criptos con pérdidas en 24h, ordenar de mayor a menor pérdida
        filteredData = filteredData
            .filter(crypto => crypto.price_change_percentage_24h < 0)
            .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
            .slice(0, 20);
    }
    
    // Si no hay datos después de filtrar, mostrar mensaje
    if (filteredData.length === 0) {
        cryptoGrid.innerHTML = '<div class="loading">No se encontraron criptomonedas</div>';
        return;
    }
    
    // Crear una tarjeta para cada criptomoneda filtrada
    for (const crypto of filteredData) {
        // Calcular variación de precio en 24h
        const priceChange = crypto.price_change_percentage_24h;
        
        // Determinar clase CSS según si es positivo o negativo
        const priceChangeClass = priceChange >= 0 ? 'positive' : 'negative';
        
        // Formatear texto para mostrar (ej: "+5.25%" o "-3.42%")
        const priceChangeText = priceChange >= 0 ? `+${priceChange.toFixed(2)}%` : `${priceChange.toFixed(2)}%`;
        
        // Crear ID único para el gráfico usando el ID de la cripto
        const chartId = `chart-${crypto.id.replace(/\s+/g, '-')}`;
        
        // Crear elemento HTML para la tarjeta
        const cryptoCard = document.createElement('div');
        cryptoCard.className = 'crypto-card';
        
        // Contenido HTML de la tarjeta
        cryptoCard.innerHTML = `
            <div class="crypto-header">
                <img src="${crypto.image}" alt="${crypto.name}" class="crypto-logo">
                <div>
                    <div class="crypto-name">${crypto.name}</div>
                    <div class="crypto-symbol">${crypto.symbol}</div>
                </div>
            </div>
            <div class="crypto-price">$${crypto.current_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div class="price-change ${priceChangeClass}">${priceChangeText}</div>
            
            <div class="chart-container">
                <canvas id="${chartId}"></canvas>
            </div>
            
            <div class="crypto-info">
                <span>Cap: $${formatNumber(crypto.market_cap)}</span>
                <span>Vol 24h: $${formatNumber(crypto.total_volume)}</span>
            </div>
        `;
        
        // Agregar la tarjeta al grid
        cryptoGrid.appendChild(cryptoCard);
        
        // Obtener datos históricos y crear el gráfico
        try {
            const historicalData = await fetchHistoricalData(crypto.id);
            
            if (historicalData) {
                // Crear el gráfico si tenemos datos
                createPriceChart(chartId, historicalData, crypto.name);
            } else {
                // Mostrar mensaje de error si no hay datos
                document.getElementById(chartId).parentElement.innerHTML = '<p class="chart-error">Datos de gráfico no disponibles</p>';
            }
        } catch (error) {
            console.error('Error creating chart:', error);
            document.getElementById(chartId).parentElement.innerHTML = '<p class="chart-error">Error al cargar gráfico</p>';
        }
    }
}

/**
 * Función para actualizar las estadísticas globales
 * @param {Array} data - Datos de todas las criptomonedas
 */
function updateStats(data) {
    // Buscar Bitcoin y Ethereum en los datos
    const btc = data.find(c => c.symbol === 'btc');
    const eth = data.find(c => c.symbol === 'eth');
    
    // Actualizar precios si se encontraron
    if (btc) btcPrice.textContent = `$${btc.current_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (eth) ethPrice.textContent = `$${eth.current_price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // Calcular capitalización de mercado total (suma de todas las criptos)
    const totalMarketCap = data.reduce((sum, crypto) => sum + crypto.market_cap, 0);
    marketCap.textContent = `$${formatNumber(totalMarketCap)}`;
    
    // Calcular volumen total en 24h (suma de todas las criptos)
    const totalVolume24h = data.reduce((sum, crypto) => sum + crypto.total_volume, 0);
    volume24h.textContent = `$${formatNumber(totalVolume24h)}`;
}

/**
 * Función para formatear números grandes (ej: 1500000 -> "1.50M")
 * @param {number} num - Número a formatear
 * @returns {string} Número formateado
 */
function formatNumber(num) {
    // Formatear trillones
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    }
    // Formatear billones
    if (num >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    }
    // Formatear millones
    if (num >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    }
    // Para números pequeños, usar formato normal
    return num.toLocaleString('en-US', {maximumFractionDigits: 0});
}

/**
 * Función para actualizar la hora de última actualización
 */
function updateLastRefreshTime() {
    const now = new Date();  // Obtener fecha/hora actual
    updateTime.textContent = now.toLocaleTimeString('es-ES');  // Formatear hora
}

/**
 * Función para filtrar criptomonedas por búsqueda
 */
function filterCrypto() {
    // Obtener texto de búsqueda en minúsculas
    const searchTerm = searchInput.value.toLowerCase();
    
    // Seleccionar todas las tarjetas de criptomonedas
    const cards = document.querySelectorAll('.crypto-card');
    
    // Recorrer cada tarjeta
    cards.forEach(card => {
        // Obtener nombre y símbolo de la criptomoneda en minúsculas
        const name = card.querySelector('.crypto-name').textContent.toLowerCase();
        const symbol = card.querySelector('.crypto-symbol').textContent.toLowerCase();
        
        // Mostrar/ocultar según coincida con la búsqueda
        if (name.includes(searchTerm) || symbol.includes(searchTerm)) {
            card.style.display = 'block';  // Mostrar si coincide
        } else {
            card.style.display = 'none';   // Ocultar si no coincide
        }
    });
}

/**
 * Función para cambiar el filtro activo
 * @param {string} filter - Tipo de filtro ('top', 'gainers', 'losers')
 */
function setFilter(filter) {
    // Actualizar filtro actual
    currentFilter = filter;
    
    // Actualizar apariencia de los botones de filtro
    filterTop.classList.remove('active');
    filterGainers.classList.remove('active');
    filterLosers.classList.remove('active');
    
    // Marcar como activo el botón seleccionado
    if (filter === 'top') filterTop.classList.add('active');
    if (filter === 'gainers') filterGainers.classList.add('active');
    if (filter === 'losers') filterLosers.classList.add('active');
    
    // Volver a mostrar los datos con el nuevo filtro
    displayCryptoData(cryptoData);
}

// ====== SECCIÓN 4: CONFIGURAR EVENTOS ======
// -------------------------------------------
// Aquí asignamos funciones a eventos del usuario

// Cuando se escribe en el campo de búsqueda
searchInput.addEventListener('input', filterCrypto);

// Al hacer clic en el botón de actualizar
refreshBtn.addEventListener('click', fetchCryptoData);

// Al hacer clic en los botones de filtro
filterTop.addEventListener('click', () => setFilter('top'));
filterGainers.addEventListener('click', () => setFilter('gainers'));
filterLosers.addEventListener('click', () => setFilter('losers'));

// ====== SECCIÓN 5: INICIALIZACIÓN ======
// ---------------------------------------
// Cargar datos iniciales al abrir la página
fetchCryptoData();

// Actualizar automáticamente cada 60 segundos (60,000 milisegundos)
setInterval(fetchCryptoData, 60000);

// Inicializar el filtro "Top" como activo
filterTop.classList.add('active');