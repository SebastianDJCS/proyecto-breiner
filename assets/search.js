// Array de ejemplo con restaurantes (esto se podría cargar desde una API o base de datos)
const restaurants = [
    {
        id: 1,
        name: "Restaurante Ejemplo 1",
        category: "Comida Rápida",
        priceRange: "$$",
        rating: 4.5,
        location: "Centro",
        cuisineType: "Hamburguesas",
        features: ["Delivery", "Terraza", "Wifi"],
        schedule: "10:00 - 22:00",
        address: "Calle Principal #123"
    }
    // Aquí irían más restaurantes
];

// Función principal de búsqueda
function searchRestaurants(filters) {
    return restaurants.filter(restaurant => {
        let matches = true;

        // Búsqueda por texto (nombre o dirección)
        if (filters.searchText) {
            const searchText = filters.searchText.toLowerCase();
            matches = matches && (
                restaurant.name.toLowerCase().includes(searchText) ||
                restaurant.address.toLowerCase().includes(searchText)
            );
        }

        // Filtro por categoría
        if (filters.category && filters.category !== 'all') {
            matches = matches && restaurant.category === filters.category;
        }

        // Filtro por rango de precio
        if (filters.priceRange) {
            matches = matches && restaurant.priceRange === filters.priceRange;
        }

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
});

// Configurar los filtros de búsqueda
function setupSearchFilters() {
    const searchForm = document.getElementById('search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const filters = {
            searchText: document.getElementById('search-text').value,
            category: document.getElementById('category-filter').value,
            priceRange: document.getElementById('price-filter').value,
            minRating: parseFloat(document.getElementById('rating-filter').value),
            features: Array.from(document.querySelectorAll('.feature-checkbox:checked'))
                .map(cb => cb.value)
        };

        const results = searchRestaurants(filters);
        updateResults(results);
    });
}