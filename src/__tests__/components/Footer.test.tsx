import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

// ── Mocks ────────────────────────────────────────────────────────────

jest.mock('@/lib/analytics', () => ({
  analytics: {
    externalLinkClick: jest.fn(),
  },
}));

describe('Footer', () => {
  it('renders the email link with itsryan@itsryan.ai', () => {
    render(<Footer />);
    const emailLink = document.querySelector('a[href="mailto:itsryan@itsryan.ai"]');
    expect(emailLink).toBeInTheDocument();
  });

  it('renders the GitHub link', () => {
    render(<Footer />);
    const ghLink = document.querySelector('a[href="https://github.com/wacemindu123"]');
    expect(ghLink).toBeInTheDocument();
  });

  it('renders the LinkedIn link', () => {
    render(<Footer />);
    const liLink = document.querySelector('a[href="https://linkedin.com/in/ryan-widgeon"]');
    expect(liLink).toBeInTheDocument();
  });

  it('renders the democratization tagline', () => {
    render(<Footer />);
    expect(
      screen.getByText('Democratization of AI for small and medium sized businesses')
    ).toBeInTheDocument();
  });

  it('does NOT contain Atlanta text', () => {
    render(<Footer />);
    expect(screen.queryByText(/Atlanta/i)).not.toBeInTheDocument();
  });
});
