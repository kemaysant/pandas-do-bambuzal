# -*- coding: utf-8 -*-
import io
P="index.html"
s=io.open(P,encoding="utf-8").read()
def rep(old,new,n,label):
    global s
    c=s.count(old); assert c==n,"FAIL ["+label+"] got %d"%c
    s=s.replace(old,new); print("ok:",label)

# R1 notifIcon: bug -> 🐞
rep("function notifIcon(t){ return (t==='friend_request'",
    "function notifIcon(t){ if(t&&t.indexOf('bug_')===0) return '\U0001F41E'; return (t==='friend_request'",1,"notifIcon")

# R2 notifText: bug branch
rep("function notifText(n){ var nm='<b>'+esc(notifName(n.actor))+'</b>';\n    if(n.type==='friend_request')",
    "function notifText(n){ var nm='<b>'+esc(notifName(n.actor))+'</b>';\n"
    "    if(n.type&&n.type.indexOf('bug_')===0){ var _bs=n.type.slice(4); var _bm={resolvido:'Seu report de bug foi <b>resolvido</b> ✅',andamento:'Seu report de bug está <b>em andamento</b> \U0001F440 — já estamos cuidando dele.',rejeitado:'Seu report de bug foi avaliado e <b>encerrado</b>.',aberto:'Seu report de bug foi <b>reaberto</b>.'}; return _bm[_bs]||'Seu report de bug teve uma atualização.'; }\n"
    "    if(n.type==='friend_request')",1,"notifText")

# R3 tpNotifClick bug branch + define peek/load (inside social IIFE, rpc in scope)
rep("    else if(window.tpGoFriends){ tpGoFriends(); } };\n  function tpGoPass(){",
    "    else if(n.type&&n.type.indexOf('bug_')===0){ if(typeof showPage==='function'){ var _pb=document.querySelector('.nav-btn[onclick*=\"profile\"]'); showPage('profile',_pb); } setTimeout(function(){ var _t=document.querySelector('#profile .pf-tab[data-tab=reports]'); if(_t) _t.click(); },250); }\n"
    "    else if(window.tpGoFriends){ tpGoFriends(); } };\n"
    "  window.tpMyReportsPeek=function(){ try{ rpc('tp_my_bug_reports').then(function(d){ var tab=document.getElementById('pf-reports-tab'); if(tab) tab.style.display=(d&&d.ok&&d.rows&&d.rows.length)?'':'none'; }); }catch(e){} };\n"
    "  window.tpMyReportsLoad=function(){ var host=document.getElementById('pf-reports-body'); if(!host) return; host.innerHTML='<div class=\"ag-loading\">Carregando…</div>';\n"
    "    rpc('tp_my_bug_reports').then(function(d){ if(!d||!d.ok){ host.innerHTML='<div class=\"adm-note\" style=\"color:var(--red,#e87070)\">Não consegui carregar seus reports.</div>'; return; }\n"
    "      var rows=d.rows||[]; var tab=document.getElementById('pf-reports-tab'); if(tab) tab.style.display=rows.length?'':'none';\n"
    "      if(!rows.length){ host.innerHTML='<div class=\"vit-empty\" style=\"padding:1.4rem\">Você ainda não enviou nenhum report. Quando mandar um bug pelo rodapé, ele aparece aqui.</div>'; return; }\n"
    "      var ST={aberto:['Aberto','#e8a54a'],andamento:['Em andamento','#5b8def'],resolvido:['Resolvido','#2fb36a'],rejeitado:['Encerrado','#5a5668']};\n"
    "      host.innerHTML=rows.map(function(b){ var sx=ST[b.status]||[b.status,'#777'];\n"
    "        return '<div style=\"border:1px solid var(--rule);border-radius:12px;padding:.8rem .9rem;margin-bottom:.7rem;background:var(--bg-2,#1c1b26)\">'\n"
    "          +'<div style=\"display:flex;align-items:center;gap:.5rem;flex-wrap:wrap\"><b style=\"color:var(--ink,#e8e6f0)\">'+esc(b.title||'(sem título)')+'</b>'\n"
    "          +'<span style=\"font-size:.7rem;font-weight:800;color:#fff;background:'+sx[1]+';border-radius:999px;padding:.12rem .5rem\">'+sx[0]+'</span>'\n"
    "          +(b.area?'<span style=\"font-size:.72rem;color:var(--muted)\">\U0001F4CD '+esc(b.area)+'</span>':'')+'</div>'\n"
    "          +(b.descr?'<div style=\"font-size:.82rem;color:var(--ink-2,#bfbccb);margin-top:.35rem;white-space:pre-wrap\">'+esc(b.descr)+'</div>':'')\n"
    "          +'<div style=\"font-size:.7rem;color:var(--muted);margin-top:.45rem\">Enviado em '+new Date(b.created_at).toLocaleDateString('pt-BR')+(b.resolved_at?(' · '+(b.status==='rejeitado'?'encerrado':'resolvido')+' em '+new Date(b.resolved_at).toLocaleDateString('pt-BR')):'')+'</div>'\n"
    "        +'</div>'; }).join('');\n"
    "    }).catch(function(){ host.innerHTML='<div class=\"adm-note\" style=\"color:var(--red,#e87070)\">Erro ao carregar.</div>'; }); };\n"
    "  function tpGoPass(){",1,"notifclick_funcs")

# R4 tab button (hidden)
rep("<button class=\"pf-tab\" data-tab=\"dados\" onclick=\"tpProfTab('dados',this)\">\U0001F464 Meus dados</button>",
    "<button class=\"pf-tab\" data-tab=\"dados\" onclick=\"tpProfTab('dados',this)\">\U0001F464 Meus dados</button>\n      <button class=\"pf-tab\" data-tab=\"reports\" id=\"pf-reports-tab\" onclick=\"tpProfTab('reports',this)\" style=\"display:none\">\U0001F41E Meus reports</button>",1,"tab_btn")

# R5 panel
rep("\n    <!-- BOSSES (tracker no perfil) -->",
    "\n    <div class=\"pf-panel\" data-panel=\"reports\" style=\"display:none\">\n"
    "      <div class=\"card\"><h3 class=\"sec-title\" style=\"margin-top:0\">\U0001F41E Meus reports</h3>\n"
    "        <p class=\"sec-sub\" style=\"margin-top:-.3rem\">Acompanhe os bugs que você enviou e o status de cada um.</p>\n"
    "        <div id=\"pf-reports-body\"><div class=\"ag-loading\">Carregando…</div></div>\n"
    "      </div>\n    </div>\n\n    <!-- BOSSES (tracker no perfil) -->",1,"panel")

# R6 tpProfTab lazy-load
rep("    if(name==='bosses' && window.tpProfBosses) tpProfBosses();\n  };",
    "    if(name==='bosses' && window.tpProfBosses) tpProfBosses();\n    if(name==='reports' && window.tpMyReportsLoad) tpMyReportsLoad();\n  };",1,"proftab")

# R7 peek on own-profile render
rep("    var un=g('pf-username'); if(un) un.textContent=uname;",
    "    var un=g('pf-username'); if(un) un.textContent=uname;\n    if(window.tpMyReportsPeek) tpMyReportsPeek();",1,"peek_hook")

# R8 build
rep("window.TP_BUILD = '2026-10-07bazar40';","window.TP_BUILD = '2026-10-07bazar41';",1,"build")

io.open(P,"w",encoding="utf-8").write(s)
print("WROTE",len(s))
