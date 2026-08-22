import "server-only";

export const LOGIN_FAILURE_LIMIT = 5;
export const LOGIN_FAILURE_WINDOW_SECONDS = 15 * 60;
export const LOGIN_BLOCK_SECONDS = 15 * 60;
export const MAX_LOGIN_EMAIL_LENGTH = 320;
export const MAX_PASSWORD_INPUT_LENGTH = 1024;
export const LOGIN_THROTTLE_DIGEST_PATTERN = /^[a-f0-9]{64}$/;
