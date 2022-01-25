// import { Gradient } from './Gradient.js'

// // Create your instance
// const gradient = new Gradient();

// // Call `initGradient` with the selector to your canvas
// gradient.initGradient('#gradient-canvas');



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
  const form_input = document.querySelector('input[type="text"]');
  const gradient_canvas = document.querySelector('#gradient-canvas');

  if(form_input){ 
    form_input.addEventListener('focus', (event) => {
      gradient_canvas.style.opacity = '0.25';
    });

    form_input.addEventListener('blur', (event) => {
      gradient_canvas.style.opacity = '0';
    });
  }

  // for others' stories animation --------
  const stories_columns = document.querySelectorAll('.othersStories-column');
  if(stories_columns){
    stories_columns.forEach((stories_element) => {
      let loopSetClone = stories_element.querySelector('.loopSet').cloneNode(true);
      stories_element.appendChild(loopSetClone);
    });
  }
};


