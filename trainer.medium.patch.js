/*!
 * trainer.medium.patch.js
 * Version: 1.6.1
 *  - Reverse unlock threshold = 2.5 stars
 *  - Anti-repeat buffer for 5 последних слов
 *  Подключать после app.trainer.js и app.ui.view.js
 */
(function(){
  'use strict';
  if (!window.App) window.App = {};
  if (!App.Trainer) App.Trainer = {};

  // порог реверса
  try { App.Trainer.unlockThreshold = function(){ return 2.5; }; } catch(_){}

  // анти-повтор
  var recent = []; var K = 5;
  function remember(id){
    if (id==null) return;
    id = String(id);
    var i = recent.indexOf(id);
    if (i>=0) recent.splice(i,1);
    recent.push(id);
    while(recent.length>K) recent.shift();
  }
  App.Trainer.rememberShown = remember;
  App.Trainer._recentShown = recent;

  function wrapPicker(obj,name){
    try{
      var orig = obj && obj[name];
      if (typeof orig!=='function') return false;
      obj[name] = function(){
        var res = orig.apply(this, arguments);
        try{
          if (Array.isArray(res)){
            var pool = res.filter(w=>{
              var wid = w && w.id!=null ? String(w.id) : null;
              return !wid || recent.indexOf(wid)===-1;
            });
            return pool.length ? pool : res;
          }else if(res && typeof res==='object'){
            if (Array.isArray(res.candidates)){
              var pool = res.candidates.filter(w=>{
                var wid = w && w.id!=null ? String(w.id) : null;
                return !wid || recent.indexOf(wid)===-1;
              });
              if (pool.length) res.candidates = pool;
            }
            return res;
          }
          return res;
        }catch(e){ return res; }
      };
      return true;
    }catch(_){ return false; }
  }
  wrapPicker(App.Trainer,'pickNext') || wrapPicker(App.Trainer,'nextCandidates') || wrapPicker(App.Trainer,'next');

  // слушатель события
  document.addEventListener('lexitron:word-shown',e=>{
    var w=e&&e.detail&&e.detail.word;
    if(w&&w.id!=null) remember(w.id);
  });
})();
