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
import { createRandomMint, createRandomWalletAndAirdrop, getRandomNumber, programPaidBy, waitSeconds } from "./utils";
import { provider, program } from './config';

// Configure the client to use the local cluster.
setProvider(provider);

// @ts-ignore
let admin = getProvider().wallet;

describe("presale-contracts-solana", () => {
  const ONE_USDT = 1000000

  let protocol_wallet;
  let user1;
  let user_program;
  let ico_token_mint_decimals;
  let ico_token_mint;
  let protocol_ico_token_account;

  before(async () => {
    protocol_wallet = await createRandomWalletAndAirdrop(provider, 2);
    user1 = await createRandomWalletAndAirdrop(provider, 2);
    // user_program = programPaidBy(user1);

    // Create mock ico token mint for testing with random decimals
    ico_token_mint_decimals = await getRandomNumber(0, 9);
    ico_token_mint = await createRandomMint(provider, 9);

    console.log('\nICO Token Mint: ', ico_token_mint.toString())
    console.log('ICO Token Decimals: ', ico_token_mint_decimals)
    console.log('\n');

    // Create mock stable token mints for testing with 6 decimals
    // usdc_mint = await createRandomMint(provider, 6);
    // usdt_mint = await createRandomMint(provider, 6);

    // Mint ICO token to protocol wallet
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
  });

  it('Initializes the presale', async () => {
    console.log("---Initializes the presale---\n")
    const ico_amount = new BN(10000)
    const token_per_sol = new BN(100)

    // Fetch the PDA of ico info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICO-Info")],
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
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const ico_info = await program.account.icoInfo.fetch(ico_info_pda);
    console.log('ICO Authority: ', ico_info.authority.toString());
    console.log('ICO Protocol Wallet: ', ico_info.protocolWallet.toString());
    console.log('ICO Amount: ', ico_info.totalIcoAmount.toString());
    console.log('ICO Token Per SOL: ', ico_info.tokenPerSol.toString());
    console.log('ICO Remaining: ', ico_info.remainingIcoAmount.toString());
    console.log('ICO Total SOL: ', ico_info.totalSol.toString());
    console.log("\n");
  });

  it("Method: depositSOL", async function () {
    // Fetch the PDA of ICO info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICO-Info")],
      program.programId
    );

    const depositSOLAmount = new BN(1.5 * LAMPORTS_PER_SOL);

    const ICOInfo = await program.account.icoInfo.fetch(ico_info_pda)

    // create ICO token account for user wallet
    const user_ico_token_account = await getOrCreateAssociatedTokenAccount(provider.connection, admin.payer, ico_token_mint, user1.publicKey);

    const protocol_ico_account_info = await provider.connection.getTokenAccountBalance(protocol_ico_token_account.address)
    console.log('protocol ico account balance', protocol_ico_account_info.value.amount)

    // Derive PDA from program for authority
    const [authorityPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICO-Authority")],
      program.programId
    );

    await program.methods
      .depositSol(depositSOLAmount)
      .accounts({
        icoInfoPda: ico_info_pda,
        user: user1.publicKey,
        authority: authorityPda,
        protocolWallet: ICOInfo.protocolWallet,
        protocolIcoTokenAccount: protocol_ico_token_account.address,
        userIcoTokenAccount: user_ico_token_account.address,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .signers([user1])
      .rpc();

    const icoInfoPda = await program.account.icoInfo.fetch(ico_info_pda);
    assert.equal(icoInfoPda.totalSol.toString(), depositSOLAmount.toString(), "Balance should be updated");
  });

  it("Method: updateProtocolWallet", async function () {
    const newWallet = Keypair.generate().publicKey;

    // Fetch the PDA of ICO info account
    const [ico_info_pda] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICO-Info")],
      program.programId
    );

    // Derive PDA from program for authority
    const [authorityPda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("ICO-Authority")],
      program.programId
    );

    // First update
    await program.methods
      .updateProtocolWallet(newWallet)
      .accounts({
        icoInfoPda: ico_info_pda,
        admin: admin.publicKey,
        authority: authorityPda
      })
      .rpc();

    const ico_info = await program.account.icoInfo.fetch(ico_info_pda);
    assert.equal(ico_info.protocolWallet.toString(), newWallet.toString(), "Protocol wallet should be updated");
  });

});
