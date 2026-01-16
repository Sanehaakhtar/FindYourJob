from mcp.server.fastapi import Context, FastApiServer
from fastapi import FastAPI
import uvicorn
import requests
from bs4 import BeautifulSoup
import json

app = FastAPI(title="Generic UI Scraper MCP")
server = FastApiServer(app)

@server.tool()
async def fetch_ui_from_url(ctx: Context, url: str):
    """
    Scrapes the HTML and CSS from a given URL to help implement its UI.
    Use this when the user gives you a website link (like flyingpapers.com/bag).
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style tags from body for cleaner text/structure
        body = soup.find('body')
        if not body:
            return {"error": "No body tag found"}
            
        # Get all styles
        styles = [s.text for s in soup.find_all('style')]
        
        return {
            "url": url,
            "title": soup.title.string if soup.title else "No Title",
            "html_structure": str(body)[:5000],  # Limit to 5000 chars for context
            "styles_found": len(styles),
            "inline_styles": styles[:5] # First 5 style tags
        }
    except Exception as e:
        return {"error": str(e)}

@server.tool()
async def suggest_component_implementation(ctx: Context, component_description: str):
    """
    Provides a high-level plan for implementing a component based on a description.
    """
    return {
        "plan": f"To implement {component_description}, we should follow the Maroon/Skin theme established in the project.",
        "steps": [
            "Analyze the source UI structure",
            "Map HTML elements to React/Tailwind components",
            "Apply Maroon/Rose gradients",
            "Add Framer Motion animations"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
