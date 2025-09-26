/*!
 * stars.rules.patch.js
 * Version: 1.6.1
 *  - +0.5 звезды за правильный ответ
 *  - –0.5 за «Не знаю» (не ниже 0)
 *  Подключать после app.ui.view.js
 */
(function(){
  'use strict';
  function max(){ try{ return (App && App.Trainer && App.Trainer.starsMax())||5; }catch(_){return 5;} }
  function clamp(x){ return Math.max(0, Math.min(max(), x)); }

  function get(id){ try{ return (App.state?.stars?.[id])||0; }catch(_){return 0;} }
  function set(id,v){
    try{
      if(!App.state) App.state={};
      if(!App.state.stars) App.state.stars={};
      App.state.stars[id]=v;
      App.saveState && App.saveState();
    }catch(_){}
  }

  function onCorrect(id){ if(id==null)return; set(id,clamp(get(id)+0.5)); }
  function onIdk(id){ if(id==null)return; set(id,clamp(get(id)-0.5)); }

  window.StarsRules={onCorrect,onIdk};

  document.addEventListener('lexitron:answer-correct',e=>{ var w=e?.detail?.word; if(w)onCorrect(w.id); });
  document.addEventListener('lexitron:idk',e=>{ var w=e?.detail?.word; if(w)onIdk(w.id); });
})();
