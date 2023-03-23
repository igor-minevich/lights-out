class DihedralNode {
    constructor(n) {
        this.n = n;
        this.selected = false;
        this.value = 0;
    }

    multiply(b, leftMultiply) {
        let a = this.value;
        let n = this.n;

        if (leftMultiply) {
            // Left multiplication: sr (s = a, r = b)
            this.value = (((a >= n ? 1 : 0) === (b >= n ? 1 : 0)) ? 0 : 1) * n + ((a + b * Math.pow(-1, (a >= n) ? 1 : 0)) % n);
        } else {
            // Right multiplication: rs (r = a, s = b)
            this.value = (((a >= n ? 1 : 0) === (b >= n ? 1 : 0)) ? 0 : 1) * n + ((a * Math.pow(-1, (b >= n) ? 1 : 0) + b) % n);
        }
    }
    toString() {
        if (this.value < this.n) {
            if (this.value === 0) {
                return "e"
            } else if (this.value === 1) {
                return "r"
            } else {
                return "r" + this.value;
            }
        } else {
            if (this.value - this.n === 0) {
                return "s"
            } else if (this.value - this.n === 1) {
                return "sr"
            } else {
                return "sr" + (this.value - this.n);
            }
        }
    }
}