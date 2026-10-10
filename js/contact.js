//Це до форми зв'язку
document.addEventListener("DOMContentLoaded",function(){
const form=document.getElementById("feedbackForm");
const fullName=document.getElementById("fullName");
const email=document.getElementById("email");
const message=document.getElementById("message");
const submit=document.getElementById("feedbackSubmit");
const status=document.getElementById("authStatus");
if(!form||!fullName||!email||!message||!submit||!status)return;
const SESSION_KEY="peteichuk_session";
const MESSAGES_KEY="peteichuk_messages";
const USERS_KEY="peteichuk_users";
function getSession(){
try{
const data=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
if(!data||!data.userId||!data.email||!data.sessionId)return null;
return data;
}catch(error){return null;}
}
function getUsers(){
try{
const users=JSON.parse(localStorage.getItem(USERS_KEY)||"[]");
return Array.isArray(users)?users:[];
}catch(error){return[];}
}
function setStatus(text,type){
status.textContent=text||"";
status.className="auth-status"+(type?" "+type:"");
}
function redirectToAuth(){
sessionStorage.setItem("peteichuk_auth_return","index.html#contact");
window.location.href="auth.html";
}
function syncForm(){
const session=getSession();
if(!session){
email.readOnly=false;
return null;
}
fullName.value=session.name||"";
email.value=session.email||"";
email.readOnly=true;
return session;
}
function saveMessage(data){
try{
const messages=JSON.parse(localStorage.getItem(MESSAGES_KEY)||"[]");
if(!Array.isArray(messages))return false;
messages.push(data);
localStorage.setItem(MESSAGES_KEY,JSON.stringify(messages));
return true;
}catch(error){return false;}
}
function findUser(id){
return getUsers().find(function(user){return user.id===id;});
}
const session=syncForm();
if(!session)setStatus("Щоб надсилати повідомлення, увійдіть або зареєструйтеся.","error");
form.addEventListener("submit",function(event){
event.preventDefault();
const currentSession=getSession();
if(!currentSession){
setStatus("Для надсилання повідомлення потрібна авторизація.","error");
redirectToAuth();
return;
}
const user=findUser(currentSession.userId);
if(!user){
localStorage.removeItem(SESSION_KEY);
setStatus("Обліковий запис не знайдено. Увійдіть повторно.","error");
redirectToAuth();
return;
}
const nameValue=fullName.value.trim();
const messageValue=message.value.trim();
if(nameValue.length<2){
setStatus("Введіть коректне повне ім'я.","error");
return;
}
if(messageValue.length<5){
setStatus("Повідомлення має містити щонайменше 5 символів.","error");
return;
}
submit.disabled=true;
submit.textContent="Надсилання...";
let saved=false;
try{
const messages=JSON.parse(localStorage.getItem(MESSAGES_KEY)||"[]");
if(!Array.isArray(messages))throw new Error("Invalid storage");
messages.push({
id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2),
userId:currentSession.userId,
name:user.name,
email:user.email,
message:messageValue,
createdAt:new Date().toISOString(),
status:"new",
replies:[]
});
localStorage.setItem(MESSAGES_KEY,JSON.stringify(messages));
saved=true;
}catch(error){}
if(saved){
message.value="";
setStatus("Повідомлення збережено. Адміністрація побачить його в панелі управління.","success");
}else{
setStatus("Не вдалося зберегти повідомлення локально.","error");
}
submit.disabled=false;
submit.textContent="Надіслати повідомлення";
});
});
