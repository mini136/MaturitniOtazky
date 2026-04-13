using System;
using System.Collections.Generic;

namespace DatoveTypy
{
    // === ENUM ===
    enum Den { Pondeli, Utery, Streda, Ctvrtek, Patek, Sobota, Nedele }

    [Flags]
    enum Opravneni
    {
        Zadne = 0,
        Cteni = 1,
        Zapis = 2,
        Mazani = 4,
        Admin = Cteni | Zapis | Mazani
    }

    // === STRUCT ===
    struct Bod
    {
        public double X, Y;
        public Bod(double x, double y) { X = x; Y = y; }

        // Pretizeni operatoru
        public static Bod operator +(Bod a, Bod b) => new Bod(a.X + b.X, a.Y + b.Y);
        public static Bod operator *(Bod a, double s) => new Bod(a.X * s, a.Y * s);
        public static bool operator ==(Bod a, Bod b) => a.X == b.X && a.Y == b.Y;
        public static bool operator !=(Bod a, Bod b) => !(a == b);

        public override string ToString() => $"({X}, {Y})";
        public override bool Equals(object obj) => obj is Bod b && this == b;
        public override int GetHashCode() => HashCode.Combine(X, Y);
    }

    // === GENERIKA ===
    class Zasobnik<T>
    {
        private List<T> _items = new List<T>();

        public void Push(T item) => _items.Add(item);

        public T Pop()
        {
            if (_items.Count == 0) throw new InvalidOperationException("Zasobnik je prazdny");
            T item = _items[_items.Count - 1];
            _items.RemoveAt(_items.Count - 1);
            return item;
        }

        public T Peek() => _items[_items.Count - 1];
        public int Count => _items.Count;
        public bool JePrazdny => _items.Count == 0;
    }

    // Genericka metoda s constraintem
    class Utility
    {
        public static T Max<T>(T a, T b) where T : IComparable<T>
        {
            return a.CompareTo(b) >= 0 ? a : b;
        }

        public static void VypisVse<T>(IEnumerable<T> kolekce)
        {
            foreach (var item in kolekce)
                Console.Write($"{item} ");
            Console.WriteLine();
        }
    }

    // === ANOTACE (Atributy) ===
    [Obsolete("Pouzijte NovyKalkulator")]
    class StaryKalkulator
    {
        public int Secti(int a, int b) => a + b;
    }

    class Program
    {
        static void Main(string[] args)
        {
            // === VALUE vs REFERENCE ===
            Console.WriteLine("=== Value vs Reference types ===");
            int a = 5;
            int b = a;  // kopie
            b = 10;
            Console.WriteLine($"int: a={a}, b={b}");  // a=5, b=10

            int[] poleA = { 1, 2, 3 };
            int[] poleB = poleA;  // reference
            poleB[0] = 99;
            Console.WriteLine($"array: poleA[0]={poleA[0]}");  // 99!

            // === ENUM ===
            Console.WriteLine("\n=== Enum ===");
            Den dnes = Den.Streda;
            Console.WriteLine($"Dnes je: {dnes} (hodnota: {(int)dnes})");

            // Flags enum
            Opravneni prava = Opravneni.Cteni | Opravneni.Zapis;
            Console.WriteLine($"Opravneni: {prava}");
            Console.WriteLine($"Ma zapis? {prava.HasFlag(Opravneni.Zapis)}");
            Console.WriteLine($"Ma mazani? {prava.HasFlag(Opravneni.Mazani)}");

            // === STRUCT ===
            Console.WriteLine("\n=== Struct + operatory ===");
            Bod p1 = new Bod(3, 4);
            Bod p2 = new Bod(1, 2);
            Console.WriteLine($"p1 = {p1}");
            Console.WriteLine($"p1 + p2 = {p1 + p2}");
            Console.WriteLine($"p1 * 3 = {p1 * 3}");
            Console.WriteLine($"p1 == p2: {p1 == p2}");

            // === GENERIKA ===
            Console.WriteLine("\n=== Generika ===");
            var intStack = new Zasobnik<int>();
            intStack.Push(10);
            intStack.Push(20);
            intStack.Push(30);
            Console.WriteLine($"Pop: {intStack.Pop()}");  // 30
            Console.WriteLine($"Peek: {intStack.Peek()}"); // 20

            var strStack = new Zasobnik<string>();
            strStack.Push("ahoj");
            strStack.Push("svet");
            Console.WriteLine($"String Pop: {strStack.Pop()}");

            // Genericka metoda
            Console.WriteLine($"Max(3, 7) = {Utility.Max(3, 7)}");
            Console.WriteLine($"Max('a', 'z') = {Utility.Max('a', 'z')}");

            // === NULLABLE a NULL operatory ===
            Console.WriteLine("\n=== Nullable a null operatory ===");
            int? moznaNull = null;
            Console.WriteLine($"moznaNull ?? 42 = {moznaNull ?? 42}");

            string text = null;
            Console.WriteLine($"text?.Length = {text?.Length}");
            Console.WriteLine($"text?.ToUpper() ?? \"default\" = {text?.ToUpper() ?? "default"}");

            // === TERNARNI OPERATOR ===
            int vek = 20;
            string status = vek >= 18 ? "dospely" : "nezletily";
            Console.WriteLine($"\nTernarni: vek={vek} -> {status}");
        }
    }
}
