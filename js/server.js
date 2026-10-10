const http=require("http");
const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const PORT=process.env.PORT||3000;
const HOST="0.0.0.0";
const PUBLIC=path.join(__dirname,"public");
const DATA_DIR=path.join(__dirname,"data");
const USERS_FILE=path.join(DATA_DIR,"users.json");
const MESSAGES_FILE=path.join(DATA_DIR,"messages.json");
const SESSIONS=new Map();

if(!fs.existsSync(DATA_DIR))fs.mkdirSync(DATA_DIR,{recursive:true});
if(!fs.existsSync(USERS_FILE))fs.writeFileSync(USERS_FILE,"[]","utf8");
if(!fs.existsSync(MESSAGES_FILE))fs.writeFileSync(MESSAGES_FILE,"[]","utf8");

function readJson(file,fallback=[]){try{return JSON.parse(fs.readFileSync(file,"utf8"));}catch{return fallback;}}
function writeJson(file,data){fs.writeFileSync(file,JSON.stringify(data,null,2),"utf8");}
function hashPassword(password,salt=crypto.randomBytes(16).toString("hex")){const hash=crypto.scryptSync(password,salt,64).toString("hex");return{salt,hash};}
function checkPassword(password,salt,hash){try{const candidate=crypto.scryptSync(password,salt,64).toString("hex");const a=Buffer.from(candidate,"hex");const b=Buffer.from(hash,"hex");return a.length===b.length&&crypto.timingSafeEqual(a,b);}catch{return false;}}
function randomId(){const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*_-";let id="";for(let i=0;i<12;i++)id+=chars[crypto.randomInt(chars.length)];return id;}
function uniqueId(users){let id;do{id=randomId();}while(users.some(user=>user.id===id));return id;}
function cleanExpiredMessages(){const now=Date.now();const messages=readJson(MESSAGES_FILE,[]);const active=messages.filter(message=>Number.isFinite(message.createdAt)&&now-message.createdAt<24*60*60*1000);if(active.length!==messages.length)writeJson(MESSAGES_FILE,active);return active;}
function parseCookies(req){const cookies={};(req.headers.cookie||"").split(";").forEach(item=>{const index=item.indexOf("=");if(index>0){const key=item.slice(0,index).trim();const value=item.slice(index+1).trim();try{cookies[key]=decodeURIComponent(value);}catch{cookies[key]=value;}}});return cookies;}
function getUser(req){const token=parseCookies(req).chat_session;const userId=token&&SESSIONS.get(token);if(!userId)return null;return readJson(USERS_FILE,[]).find(user=>user.id===userId)||null;}
function send(res,status,data,headers={}){if(res.headersSent)return;const body=JSON.stringify(data);res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...headers});res.end(body);}
function getBody(req){return new Promise((resolve,reject)=>{let raw="";let done=false;req.on("data",chunk=>{if(done)return;raw+=chunk.toString();if(raw.length>200000){done=true;reject(new Error("Дані занадто великі."));req.destroy();}});req.on("end",()=>{if(done)return;try{resolve(JSON.parse(raw||"{}"));}catch{done=true;reject(new Error("Некоректні дані."));}});req.on("error",error=>{if(!done){done=true;reject(error);}});});}
function sessionCookie(token){return`chat_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`;}
function clearCookie(){return"chat_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";}
function publicUser(user){return{id:user.id,name:user.name};}
function formatAge(createdAt){const diff=Math.max(0,Date.now()-createdAt);if(diff<60000)return"щойно";const minutes=Math.floor(diff/60000);if(minutes<60)return`${minutes} хв тому`;return`${Math.floor(minutes/60)} год тому`;}

async function routeApi(req,res,url){
if(req.method==="GET"&&url==="/api/me"){const user=getUser(req);send(res,200,{user:user?publicUser(user):null});return true;}
if(req.method==="GET"&&url==="/api/messages"){const messages=cleanExpiredMessages().sort((a,b)=>a.createdAt-b.createdAt).map(message=>({...message,ageLabel:formatAge(message.createdAt)}));send(res,200,{messages});return true;}
if(req.method==="POST"&&url==="/api/register"){
try{
const body=await getBody(req);
const name=String(body.name||"").trim();
const password=String(body.password||"");
if(name.length<1||name.length>40)return send(res,400,{error:"Ім'я має містити від 1 до 40 символів."}),true;
if(password.length<6||password.length>100)return send(res,400,{error:"Пароль має містити від 6 до 100 символів."}),true;
const users=readJson(USERS_FILE,[]);
const id=uniqueId(users);
const passwordData=hashPassword(password);
const user={id,name,passwordSalt:passwordData.salt,passwordHash:passwordData.hash,createdAt:Date.now()};
users.push(user);
writeJson(USERS_FILE,users);
const token=crypto.randomBytes(32).toString("hex");
SESSIONS.set(token,id);
send(res,201,{user:publicUser(user)},{"Set-Cookie":sessionCookie(token)});
return true;
}catch(error){return send(res,400,{error:error.message||"Помилка реєстрації."}),true;}
}
if(req.method==="POST"&&url==="/api/login"){
try{
const body=await getBody(req);
const id=String(body.id||"").trim();
const password=String(body.password||"");
const user=readJson(USERS_FILE,[]).find(item=>item.id===id);
if(!user||!checkPassword(password,user.passwordSalt,user.passwordHash))return send(res,401,{error:"Неправильний ID або пароль."}),true;
const token=crypto.randomBytes(32).toString("hex");
SESSIONS.set(token,user.id);
send(res,200,{user:publicUser(user)},{"Set-Cookie":sessionCookie(token)});
return true;
}catch(error){return send(res,401,{error:error.message||"Помилка входу."}),true;}
}
if(req.method==="POST"&&url==="/api/logout"){
const token=parseCookies(req).chat_session;
if(token)SESSIONS.delete(token);
send(res,200,{ok:true},{"Set-Cookie":clearCookie()});
return true;
}
if(req.method==="POST"&&url==="/api/messages"){
try{
const body=await getBody(req);
const user=getUser(req);
if(!user)return send(res,401,{error:"Спочатку увійдіть або зареєструйтесь."}),true;
const text=String(body.text||"").trim();
if(!text||text.length>1000)return send(res,400,{error:"Повідомлення має містити від 1 до 1000 символів."}),true;
const messages=cleanExpiredMessages();
const message={id:crypto.randomBytes(12).toString("hex"),userId:user.id,name:user.name,text,createdAt:Date.now()};
messages.push(message);
writeJson(MESSAGES_FILE,messages);
send(res,201,{message:{...message,ageLabel:"щойно"}});
return true;
}catch(error){return send(res,400,{error:error.message||"Помилка створення повідомлення."}),true;}
}
const match=url.match(/^\/api\/messages\/([^/]+)$/);
if(match&&req.method==="PUT"){
try{
const body=await getBody(req);
const user=getUser(req);
if(!user)return send(res,401,{error:"Потрібна авторизація."}),true;
const text=String(body.text||"").trim();
if(!text||text.length>1000)return send(res,400,{error:"Повідомлення має містити від 1 до 1000 символів."}),true;
const messages=cleanExpiredMessages();
const message=messages.find(item=>item.id===match[1]);
if(!message)return send(res,404,{error:"Повідомлення вже видалене."}),true;
if(message.userId!==user.id)return send(res,403,{error:"Ви можете редагувати лише власні повідомлення."}),true;
message.text=text;
message.editedAt=Date.now();
writeJson(MESSAGES_FILE,messages);
send(res,200,{message:{...message,ageLabel:formatAge(message.createdAt)}});
return true;
}catch(error){return send(res,400,{error:error.message||"Помилка редагування повідомлення."}),true;}
}
if(match&&req.method==="DELETE"){
const user=getUser(req);
if(!user){send(res,401,{error:"Потрібна авторизація."});return true;}
const messages=cleanExpiredMessages();
const index=messages.findIndex(item=>item.id===match[1]);
if(index<0){send(res,404,{error:"Повідомлення вже видалене."});return true;}
if(messages[index].userId!==user.id){send(res,403,{error:"Ви можете видаляти лише власні повідомлення."});return true;}
messages.splice(index,1);
writeJson(MESSAGES_FILE,messages);
send(res,200,{ok:true});
return true;
}
return false;
}

const MIME={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"application/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".gif":"image/gif",".svg":"image/svg+xml",".webp":"image/webp",".ico":"image/x-icon"};

const server=http.createServer(async(req,res)=>{
try{
const url=new URL(req.url,`http://${req.headers.host||"localhost"}`).pathname;
if(url.startsWith("/api/")){
const handled=await routeApi(req,res,url);
if(handled)return;
}
const publicRoot=path.resolve(PUBLIC);
const filePath=url==="/" ? path.join(PUBLIC,"index.html"):path.join(PUBLIC,url.replace(/^\/+/,""));
const requestedPath=path.resolve(filePath);
if(requestedPath!==publicRoot&&!requestedPath.startsWith(publicRoot+path.sep))return send(res,403,{error:"Доступ заборонено."});
if(!fs.existsSync(requestedPath)||!fs.statSync(requestedPath).isFile())return send(res,404,{error:"Не знайдено."});
const ext=path.extname(requestedPath).toLowerCase();
res.writeHead(200,{"Content-Type":MIME[ext]||"application/octet-stream","Cache-Control":"no-store"});
fs.createReadStream(requestedPath).pipe(res);
}catch(error){
console.error(error);
if(!res.headersSent)send(res,500,{error:"Помилка сервера."});
else res.end();
}
});

setInterval(cleanExpiredMessages,60*1000);
server.listen(PORT,HOST,()=>console.log(`Peteichuk chat: http://localhost:${PORT}`));