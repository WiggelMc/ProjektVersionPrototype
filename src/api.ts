
interface ConversionData<Routing> {
    payload: unknown
    routing: Routing 
}

interface HTTP {
    method: "GET" | "POST" | "PUT"
    route: string
}

interface DirectedHTTP extends HTTP {
    interface_version: string
}


function convert<RoutingInput, RoutingOutput extends RoutingInput = RoutingInput>(
	client_version: string,
	server_version: string,
	direction: "ClientToServer" | "ServerToClient",
	data: ConversionData<RoutingInput>
): ConversionData<RoutingOutput>



// Client 1.2 [HTTP 1.2 -> HTTP 1.1]    >> (HTTP 1.1) >>    Server 1.1 [NOP]
// Server 1.1 [NOP]                     >> (HTTP 1.1) >>    Client 1.2 [HTTP 1.1 -> DirectedHTTP 1.2 | HTTP 1.2]

// Client 1.2 [NOP]                     >> (HTTP 1.2) >>    Server 1.3 [HTTP 1.2 -> DirectedHTTP 1.3 | HTTP 1.3]
// Server 1.3 [HTTP 1.3 -> HTTP 1.2]    >> (HTTP 1.2) >>    Client 1.2 [NOP]


const out_data = convert<HTTP, DirectedHTTP>(
    "V1",
    "V2",
    "ClientToServer",
    {
        payload: {
            name: "Peter"
        },
        routing: {
            method: "PUT",
            route: "user/"
        }
    }
)

const x = out_data


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
                {interface: "V1"}
    payload: "..."
}