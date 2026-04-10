import { render, screen } from '@testing-library/react';
import { KpiCard, LiveDot, ChartCard, AlertBanner, Toast } from '@/app/admin/submissions/dashboard-components';

describe('KpiCard', () => {
  it('renders label, value, and subtitle', () => {
    render(<KpiCard label="Contacted" value={42} subtitle="70% of total" />);
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('70% of total')).toBeInTheDocument();
  });

  it('renders tag when provided', () => {
    render(<KpiCard label="Warm" value={10} tag={{ text: 'warm', color: 'green' }} />);
    expect(screen.getByText('warm')).toBeInTheDocument();
  });

  it('applies flash class when flash=true', () => {
    const { container } = render(<KpiCard label="Today" value={5} flash={true} />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});

describe('LiveDot', () => {
  it('shows "Live" when connected', () => {
    render(<LiveDot connected={true} />);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows "Offline" when not connected', () => {
    render(<LiveDot connected={false} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});

describe('ChartCard', () => {
  it('renders title, subtitle, and children', () => {
    render(
      <ChartCard title="Weekly Volume" subtitle="Last 12 weeks">
        <div data-testid="chart-child">chart here</div>
      </ChartCard>
    );
    expect(screen.getByText('Weekly Volume')).toBeInTheDocument();
    expect(screen.getByText('Last 12 weeks')).toBeInTheDocument();
    expect(screen.getByTestId('chart-child')).toBeInTheDocument();
  });
});

describe('AlertBanner', () => {
  it('renders nothing when thresholds are fine', () => {
    const { container } = render(<AlertBanner uncontacted={10} oldestStaleDays={5} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders when uncontacted > 50', () => {
    render(<AlertBanner uncontacted={60} oldestStaleDays={5} />);
    expect(screen.getByText(/60 uncontacted/)).toBeInTheDocument();
  });

  it('renders when oldest stale > 14 days', () => {
    render(<AlertBanner uncontacted={10} oldestStaleDays={20} />);
    expect(screen.getByText(/20 days old/)).toBeInTheDocument();
  });

  it('renders both messages when both thresholds exceeded', () => {
    render(<AlertBanner uncontacted={60} oldestStaleDays={20} />);
    expect(screen.getByText(/60 uncontacted/)).toBeInTheDocument();
    expect(screen.getByText(/20 days old/)).toBeInTheDocument();
  });
});

describe('Toast', () => {
  it('renders message when visible', () => {
    render(<Toast message="New lead: John" visible={true} />);
    expect(screen.getByText('New lead: John')).toBeInTheDocument();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(<Toast message="Hidden" visible={false} />);
    expect(container.firstChild).toBeNull();
  });
});
