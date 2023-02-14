import type { PreloadApi } from ".";

export const PRELOAD_API = "PRELOAD_API";

export function getGlobalPreloadApi(): PreloadApi {
  return (globalThis as any)[PRELOAD_API];
}
