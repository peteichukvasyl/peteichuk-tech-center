document.addEventListener("DOMContentLoaded",function(){
const SESSION_KEY="peteichuk_session";
const USERS_KEY="peteichuk_users";
const MESSAGES_KEY="peteichuk_messages";
const PRESENCE_KEY="peteichuk_presence";
const OWNER_EMAIL="owner@site-owner.com";

let session=getSession();

if(!session){
sessionStorage.setItem("peteichuk_auth_return","cabinet.html");
window.location.href="auth.html";
return;
}

const userName=document.getElementById("userName");
const userEmail=document.getElementById("userEmail");
const messageCount=document.getElementById("messageCount");
const logoutBtn=document.getElementById("logoutBtn");
const deleteAccountBtn=document.getElementById("deleteAccountBtn");
const roleStatus=document.getElementById("roleStatus");
const adminLink=document.getElementById("adminLink");
const userMessages=document.getElementById("userMessages");
const notice=document.getElementById("cabinetNotice");
const onlineStatus=document.getElementById("onlineStatus");
const profileAvatar=document.getElementById("profileAvatar");
const avatarPlaceholder=document.getElementById("avatarPlaceholder");
const profileAvatarPreview=document.getElementById("profileAvatarPreview");
const avatarPreviewPlaceholder=document.getElementById("avatarPreviewPlaceholder");
const profileAvatarInput=document.getElementById("profileAvatarInput");
const profileForm=document.getElementById("profileForm");
const profileStatus=document.getElementById("profileStatus");
const passwordForm=document.getElementById("passwordForm");
const passwordStatus=document.getElementById("passwordStatus");
const ratingPoints=document.getElementById("ratingPoints");
const accountRating=document.getElementById("accountRating");
const accountStatus=document.getElementById("accountStatus");

let currentAvatar="";
let user=getCurrentUser();

if(!user){
localStorage.removeItem(SESSION_KEY);
sessionStorage.setItem("peteichuk_auth_return","cabinet.html");
window.location.href="auth.html";
return;
}

normalizeUser(user);

if(isOwnerUser(user)){
user.role="owner";
user.email=OWNER_EMAIL;
user.blocked=false;
user.muted=false;
}

syncSession();
renderProfile();
renderMessages();
touchPresence();

const heartbeat=setInterval(function(){
if(checkAccount())touchPresence();
},20000);

window.addEventListener("storage",function(event){
if([MESSAGES_KEY,USERS_KEY,PRESENCE_KEY].includes(event.key)){
if(checkAccount()){
user=getCurrentUser();
if(user){
normalizeUser(user);
syncSession();
renderProfile();
renderMessages();
}
}
}
});

if(logoutBtn)logoutBtn.addEventListener("click",function(){
clearInterval(heartbeat);
localStorage.removeItem(SESSION_KEY);
try{
removePresence();
}catch(error){}
window.location.href="index.html";
});

if(deleteAccountBtn)deleteAccountBtn.addEventListener("click",function(){
if(!checkAccount())return;

if(isOwnerUser(user)){
if(notice)notice.textContent="Акаунт власника системи не можна видалити.";
return;
}

const confirmation=prompt("Для видалення акаунта введіть DELETE");

if(confirmation!=="DELETE"){
if(notice)notice.textContent="Видалення скасовано.";
return;
}

const secondConfirmation=confirm("Ви дійсно хочете назавжди видалити свій акаунт? Цю дію не можна скасувати.");

if(!secondConfirmation)return;

const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){
return item.id===user.id;
});

if(index<0){
localStorage.removeItem(SESSION_KEY);
window.location.href="index.html";
return;
}

if(isOwnerUser(users[index])){
if(notice)notice.textContent="Акаунт власника системи не можна видалити.";
return;
}

users.splice(index,1);
saveArray(USERS_KEY,users);

removePresence();
localStorage.removeItem(SESSION_KEY);

window.location.href="index.html";
});

if(profileAvatarInput)profileAvatarInput.addEventListener("change",async function(){
const file=profileAvatarInput.files&&profileAvatarInput.files[0];

if(!file)return;

if(!file.type.startsWith("image/")){
profileStatus.textContent="Оберіть файл зображення.";
profileAvatarInput.value="";
return;
}

if(file.size>5*1024*1024){
profileStatus.textContent="Аватарка не повинна перевищувати 5 МБ.";
profileAvatarInput.value="";
return;
}

try{
profileStatus.textContent="Обробка аватарки...";
currentAvatar=await resizeImage(file);
showAvatar(currentAvatar);
profileStatus.textContent="Аватарка готова до збереження.";
}catch(error){
profileStatus.textContent="Не вдалося обробити аватарку.";
profileAvatarInput.value="";
}
});

if(profileForm)profileForm.addEventListener("submit",async function(event){
event.preventDefault();

if(!checkAccount())return;

if(profileStatus)profileStatus.textContent="Збереження...";

const name=document.getElementById("profileName").value.trim();
const email=document.getElementById("profileEmail").value.trim().toLowerCase();
const phone=document.getElementById("profilePhone").value.trim();
const address=document.getElementById("profileAddress").value.trim();
const company=document.getElementById("profileCompany").value.trim();
const bio=document.getElementById("profileBio").value.trim();

if(name.length<2){
profileStatus.textContent="Ім’я має містити щонайменше 2 символи.";
return;
}

if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
profileStatus.textContent="Введіть коректний email.";
return;
}

if(isOwnerUser(user)&&email!==OWNER_EMAIL){
profileStatus.textContent="Email власника системи не можна змінити.";
return;
}

const users=getArray(USERS_KEY);

const duplicate=users.some(function(item){
return item.id!==user.id&&item.email===email;
});

if(duplicate){
profileStatus.textContent="Користувач з таким email уже зареєстрований.";
return;
}

const index=users.findIndex(function(item){
return item.id===user.id;
});

if(index<0){
profileStatus.textContent="Користувача не знайдено.";
return;
}

normalizeUser(users[index]);

if(isOwnerUser(users[index])){
users[index].role="owner";
users[index].email=OWNER_EMAIL;
users[index].blocked=false;
users[index].muted=false;
}

users[index].name=name;
users[index].email=email;
users[index].phone=phone;
users[index].address=address;
users[index].company=company;
users[index].bio=bio;
users[index].avatar=currentAvatar||users[index].avatar||"";

users[index].socials={
instagram:document.getElementById("socialInstagram").value.trim(),
facebook:document.getElementById("socialFacebook").value.trim(),
telegram:document.getElementById("socialTelegram").value.trim(),
tiktok:document.getElementById("socialTiktok").value.trim(),
linkedin:document.getElementById("socialLinkedin").value.trim(),
twitter:document.getElementById("socialTwitter").value.trim(),
website:document.getElementById("socialWebsite").value.trim()
};

saveArray(USERS_KEY,users);

user=users[index];

syncSession();
renderProfile();

if(profileStatus)profileStatus.textContent="Профіль успішно збережено.";
});

if(passwordForm)passwordForm.addEventListener("submit",async function(event){
event.preventDefault();

if(!checkAccount())return;

if(passwordStatus)passwordStatus.textContent="Перевірка...";

const currentPassword=document.getElementById("currentPassword").value;
const newPassword=document.getElementById("newPassword").value;
const confirmPassword=document.getElementById("confirmNewPassword").value;

if(!currentPassword){
passwordStatus.textContent="Введіть поточний пароль.";
return;
}

if(newPassword.length<8){
passwordStatus.textContent="Новий пароль має містити щонайменше 8 символів.";
return;
}

if(newPassword!==confirmPassword){
passwordStatus.textContent="Нові паролі не збігаються.";
return;
}

try{
const currentHash=await hashPassword(currentPassword);

if(currentHash!==user.passwordHash){
passwordStatus.textContent="Поточний пароль введено неправильно.";
return;
}

const newHash=await hashPassword(newPassword);
const users=getArray(USERS_KEY);
const index=users.findIndex(function(item){return item.id===user.id;});

if(index<0){
passwordStatus.textContent="Користувача не знайдено.";
return;
}

users[index].passwordHash=newHash;

saveArray(USERS_KEY,users);

user=users[index];

passwordForm.reset();
passwordStatus.textContent="Пароль успішно змінено.";
}catch(error){
passwordStatus.textContent="Не вдалося змінити пароль.";
}
});

function getSession(){
try{
const value=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");

if(!value||!value.userId)return null;

if(!value.sessionId)value.sessionId=createId();
if(!value.name)value.name="";
if(!value.email)value.email="";
if(!value.role)value.role="user";

localStorage.setItem(SESSION_KEY,JSON.stringify(value));

return value;
}catch(error){
return null;
}
}

function getArray(key){
try{
const value=JSON.parse(localStorage.getItem(key)||"[]");
return Array.isArray(value)?value:[];
}catch(error){
return[];
}
}

function saveArray(key,value){
localStorage.setItem(key,JSON.stringify(value));
}

function getCurrentUser(){
const users=getArray(USERS_KEY);

return users.find(function(item){
return item.id===session.userId;
})||null;
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

function syncSession(){
if(!user)return;

if(isOwnerUser(user)){
user.role="owner";
user.email=OWNER_EMAIL;
user.blocked=false;
user.muted=false;
}

session.name=user.name||"";
session.email=user.email||"";
session.role=user.role||"user";

localStorage.setItem(SESSION_KEY,JSON.stringify(session));
}

function checkAccount(){
const latest=getCurrentUser();

if(!latest){
removePresence();
localStorage.removeItem(SESSION_KEY);
sessionStorage.setItem("peteichuk_auth_return","cabinet.html");
window.location.href="auth.html";
return false;
}

normalizeUser(latest);

if(isOwnerUser(latest)){
latest.role="owner";
latest.email=OWNER_EMAIL;
latest.blocked=false;
latest.muted=false;
}

if(latest.blocked===true){
removePresence();
localStorage.removeItem(SESSION_KEY);
alert("Ваш акаунт заблокований адміністрацією.");
window.location.href="auth.html";
return false;
}

user=latest;
syncSession();

return true;
}

function isOwnerUser(item){
return Boolean(item&&(item.role==="owner"||item.email===OWNER_EMAIL));
}

function renderProfile(){
normalizeUser(user);

if(userName)userName.textContent=user.name||"Користувач";
if(userEmail)userEmail.textContent=user.email||"";

if(roleStatus){
if(user.role==="owner"){
roleStatus.textContent="Власник";
}else if(user.role==="admin"){
roleStatus.textContent="Адміністратор";
}else if(user.role==="moderator"){
roleStatus.textContent="Модератор";
}else{
roleStatus.textContent="Авторизований користувач";
}
}

if(adminLink){
adminLink.style.display=user.role==="owner"||user.role==="admin"||user.role==="moderator"?"":"none";
}

if(deleteAccountBtn){
deleteAccountBtn.style.display=isOwnerUser(user)?"none":"";
}

if(ratingPoints)ratingPoints.textContent=user.ratingPoints+" балів";
if(accountRating)accountRating.textContent=user.ratingPoints+" балів";

if(accountStatus){
accountStatus.textContent=user.blocked===true?"Заблокований":user.muted===true?"Mute":"Активний";
}

if(document.getElementById("profileName"))document.getElementById("profileName").value=user.name||"";

if(document.getElementById("profileEmail")){
document.getElementById("profileEmail").value=user.email||"";
document.getElementById("profileEmail").readOnly=isOwnerUser(user);
}

if(document.getElementById("profilePhone"))document.getElementById("profilePhone").value=user.phone||"";
if(document.getElementById("profileAddress"))document.getElementById("profileAddress").value=user.address||"";
if(document.getElementById("profileCompany"))document.getElementById("profileCompany").value=user.company||"";
if(document.getElementById("profileBio"))document.getElementById("profileBio").value=user.bio||"";
if(document.getElementById("socialInstagram"))document.getElementById("socialInstagram").value=user.socials.instagram||"";
if(document.getElementById("socialFacebook"))document.getElementById("socialFacebook").value=user.socials.facebook||"";
if(document.getElementById("socialTelegram"))document.getElementById("socialTelegram").value=user.socials.telegram||"";
if(document.getElementById("socialTiktok"))document.getElementById("socialTiktok").value=user.socials.tiktok||"";
if(document.getElementById("socialLinkedin"))document.getElementById("socialLinkedin").value=user.socials.linkedin||"";
if(document.getElementById("socialTwitter"))document.getElementById("socialTwitter").value=user.socials.twitter||"";
if(document.getElementById("socialWebsite"))document.getElementById("socialWebsite").value=user.socials.website||"";

currentAvatar=user.avatar||"";

showAvatar(currentAvatar);
}

function showAvatar(src){
if(profileAvatar){
profileAvatar.src=src||"";
profileAvatar.classList.toggle("active",Boolean(src));
}

if(avatarPlaceholder){
avatarPlaceholder.classList.toggle("hidden",Boolean(src));
}

if(profileAvatarPreview){
profileAvatarPreview.src=src||"";
profileAvatarPreview.classList.toggle("active",Boolean(src));
}

if(avatarPreviewPlaceholder){
avatarPreviewPlaceholder.classList.toggle("hidden",Boolean(src));
}
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

if(onlineStatus)onlineStatus.textContent="Онлайн";
}

function removePresence(){
const active=getArray(PRESENCE_KEY).filter(function(item){
return item.sessionId!==session.sessionId;
});

saveArray(PRESENCE_KEY,active);
}

function countMessages(){
return getArray(MESSAGES_KEY).filter(function(item){
return item.userId===session.userId;
}).length;
}

function escapeHtml(value){
return String(value??"").replace(/[&<>"']/g,function(char){
return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char];
});
}

function formatDate(value){
const date=new Date(value);

return Number.isNaN(date.getTime())?"":date.toLocaleString("uk-UA");
}

function renderMessages(){
const messages=getArray(MESSAGES_KEY).filter(function(item){
return item.userId===session.userId;
}).sort(function(a,b){
return new Date(b.createdAt)-new Date(a.createdAt);
});

if(messageCount)messageCount.textContent=messages.length+" повідомлень";

if(!userMessages)return;

if(!messages.length){
userMessages.innerHTML='<div class="user-message">У вас ще немає повідомлень.</div>';
return;
}

userMessages.innerHTML="";

messages.forEach(function(item){
const element=document.createElement("article");

element.className="user-message";

const replies=Array.isArray(item.replies)?item.replies:[];

element.innerHTML='<div class="user-message-head"><strong>Ваше звернення</strong><span class="user-message-date">'+escapeHtml(formatDate(item.createdAt))+'</span></div><div class="user-message-text">'+escapeHtml(item.message)+'</div><span class="user-message-status">'+escapeHtml(item.status==="answered"?"Є відповідь":item.status||"new")+'</span>';

replies.forEach(function(reply){
element.innerHTML+='<div class="user-reply">'+escapeHtml(reply.message)+'<small>'+escapeHtml(reply.authorName||"Адміністрація")+" · "+escapeHtml(formatDate(reply.createdAt))+"</small></div>";
});

userMessages.appendChild(element);
});
}

function createId(){
if(window.crypto&&typeof crypto.randomUUID==="function"){
return crypto.randomUUID();
}

return Date.now().toString(36)+Math.random().toString(36).slice(2);
}

async function hashPassword(password){
if(!window.crypto||!crypto.subtle)throw new Error("Web Crypto API недоступний.");

const buffer=new TextEncoder().encode(password);
const hash=await crypto.subtle.digest("SHA-256",buffer);

return Array.from(new Uint8Array(hash)).map(function(byte){
return byte.toString(16).padStart(2,"0");
}).join("");
}

window.addEventListener("beforeunload",removePresence);
});