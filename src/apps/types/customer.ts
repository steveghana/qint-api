export type ICustomer = {
    id?: string;
    name: string;
    phone: string;
    agent: string;
    ipAddress: string;
    vapidEndpoint?: string;
    vapidEndpointIv?: string;
    vapidP256dh?: string;
    vapidP256dhIv?: string;
    vapidAuth?: string;
    vapidAuthIv?: string;
};

export type ISanitizedCustomer = Omit<
    ICustomer,
    | 'id'
    | 'ipAddress'
    | 'vapidEndpoint'
    | 'vapidEndpointIv'
    | 'vapidP256dh'
    | 'vapidP256dhIv'
    | 'vapidAuth'
    | 'vapidAuthIv'
>;
