use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(
    ctx: Context<Initialize>,
    protocol_wallet: Pubkey,
    ico_amount: u64,
    token_per_sol: u64
) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;
    let (authority, bump) = Pubkey::find_program_address(&[b"ICO-Authority"], ctx.program_id);
    ico_info_pda.admin = ctx.accounts.admin.key();
    ico_info_pda.authority = authority;
    ico_info_pda.bump = bump;
    ico_info_pda.protocol_wallet = protocol_wallet;
    ico_info_pda.total_ico_amount = ico_amount;
    ico_info_pda.token_per_sol = token_per_sol;
    ico_info_pda.remaining_ico_amount = ico_amount;
    ico_info_pda.total_sol = 0;

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = ICOInfo::LEN, seeds = [b"ICO-Info"], bump)]
    pub ico_info_pda: Account<'info, ICOInfo>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}
