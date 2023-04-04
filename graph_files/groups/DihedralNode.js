class DihedralNode {
    constructor(n) {
        this.n = n;
        this.selected = false;
        this.value = 0;
    }



    multiply(b, leftMultiply, clicked) {
        let a = this.value;
        let n = this.n;

        if (leftMultiply) {
            // Left multiplication: sr (s = a, r = b)
            this.value = (((a >= n ? 1 : 0) === (b >= n ? 1 : 0)) ? 0 : 1) * n + ((a + b * Math.pow(-1, (a >= n) ? 1 : 0) + n) % n);
        } else {
            // Right multiplication: rs (r = a, s = b)
            this.value = (((a >= n ? 1 : 0) === (b >= n ? 1 : 0)) ? 0 : 1) * n + ((a + b * Math.pow(-1, (b >= n) ? 1 : 0) + n) % n);
        }
    }

    color() {
        if (this.value < this.n)//if value is 0 return white, if value is n - 1 return red. exp for green and blue: 255 - value * 255 / (n-1). 
            return "rgb(255," + (255 - this.value * 255 / (this.n - 1)) + "," + (255 - this.value * 255 / (this.n - 1)) + ")";
        else {
            let val = this.value - this.n; // if val = 0, this is s - blue; if val = n-1, this is sr^(n-1) - purple (red+blue)
            return "rgb(" + (val * 255 / (this.n - 1)) + "," + 0 + ", 255)";
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