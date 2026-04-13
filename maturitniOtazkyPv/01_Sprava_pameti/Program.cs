using System;

namespace SpravaPameti
{
    // Ukazka value type vs reference type
    struct Bod   // VALUE TYPE - uklada se na stack
    {
        public int X, Y;
        public Bod(int x, int y) { X = x; Y = y; }
    }

    class Osoba  // REFERENCE TYPE - uklada se na heap
    {
        public string Jmeno;
        public Osoba(string jmeno) { Jmeno = jmeno; }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // === VALUE TYPES - kopiruje se hodnota ===
            Console.WriteLine("=== Value Types (struct) ===");
            Bod a = new Bod(1, 2);
            Bod b = a;          // kopie hodnoty
            b.X = 99;
            Console.WriteLine($"a.X = {a.X}");  // 1 — nezmeneno
            Console.WriteLine($"b.X = {b.X}");  // 99

            // === REFERENCE TYPES - kopiruje se reference ===
            Console.WriteLine("\n=== Reference Types (class) ===");
            Osoba o1 = new Osoba("Alice");
            Osoba o2 = o1;      // kopie reference (oba ukazuji na stejny objekt)
            o2.Jmeno = "Bob";
            Console.WriteLine($"o1.Jmeno = {o1.Jmeno}");  // Bob — zmeneno!
            Console.WriteLine($"o2.Jmeno = {o2.Jmeno}");  // Bob

            // === GARBAGE COLLECTOR ===
            Console.WriteLine("\n=== Garbage Collector ===");
            Console.WriteLine($"GC Max Generations: {GC.MaxGeneration}");  // typicky 2

            var obj = new byte[1024 * 1024]; // 1MB na heapu
            Console.WriteLine($"Generace objektu: {GC.GetGeneration(obj)}"); // 0

            GC.Collect(0); // vynutime kolekci Gen0
            Console.WriteLine($"Po GC.Collect(0): generace = {GC.GetGeneration(obj)}"); // 1

            GC.Collect(1);
            Console.WriteLine($"Po GC.Collect(1): generace = {GC.GetGeneration(obj)}"); // 2

            // === WEAK REFERENCE ===
            Console.WriteLine("\n=== WeakReference ===");
            var silna = new Osoba("Charlie");
            WeakReference<Osoba> slaba = new WeakReference<Osoba>(silna);

            if (slaba.TryGetTarget(out Osoba target))
                Console.WriteLine($"Slaba reference zije: {target.Jmeno}");

            silna = null;   // odstranime silnou referenci
            GC.Collect();   // GC muze uvolnit objekt

            if (slaba.TryGetTarget(out target))
                Console.WriteLine($"Stale zije: {target.Jmeno}");
            else
                Console.WriteLine("Objekt byl uvolnen GC!");

            // === IDisposable pattern ===
            Console.WriteLine("\n=== IDisposable (using) ===");
            using (var r = new MujResource())
            {
                r.Pouzij();
            } // automaticky zavola Dispose()
        }
    }

    class MujResource : IDisposable
    {
        public void Pouzij() => Console.WriteLine("Resource pouzit");

        public void Dispose()
        {
            Console.WriteLine("Resource uvolnen (Dispose)");
        }
    }
}
