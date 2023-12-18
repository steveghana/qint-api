export interface ResultBoundary {
    success: boolean;
    data?: any;
    reason?: string;
}

export function handleInteractorResult<SuccessBoundary = ResultBoundary, FailBoundary = ResultBoundary>(
    result: ResultBoundary,
    successCallback: (result: SuccessBoundary) => any,
    failCallback: (result: FailBoundary) => any
): any {
    if (result.success) {
        return successCallback(result as unknown as SuccessBoundary) as unknown;
    } else {
        return failCallback(result as unknown as FailBoundary) as unknown;
    }
}

export default {
    handleInteractorResult,
};
