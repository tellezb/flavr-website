(function () {
    var appStoreUrl = "https://apps.apple.com/us/app/flavr-recipes-meal-planning/id6756181978";

    function buildPath(rootPath, target) {
        if (!rootPath || rootPath === ".") {
            return target;
        }
        return rootPath + "/" + target;
    }

    var rootPath = document.body.getAttribute("data-root-path") || ".";
    var homePath = buildPath(rootPath, "index.html");
    var privacyPath = buildPath(rootPath, "legal/privacy-policy.html");
    var termsPath = buildPath(rootPath, "legal/terms-of-use.html");
    var supportPath = buildPath(rootPath, "support.html");

    var headerTarget = document.querySelector("[data-shared-header]");
    if (headerTarget) {
        headerTarget.innerHTML =
            '<header>' +
                '<nav>' +
                    '<a href="' + homePath + '" class="logo-container">' +
                        '<div class="logo">Flavr</div>' +
                        '<div class="logo-tagline">Discover. Cook. Grow.</div>' +
                    '</a>' +
                    '<ul class="nav-links">' +
                        '<li><a href="' + homePath + '#what-is-flavr">What Is Flavr?</a></li>' +
                        '<li><a href="' + homePath + '#why">Why It\'s Different</a></li>' +
                        '<li><a href="' + homePath + '#features">Features</a></li>' +
                        '<li><a href="' + homePath + '#about">About</a></li>' +
                    '</ul>' +
                    '<a class="nav-cta" href="' + homePath + '#early-access">Get Started</a>' +
                '</nav>' +
            '</header>';

        var navigationHeader = headerTarget.querySelector("header");
        var mobileNavigation = window.matchMedia("(max-width: 768px)");
        var lastScrollY = window.scrollY;
        var scrollFramePending = false;
        var anchorNavigationTimeout = null;

        function finishAnchorNavigation() {
            document.documentElement.classList.remove("nav-anchor-scroll");
            if (anchorNavigationTimeout !== null) {
                window.clearTimeout(anchorNavigationTimeout);
                anchorNavigationTimeout = null;
            }
            lastScrollY = Math.max(0, window.scrollY);
        }

        function scheduleAnchorNavigationFinish() {
            if (anchorNavigationTimeout !== null) {
                window.clearTimeout(anchorNavigationTimeout);
            }
            anchorNavigationTimeout = window.setTimeout(finishAnchorNavigation, 200);
        }

        navigationHeader.addEventListener("click", function (event) {
            var link = event.target.closest(".nav-links a, .nav-cta");
            if (!link || !link.hash || !mobileNavigation.matches ||
                event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            var targetUrl = new URL(link.href, window.location.href);
            if (targetUrl.pathname !== window.location.pathname || !targetUrl.hash) {
                return;
            }

            document.documentElement.classList.add("nav-anchor-scroll");
            scheduleAnchorNavigationFinish();
        });

        function updateNavigationOnScroll() {
            if (scrollFramePending) {
                return;
            }
            scrollFramePending = true;
            window.requestAnimationFrame(function () {
                var currentScrollY = Math.max(0, window.scrollY);
                if (document.documentElement.classList.contains("nav-anchor-scroll")) {
                    scheduleAnchorNavigationFinish();
                }
                if (!mobileNavigation.matches || currentScrollY <= 20) {
                    navigationHeader.classList.remove("header-hidden");
                } else if (currentScrollY > lastScrollY + 8) {
                    navigationHeader.classList.add("header-hidden");
                } else if (currentScrollY < lastScrollY - 8) {
                    navigationHeader.classList.remove("header-hidden");
                }
                lastScrollY = currentScrollY;
                scrollFramePending = false;
            });
        }

        window.addEventListener("scroll", updateNavigationOnScroll, { passive: true });
        window.addEventListener("resize", updateNavigationOnScroll);
        window.addEventListener("scrollend", finishAnchorNavigation);
    }

    var footerTarget = document.querySelector("[data-shared-footer]");
    if (footerTarget) {
        footerTarget.innerHTML =
            '<footer>' +
                '<p class="footer-links">' +
                    '<a href="' + privacyPath + '">Privacy Policy</a> | ' +
                    '<a href="' + termsPath + '">Terms of Use</a> | ' +
                    '<a href="' + supportPath + '">Support</a>' +
                '</p>' +
                '<p class="footer-copy">&copy; ' + new Date().getFullYear() + ' Flavr, LLC. All rights reserved.</p>' +
            '</footer>';
    }
    // Email address protection — assembles mailto links at runtime so raw HTML never contains a harvestable address
    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('span[data-eu][data-ed]').forEach(function (span) {
            var email = span.getAttribute('data-eu') + '@' + span.getAttribute('data-ed');
            var a = document.createElement('a');
            a.href = 'mailto:' + email;
            a.textContent = email;
            a.className = 'content-link';
            span.replaceWith(a);
        });
    });
})();
