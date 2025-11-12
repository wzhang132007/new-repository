// Navigation system
let currentPage = 'pg1';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial page
    showPage('pg1');
    
    // Add keyboard navigation (optional enhancement)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            navigateNext();
        } else if (e.key === 'ArrowLeft') {
            navigatePrevious();
        }
    });

    // Add swipe support for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            navigateNext();
        }
        if (touchEndX > touchStartX + 50) {
            navigatePrevious();
        }
    }
});

// Navigate to a specific page
function navigateTo(pageId) {
    if (currentPage === pageId) return;
    
    const pages = document.querySelectorAll('.page');
    
    // Add fade-out effect to current page
    const currentPageElement = document.getElementById(currentPage);
    if (currentPageElement) {
        currentPageElement.classList.remove('active');
    }
    
    // Show new page with fade-in effect
    setTimeout(() => {
        showPage(pageId);
    }, 100);
    
    currentPage = pageId;
}

// Show a specific page
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

// Navigate to next page
function navigateNext() {
    const pageOrder = ['pg1', 'pg2', 'pg3'];
    const currentIndex = pageOrder.indexOf(currentPage);
    const nextIndex = (currentIndex + 1) % pageOrder.length;
    navigateTo(pageOrder[nextIndex]);
}

// Navigate to previous page
function navigatePrevious() {
    const pageOrder = ['pg1', 'pg2', 'pg3'];
    const currentIndex = pageOrder.indexOf(currentPage);
    const prevIndex = (currentIndex - 1 + pageOrder.length) % pageOrder.length;
    navigateTo(pageOrder[prevIndex]);
}

// Add smooth entrance animation when page loads
window.addEventListener('load', function() {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        activePage.style.animation = 'fadeIn 0.8s ease-in-out';
    }
});

// Optional: Add parallax effect to images on mouse move
document.addEventListener('mousemove', function(e) {
    const images = document.querySelectorAll('.house-fly-lg img, .house-fly-sm img');
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    images.forEach(img => {
        img.style.transform = `translate(${moveX}px, ${moveY}px)`;
        img.style.transition = 'transform 0.3s ease';
    });
});

// Log current page for debugging
window.getCurrentPage = function() {
    console.log('Current page:', currentPage);
    return currentPage;
};

// Add CSS animation keyframes programmatically
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInFromLeft {
        from {
            opacity: 0;
            transform: translateX(-100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
