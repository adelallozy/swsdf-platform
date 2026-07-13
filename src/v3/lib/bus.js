// src/v3/lib/bus.js
import mitt from "mitt";
export const bus = mitt();

export const AUTH_SIGNOUT = "auth:signout"; // payload: { reason?: string }
export const AUTH_SIGNIN = "auth:signin"; // optional, if you want it later
