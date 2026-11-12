(function () {
  var S = window.SITE || {};

  // Подвал — одинаковый на всех страницах
  var footer = document.getElementById("site-footer");
  if (footer) {
    var socials = [
      ["telegram", "Telegram"],
      ["discord", "Discord"],
      ["vk", "ВКонтакте"],
      ["youtube", "YouTube"],
    ];
    footer.innerHTML =
      '<div class="wrap footer__inner">' +
        '<div class="footer__social">' + socials.map(function (s) {
          return '<a class="social" data-link="' + s[0] + '" href="#" aria-label="' + s[1] + '" title="' + s[1] + '">' +
            '<img src="img/' + s[0] + '.png" alt="' + s[1] + '"></a>';
        }).join("") + "</div>" +
        '<p class="footer__studio">Проект создан при поддержке <span>HOT STUDIO</span></p>' +
        '<p class="footer__copy">© <span id="year"></span> <span data-site="name">Nobarsk RP</span></p>' +
      "</div>";
  }

  // Тексты из config.js
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var v = S[el.dataset.site];
    if (v) el.textContent = v;
  });
  if (S.name && !document.getElementById("docs")) document.title = S.name;

  // Ссылки: заполненные — работают, пустые — видны, но не нажимаются
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var url = S[el.dataset.link];
    if (url) {
      el.href = url;
      if (/^https?:/.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
    } else {
      el.removeAttribute("href");
      el.classList.add("is-soon");
      el.setAttribute("aria-disabled", "true");
      el.title = "Ссылка появится позже";
    }
  });

  // Кнопка «Скачать лаунчер»
  var dl = document.getElementById("launcherBtn");
  var note = document.getElementById("launcherNote");
  if (dl) {
    if (S.launcher) {
      dl.href = S.launcher;
      dl.setAttribute("download", "");
      note.textContent = S.launcherNote || "";
      if (!S.launcherNote) note.hidden = true;
    } else {
      dl.removeAttribute("href");
      dl.classList.add("is-disabled");
      dl.setAttribute("aria-disabled", "true");
      note.textContent = "Скоро будет доступен";
    }
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
