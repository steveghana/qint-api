import { Request, Response, NextFunction } from 'express';

export type IMockRequest = any;
export type IMockResponse = any;
export type IMockNextFunction = (err?: Error) => void;

type RequestType = Request | IMockRequest;
type ResponseType = Response | IMockResponse;
type NextFunctionType = NextFunction | IMockNextFunction;

/**
 * Gracefully catch exceptions thrown in asynchronous code
 */
export default (f: (req: RequestType, res: ResponseType, next: NextFunctionType) => Promise<any>) => {
    return (req: RequestType, res: ResponseType, next: NextFunctionType): void => {
        (async () => {
            try {
                await f(req, res, next);
            } catch (e) {
                next(e);
            }
        })();
    };
};
