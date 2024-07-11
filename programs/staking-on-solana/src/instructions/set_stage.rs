use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(
    ctx: Context<SetStage>,
    stage: u8,
    token_amount: u64,
    token_price: u64
) -> Result<()> {
    let presale = &mut ctx.accounts.presale;
    presale.stages[stage as usize] = Stage { token_amount, token_price };
    Ok(())
}

#[derive(Accounts)]
pub struct SetStage<'info> {
    #[account(mut, has_one = authority)]
    pub presale: Account<'info, Presale>,
    pub authority: Signer<'info>,
}
