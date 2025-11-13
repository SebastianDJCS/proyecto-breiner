document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const menuItems = document.getElementById('menuItems');

    menuToggle.addEventListener('click', function() {
        menuItems.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
});