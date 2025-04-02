// Set cookie
export const setCookie = (name: string, value: string, hours: number): void => {
  const expires = new Date(Date.now() + hours * 3600 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; Secure; SameSite=Lax`;
};

// Get cookie
export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};
