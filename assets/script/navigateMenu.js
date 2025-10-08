// =========================================================
// MENU SLIDER NAVIGATION
// =========================================================

(function () {
    // ========== DOM ELEMENTS ==========
    const menuGrid = document.querySelector('.menu__grid');
    const cards = document.querySelectorAll('.menu__card');
    const leftArrow = document.querySelector('.menu__arrow--left');
    const rightArrow = document.querySelector('.menu__arrow--right');
    const dots = document.querySelectorAll('.menu__dot');

    // ========== STATE ==========
    let currentIndex = 0;
    let cardsPerView = 1; // Mặc định mobile: 1 card
    let totalCards = cards.length;

    // ========== CALCULATE CARDS PER VIEW (responsive) ==========
    function updateCardsPerView() {
        const width = window.innerWidth;

        if (width >= 1024) {
            // Desktop: 3 cards
            cardsPerView = 3;
        } else if (width >= 768) {
            // Tablet: 2 cards
            cardsPerView = 2;
        } else {
            // Mobile: 1 card
            cardsPerView = 1;
        }

        // Reset về slide đầu khi resize
        currentIndex = 0;
        updateSlider();
        updateDots();
    }

    // ========== UPDATE SLIDER POSITION ==========
    function updateSlider() {
        // Tính toán số cards tối đa có thể slide
        const maxIndex = Math.max(0, totalCards - cardsPerView);

        // Giới hạn currentIndex
        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }
        if (currentIndex < 0) {
            currentIndex = 0;
        }

        // Tính toán translateX
        // Mỗi card chiếm (100% / cardsPerView) + gap
        const cardWidthPx = cards[0].offsetWidth;
        const gapPx = parseFloat(getComputedStyle(menuGrid).gap) || 0;
        const translateX = -(currentIndex * (cardWidthPx + gapPx));

        menuGrid.style.transform = `translateX(${translateX}px)`;

        // Update arrow states
        updateArrowStates();
    }

    // ========== UPDATE ARROW STATES (disable when at end) ==========
    function updateArrowStates() {
        const maxIndex = Math.max(0, totalCards - cardsPerView);

        // Left arrow
        if (leftArrow) {
            if (currentIndex <= 0) {
                leftArrow.style.opacity = '0.3';
                leftArrow.style.pointerEvents = 'none';
            } else {
                leftArrow.style.opacity = '1';
                leftArrow.style.pointerEvents = 'auto';
            }
        }

        // Right arrow
        if (rightArrow) {
            if (currentIndex >= maxIndex) {
                rightArrow.style.opacity = '0.3';
                rightArrow.style.pointerEvents = 'none';
            } else {
                rightArrow.style.opacity = '1';
                rightArrow.style.pointerEvents = 'auto';
            }
        }
    }

    // ========== UPDATE DOTS (for mobile/tablet) ==========
    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('menu__dot--active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('menu__dot--active');
                dot.setAttribute('aria-current', 'false');
            }
        });
    }

    // ========== NAVIGATION: PREVIOUS ==========
    function goToPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
            updateDots();
        }
    }

    // ========== NAVIGATION: NEXT ==========
    function goToNext() {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlider();
            updateDots();
        }
    }

    // ========== NAVIGATION: GO TO SPECIFIC SLIDE (for dots) ==========
    function goToSlide(index) {
        const maxIndex = Math.max(0, totalCards - cardsPerView);
        currentIndex = Math.min(index, maxIndex);
        updateSlider();
        updateDots();
    }

    // ========== EVENT LISTENERS ==========

    // Arrow navigation
    if (leftArrow) {
        leftArrow.addEventListener('click', goToPrev);
    }
    if (rightArrow) {
        rightArrow.addEventListener('click', goToNext);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToPrev();
        } else if (e.key === 'ArrowRight') {
            goToNext();
        }
    });

    // Window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateCardsPerView();
        }, 250);
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    menuGrid.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    menuGrid.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum swipe distance

        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left: next
            goToNext();
        }

        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right: prev
            goToPrev();
        }
    }

    // ========== INITIALIZE ==========
    updateCardsPerView();
    updateDots();

    console.log('✅ Menu slider initialized');
})(); s