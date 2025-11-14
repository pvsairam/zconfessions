interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
  };
  Telegram?: {
    WebApp: {
      ready: () => void;
      expand: () => void;
      enableClosingConfirmation: () => void;
      HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
      };
    };
  };
}
