import requests
import fitz  # PyMuPDF to create a real PDF

def create_dummy_pdf():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "John Doe\njohn@example.com\nPython Developer\nExperience: 5 years in backend")
    return doc.tobytes()

def test_upload():
    url = "http://localhost:8000/onboard"
    print(f"POSTing to {url}...")
    
    pdf_bytes = create_dummy_pdf()
    files = {"file": ("test_cv.pdf", pdf_bytes, "application/pdf")}
    
    try:
        res = requests.post(url, files=files)
        print(f"Status Code: {res.status_code}")
        try:
            print(f"Response Body: {res.json()}")
        except:
            print(f"Response Text: {res.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_upload()
