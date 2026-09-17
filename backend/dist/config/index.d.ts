export declare const config: {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    db: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiry: string;
        refreshExpiry: string;
    };
};
