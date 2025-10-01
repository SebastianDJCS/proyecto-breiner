const usuario_permitido="admin";
const contrasena_permitida="admin123";

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const usuario = document.getElementById("username").value.trim();
    const contrasena = document.getElementById("password").value.trim();
    
    if(usuario === usuario_permitido && contrasena === contrasena_permitida) {
        alert("Acceso concedido");
        window.location.href = "index.html";
    } else {
        alert("Acceso denegado");
    } 
});