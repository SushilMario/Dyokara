const forms = document.querySelectorAll(".product-form");
const actualInput = document.getElementById("quantity");
const formalInputs = document.querySelectorAll(".form-quantity");

const customisationActual = document.querySelectorAll(".customisation input[type='radio']");
const customisationFormal = document.querySelectorAll(".form-customisation");
const customText = document.getElementById("customText");

//Validation and displaying / hiding

actualInput.addEventListener
(
    "change",
    () =>
    {
        if(parseInt(actualInput.value) > 10)
        {
            actualInput.value = 10;
        }

        else if(parseInt(actualInput.value) < 1)
        {
            actualInput.value = 1;
        }
    }
)

for(let i = 0; i < customisationActual.length; i++) 
{
    customisationActual[i].addEventListener("change", 
        (e) =>
        {
            if(customisationActual[i].value === "Custom")
            {
                customText.classList.remove("hide");
            }
            else
            {
                customText.classList.add("hide");
            }
        }
    )
}

//Submitting

function getRadioValue(radioButtons)
{
    for (let i = 0;  i < radioButtons.length; i++)
    {
        if (radioButtons[i].checked)
        {
            return radioButtons[i].value;
        }
    }
}

for(let i = 0; i < forms.length; i++)
{
    forms[i].addEventListener
    (
        "submit", 
        () =>
        {
            formalInputs[i].value = actualInput.value;
            customisationFormal[i].value = getRadioValue(customisationActual);
        }
    )
}