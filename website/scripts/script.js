let button = document.querySelector('.download-button');
let platformMenu = document.querySelector('.platform-menu');
let platformOptions = document.querySelectorAll('.platform-option');
let downloadLink = document.querySelector('#download-link');


button.addEventListener('click', (e) => {
  e.stopPropagation();
  platformMenu.style.display = platformMenu.style.display === 'none' ? 'block' : 'none';
});

if (navigator.platform == "Win32") {
  downloadLink.setAttribute('href', "https://github.com/Borecjeborec1/iPen/releases/download/v1.0.1/win_iPen_v1.0.1.zip");
  downloadLink.innerText = "Download for windows"
} else {
  downloadLink.setAttribute('href', "AddLinkHere");
  downloadLink.innerText = "Download for linux"
}

platformOptions.forEach((option) => {
  option.addEventListener('click', () => {
    let downloadLinkURL = option.dataset.downloadpath;
    let downloadLinkName = option.innerText;
    downloadLink.setAttribute('href', downloadLinkURL);
    downloadLink.innerText = "Download: " + downloadLinkName
    platformMenu.style.display = 'none';
  });

});

document.addEventListener('click', () => {
  platformMenu.style.display = 'none';
});

let themeBtn = document.querySelector('.theme');
let logo = document.querySelector(".logo")
themeBtn.addEventListener("click", e => {
  if (themeBtn.textContent.includes("Night")) {
    themeBtn.innerHTML = "&#9728; Light"
    document.documentElement.style.setProperty('--bg-color', "#0F0F0F");
    document.documentElement.style.setProperty('--text-color', "#fff");
    document.documentElement.style.setProperty('--accent-color', "#f0f0f0");
    document.documentElement.style.setProperty('--anti-color', "#353535");
    logo.style.backgroundImage = "url(assets/atzuki-light.svg)"
  } else {
    themeBtn.innerHTML = "&#9729; Night"
    document.documentElement.style.setProperty('--bg-color', "#fff");
    document.documentElement.style.setProperty('--text-color', "#0F0F0F");
    document.documentElement.style.setProperty('--accent-color', "#353535");
    document.documentElement.style.setProperty('--anti-color', "#f0f0f0");
    logo.style.backgroundImage = "url(assets/atzuki-dark.svg)"
  }
})