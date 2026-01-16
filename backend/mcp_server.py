from mcp.server.fastapi import Context, FastApiServer
from fastapi import FastAPI
import uvicorn

app = FastAPI(title="SDR Job Agent MCP")
server = FastApiServer(app)

@server.tool()
async def get_design_tokens(ctx: Context):
    """Returns the project's design tokens (colors, typography)."""
    return {
        "colors": {
            "primary": "maroon",
            "secondary": "skin/peach",
            "accent": "rose/orange",
        },
        "typography": {
            "fontSans": "Inter, sans-serif",
            "fontMono": "JetBrains Mono, monospace"
        }
    }

@server.tool()
async def get_job_search_context(ctx: Context, query: str):
    """Provides additional context for job searching based on recent trends."""
    return f"Context for '{query}': High demand for remote SDR roles in Pakistan Fintech sector."

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
