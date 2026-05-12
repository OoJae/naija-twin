"""Naija-Twin API: FastAPI sidecar for the Twin-Loop agentic system.

Exposes MCP-compatible tool endpoints for the Vercel AI SDK frontend
to call persona memory, retrieval, and generation services.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from pydantic import BaseModel

from naija_twin.memory import get_episodic, get_persona_summary, update_memory


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks for database and cache connections."""
    yield


app = FastAPI(
    title="Naija-Twin API",
    description="Twin-Loop agentic system for user modeling and recommendation",
    version="0.1.0",
    lifespan=lifespan,
)


class HealthResponse(BaseModel):
    status: str
    service: str


class ToolInfo(BaseModel):
    name: str
    description: str


@app.get("/healthz", response_model=HealthResponse)
async def healthz():
    """Health check endpoint for container orchestration."""
    return HealthResponse(status="ok", service="naija-twin-api")


MCP_TOOLS = [
    ToolInfo(
        name="get_persona_summary",
        description="Retrieve aggregated persona for a user from semantic memory",
    ),
    ToolInfo(
        name="get_episodic",
        description="Retrieve recent episodic memories for a user",
    ),
    ToolInfo(
        name="update_memory",
        description="Store a new episode and update user persona embedding",
    ),
]


@app.get("/mcp/tools", response_model=list[ToolInfo])
async def list_mcp_tools():
    """List available MCP tool endpoints for the frontend agent."""
    return MCP_TOOLS


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "naija-twin-api",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/healthz",
        "tools": "/mcp/tools",
    }
