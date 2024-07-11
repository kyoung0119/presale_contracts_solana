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
  let treasury;
  let deployer1;
  let deployer2;
  let user1;
  let user2;
  const deploy_fee = new BN(0.8 * LAMPORTS_PER_SOL); // Fixed SOL in lamports
  const performance_fee = new BN(0.05 * LAMPORTS_PER_SOL); // Fixed SOL in lamports

  before(async () => {

  });

  it('Initializes the presale', async () => {
    const presale = Keypair.generate();

    const tx = await program.methods
      .initialize()
      .accounts({
        presale: presale.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([presale])
      .rpc();

    const account = await program.account.presale.fetch(presale.publicKey);
    console.log('Presale Authority: ', account.authority.toString());
  });

  it('Sets a stage', async () => {
    const presale = Keypair.generate();

    await program.methods
      .initialize()
      .accounts({
        presale: presale.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([presale])
      .rpc();

    await program.methods
      .setStage(
        0,
        new BN(1000),
        new BN(500)
      )
      .accounts({
        presale: presale.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.presale.fetch(presale.publicKey);
    console.log('Stage 0 Token Amount: ', account.stages[0].tokenAmount.toString());
    console.log('Stage 0 Token Price: ', account.stages[0].tokenPrice.toString());
  });

});