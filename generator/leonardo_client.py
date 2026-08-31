"""Thin wrapper around the Leonardo.ai REST API.

Docs: https://docs.leonardo.ai/reference/creategeneration
"""

import os
import time

import requests

API_BASE = "https://cloud.leonardo.ai/api/rest/v1"

# Leonardo "Phoenix" foundational model -- good general-purpose default.
# For a stronger painterly/impasto look, browse Leonardo's community
# "Finetuned Models" for an oil-painting style model and override this
# via the LEONARDO_MODEL_ID env var.
DEFAULT_MODEL_ID = "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3"


class LeonardoError(RuntimeError):
    pass


class LeonardoClient:
    def __init__(self, api_key: str | None = None, model_id: str | None = None):
        self.api_key = api_key or os.environ.get("LEONARDO_API_KEY")
        if not self.api_key:
            raise LeonardoError(
                "LEONARDO_API_KEY is not set. Copy .env.example to .env and add your key "
                "(get one at https://app.leonardo.ai -> API Access)."
            )
        self.model_id = model_id or os.environ.get("LEONARDO_MODEL_ID", DEFAULT_MODEL_ID)
        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _start_generation(
        self, prompt: str, negative_prompt: str, width: int, height: int, num_images: int
    ) -> str:
        payload = {
            "modelId": self.model_id,
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "width": width,
            "height": height,
            "num_images": num_images,
            "alchemy": True,
        }
        resp = requests.post(f"{API_BASE}/generations", headers=self._headers, json=payload)
        if resp.status_code >= 400:
            raise LeonardoError(f"Failed to start generation: {resp.status_code} {resp.text}")
        data = resp.json()
        try:
            return data["sdGenerationJob"]["generationId"]
        except KeyError as exc:
            raise LeonardoError(f"Unexpected response shape: {data}") from exc

    def _poll_generation(self, generation_id: str, timeout: int = 120, interval: int = 4) -> list[str]:
        deadline = time.time() + timeout
        while time.time() < deadline:
            resp = requests.get(f"{API_BASE}/generations/{generation_id}", headers=self._headers)
            if resp.status_code >= 400:
                raise LeonardoError(f"Failed to poll generation: {resp.status_code} {resp.text}")
            data = resp.json().get("generations_by_pk", {})
            status = data.get("status")
            images = data.get("generated_images") or []
            if status == "COMPLETE" and images:
                return [img["url"] for img in images]
            if status == "FAILED":
                raise LeonardoError(f"Generation {generation_id} failed")
            time.sleep(interval)
        raise LeonardoError(f"Timed out waiting for generation {generation_id}")

    def generate(
        self,
        prompt: str,
        negative_prompt: str = "",
        width: int = 1024,
        height: int = 1820,
        num_images: int = 1,
    ) -> list[str]:
        """Generate images and return a list of image URLs."""
        generation_id = self._start_generation(prompt, negative_prompt, width, height, num_images)
        return self._poll_generation(generation_id)

    @staticmethod
    def download(url: str, out_path: str) -> None:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        with open(out_path, "wb") as f:
            f.write(resp.content)
