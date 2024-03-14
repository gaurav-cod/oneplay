import { PaymentIntent } from "@stripe/stripe-js";
import { VideoModel } from "./models/video.model";

export interface LoginDTO {
  id: string;
  password: string;
}

export interface SignupDTO {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  gender: "male" | "female" | "other" | "unknown";
  device: "web" | "mobile" | "tizen";
  referred_by_id?: string;
}

export interface IPayment extends PaymentIntent {
  metadata: {
    userId: string;
    orderId: string;
    action: string;
    plan_type: "base" | "topup";
  };
}
export interface VerifySignupDTO {
  token: string;
  otp: string;
}

export interface StartPcRO {
  success: boolean;
  msg: string;
}

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface PurchaseStore {
  name: string;
  link: string;
  store_image: string;
}

export interface StripeTxn {
  token: string;
  orderId: string;
  amount: string;
}

export interface TokensUsageDTO {
  total_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  total_daily_tokens: number;
  used_daily_tokens: number;
}

export interface UpdateProfileDTO {
  profile_image?: File;
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  dob?: string;
  phone?: string;
}

export interface StartGameRO {
  code: number;
  data: {
    api_action?: "call_terminate" | "call_session";
    game?: {
      game_id: string;
      game_name: string;
    };
    session?: {
      id: string;
      launched_at: number;
    };
  };
  msg: string;
  status: number;
}
export interface GameTermCondition {
  code: number;
  data: {
    tnc: string;
    url: string;
    last_updated: string;
  };
  msg: string;
  status: number;
}

export interface VideoWithGameId {
  gameId: string;
  video: VideoModel;
}

export interface GameStatusRO {
  game_id: string;
  game_name: string;
  is_running: boolean;
  is_user_connected: boolean;
  session_id: string;
}

export interface TerminateStreamRO {
  code: number;
  data: {
    session_duration?: number;
    play_duration?: number;
    idle_duration?: number;
  };
  msg: string;
  status: "success" | "fail";
}

export interface GameSessionRO {
  game_id: string;
  user_id: string;
  user_session_id: string;
}

export interface ClientTokenRO {
  client_token: string;
  code: number;
  msg: string;
  progress: number;
}

export interface WebPlayTokenRO {
  code: number;
  data: {
    service?: "running" | "stopped";
    web_url?: string;
  };
  msg: string;
  status: "success" | "fail";
}

export interface ILocation {
  as: string;
  asname: string;
  city: string;
  countryCode: string;
  continent: string;
  country: string;
  currency: string;
  district: string;
  hosting: boolean;
  isp: string;
  lat: number;
  lon: number;
  mobile: boolean;
  org: string;
  proxy: boolean;
  regionName: true;
  reverse: string;
  status: string;
  timezone: string;
  zip: string;
  created_at: number;
  ip: string;
}

export interface SpeedTestServerRO {
  ping: string;
  download: string;
  upload: string;
  recommended_latency: number;
  recommended_download: number;
  recommended_upload: number;
}

export interface BilldeskPaymentRO {
  orderId: string;
  bdOrderId: string;
  token: string;
}

export interface CouponResponse {
  coupon_id: string;
  discount: number;
}

export interface SetOnlineRO {
  unread_senders: string[];
  new_notification_count: number;
}

export interface GetLoginUrlRO {
  url: string;
  partner_id: string;
}

export interface UserAuthDTO {
  phone: string;
  device: string;
  password?: string;
  idempotent_key?: string;
  otp?: string;
  referral_code?: string;
}

export interface LoginRO {
  session_token: string;
  trigger_speed_test: boolean;
  update_profile: boolean;
  profile: object;
}

export interface LoginOtpRO extends LoginRO {
  new_user: boolean;
}

export interface FilterPayload {
  cell_style: string;
  content_ids: string;
  game_ids: string;
}