// Отрисовка разделов правил и законов из rules-data.js / laws-data.js.
// Каждый раздел — отдельная «страница»: адрес вида rules.html#pp, laws.html#uk.
(function () {
  var root = window.DOCS;
  var mount = document.getElementById("docs");
  if (!root || !mount) return;

  // Индекс: id -> { node, parent }
  var index = {};
  (function walk(node, parent) {
    index[node.id] = { node: node, parent: parent };
    (node.children || []).forEach(function (c) { walk(c, node); });
  })(root, null);

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // Иконка раздела: если в данных задан root.iconImg — везде одна картинка
  function ico(node, fallback) {
    if (root.iconImg) return '<img class="book-ico" src="' + esc(root.iconImg) + '" alt="">';
    return node.icon || fallback || "";
  }

  // Закрытый раздел (locked: true) — виден в списке с замком, но не открывается
  function isLocked(node) { return !!node.locked; }

  function trail(node) {
    var out = [];
    var p = index[node.id].parent;
    while (p) { out.unshift(p); p = index[p.id].parent; }
    return out;
  }

  function head(node) {
    var t = trail(node);
    var parent = t[t.length - 1];
    var html = '<section class="page-head' + (node.items ? " page-head--doc" : "") + '"><div class="wrap">';
    if (parent) {
      html += '<a class="back" href="#' + esc(parent === root ? "" : parent.id) + '">← Назад: ' + esc(parent.title) + "</a>";
      html += '<p class="eyebrow crumbs">' + t.map(function (n) {
        return '<a href="#' + esc(n === root ? "" : n.id) + '">' + esc(n.short || n.title) + "</a>";
      }).join(" · ") + "</p>";
    } else if (node.eyebrow) {
      html += '<p class="eyebrow">' + esc(node.eyebrow) + "</p>";
    }
    // У документа заголовок рисуется внутри листа, шапка остаётся компактной
    if (node.items || node.src) return html + "</div></section>";
    html += "<h1>" + (parent ? '<span class="h-icon">' + ico(node) + "</span>" : "") + esc(node.title) + "</h1>";
    if (node.lead) html += '<p class="muted">' + esc(node.lead) + "</p>";
    return html + "</div></section>";
  }

  function intro(node) {
    if (!node.intro) return "";
    return '<div class="intro"><span class="intro__icon">' + ico(node, "ℹ️") + '</span><div><h2>' +
      esc(node.introTitle || "Для чего это нужно") + "</h2><p>" + esc(node.intro) + "</p></div></div>";
  }

  function cards(node) {
    var top = node === root;
    return '<div class="doc-cards' + (top ? " doc-cards--top" : "") + '">' + node.children.map(function (c) {
      var preview = "";
      if (top && c.children) {
        var names = c.children.map(function (x) { return { t: x.title, l: isLocked(x) }; });
        var shown = names.slice(0, 4);
        preview = '<ul class="doc-card__list">' + shown.map(function (n) { return "<li>" + (n.l ? '<img class="lock-ico" src="img/lock.png" alt="">' : "") + esc(n.t) + "</li>"; }).join("") +
          (names.length > shown.length ? '<li class="more">и ещё ' + (names.length - shown.length) + "…</li>" : "") + "</ul>";
      } else if (top && c.lead) {
        preview = '<p class="doc-card__lead">' + esc(c.lead) + "</p>";
      }
      if (isLocked(c)) {
        return '<div class="doc-card is-locked" aria-disabled="true" title="Раздел закрыт"><span class="doc-card__icon">' + ico(c, "📄") +
          '</span><span class="doc-card__lock" aria-hidden="true"><img class="lock-ico" src="img/lock.png" alt=""></span><span class="doc-card__title">' + esc(c.title) + "</span>" + preview +
          '<span class="doc-card__go">Раздел закрыт</span></div>';
      }
      return '<a class="doc-card" href="#' + esc(c.id) + '"><span class="doc-card__icon">' + ico(c, "📄") +
        '</span><span class="doc-card__title">' + esc(c.title) + "</span>" + preview +
        '<span class="doc-card__go">Открыть раздел →</span></a>';
    }).join("") + "</div>";
  }

  function punish(p) {
    return p ? ' <span class="punish">[' + esc(p) + "]</span>" : "";
  }

  // «Глава 1. Основные» -> цветное «ГЛАВА 1.» + название
  function chapter(text) {
    var m = /^((?:Глава|Раздел|Часть)\s+[\dIVXLC]+\.?)\s*(.*)$/i.exec(text);
    var label = m ? m[1] : "", rest = m ? m[2] : text;
    if (label && !/\.$/.test(label)) label += ".";
    return '<h2 class="chapter">' + (label ? '<span>' + esc(label.toUpperCase()) + "</span> " : "") + esc(rest) + "</h2>";
  }

  // Лист документа в стиле форума.
  // Пункт: { n, title, text?, punish?, sub?: [{n, text, punish?}], note? }
  // Заголовок главы: { h: "Глава 1. ..." }
  // text: "" (пустая строка) — показывается как «Текст пока не добавлен».
  function sheet(node) {
    var empty = node.emptyText || "Текст пока не добавлен.";
    var html = '<article class="sheet"><header class="sheet__head">' +
      (node.sheetImg ? '<img class="sheet__emblem" src="' + esc(node.sheetImg) + '" alt=""' +
        (root.iconImg ? ' data-fallback="' + esc(root.iconImg) + '" onerror="this.onerror=null;this.className=\'sheet__book\';this.src=this.dataset.fallback"' : "") + '>' :root.iconImg ? '<img class="sheet__book" src="' + esc(root.iconImg) + '" alt="">' : '<div class="sheet__logo" aria-hidden="true">NR</div>') +
      "<h1>" + esc(node.title) + "</h1>" +
      (node.lead ? '<p class="sheet__lead">' + esc(node.lead) + "</p>" : "") + "</header>";
    var hasChapters = node.items.some(function (it) { return it.h; });
    if (!hasChapters && node.itemsTitle) html += chapter(node.itemsTitle);
    var heads = node.items.filter(function (it) { return it.h; });
    // Оглавление для больших документов
    if (heads.length > 2) {
      html += '<details class="toc-box"><summary>Содержание (' + heads.length + ')</summary><ol>' +
        heads.map(function (h, i) { return '<li><button type="button" data-goto="' + i + '">' + esc(h.h) + "</button></li>"; }).join("") +
        "</ol></details>";
    }
    var hi = 0;
    node.items.forEach(function (it) {
      if (it.h) { html += chapter(it.h).replace('<h2 class="chapter"', '<h2 class="chapter" data-ch="' + (hi++) + '"'); return; }
      if (it.p) { html += '<p class="clause__para">' + esc(it.p) + "</p>"; return; }
      var id = (node.id + "-" + it.n).replace(/[\s.]+/g, "-");
      var num = /\.$/.test(it.n) ? it.n : it.n + ".";
      var line = "<b>" + esc(num) + "</b> " + esc(it.title);
      var block = node.textBlock && it.text;
      if (block || (node.textBlock && it.sub)) line = '<b class="clause__head">' + esc(num) + " " + esc(it.title) + "</b>";
      else if (it.text) line += (it.title ? (/[.:!?]$/.test(it.title) ? " " : ". ") : "") + esc(it.text);
      line += punish(it.punish);
      html += '<div class="clause' + (node.textBlock ? " clause--block" : "") + '" id="' + esc(id) + '"><p>' + line + "</p>";
      if (block) html += '<p class="clause__text">' + esc(it.text) + "</p>";
      if (it.text === "") html += '<p class="clause__empty">' + esc(empty) + "</p>";
      (it.sub || []).forEach(function (s) {
        var sn = s.n === "" || s.n == null ? "" : (s.n === "•" || /[.)]$/.test(s.n) ? s.n : s.n + ".");
        var cls = "clause__sub" + (s.lvl ? " clause__sub--l" + s.lvl : "") + (sn ? "" : " clause__sub--plain");
        html += '<p class="' + cls + '">' + (sn ? "<b>" + esc(sn) + "</b> " : "") + esc(s.text) + punish(s.punish) + "</p>";
      });
      if (it.note) html += '<p class="clause__note">' + esc(it.note) + "</p>";
      html += "</div>";
    });
    return html + "</article>";
  }

  function siblings(node) {
    var p = index[node.id].parent;
    if (!p || p === root) return "";
    var list = p.children.filter(function (c) { return !isLocked(c); }), i = list.indexOf(node);
    var prev = list[i - 1], next = list[i + 1];
    if (!prev && !next) return "";
    return '<nav class="pager">' +
      (prev ? '<a href="#' + esc(prev.id) + '"><small>← Предыдущий</small>' + esc(prev.title) + "</a>" : "<span></span>") +
      (next ? '<a class="pager__next" href="#' + esc(next.id) + '"><small>Следующий →</small>' + esc(next.title) + "</a>" : "<span></span>") +
      "</nav>";
  }

  function render() {
    var id = decodeURIComponent(location.hash.slice(1));
    var entry = index[id] || index[root.id];
    var node = entry.node;
    // Закрытый раздел открыть нельзя — показываем родительский список
    if (isLocked(node)) {
      var up = entry.parent || root;
      history.replaceState(null, "", up === root ? location.pathname + location.search : "#" + up.id);
      node = up;
    }
    if (node.src && !node.items && !node.loading) {
      node.loading = true;
      // Подключаем файл как <script> — работает и на сайте, и при открытии с диска (file://)
      var done = function (ok) {
        var data = (window.LAW_DATA || {})[node.id];
        node.items = ok && data ? data.items || [] : [];
        if (!ok || !data) node.loadError = true;
        node.loading = false;
        if (decodeURIComponent(location.hash.slice(1)) === node.id) render();
      };
      var sc = document.createElement("script");
      sc.src = node.src;
      sc.onload = function () { done(true); };
      sc.onerror = function () { done(false); };
      document.head.appendChild(sc);
    }
    var body = intro(node);
    if (node.children) body += cards(node);
    if (node.items) body += sheet(node);
    else if (node.src) body += '<article class="sheet sheet--loading"><p>Загрузка текста…</p></article>';
    if (node.loadError) body += '<p class="clause__empty">Не удалось загрузить текст. Обновите страницу.</p>';
    // Повторная попытка при следующем открытии
    if (node.loadError) { node.items = null; node.loadError = false; }
    body += siblings(node);
    mount.innerHTML = head(node) + '<section class="section doc-body' + (node.items || node.src ? " doc-body--doc" : "") + '"><div class="wrap">' + body + "</div></section>";
    document.title = (node === root ? "" : node.title + " — ") + (root.pageTitle || root.title) + " — " + ((window.SITE && window.SITE.name) || "");
    window.scrollTo(0, 0);
  }

  // Переход по оглавлению (без смены адреса — он занят под разделы)
  mount.addEventListener("click", function (e) {
    var b = e.target.closest("[data-goto]");
    if (!b) return;
    var h = mount.querySelector('[data-ch="' + b.getAttribute("data-goto") + '"]');
    if (h) h.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("hashchange", render);
  render();
})();
