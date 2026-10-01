// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WechatFollow } from "./wechat-follow";

const QR = "https://example.com/qr.jpg";

afterEach(() => {
  cleanup();
});

describe("WechatFollow", () => {
  it("starts closed with an accessible button", () => {
    render(<WechatFollow label="微信公众号" account="码农的自由之路" qr={QR} />);
    const button = screen.getByRole("button", { name: "微信公众号：码农的自由之路" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the QR code and account name when opened", () => {
    render(<WechatFollow label="微信公众号" account="码农的自由之路" qr={QR} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("img").getAttribute("src")).toBe(QR);
    expect(screen.getByText("码农的自由之路")).toBeTruthy();
  });

  it("closes on Escape and on a click outside", () => {
    render(
      <div>
        <WechatFollow label="微信公众号" account="码农的自由之路" qr={QR} />
        <p>outside</p>
      </div>,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("img")).toBeNull();

    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByText("outside"));
    expect(screen.queryByRole("img")).toBeNull();
  });
});
