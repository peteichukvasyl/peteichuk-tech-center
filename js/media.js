document.addEventListener("DOMContentLoaded",function(){
const mediaItems=[
{type:"image",src:"image/electricity1.webp",title:"Електромонтажний проєкт",meta:"2026 · Роботи"},
{type:"image",src:"image/interior5.webp",title:"Результат виконаної роботи",meta:"2026 · Фото"},
{type:"video",src:"video/",title:"Процес виконання роботи",meta:"2026 · Відео"},
{type:"image",src:"image/variousfonpeteichuk6.webp",title:"Технічна реалізація",meta:"2026 · Проєкти"},
{type:"image",src:"image/carpentry2.webp",title:"Деталі виконаної роботи",meta:"2026 · Деталі"},
{type:"video",src:"video/",title:"Відео з проєкту",meta:"2026 · Медіа"}
];
const filters=document.querySelectorAll(".media-filter");
const cards=document.querySelectorAll(".media-item");
const search=document.getElementById("mediaSearch");
const empty=document.getElementById("mediaEmpty");
const viewer=document.getElementById("mediaViewer");
const stage=document.getElementById("mediaViewerStage");
const closeButtons=document.querySelectorAll("[data-close-viewer]");
const prev=document.getElementById("mediaPrev");
const next=document.getElementById("mediaNext");
const counter=document.getElementById("mediaViewerCounter");
const viewerTitle=document.getElementById("mediaViewerTitle");
const year=document.getElementById("mediaYear");
const topButton=document.getElementById("mediaTop");
let activeFilter="all";
let currentIndex=0;
function filterMedia(){
const query=(search?.value||"").trim().toLowerCase();
let visible=0;
cards.forEach(function(card){
const type=card.dataset.type||"";
const title=(card.dataset.title||"").toLowerCase();
const text=card.textContent.toLowerCase();
const typeMatch=activeFilter==="all"||type===activeFilter;
const searchMatch=!query||title.includes(query)||text.includes(query);
const show=typeMatch&&searchMatch;
card.style.display=show?"":"none";
if(show)visible++;
});
if(empty)empty.classList.toggle("active",visible===0);
}
filters.forEach(function(button){
button.addEventListener("click",function(){
filters.forEach(function(item){item.classList.remove("active");});
button.classList.add("active");
activeFilter=button.dataset.filter||"all";
filterMedia();
});
});
if(search)search.addEventListener("input",filterMedia);
function renderViewer(index){
if(!mediaItems.length)return;
if(index<0)index=mediaItems.length-1;
if(index>=mediaItems.length)index=0;
currentIndex=index;
const item=mediaItems[currentIndex];
stage.innerHTML="";
if(item.type==="video"){
const video=document.createElement("video");
video.src=item.src;
video.controls=true;
video.autoplay=true;
video.playsInline=true;
video.preload="metadata";
if(item.poster)video.poster=item.poster;
stage.appendChild(video);
}else{
const image=document.createElement("img");
image.src=item.src;
image.alt=item.title;
stage.appendChild(image);
}
counter.textContent=(currentIndex+1)+" / "+mediaItems.length;
viewerTitle.textContent=item.title+" · "+item.meta;
}
function openViewer(index){
renderViewer(index);
viewer.classList.add("active");
viewer.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeViewer(){
const video=stage.querySelector("video");
if(video){
video.pause();
video.currentTime=0;
}
stage.innerHTML="";
viewer.classList.remove("active");
viewer.setAttribute("aria-hidden","true");
document.body.style.overflow="";
}
document.querySelectorAll(".media-open").forEach(function(button){
button.addEventListener("click",function(){
const index=parseInt(button.dataset.media,10);
if(!Number.isNaN(index))openViewer(index);
});
});
if(prev)prev.addEventListener("click",function(){renderViewer(currentIndex-1);});
if(next)next.addEventListener("click",function(){renderViewer(currentIndex+1);});
closeButtons.forEach(function(button){button.addEventListener("click",closeViewer);});
document.addEventListener("keydown",function(event){
if(!viewer.classList.contains("active"))return;
if(event.key==="Escape")closeViewer();
if(event.key==="ArrowLeft")renderViewer(currentIndex-1);
if(event.key==="ArrowRight")renderViewer(currentIndex+1);
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
if(distance<0)renderViewer(currentIndex+1);
else renderViewer(currentIndex-1);
},{passive:true});
if(topButton){
topButton.addEventListener("click",function(event){
event.preventDefault();
window.scrollTo({top:0,behavior:"smooth"});
});
}
if(year)year.textContent=new Date().getFullYear();
const heroBg=document.querySelector(".media-hero-bg");
if(heroBg){
let ticking=false;
function updateHeroParallax(){
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
const offset=scrollTop*.18;
heroBg.style.transform="translate3d(0,"+offset+"px,0) scale(1.03)";
ticking=false;
}
function requestHeroParallax(){
if(!ticking){
window.requestAnimationFrame(updateHeroParallax);
ticking=true;
}
}
window.addEventListener("scroll",requestHeroParallax,{passive:true});
window.addEventListener("resize",requestHeroParallax,{passive:true});
updateHeroParallax();
}
filterMedia();
});