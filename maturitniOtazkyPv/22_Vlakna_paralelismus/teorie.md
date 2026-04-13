# Vlákna a paralelní programování

## Základní pojmy

### Proces vs Vlákno:
| | Proces | Vlákno |
|-|--------|--------|
| Paměť | Vlastní adresní prostor | Sdílený adresní prostor |
| Vytvoření | Drahé (fork) | Levné |
| Komunikace | IPC (pipes, sockets, shared memory) | Sdílená paměť |
| Izolace | Chyba neovlivní jiné procesy | Chyba může shodit celý proces |

### Concurrency vs Parallelism:
- **Concurrency (souběžnost):** střídání úloh (i na 1 jádře) — illuse paralelismu
- **Parallelism (paralelismus):** skutečně současné vykonávání na více jádrech

## Vlákna (Threads)

### Životní cyklus vlákna:
```
New → Ready → Running → (Waiting) → Terminated
```

### Problémy s vlákny:
1. **Race condition** — dva vlákna čtou/zapisují sdílená data současně
2. **Deadlock** — dvě vlákna čekají navzájem na zámek
3. **Starvation** — vlákno se nikdy nedostane k prostředku
4. **Livelock** — vlákna reagují na sebe, ale nepostupují

## Synchronizace

### Mutex (Mutual Exclusion)
- Zámek — pouze jedno vlákno může vstoupit do kritické sekce
- `lock()` / `unlock()`

### Semafor
- Povoluje N vláknům současný přístup
- `acquire()` / `release()`

### Monitor
- Kombinace mutexu + podmínkových proměnných
- `wait()` / `notify()` / `notifyAll()`

### Deadlock — 4 nutné podmínky (Coffmanovy):
1. **Mutual exclusion** — prostředek je exkluzivní
2. **Hold and wait** — vlákno drží zámek a čeká na další
3. **No preemption** — zámek nelze odebrat
4. **Circular wait** — cyklické čekání

## Python a vlákna

### GIL (Global Interpreter Lock)
- CPython má GIL → **jen jedno vlákno** vykonává Python bytecode
- Vlákna v Pythonu jsou vhodná pro **I/O-bound** úlohy (síť, disk)
- Pro **CPU-bound** úlohy → `multiprocessing` (procesy)

### Threading vs Multiprocessing vs Asyncio:
| | threading | multiprocessing | asyncio |
|-|-----------|----------------|---------|
| Typ | Vlákna | Procesy | Korutiny |
| GIL | Omezen | Obejde | Omezen |
| Vhodné pro | I/O-bound | CPU-bound | I/O-bound (async) |
| Paměť | Sdílená | Oddělená | Sdílená |

## C# a paralelismus

### Task Parallel Library (TPL):
- `Task.Run()` — spuštění úlohy ve vlákně z thread poolu
- `async/await` — asynchronní programování
- `Parallel.For/ForEach` — paralelní smyčky

### async/await:
```csharp
async Task<string> NactiDataAsync() {
    var data = await httpClient.GetStringAsync(url);
    return data;
}
```
- Nezablokuje vlákno během čekání na I/O
- Kompilátor přeloží na stavový automat

## Java a vlákna

### Thread vs Runnable:
```java
// Dedicnost
class MyThread extends Thread { public void run() {...} }

// Interface (preferovane)
class MyRunnable implements Runnable { public void run() {...} }
```

### ExecutorService:
- Thread pool — znovupoužívání vláken
- `Executors.newFixedThreadPool(4)`
- `Future<T>` — výsledek asynchronní operace
- `synchronized` — klíčové slovo pro synchronizaci
