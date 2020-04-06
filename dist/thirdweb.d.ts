export interface ThirdwebConfig {
    connectUrl: string;
}
export interface AutoPay {
    authorizeAmount: number;
    currency: string;
}
export interface LoginRequest {
    provider: string;
}
export interface Position {
    left: number;
    top: number;
}
export interface Size {
    width: number;
    height: number;
}
export interface TokenPayload {
    iss: string;
    aud: string;
    iat: number;
    exp: number;
    autopay: AutoPay;
}
export declare const DefaultThirdwebConfig: ThirdwebConfig;
export declare function initialize(config?: ThirdwebConfig): Thirdweb;
export declare class Thirdweb {
    private config;
    private token;
    private autopay;
    private handshake;
    constructor(config?: ThirdwebConfig);
    processRedirectResult(): void;
    embedThirdweb(): void;
    loginRequest(data: LoginRequest): void;
    logoutRequest(): void;
    loadToken(): null | undefined;
    validateToken(payload: TokenPayload): boolean;
}
