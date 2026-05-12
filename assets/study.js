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

  function getTopicKey() {
    var p = window.location.pathname;
    var parts = p.split("/");
    var file = (parts[parts.length - 1] || "").replace(/\.html$/i, "");
    var folder = parts[parts.length - 2] || "";
    var sub = "pv";
    if (/site/i.test(folder)) {
      sub = "site";
    } else if (/spv/i.test(folder)) {
      sub = "spv";
    }
    return sub + "/" + file;
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

  function getSubAndFile() {
    var p = window.location.pathname;
    var parts = p.split("/");
    var file = parts[parts.length - 1].replace(/\.html$/i, "");
    var folder = parts[parts.length - 2] || "";
    var sub = "pv";
    if (/site/i.test(folder)) sub = "site";
    if (/spv/i.test(folder)) sub = "spv";
    if (/cs/i.test(folder)) sub = "cs";
    return { sub: sub, file: file };
  }

  function getQuizUrl() {
    var sf = getSubAndFile();
    var back = encodeURIComponent(window.location.href);
    return "../assets/quiz.html?q=" + sf.sub + "/" + sf.file + "&back=" + back;
  }

  function getLiveQuizUrl() {
    var sf = getSubAndFile();
    var back = encodeURIComponent(window.location.href);
    return (
      "../assets/live-quiz.html?q=" + sf.sub + "/" + sf.file + "&back=" + back
    );
  }

  function buildQuizButton(anchor) {
    var isMobile = window.matchMedia("(max-width: 680px)").matches;
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:30px 0 10px;";

    function makeBtn(href, icon, label, bg, hoverBg) {
      var btn = document.createElement("a");
      btn.href = href;
      btn.style.cssText =
        "display:inline-block;background:" +
        bg +
        ";color:#fff;" +
        "padding:" +
        (isMobile ? "11px 18px" : "14px 28px") +
        ";" +
        "border-radius:10px;font-size:" +
        (isMobile ? "1rem" : "1.1rem") +
        ";" +
        "font-weight:700;text-decoration:none;" +
        "transition:background 0.15s;box-shadow:0 2px 8px rgba(0,0,0,0.15);";
      btn.textContent = icon + " " + label;
      btn.addEventListener("mouseenter", function () {
        btn.style.background = hoverBg;
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.background = bg;
      });
      return btn;
    }

    wrap.appendChild(
      makeBtn(
        getQuizUrl(),
        "📝",
        "Procvičit (předpřipravené)",
        "#6366f1",
        "#4f46e5",
      ),
    );
    wrap.appendChild(
      makeBtn(
        getLiveQuizUrl(),
        "🤖",
        "AI Procvičování (live)",
        "#0ea5e9",
        "#0284c7",
      ),
    );
    anchor.insertAdjacentElement("beforebegin", wrap);
  }

  function buildVisualAid(anchor) {
    var aids = {
      "pv/01_Sprava_pameti": {
        title: "Rychlý diagram: Stack vs Heap",
        text: "Vizuální rozdělení zásobníku a haldy pro rychlé opakování před testem.",
        image: "memory_stack_heap.svg",
      },
      "pv/02_Grafy_razeni": {
        title: "Rychlý diagram: Řazení a složitost",
        text: "Přehled typických složitostí algoritmů řazení.",
        image: "sorting_big_o.svg",
      },
      "pv/03_Rekurze_bruteforce": {
        title: "Rychlý diagram: Rekurzivní strom",
        text: "Jak se větví volání při rekurzi.",
        image: "recursion_tree.svg",
      },
      "pv/04_Lambda_delegaty": {
        title: "Rychlý diagram: Lambda a delegate",
        text: "Jednoduchý tok volání metody přes delegát.",
        image: "lambda_delegate_flow.svg",
      },
      "pv/09_Integrita_bezpecnost": {
        title: "Rychlý diagram: CIA triáda",
        text: "Confidentiality, Integrity, Availability v jednom obrázku.",
        image: "security_cia.svg",
      },
      "pv/10_Databaze": {
        title: "Rychlý diagram: Normalizace databáze",
        text: "Přehled 1NF/2NF/3NF v jedné infografice.",
        image: "sql_normalization.svg",
      },
      "pv/14_OOP_principy": {
        title: "Rychlý diagram: OOP principy",
        text: "4 základní pilíře OOP a jejich vztah.",
        image: "oop_principles.svg",
      },
      "pv/22_Vlakna_paralelismus": {
        title: "Rychlý diagram: Stavový cyklus vlákna",
        text: "Od vytvoření až po ukončení vlákna.",
        image: "thread_lifecycle.svg",
      },
      "pv/25_Textove_zpracovani": {
        title: "Rychlý diagram: Regex pipeline",
        text: "Text -> pattern -> match -> capture groups.",
        image: "regex_pipeline.svg",
      },
      "site/10_OSI2_VLAN": {
        title: "Rychlý diagram: VLAN trunk/access",
        text: "Rozdíl mezi access a trunk portem.",
        image: "vlan_trunk.svg",
      },
      "site/11_OSI3_IPv4": {
        title: "Rychlý diagram: IPv4 subnetting",
        text: "Rychlá vizualizace dělení sítě na podsítě.",
        image: "ipv4_subnet.svg",
      },
      "site/12_OSI3_IPv6": {
        title: "Rychlý diagram: OSI vrstvy",
        text: "Rychlá orientace v OSI modelu před ústním zkoušením.",
        image: "osi_layers.svg",
      },
      "site/15_OSI4_transportni_vrstva": {
        title: "Rychlý diagram: TCP handshake",
        text: "SYN -> SYN+ACK -> ACK. Nejčastější otázka u transportní vrstvy.",
        image: "tcp_handshake.svg",
      },
      "site/19_DNS": {
        title: "Rychlý diagram: DNS resolution",
        text: "Cesta dotazu od klienta až po autoritativní DNS server.",
        image: "dns_resolution.svg",
      },
      "site/20_Firewall": {
        title: "Rychlý diagram: Firewall zóny",
        text: "Rozdělení WAN/DMZ/LAN a tok pravidel.",
        image: "firewall_zones.svg",
      },
    };

    var key = getTopicKey();
    var aid = aids[key];
    if (!aid) {
      return;
    }

    var section = document.createElement("section");
    section.className = "visual-aid";
    section.innerHTML =
      "<h2>📌 " +
      safeText(aid.title) +
      "</h2>" +
      "<p>" +
      safeText(aid.text) +
      "</p>" +
      "<figure>" +
      '<a href="../assets/diagrams/' +
      safeText(aid.image) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<img src="../assets/diagrams/' +
      safeText(aid.image) +
      '" alt="Studijni diagram"></a>' +
      "<figcaption>Kliknutím otevřeš diagram ve větší velikosti.</figcaption>" +
      "</figure>";

    anchor.insertAdjacentElement("afterend", section);
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

  /* ── AI explain on text selection ── */
  function buildExplainFeature() {
    // --- side panel ---
    var panel = document.createElement("div");
    panel.id = "explain-panel";
    panel.innerHTML =
      '<div class="explain-panel-header">' +
      '<span class="explain-panel-title">🤖 AI Vysvětlení</span>' +
      '<button type="button" class="explain-panel-close" id="explain-close" aria-label="Zavřít">✕</button>' +
      "</div>" +
      '<div class="explain-panel-body" id="explain-body">' +
      '<p class="explain-placeholder">Vyber text na stránce a klikni na 💡 Vysvětlit.</p>' +
      "</div>";
    document.body.appendChild(panel);

    panel.querySelector("#explain-close").addEventListener("click", function () {
      panel.classList.remove("open");
      tooltip.classList.remove("visible");
    });

    // --- floating tooltip ---
    var tooltip = document.createElement("div");
    tooltip.id = "explain-tooltip";
    tooltip.innerHTML = '<button type="button" id="explain-btn">💡 Vysvětlit</button>';
    document.body.appendChild(tooltip);

    var lastSelection = "";

    document.addEventListener("mouseup", function (e) {
      // ignore clicks inside the panel or tooltip
      if (panel.contains(e.target) || tooltip.contains(e.target)) return;

      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : "";

      if (text.length < 3) {
        tooltip.classList.remove("visible");
        return;
      }

      lastSelection = text;

      // position tooltip near the end of selection
      var range = sel.getRangeAt(0);
      var rect = range.getBoundingClientRect();
      var scrollY = window.scrollY || document.documentElement.scrollTop;
      var scrollX = window.scrollX || document.documentElement.scrollLeft;

      var top = rect.bottom + scrollY + 6;
      var left = rect.left + scrollX + rect.width / 2;

      tooltip.style.top = top + "px";
      tooltip.style.left = left + "px";
      tooltip.classList.add("visible");
    });

    // hide tooltip when clicking elsewhere
    document.addEventListener("mousedown", function (e) {
      if (!tooltip.contains(e.target) && !panel.contains(e.target)) {
        tooltip.classList.remove("visible");
      }
    });

    tooltip.querySelector("#explain-btn").addEventListener("click", function () {
      tooltip.classList.remove("visible");
      panel.classList.add("open");

      var body = document.getElementById("explain-body");
      body.innerHTML = '<div class="explain-loading">⏳ ChatGPT přemýšlí…</div>';

      var pageTitle = (document.querySelector("h1") || document.querySelector("title") || { textContent: document.title }).textContent.trim();

      fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: lastSelection.slice(0, 1500),
          pageTitle: pageTitle.slice(0, 200),
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) throw new Error(data.error);
          var exp = data.explanation || "";
          body.innerHTML =
            '<div class="explain-query">' +
            '<strong>Vybraný text:</strong><br>' +
            '<em class="explain-quote">' + safeText(lastSelection.slice(0, 200)) + (lastSelection.length > 200 ? "…" : "") + "</em>" +
            "</div>" +
            '<div class="explain-answer">' + formatExplanation(exp) + "</div>" +
            '<button type="button" class="explain-more-btn" id="explain-more">🔁 Vysvětlit jinak</button>';

          document.getElementById("explain-more").addEventListener("click", function () {
            body.innerHTML = '<div class="explain-loading">⏳ Hledám jiné vysvětlení…</div>';
            fetch("/api/explain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: lastSelection.slice(0, 1500),
                pageTitle: pageTitle.slice(0, 200),
                rephrase: true,
              }),
            })
              .then(function (r) { return r.json(); })
              .then(function (d) {
                if (d.error) throw new Error(d.error);
                body.innerHTML =
                  '<div class="explain-query"><strong>Vybraný text:</strong><br><em class="explain-quote">' +
                  safeText(lastSelection.slice(0, 200)) + "</em></div>" +
                  '<div class="explain-answer">' + formatExplanation(d.explanation || "") + "</div>";
              })
              .catch(function () {
                body.innerHTML = '<div class="explain-error">Chyba při komunikaci s AI. Zkus to znovu.</div>';
              });
          });
        })
        .catch(function () {
          body.innerHTML = '<div class="explain-error">Chyba při komunikaci s AI. Zkus to znovu.</div>';
        });
    });
  }

  function formatExplanation(text) {
    // Basic markdown-ish: **bold**, newlines -> paragraphs
    var safe = safeText(text);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:3px;font-size:.9em">$1</code>');
    var paras = safe.split(/\n{2,}/);
    return paras.map(function (p) {
      var trimmed = p.trim();
      if (!trimmed) return "";
      return "<p>" + trimmed.replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var path = window.location.pathname.toLowerCase();
    if (!path.endsWith(".html") || path.endsWith("/index.html")) {
      return;
    }

    var nav = document.querySelector("nav");
    var bottomNav = document.querySelectorAll("nav");
    var anchorTop = nav || document.body.firstElementChild;
    var h1 = document.querySelector("h1");
    var anchorBottom = bottomNav.length
      ? bottomNav[bottomNav.length - 1]
      : null;

    if (anchorTop) {
      buildToolbar(anchorTop);
    }
    if (h1) {
      buildVisualAid(h1);
    }
    if (anchorBottom) {
      buildQuizButton(anchorBottom);
      buildComments(anchorBottom);
    }
    buildExplainFeature();
  });
})();
