use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::*;

pub fn handler(ctx: Context<SetStage>, stage_iterator: u64) -> Result<()> {
    let presale = &mut ctx.accounts.presale;
    require!(stage_iterator < (presale.stages.len() as u64), ErrorCodes::InvalidStageIterator);
    presale.stage_iterator = stage_iterator;

    Ok(())
}

#[derive(Accounts)]
pub struct SetStage<'info> {
    #[account(mut, has_one = authority)]
    pub presale: Account<'info, Presale>,
    pub authority: Signer<'info>,
}
