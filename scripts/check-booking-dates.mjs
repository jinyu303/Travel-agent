import {
  getStayNights,
  getBusinessToday,
} from "../src/lib/booking-dates.ts";

console.log("三晚：", getStayNights("2026-10-20", "2026-10-23"));
console.log("跨月：", getStayNights("2026-10-31", "2026-11-02"));
console.log("同一天：", getStayNights("2026-10-20", "2026-10-20"));
console.log("顺序错误：", getStayNights("2026-10-23", "2026-10-20"));
console.log("无效日期：", getStayNights("2026-02-30", "2026-03-03"));
console.log("格式错误：", getStayNights("2026/10/20", "2026-10-23"));

console.log(
  "上海午夜前：",
  getBusinessToday(new Date("2026-10-12T15:59:59Z"))
);

console.log(
  "上海午夜后：",
  getBusinessToday(new Date("2026-10-12T16:00:00Z"))
);