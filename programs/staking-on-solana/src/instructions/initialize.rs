use anchor_lang::prelude::*;

use crate::state::*;

pub fn handler(
    ctx: Context<Initialize>,
    protocol_wallet: Pubkey,
    stages: Vec<Stage>
) -> Result<()> {
    let presale = &mut ctx.accounts.presale;
    presale.authority = *ctx.accounts.authority.key;
    presale.protocol_wallet = protocol_wallet;
    presale.total_tokens_sold = 0;
    presale.total_sold_in_usd = 0;
    presale.stage_iterator = 0;

    for (i, stage) in stages.iter().enumerate() {
        presale.stages[i] = stage.clone();
    }

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = PRESALE_SIZE)]
    pub presale: Account<'info, Presale>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
