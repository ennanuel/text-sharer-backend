
export type ModifiedError = Error & {
    failed: boolean;
    message: string;
    statusCode?: number;
    errors: {
        [key: string]: string;
    }
}

export function handleError(error: ModifiedError) {
    const result: {
        statusCode: number;
        message: string;
        failed?: boolean;
        errors?: { [key: string]: string; };
    } = {
        statusCode: 500,
        message: error.message
    };

    if (error.statusCode) {
        result.statusCode = error.statusCode;
    }
    if (error.failed) {
        result.failed = error.failed;
    }
    if (error.errors) {
        result.errors = error.errors;
    }

    return result
}