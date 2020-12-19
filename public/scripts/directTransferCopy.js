const accountNoCopyButton = document.getElementById("accountNoCopy");
const accountNoDisplay = document.getElementById("accountNoDisplay");

const accountHolderCopyButton = document.getElementById("accountHolderCopy");
const accountHolderDisplay = document.getElementById("accountHolderDisplay");

const IFSCCopyButton = document.getElementById("IFSCCopy");
const IFSCDisplay = document.getElementById("IFSCDisplay");

const accountBranchCopyButton = document.getElementById("accountBranchCopy");
const accountBranchDisplay = document.getElementById("accountBranchDisplay");

accountNoCopyButton.onclick = function()
{
    accountNoDisplay.removeAttribute("disabled");

    accountNoDisplay.select();

    document.execCommand("Copy");

    accountNoDisplay.setAttribute("disabled", "disabled");
}

accountHolderCopyButton.onclick = function()
{
    accountHolderDisplay.removeAttribute("disabled");

    accountHolderDisplay.select();

    document.execCommand("Copy");

    accountHolderDisplay.setAttribute("disabled", "disabled");
}

IFSCCopyButton.onclick = function()
{
    IFSCDisplay.removeAttribute("disabled");

    IFSCDisplay.select();

    document.execCommand("Copy");

    IFSCDisplay.setAttribute("disabled", "disabled");
}

accountBranchCopyButton.onclick = function()
{
    accountBranchDisplay.removeAttribute("disabled");

    accountBranchDisplay.select();

    document.execCommand("Copy");

    accountBranchDisplay.setAttribute("disabled", "disabled");
}