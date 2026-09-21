import {
  RFPS_REMOVE_NDA,
  RFPS_UPLOAD_NDA,
} from "@/v3/config/apiEndpoints.js";

export const RFP_FILE_MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Canonical lowercase extension code → browser MIME type. Offer slots
 * declare their contract in extension codes (pdf, docx, …); the upload
 * form consumes MIME accept strings.
 */
export const RFP_FILE_MIME_TYPES = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  mp4: "video/mp4",
};

/** MIME accept string for a slot's allowed extension codes. */
function mimeAccept(allowedTypes) {
  return (Array.isArray(allowedTypes) ? allowedTypes : [])
    .map((code) => RFP_FILE_MIME_TYPES[String(code || "").toLowerCase()])
    .filter(Boolean)
    .join(",");
}

/** Human hint for a slot's allowed extension codes, e.g. "PDF file only". */
function typesDescription(allowedTypes) {
  const codes = (Array.isArray(allowedTypes) ? allowedTypes : [])
    .map((code) => String(code || "").toLowerCase())
    .filter(Boolean);
  if (!codes.length) return "";
  return codes.map((code) => code.toUpperCase()).join(", ") + " file" + (codes.length > 1 ? "s" : "") + " only";
}

function slotMaxSizeBytes(slot) {
  const maxMb = Number(slot?.max_file_mb) || 0;
  return maxMb > 0 ? maxMb * 1048576 : RFP_FILE_MAX_SIZE_BYTES;
}

/**
 * The NDA required-file definition used by the RFP detail page. The NDA
 * disappears from every list once the officer accepts it.
 */
export const RFP_REQUIRED_FILES = [
  {
    type: "nda",
    label: "Non-Disclosure Agreement",
    accept: "application/pdf",
    description: "PDF file only",
    maxSize: RFP_FILE_MAX_SIZE_BYTES,
    uploadEndpoint: RFPS_UPLOAD_NDA,
    removeEndpoint: RFPS_REMOVE_NDA,
    visible: (candidateStatus) => candidateStatus !== "accept_nda",
  },
];

/**
 * The upload page's file-type list for one RFP, in pick order:
 * the signed NDA (until the candidate's NDA is accepted), one entry per
 * offer document slot from the vendor view payload's
 * `offer_required_documents` (sorted by `sort_order`), then the catch-all
 * "Other" entry. "Other" advertises the union of the slots' contracts —
 * the same policy the upload-token endpoint applies to
 * `required_document_id: null` — so the picker matches what the backend
 * accepts.
 *
 * Offer entries carry the slot's canonical `required_document_id` (null
 * for "Other"); `null` is exactly the value the offer endpoints expect.
 */
export function buildRfpUploadTypes(offerRequiredDocuments) {
  const slots = (Array.isArray(offerRequiredDocuments) ? offerRequiredDocuments : [])
    .filter((slot) => slot?.id != null)
    .slice()
    .sort((a, b) => (Number(a?.sort_order) || 0) - (Number(b?.sort_order) || 0));

  const otherTypes = [];
  for (const slot of slots) {
    for (const code of Array.isArray(slot?.allowed_types) ? slot.allowed_types : []) {
      const normalized = String(code || "").toLowerCase();
      if (normalized && !otherTypes.includes(normalized)) otherTypes.push(normalized);
    }
  }
  const otherMaxSize = slots.reduce(
    (max, slot) => Math.max(max, slotMaxSizeBytes(slot)),
    RFP_FILE_MAX_SIZE_BYTES
  );

  return [
    ...RFP_REQUIRED_FILES.map((def) => ({
      ...def,
      label: "Signed NDA",
      required: true,
    })),
    ...slots.map((slot) => ({
      type: String(slot.id),
      label: slot.name || "Required document",
      translateLabel: false,
      accept: mimeAccept(slot.allowed_types),
      description: typesDescription(slot.allowed_types),
      maxSize: slotMaxSizeBytes(slot),
      required: !!slot.required,
      required_document_id: Number(slot.id),
      visible: (candidateStatus) => candidateStatus === "accept_nda",
    })),
    {
      type: "other",
      label: "Other",
      accept: mimeAccept(otherTypes),
      description: typesDescription(otherTypes),
      maxSize: otherMaxSize,
      required: false,
      required_document_id: null,
      visible: (candidateStatus) => candidateStatus === "accept_nda",
    },
  ];
}
