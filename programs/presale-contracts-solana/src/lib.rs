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
        ico_amount: u64,
        token_per_usd: u64,
        bump: u8
    ) -> Result<()> {
        instructions::initialize::handler(ctx, ico_amount, token_per_usd, bump)
    }

    // pub fn update_protocol_wallet(
    //     ctx: Context<UpdateProtocolWallet>,
    //     new_wallet: Pubkey
    // ) -> Result<()> {
    //     instructions::update_protocol_wallet::handler(ctx, new_wallet)
    // }

    pub fn deposit_sol(ctx: Context<Deposit>, sol_amount: u64) -> Result<()> {
        instructions::deposit::deposit_sol(ctx, sol_amount)
    }

    pub fn deposit_usdt(ctx: Context<DepositUSDT>, usdt_amount: u64) -> Result<()> {
        instructions::deposit_usdt::handler(ctx, usdt_amount)
    }
}
