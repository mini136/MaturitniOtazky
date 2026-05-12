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
    if (/spv/i.test(folder)) sub = "spv";
    if (/cs/i.test(folder)) sub = "cs";
    return "quizzes/" + sub + "/" + file + ".json";
  }

  function historyKey() {
    return (
      "quiz-history::" +
      window.location.pathname +
      "::" +
      window.location.search
    );
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
      return {
        got: score,
        max: pairs.length,
        detail:
          score === pairs.length
            ? ""
            : "Spravne dvojice: " +
              pairs
                .map(function (p) {
                  return p[0] + " -> " + p[1];
                })
                .join("; "),
      };
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
      var missing = [];
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
          missing.push(q.answers[i]);
        }
      });
      return {
        got: score,
        max: q.answers.length,
        detail: missing.length ? "Dopln spravne: " + missing.join(", ") : "",
      };
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
      return {
        got: score,
        max: correct.length,
        detail:
          score === correct.length
            ? ""
            : "Spravne poradi: " + correct.join(" -> "),
      };
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
      var detail = "";
      if (!correct) {
        detail =
          "Spravna odpoved: " +
          (q.answer ? "Pravda" : "Nepravda") +
          ". " +
          q.explanation;
        fb.textContent =
          "Spravna odpoved: " +
          (q.answer ? "Pravda" : "Nepravda") +
          ". " +
          q.explanation;
      } else if (!hasExpl) {
        detail = "Spravne, ale chybi podrobnejsi vysvetleni.";
        fb.textContent = "Spravne! Ale zkus napsat vysvetleni podrobneji.";
      }
      return { got: pts, max: 2, detail: detail };
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
      var detail = "";
      if (missing.length) {
        detail = "Chybi pojmy: " + missing.join(", ");
        fb.textContent = "Chybi pojmy: " + missing.join(", ");
      }
      return { got: found, max: q.keywords.length, detail: detail };
    };
  }

  /* ── CODE-FILL renderer ── */
  // JSON format: { type:"code-fill", prompt:"...", variants:[{lang:"Python", code:"...", answers:[...]}, ...] }
  // All blanks are marked as {{token}} in code. On each render a random language variant
  // is picked and a random 50-80% subset of tokens becomes blanks; the rest are shown in green.
  function renderCodeFill(q, qEl) {
    var variants = (q.variants || []).filter(function (v) {
      return v.code;
    });
    if (!variants.length) return;

    var variant = variants[Math.floor(Math.random() * variants.length)];
    var lang = variant.lang || "Code";
    var codeTemplate = variant.code || "";

    // collect all {{token}} positions in order
    var tokenRegex = /\{\{([^}]+)\}\}/g;
    var allTokens = [];
    var m;
    while ((m = tokenRegex.exec(codeTemplate)) !== null) {
      allTokens.push({ full: m[0], answer: m[1], offset: m.index });
    }
    if (!allTokens.length) return;

    // randomly pick which tokens become blank (50-80%, min 2)
    var pct = 0.5 + Math.random() * 0.3;
    var numBlanks = Math.max(
      2,
      Math.min(allTokens.length, Math.round(allTokens.length * pct)),
    );
    var idxShuffled = shuffle(
      allTokens.map(function (_, i) {
        return i;
      }),
    );
    var blankSet = {};
    idxShuffled.slice(0, numBlanks).forEach(function (i) {
      blankSet[i] = true;
    });

    // language bar
    var langBar = document.createElement("div");
    langBar.className = "cf-lang-bar";
    langBar.innerHTML =
      '<span class="cf-lang-badge">' +
      esc(lang) +
      "</span>" +
      '<span class="cf-hint">Doplň chybějící tokeny.</span>';
    qEl.appendChild(langBar);

    // code block with inline inputs
    var pre = document.createElement("div");
    pre.className = "cf-code-block";

    var html = "";
    var lastIdx = 0;
    allTokens.forEach(function (tok, i) {
      // raw text before token — preserve whitespace via esc then swap newlines
      var before = codeTemplate.slice(lastIdx, tok.offset);
      html += esc(before).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
      lastIdx = tok.offset + tok.full.length;

      if (blankSet[i]) {
        var w = Math.max(40, (tok.answer.length + 2) * 9);
        html +=
          '<input type="text" class="cf-input" data-answer="' +
          esc(tok.answer) +
          '" style="width:' +
          w +
          'px" ' +
          'spellcheck="false" autocomplete="off" placeholder="?">';
      } else {
        html += '<span class="cf-given">' + esc(tok.answer) + "</span>";
      }
    });
    // remaining text after last token
    var tail = codeTemplate.slice(lastIdx);
    html += esc(tail).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");

    pre.innerHTML = html;
    qEl.appendChild(pre);

    return function evaluate() {
      var inputs = pre.querySelectorAll(".cf-input");
      var score = 0;
      var missing = [];
      inputs.forEach(function (inp) {
        var expected = norm(inp.dataset.answer);
        var got = norm(inp.value);
        if (
          got &&
          (expected === got || expected.includes(got) || got.includes(expected))
        ) {
          score++;
          inp.classList.add("correct");
          inp.classList.remove("wrong");
        } else {
          inp.classList.add("wrong");
          inp.classList.remove("correct");
          inp.title = "Správně: " + inp.dataset.answer;
          missing.push(inp.dataset.answer);
        }
      });
      return {
        got: score,
        max: inputs.length,
        detail: missing.length ? "Správně: " + missing.join(", ") : "",
      };
    };
  }

  /* ── CODE renderer ── */
  function renderCode(q, qEl) {
    var lang = q.language || "python";

    var header = document.createElement("div");
    header.className = "code-header";
    header.innerHTML =
      '<span class="code-lang">' +
      esc(lang) +
      "</span>" +
      (q.hints && q.hints.length
        ? '<span class="code-hints">💡 ' +
          q.hints.map(esc).join(" &middot; ") +
          "</span>"
        : "");
    qEl.appendChild(header);

    var ta = document.createElement("textarea");
    ta.className = "code-editor";
    ta.spellcheck = false;
    ta.value = q.starterCode || "";
    ta.setAttribute("data-lang", lang);
    qEl.appendChild(ta);

    var btnCheck = document.createElement("button");
    btnCheck.type = "button";
    btnCheck.className = "quiz-btn code-check-btn";
    btnCheck.textContent = "🤖 Zkontrolovat kódem AI";
    qEl.appendChild(btnCheck);

    var aiFb = document.createElement("div");
    aiFb.className = "code-ai-feedback";
    qEl.appendChild(aiFb);

    var aiResult = null;

    btnCheck.addEventListener("click", function () {
      var code = ta.value.trim();
      if (!code) {
        aiFb.innerHTML =
          '<div class="code-ai-error">Nejprve napište kód.</div>';
        return;
      }
      btnCheck.disabled = true;
      btnCheck.textContent = "⏳ Kontroluji...";
      aiFb.innerHTML =
        '<div class="code-ai-loading">ChatGPT hodnotí váš kód…</div>';

      fetch("/api/quiz/code/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code,
          prompt: q.task || q.prompt,
          language: lang,
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          if (data.error) throw new Error(data.error);
          aiResult = data.result;
          var cls =
            aiResult.score >= 80
              ? "ok"
              : aiResult.score >= 40
                ? "partial"
                : "fail";
          aiFb.innerHTML =
            '<div class="code-ai-result ' +
            cls +
            '">' +
            "<strong>" +
            esc(aiResult.verdict) +
            "</strong> (" +
            aiResult.score +
            "/100)<br>" +
            '<span class="code-ai-fb-text">' +
            esc(aiResult.feedback) +
            "</span>" +
            (aiResult.suggestions && aiResult.suggestions.length
              ? '<ul class="code-ai-suggestions">' +
                aiResult.suggestions
                  .map(function (s) {
                    return "<li>" + esc(s) + "</li>";
                  })
                  .join("") +
                "</ul>"
              : "") +
            "</div>";
          btnCheck.disabled = false;
          btnCheck.textContent = "🤖 Zkontrolovat znovu";
        })
        .catch(function () {
          aiFb.innerHTML =
            '<div class="code-ai-error">Chyba při hodnocení. Zkus to znovu.</div>';
          btnCheck.disabled = false;
          btnCheck.textContent = "🤖 Zkontrolovat kódem AI";
        });
    });

    return function evaluate() {
      var fb = qEl.querySelector(".q-feedback");
      if (!aiResult) {
        fb.textContent = "Nejprve zkontroluj kód tlačítkem 🤖 výše.";
        return {
          got: 0,
          max: 10,
          detail: "Nejprve zkontroluj kód tlačítkem výše.",
        };
      }
      return { got: Math.round(aiResult.score / 10), max: 10, detail: "" };
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
        "code-fill": "Kódové doplňování",
        order: "Řazení",
        trueFalse: "Pravda/Nepravda",
        open: "Otevřená",
        code: "Psaní kódu",
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
        case "code-fill":
          evalFn = renderCodeFill(q, qEl);
          break;
        case "code":
          evalFn = renderCode(q, qEl);
          break;
        default:
          return;
      }

      var fb = document.createElement("div");
      fb.className = "q-feedback";
      qEl.appendChild(fb);
      evaluators.push({ fn: evalFn, fb: fb, question: q.prompt || "Otazka" });
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

    var review = document.createElement("div");
    review.className = "quiz-review";
    review.style.display = "none";
    section.appendChild(review);

    btnEval.addEventListener("click", function () {
      var total = 0;
      var got = 0;
      var weak = [];
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
          if (r.detail) {
            ev.fb.textContent = r.detail;
          } else if (!ev.fb.textContent) {
            ev.fb.textContent =
              "Castecne spravne (" + r.got + "/" + r.max + ")";
          }
        } else {
          ev.fb.classList.add("fail");
          ev.fb.classList.remove("ok", "partial");
          if (r.detail) {
            ev.fb.textContent = r.detail;
          } else if (!ev.fb.textContent) {
            ev.fb.textContent = "Spatne (0/" + r.max + ")";
          }
        }

        if (r.got < r.max) {
          weak.push(ev.question);
        }
      });
      var pct = total ? Math.round((got / total) * 100) : 0;
      scoreSpan.textContent = "Skore: " + got + "/" + total + " (" + pct + "%)";

      try {
        var key = historyKey();
        var arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.unshift({
          at: new Date().toISOString(),
          got: got,
          total: total,
          pct: pct,
        });
        localStorage.setItem(key, JSON.stringify(arr.slice(0, 20)));
      } catch (e) {}

      var history = [];
      try {
        history = JSON.parse(localStorage.getItem(historyKey()) || "[]");
      } catch (e) {
        history = [];
      }

      review.style.display = "block";
      review.innerHTML =
        "<h3>Co si zopakovat</h3>" +
        (weak.length
          ? "<ul>" +
            weak
              .slice(0, 5)
              .map(function (w) {
                return "<li>" + esc(w) + "</li>";
              })
              .join("") +
            "</ul>"
          : "<p>Super, vsechny otazky mas spravne.</p>") +
        (history.length
          ? '<p style="margin-top:8px;color:#475569;font-size:.88rem;">Posledni pokus: ' +
            history[0].got +
            "/" +
            history[0].total +
            " (" +
            history[0].pct +
            "%)</p>"
          : "");
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
