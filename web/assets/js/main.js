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
  const print_area = document.querySelector('.myStory-wrapper-print');
  if(print_target && print_area){
    // let storyClone = print_target.cloneNode(true);
    // print_area.textContent = '';
    // print_wrapper.insertAdjacentElement('afterbegin', storyClone);
    print_area.innerHTML = print_target.innerHTML;
    window.print();
  }
}


function UsageToggleClick(e){
  e.preventDefault();
  const target_modal = document.querySelector('.modal-howToUse');
  target_modal.classList.toggle("is-activeModal");
}



window.onload = (event) => {
  // adjust too much long story
  const stories_texts = document.querySelectorAll('.myStory-body > p, .othersStory-body > p');
  if(stories_texts){
    const mojisuu = 170;  //170文字超えたら削る
    for (i = 0; i < stories_texts.length; i++) {
      if(stories_texts[i].innerText.length > mojisuu) {
        var str = stories_texts[i].innerText;
        str = str.substr(0,(mojisuu-1));
        stories_texts[i].innerText = str + "…";
      }
    }
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

document.addEventListener('DOMContentLoaded', function() {
  // fade start animation
  const fadeContent = document.getElementById('fadeInContent');
  if(fadeContent){
    //fadeContent.classList.add('is-hidden');
    setTimeout(
      function(){ 
        fadeContent.classList.add('is-shown');
      }
    , 750);
  }
});

