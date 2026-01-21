export const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === "undefined") return null;
    const name = `${encodeURIComponent(key)}=`;
    const cookies = document.cookie ? document.cookie.split("; ") : [];

    for (const c of cookies) {
      if (c.startsWith(name)) {
        return decodeURIComponent(c.substring(name.length));
      }
    }

    return null;
  },

  setItem: (key: string, value: string) => {
    if (typeof document === "undefined") return;

    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(value);

    const maxAgeSeconds = 60 * 60 * 24 * 7;
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";

    document.cookie = `${encodedKey}=${encodedValue}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure ? "; Secure" : ""}`;
  },

  removeItem: (key: string) => {
    if (typeof document === "undefined") return;
    const encodedKey = encodeURIComponent(key);
    document.cookie = `${encodedKey}=; Path=/; Max-Age=0; SameSite=Lax`;
  },
};
