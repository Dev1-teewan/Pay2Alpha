// SIWE utilities for Sign-In with Ethereum
export const buildSIWEMessage = (address: string, nonce: string): string => {
  const domain = window.location.host
  const uri = window.location.origin
  const version = '1'
  const chainId = 1
  const issuedAt = new Date().toISOString()

  return `${domain} wants you to sign in with your Ethereum account:
${address}

I accept the Terms of Service: ${uri}/tos

URI: ${uri}
Version: ${version}
Chain ID: ${chainId}
Nonce: ${nonce}
Issued At: ${issuedAt}`
}

export const signSIWEMessage = async (message: string, signer: any): Promise<string> => {
  // Mock implementation - in real app, this would sign the SIWE message
  await new Promise(resolve => setTimeout(resolve, 1000))
  return 'mock_signature_' + Math.random().toString(36).substring(2, 15)
}

export const verifySIWESignature = async (message: string, signature: string): Promise<boolean> => {
  // Mock implementation - in real app, this would verify the signature
  await new Promise(resolve => setTimeout(resolve, 500))
  return signature.startsWith('mock_signature_')
}
