use anchor_lang::prelude::*;

#[account]
pub struct ICOInfo {
    pub admin: Pubkey,
    pub authority: Pubkey, // PDA authority for managing the ICO
    pub bump: u8, // Bump seed for PDA
    pub protocol_wallet: Pubkey, // Address of protocol treasury
    pub token_per_sol: u64, // Number of ICO tokens per SOL
    pub total_ico_amount: u64, // Total amount of ICO tokens allocated
    pub remaining_ico_amount: u64, // Remaining amount of ICO tokens
    pub total_sol: u64, // Total amount of SOL collected
}

impl ICOInfo {
    pub const LEN: usize = 8 + 32 + 32 + 1 + 32 + 8 + 8 + 8 + 8;
}
