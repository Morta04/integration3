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

  // Helper function to find the closest point on the SVG path
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

  // Function to update the ship's position as it follows the path
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

  // Auto-scroll functionality when the user moves too close to the edge
  const autoScroll = (clientY) => {
    const scrollMargin = 50;
    const scrollSpeed = 10;

    if (clientY < scrollMargin) {
      window.scrollBy(0, -scrollSpeed);
    } else if (clientY > window.innerHeight - scrollMargin) {
      window.scrollBy(0, scrollSpeed);
    }
  };

  // Handle the start of dragging
  const onStart = (e) => {
    dragging = true;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateShipPosition(clientX, clientY);
  };

  // Handle dragging movement
  const onMove = (e) => {
    if (!dragging) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    updateShipPosition(clientX, clientY);
    autoScroll(clientY);
  };

  // Handle the end of dragging
  const onEnd = () => {
    dragging = false;
  };

  // Event listeners for mouse and touch events
  ship.addEventListener('mousedown', onStart);
  ship.addEventListener('touchstart', onStart);

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove);

  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);

  // Responsive art direction: Change SVG path based on window width
  const updatePathForDevice = () => {
    const width = window.innerWidth;

    // Mobile path (for width <= 390px)
    if (width <= 390) {
      path.setAttribute('d', 'M114 3.5C82.8333 24.1667 38.5 57 20 102C-0.694763 152.339 1.50001 238 10.5 257C19.5 276 22.5 327.299 79.5 355C133 381 31.5 380 16 449C0.499994 518 20 565.5 28 582C34.4 595.2 56.5 613.5 68.5 619.5'); // Mobile path (390px)
    } 
    // Desktop path (for width >= 1440px)
    else if (width >= 1440) {
      path.setAttribute('d', 'M945.5 1C956.167 97.6667 943.782 303.144 905.5 374C848.5 479.5 634.667 533.667 516.5 551.5C418 566.667 245 560 167.5 612C105.082 653.881 22 775.5 7.99998 874C-3.20002 952.8 32 1064.17 51 1110C59 1135 88.8 1193.7 144 1228.5'); // Desktop path (1440px)
    } 
    // Tablet path (optional for widths between 390px and 1440px)
    else {
      path.setAttribute('d', 'M114 3.5C82.8333 24.1667 38.5 57 20 102C-0.694763 152.339 1.50001 238 10.5 257C19.5 276 22.5 327.299 79.5 355C133 381 31.5 380 16 449C0.499994 518 20 565.5 28 582C34.4 595.2 56.5 613.5 68.5 619.5'); // Default path for tablet sizes
    }
  };

  // Update path on window resize
  window.addEventListener('resize', updatePathForDevice);

  // Initial path update based on current screen size
  updatePathForDevice();
});

document.addEventListener('DOMContentLoaded', () => {
      const draggable = document.getElementById('draggable');
      const path = document.getElementById('desktopPath');
      const circles = document.querySelectorAll('.desktop-circle circle');
      
      gsap.registerPlugin(Draggable, MotionPathPlugin);

      Draggable.create(draggable, {
        type: "x,y",
        bounds: ".interaction-container",
        onDrag: function() {
          gsap.to(draggable, { x: this.x, y: this.y });
        },
        onPress: () => gsap.to(draggable, { scale: 1.1, duration: 0.3 }),
        onRelease: () => {
          gsap.to(draggable, { scale: 1, duration: 0.3 });

          // Find the nearest circle to snap to
          let closestCircle = null;
          let closestDist = Infinity;
          circles.forEach(circle => {
            const rect = circle.getBoundingClientRect();
            const circleCenter = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
            const dist = Math.hypot(circleCenter.x - this.x, circleCenter.y - this.y);
            if (dist < closestDist) {
              closestDist = dist;
              closestCircle = circle;
            }
          });

          if (closestCircle) {
            const city = closestCircle.getAttribute('data-city');
            const cityInfo = closestCircle.getAttribute('city-info');
            alert(`City: ${city}\nInfo: ${cityInfo}`);
            gsap.to(draggable, {
              x: closestCircle.getAttribute('cx') - 14.5,  // Adjust for circle's radius
              y: closestCircle.getAttribute('cy') - 14.5,
              duration: 0.5
            });
          }
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

const init = () => {
      const $nav = document.querySelector('.navbar');
      const $navButton = document.querySelector('.nav__button');
      const $navList = document.querySelector('.nav__list');
      const $iconLink = document.querySelector('#iconlink');
      const listItems = $navList.querySelectorAll("li a");

      // Hide the noscript popup when JavaScript is enabled
      document.querySelector('.noscript-popup').classList.add('hidden');

      $navButton.classList.remove('hidden');
      $navList.classList.add("hidden");

      const openNavigation = () => {
        $navButton.setAttribute("aria-expanded", "true");
        $iconLink.setAttribute("xlink:href", "#close");
        $navList.classList.remove("hidden");
        $nav.classList.add('navbar--fixed');
      }

      const closeNavigation = () => {
        $navButton.setAttribute("aria-expanded", "false");
        $iconLink.setAttribute("xlink:href", "#navicon");
        $navList.classList.add("hidden");
        $nav.classList.remove('navbar--fixed');
      }

      const toggleNavigation = () => {
        const open = $navButton.getAttribute("aria-expanded");
        open === "false" ? openNavigation() : closeNavigation();
      }

      const handleBlur = () => {
        closeNavigation();
      }

      $navButton.addEventListener("click", toggleNavigation);

      // Add event to the last item in the nav list to close the nav when tabbing out
      listItems[listItems.length - 1].addEventListener("blur", handleBlur);

      // Close the nav when the escape key is pressed
      window.addEventListener("keyup", (e) => {
        if (e.key === "Escape") {
          $navButton.focus();
          closeNavigation();
        }
      });
    }

    init();