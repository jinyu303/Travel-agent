export const MAX_STAY_NIGHTS = 30;

// 把真实有效的日期转换为 UTC 毫秒数
function parseDate(date: string): number | null {
  // 格式必须是 YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const timestamp = Date.parse(`${date}T00:00:00.000Z`);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  // 转换回日期，检查是否被自动调整为另一天
  const restoredDate = new Date(timestamp)
    .toISOString()
    .slice(0, 10);

  if (restoredDate !== date) {
    return null;
  }

  return timestamp;
}





// 日期无效、顺序错误或超过最大晚数时返回 null
export function getStayNights(
  checkIn: string,
  checkOut: string
): number | null {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (start === null || end === null || end <= start) {
    return null;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const nights = (end - start) / millisecondsPerDay;

  if (nights > MAX_STAY_NIGHTS) {
    return null;
  }

  return nights;
}




// 默认使用当前时间，也允许传入固定时间进行测试
export function getBusinessToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("无法取得业务日期");
  }

  return `${year}-${month}-${day}`;
}