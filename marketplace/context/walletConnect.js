"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitState,
} from "@reown/appkit/react";
import { Wallet, Loader2, Check } from "lucide-react";

export default function ConnectButton() {
  const { open: openModal } = useAppKit();
  const { isConnected, address, status } = useAppKitAccount();
  const { initialized, loading: stateLoading } = useAppKitState();

  const [isAnimating, setIsAnimating] = useState(false);
  const [balance, setBalance] = useState(null);

  const loading = status === "connecting" || status === "reconnecting" || stateLoading;

  const shortAddress = (addr) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-6)}` : "";

  // Custom balance fetch using ethers
  useEffect(() => {
    if (!isConnected || !address || !window.ethereum) {
      setBalance(null);
      return;
    }

    let mounted = true;

    const fetchCustomBalance = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const rawBalance = await provider.getBalance(address);
        const formatted = parseFloat(ethers.formatEther(rawBalance));
        if (mounted) {
          setBalance({
            formatted,
            symbol: "STT", //network's native token
          });
        }
      } catch (err) {
        console.log("Failed to fetch custom balance:", err);
      }
    };

    fetchCustomBalance();

    return () => {
      mounted = false;
    };
  }, [isConnected, address]);

  const handleButtonClick = () => {
    setIsAnimating(true);
    if (isConnected) {
      openModal({ view: "Account" });
    } else {
      openModal({ view: "Connect", namespace: "eip155" });
    }
    setTimeout(() => setIsAnimating(false), 300);
  };

  if (!initialized) return null; // wait for AppKit

  return (
    <div className="relative inline-block w-full md:w-auto">
      <motion.button
        onClick={handleButtonClick}
        className={`
          flex items-center gap-2 px-5 py-2 rounded-full cursor-pointer font-medium shadow-md
          bg-gradient-to-r from-gray-900 to-gray-700
          text-white w-auto justify-center
          transition-all duration-300
          ${isAnimating ? "scale-95" : "scale-100"}
          shadow-[0_0_6px_rgba(255,255,255,1)] hover:scale-[1.05]
        `}
      >
        {!isConnected ? (
          loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 opacity-80" />
          )
        ) : (
          <Check className="w-4 h-4 text-white" />
        )}

        {!isConnected
          ? loading
            ? "Connecting..."
            : "Connect Wallet"
          : shortAddress(address)}

        {isConnected && balance && (
          <span className="ml-1 text-sm opacity-90">
            {balance.formatted.toFixed(3)} {balance.symbol}
          </span>
        )}
      </motion.button>
    </div>
  );
}
