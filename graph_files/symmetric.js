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

        // -----------------------------
        // CASE 1: Cycle notation
        // -----------------------------
        if (cleaned.includes("(")) {
            // Start with identity
            const perm = this.identity();

            // Match all cycles like (123)
            const cycles = cleaned.match(/\(([^)]+)\)/g);
            if (!cycles) return null;

            for (let cycle of cycles) {
                // Remove parentheses and split digits
                const nums = cycle
                    .replace(/[()]/g, "")
                    .split("")
                    .map(Number);

                // Validate digits
                for (let d of nums) {
                    if (d < 1 || d > this.n) return null;
                }

                // Apply cycle: (a b c) means a→b, b→c, c→a
                for (let i = 0; i < nums.length; i++) {
                    const from = nums[i] - 1;
                    const to = nums[(i + 1) % nums.length];
                    perm[from] = to;
                }
            }

            return perm;
        }

        // -----------------------------
        // CASE 2: One-line notation
        // -----------------------------
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
        // Check if identity
        const isIdentity = this.value.every((v, i) => v === i + 1);
        if (isIdentity) {
            return "rgb(255,255,255)";
        }

        const MIN = 180;
        const scale = this.n - 1 || 1;

        // Normalize first 3 coordinates into [0,1]
        const t1 = (this.value[0] - 1) / scale;
        const t2 = (this.value[1] - 1) / scale;
        const t3 = (this.value[2 % this.n] - 1) / scale;

        const r = Math.round(MIN + t1 * (255 - MIN));
        const g = Math.round(MIN + t2 * (255 - MIN));
        const b = Math.round(MIN + t3 * (255 - MIN));

        return `rgb(${r},${g},${b})`;
    }

    toString() {
        return this.value.join("");
    }
}