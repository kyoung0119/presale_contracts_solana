use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(ctx: Context<UpdateTotalSold>, amount: u64) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let current_time = Clock::get()?.unix_timestamp;

    if
        presale_info.update_total_sold_timestamp > 0 &&
        presale_info.update_total_sold_timestamp <= current_time
    {
        presale_info.total_tokens_sold = amount;
        presale_info.update_total_sold_timestamp = 0;
    } else {
        presale_info.update_total_sold_timestamp = current_time + DEFAULT_DELAY_SECONDS;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateTotalSold<'info> {
    #[account(mut, has_one = authority)]
    pub presale_info: Account<'info, PresaleInfo>,
    pub authority: Signer<'info>,
}
