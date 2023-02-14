class DihedralNode {
    constructor(n) {
        this.n = n;
        this.selected = false;
        this.value = 0;
    }

    multiply(b, clicked) {
        let a = this.value;
        let n = this.n;

        // (a>=n XOR b>=n)*n + ((a*(-1)^(b>=n) + b) % n)
        this.value = (((a >= n ? 1 : 0) === (b >= n ? 1 : 0)) ? 0 : 1) * n + ((a * Math.pow(-1, (b >= n) ? 1 : 0) + b) % n);
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