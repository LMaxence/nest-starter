import { User } from '../user.entity';

export type SerializedUser = Omit<
  User,
  'password' | 'emailCandidate' | 'passwordResetToken' | 'emailProofToken' | 'emailProofTokenExpiresAt' | 'passwordResetTokenExpiresAt'
>;
