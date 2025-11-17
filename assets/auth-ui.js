// auth-ui.js - Manejo de UI para usuario autenticado

// Función para verificar sesión y actualizar UI
async function checkAuthAndUpdateUI() {
    try {
        const response = await fetch('api/auth/check_session.php', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (data.loggedIn && data.user) {
            updateHeaderForLoggedUser(data.user);
            return data.user;
        } else {
            updateHeaderForGuest();
            return null;
        }
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        updateHeaderForGuest();
        return null;
    }
}

// Actualizar header para usuario logueado
function updateHeaderForLoggedUser(user) {
    const navItems = document.querySelector('.nav-items');
    if (!navItems) return;
    
    navItems.innerHTML = `
        <span class="user-welcome">Hola, ${user.nombre || user.username}</span>
        ${user.rol === 'admin' ? '<a href="admin.html" class="nav-btn">Admin Panel</a>' : ''}
        <a href="favoritos.html" class="nav-btn">Mis Favoritos</a>
        <a href="perfil.html" class="nav-btn">Mi Perfil</a>
        <a href="#" class="nav-btn" id="logout-btn">Cerrar Sesión</a>
    `;
    
    // Agregar evento de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout();
        });
    }
}

// Actualizar header para visitante
function updateHeaderForGuest() {
    const navItems = document.querySelector('.nav-items');
    if (!navItems) return;
    
    navItems.innerHTML = `
        <a href="login.html" class="nav-btn">Iniciar Sesión</a>
        <a href="registro.html" class="nav-btn">Registrarse</a>
    `;
}

// Función de logout
async function handleLogout() {
    try {
        const response = await fetch('api/auth/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.removeItem('user');
            alert('Sesión cerrada exitosamente');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthAndUpdateUI);
} else {
    checkAuthAndUpdateUI();
}
