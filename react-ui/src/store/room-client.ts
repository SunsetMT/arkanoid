export interface roomClient {
    name: string,
    id: string,
    connected: boolean,
    ready: boolean
}

export const initialStateClient: roomClient = {
    name: '',
    id: '',
    connected: false,
    ready: false
}
