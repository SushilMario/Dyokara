const navbarToggler = document.querySelector(".navbar-toggler");
const navbarLinkToggler = document.querySelector("nav-link dropdown-toggle");

const initialContainer = document.querySelector(".initial-container");

navbarToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)

navbarLinkToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)