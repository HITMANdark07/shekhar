export const THEME_STORAGE_KEY = "theme";

/**
 * Runs in <head> before first paint. Applies a stored "light"/"dark" choice,
 * else the system preference. If storage throws, it sets nothing and the CSS
 * prefers-color-scheme fallback applies.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;
