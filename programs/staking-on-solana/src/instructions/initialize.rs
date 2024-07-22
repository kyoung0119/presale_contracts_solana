use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(
    ctx: Context<Initialize>,
    protocol_wallet: Pubkey,
    ico_amount: u64,
    token_per_sol: u64
) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;
    ico_info_pda.authority = *ctx.accounts.authority.key;
    ico_info_pda.protocol_wallet = protocol_wallet;
    ico_info_pda.ico_amount = ico_amount;
    ico_info_pda.token_per_sol = token_per_sol;
    ico_info_pda.ico_remaining = ico_amount;
    ico_info_pda.total_sol = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = ICO_INFO_SIZE, seeds = [b"ICOInfo"], bump)]
    pub ico_info_pda: Account<'info, ICOInfo>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
