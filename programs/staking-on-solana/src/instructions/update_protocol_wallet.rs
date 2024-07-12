// instructions/update_protocol_wallet.rs

use anchor_lang::prelude::*;
use crate::state::Presale;
use crate::error::*;

pub fn handler(ctx: Context<UpdateProtocolWallet>, new_wallet: Pubkey) -> Result<()> {
    let presale = &mut ctx.accounts.presale;
    let current_time = Clock::get()?.unix_timestamp;
    let delay = 12 * 60 * 60; // 12 hours

    if
        presale.update_protocol_wallet_timestamp > 0 &&
        presale.update_protocol_wallet_timestamp <= current_time
    {
        presale.protocol_wallet = new_wallet;
        presale.update_protocol_wallet_timestamp = 0;
    } else {
        presale.update_protocol_wallet_timestamp = current_time + delay;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProtocolWallet<'info> {
    #[account(mut, has_one = authority)]
    pub presale: Account<'info, Presale>,
    pub authority: Signer<'info>,
}
