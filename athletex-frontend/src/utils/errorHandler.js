/**
 * Safely extracts a user-readable error message from an API or runtime error.
 * Prevents plain objects (e.g. {timestamp, status, error, message}) from crashing React 19.
 *
 * @param {any} error - The caught error object
 * @param {string} fallback - Default fallback message
 * @returns {string} - Clean, human-readable error text
 */
export const getErrorMessage = (error, fallback = "An unexpected error occurred. Please try again.") => {
  if (!error) return fallback;

  // Direct string error
  if (typeof error === "string") {
    return error.trim() || fallback;
  }

  // Axios response data is a string
  if (typeof error.response?.data === "string" && error.response.data.trim()) {
    return error.response.data.trim();
  }

  // Backend Spring Boot GlobalExceptionHandler returns { message: "..." }
  if (error.response?.data?.message && typeof error.response.data.message === "string") {
    return error.response.data.message.trim();
  }

  // Backend Spring Boot error property
  if (error.response?.data?.error && typeof error.response.data.error === "string") {
    return error.response.data.error.trim();
  }

  // Standard JavaScript Error message
  if (error.message && typeof error.message === "string") {
    return error.message.trim();
  }

  return fallback;
};

export default getErrorMessage;
