const kp_passport = Symbol();

export class StrategyBase {


    constructor(passport) {
        this[kp_passport] = passport;
    }

    get passport() {
        return this[kp_passport];
    }

    use() {
        // stub
    }
}