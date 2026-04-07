# Typy datových struktur

## Lineární datové struktury

### Pole (Array)
- **Souvislý** blok paměti, prvky stejného typu
- O(1) přístup přes index
- O(n) vkládání/mazání (posouvání prvků)
- Pevná velikost (statické), nebo dynamické (ArrayList, List)

### Dynamické pole (ArrayList / List)
- Automaticky se zvětšuje (typicky 2× kapacity)
- Amortizované O(1) přidání na konec
- O(n) vložení doprostřed

### Spojový seznam (Linked List)
```
[data|next] → [data|next] → [data|next] → null
```
- **Jednosměrný** — ukazatel na další prvek
- **Obousměrný** (doubly linked) — ukazatel na předchozí i další
- O(1) vkládání/mazání (pokud máme referenci na uzel)
- O(n) přístup k prvku (sekvenční průchod)

### Zásobník (Stack)
- **LIFO** — Last In, First Out
- Operace: `push(x)`, `pop()`, `peek()/top()`
- Použití: volání funkcí, undo, parsování závorek, DFS
- O(1) pro push/pop

### Fronta (Queue)
- **FIFO** — First In, First Out
- Operace: `enqueue(x)`, `dequeue()`, `front()`
- Použití: BFS, tiskárna, zpracování úloh
- Varianty: kruhová fronta, prioritní fronta, deque

### Deque (Double-Ended Queue)
- Vkládání/odebírání z obou konců v O(1)

## Nelineární datové struktury

### Strom (Tree)
```
        root
       /    \
     A        B
    / \      /
   C   D    E
```
- **Kořen** — horní uzel bez rodiče
- **List** — uzel bez potomků
- **Hloubka** — vzdálenost od kořene
- **Binární** — max 2 potomci

### Binární vyhledávací strom (BST)
- Levý potomek < rodič < pravý potomek
- O(log n) průměrně pro vyhledání, vložení, smazání
- O(n) v nejhorším případě (degenerovaný strom)

### AVL strom / Red-Black strom
- **Vyvážené** BST — garantují O(log n)
- AVL: rozdíl výšek podstromů max 1
- Red-Black: barevné značení, méně striktní

### Halda (Heap)
- **Min-heap:** rodič ≤ potomek (kořen = minimum)
- **Max-heap:** rodič ≥ potomek (kořen = maximum)
- Implementace: pole (úplný binární strom)
- O(1) nalezení min/max, O(log n) vložení/odstranění
- Použití: prioritní fronta, heap sort

### Trie (prefixový strom)
- Ukládá řetězce znak po znaku
- Efektivní pro prefix search a autocomplete

### Graf
- Uzly (vertices) + hrany (edges)
- Orientovaný / neorientovaný
- Ohodnocený / neohodnocený
- Reprezentace: matice sousednosti, seznam sousednosti

## Hashovací struktury

### Hash tabulka (HashMap / Dictionary)
- Klíč → hash funkce → index v poli
- O(1) průměrně pro vyhledání, vložení, smazání
- **Kolize:** řetězení (linked list) nebo otevřené adresování
- Python: `dict`, Java: `HashMap`, C#: `Dictionary`

### Hash množina (HashSet)
- Množina unikátních prvků
- O(1) kontrola přítomnosti
