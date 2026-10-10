document.addEventListener("DOMContentLoaded",function(){
const heroBg=document.querySelector(".social-hero-bg");
const galleryItems=document.querySelectorAll(".social-gallery-item");
const viewer=document.getElementById("socialViewer");
const stage=document.getElementById("socialViewerStage");
const prev=document.getElementById("socialPrev");
const next=document.getElementById("socialNext");
const counter=document.getElementById("socialViewerCounter");
const closeButtons=document.querySelectorAll("[data-close-social]");
const topButton=document.getElementById("socialTop");
const year=document.getElementById("socialYear");
const gallery=["image/","image/","image/helpfon1.webp","image/"];
let currentGallery=0;
let ticking=false;
function updateParallax(){
if(!heroBg)return;
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
const offset=scrollTop*.18;
heroBg.style.transform="translate3d(0,"+offset+"px,0) scale(1.04)";
ticking=false;
}
function requestParallax(){
if(!ticking){
window.requestAnimationFrame(updateParallax);
ticking=true;
}
}
if(heroBg){
window.addEventListener("scroll",requestParallax,{passive:true});
window.addEventListener("resize",requestParallax,{passive:true});
updateParallax();
}
function renderGallery(index){
if(index<0)index=gallery.length-1;
if(index>=gallery.length)index=0;
currentGallery=index;
stage.innerHTML="";
const image=document.createElement("img");
image.src=gallery[currentGallery];
image.alt="Соціальна відповідальність";
stage.appendChild(image);
counter.textContent=(currentGallery+1)+" / "+gallery.length;
}
function openGallery(index){
renderGallery(index);
viewer.classList.add("active");
viewer.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeGallery(){
stage.innerHTML="";
viewer.classList.remove("active");
viewer.setAttribute("aria-hidden","true");
document.body.style.overflow="";
}
galleryItems.forEach(function(item){
item.addEventListener("click",function(){
const index=parseInt(item.dataset.gallery,10);
if(!Number.isNaN(index))openGallery(index);
});
});
if(prev)prev.addEventListener("click",function(){renderGallery(currentGallery-1);});
if(next)next.addEventListener("click",function(){renderGallery(currentGallery+1);});
closeButtons.forEach(function(button){
button.addEventListener("click",closeGallery);
});
document.addEventListener("keydown",function(event){
if(!viewer.classList.contains("active"))return;
if(event.key==="Escape")closeGallery();
if(event.key==="ArrowLeft")renderGallery(currentGallery-1);
if(event.key==="ArrowRight")renderGallery(currentGallery+1);
});
let touchStartX=0;
let touchEndX=0;
viewer.addEventListener("touchstart",function(event){
touchStartX=event.changedTouches[0].screenX;
},{passive:true});
viewer.addEventListener("touchend",function(event){
touchEndX=event.changedTouches[0].screenX;
const distance=touchEndX-touchStartX;
if(Math.abs(distance)<50)return;
if(distance<0)renderGallery(currentGallery+1);
else renderGallery(currentGallery-1);
},{passive:true});
if(topButton){
topButton.addEventListener("click",function(event){
event.preventDefault();
window.scrollTo({top:0,behavior:"smooth"});
});
}
if(year)year.textContent=new Date().getFullYear();
});