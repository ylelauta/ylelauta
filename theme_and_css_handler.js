// theme_and_css_handler.js
// Module to handle theme toggle and custom CSS functionality

document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const applyCssButton = document.getElementById("apply-css");
    const customCssTextarea = document.getElementById("custom-css");

    // Toggle Theme
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        toggleClassOnElements("button", "light");
        toggleClassOnElements("textarea", "light");
        toggleClassOnElements("input[type='text']", "light");
        toggleClassOnElements(".thread", "light");
        toggleClassOnElements(".vote-up", "light");
        toggleClassOnElements(".vote-down", "light");
        toggleClassOnElements(".vote-up-comment", "light");
        toggleClassOnElements(".vote-down-comment", "light");
        toggleClassOnElements(".comment", "light");
    });

    // Apply Custom CSS
    applyCssButton.addEventListener("click", () => {
        const customCss = customCssTextarea.value;
        if (isSafeCss(customCss)) {
            applyCustomCss(customCss);
        } else {
            alert("The CSS you entered contains potentially unsafe content.");
        }
    });
});

// Utility Functions
function toggleClassOnElements(selector, className) {
    document.querySelectorAll(selector).forEach(el => el.classList.toggle(className));
}

function applyCustomCss(css) {
    let customStyleElement = document.getElementById("custom-style");
    if (!customStyleElement) {
        customStyleElement = document.createElement("style");
        customStyleElement.id = "custom-style";
        document.head.appendChild(customStyleElement);
    }
    customStyleElement.textContent = css;
    customStyleElement.style.display = "block";
}

function isSafeCss(css) {
    const forbiddenPatterns = [/expression\(/i, /url\(javascript:/i, /<|>/];
    return !forbiddenPatterns.some(pattern => pattern.test(css));
}

export { toggleClassOnElements, applyCustomCss, isSafeCss };
