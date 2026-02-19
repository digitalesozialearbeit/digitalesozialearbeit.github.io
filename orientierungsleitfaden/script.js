// --- DYNAMIC SCROLL OFFSET ---
function getScrollOffset() {
    return (_abBar ? _abBar.offsetHeight : 250) + 20;
}
function updateScrollOffset() {
    document.documentElement.style.setProperty('--scroll-offset', getScrollOffset() + 'px');
}

// --- SEARCH FUNCTIONALITY ---
let currentMatchIndex = -1;

function clearHighlights() {
    currentMatchIndex = -1;
    document.querySelectorAll('.search-highlight').forEach(el => {
        const parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
}

function highlightText(element, searchTerm) {
    if (!searchTerm) return;

    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    textNodes.forEach(node => {
        if (node.parentNode.classList && node.parentNode.classList.contains('search-highlight')) return;
        if (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE') return;

        const text = node.textContent;
        const regex = new RegExp(`(${escapedTerm})`, 'gi');

        if (!regex.test(text)) return;

        // Reset regex after test
        regex.lastIndex = 0;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            const mark = document.createElement('mark');
            mark.className = 'search-highlight';
            mark.textContent = match[0];
            fragment.appendChild(mark);
            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        if (fragment.childNodes.length > 0) {
            node.parentNode.replaceChild(fragment, node);
        }
    });
}

function filterContent() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const filter = input.value.trim();
    const filterUpper = filter.toUpperCase();
    const main = document.getElementById('main-content');
    if (!main) return;

    const sections = main.getElementsByTagName('section');

    clearHighlights();

    if (filter === "") {
        for (let i = 0; i < sections.length; i++) {
            sections[i].classList.remove('hidden');
        }
        return;
    }

    for (let i = 0; i < sections.length; i++) {
        const txtValue = sections[i].textContent || sections[i].innerText;
        if (txtValue.toUpperCase().indexOf(filterUpper) > -1) {
            sections[i].classList.remove('hidden');
            highlightText(sections[i], filter);
        } else {
            sections[i].classList.add('hidden');
        }
    }

    // Scroll to first match
    currentMatchIndex = 0;
    scrollToMatch(0);
}

function scrollToMatch(index) {
    const matches = document.querySelectorAll('.search-highlight');
    if (matches.length === 0) return;

    // Wrap around
    if (index >= matches.length) index = 0;
    if (index < 0) index = matches.length - 1;

    currentMatchIndex = index;

    const match = matches[index];
    const offset = getScrollOffset();
    const elementPosition = match.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
    });
}

function nextMatch() {
    const matches = document.querySelectorAll('.search-highlight');
    if (matches.length === 0) return;

    currentMatchIndex++;
    if (currentMatchIndex >= matches.length) currentMatchIndex = 0;
    scrollToMatch(currentMatchIndex);
}

function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        nextMatch();
    }
}

// --- NAVIGATION RESET ---
function resetSearchAndShowAll() {
    // Clear search input
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
    }

    // Clear highlights
    clearHighlights();

    // Show all sections
    const main = document.getElementById('main-content');
    if (main) {
        const sections = main.getElementsByTagName('section');
        for (let i = 0; i < sections.length; i++) {
            sections[i].classList.remove('hidden');
        }
    }
}

function smoothScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var diff = targetY - startY;
    var start = null;
    function step(ts) {
        if (!start) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        // easeOutCubic
        var ease = 1 - Math.pow(1 - t, 3);
        window.scrollTo(0, startY + diff * ease);
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function scrollToAnchor(href) {
    if (!href || !href.startsWith('#')) return;
    var target = document.getElementById(href.substring(1));
    if (!target) return;
    // First scroll: use current offset
    var offset = getScrollOffset();
    var y = target.getBoundingClientRect().top + window.scrollY - offset;
    var distance = Math.abs(y - window.scrollY);
    var duration = Math.min(600, Math.max(300, distance * 0.3));
    smoothScrollTo(y, duration);
    // Correction: after bar settles, re-check position
    setTimeout(function() {
        var correctedY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
        if (Math.abs(correctedY - window.scrollY) > 10) {
            smoothScrollTo(correctedY, 150);
        }
    }, duration + 50);
}

function initNavLinks() {
    // Global handler for ALL internal anchor links
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        // Reset search if clicking nav/card links
        if (link.classList.contains('nav-link') || link.classList.contains('q-card')) {
            resetSearchAndShowAll();
        }
        // Immediately expand correct sub-menu + highlight on nav click + lock scrollspy
        if (link.classList.contains('nav-link') && link.hasAttribute('data-section')) {
            var sectionId = link.getAttribute('data-section');
            _navClickLock = true;
            // Set active highlight immediately
            document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
            link.classList.add('active');
            // Expand correct sub-menu
            document.querySelectorAll('.nav-sub-list').forEach(function(ul) {
                var parentLink = ul.previousElementSibling;
                if (parentLink && parentLink.getAttribute('data-section') === sectionId) {
                    ul.classList.add('expanded');
                } else {
                    ul.classList.remove('expanded');
                }
            });
            setTimeout(function() { _navClickLock = false; }, 800);
        }
        scrollToAnchor(href);
    });
}

// --- SCROLL SPY ---
var _navSubAnchors = []; // cached: all h3 IDs that have a nav-sub link
var _navClickLock = false; // block sub-menu changes during nav scroll animation

function updateScrollSpy() {
    var spySections = document.querySelectorAll('section');
    var spyLinks = document.querySelectorAll('.nav-link');
    var spyCards = document.querySelectorAll('.q-card');
    var subLists = document.querySelectorAll('.nav-sub-list');

    var currentSectionId = "";
    var currentSubId = "";
    var offset = getScrollOffset();

    // 1. Find active section
    spySections.forEach(function(section) {
        if (window.scrollY >= (section.offsetTop - offset)) {
            currentSectionId = section.getAttribute('id');
        }
    });

    // 2. Find active sub-anchor within section
    _navSubAnchors.forEach(function(id) {
        var el = document.getElementById(id);
        if (el && window.scrollY >= (el.offsetTop - offset)) {
            currentSubId = id;
        }
    });

    // Show/hide sidebar based on whether we've reached content
    var aside = document.querySelector('aside');
    if (aside) {
        if (currentSectionId) {
            aside.classList.add('visible');
        } else {
            aside.classList.remove('visible');
        }
    }

    // 3+4: Skip link highlighting and sub-menu changes during nav click lock
    if (_navClickLock) return;

    // 3. Update sidebar links — highlight section + sub-item
    spyLinks.forEach(function(link) {
        link.classList.remove('active');
        var href = link.getAttribute('href');
        if (href === '#' + currentSubId && link.classList.contains('nav-sub')) {
            link.classList.add('active');
        } else if (href === '#' + currentSectionId && link.hasAttribute('data-section')) {
            link.classList.add('active');
        }
    });

    // 4. Auto-expand: show sub-list for active section only
    {
        subLists.forEach(function(ul) {
            var parentLink = ul.previousElementSibling;
            if (parentLink && parentLink.getAttribute('data-section') === currentSectionId) {
                ul.classList.add('expanded');
            } else {
                ul.classList.remove('expanded');
            }
        });
    }

    // 5. Update quick cards
    var cardHrefs = Array.from(spyCards).map(function(card) { return card.getAttribute('href'); });
    var matchingCardHref = '#' + currentSectionId;
    var hasMatchingCard = cardHrefs.includes(matchingCardHref);

    spyCards.forEach(function(card) {
        card.classList.remove('highlight');
        if (hasMatchingCard && card.getAttribute('href') === matchingCardHref) {
            card.classList.add('highlight');
        }
    });
}

function initScrollSpy() {
    // Cache all sub-anchor IDs from nav
    document.querySelectorAll('.nav-sub-list .nav-sub').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            _navSubAnchors.push(href.substring(1));
        }
    });
    window.addEventListener('scroll', updateScrollSpy);
    updateScrollSpy();
}

// --- ACCORDION ---
function toggleAccordion(header) {
    const accordion = header.parentElement;
    const isOpen = accordion.classList.contains('open');

    if (isOpen) {
        accordion.classList.remove('open');
        header.setAttribute('aria-expanded', 'false');
    } else {
        accordion.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
    }
}

// --- OUTPUT-CHECK CHECKBOXES ---
function initVibeCheckBoxes() {
    document.querySelectorAll('.vibe-check-box').forEach(function(box) {
        box.addEventListener('click', function() {
            var isChecked = this.classList.toggle('checked');
            this.innerHTML = isChecked ? '&#x2611;' : '&#x2610;';
        });
    });
}

// --- ACTION BAR COLLAPSE ---
var _abBar = null;
var _abCollapsed = false;
var _abManualExpand = false;

function toggleActionBar() {
    if (!_abBar) return;
    var wasCollapsed = _abBar.classList.contains('collapsed');
    _abBar.classList.toggle('collapsed');
    _abCollapsed = _abBar.classList.contains('collapsed');
    // User manually expanded → block auto-collapse until scrolled back to top
    if (wasCollapsed && !_abCollapsed) {
        _abManualExpand = true;
    }
    updateScrollOffset();
}

function initActionBarCollapse() {
    // Only on desktop (sticky action bar)
    if (window.innerWidth <= 768) return;

    _abBar = document.querySelector('.action-bar');
    if (!_abBar) return;

    // Hysteresis + rAF throttle to prevent jitter
    var collapseAt = 400;
    var expandAt = 150;
    var ticking = false;

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                if (!_abCollapsed && window.scrollY > collapseAt && !_abManualExpand) {
                    _abCollapsed = true;
                    _abBar.classList.add('collapsed');
                    updateScrollOffset();
                } else if (_abCollapsed && window.scrollY < expandAt) {
                    _abCollapsed = false;
                    _abManualExpand = false;
                    _abBar.classList.remove('collapsed');
                    updateScrollOffset();
                }
                // Reset manual override when scrolled back to top
                if (_abManualExpand && window.scrollY < expandAt) {
                    _abManualExpand = false;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// --- BACK TO TOP ---
function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    btn.addEventListener('click', function() {
        smoothScrollTo(0, 400);
    });

    window.addEventListener('scroll', function() {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
}

// Initialize on DOM ready
// --- BACK-TO-MAIN PILL: hide on scroll ---
function initBackToMain() {
    const pill = document.querySelector('.back-to-main');
    if (!pill) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
        pill.classList.toggle('is-hidden', window.scrollY > 120);
        lastY = window.scrollY;
    }, { passive: true });
}

document.addEventListener('DOMContentLoaded', function() {
    initActionBarCollapse();
    updateScrollOffset();
    initScrollSpy();
    initNavLinks();
    initVibeCheckBoxes();
    initBackToTop();
    initBackToMain();
});
