FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv and create virtual environment
RUN uv sync --frozen

# Ensure virtual environment binaries are on PATH
ENV PATH="/app/.venv/bin:$PATH"

# Verify uvicorn is installed
RUN /app/.venv/bin/uvicorn --version

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uv", "run", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--loop", "uvloop", "--workers", "4", "--log-level", "info"]
