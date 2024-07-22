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

  const presale_info = Keypair.generate();

  let protocol_wallet;
  let user1;
  let usdcMint, usdtMint;
  let usdcTokenAccount, usdtTokenAccount;


  before(async () => {
    protocol_wallet = await createRandomWalletAndAirdrop(provider, 2);
    user1 = await createRandomWalletAndAirdrop(provider, 2);

    // Create random SPL token mints for testing with 6 decimals
    usdcMint = await createRandomMint(provider, 6);
    usdtMint = await createRandomMint(provider, 6);

    // Create associated token accounts for the admin
    usdcTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdcMint, protocol_wallet.publicKey);
    usdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, usdtMint, protocol_wallet.publicKey);
  });

  it('Initializes the presale', async () => {
    const stages = [
      { tokenAmount: new BN(2000000), tokenPrice: new BN(2500000) },
      { tokenAmount: new BN(3000000), tokenPrice: new BN(2500000) },
      { tokenAmount: new BN(4000000), tokenPrice: new BN(6250000) },
      { tokenAmount: new BN(5000000), tokenPrice: new BN(27500000) },
      { tokenAmount: new BN(5500000), tokenPrice: new BN(37500000) },
      { tokenAmount: new BN(6000000), tokenPrice: new BN(41250000) },
      { tokenAmount: new BN(6500000), tokenPrice: new BN(37500000) },
      { tokenAmount: new BN(7000000), tokenPrice: new BN(35000000) },
      { tokenAmount: new BN(0), tokenPrice: new BN(0) },
    ];

    const protocol_wallet = admin.publicKey

    await program.methods
      .initialize(
        protocol_wallet,
        stages,
        usdcMint,
        usdtMint
      )
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([presale_info])
      .rpc();

    const account = await program.account.presaleInfo.fetch(presale_info.publicKey);
    console.log('Presale Authority: ', account.authority.toString());
  });

  it("Method: updateProtocolWallet", async function () {
    const newWallet = Keypair.generate().publicKey;

    // First update
    await program.methods
      .updateProtocolWallet(newWallet)
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    await waitSeconds(12 + 1); // 12 seconds + 1 second

    // Second update
    await program.methods
      .updateProtocolWallet(newWallet)
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const presaleInfo = await program.account.presaleInfo.fetch(presale_info.publicKey);
    assert.equal(presaleInfo.protocolWallet.toString(), newWallet.toString(), "Protocol wallet should be updated");
  });

  it("Method: setStage", async function () {
    const presaleInfoBefore = await program.account.presaleInfo.fetch(presale_info.publicKey);
    assert.equal(presaleInfoBefore.stageIterator.toString(), '0', "Initial Stage iterator should be 0");

    const updatedStageIndex = new BN(1);

    await program.methods
      .setStage(updatedStageIndex)
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const presaleInfoAfter = await program.account.presaleInfo.fetch(presale_info.publicKey);
    assert.equal(presaleInfoAfter.stageIterator.toString(), updatedStageIndex.toString(), "Stage iterator should be updated");
  });

  it("Method: updateTotalSold", async function () {
    const presaleInfoBefore = await program.account.presaleInfo.fetch(presale_info.publicKey);
    assert.equal(presaleInfoBefore.totalTokensSold.toString(), '0', "Initial Total tokens sold should be 0");

    const amount = new BN(200);

    // First update
    await program.methods
      .updateTotalSold(amount)
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    await waitSeconds(12 + 1); // 12 hours + 1 second

    // Second update
    await program.methods
      .updateTotalSold(amount)
      .accounts({
        presaleInfo: presale_info.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.presaleInfo.fetch(presale_info.publicKey);
    assert.equal(account.totalTokensSold.toString(), amount.toString(), "Total tokens sold should be updated");
  });

  it("Method: depositUSDT", async function () {
    // Mint USDT token
    const usdtTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, admin, usdtMint, admin.publicKey);
    await mintTo(provider.connection, admin, usdtMint, usdtTokenAccount.address, admin, ONE_USDT * 2);

    // Deposit USDT to the presale
    await program.methods
      .depositUsdt(new BN(ONE_USDT * 2), admin.publicKey)
      .accounts({
        presale: presale_info.publicKey,
        authority: provider.wallet.publicKey,
        tokenAccount: usdtTokenAccount.address,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
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

  // it("Method: depositCoin", async function () {
  //   // Deposit ETH to the presale
  //   await program.methods
  //     .depositCoin(new PublicKey(constants.ZERO_ADDRESS))
  //     .accounts({
  //       presale: presale.publicKey,
  //       authority: provider.wallet.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .rpc({ value: ONE_ETH });

  //   const account = await program.account.presale.fetch(presale.publicKey);
  //   assert.equal(account.balances[admin.publicKey.toString()], 104037, "Balance should be updated");
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
