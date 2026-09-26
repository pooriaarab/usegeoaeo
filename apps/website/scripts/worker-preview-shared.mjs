const API = "https://api.cloudflare.com/client/v4";
export const ID = /^[a-f0-9]{32}$/;

export function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export async function request(path, token, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Invalid Cloudflare response for ${path}`);
  }
  if (!response.ok || !payload || typeof payload !== "object" || payload.success !== true)
    throw new Error(`Cloudflare API rejected ${path}`);
  return payload;
}

export async function listAll(path, token = required("CLOUDFLARE_API_TOKEN")) {
  const items = [];
  async function readPage(page) {
    const join = path.includes("?") ? "&" : "?";
    const payload = await request(`${path}${join}page=${page}&per_page=100`, token);
    const info = payload.result_info;
    const result = payload.result;
    const pages = Number.isSafeInteger(info?.total_pages);
    const count = Number.isSafeInteger(info?.total_count);
    const nextSize = items.length + (Array.isArray(result) ? result.length : 0);
    if (
      !Array.isArray(result) ||
      !Number.isSafeInteger(info?.page) ||
      info.page !== page ||
      (!pages && !count) ||
      (pages && (info.total_pages < page || info.total_pages > 1000)) ||
      (count && (info.total_count < 0 || nextSize > info.total_count))
    )
      throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    items.push(...result);
    const pageDone = pages && page === info.total_pages;
    const countDone = count && items.length === info.total_count;
    if (pages && count && pageDone !== countDone)
      throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    if (pages ? pageDone : countDone) return items;
    if (!result.length) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    if (page === 1000) throw new Error(`Invalid Cloudflare list pagination for ${path}`);
    return readPage(page + 1);
  }
  return readPage(1);
}

export function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).toSorted().join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .toSorted()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
