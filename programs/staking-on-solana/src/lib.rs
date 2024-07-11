use anchor_lang::prelude::*;

use instructions::*;

mod instructions;
mod state;

declare_id!("9X5si3xhU4nFVh7FkGaC3n251xoN5JBoys9AEnrfkzxh");

#[program]
mod presale_contracts_solana {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn set_stage(
        ctx: Context<SetStage>,
        stage: u8,
        token_amount: u64,
        token_price: u64
    ) -> Result<()> {
        instructions::set_stage::handler(ctx, stage, token_amount, token_price)
    }
}
