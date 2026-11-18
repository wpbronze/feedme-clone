import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Converter } from "./converter";

const upsert = vi.fn();
let claims: { sub: string } | null = null;

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getClaims: async () => ({ data: claims ? { claims } : null }) },
    from: () => ({ upsert }),
  }),
}));
vi.mock("./markdown-view", () => ({ MarkdownView: () => null }));

const PAGE = {
  url: "https://example.com/post",
  title: "Hello",
  author: "Jane",
  site: "example.com",
  wordCount: 3,
  markdown: "# Hello",
};

beforeEach(() => {
  upsert.mockReset().mockResolvedValue({ error: null });
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(PAGE)),
  );
});
afterEach(() => vi.unstubAllGlobals());

async function convert() {
  render(<Converter />);
  fireEvent.change(screen.getByLabelText("변환할 URL"), {
    target: { value: PAGE.url },
  });
  fireEvent.click(screen.getByRole("button", { name: "변환" }));
  await screen.findByText("Hello");
}

test("변환 결과가 없으면 저장 버튼이 비활성화된다", () => {
  render(<Converter />);
  expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
});

test("로그아웃 상태에서 저장하면 저장하지 않고 로그인 안내만 보인다", async () => {
  claims = null;
  await convert();
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

  expect(await screen.findByText(/로그인하면 저장할 수 있습니다/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
    "href",
    "/auth/login",
  );
  expect(upsert).not.toHaveBeenCalled();
  expect(screen.getByText("Hello")).toBeInTheDocument();
});

test("로그인 상태에서 저장하면 저장되고 안내가 보인다", async () => {
  claims = { sub: "u1" };
  await convert();
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

  await waitFor(() => expect(upsert).toHaveBeenCalledTimes(1));
  expect(await screen.findByText(/저장했습니다/)).toBeInTheDocument();
});

test("저장에 실패하면 오류 안내가 보이고 결과는 유지된다", async () => {
  claims = { sub: "u1" };
  upsert.mockResolvedValue({ error: { message: "x" } });
  await convert();
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

  expect(await screen.findByText(/저장하지 못했습니다/)).toBeInTheDocument();
  expect(screen.getByText("Hello")).toBeInTheDocument();
});
