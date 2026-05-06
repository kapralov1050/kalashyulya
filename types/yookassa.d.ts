interface YooMoneyCheckoutInstance {
  render(containerId: string): Promise<void>
  on(event: 'success', callback: () => void): void
  on(event: 'fail', callback: (err: { error: { type: string } }) => void): void
  destroy(): void
}

interface Window {
  YooMoneyCheckoutWidget: new (options: {
    confirmation_token: string
    return_url: string
    error_callback: (error: unknown) => void
  }) => YooMoneyCheckoutInstance
}
