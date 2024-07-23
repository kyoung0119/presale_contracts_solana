use anchor_lang::{ prelude::*, system_program };
use anchor_spl::token::{ self, TokenAccount, Transfer };
use spl_token::solana_program::native_token::LAMPORTS_PER_SOL;

use crate::error::ErrorCodes;
use crate::state::*;
use crate::utils::transfer_tokens;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub ico_info_pda: Account<'info, ICOInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: PDA authority, doesn't need to be a specific account type
    pub authority: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub protocol_wallet: AccountInfo<'info>,

    #[account(mut)]
    pub protocol_ico_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_ico_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, token::Token>,
}

pub fn deposit_sol(ctx: Context<Deposit>, sol_amount: u64) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;

    //  Transfer SOL from user to protocol wallet
    let user_balance = ctx.accounts.user.to_account_info().lamports();
    require!(user_balance > sol_amount, ErrorCodes::InsufficientUserSOLAmount);

    let cpi_program = ctx.accounts.system_program.to_account_info();
    let cpi_accounts = system_program::Transfer {
        from: ctx.accounts.user.to_account_info(),
        to: ctx.accounts.protocol_wallet.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    system_program::transfer(cpi_ctx, sol_amount)?;

    let transfer_ico_amount = (sol_amount * ico_info_pda.token_per_sol) / LAMPORTS_PER_SOL;

    msg!("transfer_ico_amount: {}", transfer_ico_amount);

    // let amount = ctx.accounts.protocol_ico_token_account.amount;
    // let (charge_back, expected_amount) = deposit_checks_and_effects(
    //     ico_info_pda,
    //     amount,
    //     false,
    //     sol_price
    // )?;

    // **ctx.accounts.authority.try_borrow_mut_lamports()? -= amount;
    // **ctx.accounts.protocol_wallet.try_borrow_mut_lamports()? += expected_amount;

    // Transfer ICO tokens from protocol to user
    let seeds = &[b"ICO-Authority".as_ref(), &[ico_info_pda.bump]];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.protocol_ico_token_account.to_account_info(),
        to: ctx.accounts.user_ico_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    let _ = token::transfer(cpi_ctx, transfer_ico_amount);

    // update_presale_state(ico_info_pda, expected_amount, charge_back, ctx.accounts.authority.key());
    // Update ICO state
    ico_info_pda.remaining_ico_amount -= transfer_ico_amount as u64;
    ico_info_pda.total_sol += sol_amount;

    Ok(())
}
