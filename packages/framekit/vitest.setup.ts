class TestResizeObserver implements ResizeObserver {
  private readonly callback: ResizeObserverCallback

  constructor (callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe () {}

  unobserve () {}

  disconnect () {}
}

globalThis.ResizeObserver = TestResizeObserver
