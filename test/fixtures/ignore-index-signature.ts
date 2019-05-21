export interface ITest {
    [extra: string]: any;
}

export interface INestedLiteralIndexSignature {
    nestedIndexSignature: {
        [key: string]: string | number | boolean;
    }
}