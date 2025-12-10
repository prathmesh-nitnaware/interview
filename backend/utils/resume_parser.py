import os
from PyPDF2 import PdfReader
# import docx # Uncomment if supporting .docx

def extract_text_from_file(file_path):
    """
    Detects file extension and extracts text accordingly.
    """
    _, file_extension = os.path.splitext(file_path)
    
    if file_extension.lower() == '.pdf':
        return extract_text_from_pdf(file_path)
    # elif file_extension.lower() == '.docx':
    #     return extract_text_from_docx(file_path)
    else:
        return "Unsupported file format"

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""
    return text