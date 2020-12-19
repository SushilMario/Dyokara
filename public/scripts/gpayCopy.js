const phoneCopyButton = document.getElementById("phoneCopy");
const phoneDisplay = document.getElementById("phoneDisplay");

const amountCopyButton = document.getElementById("amountCopy");
const amountDisplay = document.getElementById("amountDisplay");

phoneCopyButton.onclick = function()
{
    phoneDisplay.removeAttribute("disabled");

    phoneDisplay.select();

    document.execCommand("Copy");

    phoneDisplay.setAttribute("disabled", "disabled");
}

amountCopyButton.onclick = function()
{
    amountDisplay.removeAttribute("disabled");

    amountDisplay.select();

    document.execCommand("Copy");

    amountDisplay.setAttribute("disabled", "disabled");
}