export interface ITest {
    myGeneric: IMyType<string>;
}

export interface IMyType<T> {
    value: T;
}
