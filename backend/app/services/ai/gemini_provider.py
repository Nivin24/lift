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

    async def _generate_content_raw(
        self,
        api_key: str,
        model_name: str,
        system_prompt: str,
        user_prompt: str,
        media_bytes: Optional[bytes] = None,
        mime_type: Optional[str] = None
    ) -> str:
        url = f"{self.base_url}/models/{model_name}:generateContent?key={api_key}"
        parts: List[Dict[str, Any]] = []
        if media_bytes and mime_type:
            import base64
            b64_data = base64.b64encode(media_bytes).decode('utf-8')
            parts.append({
                "inline_data": {
                    "mime_type": mime_type,
                    "data": b64_data
                }
            })
        parts.append({"text": user_prompt})

        payload: Dict[str, Any] = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": [
                {"role": "user", "parts": parts}
            ],
            "generationConfig": {
                "temperature": 0.2,
                "response_mime_type": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=90.0) as client:
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

    async def extract_text_from_media(
        self,
        api_key: str,
        model_name: str,
        media_bytes: bytes,
        mime_type: str,
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert OCR and technical document understanding engine. "
            "Analyze the attached document or image. Extract all text, headings, requirements, code snippets, "
            "and diagram structures. Output a strict JSON object:\n"
            "{\n"
            '  "suggested_title": "Clear concise title for this machine task",\n'
            '  "extracted_text": "Complete, verbatim and cleaned markdown transcription of all text, requirements, and notes in the document",\n'
            '  "summary": "2-3 sentence overview of what the machine task requires"\n'
            "}"
        )
        user_prompt = "Transcribe and extract the full requirements and content from this document/image into clean markdown."
        raw_json = await self._generate_content_raw(
            api_key=api_key,
            model_name=model_name,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            media_bytes=media_bytes,
            mime_type=mime_type
        )
        return json.loads(raw_json)

    async def deconstruct_machine_task(
        self,
        api_key: str,
        model_name: str,
        spec_text: str,
        title: str,
        module_code: str = "BM1",
        custom_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        system_prompt = (
            "You are an elite Staff Software Architect and Technical Educator designing a low-cognitive-load, "
            "step-by-step implementation plan for an intensive engineering machine task.\n"
            "Your mission: Eliminate candidate overwhelm and cognitive overload by deconstructing the specification "
            "into clear architectural components, an explicit requirements/edge-case checklist, and a phased weekly milestone roadmap.\n"
            "Respond with a strict JSON object with this exact schema:\n"
            "{\n"
            '  "title": "Clear, professional task title",\n'
            '  "overview": "1-2 sentence core purpose of this machine workout",\n'
            '  "architecture": {\n'
            '    "pattern": "e.g., Clean Architecture / Layered CLI Pipeline / Producer-Consumer / Event-Driven",\n'
            '    "components": [\n'
            '      {"name": "ComponentName", "responsibility": "Specific role and boundary", "methods_or_interfaces": ["func1()", "func2()"]}\n'
            '    ],\n'
            '    "data_flow": "Step-by-step description of data movement through the system",\n'
            '    "diagram_ascii": "Clean ASCII or Mermaid component/flow diagram"\n'
            '  },\n'
            '  "requirements_matrix": {\n'
            '    "core_requirements": ["Requirement 1", "Requirement 2"],\n'
            '    "edge_cases": ["Edge case 1 (e.g. malformed inputs)", "Edge case 2 (e.g. boundary conditions)"],\n'
            '    "testing_criteria": ["Unit test coverage goal", "Expected assertion or verification rule"]\n'
            '  },\n'
            '  "milestone_roadmap": [\n'
            '    {\n'
            '      "phase": 1,\n'
            '      "title": "Phase 1: Foundation & Data Skeleton",\n'
            '      "pacing": "Day 1-2 (or Hour 1)",\n'
            '      "cognitive_focus": "Low cognitive load: set up project skeleton, schemas, and type definitions without complex logic.",\n'
            '      "deliverables": ["Deliverable 1", "Deliverable 2"]\n'
            '    },\n'
            '    {\n'
            '      "phase": 2,\n'
            '      "title": "Phase 2: Core Engine & Business Logic",\n'
            '      "pacing": "Day 3-4 (or Hour 2)",\n'
            '      "cognitive_focus": "Focused logic: implement core algorithms and primary data processing.",\n'
            '      "deliverables": ["Deliverable 1", "Deliverable 2"]\n'
            '    },\n'
            '    {\n'
            '      "phase": 3,\n'
            '      "title": "Phase 3: Interface, CLI/API & Input Validation",\n'
            '      "pacing": "Day 5 (or Hour 3)",\n'
            '      "cognitive_focus": "Integration: connect command line or API interface, argument parsing, and user feedback.",\n'
            '      "deliverables": ["Deliverable 1", "Deliverable 2"]\n'
            '    },\n'
            '    {\n'
            '      "phase": 4,\n'
            '      "title": "Phase 4: Edge Cases, Resilience & Submission Polish",\n'
            '      "pacing": "Day 6-7 (or Hour 4)",\n'
            '      "cognitive_focus": "Quality assurance: harden against edge cases, write test suites, and polish documentation.",\n'
            '      "deliverables": ["Deliverable 1", "Deliverable 2"]\n'
            '    }\n'
            '  ],\n'
            '  "suggested_subtasks": [\n'
            '    {"title": "Phase 1: Setup & Data Skeleton", "description": "Initialize repository structure, schemas, and type definitions.", "task_type": "CODING", "priority": "HIGH"},\n'
            '    {"title": "Phase 2: Core Processing Engine", "description": "Implement core algorithms, data manipulation, and caching.", "task_type": "MACHINE_TASK", "priority": "URGENT"},\n'
            '    {"title": "Phase 3: CLI/API & Argument Validation", "description": "Implement argument parsing, interface commands, and robust input validation.", "task_type": "CODING", "priority": "HIGH"},\n'
            '    {"title": "Phase 4: Edge Case Hardening & Tests", "description": "Add boundary condition unit tests, error handling, and documentation.", "task_type": "PRACTICE", "priority": "HIGH"}\n'
            '  ]\n'
            "}"
        )
        user_prompt = f"Deconstruct and architect the following machine task specification for stage '{module_code}':\n\nTask Title: {title}\n\nSpecification Details:\n{spec_text}"
        if custom_instruction:
            user_prompt += f"\n\nCandidate Preference/Focus: {custom_instruction}"
        raw_json = await self._generate_content_raw(
            api_key=api_key,
            model_name=model_name,
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        return json.loads(raw_json)
