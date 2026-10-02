<script>
/* =====================================================================
   TONIOLI — ORDER BUMP RESTYLER v1.2 (standalone — keep the script tags)
   FIX vs v1.1: v1.1 only looked for <p> tags when moving the description
   text — if the funnel renders it as a div/span, it was never moved NOR
   hidden, so it stayed below the image. v1.2 is tag-agnostic: everything
   inside the bump that is NOT the headline row, NOT the product photo,
   and NOT our own layout gets copied into the text column and hidden.
   The headline row (arrow + checkbox + title) is excluded categorically.
   ===================================================================== */
(function () {
  'use strict';
  if (window.__tonioliBumpRestyler) { console.warn('[tonioli-bump] duplicate embed skipped \u2014 keep exactly ONE copy on the page'); return; }
  if (window.__tonioliBumpV1 || window.__tonioliBumpV2) {
    console.warn('[tonioli-bump] an older bump restyler is still embedded \u2014 REPLACE the old script in the custom-code element with this one; do not run both.');
    return;
  }
  window.__tonioliBumpRestyler = true;

  var booted = false;
  function safeBoot(){
    if (booted) return;
    booted = true;
    try { run(); } catch (e) { console.error('[tonioli-bump] startup error:', e); }
  }

  function run(){
    /* CONFIG — flip DEBUG to false once verified */
    var DEBUG       = true;
    var MOVE_PRICE  = true;   /* false = leave "Only $18.95" in the headline row */
    var IMG_DESKTOP = 110;    /* px — product photo width on desktop */
    var IMG_MOBILE  = 80;     /* px — product photo width on phones */
    var MARKER      = 'tonioli-bump-v12';

    var timer = null, inventoried = false, warnedNoImg = false, warnedBareText = false;

    function log(){ if (DEBUG && window.console) console.log.apply(console, ['[tonioli-bump]'].concat([].slice.call(arguments))); }
    function hideEl(el){ el.setAttribute('data-tonioli-hide', '1'); }
    function hasClass(el, c){ return !!(el.classList && el.classList.contains(c)); }
    function isHeadlineRow(el){ return hasClass(el, 'main-section') || hasClass(el, 'bump-header'); }
    function isSkippable(el){ var t = el.tagName; return t === 'SCRIPT' || t === 'STYLE' || t === 'LINK' || t === 'NOSCRIPT'; }

    function teardown(bump){
      var cols = bump.querySelectorAll('.tonioli-bump-cols');
      for (var i = 0; i < cols.length; i++) if (cols[i].parentNode) cols[i].parentNode.removeChild(cols[i]);
      var hid = bump.querySelectorAll('[data-tonioli-hide]');
      for (var j = 0; j < hid.length; j++) hid[j].removeAttribute('data-tonioli-hide');
    }

    /* product photo = img.bump-image, else first image outside the headline
       row and outside our columns. NEVER the arrow. */
    function pickProductImage(bump){
      var imgs = bump.querySelectorAll('img'), first = null;
      for (var i = 0; i < imgs.length; i++){
        var im = imgs[i];
        if (im.closest('.main-section, .bump-header, .tonioli-bump-cols')) continue;
        if (hasClass(im, 'bump-image')) return im;
        if (!first) first = im;
      }
      return first;
    }

    function sameImg(a, b){
      if (!a || !b) return false;
      var sa = a.getAttribute('src') || '', sb = b.getAttribute('src') || '';
      return !!(sa && sa === sb);
    }

    /* one-time map of the bump's direct children — if anything is still
       off after v1.2, paste these lines back and I'll pin it exactly */
    function inventory(bump, idx){
      var out = ['bump ' + idx + ' direct children:'];
      for (var i = 0; i < bump.childNodes.length; i++){
        var n = bump.childNodes[i];
        if (n.nodeType === 3){ if ((n.nodeValue || '').trim()) out.push('  #' + i + ' BARE TEXT "' + n.nodeValue.trim().slice(0, 50) + '"'); continue; }
        if (n.nodeType !== 1) continue;
        var cls = (typeof n.className === 'string' && n.className.trim()) ? '.' + n.className.trim().split(/\s+/).join('.') : '';
        out.push('  #' + i + ' ' + n.tagName + cls);
      }
      console.log('[tonioli-bump] ' + out.join('\n'));
    }

    function build(bump, idx){
      if (DEBUG && !inventoried){ inventoried = true; inventory(bump, idx); }

      var img = pickProductImage(bump);
      if (!img){
        if (DEBUG && !warnedNoImg){
          warnedNoImg = true;
          console.warn('[tonioli-bump] no product image found outside the headline row \u2014 full bump HTML follows; send me these lines:');
          console.warn('[tonioli-bump] ' + bump.outerHTML.replace(/\s+/g, ' ').slice(0, 1200));
        }
        return;
      }

      var mainSection = bump.querySelector('.main-section');
      var price = MOVE_PRICE ? bump.querySelector('.oto-headline') : null;

      var cols   = document.createElement('div'); cols.className   = 'tonioli-bump-cols ' + MARKER;
      var colImg = document.createElement('div'); colImg.className = 'tonioli-bump-imgcol';
      var colTxt = document.createElement('div'); colTxt.className = 'tonioli-bump-txtcol';

      colImg.appendChild(img.cloneNode(false));
      hideEl(img);
      if (price){ colTxt.appendChild(price.cloneNode(true)); hideEl(price); }

      /* sweep EVERYTHING else into the text column — any tag, direct or
         nested, as long as it isn't headline row / photo / our layout */
      for (var i = 0; i < bump.childNodes.length; i++){
        var n = bump.childNodes[i];
        if (n.nodeType === 3){
          if ((n.nodeValue || '').trim() && DEBUG && !warnedBareText){
            warnedBareText = true;
            console.warn('[tonioli-bump] found bare text outside any tag \u2014 send me this line: "' + n.nodeValue.trim().slice(0, 60) + '"');
          }
          continue;
        }
        if (n.nodeType !== 1) continue;
        if (isHeadlineRow(n) || hasClass(n, 'tonioli-bump-cols') || n === img || isSkippable(n)) continue;

        var clone = n.cloneNode(true);
        /* strip the product photo out of the clone (block may wrap it) */
        var cimgs = clone.querySelectorAll('img');
        for (var c = 0; c < cimgs.length; c++){
          if (sameImg(cimgs[c], img) || hasClass(cimgs[c], 'bump-image')){
            if (cimgs[c].parentNode) cimgs[c].parentNode.removeChild(cimgs[c]);
          }
        }
        /* strip the price out of the clone — it already sits at the top
           of the text column */
        if (price){
          var cotos = clone.querySelectorAll('.oto-headline');
          for (var o = 0; o < cotos.length; o++) if (cotos[o].parentNode) cotos[o].parentNode.removeChild(cotos[o]);
        }
        colTxt.appendChild(clone);
        hideEl(n);
      }

      cols.appendChild(colImg);
      cols.appendChild(colTxt);
      if (mainSection) mainSection.insertAdjacentElement('afterend', cols); else bump.appendChild(cols);
      log('bump ' + idx + ' restyled \u2014 photo left, price + ALL text right');
    }

    /* our layout already exists — re-hide anything a re-render revived */
    function maintain(bump){
      var img = pickProductImage(bump);
      if (img && !img.hasAttribute('data-tonioli-hide')) hideEl(img);

      for (var i = 0; i < bump.childNodes.length; i++){
        var n = bump.childNodes[i];
        if (n.nodeType !== 1) continue;
        if (isHeadlineRow(n) || hasClass(n, 'tonioli-bump-cols') || n === img || isSkippable(n)) continue;
        if (!n.hasAttribute('data-tonioli-hide')) hideEl(n);
      }
      if (MOVE_PRICE){
        var otos = bump.querySelectorAll('.oto-headline');
        for (var o = 0; o < otos.length; o++)
          if (!otos[o].closest('.tonioli-bump-cols') && !otos[o].hasAttribute('data-tonioli-hide')) hideEl(otos[o]);
      }
      /* safety net: nothing in the headline row may stay hidden
         (except the price when MOVE_PRICE) */
      var headHid = bump.querySelectorAll('.main-section [data-tonioli-hide], .bump-header [data-tonioli-hide]');
      for (var h = 0; h < headHid.length; h++){
        if (MOVE_PRICE && hasClass(headHid[h], 'oto-headline')) continue;
        headHid[h].removeAttribute('data-tonioli-hide');
      }
    }

    function restyle(bump, idx){
      var existing = bump.querySelector('.tonioli-bump-cols');
      if (existing){
        if (hasClass(existing, MARKER)) { maintain(bump); return; }
        teardown(bump);   /* v1.0 / v1.1 output — clean it up, rebuild */
      }
      build(bump, idx);
    }

    function tick(){
      var bumps = document.querySelectorAll('.order-bump-container');
      for (var i = 0; i < bumps.length; i++) restyle(bumps[i], i + 1);
    }

    function schedule(){
      if (timer) return;
      timer = setTimeout(function () { timer = null; try { tick(); } catch (e) { console.error('[tonioli-bump]', e); } }, 150);
    }

    if (!document.getElementById('tonioli-bump-style')){
      var st = document.createElement('style');
      st.id = 'tonioli-bump-style';
      st.textContent =
        '.tonioli-bump-cols{display:flex;gap:12px;margin-top:10px;align-items:flex-start;}' +
        '.tonioli-bump-imgcol{flex:0 0 ' + IMG_DESKTOP + 'px;width:' + IMG_DESKTOP + 'px;}' +
        '.tonioli-bump-imgcol img{width:100%!important;max-width:100%!important;height:auto!important;display:block;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.18);}' +
        '.tonioli-bump-txtcol{flex:1 1 auto;min-width:0;}' +
        '.tonioli-bump-txtcol .oto-headline{display:block;margin:0 0 2px;}' +
        '.tonioli-bump-txtcol p{margin:2px 0 0!important;font-size:13px;line-height:1.5;}' +
        '[data-tonioli-hide]{display:none!important;}' +
        '@media(max-width:600px){.tonioli-bump-imgcol{flex-basis:' + IMG_MOBILE + 'px;width:' + IMG_MOBILE + 'px;}.tonioli-bump-cols{gap:10px;}}';
      document.head.appendChild(st);
    }

    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    setInterval(schedule, 1500);

    window.__tonioliBump = { version: '1.2.0', tick: tick };
    log('bump restyler v1.2 running \u2014 waiting for step 2.');
    schedule();
  }

  /* Boot ONLY after the funnel app is fully up. Safety net at 5s. */
  if (document.readyState === 'complete') safeBoot();
  else {
    window.addEventListener('load', safeBoot);
    setTimeout(safeBoot, 5000);
  }
})();
</script>
