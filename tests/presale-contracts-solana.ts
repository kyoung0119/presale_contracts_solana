import {
  workspace,
  AnchorProvider,
  getProvider,
  setProvider,
  Wallet,
  BN,
  Program,
} from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  createMint,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { assert } from "chai";
import { PresaleContractsSolana } from "../target/types/presale_contracts_solana";
import { createRandomMint, createRandomWalletAndAirdrop, getRandomNumber, waitSeconds } from "./utils";

// Configure the client to use the local cluster.
const provider = AnchorProvider.env();
setProvider(provider);

// @ts-ignore
let admin = getProvider().wallet;

const program = workspace.PresaleContractsSolana as Program<PresaleContractsSolana>;

describe("presale-contracts-solana", () => {
  const ONE_USDT = 1000000

  let protocol_wallet;
  let user1;
  let ico_token_mint_decimals;
  let ico_token_mint, usdc_mint, usdt_mint;
  let protocol_ico_token_account;

  before(async () => {
    protocol_wallet = await createRandomWalletAndAirdrop(provider, 2);
    user1 = await createRandomWalletAndAirdrop(provider, 2);

    // TODO: make it random decimals for flexibility
    // Create mock stable token mints for testing with 9 decimals
    ico_token_mint_decimals = getRandomNumber(0, 9);
    console.log('ico_token_mint_decimals', ico_token_mint_decimals)
    ico_token_mint = await createRandomMint(provider, 9);

    // Create mock stable token mints for testing with 6 decimals
    usdc_mint = await createRandomMint(provider, 6);
    usdt_mint = await createRandomMint(provider, 6);

    // Mint ICO token to protocol walelt
    protocol_ico_token_account = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, ico_token_mint, protocol_wallet.publicKey);
    const total_ico_amount = 20000
    const total_ico_amount_lamports = new BN(10 ** ico_token_mint_decimals * total_ico_amount)
    await mintTo(
      provider.connection,
      admin.payer,
      ico_token_mint,
      protocol_ico_token_account.address,
      admin.publicKey,
      BigInt(total_ico_amount_lamports.toNumber())
    );

    // Create associated token accounts for the admin
    // usdcTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdcMint, protocol_wallet.publicKey);
    // usdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdtMint, protocol_wallet.publicKey);
  });

  it('Initializes the presale', async () => {
    // const stages = [
    //   { tokenAmount: new BN(2000000), tokenPrice: new BN(2500000) },
    //   { tokenAmount: new BN(3000000), tokenPrice: new BN(2500000) },
    //   { tokenAmount: new BN(4000000), tokenPrice: new BN(6250000) },
    //   { tokenAmount: new BN(5000000), tokenPrice: new BN(27500000) },
    //   { tokenAmount: new BN(5500000), tokenPrice: new BN(37500000) },
    //   { tokenAmount: new BN(6000000), tokenPrice: new BN(41250000) },
    //   { tokenAmount: new BN(6500000), tokenPrice: new BN(37500000) },
    //   { tokenAmount: new BN(7000000), tokenPrice: new BN(35000000) },
    //   { tokenAmount: new BN(0), tokenPrice: new BN(0) },
    // ];
    const ico_amount = new BN(10000)
    const token_per_sol = new BN(100)

    // Fetch the PDA of ico info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICOInfo")],
      program.programId
    );

    await program.methods
      .initialize(
        protocol_wallet.publicKey,
        ico_amount,
        token_per_sol
      )
      .accounts({
        icoInfoPda: ico_info_pda,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const ico_info = await program.account.icoInfo.fetch(ico_info_pda);
    console.log('ICO Authority: ', ico_info.authority.toString());
    console.log('ICO Protocol Wallet: ', ico_info.protocolWallet.toString());
    console.log('ICO Amount: ', ico_info.icoAmount.toString());
    console.log('ICO Token Per SOL: ', ico_info.tokenPerSol.toString());
    console.log('ICO Remaining: ', ico_info.icoRemaining.toString());
    console.log('ICO Total SOL: ', ico_info.totalSol.toString());
  });

  it("Method: updateProtocolWallet", async function () {
    const newWallet = Keypair.generate().publicKey;

    // Fetch the PDA of ICO info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICOInfo")],
      program.programId
    );

    // First update
    await program.methods
      .updateProtocolWallet(newWallet)
      .accounts({
        icoInfoPda: ico_info_pda,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const ico_info = await program.account.icoInfo.fetch(ico_info_pda);
    assert.equal(ico_info.protocolWallet.toString(), newWallet.toString(), "Protocol wallet should be updated");
  });

  it("Method: depositSOL", async function () {
    // Fetch the PDA of ICO info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICOInfo")],
      program.programId
    );

    // Deposit SOL to protocol
    await program.methods
      .depositSol(new BN(2 * LAMPORTS_PER_SOL))
      .accounts({
        icoInfoPda: ico_info_pda,
        authority: provider.wallet.publicKey
      })
      .signers([user1])
      .rpc();

    const account = await program.account.icoInfo.fetch(ico_info_pda);
    // assert.equal(account.balances[admin.publicKey.toString()], 104037, "Balance should be updated");
  });

  it("Method: depositUSDT", async function () {
    const protocolTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdtMint, protocol_wallet.publicKey);
    // Mint USDT token to user wallet
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdtMint, user1.publicKey);
    await mintTo(provider.connection, admin, usdtMint, userTokenAccount.address, admin.publickKey, ONE_USDT * 2);

    // Deposit USDT to the presale
    await program.methods
      .depositUsdt(new BN(ONE_USDT * 2))
      .accounts({
        presale: presale_info.publicKey,
        authority: user1.publicKey,
        userTokenAccount: userTokenAccount.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user1])
      .rpc();

    const account = await program.account.presaleInfo.fetch(presale_info.publicKey);
    // assert.equal(account.balances[admin.publicKey.toString()], 100, "Balance should be updated");
  });

  // it("Method: depositUSDTTo", async function () {
  //   // Mint USDT token
  //   const usdtMint = await createRandomMint(provider, admin.publicKey);
  //   const usdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin, usdtMint, admin.publicKey);
  //   await mintTo(provider.connection, admin, usdtMint, usdtTokenAccount.address, admin, ONE_USDT * 2, [admin]);

  //   // Approve tokens for the presale
  //   await program.methods
  //     .approve(usdtTokenAccount.address, ONE_USDT * 2)
  //     .accounts({
  //       presale: presale.publicKey,
  //       authority: provider.wallet.publicKey,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc();

  //   // Deposit USDT to another user
  //   await program.methods
  //     .depositUsdtTo(user1.publicKey, new BN(ONE_USDT * 2), new PublicKey(constants.ZERO_ADDRESS))
  //     .accounts({
  //       presale: presale.publicKey,
  //       authority: provider.wallet.publicKey,
  //       tokenAccount: usdtTokenAccount.address,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //     })
  //     .rpc();

  //   const account = await program.account.presale.fetch(presale.publicKey);
  //   assert.equal(account.balances[user1.publicKey.toString()], 100, "Balance should be updated");
  //   assert.equal(account.totalTokensSold.toString(), '100', "Total tokens sold should be updated");
  //   assert.equal(account.totalSoldInUsd.toString(), (ONE_USDT * 2 * (PRICE_FEED_PRECISION / TOKEN_PRECISION)).toString(), "Total sold in USD should be updated");
  // });



  // it("Method: depositCoinTo", async function () {
  //   // Deposit ETH to another user
  //   await program.methods
  //     .depositCoinTo(user1.publicKey, new PublicKey(constants.ZERO_ADDRESS))
  //     .accounts({
  //       presale: presale.publicKey,
  //       authority: provider.wallet.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .rpc({ value: ONE_ETH });

  //   const account = await program.account.presale.fetch(presale.publicKey);
  //   assert.equal(account.balances[user1.publicKey.toString()], 104037, "Balance should be updated");
  //   assert.equal(account.totalTokensSold.toString(), '104037', "Total tokens sold should be updated");
  //   assert.equal(account.totalSoldInUsd.toString(), '208074000000', "Total sold in USD should be updated");
  // });

});
