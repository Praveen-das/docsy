// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatComposer } from "./chat-composer";

// Mock offline status
const mockUseNetworkStatus = vi.fn();
vi.mock("@/features/offline/hooks/use-network-status", () => ({
  useNetworkStatus: () => mockUseNetworkStatus(),
}));

describe("ChatComposer component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
      wasOffline: false,
    });
  });

  it("renders textarea with placeholder and model indicator", () => {
    render(
      <ChatComposer
        inputText=""
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Ask anything about this document/i)).toBeInTheDocument();
    expect(screen.getByText("Docsy AI")).toBeInTheDocument();
  });

  it("triggers onInputChange when user types into the textarea", () => {
    const onInputChange = vi.fn();
    render(
      <ChatComposer
        inputText=""
        onInputChange={onInputChange}
        onSubmit={vi.fn()}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask anything about this document/i);
    fireEvent.change(textarea, { target: { value: "Hello Docsy" } });

    expect(onInputChange).toHaveBeenCalledWith("Hello Docsy");
  });

  it("submits on Enter key press but allows Shift+Enter for multiline", () => {
    const onSubmit = vi.fn();
    render(
      <ChatComposer
        inputText="Query text"
        onInputChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask anything about this document/i);

    // Shift + Enter should NOT submit
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();

    // Plain Enter should submit
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables send button when input is whitespace or empty", () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <ChatComposer
        inputText=""
        onInputChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );

    const submitBtn = screen.getByTitle("Send question");
    expect(submitBtn).toBeDisabled();

    rerender(
      <ChatComposer
        inputText="    "
        onInputChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    expect(submitBtn).toBeDisabled();
  });

  it("disables input and displays offline notification when offline", () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
      wasOffline: false,
    });

    render(
      <ChatComposer
        inputText="Unsent text"
        onInputChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText(/Offline \(Read-only transcripts\)/i)).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/You are offline/i);
    expect(textarea).toBeDisabled();
  });
});
