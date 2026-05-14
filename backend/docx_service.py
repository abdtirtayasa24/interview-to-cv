import os
import tempfile
from docxtpl import DocxTemplate
from docx2pdf import convert

def generate_custom_pdf(template_path: str, data: dict) -> str:
    """
    Fills a .docx template with data and converts it to PDF.
    Returns the path to the generated PDF.
    """
    temp_dir = tempfile.gettempdir()
    output_docx = os.path.join(temp_dir, f"temp_cv_{os.urandom(4).hex()}.docx")
    output_pdf = output_docx.replace(".docx", ".pdf")

    try:
        doc = DocxTemplate(template_path)
        context = {
            **data['personal_info'],
            'summary': data['summary'],
            'work_experience': data['work_experience'],
            'education': data['education'],
            'skills': ", ".join(data['skills']),
            'languages': ", ".join(data.get('languages', []))
        }
        doc.render(context)
        doc.save(output_docx)

        convert(output_docx, output_pdf)
        
        return output_pdf
    finally:
        if os.path.exists(output_docx):
            os.remove(output_docx)