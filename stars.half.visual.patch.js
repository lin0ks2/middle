/*!
 * stars.half.visual.patch.js
 * Version: 1.6.1
 *  - Рисует дробные ★
 *  Подключать последним, после всех скриптов
 */
(function(){
  'use strict';
  var D=document,W=window;

  // CSS
  var css=[
  '#stars.halfstars{display:flex;gap:6px;align-items:center;font-size:22px}', // базовый размер
'#stars.halfstars .star{position:relative;display:inline-block;width:1em;height:1em;line-height:1}',

/* контур пустой звезды */
'#stars.halfstars .star::before{content:"☆";position:absolute;left:0;top:0;right:0;bottom:0;color:#cbd5e1;opacity:.35}',

/* заливка — управляем шириной через --p (0%..100%) */
'#stars.halfstars .star::after{content:"★";position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);overflow:hidden;color:#fbbf24;white-space:nowrap;}',

/* плавное изменение ширины заливки */
'#stars.halfstars .star::after{transition:width .15s ease}',
  ].join('');
  var st=D.createElement('style'); st.textContent=css; (D.head||D.documentElement).appendChild(st);

  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}

  function valFor(w){
    try{
      if(!w)return 0;
      var id=String(w.id);
      return Number(App.state?.stars?.[id])||0;
    }catch(_){return 0;}
  }

  function render(v,max){
    var host=D.getElementById('stars'); if(!host)return;
    max=max||(App.Trainer?.starsMax?.()||5);
    host.classList.add('halfstars');
    host.innerHTML='';
    for(var i=1;i<=max;i++){
      var s=D.createElement('span'); s.className='star';
      var p=clamp((v-(i-1))*100,0,100);
      s.style.setProperty('--p',p+'%');
      host.appendChild(s);
    }
  }

  // события
  D.addEventListener('lexitron:word-shown',e=>render(valFor(e?.detail?.word)));
  D.addEventListener('lexitron:answer-correct',e=>render(valFor(e?.detail?.word)));
  D.addEventListener('lexitron:idk',e=>render(valFor(e?.detail?.word)));

  if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',()=>render(0),{once:true});
  else render(0);

  W.HalfStars={render};
})();
