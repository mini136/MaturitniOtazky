import java.util.ArrayList;
import java.util.List;

public class Dedicnost {

    // === ABSTRAKTNI TRIDA ===
    static abstract class Tvar {
        String barva;

        Tvar(String barva) {
            this.barva = barva;
        }

        // Abstraktni metoda - potomci MUSI implementovat
        abstract double obsah();

        abstract double obvod();

        // Konkretni metoda - zdedena
        void info() {
            System.out.printf("  %s [%s]: obsah=%.2f, obvod=%.2f%n",
                    getClass().getSimpleName(), barva, obsah(), obvod());
        }
    }

    // === INTERFACE ===
    interface Kreslitelny {
        void nakresli();
    }

    interface Zmensitelny {
        void zmensi(double faktor);
    }

    // === DEDICNOST + OVERRIDE ===
    static class Kruh extends Tvar implements Kreslitelny {
        double polomer;

        Kruh(double polomer, String barva) {
            super(barva); // volani konstruktoru rodice
            this.polomer = polomer;
        }

        @Override
        double obsah() {
            return Math.PI * polomer * polomer;
        }

        @Override
        double obvod() {
            return 2 * Math.PI * polomer;
        }

        @Override
        public void nakresli() {
            System.out.println("  Kreslim kruh s polomerem " + polomer);
        }
    }

    static class Obdelnik extends Tvar implements Kreslitelny, Zmensitelny {
        double sirka, vyska;

        Obdelnik(double sirka, double vyska, String barva) {
            super(barva);
            this.sirka = sirka;
            this.vyska = vyska;
        }

        @Override
        double obsah() {
            return sirka * vyska;
        }

        @Override
        double obvod() {
            return 2 * (sirka + vyska);
        }

        @Override
        public void nakresli() {
            System.out.printf("  Kreslim obdelnik %sx%s%n", sirka, vyska);
        }

        @Override
        public void zmensi(double faktor) {
            sirka *= faktor;
            vyska *= faktor;
        }
    }

    // Dalsi uroven dedicnosti
    static class Ctverec extends Obdelnik {
        Ctverec(double strana, String barva) {
            super(strana, strana, barva);
        }

        @Override
        public void nakresli() {
            System.out.println("  Kreslim ctverec " + sirka + "x" + sirka);
        }
    }

    // === FUNCTION OVERLOADING ===
    static class Kalkulacka {
        // Stejny nazev, ruzne parametry
        static int secti(int a, int b) {
            return a + b;
        }

        static double secti(double a, double b) {
            return a + b;
        }

        static int secti(int a, int b, int c) {
            return a + b + c;
        }

        static String secti(String a, String b) {
            return a + b;
        }
    }

    // === MAIN ===
    public static void main(String[] args) {
        System.out.println("=== Dedicnost a Polymorfismus ===");

        // Polymorfismus - rodic. typ, ruzne skutecne typy
        List<Tvar> tvary = new ArrayList<>();
        tvary.add(new Kruh(5, "cervena"));
        tvary.add(new Obdelnik(4, 6, "modra"));
        tvary.add(new Ctverec(3, "zelena"));

        for (Tvar t : tvary) {
            t.info(); // vola spravny override podle skutecneho typu
        }

        // === INTERFACE POLYMORFISMUS ===
        System.out.println("\n=== Interface ===");
        List<Kreslitelny> kreslitelne = new ArrayList<>();
        kreslitelne.add(new Kruh(3, "bila"));
        kreslitelne.add(new Obdelnik(2, 4, "cerna"));
        kreslitelne.add(new Ctverec(5, "seda"));

        for (Kreslitelny k : kreslitelne) {
            k.nakresli();
        }

        // === OVERLOADING ===
        System.out.println("\n=== Function Overloading ===");
        System.out.println("secti(3, 5) = " + Kalkulacka.secti(3, 5));
        System.out.println("secti(3.1, 5.2) = " + Kalkulacka.secti(3.1, 5.2));
        System.out.println("secti(1, 2, 3) = " + Kalkulacka.secti(1, 2, 3));
        System.out.println("secti(\"ahoj\", \" svete\") = " + Kalkulacka.secti("ahoj", " svete"));

        // === instanceof kontrola ===
        System.out.println("\n=== instanceof ===");
        Tvar t = new Ctverec(4, "modra");
        System.out.println("t instanceof Ctverec:  " + (t instanceof Ctverec));
        System.out.println("t instanceof Obdelnik: " + (t instanceof Obdelnik)); // true! Ctverec dedi z Obdelnik
        System.out.println("t instanceof Tvar:     " + (t instanceof Tvar));
        System.out.println("t instanceof Kreslitelny: " + (t instanceof Kreslitelny));
    }
}
