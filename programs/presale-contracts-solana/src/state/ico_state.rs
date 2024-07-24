use anchor_lang::prelude::*;

#[account]
pub struct ICOState {
    pub remaining_ico_amount: u64, // Remaining amount of ICO tokens
    pub total_sol: u64, // Total amount of SOL collected
}

impl ICOState {
    pub const LEN: usize = 8 + 8 + 8;
}
