use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Stage {
    pub token_amount: u64,
    pub token_price: u64,
}
