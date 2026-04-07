"""
Vlakna a paralelni programovani v Pythonu
Threading, multiprocessing, synchronizace, race conditions
"""
import threading
import multiprocessing
import time
import queue

# ============================================================
#  ZAKLADNI VLAKNA
# ============================================================
print("=== Zakladni vlakna ===")

def pracovnik(jmeno, sekundy):
    """Simulace prace vlakna"""
    print(f"  [{jmeno}] Zacinam ({sekundy}s prace)")
    time.sleep(sekundy)
    print(f"  [{jmeno}] Hotovo!")

# Spusteni vlaken
vlakna = []
for i, cas in enumerate([0.3, 0.5, 0.2], 1):
    t = threading.Thread(target=pracovnik, args=(f"Vlakno-{i}", cas))
    vlakna.append(t)
    t.start()

# Cekani na dokonceni vsech vlaken
for t in vlakna:
    t.join()
print("  Vsechna vlakna dokoncena.\n")


# ============================================================
#  RACE CONDITION A MUTEX
# ============================================================
print("=== Race condition ===")

# BEZ zamku - race condition
pocitadlo_unsafe = 0

def zvys_bez_zamku(n):
    global pocitadlo_unsafe
    for _ in range(n):
        tmp = pocitadlo_unsafe
        tmp += 1
        pocitadlo_unsafe = tmp

vlakna = [threading.Thread(target=zvys_bez_zamku, args=(100000,)) for _ in range(4)]
for t in vlakna: t.start()
for t in vlakna: t.join()
print(f"  Bez zamku: {pocitadlo_unsafe} (ocekavano 400000) - RACE CONDITION!")


# SE zamkem - bezpecne
print("\n=== Mutex (Lock) ===")

pocitadlo_safe = 0
zamek = threading.Lock()

def zvys_se_zamkem(n):
    global pocitadlo_safe
    for _ in range(n):
        with zamek:  # automaticky lock/unlock
            pocitadlo_safe += 1

vlakna = [threading.Thread(target=zvys_se_zamkem, args=(100000,)) for _ in range(4)]
for t in vlakna: t.start()
for t in vlakna: t.join()
print(f"  Se zamkem: {pocitadlo_safe} (ocekavano 400000) - SPRAVNE")


# ============================================================
#  SEMAFOR
# ============================================================
print("\n=== Semafor (omezeni soucasneho pristupu) ===")

semafor = threading.Semaphore(2)  # max 2 soucasne

def pristup_k_prostredku(jmeno):
    print(f"  [{jmeno}] Cekam na pristup...")
    with semafor:
        print(f"  [{jmeno}] PRISTUP ZISKAN")
        time.sleep(0.3)
        print(f"  [{jmeno}] Uvolnuji")

vlakna = [threading.Thread(target=pristup_k_prostredku, args=(f"W{i}",)) for i in range(5)]
for t in vlakna: t.start()
for t in vlakna: t.join()


# ============================================================
#  PRODUCER-CONSUMER (fronta)
# ============================================================
print("\n=== Producer-Consumer ===")

buffer = queue.Queue(maxsize=5)
stop_flag = threading.Event()

def producent(jmeno):
    for i in range(5):
        polozka = f"{jmeno}-item{i}"
        buffer.put(polozka)
        print(f"  [P:{jmeno}] Vyrobeno: {polozka}")
        time.sleep(0.1)
    stop_flag.set()

def konzument(jmeno):
    while not (stop_flag.is_set() and buffer.empty()):
        try:
            polozka = buffer.get(timeout=0.2)
            print(f"  [C:{jmeno}] Zpracovano: {polozka}")
            time.sleep(0.15)
        except queue.Empty:
            pass

p = threading.Thread(target=producent, args=("Prod",))
c1 = threading.Thread(target=konzument, args=("Con1",))
c2 = threading.Thread(target=konzument, args=("Con2",))

for t in [p, c1, c2]: t.start()
for t in [p, c1, c2]: t.join()


# ============================================================
#  DEADLOCK DEMONSTRACE (a prevence)
# ============================================================
print("\n=== Deadlock prevence ===")

zamek_A = threading.Lock()
zamek_B = threading.Lock()

# SPATNE - zpusobi deadlock:
# Vlakno 1: zamkne A, ceka na B
# Vlakno 2: zamkne B, ceka na A

# RESENI: Zamykat vzdy ve stejnem poradi!
def bezpecne_vlakno(jmeno):
    with zamek_A:
        time.sleep(0.05)
        with zamek_B:
            print(f"  [{jmeno}] Ma oba zamky - pracuje")
            time.sleep(0.05)

t1 = threading.Thread(target=bezpecne_vlakno, args=("V1",))
t2 = threading.Thread(target=bezpecne_vlakno, args=("V2",))
t1.start(); t2.start()
t1.join(); t2.join()
print("  Zadny deadlock! (zamky vzdy ve stejnem poradi)")


# ============================================================
#  TIMER A DAEMON VLAKNA
# ============================================================
print("\n=== Timer a Daemon vlakna ===")

def casovana_akce():
    print("  Timer: Tato akce se spustila po 0.5s")

timer = threading.Timer(0.5, casovana_akce)
timer.start()
timer.join()

# Daemon vlakno - skonci automaticky s hlavnim programem
def demon():
    while True:
        time.sleep(1)

d = threading.Thread(target=demon, daemon=True)
d.start()
print("  Daemon vlakno bezi na pozadi (skonci s programem)")


# ============================================================
#  THREAD POOL (concurrent.futures)
# ============================================================
print("\n=== Thread Pool (concurrent.futures) ===")

from concurrent.futures import ThreadPoolExecutor, as_completed

def stahni_stranku(url):
    """Simulace stahovani"""
    time.sleep(0.2)
    return f"Obsah z {url} ({len(url)} znaku)"

urls = ["http://example.com", "http://google.com", "http://github.com",
        "http://python.org", "http://stackoverflow.com"]

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=3) as executor:
    futures = {executor.submit(stahni_stranku, url): url for url in urls}
    for future in as_completed(futures):
        url = futures[future]
        vysledek = future.result()
        print(f"  {vysledek}")

print(f"  Cas: {time.perf_counter() - start:.2f}s (paralelne, ne 1s sekvencne)")


# ============================================================
#  MULTIPROCESSING (pro CPU-bound)
# ============================================================
print("\n=== Multiprocessing ===")
print("  (obchazi GIL - kazdy proces ma vlastni interpret)")

def cpu_intenzivni(n):
    """Vypocet souctu druych mocnin"""
    return sum(i*i for i in range(n))

# Sekvencne
start = time.perf_counter()
vysledky = [cpu_intenzivni(1_000_000) for _ in range(4)]
seq_cas = time.perf_counter() - start

# Paralelne (pomoci Pool)
start = time.perf_counter()
with multiprocessing.Pool(processes=4) as pool:
    vysledky_par = pool.map(cpu_intenzivni, [1_000_000] * 4)
par_cas = time.perf_counter() - start

print(f"  Sekvencne: {seq_cas:.3f}s")
print(f"  Paralelne: {par_cas:.3f}s")
print(f"  Zrychleni: {seq_cas/par_cas:.1f}x")

# Info o vlaknech
print(f"\n=== Info ===")
print(f"  Aktivni vlakna: {threading.active_count()}")
print(f"  CPU jadra: {multiprocessing.cpu_count()}")
print(f"  Hlavni vlakno: {threading.main_thread().name}")
