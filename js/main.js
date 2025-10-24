/**
 * Main JavaScript for Cafeteria im Immanuel Krankenhaus Website
 * Handles navigation, scroll effects, form validation, and dynamic content
 */

// ===================================
// Global State
// ===================================
const state = {
    isNavOpen: false,
    currentSection: 'home',
    menuData: null,
    reviewsData: null
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    scrollTop: document.getElementById('scrollTop'),
    contactForm: document.getElementById('contactForm'),
    menuContent: document.getElementById('menuContent'),
    reviewsContent: document.getElementById('reviewsContent')
};

// ===================================
// Navigation Functions
// ===================================
function initNavigation() {
    // Mobile menu toggle
    if (elements.navToggle) {
        elements.navToggle.addEventListener('click', toggleMobileMenu);
    }

    // Smooth scrolling for navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile menu after click
                if (state.isNavOpen) {
                    toggleMobileMenu();
                }

                // Update active link
                updateActiveLink(link);
            }
        });
    });

    // Update navbar on scroll
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();
}

function toggleMobileMenu() {
    state.isNavOpen = !state.isNavOpen;
    elements.navMenu.classList.toggle('active');
    elements.navToggle.classList.toggle('active');

    // Prevent body scroll when menu is open
    document.body.style.overflow = state.isNavOpen ? 'hidden' : '';
}

function updateActiveLink(activeLink) {
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function handleScroll() {
    const scrollPosition = window.scrollY;

    // Add shadow to navbar when scrolled
    if (scrollPosition > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }

    // Show/hide scroll to top button
    if (elements.scrollTop) {
        if (scrollPosition > 300) {
            elements.scrollTop.classList.add('visible');
        } else {
            elements.scrollTop.classList.remove('visible');
        }
    }

    // Update active section
    updateActiveSection();
}

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink && !activeLink.classList.contains('active')) {
                updateActiveLink(activeLink);
            }
        }
    });
}

// ===================================
// Scroll to Top
// ===================================
function initScrollToTop() {
    if (elements.scrollTop) {
        elements.scrollTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===================================
// Menu Loading
// ===================================
async function loadMenu() {
    try {
        const response = await fetch('data/menu.json');
        state.menuData = await response.json();
        renderMenu();
    } catch (error) {
        console.error('Error loading menu:', error);
        renderMenuFallback();
    }
}

function renderMenu() {
    if (!state.menuData || !elements.menuContent) return;

    const menuHTML = state.menuData.categories.map(category => `
        <div class="menu-category">
            <div class="menu-category-header">
                <i class="fas fa-${category.icon}"></i>
                <h3>${category.name}</h3>
            </div>
            <div class="menu-items">
                ${category.items.map(item => `
                    <div class="menu-item">
                        <div class="menu-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                        </div>
                        <div class="menu-item-price">${item.price}€</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    elements.menuContent.innerHTML = menuHTML;
    animateMenuItems();
}

function renderMenuFallback() {
    if (!elements.menuContent) return;

    elements.menuContent.innerHTML = `
        <div class="menu-category">
            <div class="menu-category-header">
                <i class="fas fa-coffee"></i>
                <h3>Unsere Spezialitäten</h3>
            </div>
            <p style="padding: var(--spacing-md); color: var(--text-light);">
                Besuchen Sie uns für unsere täglich frischen hausgemachten Kuchen,
                Suppen und aromatischen Kaffee. Rufen Sie uns an für tagesaktuelle Angebote!
            </p>
        </div>
    `;
}

function animateMenuItems() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.menu-category').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease';
        observer.observe(item);
    });
}

// ===================================
// Reviews Loading
// ===================================
async function loadReviews() {
    try {
        const response = await fetch('data/reviews.json');
        state.reviewsData = await response.json();
        renderReviews();
    } catch (error) {
        console.error('Error loading reviews:', error);
        renderReviewsFallback();
    }
}

function renderReviews() {
    if (!state.reviewsData || !elements.reviewsContent) return;

    const reviewsHTML = state.reviewsData.testimonials.map(review => `
        <div class="review-card">
            <div class="review-rating">
                ${generateStars(review.rating)}
            </div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">${review.author}</div>
            <div class="review-date">${review.date}</div>
        </div>
    `).join('');

    elements.reviewsContent.innerHTML = reviewsHTML;
    animateReviews();
}

function generateStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function renderReviewsFallback() {
    if (!elements.reviewsContent) return;

    elements.reviewsContent.innerHTML = `
        <div class="review-card">
            <div class="review-rating">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
            </div>
            <p class="review-text">"Ein gemütlicher Ort für eine Kaffeepause. Die hausgemachten Kuchen sind immer frisch und lecker."</p>
            <div class="review-author">Stammgast</div>
            <div class="review-date">2025</div>
        </div>
    `;
}

function animateReviews() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.review-card').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease';
        observer.observe(item);
    });
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
    if (!elements.contactForm) return;

    elements.contactForm.addEventListener('submit', handleFormSubmit);

    // Add real-time validation
    const inputs = elements.contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

function handleFormSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const formData = new FormData(elements.contactForm);
    const data = Object.fromEntries(formData);

    if (validateForm(data)) {
        // Show success message
        showFormMessage('Vielen Dank für Ihre Nachricht! Wir werden uns bald bei Ihnen melden.', 'success');

        // Reset form
        elements.contactForm.reset();

        // In production, you would send the data to a server
        console.log('Form data:', data);
    } else {
        showFormMessage('Bitte füllen Sie alle erforderlichen Felder korrekt aus.', 'error');
    }
}

function validateForm(data) {
    let isValid = true;

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
        setFieldError(document.getElementById('name'), 'Bitte geben Sie Ihren Namen ein');
        isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        setFieldError(document.getElementById('email'), 'Bitte geben Sie eine gültige E-Mail-Adresse ein');
        isValid = false;
    }

    // Validate message
    if (!data.message || data.message.trim().length < 10) {
        setFieldError(document.getElementById('message'), 'Bitte geben Sie eine Nachricht ein (mindestens 10 Zeichen)');
        isValid = false;
    }

    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const name = field.name;

    if (name === 'name' && value.length < 2) {
        setFieldError(field, 'Name ist zu kurz');
        return false;
    }

    if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setFieldError(field, 'Ungültige E-Mail-Adresse');
            return false;
        }
    }

    if (name === 'message' && value.length < 10) {
        setFieldError(field, 'Nachricht ist zu kurz');
        return false;
    }

    clearFieldError(field);
    return true;
}

function setFieldError(field, message) {
    clearFieldError(field);

    field.style.borderColor = '#e74c3c';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#e74c3c';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    errorDiv.textContent = message;

    field.parentElement.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '';

    const errorDiv = field.parentElement.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function showFormMessage(message, type) {
    // Remove existing message
    const existingMessage = elements.contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message';
    messageDiv.style.padding = 'var(--spacing-md)';
    messageDiv.style.borderRadius = 'var(--radius-sm)';
    messageDiv.style.marginTop = 'var(--spacing-md)';
    messageDiv.style.fontWeight = '500';

    if (type === 'success') {
        messageDiv.style.background = '#d4edda';
        messageDiv.style.color = '#155724';
        messageDiv.style.border = '1px solid #c3e6cb';
    } else {
        messageDiv.style.background = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
    }

    messageDiv.textContent = message;
    elements.contactForm.appendChild(messageDiv);

    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}

// ===================================
// Intersection Observer for Animations
// ===================================
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Observe sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });
}

// ===================================
// Utility Functions
// ===================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===================================
// Initialize Everything
// ===================================
function init() {
    console.log('Initializing Cafeteria Website...');

    // Initialize navigation
    initNavigation();

    // Initialize scroll to top
    initScrollToTop();

    // Load dynamic content
    loadMenu();
    loadReviews();

    // Initialize contact form
    initContactForm();

    // Initialize animations
    initAnimations();

    console.log('Website initialized successfully!');
}

// ===================================
// Run when DOM is ready
// ===================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===================================
// Handle page visibility changes
// ===================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden');
    } else {
        console.log('Page visible');
    }
});

// ===================================
// Export for potential module use
// ===================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { init, state };
}
