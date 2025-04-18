import { Converter } from "./api"
import { PayloadV1, PayloadV3, PayloadV5, PayloadV7, ReceiverV1, ReceiverV7 } from "./interfaces"

console.log("Hello World")

interface InternalRoute {
    version: string
}

const clientVersion = "V1"
const serverVersion = "V7"


function clientV1() {
    const payloadV1: PayloadV1 = {
        age: 19,
        name: "Hans Mark",
        height: 1.78
    }

    const converter = new Converter<{}, InternalRoute>(
        clientVersion, serverVersion,
        "Request", {}
    )

    const request_data = converter.convertRequest(payloadV1)

    const response = serverV7(request_data.payload)

    const response_data = converter.convertResponse(response)

    const receiver = new ReceiverV1()
    switch (response_data.internal_route.version) {
        case "V1":
            receiver.receive(response_data.payload as PayloadV1)
            break
    }
}

function serverV7(payload: unknown): unknown {
    const converter = new Converter<{}, InternalRoute>(
        serverVersion, clientVersion,
        "Respond", {}
    )

    const request_data = converter.convertRequest(payload)

    const receiver = new ReceiverV7()

    let response = undefined

    switch (request_data.internal_route.version) {
        case "V3":
            response = receiver.receiveV3(request_data.payload as PayloadV3)
            break
        case "V5":
            response = receiver.receiveV5(request_data.payload as PayloadV5)
            break
        case "V7":
            response = receiver.receive(request_data.payload as PayloadV7)
            break
    }

    const response_data = converter.convertResponse(response)


    return response_data.payload
}