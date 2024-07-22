use anchor_lang::prelude::*;
use anchor_spl::token::{ self, TokenAccount };

use crate::state::*;
use crate::utils::{ deposit_checks_and_effects, update_presale_state };

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut, has_one = authority)]
    pub ico_info_pda: Account<'info, ICOInfo>,
    pub authority: Signer<'info>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub protocol_wallet: Account<'info, TokenAccount>,
    pub token_program: Program<'info, token::Token>,
}

pub fn deposit_sol(ctx: Context<Deposit>, sol_price: u64) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;
    let amount = ctx.accounts.token_account.amount;
    let (charge_back, expected_amount) = deposit_checks_and_effects(
        ico_info_pda,
        amount,
        false,
        sol_price
    )?;

    **ctx.accounts.authority.try_borrow_mut_lamports()? -= amount;
    // **ctx.accounts.protocol_wallet.try_borrow_mut_lamports()? += expected_amount;

    // transfer_tokens(
    //     ctx.accounts.token_account.to_account_info(),
    //     ctx.accounts.protocol_wallet.to_account_info(),
    //     ctx.accounts.authority.to_account_info(),
    //     ctx.accounts.token_program.to_account_info(),
    //     amount
    // )?;

    update_presale_state(ico_info_pda, expected_amount, charge_back, ctx.accounts.authority.key());
    Ok(())
}
