const emptyState = document.getElementById("emptyState");
const fileState = document.getElementById("fileState");
const uploadedState = document.getElementById("uploadedState");
const failedState = document.getElementById("failedState");

emptyState.hidden = false;
fileState.hidden = true;
uploadedState.hidden = true;
failedState.hidden = true;


console.log(emptyState);
console.log(emptyState.hidden);

console.log(getComputedStyle(uploadedState).border);
console.log(getComputedStyle(failedState).border);