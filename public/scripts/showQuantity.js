const forms = document.querySelectorAll(".product-form");
const actualInput = document.getElementById("quantity");
const formalInputs = document.querySelectorAll(".form-quantity");

actualInput.addEventListener
(
    "change",
    () =>
    {
        if(parseInt(actualInput.value) > 10)
        {
            actualInput.value = 10;
        }
    }
)

for(let i = 0; i < forms.length; i++)
{
    forms[i].addEventListener
    (
        "submit", 
        () =>
        {
            formalInputs[i].value = actualInput.value;
        }
    )
}