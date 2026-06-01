import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RootError from "./error";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("RootError Boundary", () => {
  const mockError = new Error("Test error") as Error & { digest?: string };
  mockError.digest = "test-digest-123";
  const mockReset = vi.fn();

  it("renders error message and retry button", () => {
    render(<RootError error={mockError} reset={mockReset} />);

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test-digest-123/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("calls reset when retry button is clicked", () => {
    render(<RootError error={mockError} reset={mockReset} />);

    const retryButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
