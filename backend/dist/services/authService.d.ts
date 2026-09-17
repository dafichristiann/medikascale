export declare function login(username: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    user: {
        id: any;
        username: any;
        role_id: any;
        permissions: any;
    };
}>;
export declare function refreshAccessToken(refreshToken: string): Promise<{
    token: string;
    user: {
        id: any;
        username: any;
        role_id: any;
        permissions: any;
    };
}>;
