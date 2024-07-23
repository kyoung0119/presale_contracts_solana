import {
    workspace,
    AnchorProvider,
    Program,
} from "@coral-xyz/anchor";

import { PresaleContractsSolana } from "../target/types/presale_contracts_solana";

// Configure the client to use the local cluster.
export const provider = AnchorProvider.env();

export const program = workspace.PresaleContractsSolana as Program<PresaleContractsSolana>;
