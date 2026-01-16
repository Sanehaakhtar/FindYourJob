"""PDF parsing service"""

import logging
import fitz  # PyMuPDF
from io import BytesIO

logger = logging.getLogger(__name__)


class PDFParser:
    """Extract text from PDF files"""
    
    @staticmethod
    async def extract_text(file_content: bytes) -> str:
        """Extract text from PDF bytes"""
        logger.info("📄 Extracting text from PDF...")
        
        try:
            pdf_stream = BytesIO(file_content)
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            
            text_content = []
            for page in doc:
                text_content.append(page.get_text("text"))
            
            doc.close()
            
            full_text = "\n".join(text_content)
            
            # Clean up
            while "  " in full_text:
                full_text = full_text.replace("  ", " ")
            
            logger.info(f"✅ Extracted {len(full_text)} characters")
            return full_text.strip()
            
        except Exception as e:
            logger.error(f"❌ PDF extraction failed: {e}")
            raise ValueError(f"Failed to parse PDF: {str(e)}")
    
    @staticmethod
    def validate_pdf(file_content: bytes) -> bool:
        """Check if content is valid PDF"""
        try:
            pdf_stream = BytesIO(file_content)
            doc = fitz.open(stream=pdf_stream, filetype="pdf")
            is_valid = len(doc) > 0
            doc.close()
            return is_valid
        except:
            return False