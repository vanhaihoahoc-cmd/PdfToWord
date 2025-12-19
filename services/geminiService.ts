
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedPage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const reformTextWithAI = async (pages: ExtractedPage[]): Promise<string> => {
  const combinedText = pages.map(p => `[Trang ${p.pageNumber}]\n${p.text}`).join('\n\n');
  
  // We use gemini-3-flash-preview for fast text restructuring
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Bạn là một chuyên gia chuyển đổi tài liệu. Hãy lấy nội dung thô được trích xuất từ PDF dưới đây và định dạng lại nó thành một văn bản mạch lạc, có cấu trúc (tiêu đề, đoạn văn, danh sách) phù hợp để đưa vào tệp Microsoft Word (.docx). 
    Hãy giữ nguyên ngôn ngữ gốc (Tiếng Việt) và đảm bảo không làm mất thông tin quan trọng.
    
    Nội dung trích xuất:
    ---
    ${combinedText.substring(0, 30000)} // Truncate if too long for safety
    ---`,
    config: {
      temperature: 0.2, // Lower temperature for more consistent formatting
    },
  });

  return response.text || "Không thể xử lý nội dung văn bản.";
};
