class QuaternionNode {
    constructor() {
        this.selected = false;
        this.value = "1"; // strict string representation
    }

    /* -------------------------
       Parsing
    ------------------------- */

    parseElement(str) {
        // Normalize input
        str = str.trim();

        if (str === "1")  return { sign:  1, base: "1" };
        if (str === "-1") return { sign: -1, base: "1" };

        let sign = 1;
        if (str[0] === "-") {
            sign = -1;
            str = str.slice(1);
        }

        if (!["i", "j", "k"].includes(str)) {
            throw new Error(`Invalid quaternion element: ${str}`);
        }

        return { sign, base: str };
    }

    toStringFromParsed(el) {
        if (el.base === "1") {
            return el.sign === 1 ? "1" : "-1";
        }
        return el.sign === 1 ? el.base : `-${el.base}`;
    }

    /* -------------------------
       Multiplication table
    ------------------------- */

    multiplyBases(a, b) {
        // returns { sign, base }
        if (a === "1") return { sign: 1, base: b };
        if (b === "1") return { sign: 1, base: a };

        if (a === b) return { sign: -1, base: "1" };

        const table = {
            "i,j": { sign:  1, base: "k" },
            "j,k": { sign:  1, base: "i" },
            "k,i": { sign:  1, base: "j" },

            "j,i": { sign: -1, base: "k" },
            "k,j": { sign: -1, base: "i" },
            "i,k": { sign: -1, base: "j" }
        };

        const key = `${a},${b}`;
        if (!table[key]) {
            throw new Error(`Invalid quaternion product: ${a} * ${b}`);
        }

        return table[key];
    }

    multiplyElements(a, b) {
        const baseResult = this.multiplyBases(a.base, b.base);
        return {
            sign: a.sign * b.sign * baseResult.sign,
            base: baseResult.base
        };
    }

    /* -------------------------
       Public multiply interface
    ------------------------- */

    multiply(bStr, leftMultiply, clicked) {
        const a = this.parseElement(this.value);
        const b = this.parseElement(bStr);

        const result = leftMultiply
            ? this.multiplyElements(b, a) // b · a
            : this.multiplyElements(a, b); // a · b

        this.value = this.toStringFromParsed(result);
    }

    /* -------------------------
       Coloring (simple & readable)
    ------------------------- */

    color() {
        const { sign, base } = this.parseElement(this.value);
    
        // Identity / -identity (r-like behavior)
        if (base === "1") {
            const MIN = 180;
            const g = sign === 1 ? 255 : MIN;
            return `rgb(255,${g},${g})`;
        }
    
        /*
          Map i, j, k to evenly spaced "k-values"
          so we can reuse the dihedral-style interpolation
        */
        const indexMap = { i: 0, j: 1, k: 2 };
        const v = indexMap[base];
        const t = v / 2; // 0, 0.5, 1
    
        const MIN = 180;
    
        let r = Math.round(MIN + t * (255 - MIN));
        let b = 255;
    
        // Darken slightly if negative
        if (sign === -1) {
            r = Math.max(MIN, r - 40);
            b = Math.max(MIN, b - 40);
        }
    
        return `rgb(${r},${MIN},${b})`;
    }
    

    toString() {
        return this.value;
    }
}
