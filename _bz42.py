# -*- coding: utf-8 -*-
import io
P="index.html"
s=io.open(P,encoding="utf-8").read()
def rep(old,new,n,label):
    global s
    c=s.count(old); assert c==n,"FAIL ["+label+"] got %d"%c
    s=s.replace(old,new); print("ok:",label)

# R1 throttle 800 -> 1500
rep("function tpPollNow(){ if(!me()) return; var t=Date.now(); if(t-_lastPoll<800) return;",
    "function tpPollNow(){ if(!me()||document.hidden) return; var t=Date.now(); if(t-_lastPoll<1500) return;",1,"throttle")

# R2 interval block: pause when hidden + relax intervals
OLD=("    rpc('tp_touch_presence'); tPres=setInterval(function(){ rpc('tp_touch_presence'); },60000);\n"
"    refreshFriends(); tFr=setInterval(refreshFriends,45000);\n"
"    refreshInbox(); tIn=setInterval(refreshInbox,8000);\n"
"    tChat=setInterval(pollChats,2500);\n"
"    refreshNotifs(); tNotif=setInterval(refreshNotifs,30000);")
NEW=("    rpc('tp_touch_presence'); tPres=setInterval(function(){ if(!document.hidden) rpc('tp_touch_presence'); },60000);\n"
"    refreshFriends(); tFr=setInterval(function(){ if(!document.hidden) refreshFriends(); },90000);\n"
"    refreshInbox(); tIn=setInterval(function(){ if(!document.hidden) refreshInbox(); },20000);\n"
"    tChat=setInterval(function(){ if(!document.hidden) pollChats(); },5000);\n"
"    refreshNotifs(); tNotif=setInterval(function(){ if(!document.hidden) refreshNotifs(); },60000);")
rep(OLD,NEW,1,"intervals")

rep("window.TP_BUILD = '2026-10-07bazar41';","window.TP_BUILD = '2026-10-19bazar42';",1,"build")
io.open(P,"w",encoding="utf-8").write(s)
print("WROTE",len(s))
