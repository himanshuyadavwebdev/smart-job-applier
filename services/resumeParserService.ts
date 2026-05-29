import pdfParse from "pdf-parse"
import mammoth from "mammoth"

export async function extractText(fileBuffer: Buffer, mimeType: string) {
  if (mimeType === "application/pdf") {
    try {
      const data = await pdfParse(fileBuffer)
      return data.text.trim()
    } catch (err) {
      throw new Error(`Failed to parse PDF: ${(err as Error).message}`)
    }
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword" ||
    mimeType.includes("word") ||
    mimeType.includes("docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      return result.value.trim()
    } catch (err) {
      throw new Error(`Failed to parse DOCX: ${(err as Error).message}`)
    }
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.")
}
