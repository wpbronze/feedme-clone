import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import Home from "@/app/page";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

test("첫 화면은 입력창과 비활성 내보내기 버튼을 보여준다", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: /URL → Markdown/ })
  ).toBeInTheDocument();
  expect(screen.getByLabelText("변환할 URL")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "복사하기" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Claude로 열기" })).toBeDisabled();
});
