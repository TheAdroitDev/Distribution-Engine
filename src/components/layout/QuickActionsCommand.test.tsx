import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickActionsCommand } from './QuickActionsCommand';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}));

describe('QuickActionsCommand Component', () => {
  it('renders quick action trigger and quick add button on navbar', () => {
    render(<QuickActionsCommand />);

    expect(screen.getByText('Quick actions...')).toBeDefined();
    expect(screen.getByText('Add Content')).toBeDefined();
  });

  it('navigates to /content/new when clicking Add Content', () => {
    render(<QuickActionsCommand />);

    const addBtn = screen.getByRole('button', { name: /add content/i });
    fireEvent.click(addBtn);

    expect(mockPush).toHaveBeenCalledWith('/content/new');
  });

  it('navigates to /content/new when pressing "c" key', () => {
    render(<QuickActionsCommand />);

    fireEvent.keyDown(window, { key: 'c' });

    expect(mockPush).toHaveBeenCalledWith('/content/new');
  });
});
