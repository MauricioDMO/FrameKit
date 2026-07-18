class TestResizeObserver implements ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    void callback
  }

  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = TestResizeObserver
