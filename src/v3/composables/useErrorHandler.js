// 📦 File: src/v3/composables/useErrorHandler.js

import mitt from "mitt";
// import * as Sentry from '@sentry/browser';

const emitter = mitt();
let lastMessage = null;
let lastTimestamp = 0;

function emit(message, context = null, meta = null) {
  const now = Date.now();
  if (message === lastMessage && now - lastTimestamp < 2000) return;

  lastMessage = message;
  lastTimestamp = now;

  // emitter.emit('error', { message, context, meta });

  if (import.meta.env.DEV) {
    console.error(`[App Error]`, message);
    if (context) console.info("Context:", context);
    if (meta) console.info("Meta:", meta);
  }
}

function capture(error, options = {}) {
  const message = normalizeErrorMessage(error);
  const context = options.context || null;
  const meta = options.meta || null;

  // Pass original error for debugging
  emit(options.fallback || message, context, { ...meta, originalError: error });

  // Sentry.captureException(error instanceof Error ? error : new Error(message), {
  //   extra: {
  //     ...(context ? { context } : {}),
  //     ...(meta ? { meta } : {})
  //   }
  // });
}

function normalizeErrorMessage(error) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.detail) return error.detail;
  if (error.error) return error.error;
  return JSON.stringify(error);
}

export function useErrorHandler() {
  return {
    capture,
    onError: (cb) => emitter.on("error", cb),
    offError: (cb) => emitter.off("error", cb),
  };
}
