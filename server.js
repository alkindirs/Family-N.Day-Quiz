// خادم بسيط بدون أي مكتبات خارجية: node server.js
const http=require("http"),fs=require("fs"),os=require("os"),path=require("path");
const PORT=+process.env.PORT||3000,cl=new Set();
const ip=()=>{for(const l of Object.values(os.networkInterfaces()))for(const a of l)if(a.family==="IPv4"&&!a.internal)return a.address;return null};
http.createServer((q,r)=>{
 if(q.method==="GET"&&q.url==="/events"){r.writeHead(200,{"Content-Type":"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"});r.write("retry: 1500\n\n");cl.add(r);q.on("close",()=>cl.delete(r));return}
 if(q.method==="POST"&&q.url==="/emit"){let b="";q.on("data",x=>{b+=x;if(b.length>8192)q.destroy()});
  q.on("end",()=>{try{const m=JSON.parse(b),s="data: "+JSON.stringify({c:String(m.c),t:String(m.t),d:m.d})+"\n\n";cl.forEach(c=>c.write(s))}catch(e){}r.writeHead(204);r.end()});return}
 if(q.url==="/music.m4a"){const f=path.join(__dirname,"music.m4a");if(!fs.existsSync(f)){r.writeHead(404);r.end();return}
  const n=fs.statSync(f).size,m=/bytes=(\d*)-(\d*)/.exec(q.headers.range||"");
  if(m){const a=m[1]?+m[1]:0,b=m[2]?Math.min(+m[2],n-1):n-1;r.writeHead(206,{"Content-Type":"audio/mp4","Accept-Ranges":"bytes","Content-Range":"bytes "+a+"-"+b+"/"+n,"Content-Length":b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(r)}
  else{r.writeHead(200,{"Content-Type":"audio/mp4","Accept-Ranges":"bytes","Content-Length":n});fs.createReadStream(f).pipe(r)}return}
 if(q.url==="/info"){r.writeHead(200,{"Content-Type":"application/json"});r.end(JSON.stringify({ip:ip(),port:PORT}));return}
 r.writeHead(200,{"Content-Type":"text/html; charset=utf-8"});r.end(fs.readFileSync(path.join(__dirname,"index.html")));
}).listen(PORT,"0.0.0.0",()=>{console.log("\nللمقدّم افتح:  http://"+(ip()||"localhost")+":"+PORT+"/?host=1\nللمشاركين:  http://"+(ip()||"localhost")+":"+PORT+"/\n")});
setInterval(()=>cl.forEach(c=>c.write(": ping\n\n")),20000);
