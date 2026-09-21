// 📦 File: src/v3/composables/useFastUpload.js
// Composable for FastUpload v2 service flows on the vendor side (candidate
// file upload, RFP document download). CakePHP /fastupload/* and /rfps/* endpoints
// go through the platform HTTP client (JWT attached); the raw file upload
// itself uses plain fetch against the FastUpload service.

import { apiGet, apiPost } from "@/v3/services/httpClient.js";
import {
  RFPS_DOCUMENT_DOWNLOAD,
  RFPS_OFFER_UPLOAD_TOKEN,
  RFPS_OFFER_ATTACH_FILE,
  RFPS_OFFER_FILE_DOWNLOAD,
} from "@/v3/config/apiEndpoints.js";

const FASTUPLOAD_BASE = import.meta.env.VITE_API_FASTUPLOAD_URL || "";

/** Read a JSON body safely; returns null on parse failure. */
async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * FastUpload service error titles (RFC-style problem codes) mapped to the
 * same user-facing messages as client-side validation, so the raw upload
 * step never surfaces technical codes like FILE_TYPE_MISMATCH.
 */
const SERVICE_ERROR_MESSAGES = {
  FILE_TYPE_NOT_ALLOWED: "File type is not accepted",
  FILE_TYPE_MISMATCH: "File type is not accepted",
  FILE_TOO_LARGE: "File exceeds the allowed size limit",
  FILENAME_TOO_LONG: "File name is not accepted",
  VIRUS_DETECTED: "The uploaded file did not pass the security scan",
};

/** Throw a consistent Error carrying the server message when available. */
async function throwServiceError(res, fallbackMessage) {
  const json = await readJsonSafe(res);
  const message =
    SERVICE_ERROR_MESSAGES[json?.title] ||
    json?.message ||
    json?.detail ||
    (json?.title && !/^https?:/.test(String(json.title)) ? json.title : null) ||
    (json && typeof json.error === "string" ? json.error : null) ||
    fallbackMessage;
  const err = new Error(message || `HTTP error: ${res.status}`);
  err.status = res.status;
  if (json) err.payload = json;
  throw err;
}

/** Validate a candidate file before any network call. */
function validateCandidateFile(file, { accept, maxSize }) {
  if (!file) throw new Error("File is required");

  const acceptedTypes = String(accept || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const accepted =
    acceptedTypes.length === 0 ||
    acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return String(file.name || "").toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith("/*")) {
        return String(file.type || "").startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

  if (!accepted) throw new Error("File type is not accepted");
  if (maxSize && file.size > maxSize)
    throw new Error("File exceeds the 10MB limit");
}

/**
 * Safe ASCII filename for the Content-Disposition header. The FastUpload
 * service parses plain `filename=` (no RFC 5987 `filename*` support), and
 * HTTP headers cannot carry raw non-ASCII — an Arabic-named file would be
 * rejected. The original name stays visible through the attached-file
 * caption; this is purely the transport name. The extension is always
 * preserved (the service validates it).
 */
function safeUploadFilename(file, fallbackBase = "document") {
  const name = String(file?.name || "");
  const extension = name.includes(".") ? `.${name.split(".").pop()}` : "";
  const base =
    name
      .slice(0, name.length - extension.length)
      // Latin letters/digits kept; everything else (Arabic, spaces,
      // punctuation, control chars) becomes a hyphen.
      .replace(/[^\p{Script=Latin}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || fallbackBase;
  return `${base}${extension.toLowerCase()}`;
}

// ───────────────────────────────────────────────────────────
// Attached-file activation polling
//
// A registered attached file starts as `pending` on the Cake side and only
// becomes usable once the mirrored FastUpload status is persisted (by the
// scheduled `fast_upload_process` command or the lazy refresh on the view
// endpoint). Uploads must never be reported as success until then, so poll
// the authenticated Cake endpoint for a terminal status.
// ───────────────────────────────────────────────────────────
const ACTIVATION_TIMEOUT_MS = 30000;
const ACTIVATION_POLL_INTERVAL_MS = 2000;
// `locked` is ready-but-protected-from-removal — still a downloadable state.
const ACTIVATION_READY_STATUSES = new Set(["active", "locked"]);
const ACTIVATION_FAILED_STATUSES = new Set(["failed", "deleting", "deleted"]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAttachedFileActivation(attachedFileId) {
  const deadline = Date.now() + ACTIVATION_TIMEOUT_MS;

  while (true) {
    let attachedFile = null;

    try {
      const res = await apiGet(
        `${FASTUPLOAD_BASE}fastupload/attached-files/${attachedFileId}`
      );
      attachedFile = res?.attached_file || null;
    } catch (err) {
      // Auth/permission/lookup problems are permanent for this caller;
      // anything else (network hiccup, 5xx) is retried until the deadline.
      if ([401, 403, 404].includes(err?.status)) throw err;
    }

    if (attachedFile) {
      const status = String(attachedFile.status || "").toLowerCase();
      if (ACTIVATION_FAILED_STATUSES.has(status)) {
        throw new Error(
          "File processing failed. Please remove the file and upload it again."
        );
      }
      if (ACTIVATION_READY_STATUSES.has(status)) {
        return attachedFile;
      }
    }

    if (Date.now() >= deadline) {
      throw new Error(
        "The uploaded file is taking too long to process. Please try again later."
      );
    }

    await sleep(ACTIVATION_POLL_INTERVAL_MS);
  }
}

export function useFastUpload() {
  /**
   * Upload a vendor candidate file through the FastUpload pipeline and
   * register it as an attached file on THEIR candidate row
   * (model `RfpCandidates`, model_id candidate id). Waits for the attached
   * file's mirrored status to become active/locked before resolving.
   * Returns `{ file_id, attached_file }` or throws.
   *
   * `tokenEndpoint` optionally overrides the generic candidate upload
   * token request (a `{id}`/`{slotId}`-templated endpoint relative to the
   * API base, resolved with `tokenParams`). Typed offer documents pass
   * the per-slot offer token endpoint so the upload inherits the slot's
   * size/extension contract while the registration stays on the
   * candidate row, exactly like the NDA.
   */
  async function uploadCandidateFile(
    candidateId,
    file,
    {
      accept = "",
      maxSize,
      caption = "Document",
      onProgress,
      tokenEndpoint = "",
      tokenParams = {},
    } = {}
  ) {
    validateCandidateFile(file, { accept, maxSize });

    if (!FASTUPLOAD_BASE) throw new Error("Upload failed");

    // 1) Ask the CakePHP backend for a scoped upload token (ownership is
    // the candidate row itself for the generic flow; a typed offer
    // document requests the slot-scoped offer token instead).
    const tokenUrl = tokenEndpoint
      ? Object.entries(tokenParams || {}).reduce(
          (url, [key, value]) => url.replace(`{${key}}`, value),
          tokenEndpoint
        )
      : `${FASTUPLOAD_BASE}fastupload/upload-token`;
    const tokenRes = await apiPost(tokenUrl, tokenEndpoint
      ? {}
      : {
          model: "RfpCandidates",
          model_id: candidateId,
          access_level: "private",
        });
    const { token, upload_url: uploadUrl } = tokenRes || {};
    if (!token || !uploadUrl) throw new Error("Upload failed");

    // 2) Stream the raw file straight to the FastUpload service (202).
    // The header filename is ASCII-sanitized (Arabic names are rejected
    // by the service); the original name rides in the caption.
    onProgress?.(0);
    let res;
    try {
      res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Disposition": `attachment; filename="${safeUploadFilename(
            file,
            "document"
          )}"`,
        },
        body: file,
      });
    } catch {
      throw new Error("Upload failed");
    }
    onProgress?.(100);
    if (!res.ok) await throwServiceError(res, "Upload failed");

    const uploadJson = (await readJsonSafe(res)) || {};
    const fileId = uploadJson?.file?.id || uploadJson?.id;
    if (!fileId) throw new Error("Upload failed");

    // 3) Register the uploaded file on the backend (201).
    const attachRes = await apiPost(
      `${FASTUPLOAD_BASE}fastupload/attached-files`,
      {
        file_id: fileId,
        model: "RfpCandidates",
        model_id: candidateId,
        access_level: "private",
        caption,
      }
    );
    const attachedFile = attachRes?.attached_file || null;
    if (!attachedFile?.id) throw new Error("Upload failed");

    // 4) Activation gate: the mirrored status must reach `active`/`locked`
    // on the Cake side before the upload counts as success. file_id is
    // never returned for a still-pending, failed, or timed-out file.
    const activatedFile = await waitForAttachedFileActivation(attachedFile.id);

    return { file_id: fileId, attached_file: activatedFile };
  }

  /**
   * Upload one offer document for an RFP offer. `type` is either a
   * required-document slot id (number) or the string "other" for the
   * catch-all upload. The flow: request the offer's scoped upload token
   * (`required_document_id: null` means "Other"), stream the raw bytes to
   * the FastUpload service, attach the resulting file id to the offer
   * (`required_document_id` rides along so the backend assigns the row to
   * its slot), then wait for the new row's assignment to reach a terminal
   * status through the same attached-file polling used by candidate
   * uploads. Returns the created offer file row.
   */
  async function uploadOfferFile(rfpId, type, file, { onProgress } = {}) {
    const requiredDocumentId = type === "other" ? null : Number(type);

    // 1) Offer-scoped upload token from the CakePHP offer flow.
    const tokenEndpoint = RFPS_OFFER_UPLOAD_TOKEN.replace("{id}", rfpId);
    const tokenRes = await apiPost(tokenEndpoint, {
      required_document_id: requiredDocumentId,
    });
    const { token, upload_url: uploadUrl } = tokenRes || {};
    if (!token || !uploadUrl) throw new Error("Upload failed");

    // 2) Stream the raw file straight to the FastUpload service. The header
    // filename is ASCII-sanitized the same way as candidate uploads.
    onProgress?.(0);
    let res;
    try {
      res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Disposition": `attachment; filename="${safeUploadFilename(
            file,
            "document"
          )}"`,
        },
        body: file,
      });
    } catch {
      throw new Error("Upload failed");
    }
    onProgress?.(100);
    if (!res.ok) await throwServiceError(res, "Upload failed");

    const uploadJson = (await readJsonSafe(res)) || {};
    const fileId = uploadJson?.file?.id || uploadJson?.id;
    if (!fileId) throw new Error("Upload failed");

    // 3) Attach the uploaded file to the offer; the endpoint wraps the
    // created file row and carries its assignment id/status.
    const attachEndpoint = RFPS_OFFER_ATTACH_FILE.replace("{id}", rfpId);
    const attachRes = (await apiPost(attachEndpoint, {
      file_id: fileId,
      required_document_id: requiredDocumentId,
    })) || null;
    const offerFile = attachRes?.file ?? null;
    if (!offerFile?.id) throw new Error("Upload failed");

    // No generic-endpoint polling here: the generic attached-file paths
    // refuse offer-file assignments, and the offer view refreshes each
    // file's assignment status lazily on load.
    return offerFile;
  }

  /**
   * Resolve a short-lived download URL for one of the vendor's own offer
   * files through the governed offer endpoint (the generic attached-files
   * download path refuses offer-file assignments) and open it.
   */
  async function downloadOfferFile(rfpId, fileRowId) {
    if (!rfpId || !fileRowId) throw new Error("Download failed");
    const endpoint = RFPS_OFFER_FILE_DOWNLOAD
      .replace("{id}", rfpId)
      .replace("{fileRowId}", fileRowId);
    const res = await apiGet(endpoint);
    const downloadUrl = res?.download_url;
    if (!downloadUrl) throw new Error("Download failed");
    window.open(downloadUrl, "_blank", "noopener");
    return res;
  }

  /**
   * Resolve a short-lived download URL for an RFP request document through
   * the vendor download endpoint (candidate-row authorization lives
   * server-side) and open it.
   */
  async function downloadRfpDocument(rfpId, documentId) {
    const endpoint = RFPS_DOCUMENT_DOWNLOAD.replace("{id}", rfpId).replace(
      "{documentId}",
      documentId
    );
    const res = await apiGet(endpoint);
    const downloadUrl = res?.download_url;
    if (!downloadUrl) throw new Error("Download failed");
    window.open(downloadUrl, "_blank", "noopener");
    return res;
  }

  /**
   * Resolve a short-lived download URL for one of the vendor's own
   * FastUpload attached files (by attached-file id) and open it. Used for
   * one of the vendor's uploaded copies. A 409 means the file is not ready yet —
   * surfaced as a rejection carrying the server message.
   */
  async function downloadAttachedFile(attachedFileId) {
    if (!attachedFileId) throw new Error("Download failed");
    const res = await apiGet(
      `${FASTUPLOAD_BASE}fastupload/attached-files/${attachedFileId}/download-token`
    );
    const downloadUrl = res?.download_url;
    if (!downloadUrl) throw new Error("Download failed");
    window.open(downloadUrl, "_blank", "noopener");
    return res;
  }

  return {
    uploadCandidateFile,
    uploadOfferFile,
    downloadRfpDocument,
    downloadAttachedFile,
    downloadOfferFile,
  };
}

export default useFastUpload;
