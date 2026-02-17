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
    
        // Raw RGB from group coordinates
        const r = 255 * a / scale;
        const g = 255 * b / scale;
        const bl = 255 * c / scale;
    
        const alpha = 0.5;      // visual strength
        const bg = 255;         // white background
    
        // Pre-blend alpha into RGB
        const rr = Math.round(alpha * r + (1 - alpha) * bg);
        const gg = Math.round(alpha * g + (1 - alpha) * bg);
        const bb = Math.round(alpha * bl + (1 - alpha) * bg);
    
        return `rgb(${rr},${gg},${bb})`;
    }
    
    

    toString() {
        const [a, b, c] = this.value;
        return `${a},${b},${c}`;
    }
}
