const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('navigation');
const path = document.getElementById('path');
const ship = document.getElementById('ship');
const pathLength = path.getTotalLength();

let dragging = false;
let isUpdating = false;


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

const getClosestPoint = (x, y) => {
      let closestPoint = { x: 0, y: 0 };
      let minDistance = Infinity;

      for (let i = 0; i <= pathLength; i++) {
        const point = path.getPointAtLength(i);
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      }

      return closestPoint;
    };

    // Update the ship's position to match the closest point on the path
  const updateShipPosition = (clientX, clientY) => {
  if (isUpdating) return; // Skip if a frame update is already in progress
  isUpdating = true;

  requestAnimationFrame(() => {
    const svgRect = path.closest('svg').getBoundingClientRect();
    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;

    const closestPoint = getClosestPoint(x, y);
    ship.style.left = `${closestPoint.x}px`;
    ship.style.top = `${closestPoint.y}px`;

    isUpdating = false; // Allow the next update
  });
};

    // Start drag event
const onStart = (e) => {
    dragging = true;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateShipPosition(clientX, clientY);
};

const autoScroll = (clientY) => {
  const scrollMargin = 50; // Distance from the edge to trigger scrolling
  const scrollSpeed = 10;  // Speed of scrolling

  if (clientY < scrollMargin) {
    // Scroll up
    window.scrollBy(0, -scrollSpeed);
  } else if (clientY > window.innerHeight - scrollMargin) {
    // Scroll down
    window.scrollBy(0, scrollSpeed);
  }
};

    // Dragging event
const onMove = (e) => {
  if (!dragging) return;

  const { clientX, clientY } = e.touches ? e.touches[0] : e;

  // Update the ship's position
  updateShipPosition(clientX, clientY);

  // Check if auto-scrolling is needed
  autoScroll(clientY);
};

    // End drag event
const onEnd = () => {
    dragging = false;
};

    // Event listeners
ship.addEventListener('mousedown', onStart);
ship.addEventListener('touchstart', onStart);

document.addEventListener('mousemove', onMove);
document.addEventListener('touchmove', onMove);

document.addEventListener('mouseup', onEnd);
document.addEventListener('touchend', onEnd);