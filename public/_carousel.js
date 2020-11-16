const carousel = document.querySelector('.parcelization-examples-carousel')
const carouselImages = document.querySelectorAll('.parcelization-examples-carousel img');

// CAROUSEL BUTTONS
const previousImageBtn = document.getElementById('previous_image_btn')
const nextImageBtn = document.getElementById('next_image_btn')

// IMAGE COUNTER
let currentImageIdx = 0

// CLEAR ALL THE IMAGES
function reset() {
   for(let i = 0; i < carouselImages.length; i++ ) {
      carouselImages[i].style.display = 'none'
   }
}

// INITIALIZE THE CAROUSEL
function startSlideshow() {
   reset();
   carouselImages[0].style.display = 'block'; // show the first image
}

// SHOW PREVIOUS IMAGE
function slideForward() {
   reset();
   carouselImages[currentImageIdx + 1].style.display = 'block'
   currentImageIdx++
}

// SHOW NEXT IMAGE FN.
function slideBackward() {
   reset();
   carouselImages[currentImageIdx - 1].style.display = 'block'
   currentImageIdx--
}

// RIGHT ARROW CLICK
nextImageBtn.addEventListener('click', () => {
   if(currentImageIdx === carouselImages.length - 1) {
      currentImageIdx = -1;
   }
   slideForward();
});

// LEFT ARROW CLICK
previousImageBtn.addEventListener('click', () => {
   if(currentImageIdx === 0) {
      currentImageIdx = carouselImages.length;
   }
   slideBackward();
});

// INIT.
startSlideshow();