// Función para obtener restaurantes de la API
async function fetchRestaurants(filters) {
    try {
        // Construir la URL con los parámetros de búsqueda
        const params = new URLSearchParams();
        if (filters.searchText) params.append('search', filters.searchText);
        if (filters.tipo && filters.tipo !== 'all') params.append('tipo', filters.tipo);
        if (filters.zona) params.append('zona', filters.zona);
        if (filters.maxPrice) params.append('precio_max', filters.maxPrice);

        const response = await fetch(`api/get_restaurants.php?${params}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
        console.log('Restaurantes obtenidos:', data);
        return data;
    } catch (error) {
        console.error('Error al obtener restaurantes:', error);
        return [];
    }
}

// Función para formatear precio en COP
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// Función principal de búsqueda
async function searchRestaurants(filters) {
    // Obtener todos los restaurantes del servidor
    let results = await fetchRestaurants(filters);
    
    console.log('Restaurantes antes de filtrar:', results.length);
    
    // Aplicar filtros del lado del cliente (calificación y características)
    if (filters.minRating && filters.minRating > 0) {
        results = results.filter(r => r.calificacion && parseFloat(r.calificacion) >= filters.minRating);
        console.log('Después de filtrar por calificación:', results.length);
    }
    
    if (filters.features && filters.features.length > 0) {
        results = results.filter(restaurant => {
            if (!restaurant.caracteristicas) return false;
            const restaurantFeatures = restaurant.caracteristicas.split(',').map(f => f.trim());
            return filters.features.every(feature => restaurantFeatures.includes(feature));
        });
        console.log('Después de filtrar por características:', results.length);
    }
    
    return results;
}

// Función para actualizar los resultados en la UI
function updateResults(results) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No se encontraron restaurantes que coincidan con tu búsqueda.</p>';
        return;
    }

    results.forEach(restaurant => {
        const restaurantCard = createRestaurantCard(restaurant);
        resultsContainer.appendChild(restaurantCard);
    });
}

// Función para crear una tarjeta de restaurante
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.style.cursor = 'pointer';
    
    // Hacer que toda la tarjeta sea clicable
    card.addEventListener('click', (e) => {
        // Evitar que el clic en el botón de favorito abra la URL
        if (!e.target.classList.contains('favorite-btn')) {
            if (restaurant.url) {
                window.open(restaurant.url, '_blank');
            }
        }
    });
    
    // Crear la estructura de precios (símbolos $)
    const priceSymbols = '$'.repeat(Math.min(4, Math.ceil(restaurant.precio_max / 25000)));
    
    // Crear estrellas para la calificación
    function createStars(rating) {
        if (!rating) return '';
        const numRating = parseFloat(rating);
        if (isNaN(numRating)) return '';
        
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        if (hasHalfStar) {
            stars += '✨';
        }
        return `<span class="rating-stars">${stars} ${numRating.toFixed(1)}</span>`;
    }
    
    // Crear badges de características
    function createFeatureBadges(caracteristicas) {
        if (!caracteristicas) return '';
        const features = caracteristicas.split(',').filter(f => f.trim());
        if (features.length === 0) return '';
        
        return `
            <div class="restaurant-features">
                ${features.map(feature => `<span class="feature-badge">${feature.trim()}</span>`).join('')}
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="restaurant-content">
            <div class="restaurant-header">
                <h3 class="restaurant-name">${restaurant.nombre}</h3>
                <button class="favorite-btn">♡</button>
            </div>
            <div class="restaurant-meta">
                <span class="restaurant-type">${restaurant.tipo}</span>
                <span class="restaurant-price">${priceSymbols}</span>
                <span class="restaurant-zone">📍 ${restaurant.zona_r}</span>
                ${restaurant.calificacion ? createStars(restaurant.calificacion) : ''}
            </div>
            ${createFeatureBadges(restaurant.caracteristicas)}
            <div class="restaurant-price-range">
                <span>${formatPrice(restaurant.precio_min)} - ${formatPrice(restaurant.precio_max)}</span>
            </div>
            <p class="restaurant-description">${restaurant.descripcion}</p>
            <div class="restaurant-dishes">
                <p><strong>Plato económico:</strong> ${restaurant.plato_economico} (${formatPrice(restaurant.precio_min)})</p>
                <p><strong>Plato especial:</strong> ${restaurant.plato_caro} (${formatPrice(restaurant.precio_max)})</p>
            </div>
            <p class="restaurant-address">${restaurant.direccion}</p>
        </div>
    `;
    
    return card;
}

// Event listeners cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar los filtros
    setupSearchFilters();
    
    // Configurar el slider de precio
    const priceSlider = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    if (priceSlider && priceValue) {
        // Actualizar el valor mostrado cuando se mueve el slider
        priceSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            priceValue.textContent = formatPrice(value);
        });

        // Establecer valor inicial
        priceValue.textContent = formatPrice(priceSlider.value);
    }
});

// Configurar los filtros de búsqueda
function setupSearchFilters() {
    const searchForm = document.getElementById('search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener características seleccionadas
        const selectedFeatures = Array.from(document.querySelectorAll('.feature-checkbox:checked'))
            .map(cb => cb.value);
        
        const filters = {
            searchText: document.getElementById('search-text').value,
            tipo: document.getElementById('category-filter').value,
            maxPrice: parseInt(document.getElementById('price-range').value),
            minRating: parseFloat(document.getElementById('rating-filter').value),
            features: selectedFeatures
        };

        console.log('Filtros aplicados:', filters);

        // Mostrar indicador de carga
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="loading">Buscando restaurantes...</div>';
        }

        const results = await searchRestaurants(filters);
        console.log('Resultados de búsqueda:', results);
        updateResults(results);
    });
}