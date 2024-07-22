// instructions/update_protocol_wallet.rs

use anchor_lang::prelude::*;
use crate::state::*;

pub fn handler(ctx: Context<UpdateProtocolWallet>, new_wallet: Pubkey) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;

    ico_info_pda.protocol_wallet = new_wallet;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProtocolWallet<'info> {
    #[account(mut, has_one = authority)]
    pub ico_info_pda: Account<'info, ICOInfo>,
    pub authority: Signer<'info>,
}
