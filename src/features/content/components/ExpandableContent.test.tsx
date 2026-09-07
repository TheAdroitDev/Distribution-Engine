import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableContent } from './ExpandableContent';

describe('ExpandableContent Component', () => {
  it('renders short content without toggle button', () => {
    render(<ExpandableContent content="Short content under threshold" />);

    expect(screen.getByText('Short content under threshold')).toBeDefined();
    expect(screen.queryByText('Show more')).toBeNull();
    expect(screen.queryByText('Show less')).toBeNull();
  });

  it('renders content over threshold with "Show more" toggle and expands on click', () => {
    const longContent = 'A'.repeat(150);
    render(<ExpandableContent content={longContent} />);

    expect(screen.getByText(longContent)).toBeDefined();
    expect(screen.getByText('150 characters')).toBeDefined();

    const showMoreBtn = screen.getByRole('button', { name: /show more/i });
    expect(showMoreBtn).toBeDefined();

    // Click to expand
    fireEvent.click(showMoreBtn);

    expect(screen.getByRole('button', { name: /show less/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /show more/i })).toBeNull();

    // Click to collapse
    fireEvent.click(screen.getByRole('button', { name: /show less/i }));

    expect(screen.getByRole('button', { name: /show more/i })).toBeDefined();
  });

  it('stops click propagation to avoid triggering parent link navigation', () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <ExpandableContent content={'B'.repeat(200)} />
      </div>
    );

    const showMoreBtn = screen.getByRole('button', { name: /show more/i });
    fireEvent.click(showMoreBtn);

    expect(parentClick).not.toHaveBeenCalled();
  });
});
