// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');
const inputimage = document.getElementById('image-input');

const form = document.getElementById('generate-meme');
const generateB = form.querySelector('button[type = submit]');
const buttons = document.getElementById('button-group');
const clearB = buttons.querySelector('button[type = reset]');
const readB = buttons.querySelector('button[type = button]');
const inputtop = document.getElementById('text-top');
const inputbottom = document.getElementById('text-bottom');

const volumeGp = document.getElementById('volume-group');
const volumeSlide = volumeGp.querySelector('input[type = range]');
const volumeImg = volumeGp.querySelector('img');
const voiceSelection = document.getElementById('voice-selection');
let volume = volumeSlide/100.0;

//add the available voice options. populateVoiceList() is based on template code from Mozilla doc
function populateVoiceList() {
  if(typeof speechSynthesis === 'undefined') {
    return;
  }

  var voices = speechSynthesis.getVoices();
  if(voices.length!=0){
    voiceSelection.disabled = false;
    document.querySelector('#voice-selection > option').remove();
  }

  for(var i = 0; i < voices.length; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    option.value = voices[i].lang;
    voiceSelection.appendChild(option);
  }
}
populateVoiceList();
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, 400, 400);
  const dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

inputimage.addEventListener('change', () =>{
  console.log(inputimage);
  img.src = URL.createObjectURL(inputimage.files[0]);
  img.alt = inputimage.files[0].name;
  console.log(img.alt);
  console.log(inputimage.files[0]);
});

form.addEventListener('submit', (event)=>{
  event.preventDefault();
  ctx.font = "30px Comic Sans MS";
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'red';
  ctx.strokeText(inputtop.value, canvas.width/2, 40 );
  ctx.strokeText(inputbottom.value, canvas.width/2, canvas.height-40);
  console.log('submit form'); 
  generateB.setAttribute('disabled', 'disabled');
  clearB.removeAttribute('disabled');
  readB.removeAttribute('disabled');
} 
);

clearB.addEventListener('click', ()=>{
  ctx.clearRect(0,0, canvas.width, canvas.height);
  generateB.removeAttribute('disabled');
  clearB.setAttribute('disabled', 'disabled');
  readB.setAttribute('disabled','disabled');
  inputtop.value = "";
  inputbottom.value = "";
});

readB.addEventListener('click', ()=>{
  var utterThis = new SpeechSynthesisUtterance(inputtop.value + ' '
   + inputbottom.value);
  const vol = volumeSlide.value;
  utterThis.lang = voiceSelection.value;
  utterThis.volume = vol/100;
  speechSynthesis.speak(utterThis);
} );

volumeGp.addEventListener('input', ()=>{
  const vol = volumeSlide.value;
  let level;
  if(vol >= 67){
    level = 3;
  }else if(vol >= 34){
    level = 2;
  }else if(vol >= 1){
    level = 1;
  }else{
    level = 0;
  }

  volumeImg.src = 'icons/volume-level-' + level + '.svg';
  volume = vol/100.0;
});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
