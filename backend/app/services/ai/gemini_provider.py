import httpx
import json
import logging
from typing import Dict, Any, Optional, List
from app.services.ai.base import AIProvider

logger = logging.getLogger("lift.gemini")

class GeminiProvider(AIProvider):
    def __init__(self):
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    async def test_connection(self, api_key: str, model_name: str = "gemini-2.5-flash") -> Dict[str, Any]:
        """
        Validates the Gemini API key by making a lightweight test call.
        """
        if not api_key:
            return {"success": False, "message": "API key cannot be empty"}
        
        # Test request
        url = f"{self.base_url}/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": "Reply with 'OK' only."}]}
            ],
            "generationConfig": {
                "maxOutputTokens": 10,
                "temperature": 0.0
            }
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    return {
                        "success": True,
                        "message": f"Successfully connected to Gemini API using model {model_name}."
                    }
                else:
                    err_msg = "Invalid API Key or model error"
                    try:
                        err_json = resp.json()
                        err_msg = err_json.get("error", {}).get("message", err_msg)
                    except Exception:
                        pass
                    return {"success": False, "message": f"Gemini error ({resp.status_code}): {err_msg}"}
        except httpx.RequestError as e:
            return {"success": False, "message": f"Network error connecting to Gemini API: {str(e)}"}

    async def _generate_content_raw(self, api_key: str, model_name: str, system_prompt: str, user_prompt: str) -> str:
        url = f"{self.base_url}/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {"role": "user", "parts": [{"text": user_prompt}]}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                err_detail = "Failed to generate content"
                try:
                    err_detail = resp.json().get("error", {}).get("message", err_detail)
                except Exception:
                    pass
                raise Exception(f"Gemini API error ({resp.status_code}): {err_detail}")
            
            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise Exception("No content candidates returned by Gemini.")
            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text

    async def generate_structured_material(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        module_code: str,
        custom_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert AI curriculum engineer and technical educator creating master-class study modules "
            "for a high-rigor preparation curriculum (LIFT). Respond with a strict JSON object following this exact schema:\n"
            "{\n"
            '  "overview": "Comprehensive high-level conceptual overview",\n'
            '  "why_it_matters": "Real-world engineering relevance and systems rationale",\n'
            '  "prerequisites": ["prerequisite 1", "prerequisite 2"],\n'
            '  "core_concepts": ["concept 1 explained", "concept 2 explained", "concept 3 explained"],\n'
            '  "syntax_structure": "Code structure, typing annotations, or mathematical formulation",\n'
            '  "examples": [{"title": "Example name", "code": "Production-grade code or formula", "explanation": "Step-by-step breakdown"}],\n'
            '  "practical_applications": ["Use case 1 in distributed systems/data pipelines", "Use case 2"],\n'
            '  "common_mistakes": ["Pitfall 1 with correction", "Pitfall 2 with correction"],\n'
            '  "important_notes": ["Crucial nuance 1", "Performance consideration 2"],\n'
            '  "practice_questions": [{"question": "...", "answer": "..."}],\n'
            '  "interview_questions": [{"question": "...", "answer": "..."}],\n'
            '  "practical_tasks": [{"title": "...", "description": "...", "type": "CODING"}],\n'
            '  "quick_revision": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"],\n'
            '  "self_assessment": ["Can I explain X?", "Can I implement Y without looking?"]\n'
            "}"
        )
        user_prompt = (
            f"Generate standard technical study material for Topic: '{topic_title}' "
            f"in Learning Area: '{area_title}' (Module: {module_code}).\n"
        )
        if custom_instruction:
            user_prompt += f"Special Focus: {custom_instruction}\n"

        raw_json_str = await self._generate_content_raw(api_key, model_name, system_prompt, user_prompt)
        try:
            return json.loads(raw_json_str)
        except json.JSONDecodeError:
            # Fallback if markdown code fences were included
            cleaned = raw_json_str.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned)

    async def generate_questions(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        system_prompt = (
            "You are a principal engineer interviewing candidates. Return a JSON array of questions:\n"
            "[{\n"
            '  "question_text": "Detailed question",\n'
            '  "answer_text": "Thorough, authoritative technical answer",\n'
            '  "difficulty": "INTERMEDIATE" | "ADVANCED",\n'
            '  "question_type": "CONCEPTUAL" | "INTERVIEW" | "PRACTICE"\n'
            "}]"
        )
        user_prompt = f"Generate {count} technical interview and practice questions for '{topic_title}' in '{area_title}'."
        raw_json = await self._generate_content_raw(api_key, model_name, system_prompt, user_prompt)
        return json.loads(raw_json)

    async def generate_quiz(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str,
        count: int = 5
    ) -> List[Dict[str, Any]]:
        system_prompt = (
            "You are a technical examiner. Return a JSON array of multiple-choice quiz questions:\n"
            "[{\n"
            '  "question_text": "...",\n'
            '  "options": ["Option A", "Option B", "Option C", "Option D"],\n'
            '  "correct_option_index": 0,\n'
            '  "answer_text": "Detailed explanation of why the correct option is right and others are wrong",\n'
            '  "difficulty": "INTERMEDIATE",\n'
            '  "question_type": "QUIZ"\n'
            "}]"
        )
        user_prompt = f"Generate a {count}-question quiz testing edge cases and deep understanding of '{topic_title}'."
        raw_json = await self._generate_content_raw(api_key, model_name, system_prompt, user_prompt)
        return json.loads(raw_json)

    async def generate_task(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are a senior tech lead designing practical learning tasks. Return a JSON object:\n"
            "{\n"
            '  "title": "Clear actionable task title",\n'
            '  "description": "Step-by-step specification, requirements, edge-cases, and test verification criteria",\n'
            '  "task_type": "PRACTICE" | "CODING" | "MACHINE_TASK",\n'
            '  "priority": "HIGH",\n'
            '  "estimated_minutes": 60\n'
            "}"
        )
        user_prompt = f"Design a hands-on coding or machine task for '{topic_title}' in '{area_title}'."
        raw_json = await self._generate_content_raw(api_key, model_name, system_prompt, user_prompt)
        return json.loads(raw_json)

    async def generate_revision_notes(
        self,
        api_key: str,
        model_name: str,
        topic_title: str,
        area_title: str
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an AI tutor generating concise cheat-sheet flashcards and revision notes. Return a JSON object:\n"
            "{\n"
            '  "title": "Quick Revision Guide",\n'
            '  "summary": "1-paragraph synthesis",\n'
            '  "cheat_sheet": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],\n'
            '  "mental_models": "Key intuition or diagram description",\n'
            '  "gotchas": ["Gotcha 1", "Gotcha 2"],\n'
            '  "formula_or_syntax": "Code snippet or key syntax rule"\n'
            "}"
        )
        user_prompt = f"Generate quick revision notes and memory hooks for '{topic_title}'."
        raw_json = await self._generate_content_raw(api_key, model_name, system_prompt, user_prompt)
        return json.loads(raw_json)
