type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

export interface PayloadV1 {
    name: string
    age: number
    height: number
}

export type PayloadV2 = Prettify<Omit<PayloadV1, "height"> & { height: string }>

export type PayloadV3 = Prettify<Omit<PayloadV2, "age">>

export type PayloadV4 = Prettify<Omit<PayloadV3, "name"> & { firstname: string, lastname: string }>

export type PayloadV5 = Prettify<Omit<PayloadV4, "firstname" | "lastname"> & { name: { firstname: string, lastname: string, middlename?: string } }>

export type PayloadV6 = Prettify<PayloadV5 & { id: string }>

export type PayloadV7 = Prettify<PayloadV6 & { age: number }>

export class ReceiverV7 {
    receive(payload: PayloadV7): PayloadV7 {
        console.log("P7", payload)
        return payload
    }

    receiveV5(payload: PayloadV5): PayloadV5 {
        console.log("P5", payload)
        return payload
    }

    receiveV3(payload: PayloadV3): PayloadV3 {
        console.log("P3", payload)
        return payload
    }
}

export class ReceiverV1 {
    receive(payload: PayloadV1): PayloadV1 {
        console.log("P1", payload)
        return payload
    }
}