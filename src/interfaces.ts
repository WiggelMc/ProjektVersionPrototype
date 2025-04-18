type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

interface PayloadV1 {
    name: string
    age: number
    height: number
}

type PayloadV2 = Prettify<Omit<PayloadV1, "height"> & { height: string }>

type PayloadV3 = Prettify<Omit<PayloadV2, "age">>

type PayloadV4 = Prettify<Omit<PayloadV3, "name"> & { firstname: string, lastname: string }>

type PayloadV5 = Prettify<Omit<PayloadV4, "firstname" | "lastname"> & { name: { firstname: string, lastname: string, middlename?: string } }>

type PayloadV6 = Prettify<PayloadV5 & { id: string }>

type PayloadV7 = Prettify<PayloadV6 & { age: number }>
