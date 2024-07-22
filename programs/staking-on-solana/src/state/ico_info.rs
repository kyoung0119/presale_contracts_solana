use anchor_lang::prelude::*;

#[account]
pub struct ICOInfo {
    pub authority: Pubkey,
    pub protocol_wallet: Pubkey,
    pub ico_amount: u64,
    pub token_per_sol: u64,
    pub ico_remaining: u64,
    pub total_sol: u64,
    pub usdc_mint: Pubkey,
    pub usdt_mint: Pubkey,
}

pub const ICO_INFO_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 32 + 32;
