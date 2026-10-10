const state={user:null};
const $=id=>document.getElementById(id);
async function api(url,options={}){
const response=await fetch(url,{credentials:"same-origin",headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
let data={};
try{data=await response.json();}catch{}
if(!response.ok)throw new Error(data.error||"Помилка сервера.");
return data;
}
function setStatus(element,message=""){element.textContent=message;}
function openIdModal(){
if(!state.user)return;
$("idValue").textContent=state.user.id;
$("idModal").hidden=false;
}
function closeIdModal(){$("idModal").hidden=true;}
function updateUI(){
const logged=!!state.user;
$("authBox").hidden=logged;
$("profileBox").hidden=!logged;
$("messageForm").hidden=!logged;
if(logged){
$("profileName").textContent=state.user.name;
$("accountName").textContent=state.user.name;
$("menuName").textContent=state.user.name;
$("menuId").textContent="ID приховано";
}else{
$("accountName").textContent="Анонім";
$("menuName").textContent="Анонім";
$("menuId").textContent="ID приховано";
}
loadMessages();
}
async function loadSession(){
try{
const data=await api("/api/me");
state.user=data.user;
updateUI();
}catch(error){setStatus($("authStatus"),error.message);}
}
function renderMessages(messages){
const box=$("messages");
box.innerHTML="";
$("emptyMessages").style.display=messages.length?"none":"block";
messages.forEach(message=>{
const own=state.user&&message.userId===state.user.id;
const article=document.createElement("article");
article.className="message";
article.dataset.id=message.id;
const head=document.createElement("div");
head.className="message-head";
const name=document.createElement("span");
name.className="message-name";
name.textContent=message.name;
const time=document.createElement("span");
time.className="message-time";
time.textContent=message.ageLabel;
head.append(name,time);
const text=document.createElement("div");
text.className="message-text";
text.textContent=message.text;
if(message.editedAt){
const edited=document.createElement("span");
edited.className="message-edited";
edited.textContent="(ред.)";
text.appendChild(edited);
}
article.append(head,text);
if(own){
const actions=document.createElement("div");
actions.className="message-actions";
const edit=document.createElement("button");
edit.type="button";
edit.textContent="Редагувати";
edit.onclick=()=>editMessage(message);
const del=document.createElement("button");
del.type="button";
del.textContent="Видалити";
del.onclick=()=>deleteMessage(message.id);
actions.append(edit,del);
article.append(actions);
}
box.append(article);
});
}
async function loadMessages(){
try{
const data=await api("/api/messages");
renderMessages(data.messages||[]);
}catch(error){setStatus($("messageStatus"),error.message);}
}
async function register(event){
event.preventDefault();
setStatus($("authStatus"),"");
const name=$("registerName").value.trim();
const password=$("registerPassword").value;
try{
const data=await api("/api/register",{method:"POST",body:JSON.stringify({name,password})});
state.user=data.user;
$("registerForm").reset();
updateUI();
openIdModal();
}catch(error){setStatus($("authStatus"),error.message);}
}
async function login(event){
event.preventDefault();
setStatus($("authStatus"),"");
const id=$("loginId").value.trim();
const password=$("loginPassword").value;
try{
const data=await api("/api/login",{method:"POST",body:JSON.stringify({id,password})});
state.user=data.user;
$("loginForm").reset();
updateUI();
}catch(error){setStatus($("authStatus"),error.message);}
}
async function logout(){
try{
await api("/api/logout",{method:"POST",body:"{}"});
state.user=null;
$("chatAccount").classList.remove("open");
updateUI();
}catch(error){setStatus($("messageStatus"),error.message);}
}
async function publishMessage(event){
event.preventDefault();
setStatus($("messageStatus"),"");
const text=$("messageText").value.trim();
if(!text)return;
try{
await api("/api/messages",{method:"POST",body:JSON.stringify({text})});
$("messageText").value="";
$("charCount").textContent="0 / 1000";
await loadMessages();
}catch(error){setStatus($("messageStatus"),error.message);}
}
async function editMessage(message){
const text=prompt("Відредагуйте повідомлення:",message.text);
if(text===null)return;
const value=text.trim();
if(!value)return;
try{
await api("/api/messages/"+encodeURIComponent(message.id),{method:"PUT",body:JSON.stringify({text:value})});
await loadMessages();
}catch(error){setStatus($("messageStatus"),error.message);}
}
async function deleteMessage(id){
if(!confirm("Видалити ваше повідомлення?"))return;
try{
await api("/api/messages/"+encodeURIComponent(id),{method:"DELETE"});
await loadMessages();
}catch(error){setStatus($("messageStatus"),error.message);}
}
document.querySelectorAll(".auth-tab").forEach(tab=>{
tab.addEventListener("click",()=>{
document.querySelectorAll(".auth-tab").forEach(item=>item.classList.remove("active"));
document.querySelectorAll(".auth-form").forEach(form=>form.classList.remove("active"));
tab.classList.add("active");
$(tab.dataset.auth==="register"?"registerForm":"loginForm").classList.add("active");
setStatus($("authStatus"),"");
});
});
$("registerForm").addEventListener("submit",register);
$("loginForm").addEventListener("submit",login);
$("messageForm").addEventListener("submit",publishMessage);
$("messageText").addEventListener("input",()=>{
$("charCount").textContent=$("messageText").value.length+" / 1000";
});
$("accountButton").addEventListener("click",()=>{
$("chatAccount").classList.toggle("open");
$("accountButton").setAttribute("aria-expanded",$("chatAccount").classList.contains("open"));
});
$("showIdBtn").addEventListener("click",()=>{openIdModal();$("chatAccount").classList.remove("open");});
$("profileIdBtn").addEventListener("click",openIdModal);
$("logoutBtn").addEventListener("click",logout);
$("closeIdModal").addEventListener("click",closeIdModal);
$("idModal").addEventListener("click",event=>{if(event.target===$("idModal"))closeIdModal();});
$("copyIdBtn").addEventListener("click",async()=>{
try{await navigator.clipboard.writeText(state.user.id);$("copyIdBtn").textContent="ID скопійовано";setTimeout(()=>$("copyIdBtn").textContent="Скопіювати ID",1500);}
catch{setStatus($("authStatus"),"Не вдалося скопіювати ID.");}
});
document.addEventListener("click",event=>{
if(!$("chatAccount").contains(event.target))$("chatAccount").classList.remove("open");
});
loadSession();
setInterval(loadMessages,30000);
