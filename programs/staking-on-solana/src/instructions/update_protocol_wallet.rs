// instructions/update_protocol_wallet.rs

use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::*;

pub fn handler(ctx: Context<UpdateProtocolWallet>, new_wallet: Pubkey) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    let current_time = Clock::get()?.unix_timestamp;
    // let delay = 12 * 60 * 60; // 12 hours
    let delay = 12; // 12 seconds for test

    if
        presale_info.update_protocol_wallet_timestamp > 0 &&
        presale_info.update_protocol_wallet_timestamp <= current_time
    {
        presale_info.protocol_wallet = new_wallet;
        presale_info.update_protocol_wallet_timestamp = 0;
    } else {
        presale_info.update_protocol_wallet_timestamp = current_time + delay;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProtocolWallet<'info> {
    #[account(mut, has_one = authority)]
    pub presale_info: Account<'info, PresaleInfo>,
    pub authority: Signer<'info>,
}
