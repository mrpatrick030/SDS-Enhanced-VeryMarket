// scripts/registerSchemas.js

import dotenv from "dotenv";
import { SDK, zeroBytes32 } from "@somnia-chain/streams";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

dotenv.config();

const RPC_URL = "https://dream-rpc.somnia.network";
const PRIVATE_KEY = "0x2cb5.....";

if (!RPC_URL) {
  throw new Error("RPC_URL is not defined in your .env");
}
if (!PRIVATE_KEY) {
  throw new Error("PRIVATE_KEY is not defined in your .env");
}

// Define Somnia Testnet / Dream chain
const somniaChain = defineChain({
  id: 50312,
  name: "Somnia Dream",
  network: "somnia-dream",
  nativeCurrency: {
    name: "STT",
    symbol: "STT",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
});

// Create Viem clients
const publicClient = createPublicClient({
  chain: somniaChain,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: somniaChain,
  account: privateKeyToAccount(PRIVATE_KEY),
  transport: http(RPC_URL),
});

// Initialize the Somnia SDK
const sdk = new SDK({
  public: publicClient,
  wallet: walletClient,
});

// Define marketplace schemas
const schemas = [
  {
    id: "ListingUpdated",
    schema: `
      uint256 listingId,
      uint256 price,
      bool active,
      uint256 initialQuantity,
      uint256 quantity
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "ListingCanceled",
    schema: `uint256 listingId`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "ListingDeactivated",
    schema: `uint256 listingId, bool active`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "ListingReactivated",
    schema: `uint256 listingId, bool active`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "OrderRequested",
    schema: `
      uint256 orderId,
      uint256 listingId,
      address buyer,
      uint256 quantity
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "ShippingSet",
    schema: `
      uint256 orderId,
      uint256 shippingFee,
      uint16 etaDays
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "OrderConfirmedAndPaid",
    schema: `uint256 orderId, uint256 totalAmount`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "MarkedShipped",
    schema: `uint256 orderId`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "DeliveryConfirmed",
    schema: `
      uint256 orderId,
      uint256 sellerAmount,
      uint256 feeAmount
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "Refunded",
    schema: `uint256 orderId, uint256 amount`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "DisputeOpened",
    schema: `uint256 orderId, address raisedBy`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "DisputeCancelled",
    schema: `
      uint256 orderId,
      uint8 restoredStatus,
      address cancelledBy
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "DisputeResolved",
    schema: `
      uint256 orderId,
      uint256 refundToBuyer,
      uint256 sellerNet,
      uint256 feeAmt
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "TokenApproved",
    schema: `address token, bool approved`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "OrderCanceledByBuyer",
    schema: `uint256 orderId`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "OrderCancelledBySeller",
    schema: `uint256 orderId, uint256 listingId`,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "SellerRated",
    schema: `
      uint256 storeId,
      address buyer,
      bool positive,
      string comment
    `,
    parentSchemaId: zeroBytes32,
  },
  {
    id: "ReceiptMinted",
    schema: `uint256 orderId, uint256 tokenId, string tokenURI`,
    parentSchemaId: zeroBytes32,
  },
];

async function main() {
  console.log("🚀 Registering schemas...");

  const ignoreAlreadyRegistered = true;

  try {
    const txHash = await sdk.streams.registerDataSchemas(schemas, ignoreAlreadyRegistered);
    console.log("✅ Transaction hash for schema registration:", txHash);

    // Compute schema IDs locally
    for (const s of schemas) {
      const schemaId = await sdk.streams.computeSchemaId(s.schema);
      console.log(`Schema ID for ${s.id}:`, schemaId);
    }
  } catch (error) {
    console.error("❌ Error registering schemas:", error);
  }
}

main();
