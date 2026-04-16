(function () {
  async function loadCatalog() {
    var res = await fetch("assets/questions-catalog.json", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error("catalog_load_failed");
    }
    return await res.json();
  }

  async function loadCommentStats() {
    var res = await fetch("/api/comments/stats", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error("stats_load_failed");
    }
    var data = await res.json();
    return Array.isArray(data.stats) ? data.stats : [];
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function badge(source) {
    if (source === "site") {
      return "SIT";
    }
    if (source === "spv") {
      return "SPV";
    }
    return "PV";
  }

  function shuffle(items) {
    var arr = items.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }

  function isDone(itemPath) {
    var a = "study-done::/" + itemPath;
    var b = "study-done::" + itemPath;
    return localStorage.getItem(a) === "1" || localStorage.getItem(b) === "1";
  }

  function renderRepeat(listEl, items) {
    if (!listEl) {
      return;
    }
    if (!items.length) {
      listEl.innerHTML =
        '<div class="search-empty">Všechno máš označené jako prostudované. Dej si náhodných 5 otázek znovu.</div>';
      return;
    }

    listEl.innerHTML = items
      .map(function (item) {
        var reason = item.priorityReason ? " • " + item.priorityReason : "";
        return (
          '<a class="repeat-item" href="' +
          item.path +
          '">' +
          "<strong>[" +
          badge(item.source) +
          "] " +
          item.title +
          "</strong>" +
          "<small>" +
          item.path +
          reason +
          "</small>" +
          "</a>"
        );
      })
      .join("");
  }

  function toQuestionPath(itemPath) {
    return String(itemPath || "").replace(/^\/+/, "");
  }

  function buildStatsMap(stats) {
    var map = Object.create(null);
    stats.forEach(function (row) {
      var q = toQuestionPath(row.questionPath);
      var chyby = Number(row.chyby || 0);
      var chybi = Number(row.chybi || 0);
      var dotazy = Number(row.dotazy || 0);
      var total = Number(row.total || 0);
      var severity = chyby * 5 + chybi * 4 + dotazy * 2 + total;
      map[q] = {
        severity: severity,
        chyby: chyby,
        chybi: chybi,
        dotazy: dotazy,
      };
    });
    return map;
  }

  function getPriorityReason(item, statsMap) {
    var q = toQuestionPath(item.path);
    var s = statsMap[q];
    if (!s || (!s.chyby && !s.chybi)) {
      return "";
    }
    if (s.chyby && s.chybi) {
      return "priorita: " + s.chyby + "x chyba, " + s.chybi + "x chybi";
    }
    if (s.chyby) {
      return "priorita: " + s.chyby + "x chyba";
    }
    return "priorita: " + s.chybi + "x chybi";
  }

  function pickRepeatSet(catalog, statsMap) {
    var pending = catalog.filter(function (item) {
      return !isDone(item.path);
    });
    var source = pending.length ? pending : catalog;

    var weighted = source
      .map(function (item) {
        var q = toQuestionPath(item.path);
        var severity = statsMap[q] ? statsMap[q].severity : 0;
        return {
          item: item,
          severity: severity,
          priorityReason: getPriorityReason(item, statsMap),
        };
      })
      .sort(function (a, b) {
        if (b.severity !== a.severity) {
          return b.severity - a.severity;
        }
        return a.item.title.localeCompare(b.item.title, "cs");
      });

    var top = weighted.slice(0, 3).map(function (x) {
      return Object.assign({}, x.item, { priorityReason: x.priorityReason });
    });

    var restPool = weighted.slice(3).map(function (x) {
      return Object.assign({}, x.item, { priorityReason: x.priorityReason });
    });
    var rest = shuffle(restPool).slice(0, Math.max(0, 5 - top.length));
    return top.concat(rest).slice(0, 5);
  }

  function renderResults(target, items) {
    if (!items.length) {
      target.innerHTML =
        '<div class="search-empty">Nenalezeno. Zkus jine slovo.</div>';
      return;
    }

    target.innerHTML = items
      .map(function (item) {
        return (
          '<a class="search-item" href="' +
          item.path +
          '">' +
          '<span class="search-badge">' +
          badge(item.source) +
          "</span>" +
          '<span class="search-title">' +
          item.title +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var input = document.getElementById("global-search-input");
    var result = document.getElementById("global-search-results");
    var repeatList = document.getElementById("repeat-list");
    var repeatMix = document.getElementById("repeat-mix");
    if (!input || !result) {
      return;
    }

    var catalog = [];
    var statsMap = Object.create(null);
    try {
      catalog = await loadCatalog();
      try {
        statsMap = buildStatsMap(await loadCommentStats());
      } catch (e) {
        statsMap = Object.create(null);
      }
      renderResults(result, catalog.slice(0, 12));
      renderRepeat(repeatList, pickRepeatSet(catalog, statsMap));
    } catch (e) {
      result.innerHTML =
        '<div class="search-empty">Katalog se nepodarilo nacist.</div>';
      return;
    }

    if (repeatMix) {
      repeatMix.addEventListener("click", function () {
        renderRepeat(repeatList, pickRepeatSet(catalog, statsMap));
      });
    }

    input.addEventListener("input", function () {
      var q = norm(input.value);
      if (!q) {
        renderResults(result, catalog.slice(0, 12));
        return;
      }

      var filtered = catalog
        .filter(function (item) {
          return norm(item.title).includes(q) || norm(item.path).includes(q);
        })
        .slice(0, 50);

      renderResults(result, filtered);
    });
  });
})();
