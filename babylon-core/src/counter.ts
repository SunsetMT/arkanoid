export class Counter {
    cnt: number;
    constructor(a: number) {
        this.cnt = a;
    }

    public setValue(value: number): void {
        this.cnt = value;
    }

    public inc(): void {
        this.cnt++;
    }

    public addNumber(value: number): void {
        this.cnt += value;
    }

    public dec(): void {
        this.cnt--;
    }

    public decSmall(): void {
        this.cnt -= 0.1;
    }

    public get(): number {
        return this.cnt;
    }
}
