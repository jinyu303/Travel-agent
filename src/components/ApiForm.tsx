"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

export default function ApiForm({
  action,
  successHref,
  className,
  children,
}: {
  action: string;
  successHref: string;
  className?: string;
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    const formData = new FormData(event.currentTarget);

    setLoading(true);
    setError("");

    try {
      //向 action 发出 POST 请求，body 为 formData
      const response = await fetch(action, {
            method: "POST",
            body: formData,
            });
            
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "提交失败，请稍后重试"
        );
      }

      // 成功后重新请求目标页面，使服务器读取最新会话
      window.location.assign(successHref);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "提交失败"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={action}
      method="post"
      onSubmit={handleSubmit}
      className={className}
    >
      <fieldset disabled={loading} className="contents">
        {children}
      </fieldset>

      {loading && (
        <p role="status" className="mt-3 text-sm text-gray-600">
          正在提交…
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}