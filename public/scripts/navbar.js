const navbarToggler = document.querySelector(".navbar-toggler");
const navbarDropdown = document.querySelector(".nav-item.dropdown");

const initialContainer = document.querySelector(".initial-container");

navbarToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)

navbarDropdown.addEventListener("show.bs.dropdown",
    () =>
    {
        initialContainer.classList.add("opacify");
    }
)

navbarDropdown.addEventListener("hide.bs.dropdown",
    () =>
    {
        initialContainer.classList.remove("opacify");
    }
)