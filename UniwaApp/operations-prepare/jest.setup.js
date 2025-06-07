import '@testing-library/jest-dom';

// モックの設定
jest.mock('react-icons/md', () => ({
  MdExpandMore: () => 'MdExpandMore',
  MdExpandLess: () => 'MdExpandLess'
}));

jest.mock('@radix-ui/react-switch', () => ({
  Root: ({ checked, onCheckedChange, disabled, children }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      {checked ? 'ON' : 'OFF'}
      {children}
    </button>
  ),
  Thumb: ({ children }) => <span>{children}</span>
}));

// グローバルなモックの設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 