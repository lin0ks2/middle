/*!
 * mistakes.thresholds.patch.js
 * Version: 1.6.1
 *  - В МО только после 2 ошибок или 3 «Не знаю»
 *  - Не добавлять если слово в Избранном
 *  Подключать после app.ui.view.js и модулей Mistakes/Favorites
 */
(function(){
  'use strict';
  var fail = Object.create(null), idk = Object.create(null);

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
  else if(window.App && App.Mistakes && typeof App.Mistakes.addOnFailure==='function')
      orig = App.Mistakes.addOnFailure.bind(App.Mistakes);

  function proceed(w,reason){
    if(!w||w.id==null) return;
    var wid=String(w.id);
    var f=(reason==='fail')?inc(fail,wid):(fail[wid]|0);
    var k=(reason==='idk')?inc(idk,wid):(idk[wid]|0);
    if( (f>=2 || k>=3) && !isFav(w) ){
      orig && orig(w);
    }
  }

  window.MistakesGate={
    onFail:w=>proceed(w,'fail'),
    onIdk:w=>proceed(w,'idk')
  };

  document.addEventListener('lexitron:answer-wrong',e=>proceed(e?.detail?.word,'fail'));
  document.addEventListener('lexitron:idk',e=>proceed(e?.detail?.word,'idk'));
})();
