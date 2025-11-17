// Sistema de autenticación conectado a la base de datos

// Función para manejar el login
async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorDiv = document.getElementById("error-message");
    const submitBtn = document.querySelector("button[type='submit']");
    
    // Limpiar mensajes previos
    if (errorDiv) errorDiv.textContent = '';
    
    // Validar campos
    if (!username || !password) {
        showError("Por favor completa todos los campos");
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    submitBtn.disabled = true;
    submitBtn.textContent = "Iniciando sesión...";
    
    try {
        const response = await fetch('api/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir según el rol
            if (data.user.rol === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            showError(data.error || 'Error al iniciar sesión');
            submitBtn.disabled = false;
            submitBtn.textContent = "Iniciar Sesión";
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Por favor intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = "Iniciar Sesión";
    }
}

// Función para manejar el registro
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const nombre = document.getElementById("nombre") ? document.getElementById("nombre").value.trim() : '';
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password") ? document.getElementById("confirm-password").value.trim() : password;
    const errorDiv = document.getElementById("error-message");
    const submitBtn = document.querySelector("button[type='submit']");
    
    // Limpiar mensajes previos
    if (errorDiv) errorDiv.textContent = '';
    
    // Validaciones
    if (!username || !email || !password) {
        showError("Por favor completa todos los campos obligatorios");
        return;
    }
    
    if (password !== confirmPassword) {
        showError("Las contraseñas no coinciden");
        return;
    }
    
    if (password.length < 6) {
        showError("La contraseña debe tener al menos 6 caracteres");
        return;
    }
    
    // Deshabilitar botón mientras se procesa
    submitBtn.disabled = true;
    submitBtn.textContent = "Registrando...";
    
    try {
        const response = await fetch('api/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({ username, email, nombre, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar datos del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Mostrar mensaje de éxito y redirigir
            alert('¡Registro exitoso! Bienvenido a GastroGuia');
            window.location.href = 'index.html';
        } else {
            showError(data.error || 'Error al registrar usuario');
            submitBtn.disabled = false;
            submitBtn.textContent = "Registrarse";
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error de conexión. Por favor intenta de nuevo.');
        submitBtn.disabled = false;
        submitBtn.textContent = "Registrarse";
    }
}

// Función para mostrar errores
function showError(message) {
    let errorDiv = document.getElementById("error-message");
    
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "error-message";
        errorDiv.className = "error-message";
        const form = document.querySelector("form");
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Función para cerrar sesión
async function handleLogout() {
    try {
        const response = await fetch('api/auth/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Limpiar localStorage de todos modos
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Detectar qué formulario existe en la página y agregar el listener correspondiente
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }
});