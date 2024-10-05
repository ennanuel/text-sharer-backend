"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
function handleError(error) {
    const result = {
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
    return result;
}
