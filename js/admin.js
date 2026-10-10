document.addEventListener("DOMContentLoaded",function(){
const SESSION_KEY="peteichuk_session";
const USERS_KEY="peteichuk_users";
const MESSAGES_KEY="peteichuk_messages";
const PRESENCE_KEY="peteichuk_presence";
const LOGS_KEY="peteichuk_admin_logs";
const ANALYTICS_KEY="peteichuk_site_analytics";
const PARTNER_PROPOSALS_KEY="peteichuk_partner_proposals";
/*
ДАНІ ВЛАСНИКА / АДМІНІСТРАТОРА / МОДЕРАТОРА

SHA-256 хеш пароля:

ВАЖЛИВО:
У робочому коді паролі не повинні зберігатися відкрито.
У peteichuk_users → passwordHash зберігається тільки SHA-256 хеш.

Якщо сайт буде переноситися на справжній сервер,
ці дані потрібно буде винести з JavaScript на backend.
*/
const OWNER_EMAIL="owner@site-owner.com";
const OWNER_PASSWORD_HASH="6e68d75953670c5cdc47aa62383a7bd2b60f6a3fec207dc10e940cfbbe89988b";

const ADMIN_EMAIL="admin@site-admin.com";
const ADMIN_PASSWORD_HASH="804ed5222ff3fba95bc1f3e2c91e0551d3b5e5e6d1c5566edf68e5203d54196e";

const MODERATOR_EMAIL="moder@site-moder.com";
const MODERATOR_PASSWORD_HASH="e4bbaea57ffd867fb1f9d10057fe8619bfaa6f86576baadc40f24ecb0ea9984b";

setupSystemAccounts();

let session=getSession();

if(!session||!session.userId){
window.location.href="auth.html";
return;
}

let currentUser=getCurrentUser();
let expandedUserId=null;

if(!currentUser||currentUser.blocked===true||!["owner","admin","moderator"].includes(currentUser.role)){
localStorage.removeItem(SESSION_KEY);
window.location.href="auth.html";
return;
}

if(currentUser.role==="owner"){
session.role="owner";
}else{
session.role=currentUser.role;
}

session.name=currentUser.name;
session.email=currentUser.email;

if(!session.sessionId){
session.sessionId=createId();
}

localStorage.setItem(SESSION_KEY,JSON.stringify(session));

const status=document.getElementById("adminStatus");
const usersCount=document.getElementById("usersCount");
const onlineCount=document.getElementById("onlineCount");
const messagesCount=document.getElementById("messagesCount");
const newCount=document.getElementById("newCount");
const messagesElement=document.getElementById("messages");
const usersElement=document.getElementById("users");
const logout=document.getElementById("adminLogout");
const clearMessages=document.getElementById("clearMessages");
const promoteForm=document.getElementById("promoteForm");
const promoteEmail=document.getElementById("promoteEmail");
const promoteRole=document.getElementById("promoteRole");
const promoteStatus=document.getElementById("promoteStatus");
const adminPasswordForm=document.getElementById("adminPasswordForm");
const adminPasswordEmail=document.getElementById("adminPasswordEmail");
const adminNewPassword=document.getElementById("adminNewPassword");
const adminPasswordStatus=document.getElementById("adminPasswordStatus");
const auditSection=document.getElementById("ownerAuditSection");
const auditLog=document.getElementById("adminLogs");
const clearLogs=document.getElementById("clearLogs");
const clearAnalytics=document.getElementById("clearAnalytics");
const analyticsVisits=document.getElementById("analyticsVisits");
const analyticsEvents=document.getElementById("analyticsEvents");
const analyticsSessions=document.getElementById("analyticsSessions");
const analyticsLastVisit=document.getElementById("analyticsLastVisit");
const analyticsVisitsList=document.getElementById("analyticsVisitsList");
const analyticsActionsList=document.getElementById("analyticsActionsList");

function escapeHtml(value){
return String(value??"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}

function getPartnerProposals(){
try{
const data=JSON.parse(localStorage.getItem(PARTNER_PROPOSALS_KEY)||"[]");
return Array.isArray(data)?data:[];
}catch(error){
return [];
}
}

function savePartnerProposals(proposals){
localStorage.setItem(PARTNER_PROPOSALS_KEY,JSON.stringify(proposals));
}

function formatPartnerDate(date){
if(!date)return"—";
const value=new Date(date);
if(Number.isNaN(value.getTime()))return"—";
return value.toLocaleString("uk-UA",{
day:"2-digit",
month:"2-digit",
year:"numeric",
hour:"2-digit",
minute:"2-digit"
});
}

function partnerStatusLabel(status){
const labels={
new:"Нова",
in_progress:"В роботі",
answered:"Відповіли",
closed:"Закрита"
};
return labels[status]||"Нова";
}

function renderPartnerProposals(){
const container=document.getElementById("partnerProposals");
const partnerCount=document.getElementById("partnerCount");
const newPartnerCount=document.getElementById("newPartnerCount");

if(!container)return;

const proposals=getPartnerProposals();

if(partnerCount){
partnerCount.textContent=proposals.length;
}

if(newPartnerCount){
newPartnerCount.textContent=proposals.filter(function(item){
return !item.status||item.status==="new";
}).length;
}

if(!proposals.length){
container.innerHTML='<div class="message-empty">Партнерських пропозицій поки немає.</div>';
return;
}

container.innerHTML=proposals.map(function(item){
const status=item.status||"new";

const website=item.website
?'<a href="'+escapeHtml(item.website)+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(item.website)+'</a>'
:"—";

const typeLabels={
business:"Бізнес",
digital:"Digital",
media:"Медіа",
services:"Послуги"
};

const type=typeLabels[item.type]||item.type||"—";

return '<article class="message-card partner-proposal-card" data-partner-id="'+escapeHtml(item.id||"")+'">'+
'<div class="message-card-head">'+
'<div>'+
'<strong>'+escapeHtml(item.name||"Без імені")+'</strong>'+
'<span>'+escapeHtml(item.company||"Без компанії")+'</span>'+
'</div>'+
'<span class="partner-status partner-status-'+escapeHtml(status)+'">'+escapeHtml(partnerStatusLabel(status))+'</span>'+
'</div>'+
'<div class="message-card-meta">'+
'<span>Тип: '+escapeHtml(type)+'</span>'+
'<span>Email: '+escapeHtml(item.email||"—")+'</span>'+
'<span>Телефон: '+escapeHtml(item.phone||"—")+'</span>'+
'<span>Дата: '+escapeHtml(formatPartnerDate(item.createdAt))+'</span>'+
'</div>'+
'<div class="partner-proposal-info">'+
'<p><strong>Сайт:</strong> '+website+'</p>'+
'<p><strong>Пропозиція:</strong></p>'+
'<div>'+escapeHtml(item.message||"—").replace(/\n/g,"<br>")+'</div>'+
'</div>'+
'<div class="partner-proposal-actions">'+
'<select class="partner-status-select" data-id="'+escapeHtml(item.id||"")+'">'+
'<option value="new"'+(status==="new"?" selected":"")+'>Нова</option>'+
'<option value="in_progress"'+(status==="in_progress"?" selected":"")+'>В роботі</option>'+
'<option value="answered"'+(status==="answered"?" selected":"")+'>Відповіли</option>'+
'<option value="closed"'+(status==="closed"?" selected":"")+'>Закрита</option>'+
'</select>'+
'<a href="mailto:'+escapeHtml(item.email||"")+'" class="partner-reply-btn">Відповісти</a>'+
'<button type="button" class="partner-delete-btn" data-id="'+escapeHtml(item.id||"")+'">Видалити</button>'+
'</div>'+
'</article>';
}).join("");

container.querySelectorAll(".partner-status-select").forEach(function(select){
select.addEventListener("change",function(){
const proposals=getPartnerProposals();
const proposal=proposals.find(function(item){
return item.id===select.dataset.id;
});

if(!proposal)return;

proposal.status=select.value;
savePartnerProposals(proposals);
renderPartnerProposals();
});
});

container.querySelectorAll(".partner-delete-btn").forEach(function(button){
button.addEventListener("click",function(){
if(!confirm("Видалити цю партнерську пропозицію?"))return;

const proposals=getPartnerProposals();
const filtered=proposals.filter(function(item){
return item.id!==button.dataset.id;
});

savePartnerProposals(filtered);
renderPartnerProposals();
});
});
}

const clearPartnerProposals=document.getElementById("clearPartnerProposals");

if(clearPartnerProposals){
clearPartnerProposals.addEventListener("click",function(){
if(!confirm("Очистити всі партнерські пропозиції?"))return;

localStorage.removeItem(PARTNER_PROPOSALS_KEY);
renderPartnerProposals();
});
}

if(auditSection){
auditSection.style.display=session.role==="owner"?"":"none";
}

if(clearAnalytics&&session.role!=="owner"){
clearAnalytics.style.display="none";
}

touchPresence();
render();
renderPartnerProposals();

const refresh=setInterval(function(){
if(!checkCurrentAccount())return;

cleanupPresence();
touchPresence();
render();
renderPartnerProposals();
},10000);

window.addEventListener("storage",function(event){
if([USERS_KEY,MESSAGES_KEY,PRESENCE_KEY,SESSION_KEY,LOGS_KEY,ANALYTICS_KEY,PARTNER_PROPOSALS_KEY].includes(event.key)){
if(checkCurrentAccount()){
render();
renderPartnerProposals();
}
}
});

if(logout)logout.addEventListener("click",function(){
removePresence();
localStorage.removeItem(SESSION_KEY);
clearInterval(refresh);
window.location.href="index.html";
});

if(clearAnalytics)clearAnalytics.addEventListener("click",function(){
if(session.role!=="owner"){
if(status)status.textContent="Тільки власник може очищати аналітику.";
return;
}

if(!confirm("Очистити всю локально збережену аналітику сайту?"))return;

localStorage.removeItem(ANALYTICS_KEY);

addAdminLog("clear_analytics",{
action:"clear_analytics"
});

if(status)status.textContent="Аналітику очищено.";

renderAnalytics();
});

if(clearMessages)clearMessages.addEventListener("click",function(){
if(!canAdmin()){
if(status)status.textContent="Недостатньо прав для очищення повідомлень.";
return;
}

if(!confirm("Очистити всі локально збережені повідомлення?"))return;

const count=getArray(MESSAGES_KEY).length;

localStorage.removeItem(MESSAGES_KEY);

addAdminLog("clear_messages",{
count:count
});

if(status)status.textContent="Локальні повідомлення очищено.";

render();
});

/*
ЗМІНА РОЛІ

Власник має повний контроль над ролями.
Адміністратор може змінювати ролі звичайних користувачів.
Модератор не може змінювати ролі.
Статус власника не може бути змінений жодним іншим акаунтом.
*/

if(promoteForm)promoteForm.addEventListener("submit",function(event){
event.preventDefault();

if(!canAdmin()){
if(promoteStatus)promoteStatus.textContent="Тільки власник або адміністратор може змінювати ролі.";
return;
}

const email=promoteEmail.value.trim().toLowerCase();
const role=promoteRole.value;
const users=getArray(USERS_KEY);

const index=users.findIndex(function(item){
return item.email===email;
});

if(index<0){
if(promoteStatus)promoteStatus.textContent="Користувача з таким email не знайдено.";
return;
}

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
if(promoteStatus)promoteStatus.textContent="Статус власника не може бути змінений.";
return;
}

if(role==="owner"){
if(promoteStatus)promoteStatus.textContent="Створення або передача статусу власника через цю форму заборонені.";
return;
}

const oldRole=users[index].role;

if(oldRole===role){
if(promoteStatus)promoteStatus.textContent="Користувач уже має цю роль.";
return;
}

if(session.role==="admin"&&users[index].role!=="user"){
if(promoteStatus)promoteStatus.textContent="Адміністратор може змінювати роль тільки звичайного користувача.";
return;
}

users[index].role=role;

saveArray(USERS_KEY,users);

addAdminLog("role_change",{
userId:users[index].id,
email:users[index].email,
oldRole:oldRole,
newRole:role
});

if(users[index].id===session.userId){
session.role=role;
localStorage.setItem(SESSION_KEY,JSON.stringify(session));
}

if(promoteStatus){
promoteStatus.textContent="Роль змінено. Користувач має увійти повторно, щоб отримати нову роль.";
}

render();
});

/*
ЗМІНА ПАРОЛЯ АДМІНІСТРАТОРОМ

Тільки admin може встановлювати новий пароль іншому користувачу.
Пароль не зберігається у відкритому вигляді.
У peteichuk_users записується тільки SHA-256 хеш.
*/

if(!canAdmin()){
if(adminPasswordForm)adminPasswordForm.style.display="none";
}else if(adminPasswordForm){
adminPasswordForm.addEventListener("submit",async function(event){
event.preventDefault();

const email=adminPasswordEmail.value.trim().toLowerCase();
const newPassword=adminNewPassword.value;

if(!email){
if(adminPasswordStatus)adminPasswordStatus.textContent="Введіть email користувача.";
return;
}

if(newPassword.length<8){
if(adminPasswordStatus)adminPasswordStatus.textContent="Пароль має містити щонайменше 8 символів.";
return;
}

const users=getArray(USERS_KEY);

const index=users.findIndex(function(item){
return item.email===email;
});

if(index<0){
if(adminPasswordStatus)adminPasswordStatus.textContent="Користувача з таким email не знайдено.";
return;
}

normalizeUser(users[index]);

if(isOwnerUser(users[index])&&session.role!=="owner"){
if(adminPasswordStatus)adminPasswordStatus.textContent="Пароль власника може змінити тільки власник.";
return;
}

try{
const passwordHash=await hashPassword(newPassword);

users[index].passwordHash=passwordHash;

saveArray(USERS_KEY,users);

addAdminLog("password_change",{
userId:users[index].id,
email:users[index].email
});

if(adminPasswordStatus){
adminPasswordStatus.textContent="Пароль успішно змінено. Збережено тільки SHA-256 хеш.";
}

adminPasswordForm.reset();
render();

}catch(error){
if(adminPasswordStatus){
adminPasswordStatus.textContent="Не вдалося змінити пароль.";
}
}
});
}

if(clearLogs)clearLogs.addEventListener("click",function(){
if(session.role!=="owner"){
if(status)status.textContent="Тільки власник може очищати журнал дій.";
return;
}

if(!confirm("Очистити весь журнал дій адміністрації?"))return;

localStorage.removeItem(LOGS_KEY);

if(status)status.textContent="Журнал дій очищено.";

renderAuditLog();
});

window.addEventListener("beforeunload",removePresence);

function setupSystemAccounts(){
const users=getArray(USERS_KEY);
let changed=false;

const ownerIndex=users.findIndex(function(item){
return item.email===OWNER_EMAIL||item.role==="owner";
});

if(ownerIndex<0){
users.push(createSystemUser("Власник",OWNER_EMAIL,OWNER_PASSWORD_HASH,"owner"));
changed=true;
}else{
normalizeUser(users[ownerIndex]);

if(users[ownerIndex].email!==OWNER_EMAIL){
users[ownerIndex].email=OWNER_EMAIL;
changed=true;
}

if(users[ownerIndex].role!=="owner"){
users[ownerIndex].role="owner";
changed=true;
}

if(!users[ownerIndex].passwordHash){
users[ownerIndex].passwordHash=OWNER_PASSWORD_HASH;
changed=true;
}

if(users[ownerIndex].blocked===true){
users[ownerIndex].blocked=false;
changed=true;
}

if(users[ownerIndex].muted===true){
users[ownerIndex].muted=false;
changed=true;
}
}

const adminIndex=users.findIndex(function(item){
return item.email===ADMIN_EMAIL;
});

if(adminIndex<0){
users.push(createSystemUser("Адміністратор",ADMIN_EMAIL,ADMIN_PASSWORD_HASH,"admin"));
changed=true;
}else{
normalizeUser(users[adminIndex]);

if(!users[adminIndex].passwordHash){
users[adminIndex].passwordHash=ADMIN_PASSWORD_HASH;
changed=true;
}
}

const moderatorIndex=users.findIndex(function(item){
return item.email===MODERATOR_EMAIL;
});

if(moderatorIndex<0){
users.push(createSystemUser("Модератор",MODERATOR_EMAIL,MODERATOR_PASSWORD_HASH,"moderator"));
changed=true;
}else{
normalizeUser(users[moderatorIndex]);

if(!users[moderatorIndex].passwordHash){
users[moderatorIndex].passwordHash=MODERATOR_PASSWORD_HASH;
changed=true;
}
}

if(changed)saveArray(USERS_KEY,users);
}

function createSystemUser(name,email,passwordHash,role){
return{
id:createId(),
name:name,
email:email,
passwordHash:passwordHash,
role:role,
phone:"",
address:"",
company:"",
bio:"",
avatar:"",
socials:{
instagram:"",
facebook:"",
telegram:"",
tiktok:"",
linkedin:"",
twitter:"",
website:""
},
ratingPoints:0,
ratingGivenBy:[],
blocked:false,
muted:false,
createdAt:new Date().toISOString()
};
}

function normalizeUser(item){
if(!item.phone)item.phone="";
if(!item.address)item.address="";
if(!item.company)item.company="";
if(!item.bio)item.bio="";
if(!item.avatar)item.avatar="";
if(!item.socials||typeof item.socials!=="object")item.socials={};
item.socials.instagram=item.socials.instagram||"";
item.socials.facebook=item.socials.facebook||"";
item.socials.telegram=item.socials.telegram||"";
item.socials.tiktok=item.socials.tiktok||"";
item.socials.linkedin=item.socials.linkedin||"";
item.socials.twitter=item.socials.twitter||"";
item.socials.website=item.socials.website||"";
if(typeof item.ratingPoints!=="number")item.ratingPoints=0;
if(!Array.isArray(item.ratingGivenBy))item.ratingGivenBy=[];
if(typeof item.blocked!=="boolean")item.blocked=false;
if(typeof item.muted!=="boolean")item.muted=false;
}

function createId(){
if(window.crypto&&typeof crypto.randomUUID==="function"){
return crypto.randomUUID();
}
return Date.now().toString(36)+Math.random().toString(36).slice(2);
}

function getSession(){
try{
return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
}catch(error){
return null;
}
}

function getCurrentUser(){
const users=getArray(USERS_KEY);
const item=users.find(function(user){return user.id===session.userId;});

if(item)normalizeUser(item);

return item||null;
}

function checkCurrentAccount(){
const latestSession=getSession();
const users=getArray(USERS_KEY);

if(!latestSession||!latestSession.userId){
removePresence();
localStorage.removeItem(SESSION_KEY);
window.location.href="../auth/auth.html";
return false;
}

const latestUser=users.find(function(item){
return item.id===latestSession.userId;
});

if(!latestUser){
removePresence();
localStorage.removeItem(SESSION_KEY);
window.location.href="../auth/auth.html";
return false;
}

normalizeUser(latestUser);

if(isOwnerUser(latestUser)){
latestUser.email=OWNER_EMAIL;
latestUser.role="owner";
latestUser.blocked=false;
latestUser.muted=false;
}

if(latestUser.blocked===true){
removePresence();
localStorage.removeItem(SESSION_KEY);
window.location.href="../auth/auth.html";
return false;
}

session=latestSession;

if(!session.sessionId){
session.sessionId=createId();
}

session.name=latestUser.name;
session.email=latestUser.email;
session.role=latestUser.role||"user";

currentUser=latestUser;

if(!["owner","admin","moderator"].includes(session.role)){
removePresence();
localStorage.removeItem(SESSION_KEY);
window.location.href="../auth/auth.html";
return false;
}

localStorage.setItem(SESSION_KEY,JSON.stringify(session));

if(auditSection){
auditSection.style.display=session.role==="owner"?"":"none";
}

if(clearAnalytics){
clearAnalytics.style.display=session.role==="owner"?"":"none";
}

return true;
}

function canAdmin(){
return session.role==="owner"||session.role==="admin";
}

function canModerate(){
return session.role==="owner"||session.role==="admin"||session.role==="moderator";
}

function isOwnerUser(user){
return Boolean(user&&(user.role==="owner"||user.email===OWNER_EMAIL));
}

function getArray(key){
try{
const data=JSON.parse(localStorage.getItem(key)||"[]");
return Array.isArray(data)?data:[];
}catch(error){
return[];
}
}

function saveArray(key,value){
localStorage.setItem(key,JSON.stringify(value));
}

function addAdminLog(action,data){
const logs=getArray(LOGS_KEY);

logs.push({
id:createId(),
action:action,
authorId:session.userId,
authorName:session.name||"Адміністрація",
authorEmail:session.email||"",
authorRole:session.role||"",
data:data||{},
createdAt:new Date().toISOString()
});

saveArray(LOGS_KEY,logs.slice(-500));
}

async function hashPassword(password){
if(!window.crypto||!crypto.subtle){
throw new Error("Web Crypto API недоступний.");
}

const buffer=new TextEncoder().encode(password);
const hash=await crypto.subtle.digest("SHA-256",buffer);

return Array.from(new Uint8Array(hash)).map(function(byte){
return byte.toString(16).padStart(2,"0");
}).join("");
}

function touchPresence(){
const now=Date.now();

const active=getArray(PRESENCE_KEY).filter(function(item){
return now-item.lastSeen<90000&&item.sessionId!==session.sessionId;
});

active.push({
sessionId:session.sessionId,
userId:session.userId,
lastSeen:now
});

saveArray(PRESENCE_KEY,active);
}

function cleanupPresence(){
const now=Date.now();

saveArray(
PRESENCE_KEY,
getArray(PRESENCE_KEY).filter(function(item){
return now-item.lastSeen<90000;
})
);
}

function removePresence(){
saveArray(
PRESENCE_KEY,
getArray(PRESENCE_KEY).filter(function(item){
return item.sessionId!==session.sessionId;
})
);
}

function isOnline(userId){
const now=Date.now();

return getArray(PRESENCE_KEY).some(function(item){
return item.userId===userId&&now-item.lastSeen<90000;
});
}

function escapeHtml(value){
return String(value??"").replace(/[&<>"']/g,function(char){
return{
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#039;"
}[char];
});
}

function formatDate(value){
const date=new Date(value);

if(Number.isNaN(date.getTime())){
return"";
}

return date.toLocaleString("uk-UA");
}

/* АНАЛІТИКА */

function getAnalytics(){
try{
const data=JSON.parse(localStorage.getItem(ANALYTICS_KEY)||"null");

if(!data||typeof data!=="object"){
return{
visits:[],
events:[],
sessions:[]
};
}

return{
visits:Array.isArray(data.visits)?data.visits:[],
events:Array.isArray(data.events)?data.events:[],
sessions:Array.isArray(data.sessions)?data.sessions:[]
};
}catch(error){
return{
visits:[],
events:[],
sessions:[]
};
}
}

function renderAnalytics(){
const analytics=getAnalytics();
const visits=analytics.visits;
const events=analytics.events;
const sessions=analytics.sessions;

if(analyticsVisits)analyticsVisits.textContent=visits.length;
if(analyticsEvents)analyticsEvents.textContent=events.length;
if(analyticsSessions)analyticsSessions.textContent=sessions.length;

const lastVisit=visits.length?visits[visits.length-1]:null;

if(analyticsLastVisit){
analyticsLastVisit.textContent=lastVisit?formatDate(lastVisit.createdAt):"—";
}

if(analyticsVisitsList){
analyticsVisitsList.innerHTML="";

const latestVisits=visits.slice().reverse().slice(0,20);

if(!latestVisits.length){
analyticsVisitsList.innerHTML='<div class="empty">Відвідувань ще немає.</div>';
}else{
latestVisits.forEach(function(item){
const element=document.createElement("div");
element.className="analytics-item";

element.innerHTML=
'<div>'+
'<strong>'+escapeHtml(item.page||"Головна сторінка")+'</strong>'+
'<small>'+escapeHtml(item.referrer||"Прямий перехід")+'</small>'+
'</div>'+
'<span>'+escapeHtml(formatDate(item.createdAt))+'</span>';

analyticsVisitsList.appendChild(element);
});
}
}

if(analyticsActionsList){
analyticsActionsList.innerHTML="";

const counts={};

events.forEach(function(item){
const action=item.action||"unknown";
counts[action]=(counts[action]||0)+1;
});

const sorted=Object.keys(counts).sort(function(a,b){
return counts[b]-counts[a];
}).slice(0,20);

if(!sorted.length){
analyticsActionsList.innerHTML='<div class="empty">Дій ще немає.</div>';
}else{
sorted.forEach(function(action){
const element=document.createElement("div");
element.className="analytics-item";

element.innerHTML=
'<div>'+
'<strong>'+escapeHtml(getAnalyticsActionName(action))+'</strong>'+
'<small>'+escapeHtml(action)+'</small>'+
'</div>'+
'<span>'+escapeHtml(counts[action])+'</span>';

analyticsActionsList.appendChild(element);
});
}
}
}

function getAnalyticsActionName(action){
const names={
page_view:"Перегляд сторінки",
nav_main:"Головна",
nav_services:"Послуги",
nav_history:"Історія",
nav_projects:"Проєкти",
nav_support:"Підтримка",
nav_team:"Команда",
nav_contact:"Контакт",
logo_click:"Логотип",
hero_projects:"Проєкти з головної",
hero_contact:"Контакт з головної",
phone_click:"Натиснуто телефон",
phone_copy:"Скопійовано телефон",
email_click:"Натиснуто email",
email_copy:"Скопійовано email",
auth_open:"Вхід / Реєстрація",
contact_submit:"Надсилання повідомлення",
gallery_interior:"Галерея — інтер’єр",
gallery_tiles:"Галерея — облицювання",
gallery_wood:"Галерея — столярство",
gallery_electric:"Галерея — мережі",
gallery_brukiwka:"Галерея — брукування",
gallery_paint:"Галерея — оздоблення",
gallery_close:"Закриття галереї",
gallery_previous:"Попереднє фото",
gallery_next:"Наступне фото",
service_spaklowka:"Послуга — шпаклювання",
service_interior:"Послуга — інтер’єр",
service_electric:"Послуга — електрика",
service_tiles:"Послуга — плитка",
service_brukiwka:"Послуга — бруківка",
services_previous:"Попередні послуги",
services_next:"Наступні послуги",
service_contact:"Контакт із послуги",
service_zoom_in:"Збільшення послуги",
service_zoom_out:"Зменшення масштабу",
service_zoom_reset:"Скидання масштабу",
footer_auth:"Вхід / Реєстрація у футері",
footer_cabinet:"Особистий кабінет",
footer_admin:"Панель управління",
footer_privacy:"Політика конфіденційності",
footer_instagram:"Instagram",
footer_telegram:"Telegram",
footer_facebook:"Facebook",
location_click:"Локація",
team_whatsapp_2:"WhatsApp власника",
team_telegram_2:"Telegram власника",
team_facebook_2:"Facebook власника",
team_instagram_2:"Instagram власника",
team_github_2:"GitHub власника",
team_whatsapp_3:"WhatsApp виконавця",
team_telegram_3:"Telegram виконавця",
team_instagram_3:"Instagram виконавця"
};

return names[action]||action;
}

function render(){
const users=getArray(USERS_KEY);
const messages=getArray(MESSAGES_KEY);

users.forEach(function(item){
normalizeUser(item);
});

const onlineUsers=users.filter(function(user){
return isOnline(user.id);
}).length;

if(usersCount)usersCount.textContent=users.length;
if(onlineCount)onlineCount.textContent=onlineUsers;
if(messagesCount)messagesCount.textContent=messages.length;
if(newCount)newCount.textContent=messages.filter(function(item){
return item.status==="new";
}).length;

renderAnalytics();
renderMessages(messages);
renderUsers(users);

if(session.role==="owner"){
renderAuditLog();
}
}

function renderMessages(messages){
if(!messagesElement)return;

messagesElement.innerHTML="";

if(!messages.length){
messagesElement.innerHTML='<div class="empty">Повідомлень поки немає.</div>';
return;
}

messages.slice().reverse().forEach(function(item){
const element=document.createElement("article");
element.className="message";

const replies=Array.isArray(item.replies)?item.replies:[];
let repliesHtml="";

replies.forEach(function(reply){
repliesHtml+='<div class="reply">'+
escapeHtml(reply.message)+
'<small>'+
escapeHtml(reply.authorName||"Адміністрація")+
" · "+
escapeHtml(formatDate(reply.createdAt))+
"</small></div>";
});

element.innerHTML=
'<div class="message-head">'+
'<div>'+
'<div class="message-name">'+escapeHtml(item.name)+'</div>'+
'<div class="message-email">'+escapeHtml(item.email)+'</div>'+
'</div>'+
'<div class="message-date">'+escapeHtml(formatDate(item.createdAt))+'</div>'+
'</div>'+
'<div class="message-text">'+escapeHtml(item.message)+'</div>'+
'<span class="message-status">'+escapeHtml(item.status||"new")+'</span>'+
'<div class="reply-box">'+
repliesHtml+
'<form class="reply-form" data-message-id="'+escapeHtml(item.id)+'">'+
'<textarea maxlength="3000" placeholder="Відповідь користувачу" required></textarea>'+
'<button type="submit">Відповісти</button>'+
'</form>'+
'</div>';

messagesElement.appendChild(element);
});

messagesElement.querySelectorAll(".reply-form").forEach(function(form){
form.addEventListener("submit",function(event){
event.preventDefault();

if(!canModerate())return;

const messageId=form.dataset.messageId;
const textarea=form.querySelector("textarea");
const text=textarea.value.trim();

if(text.length<1)return;

const all=getArray(MESSAGES_KEY);

const index=all.findIndex(function(item){
return item.id===messageId;
});

if(index<0)return;

if(!Array.isArray(all[index].replies)){
all[index].replies=[];
}

all[index].replies.push({
id:createId(),
message:text,
authorId:session.userId,
authorName:session.name||"Адміністрація",
createdAt:new Date().toISOString()
});

all[index].status="answered";

saveArray(MESSAGES_KEY,all);

addAdminLog("reply",{
messageId:messageId,
userId:all[index].userId||"",
email:all[index].email||""
});

textarea.value="";
render();
});
});
}

function renderUsers(users){
if(!usersElement)return;

usersElement.innerHTML="";

if(!users.length){
usersElement.innerHTML='<div class="empty">Користувачів поки немає.</div>';
return;
}

const sortedUsers=users.slice().sort(function(a,b){
return Number(isOnline(b.id))-Number(isOnline(a.id));
});

sortedUsers.forEach(function(item){
normalizeUser(item);

const online=isOnline(item.id);
const isExpanded=expandedUserId===item.id;
const element=document.createElement("article");

element.className="user"+(isExpanded?" expanded":"");
element.dataset.userId=item.id;

const avatarHtml=item.avatar?
'<img src="'+escapeHtml(item.avatar)+'" alt="Аватар">':
'<div class="user-avatar-placeholder">👤</div>';

const socials=[];

Object.keys(item.socials).forEach(function(key){
if(item.socials[key]){
socials.push(
'<a href="'+escapeHtml(item.socials[key])+'" target="_blank" rel="noopener noreferrer">'+escapeHtml(getSocialName(key))+'</a>'
);
}
});

const canModerateUser=canModerate();
const canAdminUser=canAdmin();
const isSelf=item.id===session.userId;
const isOwnerAccount=isOwnerUser(item);

let controlsHtml="";

if(canModerateUser){
controlsHtml=
'<div class="user-controls">'+
'<div>'+
'<button type="button" class="user-rating-btn" data-user-id="'+escapeHtml(item.id)+'">'+
(item.ratingGivenBy.includes(session.userId)?"Бали вже надано":"Дати +1 бал")+
'</button>';

if(!isOwnerAccount){
controlsHtml+=
'<button type="button" class="user-mute-btn" data-user-id="'+escapeHtml(item.id)+'">'+
(item.muted?"Зняти mute":"Mute")+
'</button>';
}

if(canAdminUser&&!isSelf&&!isOwnerAccount){
controlsHtml+=
'<button type="button" class="user-block-btn" data-user-id="'+escapeHtml(item.id)+'">'+
(item.blocked?"Розблокувати":"Заблокувати")+
'</button>';
}

if(session.role==="owner"&&!isSelf&&!isOwnerAccount){
controlsHtml+=
'<button type="button" class="user-delete-btn" data-user-id="'+escapeHtml(item.id)+'">Видалити акаунт</button>';
}

controlsHtml+='</div>';

if(canAdminUser&&!isOwnerAccount){
controlsHtml+=
'<div>'+
'<input class="user-edit-name" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.name)+'" placeholder="Ім’я">'+
'<input class="user-edit-email" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.email)+'" placeholder="Email">'+
'<input class="user-edit-phone" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.phone)+'" placeholder="Телефон">'+
'<input class="user-edit-company" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.company)+'" placeholder="Фірма / організація">'+
'<input class="user-edit-address" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.address)+'" placeholder="Адреса">'+
'<textarea class="user-edit-bio" data-user-id="'+escapeHtml(item.id)+'" maxlength="1000" placeholder="Про себе">'+escapeHtml(item.bio)+'</textarea>'+
'<input class="user-edit-avatar" data-user-id="'+escapeHtml(item.id)+'" type="file" accept="image/*">'+
'<input class="user-edit-instagram" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.instagram)+'" placeholder="Instagram">'+
'<input class="user-edit-facebook" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.facebook)+'" placeholder="Facebook">'+
'<input class="user-edit-telegram" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.telegram)+'" placeholder="Telegram">'+
'<input class="user-edit-tiktok" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.tiktok)+'" placeholder="TikTok">'+
'<input class="user-edit-linkedin" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.linkedin)+'" placeholder="LinkedIn">'+
'<input class="user-edit-twitter" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.twitter)+'" placeholder="X / Twitter">'+
'<input class="user-edit-website" data-user-id="'+escapeHtml(item.id)+'" value="'+escapeHtml(item.socials.website)+'" placeholder="Власний сайт">'+
'<button type="button" class="user-save-btn" data-user-id="'+escapeHtml(item.id)+'">Зберегти профіль</button>'+
'</div>';
}

controlsHtml+='</div>';
}

element.innerHTML=
'<div class="user-summary">'+
'<div class="user-head">'+
'<div class="user-main">'+
avatarHtml+
'<div class="user-main-info">'+
'<div class="user-name">'+escapeHtml(item.name)+'</div>'+
'<div class="user-email">'+escapeHtml(item.email)+'</div>'+
'</div>'+
'</div>'+
'<div class="user-meta">'+
'<div class="user-role">'+escapeHtml(getRoleName(item.role))+'</div>'+
'<div class="'+(online?"user-online":"user-offline")+'">'+
(online?"Онлайн":"Офлайн")+
'</div>'+
'</div>'+
'<button type="button" class="user-toggle" data-user-id="'+escapeHtml(item.id)+'">'+
(isExpanded?"Закрити":"Деталі")+
'</button>'+
'</div>'+
'</div>'+
'<div class="user-details">'+
'<div class="user-profile-info">'+
'<div><strong>Телефон:</strong> '+escapeHtml(item.phone||"Не вказано")+'</div>'+
'<div><strong>Адреса:</strong> '+escapeHtml(item.address||"Не вказано")+'</div>'+
'<div><strong>Фірма / організація:</strong> '+escapeHtml(item.company||"Не вказано")+'</div>'+
'<div><strong>Про себе:</strong> '+escapeHtml(item.bio||"Не вказано")+'</div>'+
'<div><strong>Бали:</strong> '+escapeHtml(item.ratingPoints)+'</div>'+
'<div><strong>Статус:</strong> '+escapeHtml(item.blocked?"Заблокований":item.muted?"Mute":"Активний")+'</div>'+
'<div><strong>Дата реєстрації:</strong> '+escapeHtml(formatDate(item.createdAt))+'</div>'+
(socials.length?'<div><strong>Соцмережі:</strong> '+socials.join(" · ")+'</div>':"")+
'</div>'+
controlsHtml+
'</div>';

usersElement.appendChild(element);
});

bindUserControls();
}

function bindUserControls(){
usersElement.querySelectorAll(".user-toggle").forEach(function(button){
button.addEventListener("click",function(){
const userId=button.dataset.userId;

if(expandedUserId===userId){
expandedUserId=null;
}else{
expandedUserId=userId;
}

usersElement.querySelectorAll(".user").forEach(function(user){
const isActive=user.dataset.userId===expandedUserId;
user.classList.toggle("expanded",isActive);

const toggle=user.querySelector(".user-toggle");

if(toggle){
toggle.textContent=isActive?"Закрити":"Деталі";
}
});
});
});

usersElement.querySelectorAll(".user-rating-btn").forEach(function(button){
button.addEventListener("click",function(){
const userId=button.dataset.userId;
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===userId;});

if(index<0)return;

normalizeUser(users[index]);

if(users[index].ratingGivenBy.includes(session.userId)){
button.textContent="Бали вже надано";
return;
}

users[index].ratingPoints+=1;
users[index].ratingGivenBy.push(session.userId);

saveArray(USERS_KEY,users);

addAdminLog("rating",{
userId:users[index].id,
email:users[index].email,
points:1
});

expandedUserId=userId;
render();
});
});

usersElement.querySelectorAll(".user-mute-btn").forEach(function(button){
button.addEventListener("click",function(){
const userId=button.dataset.userId;
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===userId;});

if(index<0)return;

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
if(status)status.textContent="Акаунт власника не можна перевести в mute.";
return;
}

if(users[index].role==="admin"&&session.role==="moderator"){
if(status)status.textContent="Модератор не може змінювати статус адміністратора.";
return;
}

const oldMuted=users[index].muted;

users[index].muted=!users[index].muted;

saveArray(USERS_KEY,users);

addAdminLog("mute_change",{
userId:users[index].id,
email:users[index].email,
oldMuted:oldMuted,
newMuted:users[index].muted
});

expandedUserId=userId;
render();
});
});

usersElement.querySelectorAll(".user-block-btn").forEach(function(button){
button.addEventListener("click",function(){
if(!canAdmin())return;

const userId=button.dataset.userId;
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===userId;});

if(index<0)return;

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
if(status)status.textContent="Акаунт власника не можна заблокувати.";
return;
}

if(users[index].email===ADMIN_EMAIL||users[index].email===MODERATOR_EMAIL){
if(status)status.textContent="Системний акаунт не можна заблокувати.";
return;
}

const oldBlocked=users[index].blocked;

users[index].blocked=!users[index].blocked;

saveArray(USERS_KEY,users);

addAdminLog("block_change",{
userId:users[index].id,
email:users[index].email,
oldBlocked:oldBlocked,
newBlocked:users[index].blocked
});

expandedUserId=userId;
render();
});
});

usersElement.querySelectorAll(".user-delete-btn").forEach(function(button){
button.addEventListener("click",function(){
if(session.role!=="owner")return;

const userId=button.dataset.userId;
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===userId;});

if(index<0)return;

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
if(status)status.textContent="Акаунт власника системи не можна видалити.";
return;
}

if(users[index].id===session.userId){
if(status)status.textContent="Власник не може видалити власний акаунт через цю панель.";
return;
}

const userEmail=users[index].email;
const userName=users[index].name;

const confirmation=prompt("Для видалення акаунта введіть DELETE");

if(confirmation!=="DELETE"){
if(status)status.textContent="Видалення скасовано.";
return;
}

if(!confirm("Ви дійсно хочете назавжди видалити акаунт "+userName+" ("+userEmail+")?"))return;

users.splice(index,1);
saveArray(USERS_KEY,users);

saveArray(
PRESENCE_KEY,
getArray(PRESENCE_KEY).filter(function(item){
return item.userId!==userId;
})
);

addAdminLog("user_delete",{
userId:userId,
email:userEmail,
name:userName
});

expandedUserId=null;

if(status)status.textContent="Акаунт користувача видалено.";

render();
});
});

usersElement.querySelectorAll(".user-save-btn").forEach(function(button){
button.addEventListener("click",async function(){
if(!canAdmin())return;

const userId=button.dataset.userId;
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===userId;});

if(index<0)return;

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
if(status)status.textContent="Профіль власника не можна редагувати з цього списку.";
return;
}

const selectorId=window.CSS&&CSS.escape?CSS.escape(userId):userId;

const nameInput=usersElement.querySelector(".user-edit-name[data-user-id='"+selectorId+"']");
const emailInput=usersElement.querySelector(".user-edit-email[data-user-id='"+selectorId+"']");
const phoneInput=usersElement.querySelector(".user-edit-phone[data-user-id='"+selectorId+"']");
const companyInput=usersElement.querySelector(".user-edit-company[data-user-id='"+selectorId+"']");
const addressInput=usersElement.querySelector(".user-edit-address[data-user-id='"+selectorId+"']");
const bioInput=usersElement.querySelector(".user-edit-bio[data-user-id='"+selectorId+"']");

if(!nameInput||!emailInput)return;

const name=nameInput.value.trim();
const email=emailInput.value.trim().toLowerCase();

if(name.length<2){
if(status)status.textContent="Ім’я має містити щонайменше 2 символи.";
return;
}

if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
if(status)status.textContent="Введіть коректний email.";
return;
}

const duplicate=users.some(function(item){
return item.id!==userId&&item.email===email;
});

if(duplicate){
if(status)status.textContent="Користувач з таким email уже існує.";
return;
}

const fileInput=usersElement.querySelector(".user-edit-avatar[data-user-id='"+selectorId+"']");
const file=fileInput&&fileInput.files?fileInput.files[0]:null;

const oldProfile={
name:users[index].name,
email:users[index].email,
phone:users[index].phone,
company:users[index].company,
address:users[index].address,
bio:users[index].bio
};

users[index].name=name;
users[index].email=email;
users[index].phone=phoneInput?phoneInput.value.trim():"";
users[index].company=companyInput?companyInput.value.trim():"";
users[index].address=addressInput?addressInput.value.trim():"";
users[index].bio=bioInput?bioInput.value.trim():"";

const socialFields=[
["instagram",".user-edit-instagram"],
["facebook",".user-edit-facebook"],
["telegram",".user-edit-telegram"],
["tiktok",".user-edit-tiktok"],
["linkedin",".user-edit-linkedin"],
["twitter",".user-edit-twitter"],
["website",".user-edit-website"]
];

socialFields.forEach(function(field){
const input=usersElement.querySelector(field[1]+"[data-user-id='"+selectorId+"']");
users[index].socials[field[0]]=input?input.value.trim():"";
});

if(file){
if(!file.type.startsWith("image/")){
if(status)status.textContent="Аватарка повинна бути зображенням.";
return;
}

if(file.size>5*1024*1024){
if(status)status.textContent="Аватарка не повинна перевищувати 5 МБ.";
return;
}

try{
users[index].avatar=await resizeImage(file);
}catch(error){
if(status)status.textContent="Не вдалося обробити аватарку.";
return;
}
}

saveArray(USERS_KEY,users);

addAdminLog("profile_change",{
userId:users[index].id,
email:users[index].email,
oldProfile:oldProfile,
newProfile:{
name:users[index].name,
email:users[index].email,
phone:users[index].phone,
company:users[index].company,
address:users[index].address,
bio:users[index].bio
},
avatarChanged:Boolean(file)
});

if(users[index].id===session.userId){
session.name=users[index].name;
session.email=users[index].email;
localStorage.setItem(SESSION_KEY,JSON.stringify(session));
}

expandedUserId=userId;

if(status)status.textContent="Профіль користувача успішно збережено.";

render();
});
});
}

function resizeImage(file){
return new Promise(function(resolve,reject){
const reader=new FileReader();

reader.onload=function(event){
const image=new Image();

image.onload=function(){
const maxSize=512;
let width=image.width;
let height=image.height;

if(width>maxSize||height>maxSize){
if(width>height){
height=Math.round(height*maxSize/width);
width=maxSize;
}else{
width=Math.round(width*maxSize/height);
height=maxSize;
}
}

const canvas=document.createElement("canvas");
canvas.width=width;
canvas.height=height;

const context=canvas.getContext("2d");
context.drawImage(image,0,0,width,height);

resolve(canvas.toDataURL("image/jpeg",0.82));
};

image.onerror=reject;
image.src=event.target.result;
};

reader.onerror=reject;
reader.readAsDataURL(file);
});
}

function renderAuditLog(){
if(!auditSection||!auditLog)return;

if(session.role!=="owner"){
auditSection.style.display="none";
return;
}

auditSection.style.display="";

const logs=getArray(LOGS_KEY).slice().reverse();

if(!logs.length){
auditLog.innerHTML='<div class="empty">Дій адміністрації ще не зафіксовано.</div>';
return;
}

auditLog.innerHTML="";

logs.forEach(function(item){
const element=document.createElement("article");
element.className="audit-item";

let action="Невідома дія";

if(item.action==="reply")action="Відповідь користувачу";
if(item.action==="role_change")action="Зміна ролі";
if(item.action==="rating")action="Надано бал";
if(item.action==="mute_change")action="Зміна mute";
if(item.action==="block_change")action="Зміна блокування";
if(item.action==="profile_change")action="Редагування профілю";
if(item.action==="password_change")action="Зміна пароля";
if(item.action==="clear_messages")action="Очищення повідомлень";
if(item.action==="user_delete")action="Видалення акаунта";
if(item.action==="clear_analytics")action="Очищення аналітики";

element.innerHTML=
'<div class="audit-head">'+
'<strong>'+escapeHtml(action)+'</strong>'+
'<span>'+escapeHtml(formatDate(item.createdAt))+'</span>'+
'</div>'+
'<div class="audit-author">'+
escapeHtml(item.authorName||"Адміністрація")+
" · "+
escapeHtml(getRoleName(item.authorRole))+
(item.authorEmail?" · "+escapeHtml(item.authorEmail):"")+
'</div>'+
'<div class="audit-data">'+
escapeHtml(formatAuditData(item))+
'</div>';

auditLog.appendChild(element);
});
}

function formatAuditData(item){
const data=item.data||{};

if(item.action==="reply"){
return"Користувач: "+(data.email||"—")+" · Повідомлення ID: "+(data.messageId||"—");
}

if(item.action==="role_change"){
return"Користувач: "+(data.email||"—")+" · "+getRoleName(data.oldRole)+" → "+getRoleName(data.newRole);
}

if(item.action==="rating"){
return"Користувач: "+(data.email||"—")+" · +"+(data.points||1)+" бал";
}

if(item.action==="mute_change"){
return"Користувач: "+(data.email||"—")+" · "+(data.oldMuted?"Mute":"Без mute")+" → "+(data.newMuted?"Mute":"Без mute");
}

if(item.action==="block_change"){
return"Користувач: "+(data.email||"—")+" · "+(data.oldBlocked?"Заблокований":"Активний")+" → "+(data.newBlocked?"Заблокований":"Заблокований");
}

if(item.action==="profile_change"){
return"Профіль користувача: "+(data.email||"—")+" · Аватар: "+(data.avatarChanged?"змінено":"без змін");
}

if(item.action==="password_change"){
return"Для користувача: "+(data.email||"—");
}

if(item.action==="clear_messages"){
return"Очищено повідомлень: "+(data.count??"—");
}

if(item.action==="user_delete"){
return"Видалено користувача: "+(data.name||"—")+" · "+(data.email||"—");
}

if(item.action==="clear_analytics"){
return"Локальну аналітику сайту очищено.";
}

return JSON.stringify(data);
}

function getRoleName(role){
if(role==="owner")return"Власник";
if(role==="admin")return"Адміністратор";
if(role==="moderator")return"Модератор";
return"Користувач";
}

function getSocialName(key){
const names={
instagram:"Instagram",
facebook:"Facebook",
telegram:"Telegram",
tiktok:"TikTok",
linkedin:"LinkedIn",
twitter:"X / Twitter",
website:"Сайт"
};

return names[key]||key;
}

});