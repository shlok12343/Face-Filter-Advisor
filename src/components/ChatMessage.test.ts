import { describe, it, expect } from 'vitest';
import { categorizeDecision, isDecision } from '../res';

describe('ChatMessage Component', () => {

  it('should categorize decision correctly', async () => {
	const result = await categorizeDecision("Should I buy Stocks or Bonds?");
	expect(result).toBe("be");
  });

  it('should render correctly', () => {
    expect("be").toBe("be");
  });

  it('should determine if input is a decision', async () => {
	const result = await isDecision("Should I buy Stocks or Bonds?");
	expect(result).toBe("be");
  });
});