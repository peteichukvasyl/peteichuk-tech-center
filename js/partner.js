document.addEventListener("DOMContentLoaded",function(){
const PARTNER_PROPOSALS_KEY="peteichuk_partner_proposals";
const filters=document.querySelectorAll(".partner-filter");
const cards=document.querySelectorAll(".partner-card");
const search=document.getElementById("partnerSearch");
const empty=document.getElementById("partnerEmpty");
const modal=document.getElementById("partnerModal");
const modalTitle=document.getElementById("modalTitle");
const modalCategory=document.getElementById("modalCategory");
const modalDescription=document.getElementById("modalDescription");
const modalList=document.getElementById("modalList");
const modalIcon=document.getElementById("modalIcon");
const modalAction=document.getElementById("modalAction");
const closeButtons=document.querySelectorAll("[data-close-modal]");
const form=document.getElementById("partnerForm");
const formStatus=document.getElementById("partnerFormStatus");
const offerData={
business:{category:"Бізнес",title:"Бізнес-партнерство",icon:"fa-briefcase",description:"Формат для компаній та підприємців, які хочуть створювати спільні проєкти, обмінюватися ресурсами та знаходити нові точки розвитку.",items:["Спільна реалізація проєктів","Обмін аудиторією та контактами","Взаємна інформаційна підтримка","Довгострокове партнерство"]},
digital:{category:"Digital",title:"Digital співпраця",icon:"fa-code",description:"Співпраця у сфері цифрових продуктів, веброзробки, автоматизації та технічної реалізації сучасних ідей.",items:["Створення вебпроєктів","Розробка цифрових рішень","Автоматизація процесів","Технічна підтримка"]},
media:{category:"Медіа",title:"Медіа партнерство",icon:"fa-bullhorn",description:"Спільні інформаційні та контентні проєкти, які допомагають обом сторонам розширювати аудиторію та комунікацію.",items:["Спільне створення контенту","Інформаційні кампанії","Взаємне просування","Медіа-проєкти"]},
services:{category:"Послуги",title:"Професійні послуги",icon:"fa-cogs",description:"Об’єднання професійних компетенцій для реалізації конкретних завдань, проєктів та сервісів.",items:["Обмін експертизою","Спільне виконання проєктів","Партнерська робота з клієнтами","Довгострокова професійна співпраця"]}
};
let activeFilter="all";
function filterCards(){
const query=(search?.value||"").trim().toLowerCase();
let visible=0;
cards.forEach(function(card){
const category=card.dataset.category||"";
const title=(card.dataset.title||"").toLowerCase();
const text=card.textContent.toLowerCase();
const categoryMatch=activeFilter==="all"||category===activeFilter;
const searchMatch=!query||title.includes(query)||text.includes(query);
const show=categoryMatch&&searchMatch;
card.classList.toggle("hidden",!show);
if(show)visible++;
});
if(empty)empty.classList.toggle("active",visible===0);
}
filters.forEach(function(button){
button.addEventListener("click",function(){
filters.forEach(function(item){item.classList.remove("active");});
button.classList.add("active");
activeFilter=button.dataset.filter||"all";
filterCards();
});
});
if(search)search.addEventListener("input",filterCards);
function openModal(type){
const data=offerData[type];
if(!data)return;
modalIcon.innerHTML='<i class="fa '+data.icon+'"></i>';
modalCategory.textContent=data.category;
modalTitle.textContent=data.title;
modalDescription.textContent=data.description;
modalList.innerHTML=data.items.map(function(item){
return '<div><i class="fa fa-check"></i><span>'+item+'</span></div>';
}).join("");
modalAction.href="#proposal";
modal.classList.add("active");
modal.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeModal(){
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
document.body.style.overflow="";
}
document.querySelectorAll(".partner-details-btn").forEach(function(button){
button.addEventListener("click",function(){
openModal(button.dataset.offer);
});
});
closeButtons.forEach(function(button){
button.addEventListener("click",closeModal);
});
document.addEventListener("keydown",function(event){
if(event.key==="Escape"&&modal.classList.contains("active"))closeModal();
});
if(modalAction)modalAction.addEventListener("click",function(){
closeModal();
setTimeout(function(){
const nameInput=document.getElementById("partnerName");
if(nameInput)nameInput.focus();
},400);
});
if(form){
form.addEventListener("submit",function(event){
event.preventDefault();
if(!form.checkValidity()){
form.reportValidity();
return;
}
const formData=new FormData(form);
const name=(formData.get("name")||"").toString().trim();
const company=(formData.get("company")||"").toString().trim();
const email=(formData.get("email")||"").toString().trim();
const phone=(formData.get("phone")||"").toString().trim();
const type=(formData.get("type")||"").toString().trim();
const website=(formData.get("website")||"").toString().trim();
const message=(formData.get("message")||"").toString().trim();
let proposals=[];
try{
proposals=JSON.parse(localStorage.getItem(PARTNER_PROPOSALS_KEY)||"[]");
if(!Array.isArray(proposals))proposals=[];
}catch(error){
proposals=[];
}
const proposal={
id:"partner_"+Date.now()+"_"+Math.random().toString(36).slice(2,8),
name:name,
company:company,
email:email,
phone:phone,
type:type,
website:website,
message:message,
status:"new",
createdAt:new Date().toISOString(),
replies:[]
};
proposals.unshift(proposal);
localStorage.setItem(PARTNER_PROPOSALS_KEY,JSON.stringify(proposals));
formStatus.className="success";
formStatus.textContent="Дякуємо, "+name+"! Вашу партнерську пропозицію успішно надіслано.";
form.reset();
});
}
const footerTop=document.getElementById("partnerTop");
if(footerTop){
footerTop.addEventListener("click",function(event){
event.preventDefault();
window.scrollTo({top:0,behavior:"smooth"});
});
}
const primaryButton=document.querySelector('.partner-primary-btn[href="#proposal"]');
if(primaryButton){
primaryButton.addEventListener("click",function(){
setTimeout(function(){
const nameInput=document.getElementById("partnerName");
if(nameInput)nameInput.focus();
},400);
});
}
const heroBg=document.querySelector(".partner-hero-bg");
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
filterCards();
});