import { renderNewsletterEmailHtml } from './newsletter-email-template';

export function renderNewsletterPreviewEmailHtml(params: {
  draftId: number;
  subject: string;
  content: string;
  approveUrl: string;
  changesUrl: string;
}): string {
  return renderNewsletterEmailHtml({
    kind: 'preview',
    subject: params.subject,
    content: params.content,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://itsryan.ai',
    approveUrl: params.approveUrl,
    changesUrl: params.changesUrl,
    draftId: params.draftId,
  });
}

