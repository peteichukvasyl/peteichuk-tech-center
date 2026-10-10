(()=>{
"use strict";
const screen=document.getElementById("security-screen");
const resumeRoot=document.getElementById("resume-root");
const question=document.getElementById("security-question");
const itemsBox=document.getElementById("security-items");
const answerBox=document.getElementById("security-answer");
const checkButton=document.getElementById("security-check");
const resetButton=document.getElementById("security-reset");
const statusBox=document.getElementById("security-status");
const progress=document.getElementById("security-progress");
const progressBar=document.getElementById("security-progress-bar");
const helperText=document.getElementById("security-helper-text");
const honeypot=document.getElementById("website-field");
const SESSION_KEY="vp_resume_human_verified_v3";
const SESSION_TIME=30*60*1000;
const MAX_ATTEMPTS=3;
const MIN_TIME=900;
const words=["MINDE","ARBEIT","BERUF","TECHNIK","WEB","HTML","CSS","CODE"];
let currentChallenge=null;
let challengeStartedAt=0;
let attempts=0;
function shuffle(array){
const result=[...array];
for(let i=result.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[result[i],result[j]]=[result[j],result[i]];
}
return result;
}
function setStatus(text,type=""){
if(!text){
statusBox.textContent="";
statusBox.className="security-status";
return;
}
statusBox.textContent=text;
statusBox.className="security-status visible "+type;
}
function setHelper(text){helperText.textContent=text}
function updateProgress(){
if(!currentChallenge)return;
const total=currentChallenge.answer.length;
const selected=currentChallenge.selected.length;
if(selected===0){
progress.classList.remove("visible");
progressBar.style.width="0%";
return;
}
progress.classList.add("visible");
const percent=Math.min(100,(selected/total)*100);
progressBar.style.width=percent+"%";
}
function updateAnswerBox(){
answerBox.innerHTML="";
if(!currentChallenge.selected.length){
answerBox.classList.remove("has-items");
return;
}
answerBox.classList.add("has-items");
currentChallenge.selected.forEach((value,index)=>{
const button=document.createElement("button");
button.type="button";
button.className="security-answer-item";
button.textContent=value;
button.title="Натисніть, щоб прибрати";
button.addEventListener("click",()=>{
currentChallenge.selected.splice(index,1);
renderItems();
updateAnswerBox();
updateProgress();
setHelper(currentChallenge.selected.length?"Добре. Продовжуйте складати відповідь у правильному порядку.":"Натисніть першу потрібну літеру.");
});
answerBox.appendChild(button);
});
}
function renderItems(items){
itemsBox.innerHTML="";
items.forEach((value,index)=>{
const button=document.createElement("button");
button.type="button";
button.className="security-item";
button.textContent=value;
button.dataset.position=index;
const alreadySelected=currentChallenge.selected.includes(value);
if(alreadySelected)button.classList.add("selected");
button.addEventListener("click",()=>{selectItem(button,value)});
itemsBox.appendChild(button);
});
updateProgress();
}
function selectItem(button,value){
if(!currentChallenge)return;
if(currentChallenge.selected.length>=currentChallenge.answer.length){
setHelper("Ви вже вибрали потрібну кількість елементів. Перевірте відповідь.");
return;
}
const nextIndex=currentChallenge.selected.length;
const expected=currentChallenge.answer[nextIndex];
if(value===expected){
currentChallenge.selected.push(value);
button.classList.add("selected");
updateAnswerBox();
updateProgress();
const completed=currentChallenge.selected.length===currentChallenge.answer.length;
if(completed)setHelper("Готово. Усі елементи вибрано. Натисніть «Перевірити».");
else setHelper("✓ Правильно. Тепер виберіть наступну літеру.");
return;
}
setHelper("ℹ Ця літера зараз не потрібна. Спробуйте іншу.");
button.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(0)"}],{duration:180});
}
function createChallenge(){
attempts=0;
setStatus("");
answerBox.innerHTML="";
answerBox.classList.remove("has-items");
progress.classList.remove("visible");
progressBar.style.width="0%";
challengeStartedAt=Date.now();
const word=words[Math.floor(Math.random()*words.length)];
currentChallenge={answer:word.split(""),selected:[]};
if(word==="WEB"||word==="CSS"){
currentChallenge.answer=["1","2","3"];
question.textContent="Розташуйте числа від найменшого до найбільшого.";
renderItems(shuffle(["1","2","3"]));
setHelper("Натискайте числа по черзі: спочатку найменше, потім наступне.");
return;
}
question.textContent="Складіть слово, натискаючи літери у правильному порядку.";
renderItems(shuffle(word.split("")));
setHelper("Почніть із першої літери слова. Потім виберіть другу, третю і так далі.");
}
function verify(){
if(honeypot.value.trim()!==""){
setStatus("Перевірку не пройдено.","error");
createChallenge();
return;
}
const elapsed=Date.now()-challengeStartedAt;
if(elapsed<MIN_TIME){
setStatus("Спробуйте виконати завдання уважніше.","error");
createChallenge();
return;
}
if(!currentChallenge){
createChallenge();
return;
}
if(currentChallenge.selected.length!==currentChallenge.answer.length){
setStatus("Спочатку виконайте завдання повністю.","error");
setHelper("Потрібно вибрати всі елементи у правильному порядку.");
return;
}
const selected=currentChallenge.selected.join("");
const expected=currentChallenge.answer.join("");
if(selected!==expected){
attempts++;
if(attempts>=MAX_ATTEMPTS){
setStatus("Завдання оновлено. Спробуйте нове.","error");
setHelper("Не хвилюйтеся. Натисніть «Нове завдання» і спробуйте ще раз.");
setTimeout(createChallenge,600);
return;
}
setStatus("Відповідь неправильна.","error");
setHelper("Перевірте порядок літер і спробуйте ще раз.");
return;
}
setStatus("✓ Перевірку успішно пройдено.","success");
setHelper("Готово. Зараз відкриваємо резюме.");
progress.classList.add("visible");
progressBar.style.width="100%";
try{sessionStorage.setItem(SESSION_KEY,String(Date.now()))}catch(error){}
setTimeout(openResume,450);
}
function openResume(){
screen.style.opacity="0";
screen.style.transition="opacity .35s ease";
setTimeout(()=>{
screen.remove();
resumeRoot.style.display="block";
initializeResumeAnimations();
},350);
}
function alreadyVerified(){
try{
const value=sessionStorage.getItem(SESSION_KEY);
if(!value)return false;
const timestamp=Number(value);
if(!Number.isFinite(timestamp))return false;
return Date.now()-timestamp<SESSION_TIME;
}catch(error){return false}
}
function initializeResumeAnimations(){
const elements=document.querySelectorAll(".resume-block,.resume-profile");
if(!elements.length)return;
if(!("IntersectionObserver" in window)){
elements.forEach(element=>{element.classList.add("resume-visible")});
return;
}
const observer=new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("resume-visible");
observer.unobserve(entry.target);
}
});
},{threshold:.12});
elements.forEach(element=>{observer.observe(element)});
}
checkButton.addEventListener("click",verify);
resetButton.addEventListener("click",createChallenge);
document.addEventListener("keydown",event=>{
if(event.key==="Enter"&&document.body.contains(screen))verify();
});
if(alreadyVerified()){
screen.remove();
resumeRoot.style.display="block";
initializeResumeAnimations();
}else createChallenge();
})();