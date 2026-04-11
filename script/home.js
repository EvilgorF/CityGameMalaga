let url = window.location.origin

document.getElementById("info").addEventListener("click", () => {
    window.location.href = `${url}/info.html`;
});
document.getElementById("pin").addEventListener("click",  () => {
    window.location.href = `${url}/index.html`;
});
document.getElementById("admin").addEventListener("click", () => {
    window.location.href = `${url}/admin.html`;
});   