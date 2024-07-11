use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let presale = &mut ctx.accounts.presale;
    presale.authority = *ctx.accounts.authority.key;
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = PRESALE_SIZE)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
