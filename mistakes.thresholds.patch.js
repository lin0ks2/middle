/*!
 * mistakes.thresholds.patch.js
 * Version: 1.6.2
 *  - В МО только после 2 ошибок (idk игнорируется)
 *  - Не добавлять если слово в Избранном
 *  Подключать после app.ui.view.js и модулей Mistakes/Favorites
 */
(function(){
  'use strict';
  var fail = Object.create(null);

  function inc(m,id){ id=String(id); m[id]=(m[id]|0)+1; return m[id]; }
  function isFav(w){
    try{
      if(!w) return false;
      if(window.App && typeof App.isFavorite==='function') return App.isFavorite(w.id);
      if(App && App.Favorites && typeof App.Favorites.has==='function') return App.Favorites.has(w.id);
    }catch(_){}
    return false;
  }

  var orig = null;
  if (typeof window.addToMistakesOnFailure==='function') orig = window.addToMistakesOnFailure;
  else if (window.App && App.Mistakes && typeof App.Mistakes.addOnFailure==='function')
      orig = App.Mistakes.addOnFailure.bind(App.Mistakes);

  function onFail(w){
    if(!w||w.id==null) return;
    var wid=String(w.id);
    if (isFav(w)) return;
    var f = inc(fail,wid);
    if (f>=2 && orig){ try{ orig(w); }catch(_){ } }
  }

  window.MistakesGate={ onFail:onFail };

  document.addEventListener('lexitron:answer-wrong', function(e){
    onFail(e && e.detail && e.detail.word);
  });
})();