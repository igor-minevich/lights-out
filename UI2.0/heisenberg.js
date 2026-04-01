class HeisenbergNode {
    constructor(p) {
        this.p = p;
        this.selected = false;
        this.value = [0, 0, 0]; // (a, b, c)
    }

    // Normalize input into [a,b,c] mod p
    parseElement(el) {
        let [a, b, c] = el;
        return [
            ((a % this.p) + this.p) % this.p,
            ((b % this.p) + this.p) % this.p,
            ((c % this.p) + this.p) % this.p
        ];
    }

    // Core Heisenberg multiplication
    multiplyElements(x, y) {
        const [a, b, c] = x;
        const [ap, bp, cp] = y;

        return [
            (a + ap) % this.p,
            (b + bp) % this.p,
            (c + cp + a * bp) % this.p
        ];
    }

    // Multiply current node value by given element
    multiply(multiplier, leftMultiply = true) {
        const a = this.parseElement(this.value);
        const b = this.parseElement(multiplier);

        const result = leftMultiply
            ? this.multiplyElements(b, a) // b · a
            : this.multiplyElements(a, b); // a · b

        this.value = result;
    }

    // Visual encoding
    color() {
        const [a, b, c] = this.value;
        const scale = this.p - 1 || 1;

        const MIN = 180;
        const MAX = 240; // <-- key fix (anything < 255 works)

        // Normalize
        const t1 = a / scale;
        const t2 = b / scale;
        const t3 = c / scale;

        // Reverse gradient: higher values → darker
        const rr = Math.round(MAX - t1 * (MAX - MIN));
        const gg = Math.round(MAX - t2 * (MAX - MIN));
        const bVal = Math.round(MAX - t3 * (MAX - MIN));

        // Identity → pure white
        if (a === 0 && b === 0 && c === 0) {
            return `rgb(255,255,255)`;
        } else {
            return `rgb(${rr},${gg},${bVal})`;
        }
    }

    toString() {
        const [a, b, c] = this.value;
        return `${a},${b},${c}`;
    }
}
