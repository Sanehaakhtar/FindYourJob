import requests

def test_endpoint():
    try:
        # Check root
        r = requests.get("http://localhost:8000/")
        print(f"Root: {r.status_code}, {r.json()}")
        
        # Check generate
        r = requests.post("http://localhost:8000/generate/cover-letter", json={
            "email": "test@example.com",
            "job_title": "Test Job",
            "company": "Test Co",
            "description": "Test Desc"
        })
        print(f"Generate: {r.status_code}, {r.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_endpoint()
