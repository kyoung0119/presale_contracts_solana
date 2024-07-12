use anchor_lang::prelude::*;

mod instructions;
mod state;
mod error;

use instructions::*;
use crate::state::stage::Stage;

declare_id!("9X5si3xhU4nFVh7FkGaC3n251xoN5JBoys9AEnrfkzxh");

#[program]
mod presale_contracts_solana {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        protocol_wallet: Pubkey,
        stages: Vec<Stage>
    ) -> Result<()> {
        instructions::initialize::handler(ctx, protocol_wallet, stages)
    }

    pub fn update_protocol_wallet(
        ctx: Context<UpdateProtocolWallet>,
        new_wallet: Pubkey
    ) -> Result<()> {
        instructions::update_protocol_wallet::handler(ctx, new_wallet)
    }

    pub fn set_stage(ctx: Context<SetStage>, stage_iterator: u64) -> Result<()> {
        instructions::set_stage::handler(ctx, stage_iterator)
    }

    pub fn update_total_sold(ctx: Context<UpdateTotalSold>, amount: u64) -> Result<()> {
        instructions::update_total_sold::handler(ctx, amount)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }
}
