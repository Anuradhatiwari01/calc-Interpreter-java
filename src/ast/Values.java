package ast;

/** Formats runtime values the way CALC prints them. */
public final class Values {

    private Values() {}

    public static String format(Object value) {
        if (value instanceof Double) {
            double d = (Double) value;
            if (d == Math.floor(d) && !Double.isInfinite(d)) {
                return String.valueOf((long) d); // 16.0 → "16"
            }
            return String.valueOf(d);            // 3.14 → "3.14"
        }
        return String.valueOf(value); // strings print as-is
    }
}
