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

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function badge(source) {
    return source === "site" ? "SIT" : "PV";
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
    if (!input || !result) {
      return;
    }

    var catalog = [];
    try {
      catalog = await loadCatalog();
      renderResults(result, catalog.slice(0, 12));
    } catch (e) {
      result.innerHTML =
        '<div class="search-empty">Katalog se nepodarilo nacist.</div>';
      return;
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
