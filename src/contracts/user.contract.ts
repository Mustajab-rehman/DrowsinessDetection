import { ENUMS } from "@/constants/enum";
import { Model, ObjectId } from "mongoose";

export interface IUser {
  id: ObjectId;
  name: string;
  email: string;
  password: string;
  passwordResetAt?: Date;
  role: (typeof ENUMS.USER_TYPES)[number];
  dob?: Date;
  mobileNumber: string;
  countryCode: string;
  countryCodeName: string;
  profilePicture?: string;
  address?: string;
  status: (typeof ENUMS.USER_STATUS)[number];
  notificationStatus: boolean;
  locationStatus: (typeof ENUMS.LOCATION_STATUS)[number];
  latitude?: number;
  longitude?: number;
  otp?: string;
  otpExpiresAt?: Date;
  emailVerificationOtp?: string;
  emailVerificationOtpExpiresAt?: Date;
  phoneVerificationOtp?: string;
  phoneVerificationOtpExpiresAt?: Date;
  verified: boolean;
  verifiedAt?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  phoneNumberVerified: boolean;
  phoneNumberVerifiedAt?: Date;
  hasTwoFactorAuth: boolean;
  bio?: string;
  loginWithQRCode: boolean;
  loginQRCode?: string;
  profileQrCode?: string;
  subscriptionId?: string;
  isSubscriptionActive: boolean;
  subscriptionActivatedAt?: Date;
  subscriptionExpiresAt?: Date;
  deviceType?: (typeof ENUMS.DEVICE_TYPES)[number];
  deviceUniqueId?: string;
  fcmToken?: string;
  allowResetPassword: boolean;
  loginQRCodeData?: string;
  stripeCustomerId?: string;
  lastPaymentAt?: Date;
  loginStats: {
    lastLoginWithQRCode: Date;
    numberOfConsecutiveLoginsWithoutQRCode: number;
    hasEverLoggedInWithQRCode: boolean;
    lastLogin: Date;
  };
}

export interface IUserMethods {
  comparePassword: (password: string) => boolean;
  hashPassword: (password: string) => string;
}

export type UserCreatePayload = Pick<IUser, "name" | "email" | "password" | "otp" | "loginQRCode">;

export type UserUpdatePayload = Omit<
  Partial<UserCreatePayload> &
    Partial<
      Pick<
        IUser,
        "bio" | "dob" | "mobileNumber" | "countryCode" | "countryCodeName" | "allowResetPassword" | "profilePicture"
      >
    >,
  "password" | "otp"
>;

export type UserModel = Model<IUser, unknown, IUserMethods>;

export type ResetPasswordPayload = Pick<IUser, "email">;
