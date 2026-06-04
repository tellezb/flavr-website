(function () {
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
                        '<li><a href="' + homePath + '#why">Why Flavr</a></li>' +
                        '<li><a href="' + homePath + '#features">Features</a></li>' +
                        '<li><a href="' + homePath + '#about">About</a></li>' +
                        '<li><a class="nav-cta" href="' + homePath + '#early-access">Join Beta</a></li>' +
                    '</ul>' +
                '</nav>' +
            '</header>';
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
                '<p class="footer-copy">&copy; ' + new Date().getFullYear() + ' Flavr. All rights reserved.</p>' +
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
