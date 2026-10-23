/* AI Design Studio: driven by the user's supplied artwork manifest. No generic art fallbacks. */
(function(){
  'use strict';
  const manifestUrl = 'assets/images/ai-design-studio/manifest.json';
  const imageRoot = 'assets/images/ai-design-studio/';
  const labels = {
    'helpbuddy':'HelpBuddy',
    'maximus':'Maximus',
    'optimus':'Optimus',
    'trinity':'Trinity'
  };
  const state = { character:'helpbuddy', expression:'happy', background:'', header:'', status:'listening' };
  let vocabularyLibrary = null;
  fetch(imageRoot + 'helpbuddy-vocabulary.json').then(r=>r.ok?r.json():null).then(data=>{vocabularyLibrary=data; if(document.getElementById('main') && (typeof current==='undefined' || current==='ai-design-studio')) render();}).catch(()=>{});
  const messages = {
    happy:"Great! I'm ready to help.",
    thinking:"I'm thinking through your request.",
    listening:"I'm listening. Tell me what you need.",
    excited:"Let's get this moving!",
    speaking:"I'm explaining the next step.",
    helpful:"I'll help you work through this.",
    focused:"I'm focused on the details.",
    alert:"I've noticed something that needs attention.",
    friendly:"I'm here with you.",
    encouraging:"You're making progress. Let's continue.",
    supportive:"I'll stay with you through the next step.",
    celebrating:"The task is complete and verified!"
  };
  function esc(s){return String(s == null ? '' : s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function asset(path){return imageRoot + String(path || '').replace(/^\/+/, '');}
  function tile(id,label,kind){return '<button type="button" class="ads-tile '+(state[kind]===id?'selected':'')+'" data-'+kind+'="'+esc(id)+'"><span>'+esc(label)+'</span></button>';}
  function render(){
    const root=document.getElementById('main'); if(!root)return;
    const char=state.character, title=labels[char] || 'HelpBuddy';
    const exp=char==='helpbuddy'?Object.keys(messages).map(k=>({id:k,label:k[0].toUpperCase()+k.slice(1)})):[
      {id:'neutral',label:'Neutral'},{id:'thinking',label:'Thinking'},{id:'attentive',label:'Attentive'},{id:'pleased',label:'Pleased'}
    ];
    const allowed=char==='helpbuddy'
      ? 'Avatar, outfit, background, header, expression, mood and message'
      : char==='trinity'
        ? 'Avatar, outfit, background and expression'
        : 'Expression and background; core character design stays unchanged';
    const msg=char==='helpbuddy'?(messages[state.expression]||messages[state.status]):(char==='maximus'?'Maximus maintains his blue robot identity.':char==='optimus'?'Optimus maintains his white robot identity.':'Trinity keeps her supplied character identity.');
    root.innerHTML='<div class="crumb"><span>AI TEAM / PERSONALIZATION</span><span>AI DESIGN STUDIO</span></div>'+
      '<section class="workspace ads-workspace"><div class="block-title"><h2>AI Design Studio</h2><button class="btn" id="ads-reset">Reset selections</button></div>'+
      '<p class="muted">Customize your AI team using the original IntelliStack artwork. Character identities are preserved; available controls change by character.</p>'+
      '<div class="ads-characters">'+Object.keys(labels).map(k=>'<button class="ads-character '+(char===k?'selected':'')+'" data-character="'+k+'"><strong>'+labels[k]+'</strong><small>'+({helpbuddy:'Your Intelligent Assistant',maximus:'Strategic Intelligence',optimus:'Technical Intelligence',trinity:'Governance & Coordination'}[k])+'</small></button>').join('')+'</div>'+
      '<div class="ads-columns"><section class="card ads-preview"><h3>'+esc(title)+' preview</h3><div class="ads-art" id="ads-art" aria-label="Original character artwork preview"><div class="ads-art-note">Original artwork asset pending</div></div><div class="ads-message"><b>'+esc(title)+' says</b><p id="ads-message">'+esc(msg)+'</p></div><p class="muted">Artwork status: waiting for the individual crops from your reference photos. No generic image will be substituted.</p></section>'+
      '<section class="card ads-controls"><h3>Expressions & mood</h3><div class="ads-tiles">'+exp.map(e=>tile(e.id,e.label,'expression')).join('')+'</div>'+
      (char==='helpbuddy'||char==='trinity'?'<h3>Outfit / appearance</h3><p class="muted">Outfit options are enabled for HelpBuddy and Trinity once the supplied individual outfit crops are added.</p>':'<h3>Identity lock</h3><p class="muted">'+(char==='maximus'?'Maximus remains the blue robot.':'Optimus remains the white robot.')+' Outfit redesign is disabled for this character.</p>')+
      '<h3>Background options</h3><div class="ads-tiles">'+['Blue Command Center','Global Globe','Blue Technology','Mountain Landscape','Tropical Landscape','Aurora'].map((v,i)=>tile(['command-center-blue','global-globe','blue-technology','nature-mountain','nature-tropical','aurora'][i],v,'background')).join('')+'</div>'+
      '<h3>Header options</h3><div class="ads-tiles">'+['Blue Technology Banner','Global Command Banner','City Skyline Banner','Green Technology Banner'].map((v,i)=>tile(['blue-tech-banner','global-command-banner','city-banner','green-tech-banner'][i],v,'header')).join('')+'</div></section></div>'+
      '<section class="card full ads-copy"><h3>HelpBuddy status wording</h3><p class="muted">Expressions should follow actual work and ticket events. Do not show completion until the system confirms success.</p><div class="ads-status-grid">'+[['Listening',"I'm listening to your request."],['Thinking',"I'm working through the details."],['Processing',"I'm processing the next step and will keep you updated."],['Ticket update',"I'm checking the ticket and its current status."],['Blocked',"I've hit a blocker. I'll explain what needs attention."],['Waiting',"I'm waiting for the next system response."],['Verified success',"That action has completed and the result is verified."],['Error',"I couldn't complete that action. I won't report it as successful."]].map(x=>'<div class="ads-status"><b>'+esc(x[0])+'</b><p>'+esc(x[1])+'</p></div>').join('')+'</div></section>'+
      '<section class="card full ads-copy"><h3>Operational vocabulary library</h3><p class="muted">'+(vocabularyLibrary ? Object.keys(vocabularyLibrary.states).length+' situation categories available. Messages should be selected by verified system state.' : 'Loading the HelpBuddy message library…')+'</p>'+(vocabularyLibrary?'<div class="ads-status-grid">'+Object.entries(vocabularyLibrary.states).map(([k,arr])=>'<details class="ads-status"><summary><b>'+esc(k.replace(/_/g,' '))+'</b> <span class="muted">('+arr.length+')</span></summary>'+arr.map(m=>'<p>'+esc(m)+'</p>').join('')+'</details>').join('')+'</div>':'')+'</section></section>';
    root.querySelectorAll('[data-character]').forEach(b=>b.addEventListener('click',()=>{state.character=b.dataset.character;render()}));
    root.querySelectorAll('[data-expression]').forEach(b=>b.addEventListener('click',()=>{state.expression=b.dataset.expression;render()}));
    root.querySelectorAll('[data-background]').forEach(b=>b.addEventListener('click',()=>{state.background=b.dataset.background;render()}));
    root.querySelectorAll('[data-header]').forEach(b=>b.addEventListener('click',()=>{state.header=b.dataset.header;render()}));
    const reset=root.querySelector('#ads-reset');if(reset)reset.addEventListener('click',()=>{state.character='helpbuddy';state.expression='happy';state.background='';state.header='';state.status='listening';render()});
  }
  const css=document.createElement('style');
  css.textContent='.ads-characters{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.ads-character,.ads-tile{background:#f2fbff;color:#103348;border:1px solid #a9d5e7;border-radius:10px;padding:10px;text-align:left}.ads-character strong,.ads-character small{display:block}.ads-character small{font-size:10px;margin-top:5px;color:#42677a}.ads-character.selected,.ads-tile.selected{border-color:#1676c5;box-shadow:inset 0 0 0 2px #7bc9ff;background:#dff4ff}.ads-columns{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:12px}.ads-preview,.ads-controls{background:#f8fcff;color:#16394a;border-color:#b7d7e5}.ads-preview h3,.ads-controls h3,.ads-copy h3{color:#16394a;margin:4px 0 10px}.ads-art{min-height:220px;border:1px dashed #76b8d3;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#e6f7ff,#c7e9ff);color:#315b70;text-align:center;padding:18px}.ads-art-note{max-width:250px;font-size:12px;line-height:1.6}.ads-message{background:#e8f6ff;border:1px solid #a8d9f0;border-radius:10px;padding:12px;margin-top:10px}.ads-message p{margin:6px 0 0}.ads-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:8px 0 16px}.ads-tile{font-size:11px;min-height:44px}.ads-status-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ads-status{background:#edf8ff;border:1px solid #c4e2f0;border-radius:9px;padding:10px}.ads-status p{font-size:11px;line-height:1.5;margin:6px 0 0}.ads-copy{margin-top:12px;background:#f8fcff;border-color:#b7d7e5}.ads-workspace>.muted{color:#536f7c}@media(max-width:900px){.ads-columns{grid-template-columns:1fr}.ads-characters{grid-template-columns:repeat(2,minmax(0,1fr))}}';
  document.head.appendChild(css);
  window.openAIStudio=render;
  const priorOpenPage=window.openPage;
  window.openPage=function(id){if(id==='ai-design-studio'){if(typeof current!=='undefined')current=id;if(typeof renderNav==='function')renderNav(document.getElementById('navSearch')?.value||'');render();return;}if(typeof priorOpenPage==='function')return priorOpenPage(id);};
  function addNav(){if(!Array.isArray(window.all))return; if(!window.all.some(x=>x[0]==='ai-design-studio'))window.all.push(['ai-design-studio','AI Design Studio','AI TEAM']);}
  // The main page's top-level nav array is lexical, so register using its exposed renderer when available.
  try { if(typeof all!=='undefined' && !all.some(x=>x[0]==='ai-design-studio')) all.push(['ai-design-studio','AI Design Studio','AI TEAM']); } catch(e){}
  try { if(typeof order!=='undefined' && !order.includes('ai-design-studio')) { order.push('ai-design-studio'); if(typeof save==='function')save(); } } catch(e){}
  try { if(typeof renderNav==='function')renderNav(document.getElementById('navSearch')?.value||''); } catch(e){}
  // Listen for the menu item even if navigation is filtered/rebuilt later.
  document.addEventListener('click',function(e){const b=e.target.closest('.navitem');if(b && b.dataset.id==='ai-design-studio'){e.preventDefault();render()}});
  // No remote images are loaded until real supplied crops exist in the manifest paths.
})();