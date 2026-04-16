function url() {
    let url = window.location.origin;
    if (url.includes(`github.io`)) {
        url += `/CityGameMalaga`;
    }
    return url;
}
let url = url();
document.getElementById("info").addEventListener("click", () => {
    window.location.href = `${url}/info.html`;
});
document.getElementById("pin").addEventListener("click", () => {
    window.location.href = `${url}/index.html`;
});
document.getElementById("admin").addEventListener("click", () => {
    window.location.href = `${url}/admin.html`;
});   
