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
  const presale = Keypair.generate();

  before(async () => {

  });

  it('Initializes the presale', async () => {
    const stages = [
      { tokenAmount: new BN(2000000), tokenPrice: new BN(2500000) },
      // Add more stages as necessary
    ];

    const tx = await program.methods
      .initialize(
        admin.publicKey,
        stages
      )
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
    await program.methods
      .setStage(
        new BN(1)
      )
      .accounts({
        presale: presale.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.presale.fetch(presale.publicKey);
    console.log('Stage Iterator:', account.stageIterator.toString());
  });

});