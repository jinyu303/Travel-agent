import { PDFParse } from "pdf-parse";

export async function extractTravelPdf(data: Uint8Array) {
  const signature = new TextDecoder().decode(data.slice(0, 5));

  if (signature !== "%PDF-") {
    throw new Error("文件不是可识别的 PDF");
  }

  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const text = result.text.trim();

    if (!text) {
      throw new Error("没有提取到文字，暂不支持扫描图片型 PDF");
    }

    if (text.length > 12000) {
      throw new Error("计划文字过长，请上传较短的旅行计划");
    }

    return text;
  } finally {
    await parser.destroy();
  }
}