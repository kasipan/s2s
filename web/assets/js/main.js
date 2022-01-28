// loading animation aniamtion ---------
function GenerateButtonClick(e){
  e.target.classList.add("is-loading");
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



function PrintButtonClick(e){
  const print_target = document.querySelector('.swiper-slide-active .myStory-wrapper');
  const print_wrapper = document.querySelector('.myStory-wrapper-print');
  if(print_target && print_wrapper){
    let storyClone = print_target.cloneNode(true);
    print_wrapper.textContent = '';
    print_wrapper.insertAdjacentElement('afterbegin', storyClone);
    window.print();
  }
}


function UsageToggleClick(e){
  e.preventDefault();
  const target_modal = document.querySelector('.modal-howToUse');
  target_modal.classList.toggle("is-activeModal");
}



window.onload = (event) => {
  // for others' stories animation --------
  const stories_columns = document.querySelectorAll('.othersStories-column');
  if(stories_columns){
    stories_columns.forEach((stories_element) => {
      let loopSetClone = stories_element.querySelector('.loopSet').cloneNode(true);
      stories_element.appendChild(loopSetClone);
    });
  }
};