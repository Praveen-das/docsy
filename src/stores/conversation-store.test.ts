// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock external side-effects before importing store
vi.mock("@/lib/api-client", () => ({
  registerTokenHandlers: vi.fn(),
  api: { get: vi.fn(), post: vi.fn() },
}));

vi.mock("@/features/chat/services/conversation-polling.service", () => ({
  conversationPollingService: {
    startTitlePolling: vi.fn(),
    clearAllTitlePolling: vi.fn(),
  },
}));

vi.mock("@/lib/query-client", () => ({
  getQueryClient: vi.fn(() => ({
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
}));

vi.mock("@/features/conversations/services/conversation-cache.service", () => ({
  updateConversationInCache: vi.fn(),
}));

import { useConversationStore } from "./conversation-store";

describe("useConversationStore", () => {
  beforeEach(() => {
    useConversationStore.getState().resetToDefaults();
  });

  it("initializes with empty defaults", () => {
    const state = useConversationStore.getState();
    expect(state.activeConversationId).toBeNull();
    expect(state.drafts).toEqual({});
    expect(state.streamTokens).toEqual({});
    expect(state.isLoadingAi).toBe(false);
    expect(state.isAiTyping).toBe(false);
    expect(state.streamingContent).toBeNull();
  });

  it("saves and retrieves message drafts per conversation ID", () => {
    const { saveDraft } = useConversationStore.getState();

    saveDraft("conv-1", "Hello draft 1");
    saveDraft("conv-2", "Draft for second conversation");

    const state = useConversationStore.getState();
    expect(state.drafts["conv-1"]).toBe("Hello draft 1");
    expect(state.drafts["conv-2"]).toBe("Draft for second conversation");
  });

  it("switches conversation and preserves current draft seamlessly", () => {
    useConversationStore.getState().setActiveConversation("conv-1");

    // User is on conv-1 and types a draft, then switches to conv-2
    useConversationStore.getState().switchConversation("conv-2", "Unsent message in conv-1");

    const state = useConversationStore.getState();
    expect(state.activeConversationId).toBe("conv-2");
    expect(state.drafts["conv-1"]).toBe("Unsent message in conv-1");
  });

  it("stores and retrieves conversation capability tokens", () => {
    const { setStreamToken, getStreamToken } = useConversationStore.getState();

    setStreamToken("conv-jwt", "token-xyz-123");
    expect(getStreamToken("conv-jwt")).toBe("token-xyz-123");
  });

  it("tracks active streams and allows clearing", () => {
    const { setActiveStream, clearActiveStream } = useConversationStore.getState();

    setActiveStream("conv-stream", {
      convId: "conv-stream",
      assistantMessageId: "msg-asst-1",
      streamChannelId: "channel-1",
      startedAt: Date.now(),
    });

    expect(useConversationStore.getState().activeStreams["conv-stream"]).toBeDefined();

    clearActiveStream("conv-stream");
    expect(useConversationStore.getState().activeStreams["conv-stream"]).toBeUndefined();
  });

  it("resets all state to defaults on resetToDefaults()", () => {
    const store = useConversationStore.getState();
    store.saveDraft("conv-1", "draft");
    store.setActiveConversation("conv-1");
    store.setStreamToken("conv-1", "token");

    store.resetToDefaults();

    const resetState = useConversationStore.getState();
    expect(resetState.activeConversationId).toBeNull();
    expect(resetState.drafts).toEqual({});
    expect(resetState.activeStreams).toEqual({});
  });
});
