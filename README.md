## Setup

1) cargo build-sbf
2) cp `private_keys.example.ts` `private_keys.ts`
3) solana-keygen new -o target/poa.json
4) Fill the private keys properly in `private_keys.ts`
5) solana program deploy target/deploy/challenge.so
6) pnpm i
7) npx ts-node index.ts

## Hack

Setting the rating to exactly `Buffer.from(new Uint8Array([13, 5, 0, 0, 0, 0, 0, 0]))` which is 1293 in u64, overruns the pointers very far in the next account.
The next account right after rating account is the signer account or the `Andy1111111111111111111111111111111111111111` account.
The pointers moved exactly to place where the signer's accountInfo data pointer where account is signer or not is decided.
Pinoccio uses u8 for checking signer/writeable etc, where 0 means not signed and anything else means signed.
The pointer which overuns to this data pointer increase this value from 0 to 1.
So when we do `signer.is_signer()` it will find signer data pointer is not 0 (its 1 now), which helps bypass this check and we enter into the if code block.
Hence, all the funds are transfered into the last account (4th or 3rd) accordingly.
