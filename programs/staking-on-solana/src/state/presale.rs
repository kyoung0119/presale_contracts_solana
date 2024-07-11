use anchor_lang::prelude::*;
use crate::state::stage::Stage;

#[account]
pub struct Presale {
    pub authority: Pubkey,
    pub protocol_wallet: Pubkey,
    pub total_tokens_sold: u64,
    pub total_sold_in_usd: u64,
    pub stage_iterator: u64,
    pub stages: [Stage; 10],
}

pub const PRESALE_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + (8 + 8) * 10;