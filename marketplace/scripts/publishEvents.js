// publishEvents.js
import dotenv from "dotenv";
import { SDK, zeroBytes32, SchemaEncoder } from "@somnia-chain/streams";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
dotenv.config();

const RPC_URL = "https://dream-rpc.somnia.network";
const PRIVATE_KEY = "0x2cb5....";

const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Dream Testnet",
  network: "somnia-dream-testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({ account, chain: somniaTestnet, transport: http() });
const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() });

const sdk = new SDK({
  public: publicClient,
  wallet: walletClient,
});

// SCHEMAS should be the same structured definition string you used when registering
const SCHEMA_DEFINITIONS = {
  DisputeOpened: `uint256 orderId`,
  DisputeCancelled: `uint256 orderId`,
  DisputeResolved: `uint256 disputeId, uint256 refundToBuyer, uint256 payoutToSeller`,
  ReceiptMinted: `uint256 disputeId, uint256 tokenId, string tokenURI`,
};

// Map eventName → schemaId
const SCHEMAS = {
  DisputeOpened: "0xe362ba77011b0b166a259b705359039472b9e7adbed2a715732ef44959c19092",
  DisputeCancelled: "0xfd090369563ed4bfccacd02340dbd4dc834ff89cc14fd38ca02de22450f08c6b",
  DisputeResolved: "0x28279c34a4af4d74a82700edfda5bd55a40b382e98470bba4aeb0ae954b8c69a",
  ReceiptMinted: "0x33492c0191d63ce554dce625a8e7c3cb3c568ad959525655329ed66c55d61dc0",
};

export async function publishEvent(eventName, payload) {
  const schemaId = SCHEMAS[eventName];
  const schemaStr = SCHEMA_DEFINITIONS[eventName];
  if (!schemaId || !schemaStr) {
    throw new Error(`Invalid schema: ${eventName}`);
  }

  // Encode payload
  const encoder = new SchemaEncoder(schemaStr);
  const encoded = encoder.encodeData(
    Object.entries(payload).map(([name, value]) => ({
      name,
      value,
      type: typeof value === "string" && value.startsWith("0x")
        ? "address"
        : typeof value === "string"
        ? "string"
        : "uint256",
    }))
  );

  // Use sdk.streams.set() to write data
  const tx = await sdk.streams.set([
    {
      id: `0x${BigInt(payload.orderId).toString(16).padStart(64, "0")}`, // or any unique ID logic
      schemaId,
      data: encoded,
    },
  ]);

  console.log(`📤 Published ${eventName} -> TX:`, tx);
  return tx;
}






// const SCHEMAS = {
//   ListingUpdated:       "0xd53ad9747afb208d9e67b572a43e128b44dbcf7acac0094b2a59c9316d8feffb",
//   ListingCanceled:      "0x97bc9602186fef04957d7baeb934d3f3c74e160c8667913a0ec8dfc3c6fb20b8",
//   ListingDeactivated:   "0x0de67551600e1b9f128cc063e7bbffef1bba204552d1987f4e0e86807a5b7a9f",
//   ListingReactivated:   "0x0de67551600e1b9f128cc063e7bbffef1bba204552d1987f4e0e86807a5b7a9f",
//   OrderRequested:       "0xd63274ea4188830ca767ad73737db274ad6ab3186df20dac2484688bc21c0bf2",
//   ShippingSet:          "0xbd30cbd5acb30c85257f28166c54b362997c308fc9399d0459aeacbdd29c6f0b",
//   OrderConfirmedAndPaid:"0x272523295360321aa8e9f0a927c6084f37fc4c3ad1ecab8270f8655c4f1ab4dd",
//   MarkedShipped:        "0x25c730a8f63461a7659baafbfe8f7eabe5e8b865f7f16f7e8f6acf9fcea5e32f",
//   DeliveryConfirmed:    "0xd2c947e2f89abaee81902266778b8513884cefc1e5ade9ff884ca653fcc226c7",
//   Refunded:             "0x9127370b76bbb3c803cdb434c991443d0bb4d8a3cafdf2f4fb5be6b4ee917c1e",
//   DisputeOpened:        "0xe362ba77011b0b166a259b705359039472b9e7adbed2a715732ef44959c19092",
//   DisputeCancelled:     "0xfd090369563ed4bfccacd02340dbd4dc834ff89cc14fd38ca02de22450f08c6b",
//   DisputeResolved:      "0x28279c34a4af4d74a82700edfda5bd55a40b382e98470bba4aeb0ae954b8c69a",
//   TokenApproved:        "0x284c1026d4115cf7a27ddd75ba293c443a8d8cd32946e263cd1cc019f21f1666",
//   OrderCanceledByBuyer: "0x25c730a8f63461a7659baafbfe8f7eabe5e8b865f7f16f7e8f6acf9fcea5e32f",
//   OrderCancelledBySeller:"0x55db30d4f487d72d074dc0cab356d9973e4704a8062738c3f810fb47c912507b",
//   SellerRated:          "0x9df909c4699de2bdd6f02071838527d8c30f28c30079c5c48dcdfd8aae32d1f1",
//   ReceiptMinted:        "0x33492c0191d63ce554dce625a8e7c3cb3c568ad959525655329ed66c55d61dc0",
// };