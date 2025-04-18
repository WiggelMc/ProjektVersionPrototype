
export interface ConversionData<PathRoute, InternalRoute> {
    payload: unknown
    path_route: PathRoute 
    internal_route: InternalRoute 
}

export interface HTTP {
    method: "GET" | "POST" | "PUT"
    route: string
}

interface InterfaceRoute {
    interface_version: string
}

export class Converter<PathRoute, InternalRoute = {}> {
    own_version: string
    other_version: string
    direction: string
    route: PathRoute

    constructor(
        own_version: string, // Compile time constant
        other_version: string,
        direction: "Request" | "Respond",
        route: PathRoute
    ) {
        this.own_version = own_version
        this.other_version = other_version
        this.direction = direction
        this.route = route
    }

    convertRequest(payload: unknown): ConversionData<PathRoute, InternalRoute> {
        // "Request": convert to other / "Respond": convert to own
        throw new Error("Not Implemented")
    }

    convertResponse(payload: unknown): ConversionData<PathRoute, InternalRoute> {
        // "Request": convert to own / "Respond": convert to other
        throw new Error("Not Implemented")
    }
}


// Client 1.2 [HTTP 1.2 -> HTTP 1.1]    >> (HTTP 1.1) >>    Server 1.1 [NOP]
// Server 1.1 [NOP]                     >> (HTTP 1.1) >>    Client 1.2 [HTTP 1.1 -> DirectedHTTP 1.2 | HTTP 1.2]

// Client 1.2 [NOP]                     >> (HTTP 1.2) >>    Server 1.3 [HTTP 1.2 -> DirectedHTTP 1.3 | HTTP 1.3]
// Server 1.3 [HTTP 1.3 -> HTTP 1.2]    >> (HTTP 1.2) >>    Client 1.2 [NOP]


// const out_data = convert<HTTP, InterfaceRoute>(
//     "V1",
//     "V2",
//     "ClientToServer",
//     {
//         payload: {
//             name: "Peter"
//         },
//         routing: {
//             method: "PUT",
//             route: "user/"
//         }
//     }
// )

// const x = out_data


const input = {
    method: "GET",
    route: "/",
    payload: "name: peter"
}

const output = {
    method: "GET",
    route: "/v1/",
    payload: "name: peter"
}


const input2 = {
    method: "GET",
    route: "/",
    payload: "..."
}

const output2 = {
    method: "GET",
    route: "/",
    interface: "V1",
    payload: "..."
}