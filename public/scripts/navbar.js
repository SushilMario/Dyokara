const navbarToggler = document.querySelector(".navbar-toggler");
const navbarLinkToggler = document.querySelector(".nav-link.dropdown-toggle");

const initialContainer = document.querySelector(".initial-container");
const body = document.querySelector("body");

navbarToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)

navbarLinkToggler.addEventListener("click",
    () =>
    {
        body.classList.toggle("opacify");
    }
)