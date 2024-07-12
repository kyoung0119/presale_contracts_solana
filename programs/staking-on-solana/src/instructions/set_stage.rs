use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::*;

pub fn handler(ctx: Context<SetStage>, stage_iterator: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    require!(stage_iterator < (presale_info.stages.len() as u64), ErrorCodes::InvalidStageIterator);
    presale_info.stage_iterator = stage_iterator;

    Ok(())
}

#[derive(Accounts)]
pub struct SetStage<'info> {
    #[account(mut, has_one = authority)]
    pub presale_info: Account<'info, PresaleInfo>,
    pub authority: Signer<'info>,
}
