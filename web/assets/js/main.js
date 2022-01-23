// loading animation aniamtion ---------
function OnButtonClick(e){
  e.target.classList.add("loading");
  e.target.innerHTML = "生成中<div class='loading-dots'>...</div>";
  loadAnimation();
}

var loadAnimation = function(){
  let loading = document.querySelector(".loading-dots");
  let letters = loading.textContent.split("");
  loading.textContent = "";
  letters.forEach((letter, i) => {
    let span = document.createElement("span");
    span.textContent = letter;
    span.style.animationDelay = `${i / 4}s`;
    loading.append(span);
  });
}


window.onload = (event) => {
  // background animation ---------
  const target = document.querySelector('input[type="text"]');
  const gradient_canvas = document.querySelector('#gradient-canvas');

  target.addEventListener('focus', (event) => {
    gradient_canvas.style.opacity = '0.25';
  });

  target.addEventListener('blur', (event) => {
    gradient_canvas.style.opacity = '0';
  });
};

