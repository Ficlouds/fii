import { describe, expect, it } from 'vitest';

import { isModelNotFoundError } from './isModelNotFoundError';

describe('isModelNotFoundError', () => {
  it('should return false for undefined/empty input', () => {
    expect(isModelNotFoundError(undefined)).toBe(false);
    expect(isModelNotFoundError('')).toBe(false);
  });

  it('should detect "model not found" errors', () => {
    expect(isModelNotFoundError('The model gpt-5 was not found')).toBe(false);
    expect(isModelNotFoundError('model not found: gpt-5')).toBe(true);
  });

  it('should detect "model_not_found" code in message', () => {
    expect(isModelNotFoundError('Error: model_not_found')).toBe(true);
  });

  it('should detect "model ... does not exist" (OpenAI)', () => {
    expect(
      isModelNotFoundError('The model `gpt-5` does not exist or you do not have access to it.'),
    ).toBe(true);
  });

  it('should detect "model or endpoint ... does not exist" (Volcengine/doubao)', () => {
    expect(
      isModelNotFoundError(
        'The model or endpoint doubao-seed-2.0-pro does not exist or you do not have access to it.',
      ),
    ).toBe(true);
  });

  it('should NOT match "does not exist" without model context', () => {
    // API key errors that incidentally say "does not exist"
    expect(isModelNotFoundError('Your API key does not exist')).toBe(false);
    // Deployment/endpoint errors
    expect(isModelNotFoundError('The deployment for this resource does not exist')).toBe(false);
    // Generic resource errors
    expect(isModelNotFoundError('This user does not exist')).toBe(false);
    expect(isModelNotFoundError('The organization does not exist')).toBe(false);
  });

  it('should NOT match when "model" and "does not exist" are in different sentences', () => {
    expect(
      isModelNotFoundError(
        'This feature does not exist in your plan. Contact support to enable the model.',
      ),
    ).toBe(false);
    expect(isModelNotFoundError('The model is fine. Your account does not exist.')).toBe(false);
  });

  it('should detect "no such model" errors', () => {
    expect(isModelNotFoundError('no such model: custom-model-v1')).toBe(true);
  });

  it('should detect "not found model" errors', () => {
    expect(isModelNotFoundError('not found model abc-123')).toBe(true);
  });

  it('should detect "model is not accessible" errors', () => {
    expect(isModelNotFoundError('The model is not accessible with your current plan')).toBe(true);
  });

  it('should detect "model is not available" errors', () => {
    expect(isModelNotFoundError('The requested model is not available in this region')).toBe(true);
  });

  it('should detect "invalid model" errors', () => {
    expect(isModelNotFoundError('invalid model: test-model')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(isModelNotFoundError('MODEL NOT FOUND')).toBe(true);
    expect(isModelNotFoundError('The Model Does Not Exist')).toBe(true);
  });

  it('should return false for unrelated error messages', () => {
    expect(isModelNotFoundError('Insufficient Balance')).toBe(false);
    expect(isModelNotFoundError('Invalid API key')).toBe(false);
    expect(isModelNotFoundError('Rate limit reached')).toBe(false);
    expect(isModelNotFoundError('context length exceeded')).toBe(false);
  });
});
