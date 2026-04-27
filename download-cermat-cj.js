#!/usr/bin/env node
/**
 * CERMAT CJL Crawler
 * Stáhne všechny dostupné testy CJL z maturita.cermat.cz
 *
 * Spuštění:  node download-cermat-cj.js
 * Výstup:    assets/cermat/cj/<rok>-<termin>/{DT,ZA,KSR}.pdf
 *            assets/cermat/cj/catalog.json  (aktualizuje metadata)
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const DEST_DIR = path.join(__dirname, "assets", "cermat", "cj");

// ─── katalog všech testů ─────────────────────────────────────────────────────
const TESTS = [
  {
    id: "2025-podzim",
    label: "MZ 2025 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJMAD25C0T04_web.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL_2025p_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL_Kl%C3%AD%C4%8D_spr%C3%A1vn%C3%BDch_%C5%99e%C5%A1en%C3%AD.pdf",
  },
  {
    id: "2025-jaro",
    label: "MZ 2025 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL_2025j_TS.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL_2025j_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL_2025j_KS%C5%98_web.pdf",
  },
  {
    id: "2024-podzim",
    label: "MZ 2024 – podzim",
    dt: "https://maturita.cermat.cz/files/files/%C4%8CJL_MZ2024P_TS.pdf",
    za: "https://maturita.cermat.cz/files/files/%C4%8CJL_MZ2024P_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/%C4%8CJL_MZ2024P_KS%C5%98_web.pdf",
  },
  {
    id: "2024-jaro",
    label: "MZ 2024 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL_MZ2024J_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL_MZ2024J_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJMZD24C0K01_web.pdf",
  },
  {
    id: "2023-podzim",
    label: "MZ 2023 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL_podzim_2023_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL_podzim_2023_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJMZD23C0K04_Web_rozsireny_klic.pdf",
  },
  {
    id: "2023-jaro",
    label: "MZ 2023 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL_jaro_2023_sada_A_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJ_2023_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL_jaro_2023_sada_A_klic_na_web.pdf",
  },
  {
    id: "2022-podzim",
    label: "MZ 2022 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022P/CJL_2022P_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022P/CJL_2022P_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022P/CJL_2022P_KLIC.pdf",
  },
  {
    id: "2022-jaro",
    label: "MZ 2022 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022/CJL_DT_2022J.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022/CJL_ZA_2022J.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2022/CJL_2022J_KLIC_doplneni_zpusob_hodnoceni_ulohy_24.pdf",
  },
  {
    id: "2021-podzim",
    label: "MZ 2021 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021P/MZ2021P_CJL_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021P/MZ2021P_CJL_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021P/MZ2021P_CJL_KLIC.pdf",
  },
  {
    id: "2021-jaro-mimoradny",
    label: "MZ 2021 – jaro (mimořádný)",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021M/MZ2021M_CJL_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021M/MZ2021M_CJL_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021M/MZ2021M_CJL_KLIC.pdf",
  },
  {
    id: "2021-jaro",
    label: "MZ 2021 – jaro (řádný)",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021/MZ2021_CJL_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021/MZ2021_CJL_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2021/MZ2021_CJL_KLIC.pdf",
  },
  {
    id: "2020-podzim",
    label: "MZ 2020 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020P/MZ2020P_CJ-DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020P/MZ2020P_CJ-DT_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020P/MZ2020P_CJ-DT_klic.pdf",
  },
  {
    id: "2020-jaro",
    label: "MZ 2020 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020/CJL_jaro_2020_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020/CJL_jaro_2020_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2020/CJL_jaro_2020_klic.pdf",
  },
  {
    id: "2019-podzim",
    label: "MZ 2019 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2019P/CJL_podzim_2019_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2019P/CJL_podzim_2019_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2019P/CJL_2019P_klic.pdf",
  },
  {
    id: "2019-jaro",
    label: "MZ 2019 – jaro",
    dt: "https://maturita.cermat.cz/files/files/testy-zadani-klice/CJL_jaro_2019_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/testy-zadani-klice/CJL_jaro_2019_DT_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/testy-zadani-klice/CJL_jaro_2019_DT_klic.pdf",
  },
  {
    id: "2018-podzim",
    label: "MZ 2018 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018P/CJL_podzim_2018_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018P/CJL_podzim_2018_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018P/CJL_podzim_2018_KLIC.pdf",
  },
  {
    id: "2018-jaro",
    label: "MZ 2018 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018/CJL_jaro_2018_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018/CJL_jaro_2018_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2018/JL_jaro_2018_KLIC.pdf",
  },
  {
    id: "2017-podzim",
    label: "MZ 2017 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017P/CJL_podzim_2017_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017P/CJL_podzim_2017_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017P/CJL_podzim_2017_KLIC.pdf",
  },
  {
    id: "2017-jaro",
    label: "MZ 2017 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017/CJL_jaro_2017_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017/CJL_jaro_2017_DT_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2017/CJL_jaro_2017_KLIC.pdf",
  },
  {
    id: "2016-podzim",
    label: "MZ 2016 – podzim",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016P/CJL_podzim_2016_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016P/CJL_podzim_2016_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016P/CJL_podzim_2016_klic.pdf",
  },
  {
    id: "2016-jaro",
    label: "MZ 2016 – jaro",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016/CJL_jaro_2016_DT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016/CJL_jaro_2016_ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2016/CJL_jaro_2016_KLIC.pdf",
  },
  {
    id: "2015-ilustracni",
    label: "Ilustrační test (2015)",
    dt: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2015/CJL-2015-IT.pdf",
    za: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2015/CJL-2015-IT-ZA.pdf",
    ksr: "https://maturita.cermat.cz/files/files/CJL/intaktni-zaci/MZ2015/CJL-2015-KLIC.pdf",
  },
];

// ─── downloader ──────────────────────────────────────────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      process.stdout.write("přeskočeno (existuje)\n");
      return resolve(true);
    }
    const mod = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);

    function doGet(u) {
      mod
        .get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            file.close();
            fs.unlinkSync(dest);
            const redirectUrl = res.headers.location;
            return doGet(
              redirectUrl.startsWith("http")
                ? redirectUrl
                : new URL(redirectUrl, u).href,
            );
          }
          if (res.statusCode !== 200) {
            file.close();
            try {
              fs.unlinkSync(dest);
            } catch (_) {}
            process.stdout.write(`chyba HTTP ${res.statusCode}\n`);
            return resolve(false);
          }
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            process.stdout.write("✓\n");
            resolve(true);
          });
        })
        .on("error", (err) => {
          try {
            fs.unlinkSync(dest);
          } catch (_) {}
          process.stdout.write(`chyba: ${err.message}\n`);
          resolve(false);
        });
    }
    doGet(url);
  });
}

// ─── main ────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(DEST_DIR, { recursive: true });

  const catalog = [];

  for (const test of TESTS) {
    console.log(`\n── ${test.label} (${test.id})`);
    const dir = path.join(DEST_DIR, test.id);
    fs.mkdirSync(dir, { recursive: true });

    const entry = { id: test.id, label: test.label, files: {} };

    const targets = [
      { key: "dt", name: "DT.pdf", url: test.dt, desc: "Didaktický test" },
      { key: "za", name: "ZA.pdf", url: test.za, desc: "Záznamový arch" },
      {
        key: "ksr",
        name: "KSR.pdf",
        url: test.ksr,
        desc: "Klíč správných řešení",
      },
    ];

    for (const t of targets) {
      if (!t.url) continue;
      process.stdout.write(`   ${t.desc.padEnd(28)}`);
      const dest = path.join(dir, t.name);
      const ok = await download(t.url, dest);
      entry.files[t.key] = {
        local: ok ? `assets/cermat/cj/${test.id}/${t.name}` : null,
        remote: t.url,
      };
    }

    catalog.push(entry);
  }

  // Uloží catalog.json
  const catalogPath = path.join(DEST_DIR, "catalog.json");
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
  console.log(`\nKatalog uložen: ${catalogPath}`);
  console.log("Hotovo!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
