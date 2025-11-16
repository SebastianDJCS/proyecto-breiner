// Variables globales
let editingId = null;
const form = document.getElementById('restaurant-form');
const restaurantsList = document.getElementById('restaurants-list').getElementsByTagName('tbody')[0];

// Funciones de utilidad
function showMessage(message, isError = false) {
    const div = document.createElement('div');
    div.className = isError ? 'error-message' : 'success-message';
    div.textContent = message;
    
    const container = document.querySelector('.admin-container');
    container.insertBefore(div, container.firstChild);
    
    setTimeout(() => div.remove(), 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price).replace('COP', '$');
}

function formatPriceRange(min, max) {
    return `${formatPrice(min)} - ${formatPrice(max)}`;
}

// Funciones CRUD
async function getRestaurants() {
    try {
        const response = await fetch('api/admin/get_restaurants.php');
        if (!response.ok) throw new Error('Error al obtener los restaurantes');
        
        const restaurants = await response.json();
        displayRestaurants(restaurants);
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function createRestaurant(data) {
    try {
        console.log('Enviando datos:', data);
        const response = await fetch('api/admin/create_restaurant.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Respuesta no válida del servidor: ' + responseText);
        }
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Error al crear el restaurante');
        }
        
        showMessage('Restaurante creado exitosamente');
        clearForm();
        getRestaurants();
    } catch (error) {
        console.error('Error completo:', error);
        showMessage(error.message || 'Error al crear el restaurante', true);
    }
}

async function updateRestaurant(id, data) {
    try {
        const response = await fetch(`api/admin/update_restaurant.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Error al actualizar el restaurante');
        
        showMessage('Restaurante actualizado exitosamente');
        clearForm();
        getRestaurants();
    } catch (error) {
        showMessage(error.message, true);
    }
}

async function deleteRestaurant(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este restaurante?')) return;
    
    try {
        const response = await fetch(`api/admin/delete_restaurant.php?id=${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar el restaurante');
        
        showMessage('Restaurante eliminado exitosamente');
        getRestaurants();
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Funciones de UI
function displayRestaurants(restaurants) {
    restaurantsList.innerHTML = '';
    
    restaurants.forEach(restaurant => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${restaurant.nombre}</td>
            <td>${restaurant.tipo}</td>
            <td>${restaurant.zona_r}</td>
            <td>${formatPriceRange(restaurant.precio_min, restaurant.precio_max)}</td>
            <td>${restaurant.direccion}</td>
            <td class="action-buttons">
                <button onclick="editRestaurant(${restaurant.id})" class="edit-btn">Editar</button>
                <button onclick="deleteRestaurant(${restaurant.id})" class="delete-btn">Eliminar</button>
            </td>
        `;
        restaurantsList.appendChild(row);
    });
}

function editRestaurant(id) {
    editingId = id;
    
    fetch(`api/admin/get_restaurant.php?id=${id}`)
        .then(response => response.json())
        .then(restaurant => {
            document.getElementById('restaurant-id').value = restaurant.id;
            document.getElementById('nombre').value = restaurant.nombre;
            document.getElementById('descripcion').value = restaurant.descripcion;
            document.getElementById('direccion').value = restaurant.direccion;
            document.getElementById('zona').value = restaurant.zona_r;
            document.getElementById('tipo').value = restaurant.tipo;
            document.getElementById('precio_min').value = restaurant.precio_min;
            document.getElementById('precio_max').value = restaurant.precio_max;
            document.getElementById('plato_economico').value = restaurant.plato_economico;
            document.getElementById('plato_caro').value = restaurant.plato_caro;
            document.getElementById('url').value = restaurant.url || '';
            document.getElementById('calificacion').value = restaurant.calificacion || '';
            
            // Cargar características
            const caracteristicasArray = restaurant.caracteristicas ? restaurant.caracteristicas.split(',') : [];
            document.querySelectorAll('input[name="caracteristicas"]').forEach(checkbox => {
                checkbox.checked = caracteristicasArray.includes(checkbox.value);
            });
            
            document.querySelector('.save-btn').textContent = 'Actualizar';
        })
        .catch(error => showMessage(error.message, true));
}

function clearForm() {
    form.reset();
    editingId = null;
    document.getElementById('restaurant-id').value = '';
    document.querySelector('.save-btn').textContent = 'Guardar';
}

// Event Listeners
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        // Obtener todos los campos
        const fields = {
            nombre: document.getElementById('nombre'),
            descripcion: document.getElementById('descripcion'),
            direccion: document.getElementById('direccion'),
            zona: document.getElementById('zona'),
            tipo: document.getElementById('tipo'),
            precio_min: document.getElementById('precio_min'),
            precio_max: document.getElementById('precio_max'),
            plato_economico: document.getElementById('plato_economico'),
            plato_caro: document.getElementById('plato_caro'),
            url: document.getElementById('url'),
            calificacion: document.getElementById('calificacion')
        };

        // Validar que todos los campos existen
        for (const [key, element] of Object.entries(fields)) {
            if (!element) {
                throw new Error(`Campo no encontrado en el formulario: ${key}`);
            }
        }

        // Validar campos requeridos
        const emptyFields = Object.entries(fields)
            .filter(([_, element]) => !element.value.trim())
            .map(([key]) => key);

        if (emptyFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${emptyFields.join(', ')}`);
        }

        // Obtener características seleccionadas
        const caracteristicasCheckboxes = document.querySelectorAll('input[name="caracteristicas"]:checked');
        const caracteristicas = Array.from(caracteristicasCheckboxes).map(cb => cb.value).join(',');

        // Construir objeto de datos
        const formData = {
            nombre: fields.nombre.value.trim(),
            descripcion: fields.descripcion.value.trim(),
            direccion: fields.direccion.value.trim(),
            zona_r: fields.zona.value.trim(),
            tipo: fields.tipo.value.trim(),
            precio_min: parseInt(fields.precio_min.value) || 0,
            precio_max: parseInt(fields.precio_max.value) || 0,
            plato_economico: fields.plato_economico.value.trim(),
            plato_caro: fields.plato_caro.value.trim(),
            url: fields.url.value.trim(),
            calificacion: parseFloat(fields.calificacion.value),
            caracteristicas: caracteristicas
        };

        console.log('Datos a enviar:', formData);

        if (editingId) {
            await updateRestaurant(editingId, formData);
        } else {
            await createRestaurant(formData);
        }
    } catch (error) {
        showMessage(error.message, true);
        console.error('Error en el formulario:', error);
    }
});

// Cargar restaurantes al iniciar
document.addEventListener('DOMContentLoaded', getRestaurants);