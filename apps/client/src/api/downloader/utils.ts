// Constants
const API_BASE_URL = "http://localhost:6595/api";
const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
};
const CONTENT_TYPES = {
  JSON: "application/json",
};

/**
 * Fetches data from the server and returns it as JSON
 */
export function fetchData(
  endpoint: string,
  params: Record<string, any> = {},
  method = HTTP_METHODS.GET,
) {
  const url = buildUrl(endpoint, params);

  return fetch(url.href, { method })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch operation failed:", error);
      return Promise.reject(error);
    });
}

/**
 * Sends data to the server without waiting for a response
 */
export function sendToServer(endpoint: string, params: Record<string, any>) {
  const url = buildUrl(endpoint, params);

  fetch(url.href).catch((error) => {
    console.error("Fetch operation failed:", error);
  });
}

/**
 * Posts JSON data to the server and returns the response as JSON
 */
export function postToServer(endpoint: string, data?: Record<string, any>) {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);

  return fetch(url, {
    method: HTTP_METHODS.POST,
    headers: {
      "Content-Type": CONTENT_TYPES.JSON,
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch operation failed:", error);
      return Promise.reject(error); // Added to maintain consistency with other functions
    });
}

/**
 * Helper function to build URLs with query parameters
 */
function buildUrl(endpoint: string, params: Record<string, any>): URL {
  const url = new URL(`${API_BASE_URL}/${endpoint}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  return url;
}
