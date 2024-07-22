use anchor_lang::prelude::*;

mod instructions;
mod state;
mod error;
mod utils;

use instructions::*;

declare_id!("9X5si3xhU4nFVh7FkGaC3n251xoN5JBoys9AEnrfkzxh");

#[program]
mod presale_contracts_solana {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        protocol_wallet: Pubkey,
        ico_amount: u64,
        token_per_sol: u64
    ) -> Result<()> {
        instructions::initialize::handler(ctx, protocol_wallet, ico_amount, token_per_sol)
    }

    pub fn update_protocol_wallet(
        ctx: Context<UpdateProtocolWallet>,
        new_wallet: Pubkey
    ) -> Result<()> {
        instructions::update_protocol_wallet::handler(ctx, new_wallet)
    }

    pub fn deposit_sol(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::deposit_sol(ctx, amount)
    }
}
