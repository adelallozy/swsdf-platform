# HTTP Client Reference

`src/v3/services/httpClient.js` is the only HTTP client for new and refactored
v3 code.

## Imports

```javascript
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
  ERROR_TYPES,
} from '@/v3/services/httpClient.js';
```

Do not import Axios in v3 features, use the deprecated
`src/v3/composables/apiClient.js`, or create a feature-local fetch wrapper.

## Request Contract

The client:

- prefixes endpoint paths with `VITE_API_URL`;
- sends `Accept: application/json`;
- sends the current locale through `Accept-Language`;
- attaches `Authorization: Bearer <jwt>` when a token is available;
- uses `credentials: 'include'`;
- sends JSON with `Content-Type: application/json`;
- passes `FormData` directly and lets the browser generate its multipart
  boundary;
- supports `AbortSignal` through the request options.

CakePHP `Api` endpoints authenticate with Bearer JWT. Included cookies do not
replace the `Authorization` header.

## Helper Signatures

```javascript
apiGet(endpoint, options);
apiPost(endpoint, data, options);
apiPatch(endpoint, data, options);
apiPut(endpoint, data, options);
apiDelete(endpoint, options);
```

Endpoint paths must come from `src/v3/config/apiEndpoints.js`; do not hardcode
API paths in pages or components.

## Success Responses

- JSON content is returned as parsed data.
- Non-JSON content is returned as text.
- `204 No Content` returns `null`.

## Error Types

The client throws standard JavaScript `Error` objects with direct properties.
It does not throw Axios response objects.

| Condition | `error.name` | Important properties |
|---|---|---|
| 401 | `UNAUTHORIZED` | `status = 401` |
| 409 | `CONFLICT_ERROR` | `status`, `conflict`, `payload`, `statusText` |
| 422 | `VALIDATION_ERROR` | `status`, `validationErrors`, `payload` |
| Other non-2xx | `HTTP_ERROR` | `status`, `payload` |
| Aborted request | `TIMEOUT` | `status = 0` |

Correct status access:

```javascript
if (error.status === 404) {
  // Handle not found.
}
```

Incorrect Axios-style access:

```javascript
if (error.response?.status === 404) {
  // Do not use this with httpClient.js.
}
```

## Unauthorized Lifecycle

Every API 401 follows one centralized flow:

1. `httpClient.js` calls `signOut('unauthorized')` even if local token state is
   already empty.
2. `signOut()` makes a best-effort request to
   `VITE_AUTHENTICATOR_SIGN_OUT`, whose canonical value is `users/logout`.
3. User, token, expiry, and compatibility storage are cleared.
4. `AUTH_SIGNOUT` is emitted.
5. `App.vue` redirects only protected routes to sign-in and preserves the
   current route in the `redirect` query.
6. Public routes remain in place.
7. The client throws the normalized unauthorized error to finish the request
   promise.

Page-level code must not call `signOut()`, show an unauthorized toast, or
perform another sign-in redirect:

```javascript
try {
  const data = await apiGet(PROTECTED_ENDPOINT);
  return data;
} catch (error) {
  if (error.status === 401) {
    return;
  }

  // Handle endpoint-specific errors.
}
```

Do not make a protected backend endpoint unauthenticated merely to avoid a 401.

## Validation Errors

Use `error.validationErrors` for field-level 422 responses. Forms should apply
those errors to the relevant fields and should not display a duplicate generic
toast.

```javascript
try {
  await apiPost(ENDPOINT, payload);
} catch (error) {
  if (error.name === ERROR_TYPES.VALIDATION) {
    formRef.value?.applyServerErrors(error.validationErrors);
    return;
  }

  throw error;
}
```

## Conflict Errors

409 responses preserve the response body in `error.payload`. Use the canonical
conflict utilities when the endpoint can return an existing blocking
application.

```javascript
try {
  await apiPost(ENDPOINT, payload);
} catch (error) {
  if (error.name === ERROR_TYPES.CONFLICT) {
    const applicationId = getConflictApplicationId(error);
    // Navigate or notify according to the feature specification.
    return;
  }

  throw error;
}
```

## Error Reporting

- Expected HTTP failures have `error.status` and are handled by the caller.
- Unexpected/network failures are captured by `httpClient.js`.
- Follow the rule of one: do not capture the same failure at every layer.
- A page should show at most one user-facing notification for a failure.
- Never show a second notification for a centralized 401.

## Checklist

- [ ] Import helpers from `@/v3/services/httpClient.js`.
- [ ] Import endpoint constants from `@/v3/config/apiEndpoints.js`.
- [ ] Read `error.status`, not `error.response.status`.
- [ ] Return silently for 401.
- [ ] Apply 422 field errors without a generic toast.
- [ ] Handle 409 using its preserved payload.
- [ ] Do not add component-specific authorization headers.
- [ ] Do not duplicate capture, toast, sign-out, or redirect behavior.
