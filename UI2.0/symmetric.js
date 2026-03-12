class SymmetricNode {
    constructor(n) {
        this.n = n;            
        this.selected = false;
        this.value = this.identity(); 
    }

    // Identity permutation
    identity() {
        return Array.from({ length: this.n }, (_, i) => i + 1);
    }

    // Parse input into permutation array
    parseElement(el) {
        if (Array.isArray(el)) {
            el = el.join("");
        }
    
        if (typeof el === "number") {
            el = String(el);
        }
    
        if (typeof el !== "string") {
            return null;
        }
    
        const cleaned = el.trim();
    
        if (cleaned.length !== this.n) return null;
        if (!/^\d+$/.test(cleaned)) return null;
    
        const digits = cleaned.split("").map(Number);
    
        for (let d of digits) {
            if (d < 1 || d > this.n) return null;
        }
    
        if (new Set(digits).size !== this.n) return null;
    
        return digits;
    }

    toCycleString() {
        const perm = this.value;
        const visited = new Array(this.n).fill(false);
        const cycles = [];
    
        for (let i = 0; i < this.n; i++) {
            if (!visited[i]) {
                let cycle = [];
                let j = i;
    
                while (!visited[j]) {
                    visited[j] = true;
                    cycle.push(j + 1);
                    j = perm[j] - 1;
                }
    
                if (cycle.length > 1) {
                    cycles.push("(" + cycle.join("") + ")");
                }
            }
        }
    
        if (cycles.length === 0) {
            return "()"; // identity
        }
    
        return cycles.join("");
    }

    // Compose permutations
    compose(a, b) {
        const result = [];

        for (let i = 0; i < this.n; i++) {
            // b sends (i+1) → b[i]
            // a sends that → a[b[i]-1]
            result[i] = a[b[i] - 1];
        }

        return result;
    }

    // Multiply node by permutation
    multiply(multiplier, leftMultiply = true) {
        const current = this.parseElement(this.value);
        const perm = this.parseElement(multiplier);
    
        if (!current || !perm) return false;
    
        const result = leftMultiply
            ? this.compose(perm, current)
            : this.compose(current, perm);
    
        this.value = result;
        return true;
    }

    // Generate all permutations of size n
    static generateAll(n) {
        const results = [];

        function permute(arr, l = 0) {
            if (l === arr.length - 1) {
                results.push(arr.slice());
                return;
            }
            for (let i = l; i < arr.length; i++) {
                [arr[l], arr[i]] = [arr[i], arr[l]];
                permute(arr, l + 1);
                [arr[l], arr[i]] = [arr[i], arr[l]];
            }
        }

        permute(Array.from({ length: n }, (_, i) => i + 1));
        return results;
    }

    // Visual encoding (maps permutation to color)
    color() {
        const scale = this.n - 1 || 1;

        const r = 255 * (this.value[0] - 1) / scale;
        const g = 255 * (this.value[1] - 1) / scale;
        const b = 255 * (this.value[2 % this.n] - 1) / scale;

        const alpha = 0.5;
        const bg = 255;

        const rr = Math.round(alpha * r + (1 - alpha) * bg);
        const gg = Math.round(alpha * g + (1 - alpha) * bg);
        const bb = Math.round(alpha * b + (1 - alpha) * bg);

        return `rgb(${rr},${gg},${bb})`;
    }

    toString() {
        return this.value.join("");
    }
}