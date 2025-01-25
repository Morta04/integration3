const cards = document.querySelectorAll('.timeline-card');
const prevArrow = document.getElementById('prev');
const nextArrow = document.getElementById('next');

// Set the initial card index to 0 (showing the first card)
let currentCardIndex = 0;

// Function to show the current card and hide others
function updateCards() {
  cards.forEach((card, index) => {
    if (index === currentCardIndex) {
      card.classList.add('active');
      card.classList.remove('inactive');
    } else {
      card.classList.remove('active');
      card.classList.add('inactive');
    }
  });

  // Show/hide arrows based on the current card
  if (currentCardIndex === 0) {
    prevArrow.style.display = 'none'; // Hide the "Prev" arrow at the first card
  } else {
    prevArrow.style.display = 'block'; // Show the "Prev" arrow when not on the first card
  }

  if (currentCardIndex === cards.length - 1) {
    nextArrow.style.display = 'none'; // Hide the "Next" arrow at the last card
  } else {
    nextArrow.style.display = 'block'; // Show the "Next" arrow when not on the last card
  }
}

// Event listener for the "Next" arrow (show the next card)
nextArrow.addEventListener('click', function() {
  if (currentCardIndex < cards.length - 1) {
    currentCardIndex++;
    updateCards();
  }
});

// Event listener for the "Previous" arrow (show the previous card)
prevArrow.addEventListener('click', function() {
  if (currentCardIndex > 0) {
    currentCardIndex--;
    updateCards();
  }
});

// Initialize the cards and arrows on page load
updateCards();

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
  const dagger = document.querySelector('.second-section_dagger');
  const collageContainer = document.querySelector('.plantin');
  const section = document.querySelector('.second-section');
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  // Function to start dragging
  const onDragStart = (e) => {
    isDragging = true;

    // Get the initial mouse/touch position
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;

    // Calculate the offset between the cursor and the top-left corner of the dagger
    const rect = dagger.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;

    // Set the dagger to `absolute` to enable free movement
    dagger.style.position = 'absolute';

    // Prevent default behavior
    e.preventDefault();
  };

  // Function to move the dagger
  const onDragMove = (e) => {
    if (!isDragging) return;

    // Get current mouse/touch position
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Calculate the new position for the dagger based on cursor movement
    const moveX = clientX - offsetX;
    const moveY = clientY - offsetY;

    // Apply the new position to the dagger
    dagger.style.left = `${moveX}px`;
    dagger.style.top = `${moveY}px`;

    // Check if the dagger is inside the collage area
    const collageRect = collageContainer.getBoundingClientRect();
    const daggerRect = dagger.getBoundingClientRect();

    const isInsideCollage =
      daggerRect.left >= collageRect.left &&
      daggerRect.top >= collageRect.top &&
      daggerRect.right <= collageRect.right &&
      daggerRect.bottom <= collageRect.bottom;

    // Change the background color dynamically
    if (isInsideCollage) {
      section.style.backgroundColor = '#0F0F0F'; // Change to off-black
    } else {
      section.style.backgroundColor = ''; // Reset background color
    }
  };

  // Function to stop dragging
  const onDragEnd = () => {
    if (!isDragging) return;

    isDragging = false;

    // Check if the dagger is inside the collage container
    const collageRect = collageContainer.getBoundingClientRect();
    const daggerRect = dagger.getBoundingClientRect();

    const isInsideCollage =
      daggerRect.left >= collageRect.left &&
      daggerRect.top >= collageRect.top &&
      daggerRect.right <= collageRect.right &&
      daggerRect.bottom <= collageRect.bottom;

    // Keep background color changed if dagger is dropped inside the collage
    if (isInsideCollage) {
      section.style.backgroundColor = '#0F0F0F';
    } else {
      section.style.backgroundColor = ''; // Reset background if outside
    }
  };

  // Attach event listeners for drag start, move, and end
  dagger.addEventListener('mousedown', onDragStart);
  dagger.addEventListener('touchstart', onDragStart, { passive: false });

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchmove', onDragMove, { passive: false });

  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
});