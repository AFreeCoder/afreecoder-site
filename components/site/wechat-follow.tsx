"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  label: string;
  account: string;
  qr: string;
};

/** 公众号没有网页主页：点图标弹出二维码，点外面或按 Esc 收起 */
export function WechatFollow({ label, account, qr }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const name = `${label}：${account}`;

  return (
    <div className="wechat-follow" role="listitem" ref={rootRef}>
      <button
        type="button"
        className="social-link"
        aria-label={name}
        title={name}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <WechatIcon />
      </button>
      {open && (
        <div id={panelId} className="wechat-qr">
          {/* eslint-disable-next-line @next/next/no-img-element -- OSS 上的二维码原图，尺寸固定 */}
          <img src={qr} alt={`${label}「${account}」二维码`} width={132} height={132} />
          <span className="wechat-qr-hint">微信扫码关注</span>
          <span className="wechat-qr-name">{account}</span>
        </div>
      )}
    </div>
  );
}

function WechatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.5 4C5.36 4 2 6.69 2 10c0 1.89 1.08 3.57 2.78 4.67L4 17l2.79-1.4c.85.25 1.76.4 2.71.4h.5A5.6 5.6 0 0 1 10 15c0-3.04 3.02-5.5 6.75-5.5h.74C16.84 6.37 13.53 4 9.5 4zM6.75 8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5.5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM22 15c0-2.76-2.69-5-6-5s-6 2.24-6 5 2.69 5 6 5c.68 0 1.34-.1 1.95-.28L20 20.5l-.6-2.04C21 17.53 22 16.34 22 15zm-8-.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm4 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
    </svg>
  );
}
