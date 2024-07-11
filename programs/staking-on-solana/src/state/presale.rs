use anchor_lang::prelude::*;
use crate::state::Stage;

#[account]
pub struct Presale {
    pub authority: Pubkey,
    pub stages: [Stage; 10], // Assuming a maximum of 10 stages
}

pub const PRESALE_SIZE: usize = 8 + 32 + 10 * (8 + 8);
