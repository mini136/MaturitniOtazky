"""
Datove struktury - implementace od nuly
Stack, Queue, Linked List, BST, Min-Heap, Hash tabulka
"""

# ============================================================
#  ZASOBNIK (STACK) - LIFO
# ============================================================
print("=== Zasobnik (Stack) - LIFO ===")

class Stack:
    def __init__(self):
        self._data = []

    def push(self, hodnota):
        self._data.append(hodnota)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack je prazdny")
        return self._data.pop()

    def peek(self):
        if self.is_empty():
            raise IndexError("Stack je prazdny")
        return self._data[-1]

    def is_empty(self):
        return len(self._data) == 0

    def __len__(self):
        return len(self._data)

    def __repr__(self):
        return f"Stack({self._data})"

# Pouziti: kontrola zavorek
def kontrola_zavorek(vyraz):
    """Kontroluje spravne uzavorkovani"""
    stack = Stack()
    pary = {')': '(', ']': '[', '}': '{'}
    for znak in vyraz:
        if znak in '([{':
            stack.push(znak)
        elif znak in ')]}':
            if stack.is_empty() or stack.pop() != pary[znak]:
                return False
    return stack.is_empty()

vyrazy = ["(())", "([{}])", "(()", "([)]", "{[()]}"]
for vyraz in vyrazy:
    ok = kontrola_zavorek(vyraz)
    print(f"  '{vyraz}' -> {'OK' if ok else 'CHYBA'}")


# ============================================================
#  FRONTA (QUEUE) - FIFO
# ============================================================
print("\n=== Fronta (Queue) - FIFO ===")

class Queue:
    def __init__(self):
        self._data = []

    def enqueue(self, hodnota):
        self._data.append(hodnota)

    def dequeue(self):
        if self.is_empty():
            raise IndexError("Queue je prazdna")
        return self._data.pop(0)

    def front(self):
        if self.is_empty():
            raise IndexError("Queue je prazdna")
        return self._data[0]

    def is_empty(self):
        return len(self._data) == 0

    def __len__(self):
        return len(self._data)

    def __repr__(self):
        return f"Queue({self._data})"

# Simulace tiskarny
print("  Simulace tiskove fronty:")
tiskarna = Queue()
for doc in ["dokument.pdf", "fotka.jpg", "prezentace.pptx"]:
    tiskarna.enqueue(doc)
    print(f"    Pridano: {doc}")

while not tiskarna.is_empty():
    print(f"    Tisknu: {tiskarna.dequeue()}")


# ============================================================
#  SPOJOVY SEZNAM (LINKED LIST)
# ============================================================
print("\n=== Spojovy seznam (Linked List) ===")

class Uzel:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def vloz_na_zacatek(self, data):
        novy = Uzel(data)
        novy.next = self.head
        self.head = novy

    def vloz_na_konec(self, data):
        novy = Uzel(data)
        if not self.head:
            self.head = novy
            return
        aktualni = self.head
        while aktualni.next:
            aktualni = aktualni.next
        aktualni.next = novy

    def smaz(self, data):
        if not self.head:
            return
        if self.head.data == data:
            self.head = self.head.next
            return
        aktualni = self.head
        while aktualni.next:
            if aktualni.next.data == data:
                aktualni.next = aktualni.next.next
                return
            aktualni = aktualni.next

    def obsahuje(self, data):
        aktualni = self.head
        while aktualni:
            if aktualni.data == data:
                return True
            aktualni = aktualni.next
        return False

    def __repr__(self):
        prvky = []
        aktualni = self.head
        while aktualni:
            prvky.append(str(aktualni.data))
            aktualni = aktualni.next
        return " -> ".join(prvky) + " -> None"

ll = LinkedList()
for x in [10, 20, 30]:
    ll.vloz_na_konec(x)
ll.vloz_na_zacatek(5)
print(f"  Seznam: {ll}")
ll.smaz(20)
print(f"  Po smazani 20: {ll}")
print(f"  Obsahuje 30? {ll.obsahuje(30)}")


# ============================================================
#  BINARNI VYHLEDAVACI STROM (BST)
# ============================================================
print("\n=== Binarni vyhledavaci strom (BST) ===")

class BSTUzel:
    def __init__(self, hodnota):
        self.hodnota = hodnota
        self.levy = None
        self.pravy = None

class BST:
    def __init__(self):
        self.koren = None

    def vloz(self, hodnota):
        if not self.koren:
            self.koren = BSTUzel(hodnota)
        else:
            self._vloz_rek(self.koren, hodnota)

    def _vloz_rek(self, uzel, hodnota):
        if hodnota < uzel.hodnota:
            if uzel.levy is None:
                uzel.levy = BSTUzel(hodnota)
            else:
                self._vloz_rek(uzel.levy, hodnota)
        else:
            if uzel.pravy is None:
                uzel.pravy = BSTUzel(hodnota)
            else:
                self._vloz_rek(uzel.pravy, hodnota)

    def hledej(self, hodnota):
        return self._hledej_rek(self.koren, hodnota)

    def _hledej_rek(self, uzel, hodnota):
        if uzel is None:
            return False
        if hodnota == uzel.hodnota:
            return True
        elif hodnota < uzel.hodnota:
            return self._hledej_rek(uzel.levy, hodnota)
        else:
            return self._hledej_rek(uzel.pravy, hodnota)

    def inorder(self):
        """Serazeny pruchod (levy-koren-pravy)"""
        vysledek = []
        self._inorder_rek(self.koren, vysledek)
        return vysledek

    def _inorder_rek(self, uzel, vysledek):
        if uzel:
            self._inorder_rek(uzel.levy, vysledek)
            vysledek.append(uzel.hodnota)
            self._inorder_rek(uzel.pravy, vysledek)

    def zobraz(self, uzel=None, uroven=0, prefix="Koren: "):
        if uzel is None and uroven == 0:
            uzel = self.koren
        if uzel is not None:
            print("  " + "   " * uroven + prefix + str(uzel.hodnota))
            if uzel.levy or uzel.pravy:
                self.zobraz(uzel.levy, uroven + 1, "L: ") if uzel.levy else None
                self.zobraz(uzel.pravy, uroven + 1, "P: ") if uzel.pravy else None

strom = BST()
for val in [50, 30, 70, 20, 40, 60, 80]:
    strom.vloz(val)

strom.zobraz()
print(f"  Inorder (serazeno): {strom.inorder()}")
print(f"  Hledej 40: {strom.hledej(40)}")
print(f"  Hledej 99: {strom.hledej(99)}")


# ============================================================
#  MIN-HEAP (prioritni fronta)
# ============================================================
print("\n=== Min-Heap ===")

class MinHeap:
    def __init__(self):
        self._data = []

    def vloz(self, hodnota):
        self._data.append(hodnota)
        self._bubble_up(len(self._data) - 1)

    def odeber_min(self):
        if not self._data:
            raise IndexError("Heap je prazdny")
        minimum = self._data[0]
        posledni = self._data.pop()
        if self._data:
            self._data[0] = posledni
            self._bubble_down(0)
        return minimum

    def peek(self):
        return self._data[0] if self._data else None

    def _bubble_up(self, index):
        while index > 0:
            rodic = (index - 1) // 2
            if self._data[index] < self._data[rodic]:
                self._data[index], self._data[rodic] = self._data[rodic], self._data[index]
                index = rodic
            else:
                break

    def _bubble_down(self, index):
        n = len(self._data)
        while True:
            nejmensi = index
            levy = 2 * index + 1
            pravy = 2 * index + 2
            if levy < n and self._data[levy] < self._data[nejmensi]:
                nejmensi = levy
            if pravy < n and self._data[pravy] < self._data[nejmensi]:
                nejmensi = pravy
            if nejmensi != index:
                self._data[index], self._data[nejmensi] = self._data[nejmensi], self._data[index]
                index = nejmensi
            else:
                break

    def __len__(self):
        return len(self._data)

heap = MinHeap()
for val in [35, 10, 25, 5, 15, 30, 20]:
    heap.vloz(val)
    print(f"  Vlozeno {val:2d}, min = {heap.peek()}")

print("  Postupne odebrani:")
while len(heap) > 0:
    print(f"    {heap.odeber_min()}", end="")
print()


# ============================================================
#  HASH TABULKA
# ============================================================
print("\n=== Hash tabulka ===")

class HashTabulka:
    """Jednoducha hash tabulka s retezenim (chaining)"""

    def __init__(self, velikost=10):
        self.velikost = velikost
        self.tabulka = [[] for _ in range(velikost)]

    def _hash(self, klic):
        if isinstance(klic, int):
            return klic % self.velikost
        h = 0
        for znak in str(klic):
            h = (h * 31 + ord(znak)) % self.velikost
        return h

    def vloz(self, klic, hodnota):
        index = self._hash(klic)
        # Aktualizace existujiciho
        for i, (k, v) in enumerate(self.tabulka[index]):
            if k == klic:
                self.tabulka[index][i] = (klic, hodnota)
                return
        self.tabulka[index].append((klic, hodnota))

    def najdi(self, klic):
        index = self._hash(klic)
        for k, v in self.tabulka[index]:
            if k == klic:
                return v
        raise KeyError(f"Klic '{klic}' nenalezen")

    def smaz(self, klic):
        index = self._hash(klic)
        for i, (k, v) in enumerate(self.tabulka[index]):
            if k == klic:
                del self.tabulka[index][i]
                return
        raise KeyError(f"Klic '{klic}' nenalezen")

    def zobraz(self):
        for i, bucket in enumerate(self.tabulka):
            if bucket:
                print(f"  [{i}] {bucket}")

ht = HashTabulka(7)
data = {"Alice": 20, "Bob": 22, "Charlie": 19, "Diana": 21, "Eva": 23}
for klic, hodnota in data.items():
    ht.vloz(klic, hodnota)

print("Obsah hash tabulky:")
ht.zobraz()
print(f"\nAlice: {ht.najdi('Alice')}")
ht.smaz("Bob")
print("Po smazani Bob:")
ht.zobraz()
