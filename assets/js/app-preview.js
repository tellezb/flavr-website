(function () {
    const section = document.querySelector('.app-preview');
    const viewport = document.querySelector('#app-preview-gallery');
    const controls = document.querySelector('.app-preview-controls');
    if (!section || !viewport || !controls) return;

    const images = Array.from(viewport.querySelectorAll('img'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canObserve = 'IntersectionObserver' in window;
    let visible = false;
    let timer = null;
    let lastInteraction = null;
    const activePointers = new Set();
    let touchActive = false;

    function cloneImage(image) {
        const clone = image.cloneNode(true);
        clone.alt = '';
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        return clone;
    }

    // Keep a full copy on each side so centering and wrapping show adjacent slides.
    const leadingClones = images.map(cloneImage);
    const trailingClones = images.map(cloneImage);
    viewport.prepend(...leadingClones);
    viewport.append(...trailingClones);
    viewport.classList.add('app-preview-grid--enhanced');
    const slides = Array.from(viewport.querySelectorAll('img'));
    let activeIndex = 0;
    let settleTimer = null;

    const centerOf = (image) => image.offsetLeft + image.offsetWidth / 2 - viewport.clientWidth / 2;
    const loopWidth = () => centerOf(trailingClones[0]) - centerOf(images[0]);
    const scrollToSlide = (image, behavior) => {
        viewport.scrollTo({ left: centerOf(image), behavior });
    };

    slides.forEach((image) => {
        const activate = () => {
            interact();
            scrollToSlide(image, reducedMotion.matches ? 'instant' : 'smooth');
        };
        image.addEventListener('click', activate);
        if (image.hasAttribute('aria-hidden')) return;
        image.setAttribute('role', 'button');
        image.tabIndex = 0;
        image.setAttribute('aria-label', `Show app preview: ${image.alt}`);
        image.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            activate();
        });
    });

    const buttons = images.map((image, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-controls', viewport.id);
        button.setAttribute('aria-label', `Show app preview ${index + 1} of ${images.length}: ${image.alt}`);
        button.addEventListener('click', () => {
            interact();
            const choices = [leadingClones[index], image, trailingClones[index]];
            const target = choices.reduce((closest, candidate) =>
                Math.abs(centerOf(candidate) - viewport.scrollLeft) < Math.abs(centerOf(closest) - viewport.scrollLeft)
                    ? candidate : closest);
            scrollToSlide(target, reducedMotion.matches ? 'instant' : 'smooth');
        });
        controls.appendChild(button);
        return button;
    });

    function updateCurrent() {
        let closest = 0;
        let distance = Infinity;
        slides.forEach((image, index) => {
            const nextDistance = Math.abs(centerOf(image) - viewport.scrollLeft);
            if (nextDistance < distance) {
                closest = index;
                distance = nextDistance;
            }
        });
        activeIndex = closest;
        slides.forEach((image, index) => image.classList.toggle('app-preview-active', index === closest));
        buttons.forEach((button, index) => {
            if (index === closest % images.length) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
    }

    function normalizePosition() {
        const width = loopWidth();
        if (!width) return;
        const first = centerOf(images[0]);
        const last = centerOf(trailingClones[0]);
        if (viewport.scrollLeft < first - 2) {
            viewport.classList.add('app-preview-grid--normalizing');
            viewport.scrollLeft += width;
        } else if (viewport.scrollLeft >= last - 2) {
            viewport.classList.add('app-preview-grid--normalizing');
            viewport.scrollLeft -= width;
        }
        updateCurrent();
        if (viewport.classList.contains('app-preview-grid--normalizing')) {
            void viewport.offsetWidth;
            viewport.classList.remove('app-preview-grid--normalizing');
        }
    }

    function stopTimer() {
        if (timer !== null) clearTimeout(timer);
        timer = null;
    }

    function updateMotion() {
        if (canObserve && !reducedMotion.matches && visible && !document.hidden && activePointers.size === 0 && !touchActive) {
            if (timer === null) {
                const delay = lastInteraction === null
                    ? 3000
                    : Math.max(0, 5000 - (performance.now() - lastInteraction));
                timer = setTimeout(() => {
                    timer = null;
                    lastInteraction = null;
                    advance();
                    updateMotion();
                }, delay);
            }
        } else {
            stopTimer();
        }
    }

    function interact() {
        lastInteraction = performance.now();
        stopTimer();
        updateMotion();
    }

    function interrupt() {
        viewport.scrollTo({ left: viewport.scrollLeft, behavior: 'instant' });
        interact();
    }

    function advance() {
        normalizePosition();
        const target = slides[Math.min(activeIndex + 1, slides.length - 1)];
        scrollToSlide(target, 'smooth');
    }

    viewport.addEventListener('scroll', () => {
        updateCurrent();
        clearTimeout(settleTimer);
        settleTimer = setTimeout(normalizePosition, 500);
    });
    function startPointerInteraction(event) {
        activePointers.add(event.pointerId);
        interrupt();
    }

    function endPointerInteraction(event) {
        if (activePointers.delete(event.pointerId)) interact();
    }

    viewport.addEventListener('pointerdown', startPointerInteraction);
    controls.addEventListener('pointerdown', startPointerInteraction);
    window.addEventListener('pointerup', endPointerInteraction);
    window.addEventListener('pointercancel', endPointerInteraction);
    window.addEventListener('resize', () => {
        scrollToSlide(images[activeIndex % images.length], 'instant');
        updateCurrent();
    });
    viewport.addEventListener('touchstart', () => {
        touchActive = true;
        interact();
    }, { passive: true });
    viewport.addEventListener('touchmove', interact, { passive: true });
    function endTouchInteraction(event) {
        touchActive = event.touches.length > 0;
        interact();
    }
    viewport.addEventListener('touchend', endTouchInteraction, { passive: true });
    viewport.addEventListener('touchcancel', endTouchInteraction, { passive: true });
    viewport.addEventListener('wheel', interrupt, { passive: true });
    viewport.addEventListener('keydown', interrupt);
    controls.addEventListener('keydown', interrupt);
    viewport.addEventListener('focusin', interrupt);
    controls.addEventListener('focusin', interrupt);
    window.addEventListener('blur', () => {
        activePointers.clear();
        touchActive = false;
        interact();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            activePointers.clear();
            touchActive = false;
        }
        updateMotion();
    });
    reducedMotion.addEventListener('change', updateMotion);

    controls.hidden = false;
    scrollToSlide(images[0], 'instant');
    updateCurrent();
    if (canObserve) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                visible = entry.isIntersecting;
                if (visible && section.classList.contains('app-preview--pending')) {
                    section.classList.remove('app-preview--pending');
                    section.classList.add('app-preview--visible');
                }
                updateMotion();
            });
        });
        if (!reducedMotion.matches) section.classList.add('app-preview--pending');
        observer.observe(section);
    }
    updateMotion();
})();
