import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const textractClient = new TextractClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function extractTextFromPDFWithTextract(file: File): Promise<string> {
  try {
    // Convert File to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Call Textract
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: bytes,
      },
    });

    const response = await textractClient.send(command);

    // Extract text from response
    if (!response.Blocks) {
      throw new Error('No text found in document');
    }

    // Combine all LINE blocks (Textract returns text in blocks)
    const text = response.Blocks
      .filter(block => block.BlockType === 'LINE')
      .map(block => block.Text)
      .join('\n');

    return text;
  } catch (error) {
    console.error('Textract error:', error);
    throw new Error('Failed to extract text with Textract');
  }
}

export function cleanResumeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}