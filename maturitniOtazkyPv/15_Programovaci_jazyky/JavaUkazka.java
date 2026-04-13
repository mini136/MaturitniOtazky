/**
 * Srovnani - JAVA verze
 * Staticke typovani, JVM, silne typovani
 */
public class JavaUkazka {

    // Staticke typovani - typ je fixni
    static int cislo = 42;
    // cislo = "ahoj"; // CHYBA pri kompilaci!

    // Generika - typova bezpecnost
    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    // Interface - explicitni kontrakt (ne duck typing)
    interface Zvuk {
        String zvuk();
    }

    static class Pes implements Zvuk {
        @Override
        public String zvuk() {
            return "Haf!";
        }
    }

    static class Kocka implements Zvuk {
        @Override
        public String zvuk() {
            return "Mnau!";
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Java - staticke typovani ===");

        // Typ promenne se NEMENI
        int x = 42;
        // x = "ahoj"; // Compile error!
        System.out.println("x = " + x + ", typ: int");

        // Autoboxing
        Integer boxed = x; // int -> Integer (autoboxing)
        System.out.println("Autoboxed: " + boxed);

        // Generika
        System.out.println("\n=== Generika ===");
        System.out.println("max(3, 7) = " + max(3, 7));
        System.out.println("max(\"abc\", \"xyz\") = " + max("abc", "xyz"));

        // Interface polymorfismus (vs Python duck typing)
        System.out.println("\n=== Interface (explicitni kontrakt) ===");
        Zvuk[] zvirata = { new Pes(), new Kocka() };
        for (Zvuk z : zvirata) {
            System.out.println("  " + z.getClass().getSimpleName() + ": " + z.zvuk());
        }

        // var (lokalni typova inference od Java 10)
        System.out.println("\n=== var (type inference) ===");
        var text = "Java 10+";
        var seznam = java.util.List.of(1, 2, 3);
        System.out.println("var text: " + text);
        System.out.println("var seznam: " + seznam);

        // String pool
        System.out.println("\n=== String pool ===");
        String s1 = "hello";
        String s2 = "hello";
        String s3 = new String("hello");
        System.out.println("s1 == s2: " + (s1 == s2)); // true (stejny pool)
        System.out.println("s1 == s3: " + (s1 == s3)); // false (novy objekt)
        System.out.println("s1.equals(s3): " + s1.equals(s3)); // true (obsah)

        // JVM info
        System.out.println("\n=== JVM info ===");
        System.out.println("Java version: " + System.getProperty("java.version"));
        System.out.println("JVM: " + System.getProperty("java.vm.name"));
        System.out.println("Max memory: " + Runtime.getRuntime().maxMemory() / 1024 / 1024 + " MB");
    }
}
