"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function TravelAgent() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [historyUserId, setHistoryUserId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // 阻止普通表单提交，防止跳转
    event.preventDefault();

    if (loading) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const question = formData.get("message");

    if (typeof question !== "string" || !question.trim()) {
      setError("请输入旅行需求");
      return;
    }

    if (question.trim().length > 500) {
      setError("请输入 1～500 个字符的问题");
      return;
    }

    formData.set("message", question.trim());
    formData.set("history", JSON.stringify(history));

    if (historyUserId !== null) {
      formData.set("historyUserId", String(historyUserId));
    }

    setLoading(true);
    setError("");

    try {
      //发送历史聊天记录
      const response = await fetch("/api/agent", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "请求失败，请稍后重试"
        );
      }

      if (
        typeof data.reply !== "string" ||
        !data.reply.trim()
      ) {
        throw new Error("没有取得有效回复");
      }

      if (
        !Number.isSafeInteger(data.userId) ||
        data.userId < 1
      ) {
        throw new Error("响应缺少有效用户编号");
      }

      const nextHistory: ChatMessage[] = [
        ...history,
        { role: "user", content: question.trim() },
        { role: "assistant", content: data.reply },
      ];

      // 只保留最近10条消息，约5轮问答
      setHistory(nextHistory.slice(-10));
      setHistoryUserId(data.userId);

      // 成功后清空输入框
      form.reset();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "请求失败"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 max-h-[calc(100dvh-7rem)] w-80 max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-2xl border bg-white p-5 text-gray-900 shadow-xl">
          <h2 className="text-xl font-bold">AI 旅行助手</h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm">旅行需求</span>
              <textarea
                name="message"
                required
                maxLength={500}
                rows={3}
                disabled={loading}
                placeholder="例如：查询东京房源，并列出我的心愿单"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="block text-sm">
              <span>旅行计划 PDF（可选，最多 5 MB）</span>
              <input
                type="file"
                name="pdf"
                accept=".pdf,application/pdf"
                disabled={loading}
                className="mt-2 block w-full"
              />
            </label>

            <p className="text-xs text-gray-600">
              可以继续追问；收藏时请说明目标房源和心愿单。
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-rose-500 p-3 text-white disabled:opacity-50"
            >
              {loading ? "正在处理…" : "发送"}
            </button>
          </form>

          <div
            aria-live="polite"
            className="mt-4 max-h-52 overflow-y-auto"
          >
            {history.map((item, index) => (
              <div
                key={index}
                className={`mb-3 rounded-lg p-3 text-sm ${
                  item.role === "user"
                    ? "bg-rose-50"
                    : "bg-gray-100"
                }`}
              >
                <p className="mb-1 font-semibold">
                  {item.role === "user" ? "你" : "旅行助手"}
                </p>
                <p className="whitespace-pre-wrap">
                  {item.content}
                </p>
              </div>
            ))}

            {error && (
              <p
                role="alert"
                className="whitespace-pre-wrap text-sm text-red-600"
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setHistory([]);
              setHistoryUserId(null);
              setError("");
            }}
            className="mt-3 text-sm text-gray-600 disabled:opacity-50"
          >
            清空对话
          </button>

          <a
            href="/wishlists"
            className="mt-4 block text-sm text-rose-500"
          >
            查看我的心愿单
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="rounded-full bg-rose-500 px-5 py-3 font-semibold text-white shadow-lg"
      >
        {open ? "关闭助手" : "AI 旅行助手"}
      </button>
    </aside>
  );
}