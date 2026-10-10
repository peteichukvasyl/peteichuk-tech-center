document.addEventListener("DOMContentLoaded",function(){
const heroBg=document.querySelector(".projects-hero-bg");
const search=document.getElementById("projectsSearch");
const filters=document.querySelectorAll(".projects-filter");
const cards=document.querySelectorAll(".projects-card");
const empty=document.getElementById("projectsEmpty");
const modal=document.getElementById("projectsModal");
const closeButtons=document.querySelectorAll("[data-close-projects]");
const modalTitle=document.getElementById("modalTitle");
const modalCategory=document.getElementById("modalCategory");
const modalDescription=document.getElementById("modalDescription");
const modalTech=document.getElementById("modalTech");
const modalDemo=document.getElementById("modalDemo");
const modalCode=document.getElementById("modalCode");
const topButton=document.getElementById("projectsTop");
const year=document.getElementById("projectsYear");
const projects=[
{title:"Peteichuk Personal Website",category:"Сайт",description:"Персональний вебсайт із розділами про роботу, медіа, партнерів, соціальну відповідальність та власні проєкти.",tech:["HTML","CSS","JavaScript"],demo:"index.html",code:"#2"},
{title:"Portfolio Website",category:"Сайт",description:"Мінімалістичний сайт-портфоліо для демонстрації робіт, досвіду та реалізованих технічних рішень.",tech:["HTML","CSS","JavaScript"],demo:"#",code:"#"},
{title:"Utility Scripts",category:"Скрипт",description:"Набір невеликих скриптів для автоматизації повторюваних задач та спрощення повсякденної роботи.",tech:["JavaScript","Python"],demo:"#",code:"#"},
{title:"Web Components",category:"Код",description:"Колекція власних компонентів та інтерфейсних рішень, які можна повторно використовувати у вебпроєктах.",tech:["HTML","CSS","JavaScript"],demo:"#",code:"#"},
{title:"Interface Experiments",category:"Експеримент",description:"Експериментальні інтерфейси, анімації, взаємодії та підходи до побудови мінімалістичних вебсторінок.",tech:["CSS","JavaScript"],demo:"#",code:"#"},
{title:"Automation Lab",category:"Код",description:"Тестування автоматизації, невеликих програмних рішень та підходів до оптимізації технічних процесів.",tech:["JavaScript","Python"],demo:"#",code:"#"}
];
let activeFilter="all";
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
function filterProjects(){
const query=(search?search.value:"").trim().toLowerCase();
let visible=0;
cards.forEach(function(card){
const category=card.dataset.category||"";
const title=(card.dataset.title||"").toLowerCase();
const text=card.textContent.toLowerCase();
const matchesFilter=activeFilter==="all"||category===activeFilter;
const matchesSearch=!query||title.includes(query)||text.includes(query);
const show=matchesFilter&&matchesSearch;
card.classList.toggle("hidden",!show);
if(show)visible++;
});
if(empty)empty.classList.toggle("active",visible===0);
}
filters.forEach(function(filter){
filter.addEventListener("click",function(){
filters.forEach(function(item){item.classList.remove("active");});
filter.classList.add("active");
activeFilter=filter.dataset.filter||"all";
filterProjects();
});
});
if(search)search.addEventListener("input",filterProjects);
function openProject(index){
const project=projects[index];
if(!project||!modal)return;
modalTitle.textContent=project.title;
modalCategory.textContent=project.category;
modalDescription.textContent=project.description;
modalTech.innerHTML="";
project.tech.forEach(function(item){
const span=document.createElement("span");
span.textContent=item;
modalTech.appendChild(span);
});
modalDemo.href=project.demo;
modalCode.href=project.code;
modal.classList.add("active");
modal.setAttribute("aria-hidden","false");
document.body.style.overflow="hidden";
}
function closeProject(){
if(!modal)return;
modal.classList.remove("active");
modal.setAttribute("aria-hidden","true");
document.body.style.overflow="";
}
document.querySelectorAll(".projects-card-demo").forEach(function(button){
button.addEventListener("click",function(){
const index=parseInt(button.dataset.project,10);
if(!Number.isNaN(index))openProject(index);
});
});
closeButtons.forEach(function(button){
button.addEventListener("click",closeProject);
});
document.addEventListener("keydown",function(event){
if(!modal||!modal.classList.contains("active"))return;
if(event.key==="Escape")closeProject();
});
if(topButton){
topButton.addEventListener("click",function(event){
event.preventDefault();
window.scrollTo({top:0,behavior:"smooth"});
});
}
if(year)year.textContent=new Date().getFullYear();
});