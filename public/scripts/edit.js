const quantityInputs = document.querySelectorAll(".item-details-quantity");
const itemIds = document.querySelectorAll(".item-id");
const userIdElement = document.getElementById("user-id");

const debounce = (i, delay = 300) =>
{
    let timeOutID;
    if(timeOutID)
    {
        clearTimeout(timeOutID);
    }
    timeOutID = setTimeout(() => 
    {
        onInput(quantityInputs[i], i);
    }, delay);
};

const changed = async (target, number) =>
{
    console.log("ON INPUT!");
    const productId = itemIds[number].textContent;
    const userId = userIdElement.textContent;

    if(target.value)
    {
        fetch(`/users/${userId}/cart/products/${productId}`, 
            { 
                method: 'PUT',  
                body: JSON.stringify({quantity: target.value}),
                headers: 
                {
                    'Content-Type': 'application/json'
                }
            }
        ) 
        // .then(res.json()) 
        // .then(res => 
        //     { 
        //         // Handle response  
        //         console.log('Response: ', res); 
        //     }
        // ) 
        // .catch(err => 
        //     { 
        //         // Handle error  
        //         console.log('Error message: ', error); 
        //     }
        // ); 
    }
};

for(let i = 0; i < quantityInputs.length; i++)
{
    // console.log(quantityInputs[i]);
    // quantityInputs[i].addEventListener("input", changed(quantityInputs[i], i));
    quantityInputs[i].addEventListener("input",
        ({target}) =>
        {
            console.log("ON INPUT!");
            const productId = itemIds[i].textContent;
            const userId = userIdElement.textContent;

            const number = parseInt(target.value);

            if(target.value && typeof number === "number")
            {
                if(number !== 0)
                {
                    fetch(`/users/${userId}/cart/products/${productId}`, 
                        { 
                            method: 'PUT',  
                            body: JSON.stringify({quantity: target.value}),
                            headers: 
                            {
                                'Content-Type': 'application/json'
                            }
                        }
                    ) 
                }
                
            }
        }
    )

    quantityInputs[i].addEventListener
    (
        "change",
        () =>
        {
            if(parseInt(quantityInputs[i].value) > 10)
            {
                quantityInputs[i].value = 10;
            }
    
            else if(parseInt(quantityInputs[i].value) < 1)
            {
                quantityInputs[i].value = 1;
            }
        }
    )
}


