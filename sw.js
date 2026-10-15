const CACHE='calix-v7';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    /* fichiers du site : réseau d'abord, cache si hors ligne */
    e.respondWith(fetch(r).then(res=>{
      if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
  }else if(/(^|\.)(jsdelivr\.net|googleapis\.com|gstatic\.com)$/.test(u.hostname)){
    /* bibliothèque de détection et polices : cache d'abord, mise à jour en arrière-plan */
    e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{
      const n=fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}).catch(()=>m);
      return m||n;
    })));
  }
});
