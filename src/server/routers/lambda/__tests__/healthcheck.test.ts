// @vitest-environment node
import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createContextInner } from '@/libs/trpc/lambda/context';

import { lambdaRouter } from '../index';

const businessHealthcheckMock = vi.hoisted(() => vi.fn());

vi.mock('@/business/server/healthcheck', () => ({
  businessHealthcheck: businessHealthcheckMock,
}));

describe('lambdaRouter.healthcheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    businessHealthcheckMock.mockResolvedValue(undefined);
  });

  it('returns the existing liveness response when dependency checks pass', async () => {
    const caller = lambdaRouter.createCaller(await createContextInner());

    await expect(caller.healthcheck()).resolves.toBe("i'm live!");
    expect(businessHealthcheckMock).toHaveBeenCalledTimes(1);
  });

  it('fails the healthcheck when the business dependency check fails', async () => {
    businessHealthcheckMock.mockRejectedValueOnce(
      new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Healthcheck failed: redis' }),
    );
    const caller = lambdaRouter.createCaller(await createContextInner());

    await expect(caller.healthcheck()).rejects.toThrow('Healthcheck failed: redis');
  });
});
