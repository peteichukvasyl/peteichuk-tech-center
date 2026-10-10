//Це до авторизації

document.addEventListener("DOMContentLoaded",function(){
const USERS_KEY="peteichuk_users";
const SESSION_KEY="peteichuk_session";
const PRESENCE_KEY="peteichuk_presence";
const RETURN_KEY="peteichuk_auth_return";


const OWNER_EMAIL="owner@site-owner.com";
const OWNER_PASSWORD_HASH="6e68d75953670c5cdc47aa62383a7bd2b60f6a3fec207dc10e940cfbbe89988b";

const ADMIN_EMAIL="admin@site-admin.com";
const ADMIN_PASSWORD_HASH="804ed5222ff3fba95bc1f3e2c91e0551d3b5e5e6d1c5566edf68e5203d54196e";

const MODERATOR_EMAIL="moder@site-moder.com";
const MODERATOR_PASSWORD_HASH="e4bbaea57ffd867fb1f9d10057fe8619bfaa6f86576baadc40f24ecb0ea9984b";

const tabs=document.querySelectorAll(".auth-tab");
const loginForm=document.getElementById("loginForm");
const registerForm=document.getElementById("registerForm");
const status=document.getElementById("authPageStatus");

if(!tabs.length||!loginForm||!registerForm||!status)return;

setupSystemAccounts();

function normalizeEmail(value){return value.trim().toLowerCase();}

function getUsers(){
try{
const users=JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
return Array.isArray(users)?users:[];
}catch(error){return[];}
}

function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users));}

async function hashPassword(password){
if(!window.crypto||!crypto.subtle)throw new Error("Web Crypto API недоступний.");
const buffer=new TextEncoder().encode(password);
const hash=await crypto.subtle.digest("SHA-256",buffer);
return Array.from(new Uint8Array(hash)).map(function(byte){return byte.toString(16).padStart(2,"0");}).join("");
}

function createId(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);}

function setStatus(text,type){
status.textContent=text||"";
status.className="auth-status"+(type?" "+type:"");
}

function setError(id,text){
const element=document.getElementById(id);
if(element){
element.textContent=text||"";
element.classList.toggle("active",Boolean(text));
}
}

function clearErrors(form){
form.querySelectorAll(".auth-field-error").forEach(function(element){
element.textContent="";
element.classList.remove("active");
});
}

function showTab(name){
const isLogin=name==="login";
tabs.forEach(function(tab){tab.classList.toggle("active",tab.dataset.authTab===name);});
loginForm.classList.toggle("active",isLogin);
registerForm.classList.toggle("active",!isLogin);
setStatus("");
clearErrors(loginForm);
clearErrors(registerForm);
}

function getPresence(){
try{
const data=JSON.parse(localStorage.getItem(PRESENCE_KEY)||"[]");
return Array.isArray(data)?data:[];
}catch(error){return[];}
}

function createSession(user){
const session={
sessionId:createId(),
userId:user.id,
name:user.name,
email:user.email,
role:user.role||"user",
loginAt:Date.now()
};

localStorage.setItem(SESSION_KEY,JSON.stringify(session));

const presence=getPresence().filter(function(item){
return item.sessionId!==session.sessionId;
});

presence.push({
sessionId:session.sessionId,
userId:user.id,
lastSeen:Date.now()
});

localStorage.setItem(PRESENCE_KEY,JSON.stringify(presence));
}

function getReturnUrl(){
const value=sessionStorage.getItem(RETURN_KEY);
sessionStorage.removeItem(RETURN_KEY);

if(value&&value.startsWith(""))return value;

return "cabinet.html";
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

if(!item.socials||typeof item.socials!=="object"){
item.socials={};
}

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

function setupSystemAccounts(){
const users=getUsers();
let changed=false;

let ownerIndex=users.findIndex(function(item){
return item.email===OWNER_EMAIL||item.role==="owner";
});

if(ownerIndex<0){
users.push(createSystemUser(
"Власник",
OWNER_EMAIL,
OWNER_PASSWORD_HASH,
"owner"
));
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
users.push(createSystemUser(
"Адміністратор",
ADMIN_EMAIL,
ADMIN_PASSWORD_HASH,
"admin"
));
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
users.push(createSystemUser(
"Модератор",
MODERATOR_EMAIL,
MODERATOR_PASSWORD_HASH,
"moderator"
));
changed=true;
}else{
normalizeUser(users[moderatorIndex]);

if(!users[moderatorIndex].passwordHash){
users[moderatorIndex].passwordHash=MODERATOR_PASSWORD_HASH;
changed=true;
}
}

if(changed)saveUsers(users);
}

tabs.forEach(function(tab){
tab.addEventListener("click",function(){
showTab(tab.dataset.authTab);
});
});

loginForm.addEventListener("submit",async function(event){
event.preventDefault();

clearErrors(loginForm);
setStatus("Перевірка...","loading");

const email=normalizeEmail(document.getElementById("loginEmail").value);
const password=document.getElementById("loginPassword").value;
let valid=true;

if(!email){
setError("loginEmailError","Введіть email.");
valid=false;
}

if(!password){
setError("loginPasswordError","Введіть пароль.");
valid=false;
}

if(!valid){
setStatus("");
return;
}

try{
setupSystemAccounts();

const users=getUsers();

const user=users.find(function(item){
return item.email===email;
});

if(!user){
setStatus("Невірний email або пароль.","error");
return;
}

normalizeUser(user);

if(user.role==="owner"||user.email===OWNER_EMAIL){
user.role="owner";
user.email=OWNER_EMAIL;
user.blocked=false;
user.muted=false;
}

if(user.blocked===true){
setStatus("Ваш акаунт заблокований адміністрацією.","error");
return;
}

const passwordHash=await hashPassword(password);

if(user.passwordHash!==passwordHash){
setStatus("Невірний email або пароль.","error");
return;
}

createSession(user);

if(user.role==="owner"){
setStatus("Вхід виконано. Вітаємо, власнику.","success");
}else if(user.muted===true){
setStatus("Вхід виконано. Ваш акаунт зараз має статус mute.","success");
}else{
setStatus("Вхід виконано.","success");
}

setTimeout(function(){
window.location.href=getReturnUrl();
},250);

}catch(error){
setStatus("Не вдалося виконати вхід у цьому браузері.","error");
}
});

registerForm.addEventListener("submit",async function(event){
event.preventDefault();

clearErrors(registerForm);
setStatus("Створення акаунта...","loading");

const name=document.getElementById("registerName").value.trim();
const email=normalizeEmail(document.getElementById("registerEmail").value);
const password=document.getElementById("registerPassword").value;
const confirm=document.getElementById("registerPasswordConfirm").value;
let valid=true;

if(name.length<2){
setError("registerNameError","Ім'я має містити щонайменше 2 символи.");
valid=false;
}

if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
setError("registerEmailError","Введіть коректну електронну адресу.");
valid=false;
}

if(password.length<8){
setError("registerPasswordError","Пароль має містити щонайменше 8 символів.");
valid=false;
}

if(password!==confirm){
setError("registerPasswordConfirmError","Паролі не збігаються.");
valid=false;
}

if(!valid){
setStatus("");
return;
}

try{
setupSystemAccounts();

const users=getUsers();

if(users.some(function(item){
return item.email===email;
})){
setStatus("Користувач з таким email уже зареєстрований.","error");
return;
}

const passwordHash=await hashPassword(password);

const user={
id:createId(),
name:name,
email:email,
passwordHash:passwordHash,
role:"user",
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

users.push(user);

saveUsers(users);
createSession(user);

setStatus("Реєстрацію завершено. Ви увійшли в систему.","success");

setTimeout(function(){
window.location.href=getReturnUrl();
},250);

}catch(error){
setStatus("Не вдалося створити акаунт у цьому браузері.","error");
}
});
});