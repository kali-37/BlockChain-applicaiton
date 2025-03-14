interface NonceResponse {
    message: string;
    nonce: string;
  }
  
  interface AuthResponse {
    token: string;
    expires_at: string;
    wallet_address: string;
    profile_exists: boolean;
  }
  
  interface ProfileResponse {
    message: string;
    wallet_address: string;
    username?: string;
    current_level: number;
    is_profile_complete?: boolean;
    is_registered_on_chain: boolean;
    referrer?: string;
  }
  