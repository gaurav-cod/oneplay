import { PaymentIntent } from "@stripe/stripe-js";
import { GameModel } from "./models/game.model";
import { GameFeedModel } from "./models/gameFeed.model";
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
  device: "web" | "mobile";
  referred_by_id?: string;
}

export interface IPayment extends PaymentIntent {
  metadata: {
    userId: string;
    orderId: string;
    action: string;
    plan_type: 'base'|'topup';
  }
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
  ip: string;
  city: string;
  country_name: string;
  country_code: string;
  country_calling_code: string;
  region: string;
  error?: boolean;
  reason?: string;
}

export interface SpeedTestServerRO {
  ping: string,
  download: string,
  upload: string
}
