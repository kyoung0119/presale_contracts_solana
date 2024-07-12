use anchor_lang::prelude::*;

// NOTE: Anchor 0.27 adds 6000 for user error codes)
// (old Anchor 0.18 added 300 for user error codes)
#[error_code]
pub enum ErrorCodes {
    #[msg("Update Protocol Wallet: Delay in progress")]
    UpdateProtocolWalletDelay,

    #[msg("Invalid stage iterator")]
    InvalidStageIterator,

    #[msg("Insufficient tokens in stage")]
    InsufficientStageTokens,
}
