(function () {
  var S = window.SITE || {};

  // Тексты из config.js
  document.querySelectorAll("[data-site]").forEach(function (el) {
    var v = S[el.dataset.site];
    if (v) el.textContent = v;
  });
  if (S.name) document.title = S.name;

  // Ссылки: пустые — скрываем
  document.querySelectorAll("[data-link]").forEach(function (el) {
    var url = S[el.dataset.link];
    if (url) {
      el.href = url;
      if (/^https?:/.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
    } else {
      el.hidden = true;
    }
  });

  // Копирование адреса сервера
  var btn = document.getElementById("copyIp");
  var hint = document.getElementById("copyHint");
  btn.addEventListener("click", function () {
    var ip = S.serverIp || "";
    var done = function () {
      btn.classList.add("is-copied");
      hint.textContent = "Скопировано!";
      setTimeout(function () {
        btn.classList.remove("is-copied");
        hint.textContent = "Нажми, чтобы скопировать";
      }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ip).then(done, done);
    } else {
      var t = document.createElement("textarea");
      t.value = ip; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch (e) {}
      t.remove(); done();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
