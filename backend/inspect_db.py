import asyncio
from app.database import supabase

async def inspect_columns():
    try:
        # Fetch one record to see keys
        result = supabase.table("profiles").select("*").limit(1).execute()
        if result.data:
            print(f"Columns: {result.data[0].keys()}")
        else:
            print("Table is empty, cannot inspect columns this way.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(inspect_columns())
