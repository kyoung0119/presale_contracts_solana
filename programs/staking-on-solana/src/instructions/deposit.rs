use anchor_lang::prelude::*;
use anchor_spl::token::{ self, TokenAccount, Transfer };

use crate::state::*;
use crate::error::*;

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    // Extract stage iterator first to avoid multiple mutable borrows
    let stage_iterator = presale_info.stage_iterator as usize;

    // Ensure we have enough tokens in the current stage
    require!(
        presale_info.stages[stage_iterator].token_amount >= amount,
        ErrorCodes::InsufficientStageTokens
    );

    // Transfer tokens to protocol wallet
    let cpi_accounts = Transfer {
        from: ctx.accounts.token_account.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(), // Replace with actual protocol wallet account
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Update stage and presale details in a separate mutable borrow scope
    {
        let stage = &mut presale_info.stages[stage_iterator];
        stage.token_amount -= amount;
    }

    presale_info.total_tokens_sold += amount;
    presale_info.total_sold_in_usd += presale_info.stages[stage_iterator].token_price * amount; // Assume USD price is token price for simplicity

    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub presale_info: Account<'info, PresaleInfo>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, constraint = token_account.owner == payer.key())]
    pub token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, token::Token>,
}
