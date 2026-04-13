(function () {
  var API_BASE = "/api";

  function safeText(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getKey() {
    return "study-comments::" + window.location.pathname;
  }

  function getQuestionPath() {
    return window.location.pathname.replace(/^\/+/, "");
  }

  function loadComments() {
    try {
      var raw = localStorage.getItem(getKey());
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveComments(comments) {
    localStorage.setItem(getKey(), JSON.stringify(comments));
  }

  async function fetchOnlineComments(questionPath) {
    var res = await fetch(
      API_BASE + "/comments?question=" + encodeURIComponent(questionPath),
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
    );
    if (!res.ok) {
      throw new Error("online_fetch_failed");
    }
    var data = await res.json();
    return Array.isArray(data.comments) ? data.comments : [];
  }

  async function postOnlineComment(payload) {
    var res = await fetch(API_BASE + "/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("online_post_failed");
    }

    var data = await res.json();
    return data.comment;
  }

  function renderComments(target, comments) {
    if (!comments.length) {
      target.innerHTML =
        '<li class="comment-item">Zatim zadne komentare. Bud prvni.</li>';
      return;
    }

    target.innerHTML = comments
      .map(function (c, idx) {
        var nick = safeText(c.nick || "Anonym");
        var email = safeText(c.email || "bez emailu");
        var kind = safeText(c.kind || "jine");
        var date = safeText(c.createdAt || c.date || "");
        var message = safeText(c.message || "");
        return (
          "" +
          '<li class="comment-item">' +
          '<div class="comment-meta">#' +
          (idx + 1) +
          " | " +
          kind +
          " | " +
          nick +
          " (" +
          email +
          ") | " +
          date +
          "</div>" +
          "<div>" +
          message +
          "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  function buildToolbar(anchor) {
    var toolbar = document.createElement("section");
    toolbar.className = "study-toolbar";
    toolbar.innerHTML =
      "" +
      '<div class="left">' +
      '<span class="study-badge">Uceni 4. rocnik</span>' +
      '<span class="study-note">Tip: pred tiskem pouzij tlacitko Tisk stranky.</span>' +
      "</div>" +
      '<div class="right">' +
      '<span class="study-note" id="study-online-state">Komentare: kontroluji server...</span>' +
      '<button type="button" class="study-btn" id="study-print">Tisk stranky</button>' +
      '<button type="button" class="study-btn" id="study-mark">Oznacit jako prostudovano</button>' +
      "</div>";

    anchor.insertAdjacentElement("afterend", toolbar);

    var markKey = "study-done::" + window.location.pathname;
    var markBtn = toolbar.querySelector("#study-mark");
    var isDone = localStorage.getItem(markKey) === "1";
    if (isDone) {
      markBtn.textContent = "Prostudovano";
    }

    toolbar
      .querySelector("#study-print")
      .addEventListener("click", function () {
        window.print();
      });

    markBtn.addEventListener("click", function () {
      var done = localStorage.getItem(markKey) === "1";
      if (done) {
        localStorage.removeItem(markKey);
        markBtn.textContent = "Oznacit jako prostudovano";
      } else {
        localStorage.setItem(markKey, "1");
        markBtn.textContent = "Prostudovano";
      }
    });
  }

  function getQuizUrl() {
    var p = window.location.pathname;
    var parts = p.split("/");
    var file = parts[parts.length - 1].replace(/\.html$/i, "");
    var folder = parts[parts.length - 2] || "";
    var sub = "pv";
    if (/site/i.test(folder)) sub = "site";
    var back = encodeURIComponent(window.location.href);
    return "../assets/quiz.html?q=" + sub + "/" + file + "&back=" + back;
  }

  function buildQuizButton(anchor) {
    var wrap = document.createElement("div");
    wrap.style.cssText = "text-align:center;margin:30px 0 10px;";
    var btn = document.createElement("a");
    btn.href = getQuizUrl();
    btn.style.cssText =
      "display:inline-block;background:#6366f1;color:#fff;padding:14px 36px;" +
      "border-radius:10px;font-size:1.15rem;font-weight:700;text-decoration:none;" +
      "transition:background 0.15s;box-shadow:0 2px 8px rgba(99,102,241,0.3);";
    btn.textContent = "📝 Procvičit tuto otázku";
    btn.addEventListener("mouseenter", function () {
      btn.style.background = "#4f46e5";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.background = "#6366f1";
    });
    wrap.appendChild(btn);
    anchor.insertAdjacentElement("beforebegin", wrap);
  }

  async function buildComments(anchor) {
    var wrap = document.createElement("section");
    wrap.className = "comment-section";
    wrap.innerHTML =
      "" +
      "<h2>Komentare k otazce</h2>" +
      "<p>Napis, co je spatne, chybi nebo co je potreba upresnit. Pri behu pres backend se komentare sdili online pro celou tridu.</p>" +
      '<form class="comment-form" id="study-comment-form">' +
      '<div class="row">' +
      '<label>Nick<input type="text" name="nick" required maxlength="40"></label>' +
      '<label>Email<input type="email" name="email" maxlength="120" placeholder="nepovinne"></label>' +
      "</div>" +
      "<label>Typ pripominky" +
      '<select name="kind">' +
      '<option value="chyba">Chyba v textu</option>' +
      '<option value="chybi">Neco chybi</option>' +
      '<option value="dotaz">Dotaz</option>' +
      '<option value="jine">Jine</option>' +
      "</select></label>" +
      '<label>Zprava<textarea name="message" required maxlength="2000" placeholder="Sem napis, co je potreba opravit nebo doplnit..."></textarea></label>' +
      '<div class="comment-actions">' +
      '<button type="submit" class="study-btn">Ulozit komentar</button>' +
      '<button type="button" class="study-btn" id="study-mailto">Nahlasit e-mailem</button>' +
      '<button type="button" class="study-btn" id="study-export">Export JSON</button>' +
      "</div>" +
      "</form>" +
      '<ul class="comment-list" id="study-comment-list"></ul>';

    anchor.insertAdjacentElement("afterend", wrap);

    var form = wrap.querySelector("#study-comment-form");
    var list = wrap.querySelector("#study-comment-list");
    var onlineState = document.querySelector("#study-online-state");
    var questionPath = getQuestionPath();
    var comments = [];
    var onlineMode = false;

    try {
      comments = await fetchOnlineComments(questionPath);
      onlineMode = true;
      if (onlineState) {
        onlineState.textContent = "Komentare: online (MySQL)";
      }
      if (comments.length) {
        saveComments(comments);
      }
    } catch (e) {
      comments = loadComments();
      if (onlineState) {
        onlineState.textContent = "Komentare: lokalni rezim";
      }
    }

    renderComments(list, comments);

    form.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      var data = new FormData(form);
      var item = {
        nick: (data.get("nick") || "").toString().trim(),
        email: (data.get("email") || "").toString().trim(),
        kind: (data.get("kind") || "jine").toString(),
        message: (data.get("message") || "").toString().trim(),
        date: new Date().toLocaleString("cs-CZ"),
      };

      if (!item.nick || !item.message) {
        return;
      }

      if (onlineMode) {
        try {
          await postOnlineComment({
            questionPath: questionPath,
            nick: item.nick,
            email: item.email,
            kind: item.kind,
            message: item.message,
          });
          comments = await fetchOnlineComments(questionPath);
          saveComments(comments);
          renderComments(list, comments);
          form.reset();
          return;
        } catch (e) {
          onlineMode = false;
          if (onlineState) {
            onlineState.textContent =
              "Komentare: lokalni rezim (server docasne nedostupny)";
          }
        }
      }

      comments.unshift(item);
      saveComments(comments);
      renderComments(list, comments);
      form.reset();
    });

    wrap.querySelector("#study-mailto").addEventListener("click", function () {
      var data = new FormData(form);
      var nick = (data.get("nick") || "").toString().trim() || "nezadan";
      var email = (data.get("email") || "").toString().trim() || "nezadan";
      var kind = (data.get("kind") || "jine").toString();
      var message = (data.get("message") || "").toString().trim();

      var subject = "Pripominka k otazce: " + window.location.pathname;
      var body = [
        "Otazka: " + window.location.href,
        "Nick: " + nick,
        "Email: " + email,
        "Typ: " + kind,
        "",
        message || "(bez textu)",
      ].join("\n");

      window.location.href =
        "mailto:?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);
    });

    wrap.querySelector("#study-export").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(comments, null, 2)], {
        type: "application/json",
      });
      var a = document.createElement("a");
      var safeName = window.location.pathname
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();
      a.href = URL.createObjectURL(blob);
      a.download = safeName + "_komentare.json";
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(a.href);
      }, 1000);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var path = window.location.pathname.toLowerCase();
    if (!path.endsWith(".html") || path.endsWith("/index.html")) {
      return;
    }

    var nav = document.querySelector("nav");
    var bottomNav = document.querySelectorAll("nav");
    var anchorTop = nav || document.body.firstElementChild;
    var anchorBottom = bottomNav.length
      ? bottomNav[bottomNav.length - 1]
      : null;

    if (anchorTop) {
      buildToolbar(anchorTop);
    }
    if (anchorBottom) {
      buildQuizButton(anchorBottom);
      buildComments(anchorBottom);
    }
  });
})();
