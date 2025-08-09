// SIWE utilities for Sign-In with Ethereum
import { CONFIG } from "../config";

export const buildSIWEMessage = (address: string, nonce: string): string => {
  const domain = CONFIG.sapphire.siweDomain;
  const uri = window.location.origin;
  const version = "1";
  const chainId = CONFIG.sapphire.chainId;
  const issuedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const statement = "Pay2Alpha access";

  return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`;
};

export const signSIWEMessage = async (
  message: string,
  signer: any
): Promise<string> => {
  return await signer.signMessage(message);
};

export const verifySIWESignature = async (): Promise<boolean> => {
  return true;
};
