using System;
using System.Collections.Generic;
using System.Linq;

namespace LambdaDelegaty
{
    // === Definice vlastniho delegatu ===
    delegate int MathOperace(int a, int b);

    // === Event ukazka ===
    class Tlacitko
    {
        public event EventHandler<string> Kliknuto;

        public void Klikni()
        {
            Console.WriteLine("Tlacitko stisknuto!");
            Kliknuto?.Invoke(this, "Button1");
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // === DELEGATY ===
            Console.WriteLine("=== Delegaty ===");

            MathOperace soucet = (a, b) => a + b;
            MathOperace soucin = (a, b) => a * b;

            Console.WriteLine($"soucet(3, 5) = {soucet(3, 5)}");
            Console.WriteLine($"soucin(3, 5) = {soucin(3, 5)}");

            // Delegat jako parametr
            int vysledek = ProvedOperaci(soucet, 10, 20);
            Console.WriteLine($"ProvedOperaci(soucet, 10, 20) = {vysledek}");

            // === FUNC, ACTION, PREDICATE ===
            Console.WriteLine("\n=== Func, Action, Predicate ===");

            Func<int, int, int> mocnina = (zaklad, exp) => (int)Math.Pow(zaklad, exp);
            Console.WriteLine($"Func mocnina(2, 8) = {mocnina(2, 8)}");

            Action<string> vypis = msg => Console.WriteLine($"  Action rika: {msg}");
            vypis("Ahoj!");

            Predicate<int> jeSude = n => n % 2 == 0;
            Console.WriteLine($"Predicate jeSude(4) = {jeSude(4)}");
            Console.WriteLine($"Predicate jeSude(7) = {jeSude(7)}");

            // === LAMBDA s LINQ ===
            Console.WriteLine("\n=== Lambda + LINQ ===");
            var cisla = new List<int> { 3, 1, 4, 1, 5, 9, 2, 6 };

            var suda = cisla.Where(x => x % 2 == 0).ToList();
            var dvojnasobek = cisla.Select(x => x * 2).ToList();
            var setridena = cisla.OrderByDescending(x => x).ToList();

            Console.WriteLine($"Puvodni:     [{string.Join(", ", cisla)}]");
            Console.WriteLine($"Suda:        [{string.Join(", ", suda)}]");
            Console.WriteLine($"Dvojnasobek: [{string.Join(", ", dvojnasobek)}]");
            Console.WriteLine($"Sestupne:    [{string.Join(", ", setridena)}]");

            // === MULTICAST DELEGAT ===
            Console.WriteLine("\n=== Multicast delegat ===");
            Action<string> chain = msg => Console.WriteLine($"  Handler 1: {msg}");
            chain += msg => Console.WriteLine($"  Handler 2: {msg.ToUpper()}");
            chain += msg => Console.WriteLine($"  Handler 3: delka={msg.Length}");
            chain("test");

            // === EVENTY ===
            Console.WriteLine("\n=== Eventy ===");
            var btn = new Tlacitko();
            btn.Kliknuto += (sender, nazev) => Console.WriteLine($"  Subscriber 1: kliknuto na {nazev}");
            btn.Kliknuto += (sender, nazev) => Console.WriteLine($"  Subscriber 2: loguji {nazev}");
            btn.Klikni();
        }

        static int ProvedOperaci(MathOperace operace, int a, int b)
        {
            return operace(a, b);
        }
    }
}
