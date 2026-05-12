"""Persona memory layer: episodic and semantic memory for the Twin-Loop brain.

Provides tool stubs for the MCP endpoint. Each tool will be implemented
as part of the User Simulator (Task A) and Recommender (Task B) agents.
"""

from pydantic import BaseModel


class PersonaSummary(BaseModel):
    """Structured summary of a user's persona built from reviews and interactions."""

    user_id: str
    name: str
    traits: list[str]
    preferences: dict[str, list[str]]
    english_register: str  # Nigerian English register: formal, pidgin, street, tech, market


class EpisodicMemory(BaseModel):
    """A single interaction episode stored in memory."""

    episode_id: str
    user_id: str
    action: str
    context: str
    outcome: str
    timestamp: str


async def get_persona_summary(user_id: str) -> PersonaSummary:
    """Retrieve the aggregated persona for a given user from semantic memory."""
    raise NotImplementedError("Persona memory retrieval not yet implemented")


async def get_episodic(user_id: str, limit: int = 10) -> list[EpisodicMemory]:
    """Retrieve recent episodic memories for a given user."""
    raise NotImplementedError("Episodic memory retrieval not yet implemented")


async def update_memory(user_id: str, episode: EpisodicMemory) -> None:
    """Store a new episode and update the user's persona embedding."""
    raise NotImplementedError("Memory update not yet implemented")
