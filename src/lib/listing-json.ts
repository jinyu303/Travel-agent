// 安全读取数据库中的 JSON 字符串数组
export function parseStringArray(value: unknown): string[] {
  if (typeof value !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0
    );
  } catch {
    return [];
  }
}