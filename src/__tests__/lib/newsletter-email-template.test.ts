/**
 * @jest-environment node
 */
import { renderNewsletterEmailHtml } from '@/lib/newsletter-email-template';

const baseOpts = {
  subject: 'Claude just shipped file creation',
  content:
    'Cold open line.\n\n' +
    '## The Move\n' +
    '**Turn call recordings into polished estimates**\n\n' +
    'For solo contractors who live in voice memos.\n\n' +
    '```spec\n' +
    'For: solo contractors\n' +
    'Cost: $20/mo\n' +
    'Stack: Claude, Otter.ai\n' +
    '```\n\n' +
    '1. Open Otter.\n' +
    '2. Paste into Claude with the prompt below.\n' +
    '3. Export to PDF.\n\n' +
    '**Catch:** Otter free tier caps at 600 min/mo.\n\n' +
    '## The News\n' +
    '**Anthropic ships Files in Claude**\n\n' +
    'Claude can now create and edit real files ([link](https://example.com)).\n\n' +
    '```pullquote\nThe model is no longer a chat box.\n```\n\n' +
    '**What to do this week:** Try one real deliverable.\n',
  siteUrl: 'https://itsryan.ai',
};

describe('renderNewsletterEmailHtml — preview kind', () => {
  const html = renderNewsletterEmailHtml({
    ...baseOpts,
    kind: 'preview',
    approveUrl: 'https://itsryan.ai/approve/abc',
    changesUrl: 'https://itsryan.ai/changes/abc',
    draftId: 42,
  });

  it('includes the Approve & Send button', () => {
    expect(html).toContain('Approve &amp; Send');
    expect(html).toContain('https://itsryan.ai/approve/abc');
  });

  it('includes the Request Changes button', () => {
    expect(html).toContain('Request Changes');
    expect(html).toContain('https://itsryan.ai/changes/abc');
  });

  it('shows the Internal preview label + draft number', () => {
    expect(html).toContain('Internal preview');
    expect(html).toContain('Draft #42');
  });

  it('does NOT render a subscriber unsubscribe footer', () => {
    expect(html).not.toContain('Unsubscribe');
  });
});

describe('renderNewsletterEmailHtml — subscriber kind (regression: no preview UI leaks)', () => {
  const html = renderNewsletterEmailHtml({
    ...baseOpts,
    kind: 'subscriber',
    unsubscribeUrl: 'https://itsryan.ai/unsubscribe?email=a%40b.com&token=xyz',
  });

  it('does NOT include the Approve button', () => {
    expect(html).not.toContain('Approve &amp; Send');
    expect(html).not.toContain('Approve & Send');
  });

  it('does NOT include the Request Changes button', () => {
    expect(html).not.toContain('Request Changes');
  });

  it('does NOT include the Internal preview label', () => {
    expect(html).not.toContain('Internal preview');
    expect(html).not.toContain('Draft #');
  });

  it('DOES include the subscriber unsubscribe link', () => {
    expect(html).toContain('https://itsryan.ai/unsubscribe?email=a%40b.com&token=xyz');
    expect(html).toContain('Unsubscribe');
  });

  it('renders the Anti-gatekeeping AI newsletter name in the masthead', () => {
    expect(html).toContain('Anti-gatekeeping AI newsletter');
  });
});

describe('renderNewsletterEmailHtml — motifs render when present', () => {
  const html = renderNewsletterEmailHtml({
    ...baseOpts,
    kind: 'subscriber',
    unsubscribeUrl: 'https://itsryan.ai/unsubscribe?email=a%40b.com&token=xyz',
    content:
      baseOpts.content +
      '\n## The Win\n' +
      '```win\n' +
      'Business: Cedar Lane Dental, Tulsa\n' +
      'Headline: Cut email triage by 78%\n' +
      'Metric: 2.1 hrs → 23 min/day\n' +
      'Body: They piped inbound booking emails to Claude.\n' +
      'Quote: Felt like hiring a part-time admin.\n' +
      '```\n',
  });

  it('renders the spec strip keys', () => {
    expect(html).toContain('For');
    expect(html).toContain('Cost');
    expect(html).toContain('Stack');
  });

  it('renders the win card with business + metric', () => {
    expect(html).toContain('Cedar Lane Dental, Tulsa');
    expect(html).toContain('2.1 hrs');
    expect(html).toContain('23 min/day');
  });

  it('renders the pull quote content', () => {
    expect(html).toContain('The model is no longer a chat box.');
  });

  it('escapes HTML in the subject', () => {
    const evil = renderNewsletterEmailHtml({
      ...baseOpts,
      subject: '<script>alert(1)</script>',
      kind: 'subscriber',
      unsubscribeUrl: 'https://itsryan.ai/u',
    });
    expect(evil).not.toContain('<script>alert(1)</script>');
    expect(evil).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});
