// 📦 File: src/v3/composables/useNotification.js

import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import mitt from "mitt";

const emitter = mitt();
let notificationId = 0;

let _toastInstance = null;

function getToast() {
  if (_toastInstance) return _toastInstance;

  _toastInstance = useToast();
  return _toastInstance;
}

const summaries = {
  success: "Success",
  info: "Information",
  warn: "Warning",
  error: "Error",
};

function createNotification(type, message, options = {}) {
  if (!message) return null;

  const toast = getToast();

  const id = ++notificationId;

  const defaultOptions = {
    severity: type,
    summary: summaries[type] ?? "Notification",
    detail: message,
    life: 5000,
    group: "notifications",
  };

  const toastOptions = { ...defaultOptions, ...options, id };
  toast.add(toastOptions);

  emitter.emit("notification", {
    id,
    type,
    message,
    options: toastOptions,
  });

  return id;
}

export function useNotification() {
  // Ensure the singleton initializes the first time this composable is used.
  // This line is optional; any first call to success/info/... will also init.
  getToast();

  const { t, te } = useI18n();

  const translate = (value) => {
    if (!value) return "";
    if (typeof value !== "string") return String(value);

    const httpMatch = value.match(/^HTTP error:\s*(\d+)\s+(.+)$/);
    if (httpMatch) {
      const key = "HTTP error: {status} {statusText}";
      if (te(key)) {
        return t(key, { status: httpMatch[1], statusText: httpMatch[2] });
      }
    }

    return te(value) ? t(value) : value;
  };

  const translateOptions = (opts = {}) => {
    const out = { ...opts };
    if ("summary" in out) {
      out.summary = translate(out.summary);
    }
    if ("detail" in out) {
      out.detail = translate(out.detail);
    }
    return out;
  };

  const notify = (type) => (msg, opts) => {
    const translatedMessage = translate(msg);
    const translatedOpts = translateOptions(opts);
    if (!Object.prototype.hasOwnProperty.call(translatedOpts, "summary")) {
      translatedOpts.summary = translate(summaries[type] ?? "Notification");
    }
    return createNotification(type, translatedMessage, translatedOpts);
  };

  const success = notify("success");
  const info = notify("info");
  const warn = notify("warn");
  const warning = notify("warn"); // alias
  const error = notify("error");

  const onNotification = (cb) => emitter.on("notification", cb);
  const offNotification = (cb) => emitter.off("notification", cb);

  return {
    success,
    info,
    warn,
    warning,
    error,
    onNotification,
    offNotification,
  };
}
