class FreeGroupNode {
    constructor() {
        this.value = '';
    }

    defaultMultiplier() {
        return 'a';
    }

    identity() {
        return '1';
    }

    multiply(input, leftMultiply, clicked) {
        let a = this.value;
        let b = input;

        if (leftMultiply) {
            this.value = this.performMultiplication(b, a);
        } else {
            this.value = this.performMultiplication(a, b);
        }
    }

    performMultiplication(a, b) {
        let result = a + b;
        return this.reduceString(result);
    }

    reduceString(s) {
        let L = this.parseString(s);
        let reducedL = this.combineTuples(L);
        return this.unparseString(reducedL);
    }

    parseString(s) {
        let regex = /([a-zA-Z])(\d*)/g;
        let L = [];
        for (const match of s.matchAll(regex)) {
            let generator = match[1];
            let exponent = parseInt(match[2]) || 1;
            L.push([generator, exponent]);
        }
        return L;
    }

    unparseString(L) {
        let s = '';
        for (const [generator, exponent] of L) {
            s += generator + (exponent > 1 ? exponent : '');
        }
        return s;
    }

    combineTuples(L) {
        let changed = true;
        while (changed) {
            changed = false;
            for (let i = 0; i < L.length - 1; i++) {
                let current = L[i];
                let next = L[i + 1];
                if (current[0].toUpperCase() === next[0].toUpperCase()) {
                    if (
                        (current[0].toLowerCase() === current[0] && next[0].toUpperCase() === next[0]) ||
                        (current[0].toUpperCase() === current[0] && next[0].toLowerCase() === next[0])
                    ) {
                        let newExponent = current[1] - next[1];
                        if (newExponent === 0) {
                            L.splice(i, 2);
                        } else {
                            current[1] = Math.abs(newExponent);
                            // Update the generator to have the correct case
                            current[0] = newExponent > 0 ? current[0].toLowerCase() : current[0].toUpperCase();
                            L.splice(i + 1, 1);
                        }
                    } else {
                        current[1] += next[1];
                        L.splice(i + 1, 1);
                    }
                    changed = true;
                }
            }
        }
        return L;
    }



    color() {
        return 'white';
    }

    toString() {
        return this.value === '' ? this.identity() : this.value;
    }
}


