class CyclicalNode {
    constructor(n) {
        this.n = n;
        this.selected = false;
        this.value = 0;
        this.clicks = 0;
    }

    multiply(b, clicked) {
        let a = this.value;
        let n = this.n;

        this.value = (a + b) % n;

        if (clicked) {
            this.clicks = ++this.clicks % n;
        }
    }

    toString() {
        return this.clicks.toString();
    }
}