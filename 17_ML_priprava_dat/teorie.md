# Strojové učení — Příprava dat

## Co je strojové učení?

Podoblast umělé inteligence — algoritmy, které se **učí z dat** bez explicitního programování.

### Typy učení:
| Typ | Popis | Příklad |
|-----|-------|---------|
| **Supervised** | Trénovací data mají labely (správné odpovědi) | Klasifikace emailů, predikce cen |
| **Unsupervised** | Data BEZ labelů, hledání vzorů | Shlukování zákazníků, redukce dimenzí |
| **Reinforcement** | Agent se učí interakcí s prostředím | Hry, robotika |

## Příprava dat — pipeline

```
Surová data → Čistění → Transformace → Výběr features → Rozdělení → Model
```

### 1. Sběr dat
- Databáze, CSV, API, web scraping
- Kvalita dat > kvantita dat

### 2. Čištění dat (Data Cleaning)
- **Chybějící hodnoty** — odstranění řádků, imputace (průměr, medián, modus)
- **Duplicity** — detekce a odstranění
- **Odlehlé hodnoty (outliers)** — IQR metoda, z-score
- **Nekonzistentní formáty** — datumy, měny, jednotky

### 3. Transformace dat
- **Normalizace** (Min-Max) — škálování na [0, 1]: $x' = \frac{x - x_{min}}{x_{max} - x_{min}}$
- **Standardizace** (Z-score) — průměr 0, směrodatná odchylka 1: $z = \frac{x - \mu}{\sigma}$
- **Kódování kategorických dat:**
  - Label Encoding: barva → {0, 1, 2}
  - One-Hot Encoding: barva → [1,0,0], [0,1,0], [0,0,1]

### 4. Feature Engineering
- Výběr relevantních příznaků
- Vytváření nových příznaků (kombinace existujících)
- Redukce dimenzí (PCA)
- Korelační analýza — odstranění silně korelovaných features

### 5. Rozdělení dat
- **Trénovací** (train) — 70-80 % — model se učí
- **Validační** (validation) — 10-15 % — ladění hyperparametrů
- **Testovací** (test) — 10-15 % — finální vyhodnocení

### Cross-validation (křížová validace)
- Data se rozdělí na K foldů
- K-krát se trénuje na K-1 foldech, testuje na zbylém
- Průměr výsledků → robustnější odhad výkonu

## Metriky kvality

### Klasifikace:
- **Accuracy** — procento správných predikce
- **Precision** — kolik z predikovaných pozitivních je skutečně pozitivních
- **Recall** — kolik skutečně pozitivních model zachytil
- **F1-score** — harmonický průměr precision a recall

### Regrese:
- **MSE** (Mean Squared Error) — průměrná čtvercová chyba
- **MAE** (Mean Absolute Error) — průměrná absolutní chyba
- **R²** — koeficient determinace (1 = perfektní)

## Přetrénování (Overfitting) vs Podtrénování (Underfitting)

| | Underfitting | Good fit | Overfitting |
|-|-------------|----------|-------------|
| Trénovací chyba | Vysoká | Nízká | Velmi nízká |
| Testovací chyba | Vysoká | Nízká | Vysoká |
| Problém | Příliš jednoduchý model | ✓ | Model se "naučil šum" |
| Řešení | Složitější model, více features | — | Regularizace, více dat |
