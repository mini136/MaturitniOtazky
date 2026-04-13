# Strojové učení — Regrese a klasifikace

## Supervised Learning (učení s učitelem)

Model se učí z trénovacích dat, která mají **vstupy (features)** a **správné výstupy (labels)**.

### Regrese vs Klasifikace:
| | Regrese | Klasifikace |
|-|---------|-------------|
| Výstup | Spojitá hodnota (číslo) | Diskrétní třída (kategorie) |
| Příklad | Predikce ceny bytu | Spam / ne-spam |
| Metriky | MSE, MAE, R² | Accuracy, Precision, Recall, F1 |

## Regrese

### Lineární regrese
$y = w_1 x_1 + w_2 x_2 + ... + w_n x_n + b$

- Hledá lineární vztah mezi vstupy a výstupem
- **Metoda nejmenších čtverců** — minimalizuje $\sum(y_i - \hat{y}_i)^2$
- Gradient descent — iterativní optimalizace vah

### Polynomická regrese
$y = w_n x^n + ... + w_2 x^2 + w_1 x + b$

- Nelineární vztah zachycen polynom. features
- Riziko overfittingu u vysokého stupně

### Regularizace
- **Ridge (L2):** penalizuje velké váhy ($\lambda \sum w_i^2$)
- **Lasso (L1):** penalizuje absolutní váhy ($\lambda \sum |w_i|$), může vynulovat features

## Klasifikace

### Logistická regrese
$P(y=1) = \sigma(w^T x + b) = \frac{1}{1 + e^{-(w^T x + b)}}$

- Sigmoid funkce → výstup je **pravděpodobnost** (0–1)
- Binární klasifikace, rozšiřitelné na multiclass (softmax)

### K-Nearest Neighbors (KNN)
- Nový bod → najde K nejbližších sousedů → hlasování majority
- Lazy learning (netrénuje se model)
- Nevýhoda: pomalé pro velké datasety

### Decision Tree (rozhodovací strom)
- Stromová struktura podmínek: IF feature > threshold THEN ...
- Kritéria rozdělení: Gini impurity, Information Gain (entropie)
- Výhoda: interpretovatelné
- Nevýhoda: náchylné k overfittingu

### Random Forest
- **Ensemble** mnoha rozhodovacích stromů
- Každý strom trénovaný na podmnožině dat (bagging)
- Výsledek = průměr/většinové hlasování
- Robustnější než jednotlivý strom

### Support Vector Machine (SVM)
- Hledá **hyperrovinu** maximálně oddělující třídy
- Kernel trick — mapuje data do vyšší dimenze
- Dobrý pro malé datasety s mnoha features

## Confusion Matrix (matice záměn)

```
                    Predikce
                  Pos    Neg
Skutečnost Pos | TP  | FN |
           Neg | FP  | TN |
```

- **Precision** = TP / (TP + FP) — "kolik z predikovaných + je skutečně +"
- **Recall** = TP / (TP + FN) — "kolik skutečných + jsme zachytili"
- **F1** = 2 × (Precision × Recall) / (Precision + Recall)

## Bias-Variance Tradeoff
- **Bias** — chyba z příliš jednoduchého modelu (underfitting)
- **Variance** — chyba z přílišné citlivosti na trénovací data (overfitting)
- Cíl: najít rovnováhu
