const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('navigation');

document.addEventListener("DOMContentLoaded", function () {
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            menuToggle.classList.toggle("open");
            nav.classList.toggle("open");
        });
        } else {
            console.error("Hamburger or menu element not found in the DOM.");
        }
});