# Vlastnosti datových struktur

## Indexování

### Přímý přístup (Direct Access):
- **Pole/Array** — O(1) přes index: `arr[5]`
- Index = offset od začátku paměti
- Výhoda: nejrychlejší přístup k prvku

### Sekvenční přístup:
- **Linked List** — O(n), musí projít od hlavy
- Vhodné pro sekvenční zpracování, ne náhodný přístup

### Přístup přes klíč:
- **Hash tabulka** — O(1) průměrně
- Klíč → hash funkce → index do pole (bucketu)

### Hierarchický přístup:
- **BST** — O(log n) průměrně
- Navigace: menší doleva, větší doprava

## Řazení (vnitřní vlastnost)

### Seřazené struktury:
| Struktura | Operace vložení | Hledání | Pořadí |
|-----------|-----------------|---------|--------|
| Seřazené pole | O(n) | O(log n) binárně | Ano |
| BST | O(log n) | O(log n) | Ano (inorder) |
| Heap | O(log n) | O(n) | Částečné (jen kořen) |
| Skip List | O(log n) | O(log n) | Ano |

### Neseřazené:
| Struktura | Vložení | Hledání |
|-----------|---------|---------|
| Neseřazené pole | O(1) | O(n) |
| Linked List | O(1) | O(n) |
| Hash tabulka | O(1)* | O(1)* |

\* amortizovaně

## Hashování

### Hash funkce:
- Převede klíč na číslo (index do pole)
- Požadavky: determinismus, rovnoměrné rozložení, rychlost
- Příklady: modulo, kryptografické (SHA-256)

### Kolize (dva klíče → stejný hash):

**Řetězení (Chaining):**
```
[0] → (A, 10) → (K, 20)
[1] → (B, 30)
[2] → null
[3] → (D, 40)
```

**Otevřené adresování (Open Addressing):**
- Lineární probing: hledej další volný slot
- Kvadratické probing: skok +1, +4, +9, ...
- Double hashing: druhá hash funkce

### Load Factor:
$\alpha = \frac{n}{m}$ kde $n$ = počet prvků, $m$ = velikost pole
- Doporučeno < 0.75 (pak rehashing — zvětšení pole)

## Srovnání složitostí

| Struktura | Přístup | Hledání | Vložení | Smazání | Paměť |
|-----------|---------|---------|---------|---------|-------|
| Array | O(1) | O(n) | O(n) | O(n) | O(n) |
| Sorted Array | O(1) | O(log n) | O(n) | O(n) | O(n) |
| Linked List | O(n) | O(n) | O(1)* | O(1)* | O(n) |
| Stack/Queue | O(n) | O(n) | O(1) | O(1) | O(n) |
| Hash Table | — | O(1) | O(1) | O(1) | O(n) |
| BST | — | O(log n) | O(log n) | O(log n) | O(n) |
| Heap | — | O(n) | O(log n) | O(log n) | O(n) |

\* pokud máme referenci na místo vložení/smazání

## Volba datové struktury

| Potřeba | Vhodná struktura |
|---------|-----------------|
| Rychlý přístup dle indexu | Array |
| Rychlé hledání dle klíče | Hash Table |
| Seřazená data + hledání | BST / Sorted Array |
| FIFO zpracování | Queue |
| LIFO / undo | Stack |
| Minimum/maximum | Heap |
| Časté vkládání/mazání | Linked List |
| Unikátní prvky | HashSet |
| Prefix hledání | Trie |
