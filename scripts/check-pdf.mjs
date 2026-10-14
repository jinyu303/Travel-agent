
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const buffer = await readFile("data/sample-trip.pdf");

if (buffer.length > 5 * 1024 * 1024) {
  throw new Error("测试 PDF 不能超过 5 MB");
}

// 使用独立的字节数组作为解析输入
const parser = new PDFParse({
  data: new Uint8Array(buffer),
});

try {
 
  const result = await parser.getText();

  const text = result.text.trim();

  if (text.length === 0) {
    throw new Error("没有提取到文字，请使用可选中文字的 PDF");
  }

  console.log("提取字符数：", text.length);
  console.log("提取文本：\n", text);
} finally {
  await parser.destroy();
}