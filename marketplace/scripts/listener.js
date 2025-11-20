// scripts/listener.js
"use client";

import { useEffect } from "react";
import { SDK, zeroBytes32 } from "@somnia-chain/streams";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";

const RPC_URL = "https://dream-rpc.somnia.network";
const PRIVATE_KEY = "0x2cb5b....";

// Testnet chain config
const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Dream Testnet",
  network: "somnia-dream-testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
});

// Clients
const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() });
const walletClient = createWalletClient({ account, chain: somniaTestnet, transport: http() });

// SDK instance
const sdk = new SDK({ rpcUrl: RPC_URL, walletClient });

// Dispute-related schemas
const DISPUTE_SCHEMAS = {
  DisputeOpened: "0xe362ba77011b0b166a259b705359039472b9e7adbed2a715732ef44959c19092",
  DisputeCancelled: "0xfd090369563ed4bfccacd02340dbd4dc834ff89cc14fd38ca02de22450f08c6b",
  DisputeResolved: "0x28279c34a4af4d74a82700edfda5bd55a40b382e98470bba4aeb0ae954b8c69a",
  ReceiptMinted: "0x33492c0191d63ce554dce625a8e7c3cb3c568ad959525655329ed66c55d61dc0",
};

export default function SomniaDisputeListener({ setDisputes }) {
  useEffect(() => {
    if (!setDisputes) return;

    const subscribers = [];

    const handleSomniaEvent = (event, schemaName) => {
      console.log(`Received Somnia event: ${schemaName}`, event);

      const normalized = {
        disputeId: event.data.disputeId || event.data.orderId,
        buyer: event.data.buyer || event.data.raisedBy,
        seller: event.data.seller || null,
        status: schemaName === "DisputeOpened" ? "Open" : event.data.status || "Updated",
        receipt: event.data.receipt || null,
      };

      switch (schemaName) {
        case "DisputeOpened":
          setDisputes(prev => [normalized, ...prev]);
          break;
        case "DisputeCancelled":
        case "DisputeResolved":
          setDisputes(prev =>
            prev.map(d => d.disputeId === normalized.disputeId ? { ...d, ...normalized } : d)
          );
          break;
        case "ReceiptMinted":
          setDisputes(prev =>
            prev.map(d => d.disputeId === normalized.disputeId ? { ...d, receipt: normalized } : d)
          );
          break;
        default:
          break;
      }
    };

    const subscribe = async () => {
      for (const [name, schemaId] of Object.entries(DISPUTE_SCHEMAS)) {
        try {
          const subscription = await sdk.streams.subscribe(schemaId, {
            onMessage: (event) => handleSomniaEvent(event, name),
            onError: (err) => console.error(`Somnia Error (${name}):`, err),
          });
          subscribers.push(subscription);
          console.log(`Subscribed to: ${name}`);
        } catch (err) {
          console.error(`Failed to subscribe to ${name}:`, err);
        }
      }
    };

    subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      subscribers.forEach(sub => sub.unsubscribe && sub.unsubscribe());
    };
  }, [setDisputes]);

  return null;
}
