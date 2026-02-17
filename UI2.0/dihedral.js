class DihedralNode {
    constructor(n) {
        this.n = n;
        this.selected = false;
        this.value = "e"; // strict string representation
    }

    toSuperscript(num) {
        const sup = {
            "0": "⁰", "1": "¹", "2": "²", "3": "³",
            "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷",
            "8": "⁸", "9": "⁹", "-": "⁻"
        };
    
        return num.toString()
            .split("")
            .map(ch => sup[ch] || ch)
            .join("");
    }    
    

    // Normalize parsed elements from user input
    parseElement(str) {
        // returns { type: "r" | "s", k } where inputed element
        // is the simplified r^k or s*r^k
        if (str === "e") return { type: "r", k: 0 };

        let hasS = str.includes("s");
        let match = str.match(/[rR](-?\d+)?/);

        let k = 0;
        if (match) {
            let power = match[1] ? parseInt(match[1]) : 1;
            if (match[0][0] === "R") power = -power;
            k = ((power % this.n) + this.n) % this.n;
        }

        return hasS ? { type: "s", k } : { type: "r", k };
    }

    toStringFromParsed(el) {
        if (el.type === "r") {
            if (el.k === 0) return "e";
            return el.k === 1 ? "r" : `r${el.k}`;
        } else {
            if (el.k === 0) return "s";
            return el.k === 1 ? "sr" : `sr${el.k}`;
        }
    }
    

    // Function for handling the specific multiplicative rules
    multiplyElements(a, b) {
        // r^i r^j = r^(i+j)
        if (a.type === "r" && b.type === "r") {
            return { type: "r", k: (a.k + b.k) % this.n };
        }

        // r^i · s r^j = s r^(j - i)
        if (a.type === "r" && b.type === "s") {
            return { type: "s", k: (b.k - a.k + this.n) % this.n };
        }

        // s r^i · r^j = s r^(i + j)
        if (a.type === "s" && b.type === "r") {
            return { type: "s", k: (a.k + b.k) % this.n };
        }

        // s r^i · s r^j = r^(j - i)
        if (a.type === "s" && b.type === "s") {
            return { type: "r", k: (b.k - a.k + this.n) % this.n };
        }

    }

    // Takes parsed elements and sends to multiplyElements based on 
    // side of multiplication
    multiply(bStr, leftMultiply, clicked) {
        let a = this.parseElement(this.value);
        let b = this.parseElement(bStr);

        let result = leftMultiply
            ? this.multiplyElements(b, a) // b · a
            : this.multiplyElements(a, b); // a · b

        this.value = this.toStringFromParsed(result);
    }

    // Node-coloring function refitted to make black text more visible
    color() {
        let parsed = this.parseElement(this.value);
        let v = parsed.k;
        let t = v / Math.max(1, this.n - 1); 
    
        const MIN = 180; 
    
        if (parsed.type === "r") {
            let g = Math.round(255 - t * (255 - MIN));
            return `rgb(255,${g},${g})`;
        } else {
            let r = Math.round(MIN + t * (255 - MIN));
            let b = Math.round(255);
            return `rgb(${r},${MIN},${b})`;
        }
    }
    
    toString() {
        let parsed = this.parseElement(this.value);
    
        if (parsed.type === "r") {
            if (parsed.k === 0) return "e";
            if (parsed.k === 1) return "r";
            return `r${this.toSuperscript(parsed.k)}`;
        } else {
            if (parsed.k === 0) return "s";
            if (parsed.k === 1) return "sr";
            return `sr${this.toSuperscript(parsed.k)}`;
        }
    }
    
}
