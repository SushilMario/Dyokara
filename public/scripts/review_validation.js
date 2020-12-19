const submitButton = document.querySelector(".submit");
const radioButtons = document.querySelectorAll("input[type='radio']");

radioButtons.forEach
(
    button =>
    {
        button.addEventListener("change",
            () =>
            {
                console.log(1);
                submitButton.removeAttribute("disabled");
            } 
        )
    }
);