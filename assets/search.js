// Función para obtener restaurantes de la API
async function fetchRestaurants(filters) {
    try {
        // Construir la URL con los parámetros de búsqueda
        const params = new URLSearchParams();
        if (filters.searchText) params.append('search', filters.searchText);
        if (filters.category !== 'all') params.append('category', filters.category);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.minRating) params.append('rating', filters.minRating);
        if (filters.features && filters.features.length > 0) {
            params.append('features', filters.features.join(','));
        }

        const response = await fetch(`api/get_restaurants.php?${params}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        const data = await response.json();
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
    // La búsqueda ahora se realiza en el servidor
    const results = await fetchRestaurants(filters);

        // Filtro por calificación mínima
        if (filters.minRating) {
            matches = matches && restaurant.rating >= filters.minRating;
        }

        // Filtro por características
        if (filters.features && filters.features.length > 0) {
            matches = matches && filters.features.every(feature => 
                restaurant.features.includes(feature)
            );
        }

        return matches;
    });
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
    
    card.innerHTML = `
        <h3>${restaurant.name}</h3>
        <div class="restaurant-info">
            <p class="category">${restaurant.category}</p>
            <p class="price">${restaurant.priceRange}</p>
            <p class="rating">★ ${restaurant.rating}</p>
        </div>
        <p class="location">${restaurant.address}</p>
        <p class="schedule">${restaurant.schedule}</p>
        <div class="features">
            ${restaurant.features.map(feature => 
                `<span class="feature-tag">${feature}</span>`
            ).join('')}
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

        // Disparar búsqueda cuando se suelta el slider
        priceSlider.addEventListener('change', () => {
            const searchForm = document.getElementById('search-form');
            if (searchForm) {
                searchForm.dispatchEvent(new Event('submit'));
            }
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
        
        const filters = {
            searchText: document.getElementById('search-text').value,
            category: document.getElementById('category-filter').value,
            maxPrice: parseInt(document.getElementById('price-range').value),
            minRating: parseFloat(document.getElementById('rating-filter').value),
            features: Array.from(document.querySelectorAll('.feature-checkbox:checked'))
                .map(cb => cb.value)
        };

        // Mostrar indicador de carga
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="loading">Buscando restaurantes...</div>';
        }

        const results = await searchRestaurants(filters);
        updateResults(results);
    });
}