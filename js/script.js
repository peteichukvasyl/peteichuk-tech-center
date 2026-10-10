//Це до паралаксу верхньої частини, форми і підтримки
document.addEventListener("DOMContentLoaded",function(){
const parallaxElements=document.querySelectorAll(".parallax-bg,.form-parallax-bg,.faq-parallax-bg");
if(!parallaxElements.length)return;
let ticking=false;
function updateParallax(){
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
parallaxElements.forEach(function(parallax){
const section=parallax.closest(".top_content_paralax_img,.form-out,.accordion-faq")||parallax.parentElement;
if(!section)return;
const sectionTop=section.offsetTop;
const offset=(scrollTop-sectionTop)*.25;
parallax.style.transform="translate3d(0,"+offset+"px,0)";
});
ticking=false;
}
function requestParallax(){
if(!ticking){
window.requestAnimationFrame(updateParallax);
ticking=true;
}
}
window.addEventListener("scroll",requestParallax,{passive:true});
window.addEventListener("resize",requestParallax,{passive:true});
updateParallax();
});


//Це до паралаксу верхньої частини і форми
document.addEventListener("DOMContentLoaded",function(){
const parallaxElements=document.querySelectorAll(".parallax-bg,.form-parallax-bg");
if(!parallaxElements.length)return;
let ticking=false;
function updateParallax(){
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
parallaxElements.forEach(function(parallax){
const section=parallax.closest(".top_content_paralax_img,.form-out")||parallax.parentElement;
if(!section)return;
const sectionTop=section.offsetTop;
const offset=(scrollTop-sectionTop)*.25;
parallax.style.transform="translate3d(0,"+offset+"px,0)";
});
ticking=false;
}
function requestParallax(){
if(!ticking){
window.requestAnimationFrame(updateParallax);
ticking=true;
}
}
window.addEventListener("scroll",requestParallax,{passive:true});
window.addEventListener("resize",requestParallax,{passive:true});
updateParallax();
});
// Печиво і Конфіденційність
const TERMS_KEY="peteichuk_terms_accepted";
const COOKIES_KEY="peteichuk_cookie_consent";
let activeModal=null;
let lastModalTrigger=null;
let siteAccessAllowed=false;
let accessBlockListenersInitialized=false;
function getTermsAccepted(){
try{
const terms=JSON.parse(localStorage.getItem(TERMS_KEY)||"null");
return Boolean(terms&&terms.accepted===true);
}catch(error){
return false;
}
}
function getCookieConsent(){
try{
return JSON.parse(localStorage.getItem(COOKIES_KEY)||"null");
}catch(error){
return null;
}
}
function isConsentModalTarget(target){
if(!target)return false;
const termsModal=document.getElementById("customModalWrapper");
const privacyModal=document.getElementById("privacyModal");
const filesModal=document.getElementById("filesModal");
return Boolean(
(termsModal&&termsModal.contains(target))||
(privacyModal&&privacyModal.contains(target))||
(filesModal&&filesModal.contains(target))
);
}
function blockPageInteraction(event){
if(siteAccessAllowed||isConsentModalTarget(event.target))return;
event.preventDefault();
event.stopPropagation();
if(event.stopImmediatePropagation)event.stopImmediatePropagation();
}
function blockPageKeyboard(event){
if(siteAccessAllowed||isConsentModalTarget(event.target))return;
event.preventDefault();
event.stopPropagation();
if(event.stopImmediatePropagation)event.stopImmediatePropagation();
}
function setupAccessBlockListeners(){
if(accessBlockListenersInitialized)return;
accessBlockListenersInitialized=true;
document.addEventListener("click",blockPageInteraction,true);
document.addEventListener("mousedown",blockPageInteraction,true);
document.addEventListener("mouseup",blockPageInteraction,true);
document.addEventListener("pointerdown",blockPageInteraction,true);
document.addEventListener("pointerup",blockPageInteraction,true);
document.addEventListener("dblclick",blockPageInteraction,true);
document.addEventListener("touchstart",blockPageInteraction,{capture:true,passive:false});
document.addEventListener("touchmove",blockPageInteraction,{capture:true,passive:false});
document.addEventListener("touchend",blockPageInteraction,{capture:true,passive:false});
document.addEventListener("contextmenu",blockPageInteraction,true);
document.addEventListener("selectstart",blockPageInteraction,true);
document.addEventListener("dragstart",blockPageInteraction,true);
document.addEventListener("keydown",blockPageKeyboard,true);
document.addEventListener("keyup",blockPageKeyboard,true);
window.addEventListener("wheel",blockPageInteraction,{capture:true,passive:false});
}
function removeAccessBlockListeners(){
if(!accessBlockListenersInitialized)return;
document.removeEventListener("click",blockPageInteraction,true);
document.removeEventListener("mousedown",blockPageInteraction,true);
document.removeEventListener("mouseup",blockPageInteraction,true);
document.removeEventListener("pointerdown",blockPageInteraction,true);
document.removeEventListener("pointerup",blockPageInteraction,true);
document.removeEventListener("dblclick",blockPageInteraction,true);
document.removeEventListener("touchstart",blockPageInteraction,true);
document.removeEventListener("touchmove",blockPageInteraction,true);
document.removeEventListener("touchend",blockPageInteraction,true);
document.removeEventListener("contextmenu",blockPageInteraction,true);
document.removeEventListener("selectstart",blockPageInteraction,true);
document.removeEventListener("dragstart",blockPageInteraction,true);
document.removeEventListener("keydown",blockPageKeyboard,true);
document.removeEventListener("keyup",blockPageKeyboard,true);
window.removeEventListener("wheel",blockPageInteraction,true);
accessBlockListenersInitialized=false;
}
function closeAllConsentModals(){
document.querySelectorAll("#customModalWrapper,#privacyModal,#filesModal").forEach(function(modal){
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
});
activeModal=null;
}
function focusModalControl(modal){
if(!modal)return;
const control=modal.querySelector('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])');
if(control)setTimeout(function(){control.focus();},0);
}
function showTermsModal(){
const terms=document.getElementById("customModalWrapper");
if(!terms)return;
closeAllConsentModals();
terms.classList.add("active");
terms.setAttribute("aria-hidden","false");
activeModal=terms;
document.body.classList.add("modal-open");
const closeButton=terms.querySelector("[data-modal-close]");
if(closeButton)closeButton.style.display="none";
focusModalControl(terms);
}
function blockSiteAccess(){
siteAccessAllowed=false;
document.documentElement.classList.add("site-access-blocked");
document.body.classList.add("site-access-blocked");
document.body.style.overflow="hidden";
setupAccessBlockListeners();
const blocker=document.getElementById("siteAccessBlocker");
if(blocker)blocker.classList.add("active");
showTermsModal();
}
function allowSiteAccess(){
siteAccessAllowed=true;
document.documentElement.classList.remove("site-access-blocked");
document.body.classList.remove("site-access-blocked");
document.body.style.overflow="";
removeAccessBlockListeners();
const blocker=document.getElementById("siteAccessBlocker");
if(blocker)blocker.classList.remove("active");
document.querySelectorAll("#customModalWrapper,#privacyModal,#filesModal").forEach(function(modal){
const closeButton=modal.querySelector("[data-modal-close]");
if(closeButton)closeButton.style.display="";
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
});
activeModal=null;
document.body.classList.remove("modal-open");
}
function customAcceptTerms(){
localStorage.setItem(TERMS_KEY,JSON.stringify({
accepted:true,
createdAt:new Date().toISOString()
}));
allowSiteAccess();
}
function customDenyAccess(){
localStorage.setItem(TERMS_KEY,JSON.stringify({
accepted:false,
createdAt:new Date().toISOString()
}));
blockSiteAccess();
}
function openModal(modalId){
const allowedBeforeConsent=["customModalWrapper","privacyModal","filesModal"];
if(!siteAccessAllowed&&!allowedBeforeConsent.includes(modalId))return;
const modal=document.getElementById(modalId);
if(!modal)return;
if(activeModal&&activeModal!==modal){
activeModal.classList.remove("active");
activeModal.setAttribute("aria-hidden","true");
}
lastModalTrigger=document.activeElement;
modal.classList.add("active");
modal.setAttribute("aria-hidden","false");
document.body.classList.add("modal-open");
activeModal=modal;
const closeButton=modal.querySelector("[data-modal-close]");
if(closeButton){
if(!siteAccessAllowed){
closeButton.style.display="none";
}else{
closeButton.style.display="";
}
}
focusModalControl(modal);
}
function closeModal(modal){
if(!modal)return;
if(!siteAccessAllowed){
if(["customModalWrapper","privacyModal","filesModal"].includes(modal.id)){
showTermsModal();
}
return;
}
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
if(activeModal===modal){
activeModal=null;
if(!document.querySelector("[data-modal].active")){
document.body.classList.remove("modal-open");
}
if(lastModalTrigger&&typeof lastModalTrigger.focus==="function"){
lastModalTrigger.focus();
}
}
}
document.querySelectorAll("[data-modal-open]").forEach(function(trigger){
trigger.addEventListener("click",function(event){
const modalId=trigger.dataset.modalOpen;
if(!siteAccessAllowed&&!["customModalWrapper","privacyModal","filesModal"].includes(modalId)){
event.preventDefault();
event.stopPropagation();
return;
}
event.preventDefault();
event.stopPropagation();
openModal(modalId);
});
});
document.querySelectorAll("[data-modal-close]").forEach(function(button){
button.addEventListener("click",function(event){
event.preventDefault();
event.stopPropagation();
const modal=button.closest("[data-modal]");
if(!modal)return;
closeModal(modal);
});
});
document.querySelectorAll("[data-modal]").forEach(function(modal){
modal.addEventListener("click",function(event){
if(event.target!==modal)return;
if(!siteAccessAllowed){
if(["customModalWrapper","privacyModal","filesModal"].includes(modal.id)){
showTermsModal();
}
return;
}
closeModal(modal);
});
});
document.addEventListener("keydown",function(event){
if(!siteAccessAllowed){
if(isConsentModalTarget(event.target))return;
event.preventDefault();
event.stopPropagation();
if(event.stopImmediatePropagation)event.stopImmediatePropagation();
return;
}
if(event.key==="Escape"&&activeModal)closeModal(activeModal);
});
//Це до кнопки скролу
document.addEventListener("DOMContentLoaded",function(){
const scrollBtn=document.getElementById("scrollTopBtn");
if(!scrollBtn)return;
const icon=scrollBtn.querySelector("i");
const label=scrollBtn.querySelector(".scroll-btn-label");
let ticking=false;
function updateScrollButton(){
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
const documentHeight=document.documentElement.scrollHeight;
const windowHeight=window.innerHeight;
const maxScroll=documentHeight-windowHeight;
if(maxScroll<=100){
scrollBtn.classList.remove("show");
ticking=false;
return;
}
scrollBtn.classList.add("show");
if(scrollTop<maxScroll/2){
icon.className="fa fa-angle-down";
label.textContent="ВНИЗ";
scrollBtn.classList.remove("change");
scrollBtn.title="Вниз";
scrollBtn.setAttribute("aria-label","Перейти вниз");
}else{
icon.className="fa fa-angle-up";
label.textContent="ВГОРУ";
scrollBtn.classList.add("change");
scrollBtn.title="Вгору";
scrollBtn.setAttribute("aria-label","Повернутися вгору");
}
ticking=false;
}
window.addEventListener("scroll",function(){
if(!ticking){
window.requestAnimationFrame(updateScrollButton);
ticking=true;
}
},{passive:true});
scrollBtn.addEventListener("click",function(){
if(!siteAccessAllowed)return;
const scrollTop=window.pageYOffset||document.documentElement.scrollTop;
const documentHeight=document.documentElement.scrollHeight;
const windowHeight=window.innerHeight;
const maxScroll=documentHeight-windowHeight;
if(scrollTop<maxScroll/2){
window.scrollTo({top:maxScroll,behavior:"smooth"});
}else{
window.scrollTo({top:0,behavior:"smooth"});
}
});
window.addEventListener("resize",updateScrollButton,{passive:true});
updateScrollButton();
});
//Це до верхньої адресної форми
document.addEventListener("DOMContentLoaded",function(){
const header=document.getElementById("siteHeader");
if(!header)return;
let lastScrollTop=window.pageYOffset||document.documentElement.scrollTop;
let ticking=false;
function updateHeader(){
const currentScroll=window.pageYOffset||document.documentElement.scrollTop;
if(currentScroll<=10){
header.classList.remove("header-hidden");
}else if(currentScroll>lastScrollTop+3){
header.classList.add("header-hidden");
}else if(currentScroll<lastScrollTop-3){
header.classList.remove("header-hidden");
}
lastScrollTop=Math.max(currentScroll,0);
ticking=false;
}
window.addEventListener("scroll",function(){
if(!ticking){
window.requestAnimationFrame(updateHeader);
ticking=true;
}
},{passive:true});
});
//Це до навігаційної панельки
document.addEventListener("DOMContentLoaded",function(){
const burger=document.getElementById("burger");
const menu=document.getElementById("menu");
if(!burger||!menu)return;
const links=menu.querySelectorAll("a");
const media=window.matchMedia("(max-width:900px)");
function toggleMenu(){
if(!siteAccessAllowed)return;
const active=burger.classList.toggle("active");
menu.classList.toggle("active");
burger.setAttribute("aria-expanded",active);
}
function resetMenu(){
if(!media.matches){
burger.classList.remove("active");
menu.classList.remove("active");
burger.setAttribute("aria-expanded","false");
}
}
burger.addEventListener("click",toggleMenu);
links.forEach(function(link){
link.addEventListener("click",function(){
if(!siteAccessAllowed)return;
burger.classList.remove("active");
menu.classList.remove("active");
burger.setAttribute("aria-expanded","false");
});
});
media.addEventListener("change",resetMenu);
});
//Це залишок адресної форми
document.querySelectorAll(".copy-btn").forEach(function(button){
button.addEventListener("click",function(){
if(!siteAccessAllowed)return;
const text=this.dataset.copy;
navigator.clipboard.writeText(text).then(function(){
button.classList.add("copied");
button.innerHTML='<i class="fa fa-check"></i>';
setTimeout(function(){
button.classList.remove("copied");
button.innerHTML='<i class="fa fa-copy"></i>';
},1500);
}).catch(function(){
const area=document.createElement("textarea");
area.value=text;
document.body.appendChild(area);
area.select();
document.execCommand("copy");
area.remove();
button.classList.add("copied");
button.innerHTML='<i class="fa fa-check"></i>';
setTimeout(function(){
button.classList.remove("copied");
button.innerHTML='<i class="fa fa-copy"></i>';
},1500);
});
});
});
//Це до каруселі послуг
document.addEventListener("DOMContentLoaded",function(){
const carousel=document.getElementById("carousel");
const prev=document.querySelector(".carousel-btn.prev");
const next=document.querySelector(".carousel-btn.next");
if(!carousel||!prev||!next)return;
function getScrollAmount(){
const item=carousel.querySelector(".item");
if(!item)return 0;
const gap=parseFloat(getComputedStyle(carousel).gap)||0;
return item.getBoundingClientRect().width+gap;
}
function updateButtons(){
const maxScroll=carousel.scrollWidth-carousel.clientWidth;
prev.disabled=carousel.scrollLeft<=2;
next.disabled=carousel.scrollLeft>=maxScroll-2;
}
function moveNext(){
if(!siteAccessAllowed)return;
const amount=getScrollAmount();
const maxScroll=carousel.scrollWidth-carousel.clientWidth;
if(maxScroll<=0)return;
if(carousel.scrollLeft>=maxScroll-2){
carousel.scrollTo({left:0,behavior:"smooth"});
}else{
carousel.scrollBy({left:amount,behavior:"smooth"});
}
}
function movePrev(){
if(!siteAccessAllowed)return;
const amount=getScrollAmount();
const maxScroll=carousel.scrollWidth-carousel.clientWidth;
if(maxScroll<=0)return;
if(carousel.scrollLeft<=2){
carousel.scrollTo({left:maxScroll,behavior:"smooth"});
}else{
carousel.scrollBy({left:-amount,behavior:"smooth"});
}
}
let autoPlay;
function startAutoPlay(){
clearInterval(autoPlay);
if(!siteAccessAllowed)return;
autoPlay=setInterval(function(){moveNext();},4000);
}
function pauseAutoPlay(){
clearInterval(autoPlay);
}
prev.addEventListener("click",function(){
if(!siteAccessAllowed)return;
movePrev();
pauseAutoPlay();
startAutoPlay();
});
next.addEventListener("click",function(){
if(!siteAccessAllowed)return;
moveNext();
pauseAutoPlay();
startAutoPlay();
});
carousel.addEventListener("scroll",updateButtons,{passive:true});
window.addEventListener("resize",updateButtons);
carousel.addEventListener("mouseenter",pauseAutoPlay);
carousel.addEventListener("mouseleave",startAutoPlay);
carousel.addEventListener("touchstart",pauseAutoPlay,{passive:true});
carousel.addEventListener("touchend",startAutoPlay,{passive:true});
carousel.addEventListener("touchcancel",startAutoPlay,{passive:true});
document.addEventListener("visibilitychange",function(){
if(document.hidden)pauseAutoPlay();
else startAutoPlay();
});
updateButtons();
startAutoPlay();
});
//Це до перегляду послуг
document.addEventListener("DOMContentLoaded",function(){
const modal=document.getElementById("serviceModal");
const modalContent=modal?modal.querySelector(".service-modal-content"):null;
const modalImage=document.getElementById("serviceModalImage");
const modalTitle=document.getElementById("serviceModalTitle");
const modalDescription=document.getElementById("serviceModalDescription");
const modalClose=document.getElementById("serviceModalClose");
const modalLink=document.getElementById("serviceModalLink");
const items=document.querySelectorAll(".carousel .item");
const zoomIn=document.getElementById("zoomIn");
const zoomOut=document.getElementById("zoomOut");
const zoomReset=document.getElementById("zoomReset");
const zoomValue=document.getElementById("zoomValue");
if(!modal||!modalContent||!modalImage||!modalClose)return;
let scale=1;
let translateX=0;
let translateY=0;
let startX=0;
let startY=0;
let startTranslateX=0;
let startTranslateY=0;
let dragging=false;
function updateZoom(){
modalImage.style.transform="translate3d("+translateX+"px,"+translateY+"px,0) scale("+scale+")";
if(zoomValue)zoomValue.textContent=Math.round(scale*100)+"%";
if(zoomOut)zoomOut.disabled=scale<=1;
if(zoomIn)zoomIn.disabled=scale>=3;
if(zoomReset)zoomReset.disabled=scale===1&&translateX===0&&translateY===0;
modalImage.style.cursor=scale>1?"grab":"zoom-in";
}
function resetZoom(){
scale=1;
translateX=0;
translateY=0;
updateZoom();
}
function setZoom(value){
scale=Math.min(3,Math.max(1,value));
if(scale===1){
translateX=0;
translateY=0;
}
updateZoom();
}
function openServiceModal(item){
if(!siteAccessAllowed)return;
const image=item.querySelector("img");
if(!image)return;
modalImage.src=image.src;
modalImage.alt=image.alt||"";
if(modalTitle)modalTitle.textContent=item.dataset.title||image.alt||"";
if(modalDescription)modalDescription.textContent=item.dataset.description||"";
resetZoom();
modal.classList.add("active");
modal.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeServiceModal(){
if(!siteAccessAllowed)return;
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
document.body.style.overflow="";
resetZoom();
}
items.forEach(function(item){
item.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
if(event.target.closest(".carousel-btn"))return;
openServiceModal(item);
});
});
modalClose.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.stopPropagation();
closeServiceModal();
});
if(zoomIn){
zoomIn.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
event.stopPropagation();
setZoom(scale+.25);
});
}
if(zoomOut){
zoomOut.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
event.stopPropagation();
setZoom(scale-.25);
});
}
if(zoomReset){
zoomReset.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
event.stopPropagation();
resetZoom();
});
}
modalImage.addEventListener("dblclick",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
if(scale===1)setZoom(2);
else resetZoom();
});
modalImage.addEventListener("wheel",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
if(event.deltaY<0)setZoom(scale+.1);
else setZoom(scale-.1);
},{passive:false});
modalImage.addEventListener("pointerdown",function(event){
if(!siteAccessAllowed||scale<=1)return;
dragging=true;
startX=event.clientX;
startY=event.clientY;
startTranslateX=translateX;
startTranslateY=translateY;
modalImage.setPointerCapture(event.pointerId);
modalImage.classList.add("dragging");
});
modalImage.addEventListener("pointermove",function(event){
if(!siteAccessAllowed||!dragging)return;
translateX=startTranslateX+(event.clientX-startX);
translateY=startTranslateY+(event.clientY-startY);
updateZoom();
});
modalImage.addEventListener("pointerup",function(event){
dragging=false;
modalImage.classList.remove("dragging");
if(modalImage.hasPointerCapture(event.pointerId))modalImage.releasePointerCapture(event.pointerId);
});
modalImage.addEventListener("pointercancel",function(){
dragging=false;
modalImage.classList.remove("dragging");
});
modal.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
if(event.target===modal)closeServiceModal();
});
if(modalLink){
modalLink.addEventListener("click",function(){
if(!siteAccessAllowed)return;
closeServiceModal();
});
}
document.addEventListener("keydown",function(event){
if(!siteAccessAllowed||!modal.classList.contains("active"))return;
if(event.key==="Escape"){
closeServiceModal();
return;
}
if(event.key==="+"||event.key==="="){
event.preventDefault();
setZoom(scale+.25);
}
if(event.key==="-"){
event.preventDefault();
setZoom(scale-.25);
}
if(event.key==="0"){
event.preventDefault();
setZoom(1);
}
});
updateZoom();
});
//Це до секції історії
document.addEventListener("DOMContentLoaded",function(){
const elements=document.querySelectorAll(".history_text.scroll-reveal");
if(!elements.length)return;
const observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
});
},{threshold:.15,rootMargin:"0px 0px -50px 0px"});
elements.forEach(function(element){observer.observe(element);});
});
//Це до портфоліо
document.addEventListener("DOMContentLoaded",function(){
const viewer=document.getElementById("galleryViewer");
const image=document.querySelector(".gallery-image");
const closeBtn=document.querySelector(".gallery-close");
const prevBtn=document.querySelector(".gallery-prev");
const nextBtn=document.querySelector(".gallery-next");
const scrollBar=document.querySelector(".gallery-scroll");
const counter=document.querySelector(".gallery-counter");
const title=document.querySelector(".gallery-title");
const buttons=document.querySelectorAll(".custom-btn-view");
if(!viewer||!image||!closeBtn||!prevBtn||!nextBtn)return;
const galleries={
interior:[
{src:"image/interior1.webp",title:"Інтер’єрні роботи"},
{src:"image/interior2.webp",title:"Інтер’єрні роботи"},
{src:"image/interior3.webp",title:"Інтер’єрні роботи"},
{src:"image/interior4.webp",title:"Інтер’єрні роботи"},
{src:"image/interior5.webp",title:"Інтер’єрні роботи"},
{src:"image/interior6.webp",title:"Інтер’єрні роботи"}
],
tiles:[
{src:"image/tile1.webp",title:"Облицювання"}
],
wood:[
{src:"image/carpentry1.webp",title:"Столярство"},
{src:"image/carpentry2.webp",title:"Столярство"}
],
electric:[
{src:"image/electricity1.webp",title:"Мережі"},
{src:"image/electricity2.webp",title:"Мережі"},
{src:"image/electricity3.webp",title:"Мережі"},
{src:"image/electricity4.webp",title:"Мережі"},
{src:"image/electricity5.webp",title:"Мережі"}
],
brukiwka:[
{src:"image/electricity6.webp",title:"Різне"},
{src:"image/electricity7.webp",title:"Різне"},
{src:"image/electricity8.webp",title:"Різне"}
],
paint:[
{src:"image/caulking1.webp",title:"Оздоблення"},
{src:"image/caulking2.webp",title:"Оздоблення"},
{src:"image/caulking3.webp",title:"Оздоблення"},
{src:"image/caulking4.webp",title:"Оздоблення"}
]
};
let currentGallery=[];
let currentIndex=0;
let scale=1;
let translateX=0;
let translateY=0;
let startX=0;
let startY=0;
let startTranslateX=0;
let startTranslateY=0;
let dragging=false;
function updateImage(){
const item=currentGallery[currentIndex];
if(!item)return;
image.src=item.src;
image.alt=item.title;
if(title)title.textContent=item.title;
if(counter)counter.textContent=(currentIndex+1)+" / "+currentGallery.length;
if(scrollBar)scrollBar.style.setProperty("--gallery-progress",((currentIndex+1)/currentGallery.length*100)+"%");
resetZoom();
prevBtn.disabled=currentGallery.length<=1;
nextBtn.disabled=currentGallery.length<=1;
}
function updateZoom(){
image.style.transform="translate3d("+translateX+"px,"+translateY+"px,0) scale("+scale+")";
viewer.classList.toggle("zoomed",scale>1);
}
function resetZoom(){
scale=1;
translateX=0;
translateY=0;
updateZoom();
}
function openGallery(name){
if(!siteAccessAllowed)return;
if(!galleries[name]||!galleries[name].length)return;
currentGallery=galleries[name];
currentIndex=0;
updateImage();
viewer.classList.add("active");
viewer.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeGallery(){
if(!siteAccessAllowed)return;
viewer.classList.remove("active");
viewer.setAttribute("aria-hidden","true");
document.body.style.overflow="";
resetZoom();
}
function nextImage(){
if(!siteAccessAllowed||currentGallery.length<2)return;
currentIndex=(currentIndex+1)%currentGallery.length;
updateImage();
}
function prevImage(){
if(!siteAccessAllowed||currentGallery.length<2)return;
currentIndex=(currentIndex-1+currentGallery.length)%currentGallery.length;
updateImage();
}
buttons.forEach(function(button){
button.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
openGallery(button.dataset.gallery);
});
});
closeBtn.addEventListener("click",closeGallery);
nextBtn.addEventListener("click",nextImage);
prevBtn.addEventListener("click",prevImage);
viewer.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
if(event.target===viewer)closeGallery();
});
image.addEventListener("dblclick",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
if(scale===1)scale=2;
else resetZoom();
updateZoom();
});
image.addEventListener("wheel",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
if(event.deltaY<0)scale=Math.min(3,scale+.15);
else scale=Math.max(1,scale-.15);
if(scale===1){
translateX=0;
translateY=0;
}
updateZoom();
},{passive:false});
image.addEventListener("pointerdown",function(event){
if(!siteAccessAllowed||scale<=1)return;
dragging=true;
startX=event.clientX;
startY=event.clientY;
startTranslateX=translateX;
startTranslateY=translateY;
image.setPointerCapture(event.pointerId);
});
image.addEventListener("pointermove",function(event){
if(!siteAccessAllowed||!dragging)return;
translateX=startTranslateX+(event.clientX-startX);
translateY=startTranslateY+(event.clientY-startY);
updateZoom();
});
image.addEventListener("pointerup",function(event){
dragging=false;
if(image.hasPointerCapture(event.pointerId))image.releasePointerCapture(event.pointerId);
});
image.addEventListener("pointercancel",function(){
dragging=false;
});
let touchStartX=0;
let touchStartY=0;
image.addEventListener("touchstart",function(event){
if(!siteAccessAllowed||event.touches.length!==1)return;
touchStartX=event.touches[0].clientX;
touchStartY=event.touches[0].clientY;
},{passive:true});
image.addEventListener("touchend",function(event){
if(!siteAccessAllowed||scale>1||event.changedTouches.length!==1)return;
const touch=event.changedTouches[0];
const diffX=touch.clientX-touchStartX;
const diffY=touch.clientY-touchStartY;
if(Math.abs(diffX)>60&&Math.abs(diffX)>Math.abs(diffY)){
if(diffX<0)nextImage();
else prevImage();
}
},{passive:true});
document.addEventListener("keydown",function(event){
if(!siteAccessAllowed||!viewer.classList.contains("active"))return;
if(event.key==="Escape"){
closeGallery();
}else if(event.key==="ArrowRight"){
nextImage();
}else if(event.key==="ArrowLeft"){
prevImage();
}else if(event.key==="+"||event.key==="="){
scale=Math.min(3,scale+.25);
updateZoom();
}else if(event.key==="-"){
scale=Math.max(1,scale-.25);
if(scale===1){
translateX=0;
translateY=0;
}
updateZoom();
}else if(event.key==="0"){
resetZoom();
}
});
});
//Це до секції підтримки
document.addEventListener("DOMContentLoaded",function(){
const items=document.querySelectorAll(".accordion-item");
if(!items.length)return;
function closeItem(item){
const link=item.querySelector(".accordion-link");
item.classList.remove("active");
if(link){
link.classList.remove("active");
link.setAttribute("aria-expanded","false");
}
}
function openItem(item){
const link=item.querySelector(".accordion-link");
items.forEach(function(other){
if(other!==item)closeItem(other);
});
item.classList.add("active");
if(link){
link.classList.add("active");
link.setAttribute("aria-expanded","true");
}
}
items.forEach(function(item){
const link=item.querySelector(".accordion-link");
if(!link)return;
link.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
const isActive=item.classList.contains("active");
if(isActive)closeItem(item);
else openItem(item);
});
});
});
//Це до команди
document.addEventListener("DOMContentLoaded",function(){
const cards=document.querySelectorAll(".cards_wrapper .card");
if(!cards.length)return;
cards.forEach(function(card,index){
card.classList.add("team-reveal");
card.style.setProperty("--team-delay",index*.12+"s");
});
const observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){
if(entry.isIntersecting){
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
});
},{threshold:.12,rootMargin:"0px 0px -40px 0px"});
cards.forEach(function(card){observer.observe(card);});
});
//Це до нижнього колонтитула
document.addEventListener("DOMContentLoaded",function(){
const year=document.getElementById("footerYear");
if(year)year.textContent=new Date().getFullYear();
const track=document.getElementById("track");
if(track){
const partners=Array.from(track.children);
if(partners.length>=2){
partners.forEach(function(partner){
track.appendChild(partner.cloneNode(true));
});
}
}
});
// Підключення згоди та локального зберігання
document.addEventListener("DOMContentLoaded",function(){
if(getTermsAccepted()){
allowSiteAccess();
}else{
blockSiteAccess();
}
});
// Керування cookie
function openCookies(){
const analytics=document.getElementById("cookie-analytics");
const marketing=document.getElementById("cookie-marketing");
const consent=getCookieConsent();
if(analytics)analytics.checked=Boolean(consent&&consent.analytics===true);
if(marketing)marketing.checked=Boolean(consent&&consent.marketing===true);
openModal("filesModal");
}
function saveCookies(){
if(!siteAccessAllowed)return;
const analytics=document.getElementById("cookie-analytics");
const marketing=document.getElementById("cookie-marketing");
const consent={
necessary:true,
analytics:Boolean(analytics&&analytics.checked),
marketing:Boolean(marketing&&marketing.checked),
savedAt:new Date().toISOString()
};
localStorage.setItem(COOKIES_KEY,JSON.stringify(consent));
closeModal(document.getElementById("filesModal"));
}
function declineCookies(){
if(!siteAccessAllowed)return;
const consent={
necessary:true,
analytics:false,
marketing:false,
savedAt:new Date().toISOString()
};
localStorage.setItem(COOKIES_KEY,JSON.stringify(consent));
const analytics=document.getElementById("cookie-analytics");
const marketing=document.getElementById("cookie-marketing");
if(analytics)analytics.checked=false;
if(marketing)marketing.checked=false;
closeModal(document.getElementById("filesModal"));
}
// Панель авторизованого користувача
document.addEventListener("DOMContentLoaded",function(){
const account=document.getElementById("navbarAccount");
const toggle=document.getElementById("navbarAccountToggle");
const menu=document.getElementById("navbarAccountMenu");
const logout=document.getElementById("navbarAccountLogout");
const avatar=document.getElementById("navbarAccountAvatar");
const avatarPlaceholder=document.getElementById("navbarAccountAvatarPlaceholder");
const menuAvatar=document.getElementById("navbarAccountMenuAvatar");
const name=document.getElementById("navbarAccountName");
const menuName=document.getElementById("navbarAccountMenuName");
const menuEmail=document.getElementById("navbarAccountMenuEmail");
if(!account||!toggle||!menu)return;
const SESSION_KEY="peteichuk_session";
const USERS_KEY="peteichuk_users";
function getSession(){
try{
return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
}catch(error){
return null;
}
}
function getUsers(){
try{
const users=JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
return Array.isArray(users)?users:[];
}catch(error){
return [];
}
}
function getCurrentUser(){
const session=getSession();
if(!session||!session.userId)return null;
const users=getUsers();
return users.find(function(user){
return String(user.id)===String(session.userId);
})||null;
}
function getUserName(user){
if(!user)return"Користувач";
return user.name||
user.fullName||
[user.firstName,user.lastName].filter(Boolean).join(" ")||
[user.first_name,user.last_name].filter(Boolean).join(" ")||
user.email||
"Користувач";
}
function getUserEmail(user){
if(!user)return"—";
return user.email||user.emailAddress||"—";
}
function getUserAvatar(user){
if(!user)return"";
return user.avatar||
user.avatarUrl||
user.photo||
user.photoUrl||
user.profileImage||
user.profileImageUrl||
"";
}
function setAvatar(imageElement,placeholder,src,nameText){
if(!imageElement||!placeholder)return;
if(src){
imageElement.src=src;
imageElement.alt="Фото профілю — "+nameText;
imageElement.classList.add("active");
placeholder.classList.add("hidden");
imageElement.onerror=function(){
imageElement.classList.remove("active");
placeholder.classList.remove("hidden");
};
}else{
imageElement.removeAttribute("src");
imageElement.classList.remove("active");
placeholder.classList.remove("hidden");
}
}
function renderAccount(){
const user=getCurrentUser();
if(!user){
account.classList.remove("active","open");
account.setAttribute("aria-hidden","true");
toggle.setAttribute("aria-expanded","false");
return;
}
const userName=getUserName(user);
const userEmail=getUserEmail(user);
const userAvatar=getUserAvatar(user);
name.textContent=userName;
menuName.textContent=userName;
menuEmail.textContent=userEmail;
setAvatar(avatar,avatarPlaceholder,userAvatar,userName);
if(menuAvatar){
if(userAvatar){
menuAvatar.src=userAvatar;
menuAvatar.alt="Фото профілю — "+userName;
menuAvatar.style.display="block";
menuAvatar.onerror=function(){
menuAvatar.style.display="none";
};
}else{
menuAvatar.removeAttribute("src");
menuAvatar.style.display="none";
}
}
account.classList.add("active");
account.setAttribute("aria-hidden","false");
}
function closeAccountMenu(){
account.classList.remove("open");
toggle.setAttribute("aria-expanded","false");
}
toggle.addEventListener("click",function(event){
if(!siteAccessAllowed)return;
event.preventDefault();
event.stopPropagation();
const isOpen=account.classList.toggle("open");
toggle.setAttribute("aria-expanded",isOpen?"true":"false");
});
menu.addEventListener("click",function(event){
event.stopPropagation();
});
document.addEventListener("click",function(event){
if(!account.contains(event.target))closeAccountMenu();
});
document.addEventListener("keydown",function(event){
if(event.key==="Escape")closeAccountMenu();
});
if(logout){
logout.addEventListener("click",function(){
if(!siteAccessAllowed)return;
localStorage.removeItem(SESSION_KEY);
closeAccountMenu();
renderAccount();
window.location.reload();
});
}
window.addEventListener("storage",function(event){
if(event.key===SESSION_KEY||event.key===USERS_KEY)renderAccount();
});
renderAccount();
});
function updateNavbarAccountLayout(){
const navbar=document.getElementById("navbar");
const account=document.getElementById("navbarAccount");
if(!navbar||!account)return;
navbar.classList.toggle("has-account",account.classList.contains("active"));
}