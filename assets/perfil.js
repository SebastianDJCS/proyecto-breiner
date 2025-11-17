// perfil.js - Gestión de perfil de usuario

// Cargar datos del usuario
async function loadUserProfile() {
    try {
        const response = await fetch('api/auth/check_session.php', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (!data.loggedIn) {
            window.location.href = 'login.html';
            return;
        }
        
        // Llenar formulario con datos del usuario
        document.getElementById('username').value = data.user.username;
        document.getElementById('nombre').value = data.user.nombre || '';
        document.getElementById('email').value = data.user.email || '';
        
        // Cargar estadísticas
        await loadUserStats(data.user.id);
        
    } catch (error) {
        console.error('Error al cargar perfil:', error);
        alert('Error al cargar datos del perfil');
    }
}

// Cargar estadísticas del usuario
async function loadUserStats(userId) {
    try {
        // Obtener cantidad de favoritos
        const favResponse = await fetch('api/favoritos/get.php', {
            credentials: 'same-origin'
        });
        const favData = await favResponse.json();
        
        if (favData.success) {
            document.getElementById('total-favorites').textContent = favData.favoritos.length;
        }
        
        // Fecha de registro (se podría obtener del backend)
        const memberDate = new Date().getFullYear();
        document.getElementById('member-since').textContent = memberDate;
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Actualizar información del perfil
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    try {
        const response = await fetch('api/user/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ nombre, email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('success-message', 'Perfil actualizado exitosamente');
            // Actualizar sessionStorage si existe
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.nombre = nombre;
            user.email = email;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            showMessage('error-message', data.error || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('error-message', 'Error de conexión');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Cambios';
    }
});

// Cambiar contraseña
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
        showMessage('password-error', 'Las contraseñas nuevas no coinciden');
        return;
    }
    
    if (newPassword.length < 6) {
        showMessage('password-error', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cambiando...';
    
    try {
        const response = await fetch('api/user/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('password-success', 'Contraseña actualizada exitosamente');
            e.target.reset();
        } else {
            showMessage('password-error', data.error || 'Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('password-error', 'Error de conexión');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Cambiar Contraseña';
    }
});

// Función para mostrar mensajes
function showMessage(elementId, message) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    // Ocultar otros mensajes del mismo tipo
    const isError = elementId.includes('error');
    const otherType = isError ? 'success-message' : 'error-message';
    const otherElement = document.getElementById(otherType);
    if (otherElement) otherElement.style.display = 'none';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Cargar perfil al cargar la página
document.addEventListener('DOMContentLoaded', loadUserProfile);
