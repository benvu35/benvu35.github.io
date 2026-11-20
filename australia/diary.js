(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var entries = Array.prototype.slice.call(document.querySelectorAll('.entry'));

  // Build the entry rail
  var rail = document.getElementById('rail');
  var links = entries.map(function (el, i) {
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + el.id;
    a.innerHTML = '<span class="dot">' + (i + 1) + '</span><span class="label"></span>';
    a.querySelector('.label').textContent = el.dataset.title;
    a.setAttribute('aria-label', (i + 1) + '. ' + el.dataset.title);
    li.appendChild(a); rail.appendChild(li);
    return a;
  });

  // Reveal on scroll
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if (reduce) { pending.forEach(function (el) { el.classList.add('in'); }); pending = []; }
  function reveal() {
    var limit = window.innerHeight * 0.92;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); countUp(el); return false; }
      return true;
    });
  }

  // Count-up numbers
  function countUp(root) {
    if (reduce) return;
    root.querySelectorAll('[data-count]').forEach(function (n) {
      var target = +n.dataset.count, start = null, dur = 1400, year = target > 1000 && target < 2100;
      function step(t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
        var v = Math.round((year ? 1700 + (target - 1700) * e : target * e));
        n.textContent = year ? v : v.toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  // Progress bar, rail state, hero parallax
  var bar = document.getElementById('bar');
  var railWrap = document.querySelector('.rail');
  var heroBg = document.querySelector('.hero-bg');
  var hero = document.querySelector('.hero');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    railWrap.classList.toggle('on', y > hero.offsetHeight * 0.6);
    if (!reduce && y < hero.offsetHeight) heroBg.style.transform = 'translateY(' + (y * 0.3) + 'px) scale(1.05)';
    var mid = window.innerHeight * 0.4, current = -1;
    entries.forEach(function (el, i) { if (el.getBoundingClientRect().top < mid) current = i; });
    links.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      a.classList.toggle('done', i < current);
      if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    reveal();
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Lightbox
  var figs = Array.prototype.slice.call(document.querySelectorAll('.gallery figure'));
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img'), lbCap = document.getElementById('lb-cap');
  var idx = 0, lastFocus = null;
  function show(i) {
    idx = (i + figs.length) % figs.length;
    var img = figs[idx].querySelector('img'), cap = figs[idx].querySelector('figcaption');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lbCap.innerHTML = cap ? cap.innerHTML : '';
  }
  function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.lb-close').focus(); }
  function close() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  figs.forEach(function (f, i) {
    var img = f.querySelector('img');
    img.tabIndex = 0; img.setAttribute('role', 'button');
    img.addEventListener('click', function () { open(i); });
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); sx = null;
  });
})();
