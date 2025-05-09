const API_URL = '/api'; // Use relative URL for API proxy

/**
 * Makes an authenticated API request.
 *
 * @param {string} endpoint - The API endpoint (e.g., '/buildings').
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE).
 * @param {object} [body] - The request body for POST/PATCH.
 * @param {string} [token] - The JWT authentication token.
 * @returns {Promise<object>} - A promise resolving to the JSON response.
 * @throws {Error} - Throws an error for network issues or non-OK responses.
 */
const apiClient = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      // Attempt to parse error message from backend
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Ignore if response body is not JSON
      }
      throw new Error(errorMessage);
    }

    // If response has no content (e.g., DELETE success)
    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return {}; // Return empty object for no content
    }

    return await response.json(); // Parse JSON response body

  } catch (error) {
    console.error('API Client Error:', error);
    // Re-throw the error so component can handle it
    throw error;
  }
};

export default apiClient;
