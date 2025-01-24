document.addEventListener('DOMContentLoaded', () => {
  const path = document.getElementById('path');
  const ship = document.getElementById('ship');

  if (!(path instanceof SVGPathElement)) {
    console.error('The element with id="path" is not a valid SVG <path> element.');
    return;
  }

  const pathLength = path.getTotalLength();
  let dragging = false;
  let isUpdating = false;

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

  const updateShipPosition = (clientX, clientY) => {
    if (isUpdating) return;
    isUpdating = true;

    requestAnimationFrame(() => {
      const svgRect = path.closest('svg').getBoundingClientRect();
      const x = clientX - svgRect.left;
      const y = clientY - svgRect.top;

      const closestPoint = getClosestPoint(x, y);
      ship.style.left = `${closestPoint.x}px`;
      ship.style.top = `${closestPoint.y}px`;

      isUpdating = false;
    });
  };

  const autoScroll = (clientY) => {
    const scrollMargin = 50;
    const scrollSpeed = 10;

    if (clientY < scrollMargin) {
      window.scrollBy(0, -scrollSpeed);
    } else if (clientY > window.innerHeight - scrollMargin) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  const onStart = (e) => {
    dragging = true;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateShipPosition(clientX, clientY);
  };

  const onMove = (e) => {
    if (!dragging) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateShipPosition(clientX, clientY);
    autoScroll(clientY);
  };

  const onEnd = () => {
    dragging = false;
  };

  ship.addEventListener('mousedown', onStart);
  ship.addEventListener('touchstart', onStart);

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove);

  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
});

document.addEventListener('DOMContentLoaded', () => {
  const path = document.getElementById('path2');
  const icon = document.querySelector('.map-interaction_icon');
  const mapContainer = document.querySelector('.interaction-container');
  const svgElement = document.querySelector('.map-path');
  const circles = document.querySelectorAll('.map-path circle');
  const infoDisplay = document.createElement('div');

  let currentCircleIndex = null; // To track which circle is being interacted with

  if (!(path instanceof SVGPathElement)) {
    console.error('The element with id="path2" is not a valid SVG <path> element.');
    return;
  }

  infoDisplay.className = 'info-display';
  mapContainer.appendChild(infoDisplay);

  const pathLength = path.getTotalLength();
  let dragging = false;

  const calculateDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

  const findClosestPointOnPath = (x, y) => {
    let closestPoint = { x: 0, y: 0 };
    let minDistance = Infinity;

    for (let i = 0; i <= pathLength; i++) {
      const point = path.getPointAtLength(i);
      const distance = calculateDistance(x, y, point.x, point.y);

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = { x: point.x, y: point.y };
      }
    }

    return closestPoint;
  };

  const findClosestCircle = (x, y, range = 10) => {
    let closestCircle = null;
    let minDistance = Infinity;

    circles.forEach((circle) => {
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      const distance = calculateDistance(x, y, cx, cy);

      if (distance < minDistance && distance <= range) {
        minDistance = distance;
        closestCircle = circle;
      }
    });

    return closestCircle;
  };

  const updateIconPosition = (clientX, clientY) => {
    const containerRect = mapContainer.getBoundingClientRect();
    const svgRect = svgElement.getBoundingClientRect();

    if (!svgRect || !containerRect) {
      console.error('getBoundingClientRect() failed.');
      return;
    }

    const x = clientX - svgRect.left;
    const y = clientY - svgRect.top;

    const closestPoint = findClosestPointOnPath(x, y);
    const closestCircle = findClosestCircle(closestPoint.x, closestPoint.y, 15);

    if (closestCircle) {
      const cx = parseFloat(closestCircle.getAttribute('cx'));
      const cy = parseFloat(closestCircle.getAttribute('cy'));

      icon.style.left = `${cx + svgRect.left - containerRect.left}px`;
      icon.style.top = `${cy + svgRect.top - containerRect.top}px`;

      const city = closestCircle.getAttribute('data-city');
      const info = closestCircle.getAttribute('city-info') || 'No additional info';
      displayCityInfo(city, info, cx, cy);
    } else {
      icon.style.left = `${closestPoint.x + svgRect.left - containerRect.left}px`;
      icon.style.top = `${closestPoint.y + svgRect.top - containerRect.top}px`;

      infoDisplay.style.display = 'none';
    }
  };

const initializeIconPosition = () => {
  const svgRect = svgElement.getBoundingClientRect();  // The position of the SVG
  const containerRect = mapContainer.getBoundingClientRect(); // The position of the map container

  // Get the position of the first circle (Saint-Avertin)
  const firstCircle = circles[0]; // Assuming the first circle in your SVG is the starting point
  const circleX = parseFloat(firstCircle.getAttribute('cx'));  // X position of the circle
  const circleY = parseFloat(firstCircle.getAttribute('cy'));  // Y position of the circle

  // Calculate the icon position relative to the SVG and map container
  const iconX = circleX + svgRect.left - containerRect.left;
  const iconY = circleY + svgRect.top - containerRect.top;

  // Set the icon's initial position
  icon.style.left = `${iconX}px`;
  icon.style.top = `${iconY}px`;
};

// Call this function on page load to place the icon correctly
initializeIconPosition();

  // Function to display city information in an info box
  const displayCityInfo = (cityName, cityInfo, x, y) => {
    infoDisplay.innerHTML = ''; // Clear previous content

    // Create and style the h3 and p elements
    const h3 = document.createElement('h3');
    h3.classList.add('city-name');
    h3.textContent = cityName;

    const p = document.createElement('p');
    p.classList.add('city-info');
    p.textContent = cityInfo;

    // Append h3 and p to the info box
    infoDisplay.appendChild(h3);
    infoDisplay.appendChild(p);

    // Position the box next to the icon (right side of the circle icon)
    infoDisplay.style.left = `${x + 200}px`;  // Position 25px to the right of the icon
    infoDisplay.style.top = `${y - 20}px`;  // Adjust for better vertical alignment

    infoDisplay.style.display = 'block'; // Ensure the info box is visible
  };

  // Function to check if the icon is near a circle
  const checkIconPosition = () => {
    const iconRect = icon.getBoundingClientRect(); // Get the icon's bounding box

    circles.forEach((circle, index) => {
      const circleRect = circle.getBoundingClientRect(); // Get the circle's bounding box

      // Check if the icon is near the circle (a threshold of distance to be considered 'near')
      const distanceThreshold = 20;
      if (
        Math.abs(iconRect.left - circleRect.left) < distanceThreshold &&
        Math.abs(iconRect.top - circleRect.top) < distanceThreshold &&
        currentCircleIndex !== index // To prevent re-triggering if already showing info for this circle
      ) {
        const cityName = circle.getAttribute('data-city');
        const cityInfo = circle.getAttribute('city-info');
        const circlePosition = circle.getBoundingClientRect();

        // Show the info when the icon reaches the circle
        displayCityInfo(cityName, cityInfo, circlePosition.left, circlePosition.top);
        
        // Update the current circle index to prevent multiple triggers
        currentCircleIndex = index;
      }
    });
  };

  // Check the icon position periodically (for example, on every animation frame)
  setInterval(checkIconPosition, 100);

  // Call displayCityInfo inside the event where circles are clicked
  circles.forEach(circle => {
    circle.addEventListener('click', event => {
      const cityName = event.target.dataset.city;
      const cityInfo = event.target.getAttribute('city-info');
      const rect = event.target.getBoundingClientRect();
      displayCityInfo(cityName, cityInfo, rect.left + window.scrollX, rect.top + window.scrollY);
    });
  });

  const onStart = (e) => {
    if (e.target === icon) {
      dragging = true;

      // Prevent default only when dragging starts
      e.preventDefault();
    }
  };

  const onMove = (e) => {
    if (!dragging) return;

    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateIconPosition(clientX, clientY);

    // Prevent default only while dragging
    e.preventDefault();
  };

  const onEnd = () => {
    dragging = false;
  };

  icon.addEventListener('mousedown', onStart);
  icon.addEventListener('touchstart', onStart, { passive: false });

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: false });

  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);

  // Enable mouse scroll
  document.addEventListener('wheel', (e) => {
    if (!dragging) {
      e.stopPropagation(); // Allow scrolling
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const dagger = document.querySelector('.second-section_dagger img');
  const targetArea = document.querySelector('.target-area');
  const section = document.querySelector('.second-section');
  let isDragging = false;
  let startX, startY;
  let offsetX, offsetY;

  // Start dragging
  const onDragStart = (e) => {
    isDragging = true;
    // Calculate offset between the mouse and the dagger's top-left corner
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
    offsetX = dagger.offsetLeft - startX;
    offsetY = dagger.offsetTop - startY;

    // Prevent selection of text while dragging
    e.preventDefault();
  };

  // Move the dagger with the mouse/touch
  const onDragMove = (e) => {
    if (!isDragging) return;

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Calculate new position relative to the mouse/touch position
    const newX = clientX + offsetX;
    const newY = clientY + offsetY;

    // Set the new position of the dagger
    dagger.style.left = `${newX}px`;
    dagger.style.top = `${newY}px`;

    // Check if the dagger is inside the target area
    const daggerRect = dagger.getBoundingClientRect();
    const targetRect = targetArea.getBoundingClientRect();

    // Check if the dagger is inside the target area
    if (
      daggerRect.left < targetRect.right &&
      daggerRect.right > targetRect.left &&
      daggerRect.top < targetRect.bottom &&
      daggerRect.bottom > targetRect.top
    ) {
      // Change the background color of the section
      section.style.backgroundColor = '#1a1a1a'; // Off-black color
    } else {
      section.style.backgroundColor = ''; // Reset to default
    }
  };

  // Stop dragging
  const onDragEnd = () => {
    if (!isDragging) return;

    isDragging = false;

    // Get the final position of the dagger after dragging
    const daggerRect = dagger.getBoundingClientRect();
    const targetRect = targetArea.getBoundingClientRect();

    // If the dagger is inside the target area, snap it into place
    if (
      daggerRect.left < targetRect.right &&
      daggerRect.right > targetRect.left &&
      daggerRect.top < targetRect.bottom &&
      daggerRect.bottom > targetRect.top
    ) {
      // Snap the dagger to the bottom of the target area
      dagger.style.left = `${targetRect.left + (targetRect.width / 2) - (dagger.offsetWidth / 2)}px`;
      dagger.style.top = `${targetRect.top + (targetRect.height - dagger.offsetHeight)}px`;

      // Lock the dagger in place (optional)
      dagger.style.pointerEvents = 'none'; // Disable further interaction
    }
  };

  // Add event listeners for drag actions
  dagger.addEventListener('mousedown', onDragStart);
  dagger.addEventListener('touchstart', onDragStart, { passive: false });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
});