class FreeAbelianNode {
    constructor() {
        this.value = '';
    }

    defaultMultiplier() {
        return "a";
    }

    identity() {
        return "1";
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

        let regex = /([a-zA-Z])(\d*)/g;
        let resultMap = new Map();

        for (const match of result.matchAll(regex)) {
            let generator = match[1];
            let exponent = parseInt(match[2]) || 1;

            if (resultMap.has(generator)) {
                exponent += resultMap.get(generator);
            }

            resultMap.set(generator, exponent);
        }

        // Perform cancellation
        let resultMapKeys = Array.from(resultMap.keys());
        for (let i = 0; i < resultMapKeys.length; i++) {
            let key = resultMapKeys[i];
            let inverseKey = key.toUpperCase() === key ? key.toLowerCase() : key.toUpperCase();

            if (resultMap.has(key) && resultMap.has(inverseKey)) {
                let minExponent = Math.min(resultMap.get(key), resultMap.get(inverseKey));
                resultMap.set(key, resultMap.get(key) - minExponent);
                resultMap.set(inverseKey, resultMap.get(inverseKey) - minExponent);
            }
        }

        // Reconstruct the result string
        result = '';
        resultMap.forEach((value, key) => {
            if (value > 0) {
                result += key + (value > 1 ? value : '');
            }
        });

        // return result.length === 0 ? this.identity() : result;
        return result;
    }



    normalizeInput(input) {
        let normalizedInput = '';
        let i = 0;

        while (i < input.length) {
            let letter = input[i];
            let count = 0;

            i++;
            while (i < input.length && !isNaN(input[i])) {
                count = count * 10 + parseInt(input[i]);
                i++;
            }

            for (let j = 0; j < count; j++) {
                normalizedInput += letter;
            }
        }

        return normalizedInput;
    }

    color() {
        return "white";
    }

    toString() {
        return this.value === '' ? this.identity() : this.value;
    }
}
