export class StrategyBase {
    #passport;

    constructor(passport) {
        this.#passport = passport;
    }

    get passport() {
        return this.#passport;
    }

    use() {
        // stub
    }
}