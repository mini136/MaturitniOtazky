# Strojové učení — Umělé neuronové sítě

## Biologická inspirace

Neuron přijímá vstupy (dendrity), zpracuje je (soma) a vysílá výstup (axon).

```
x1 --w1--> |       |
x2 --w2--> | Σ + b | ---> f(z) ---> výstup
x3 --w3--> |       |
```

$z = \sum_{i} w_i x_i + b$, výstup $= f(z)$ kde $f$ je aktivační funkce.

## Aktivační funkce

| Funkce | Vzorec | Rozsah | Použití |
|--------|--------|--------|---------|
| Sigmoid | $\frac{1}{1+e^{-z}}$ | (0, 1) | Výstupní vrstva (binární) |
| Tanh | $\frac{e^z - e^{-z}}{e^z + e^{-z}}$ | (-1, 1) | Skryté vrstvy |
| ReLU | $\max(0, z)$ | [0, ∞) | Skryté vrstvy (default) |
| Softmax | $\frac{e^{z_i}}{\sum e^{z_j}}$ | (0, 1), součet = 1 | Výstup (multiclass) |

## Architektura sítě

```
Vstupní vrstva → Skryté vrstvy → Výstupní vrstva
   (features)    (transformace)    (predikce)
```

### Typy vrstev:
- **Dense (Fully Connected)** — každý neuron propojen se všemi v předchozí vrstvě
- **Convolutional (CNN)** — filtry detekují vzory v obrázcích
- **Recurrent (RNN/LSTM)** — paměť pro sekvenční data (text, čas)
- **Dropout** — regularizace, náhodně "vypíná" neurony

## Trénování sítě

### Forward propagation:
Vstup → přes všechny vrstvy → výstup (predikce)

### Loss funkce:
- **MSE** (regrese): $L = \frac{1}{n}\sum(y_i - \hat{y}_i)^2$
- **Cross-Entropy** (klasifikace): $L = -\sum y_i \log(\hat{y}_i)$

### Backpropagation:
1. Spočítat loss (chybu)
2. Zpětně propagovat gradient přes všechny vrstvy (řetězové pravidlo)
3. Aktualizovat váhy: $w = w - \alpha \frac{\partial L}{\partial w}$

### Optimalizéry:
- **SGD** — Stochastic Gradient Descent (základní)
- **Adam** — adaptivní learning rate (nejpoužívanější)
- **RMSprop** — exponenciální průměr gradientů

## Hyperparametry

- **Learning rate** — jak velké kroky při aktualizaci vah
- **Batch size** — kolik vzorků najednou
- **Počet epoch** — kolikrát projít celý dataset
- **Architektura** — počet vrstev, neuronů
- **Regularizace** — Dropout rate, L2

## Deep Learning

= neuronové sítě s **mnoha skrytými vrstvami**: 
- CNN — rozpoznávání obrazu
- RNN/LSTM/Transformer — NLP, časové řady
- GAN — generování dat (obrázky, text)
- Autoencoder — komprese, anomálie
