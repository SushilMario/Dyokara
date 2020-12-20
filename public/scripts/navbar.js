const navbarToggler = document.querySelector(".navbar-toggler");
const navbarDropdown = document.querySelector("#navDropdown");

const initialContainer = document.querySelector(".initial-container");

navbarToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)

navbarDropdown.addEventListener("focus",
    () =>
    {
        initialContainer.classList.toggle("opacify");
    }
)