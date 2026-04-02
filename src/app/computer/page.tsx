import type { Metadata } from 'next';
import ComputerInterface from '@/components/computer/ComputerInterface';

export const metadata: Metadata = {
  title: 'Computer | AI Agent Interface',
  description: 'An AI agent that delegates tasks to sub-agents. Describe what you need, and Computer handles the rest.',
};

export default function ComputerPage() {
  return <ComputerInterface />;
}
