use anchor_lang::prelude::*;
use crate::state::stage::Stage;

#[account]
pub struct PresaleInfo {
    pub authority: Pubkey,
    pub protocol_wallet: Pubkey,
    pub total_tokens_sold: u64,
    pub total_sold_in_usd: u64,
    pub stage_iterator: u64,
    pub stages: [Stage; 10],
    pub update_protocol_wallet_timestamp: i64,
}

pub const PRESALE_INFO_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + (8 + 8) * 10 + 8;