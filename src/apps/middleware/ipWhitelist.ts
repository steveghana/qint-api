import { Request, Response, NextFunction } from 'express';

export type IMockRequest = {
    headers: {
        'x-forwarded-for'?: string | string[];
    };
    socket: {
        remoteAddress?: string;
    };
};

export type IMockResponse = {
    status: (number: number) => IMockResponse;
    send: () => void;
};

export type IMockNextFunction = (err?: Error) => void;

type RequestType = Request | IMockRequest;
type ResponseType = Response | IMockResponse;
type NextFunctionType = NextFunction | IMockNextFunction;

export default function ipWhitelist(ips: string[]) {
    return (req: RequestType, res: ResponseType, next: NextFunctionType): void => {
        const arrToStr = (arrOrStr: string | string[]): string => (Array.isArray(arrOrStr) ? arrOrStr[0] : arrOrStr);
        const ip = arrToStr(req.headers['x-forwarded-for']) || req.socket.remoteAddress;
        if (!ip || !ips.includes(ip)) {
            res.status(404).send();
            return;
        }
        next();
    };
}
