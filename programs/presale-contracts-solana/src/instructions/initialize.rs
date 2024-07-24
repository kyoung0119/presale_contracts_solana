use anchor_lang::prelude::*;
use anchor_spl::token::{ self, Mint, TokenAccount };

use crate::{ state::*, utils::transfer_tokens };

pub fn handler(
    ctx: Context<Initialize>,
    ico_amount: u64,
    token_per_usd: u64,
    bump: u8
) -> Result<()> {
    let ico_info_pda = &mut ctx.accounts.ico_info_pda;
    let ico_state_pda = &mut ctx.accounts.ico_state_pda;
    // let (authority, bump) = Pubkey::find_program_address(&[b"ICO-Authority"], ctx.program_id);
    // ico_info_pda.admin = ctx.accounts.admin.key();
    ico_info_pda.authority = ctx.accounts.authority.key();
    // ico_info_pda.bump = bump;
    // ico_info_pda.protocol_wallet = protocol_wallet;
    // ico_info_pda.protocol_ico_token_pda = ico_info_pda.protocol_ico_token_pda.key();
    ico_info_pda.total_ico_amount = ico_amount;
    ico_info_pda.token_per_usd = token_per_usd;

    ico_info_pda.ico_token_mint = ctx.accounts.ico_token_mint.key();
    ico_info_pda.usdt_mint = ctx.accounts.usdt_mint.key();
    ico_info_pda.usdc_mint = ctx.accounts.usdc_mint.key();
    ico_info_pda.ico_token_mint_decimals = ctx.accounts.ico_token_mint.decimals;
    ico_info_pda.bump = bump;

    ico_state_pda.remaining_ico_amount = ico_amount;
    ico_state_pda.total_sol = 0;

    let _ = transfer_tokens(
        ctx.accounts.admin_ico_token_account.to_account_info(),
        ctx.accounts.protocol_ico_token_pda.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ico_amount
    );

    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = ICOInfo::LEN, seeds = [b"test_ico"], bump)]
    pub ico_info_pda: Box<Account<'info, ICOInfo>>,

    #[account(init, payer = authority, space = ICOState::LEN, seeds = [b"ico_state"], bump)]
    pub ico_state_pda: Box<Account<'info, ICOState>>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub admin_ico_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        token::mint = ico_token_mint,
        token::authority = ico_info_pda,
        seeds = [b"protocol_ico_token"],
        bump
    )]
    pub protocol_ico_token_pda: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = authority,
        token::mint = usdt_mint,
        token::authority = ico_info_pda,
        seeds = [b"protocol_usdt_pool"],
        bump
    )]
    pub protocol_usdt_pool_pda: Box<Account<'info, TokenAccount>>,
    /// CHECK:
    // #[account(init, payer = authority, seeds = [b"protocol_sol_pool"], bump, space = 8)]
    // pub protocol_sol_pool_pda: AccountInfo<'info>,

    #[account(constraint = ico_token_mint.key() == admin_ico_token_account.mint)]
    pub ico_token_mint: Box<Account<'info, Mint>>,

    #[account(constraint = usdt_mint.decimals == STABLECOIN_DECIMALS)]
    pub usdt_mint: Box<Account<'info, Mint>>,

    #[account(constraint = usdc_mint.decimals == STABLECOIN_DECIMALS)]
    pub usdc_mint: Box<Account<'info, Mint>>,

    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, token::Token>,
}
