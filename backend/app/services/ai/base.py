from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List

class AIProvider(ABC):
    @abstractmethod
    async def test_connection(self, api_key: str, model_name: str) -> Dict[str, Any]:
        """Tests API key and model connectivity."""
        pass

    @abstractmethod
    async def generate_structured_material(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        module_code: str,
        custom_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generates comprehensive structured study content adhering to the LIFT curriculum schema."""
        pass

    @abstractmethod
    async def generate_questions(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """Generates conceptual, practice, and interview questions."""
        pass

    @abstractmethod
    async def generate_quiz(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        """Generates multiple-choice quiz questions with options and explanation."""
        pass

    @abstractmethod
    async def generate_task(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str
    ) -> Dict[str, Any]:
        """Generates practical coding and machine task exercises."""
        pass

    @abstractmethod
    async def generate_revision_notes(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str
    ) -> Dict[str, Any]:
        """Generates quick cheat-sheet / revision flashcards."""
        pass
