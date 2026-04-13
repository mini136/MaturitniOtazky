(function () {
  /* ── helpers ── */
  function esc(v) {
    return String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /* ── detect quiz path from page filename ── */
  function quizPath() {
    var p = window.location.pathname;
    var parts = p.split("/");
    var file = parts[parts.length - 1].replace(/\.html$/i, "");
    var folder = parts[parts.length - 2] || "";
    var sub = "pv";
    if (/site/i.test(folder)) sub = "site";
    return "quizzes/" + sub + "/" + file + ".json";
  }

  /* ── load quiz JSON ── */
  async function loadQuiz() {
    var base = document
      .querySelector('script[src*="quiz.js"]')
      .src.replace(/quiz\.js.*/, "");
    var url = base + quizPath();
    var res = await fetch(url);
    if (!res.ok) throw new Error("quiz_not_found");
    return await res.json();
  }

  /* ── MATCH renderer ── */
  function renderMatch(q, qEl) {
    var pairs = q.pairs; // [[left,right],...]
    var lefts = shuffle(
      pairs.map(function (p) {
        return p[0];
      }),
    );
    var rights = shuffle(
      pairs.map(function (p) {
        return p[1];
      }),
    );
    var grid = document.createElement("div");
    grid.className = "match-grid";
    var ulL = document.createElement("ul");
    ulL.className = "match-left";
    var ulR = document.createElement("ul");
    ulR.className = "match-right";
    lefts.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      li.dataset.val = t;
      ulL.appendChild(li);
    });
    rights.forEach(function (t) {
      var li = document.createElement("li");
      li.textContent = t;
      li.dataset.val = t;
      ulR.appendChild(li);
    });
    grid.appendChild(ulL);
    grid.appendChild(ulR);
    qEl.appendChild(grid);

    var selectedL = null;
    var matched = {};
    ulL.addEventListener("click", function (e) {
      var li = e.target.closest("li");
      if (!li || matched[li.dataset.val]) return;
      ulL.querySelectorAll("li").forEach(function (x) {
        x.classList.remove("selected");
      });
      li.classList.add("selected");
      selectedL = li;
    });
    ulR.addEventListener("click", function (e) {
      var li = e.target.closest("li");
      if (!li || !selectedL || matched[selectedL.dataset.val]) return;
      matched[selectedL.dataset.val] = li.dataset.val;
      selectedL.classList.remove("selected");
      selectedL.classList.add("correct");
      li.classList.add("correct");
      selectedL.textContent = selectedL.dataset.val + " ↔ " + li.dataset.val;
      selectedL = null;
    });

    return function evaluate() {
      var score = 0;
      var map = {};
      pairs.forEach(function (p) {
        map[p[0]] = p[1];
      });
      Object.keys(matched).forEach(function (k) {
        var leftLi = ulL.querySelector('[data-val="' + CSS.escape(k) + '"]');
        var rightVal = matched[k];
        var rightLi = ulR.querySelector(
          '[data-val="' + CSS.escape(rightVal) + '"]',
        );
        if (map[k] === rightVal) {
          score++;
          if (leftLi) leftLi.classList.add("correct");
          if (rightLi) rightLi.classList.add("correct");
        } else {
          if (leftLi) {
            leftLi.classList.remove("correct");
            leftLi.classList.add("wrong");
          }
          if (rightLi) {
            rightLi.classList.remove("correct");
            rightLi.classList.add("wrong");
          }
        }
      });
      return { got: score, max: pairs.length };
    };
  }

  /* ── FILL renderer ── */
  function renderFill(q, qEl) {
    var div = document.createElement("div");
    div.className = "fill-text";
    var html = esc(q.text);
    var idx = 0;
    html = html.replace(/\{\{([^}]+)\}\}/g, function () {
      var id = "fill-" + Math.random().toString(36).slice(2, 8);
      idx++;
      return (
        '<input type="text" id="' +
        id +
        '" data-idx="' +
        (idx - 1) +
        '" autocomplete="off" spellcheck="false">'
      );
    });
    div.innerHTML = html;
    qEl.appendChild(div);

    return function evaluate() {
      var inputs = div.querySelectorAll("input");
      var score = 0;
      inputs.forEach(function (inp) {
        var i = parseInt(inp.dataset.idx, 10);
        var expected = norm(q.answers[i]);
        var got = norm(inp.value);
        /* accept if answer contains the key or key contains answer (fuzzy) */
        if (got && (expected.includes(got) || got.includes(expected))) {
          score++;
          inp.classList.add("correct");
          inp.classList.remove("wrong");
        } else {
          inp.classList.add("wrong");
          inp.classList.remove("correct");
          inp.title = "Spravne: " + q.answers[i];
        }
      });
      return { got: score, max: q.answers.length };
    };
  }

  /* ── ORDER renderer ── */
  function renderOrder(q, qEl) {
    var correct = q.items.slice();
    var items = shuffle(correct);
    var ul = document.createElement("ul");
    ul.className = "order-list";

    function rebuild() {
      ul.innerHTML = "";
      items.forEach(function (text, i) {
        var li = document.createElement("li");
        li.dataset.idx = i;
        var span = document.createElement("span");
        span.textContent = text;
        li.appendChild(span);
        var btns = document.createElement("span");
        btns.className = "order-btns";
        if (i > 0) {
          var up = document.createElement("button");
          up.textContent = "▲";
          up.type = "button";
          up.addEventListener("click", function () {
            var t = items[i];
            items[i] = items[i - 1];
            items[i - 1] = t;
            rebuild();
          });
          btns.appendChild(up);
        }
        if (i < items.length - 1) {
          var dn = document.createElement("button");
          dn.textContent = "▼";
          dn.type = "button";
          dn.addEventListener("click", function () {
            var t = items[i];
            items[i] = items[i + 1];
            items[i + 1] = t;
            rebuild();
          });
          btns.appendChild(dn);
        }
        li.appendChild(btns);
        ul.appendChild(li);
      });
    }
    rebuild();
    qEl.appendChild(ul);

    return function evaluate() {
      var score = 0;
      var lis = ul.querySelectorAll("li");
      items.forEach(function (text, i) {
        if (text === correct[i]) {
          score++;
          if (lis[i]) lis[i].classList.add("correct");
        } else {
          if (lis[i]) lis[i].classList.add("wrong");
        }
      });
      return { got: score, max: correct.length };
    };
  }

  /* ── TRUE/FALSE renderer ── */
  function renderTrueFalse(q, qEl) {
    var stmt = document.createElement("div");
    stmt.className = "tf-statement";
    stmt.textContent = q.statement;
    qEl.appendChild(stmt);

    var btns = document.createElement("div");
    btns.className = "tf-buttons";
    var btnTrue = document.createElement("button");
    btnTrue.type = "button";
    btnTrue.textContent = "✅ Pravda";
    var btnFalse = document.createElement("button");
    btnFalse.type = "button";
    btnFalse.textContent = "❌ Nepravda";
    btns.appendChild(btnTrue);
    btns.appendChild(btnFalse);
    qEl.appendChild(btns);

    var chosen = null;
    btnTrue.addEventListener("click", function () {
      chosen = true;
      btnTrue.classList.add("chosen-true");
      btnFalse.classList.remove("chosen-false");
    });
    btnFalse.addEventListener("click", function () {
      chosen = false;
      btnFalse.classList.add("chosen-false");
      btnTrue.classList.remove("chosen-true");
    });

    var label = document.createElement("label");
    label.style.display = "block";
    label.style.marginTop = "8px";
    label.style.fontWeight = "600";
    label.style.fontSize = "0.9rem";
    label.textContent = "Vysvětli proč:";
    qEl.appendChild(label);
    var ta = document.createElement("textarea");
    ta.className = "tf-explain";
    ta.placeholder = "Napište své zdůvodnění...";
    qEl.appendChild(ta);

    return function evaluate() {
      var correct = chosen === q.answer;
      var hasExpl = ta.value.trim().length > 15;
      var pts = 0;
      if (correct) pts++;
      if (hasExpl) pts++;
      var fb = qEl.querySelector(".q-feedback");
      if (!correct) {
        fb.textContent =
          "Spravna odpoved: " +
          (q.answer ? "Pravda" : "Nepravda") +
          ". " +
          q.explanation;
      } else if (!hasExpl) {
        fb.textContent = "Spravne! Ale zkus napsat vysvetleni podrobneji.";
      }
      return { got: pts, max: 2 };
    };
  }

  /* ── OPEN renderer ── */
  function renderOpen(q, qEl) {
    var ta = document.createElement("textarea");
    ta.className = "open-answer";
    ta.placeholder = "Napiš svou odpověď...";
    qEl.appendChild(ta);

    return function evaluate() {
      var text = norm(ta.value);
      var found = 0;
      var missing = [];
      q.keywords.forEach(function (kw) {
        if (text.includes(norm(kw))) {
          found++;
        } else {
          missing.push(kw);
        }
      });
      var fb = qEl.querySelector(".q-feedback");
      if (missing.length) {
        fb.textContent = "Chybi pojmy: " + missing.join(", ");
      }
      return { got: found, max: q.keywords.length };
    };
  }

  /* ── build entire quiz ── */
  function buildQuiz(data, anchor, standalone) {
    var section = document.createElement("section");
    section.className = "quiz-section";
    section.innerHTML =
      "<h2>Procvicovani: " +
      esc(data.title) +
      "</h2>" +
      "<p>Ruznotypove otazky na overeni, ze latce rozumis (ne jen A/B/C/D). Po vyplneni klikni na Vyhodnotit.</p>";

    var evaluators = [];
    var questions = shuffle(data.questions);

    questions.forEach(function (q, idx) {
      var qEl = document.createElement("div");
      qEl.className = "quiz-question";
      var typeLabels = {
        match: "Přiřazování",
        fill: "Doplňování",
        order: "Řazení",
        trueFalse: "Pravda/Nepravda",
        open: "Otevřená",
      };
      qEl.innerHTML =
        '<div class="q-header"><span class="q-num">' +
        (idx + 1) +
        '</span><span class="q-type">' +
        (typeLabels[q.type] || q.type) +
        "</span></div>" +
        '<div class="q-prompt">' +
        esc(q.prompt) +
        "</div>";

      var evalFn;
      switch (q.type) {
        case "match":
          evalFn = renderMatch(q, qEl);
          break;
        case "fill":
          evalFn = renderFill(q, qEl);
          break;
        case "order":
          evalFn = renderOrder(q, qEl);
          break;
        case "trueFalse":
          evalFn = renderTrueFalse(q, qEl);
          break;
        case "open":
          evalFn = renderOpen(q, qEl);
          break;
        default:
          return;
      }

      var fb = document.createElement("div");
      fb.className = "q-feedback";
      qEl.appendChild(fb);
      evaluators.push({ fn: evalFn, fb: fb });
      section.appendChild(qEl);
    });

    var controls = document.createElement("div");
    controls.className = "quiz-controls";
    var btnEval = document.createElement("button");
    btnEval.type = "button";
    btnEval.className = "quiz-btn";
    btnEval.textContent = "Vyhodnotit";
    var btnReset = document.createElement("button");
    btnReset.type = "button";
    btnReset.className = "quiz-btn secondary";
    btnReset.textContent = "Novy pokus";
    var scoreSpan = document.createElement("span");
    scoreSpan.className = "quiz-score";
    controls.appendChild(btnEval);
    controls.appendChild(btnReset);
    controls.appendChild(scoreSpan);
    section.appendChild(controls);

    btnEval.addEventListener("click", function () {
      var total = 0;
      var got = 0;
      evaluators.forEach(function (ev) {
        var r = ev.fn();
        got += r.got;
        total += r.max;
        ev.fb.classList.add("show");
        if (r.got === r.max) {
          ev.fb.classList.add("ok");
          ev.fb.classList.remove("partial", "fail");
          if (!ev.fb.textContent) ev.fb.textContent = "Spravne!";
        } else if (r.got > 0) {
          ev.fb.classList.add("partial");
          ev.fb.classList.remove("ok", "fail");
          if (!ev.fb.textContent)
            ev.fb.textContent =
              "Castecne spravne (" + r.got + "/" + r.max + ")";
        } else {
          ev.fb.classList.add("fail");
          ev.fb.classList.remove("ok", "partial");
          if (!ev.fb.textContent)
            ev.fb.textContent = "Spatne (0/" + r.max + ")";
        }
      });
      var pct = total ? Math.round((got / total) * 100) : 0;
      scoreSpan.textContent = "Skore: " + got + "/" + total + " (" + pct + "%)";
    });

    btnReset.addEventListener("click", function () {
      section.remove();
      buildQuiz(data, anchor, standalone);
    });

    if (standalone) {
      anchor.appendChild(section);
    } else {
      anchor.insertAdjacentElement("beforebegin", section);
    }
  }

  /* ── standalone mode (quiz.html) ── */
  window.__quizBuild = function (data, container) {
    buildQuiz(data, container, true);
  };
})();
