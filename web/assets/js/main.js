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