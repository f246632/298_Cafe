/**
 * Gallery JavaScript for Cafeteria Website
 * Handles image gallery interactions and lightbox functionality
 */

// ===================================
// Gallery State
// ===================================
const galleryState = {
    currentIndex: 0,
    images: [],
    lightboxOpen: false
};

// ===================================
// Gallery Initialization
// ===================================
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryItems.length === 0) return;

    // Store gallery images
    galleryState.images = Array.from(galleryItems);

    // Add click handlers
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));

        // Add keyboard accessibility
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `View image ${index + 1}`);

        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    // Create lightbox element
    createLightbox();

    // Animate gallery items on scroll
    animateGalleryItems();

    console.log('Gallery initialized with', galleryItems.length, 'items');
}

// ===================================
// Lightbox Creation
// ===================================
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image gallery lightbox');

    lightbox.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close lightbox">
                <i class="fas fa-times"></i>
            </button>
            <button class="lightbox-prev" aria-label="Previous image">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="lightbox-next" aria-label="Next image">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="lightbox-image-container">
                <div class="lightbox-image"></div>
            </div>
            <div class="lightbox-caption"></div>
            <div class="lightbox-counter"></div>
        </div>
    `;

    document.body.appendChild(lightbox);

    // Add event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrevImage);
    lightbox.querySelector('.lightbox-next').addEventListener('click', showNextImage);
    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);

    // Keyboard navigation
    document.addEventListener('keydown', handleLightboxKeyboard);

    // Prevent scroll when lightbox is open
    lightbox.addEventListener('wheel', (e) => {
        if (galleryState.lightboxOpen) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ===================================
// Lightbox Functions
// ===================================
function openLightbox(index) {
    galleryState.currentIndex = index;
    galleryState.lightboxOpen = true;

    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'flex';

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Show image
    showImage(index);

    // Animate in
    setTimeout(() => {
        lightbox.classList.add('active');
    }, 10);

    // Focus on close button for accessibility
    lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');

    setTimeout(() => {
        lightbox.style.display = 'none';
        galleryState.lightboxOpen = false;

        // Restore body scroll
        document.body.style.overflow = '';

        // Return focus to the gallery item
        if (galleryState.images[galleryState.currentIndex]) {
            galleryState.images[galleryState.currentIndex].focus();
        }
    }, 300);
}

function showImage(index) {
    const imageContainer = document.querySelector('.lightbox-image');
    const caption = document.querySelector('.lightbox-caption');
    const counter = document.querySelector('.lightbox-counter');

    const item = galleryState.images[index];
    const placeholder = item.querySelector('.gallery-placeholder');

    // Clone the placeholder content for lightbox
    imageContainer.innerHTML = placeholder.innerHTML;

    // Update caption
    const captionText = placeholder.querySelector('p')?.textContent || '';
    caption.textContent = captionText;

    // Update counter
    counter.textContent = `${index + 1} / ${galleryState.images.length}`;

    // Update navigation button states
    updateNavigationButtons();
}

function showPrevImage() {
    galleryState.currentIndex = (galleryState.currentIndex - 1 + galleryState.images.length) % galleryState.images.length;
    showImage(galleryState.currentIndex);
}

function showNextImage() {
    galleryState.currentIndex = (galleryState.currentIndex + 1) % galleryState.images.length;
    showImage(galleryState.currentIndex);
}

function updateNavigationButtons() {
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    // Always show buttons in circular navigation
    prevBtn.style.opacity = '1';
    nextBtn.style.opacity = '1';
}

function handleLightboxKeyboard(e) {
    if (!galleryState.lightboxOpen) return;

    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowLeft':
            showPrevImage();
            break;
        case 'ArrowRight':
            showNextImage();
            break;
    }
}

// ===================================
// Gallery Animations
// ===================================
function animateGalleryItems() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px) scale(0.95)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(item);
    });
}

// ===================================
// Gallery Filtering (Future Enhancement)
// ===================================
function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');

    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px) scale(0.95)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// ===================================
// Lazy Loading Images (Future Enhancement)
// ===================================
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');

                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===================================
// Touch/Swipe Support for Mobile
// ===================================
function initTouchSupport() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                showNextImage();
            } else {
                // Swipe right - previous image
                showPrevImage();
            }
        }
    }
}

// ===================================
// Lightbox Styles (Injected)
// ===================================
function injectLightboxStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .lightbox {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .lightbox.active {
            opacity: 1;
        }

        .lightbox-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
        }

        .lightbox-content {
            position: relative;
            width: 90%;
            max-width: 1200px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 10000;
        }

        .lightbox-close,
        .lightbox-prev,
        .lightbox-next {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .lightbox-close {
            top: 20px;
            right: 20px;
        }

        .lightbox-prev {
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
        }

        .lightbox-next {
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }

        .lightbox-close:hover,
        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-50%) scale(1.1);
        }

        .lightbox-close:hover {
            transform: scale(1.1);
        }

        .lightbox-image-container {
            width: 100%;
            max-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 20px 0;
        }

        .lightbox-image {
            max-width: 100%;
            max-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .lightbox-image .gallery-placeholder {
            min-height: 400px;
            width: 100%;
        }

        .lightbox-caption {
            color: white;
            font-size: 1.25rem;
            margin-top: 1rem;
            text-align: center;
        }

        .lightbox-counter {
            color: rgba(255, 255, 255, 0.7);
            font-size: 1rem;
            margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
            .lightbox-prev,
            .lightbox-next {
                width: 40px;
                height: 40px;
                font-size: 1.25rem;
            }

            .lightbox-prev {
                left: 10px;
            }

            .lightbox-next {
                right: 10px;
            }

            .lightbox-close {
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                font-size: 1.25rem;
            }

            .lightbox-caption {
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Initialize Gallery
// ===================================
function init() {
    console.log('Initializing Gallery...');
    injectLightboxStyles();
    initGallery();
    initTouchSupport();
    initLazyLoading();
    console.log('Gallery initialized successfully!');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGallery, filterGallery };
}
