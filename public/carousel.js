const carousel = document.querySelector('.parcelization-examples-carousel')
const carouselImages = document.querySelectorAll('.parcelization-examples-carousel img');

// CAROUSEL BUTTONS
const previousImageBtn = document.getElementById('previous_image_btn')
const nextImageBtn = document.getElementById('next_image_btn')

// IMAGE COUNTER
let imageCounter = 1

// IMAGE WIDTH
const imageWidth = carouselImages[0].clientWidth

// MOVE THE IMAGE VIA TRANSFORM/TRANSLATE BY IMAGE WIDTH
// carousel.style.transform = `translateX(${-imageWidth * imageCounter}px)`

// BTN EVENT LISTENERS
nextImageBtn.addEventListener('click', () => {
   carousel.style.transition = 'transform 0.4s ease-in-out';
   imageCounter++;
   // MOVE THE IMAGE VIA TRANSFORM/TRANSLATE BY IMAGE WIDTH
   carousel.style.transform = `translateX(${-imageWidth * imageCounter}px)`
});

previousImageBtn.addEventListener('click', () => {
   // MOVE THE IMAGE VIA TRANSFORM/TRANSLATE BY IMAGE WIDTH
   carousel.style.transition = 'transform 0.4s ease-in-out';
   imageCounter--;
   carousel.style.transform = `translateX(${-imageWidth * imageCounter}px)`
});


carousel.addEventListener('transitionend', () => {
   console.log('fired');
   if(carouselImages[imageCounter].id  === 'last_image_clone') {
      carousel.style.transition = 'none';
      imageCounter = carouselImages.length - 2;
   }
})