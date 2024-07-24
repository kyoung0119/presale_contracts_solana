use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::*;

pub fn handler(ctx: Context<UpdateProtocolWallet>, new_wallet: Pubkey) -> Result<()> {
    let ico_info = &mut ctx.accounts.ico_info;

    // Ensure the caller is the admin
    require_keys_eq!(ico_info.admin, ctx.accounts.admin.key(), ErrorCodes::Unauthorized);

    // ico_info.protocol_wallet = new_wallet;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProtocolWallet<'info> {
    #[account(mut, has_one = authority)]
    pub ico_info: Account<'info, ICOInfo>,

    #[account(mut)]
    pub admin: Signer<'info>,

    /// CHECK:
    #[account(address = ico_info.authority)]
    pub authority: AccountInfo<'info>,
}
