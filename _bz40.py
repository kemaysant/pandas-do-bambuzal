# -*- coding: utf-8 -*-
import io
P="index.html"
s=io.open(P,encoding="utf-8").read()
def rep(old,new,n,label):
    global s
    c=s.count(old); assert c==n,"FAIL ["+label+"] got %d"%c
    s=s.replace(old,new); print("ok:",label)

OLD1=("var r=await af()(SB()+'/rest/v1/events?id=eq.'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(patch)});\n"
"      if(!r.ok) throw new Error('patch');")
NEW1=("var r=await af()(SB()+'/rest/v1/events?id=eq.'+id,{method:'PATCH',headers:{'Content-Type':'application/json',Accept:'application/json',Prefer:'return=representation'},body:JSON.stringify(patch)});\n"
"      if(!r.ok) throw new Error('patch');\n"
"      var _saved=await r.json().catch(function(){return null;});\n"
"      if(!Array.isArray(_saved)||!_saved.length) throw new Error('norows');")
rep(OLD1,NEW1,1,"patch_verify")

OLD2="}catch(e){ toast('Não consegui salvar as alterações.','error'); if(btn){ btn.disabled=false; btn.textContent='Salvar alterações'; } }"
NEW2="}catch(e){ var _m=(e&&e.message==='norows')?'Não salvou — sua sessão pode ter expirado. Saia, entre de novo e tente outra vez (precisa ser o dono do evento ou moderador).':'Não consegui salvar as alterações.'; toast(_m,'error'); if(btn){ btn.disabled=false; btn.textContent='Salvar alterações'; } }"
rep(OLD2,NEW2,1,"catch_msg")

rep("window.TP_BUILD = '2026-10-05bazar39';","window.TP_BUILD = '2026-10-07bazar40';",1,"build")
io.open(P,"w",encoding="utf-8").write(s)
print("WROTE",len(s))
