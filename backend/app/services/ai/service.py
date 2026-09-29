import logging
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.entities import AICredentials, User, Topic, LearningArea, Module
from app.core.security import decrypt_credential
from app.services.ai.base import AIProvider
from app.services.ai.gemini_provider import GeminiProvider

logger = logging.getLogger("lift.ai_service")

class AIService:
    _providers: Dict[str, AIProvider] = {
        "gemini": GeminiProvider(),
    }

    @classmethod
    def get_provider(cls, provider_name: str = "gemini") -> AIProvider:
        provider = cls._providers.get(provider_name.lower())
        if not provider:
            raise HTTPException(
                status_code=400,
                detail=f"AI Provider '{provider_name}' is not currently active. Supported: {list(cls._providers.keys())}"
            )
        return provider

    @classmethod
    def get_user_credentials(cls, db: Session, user_id: int, provider: str = "gemini") -> tuple[str, str]:
        """Retrieves and decrypts the user's BYOK credentials."""
        creds = db.query(AICredentials).filter(
            AICredentials.user_id == user_id,
            AICredentials.provider == provider,
            AICredentials.is_active == True
        ).first()

        if not creds:
            raise HTTPException(
                status_code=400,
                detail="No API key configured for Gemini. Please visit Settings -> AI / Gemini to enter your Gemini API key."
            )

        try:
            api_key = decrypt_credential(creds.encrypted_api_key)
            if not api_key:
                raise ValueError("Empty decrypted key")
            return api_key, creds.model_name
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to securely decrypt your AI API key. Please re-enter it in Settings."
            )

    @classmethod
    def format_material_to_markdown(cls, structured: Dict[str, Any], topic_title: str) -> str:
        """Formats the 14-section structured curriculum schema to clean, beautiful Markdown."""
        md = []
        md.append(f"# {topic_title}\n")
        
        if "overview" in structured:
            md.append("## Overview\n" + str(structured["overview"]) + "\n")
        
        if "why_it_matters" in structured:
            md.append("## Why It Matters\n" + str(structured["why_it_matters"]) + "\n")

        if "prerequisites" in structured and structured["prerequisites"]:
            md.append("## Prerequisites\n")
            for item in structured["prerequisites"]:
                md.append(f"- {item}")
            md.append("")

        if "core_concepts" in structured and structured["core_concepts"]:
            md.append("## Core Concepts\n")
            for item in structured["core_concepts"]:
                md.append(f"- {item}")
            md.append("")

        if "syntax_structure" in structured:
            md.append("## Syntax / Structure\n```python\n" + str(structured["syntax_structure"]) + "\n```\n")

        if "examples" in structured and structured["examples"]:
            md.append("## Examples\n")
            for ex in structured["examples"]:
                md.append(f"### {ex.get('title', 'Example')}\n")
                if "code" in ex:
                    md.append(f"```python\n{ex['code']}\n```\n")
                if "explanation" in ex:
                    md.append(f"{ex['explanation']}\n")

        if "practical_applications" in structured and structured["practical_applications"]:
            md.append("## Practical Applications\n")
            for app in structured["practical_applications"]:
                md.append(f"- {app}")
            md.append("")

        if "common_mistakes" in structured and structured["common_mistakes"]:
            md.append("## Common Mistakes & Pitfalls\n")
            for mistake in structured["common_mistakes"]:
                md.append(f"- {mistake}")
            md.append("")

        if "important_notes" in structured and structured["important_notes"]:
            md.append("## Important Notes\n")
            for note in structured["important_notes"]:
                md.append(f"> 💡 {note}\n")
            md.append("")

        if "quick_revision" in structured and structured["quick_revision"]:
            md.append("## Quick Revision\n")
            for rev in structured["quick_revision"]:
                md.append(f"- [ ] {rev}")
            md.append("")

        if "self_assessment" in structured and structured["self_assessment"]:
            md.append("## Self Assessment\n")
            for sa in structured["self_assessment"]:
                md.append(f"- [ ] {sa}")
            md.append("")

        return "\n".join(md)
