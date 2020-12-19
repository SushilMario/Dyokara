const navbarToggler = document.querySelector(".navbar-toggler");

const initialContainer = document.querySelector(".initial-container");

navbarToggler.addEventListener("click",
    () =>
    {
        initialContainer.classList.toggle("move-down");
    }
)