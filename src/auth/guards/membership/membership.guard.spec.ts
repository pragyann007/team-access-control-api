import { MembershipGuard } from './membership.guard';

describe('MembershipGuard', () => {
  it('should be defined', () => {
    expect(new MembershipGuard()).toBeDefined();
  });
});
