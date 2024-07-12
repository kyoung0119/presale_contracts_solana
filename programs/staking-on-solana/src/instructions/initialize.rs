use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(
    ctx: Context<Initialize>,
    protocol_wallet: Pubkey,
    stages: Vec<Stage>,
    usdt_mint: Pubkey,
    usdc_mint: Pubkey
) -> Result<()> {
    let presale_info = &mut ctx.accounts.presale_info;
    presale_info.authority = *ctx.accounts.authority.key;
    presale_info.usdt_mint = usdt_mint;
    presale_info.usdc_mint = usdc_mint;
    presale_info.protocol_wallet = protocol_wallet;
    presale_info.total_tokens_sold = 0;
    presale_info.total_sold_in_usd = 0;
    presale_info.stage_iterator = 0;

    for (i, stage) in stages.iter().enumerate() {
        presale_info.stages[i] = stage.clone();
    }

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = PRESALE_INFO_SIZE)]
    pub presale_info: Account<'info, PresaleInfo>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
