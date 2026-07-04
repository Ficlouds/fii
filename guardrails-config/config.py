"""
Custom config that registers a linear-scan embedding search provider.

Annoy 1.17.3 is broken on macOS arm64 (macosx_26_0 wheel) and consistently
returns only 1 result regardless of n_results requested. This replaces the
default BasicEmbeddingsIndex (which uses Annoy) with a brute-force NumPy
cosine-similarity search that works correctly.
"""

from __future__ import annotations

import asyncio
from typing import Any, Dict, List, Optional

import numpy as np

from nemoguardrails.embeddings.index import EmbeddingsIndex, IndexItem
from nemoguardrails.embeddings.providers import init_embedding_model
from nemoguardrails.rails.llm.config import EmbeddingsCacheConfig


class LinearScanEmbeddingsIndex(EmbeddingsIndex):
    """Brute-force cosine-similarity index using NumPy.

    Replaces Annoy which is broken on macOS arm64 (Darwin 25 / macOS 15).
    For the small number of intent examples used in NeMo Guardrails
    (typically < 100 items), a linear scan is fast enough.
    """

    def __init__(
        self,
        embedding_model: str = "all-MiniLM-L6-v2",
        embedding_engine: str = "FastEmbed",
        embedding_params: Optional[Dict[str, Any]] = None,
        cache_config: Optional[EmbeddingsCacheConfig] = None,
    ):
        self._model = None
        self._items: List[IndexItem] = []
        self._embeddings: List[List[float]] = []
        self.embedding_model = embedding_model
        self.embedding_engine = embedding_engine
        self.embedding_params = embedding_params or {}
        self._embedding_size = 0
        self._cache_config = cache_config or EmbeddingsCacheConfig()

    @property
    def embedding_size(self):
        return self._embedding_size

    @property
    def cache_config(self):
        return self._cache_config

    def _init_model(self):
        self._model = init_embedding_model(
            embedding_model=self.embedding_model,
            embedding_engine=self.embedding_engine,
            embedding_params=self.embedding_params,
        )

    async def _get_embeddings(self, texts: List[str]) -> List[List[float]]:
        if self._model is None:
            self._init_model()
        return await self._model.encode_async(texts)

    async def add_item(self, item: IndexItem):
        self._items.append(item)
        emb = (await self._get_embeddings([item.text]))[0]
        self._embeddings.append(emb)
        if self._embeddings:
            self._embedding_size = len(self._embeddings[0])

    async def add_items(self, items: List[IndexItem]):
        self._items.extend(items)
        texts = [item.text for item in items]
        embs = await self._get_embeddings(texts)
        self._embeddings.extend(embs)
        if self._embeddings:
            self._embedding_size = len(self._embeddings[0])

    async def build(self):
        # No index to build — we do linear scan at search time.
        pass

    async def search(
        self, text: str, max_results: int = 20, threshold: Optional[float] = None
    ) -> List[IndexItem]:
        if not self._embeddings:
            return []

        query_emb = (await self._get_embeddings([text]))[0]
        query = np.array(query_emb, dtype=np.float32)

        # Compute cosine similarities via dot product
        # (embeddings are already unit-normalised by the model)
        matrix = np.array(self._embeddings, dtype=np.float32)  # shape (n, dim)
        norms_q = np.linalg.norm(query)
        norms_m = np.linalg.norm(matrix, axis=1, keepdims=True)

        # Avoid division by zero
        if norms_q < 1e-10:
            return []

        query_unit = query / norms_q
        matrix_unit = matrix / np.clip(norms_m, 1e-10, None)

        similarities = matrix_unit @ query_unit  # shape (n,)

        # Sort descending
        sorted_indices = np.argsort(-similarities)

        results = []
        for idx in sorted_indices[:max_results]:
            sim = float(similarities[idx])
            if threshold is not None and sim < threshold:
                continue
            results.append(self._items[int(idx)])

        return results


def init(app):
    """Called by NeMo Guardrails when the config module is loaded."""
    # Register as "linear_scan" so config.yml can reference it explicitly.
    # (The "default" name is hard-wired to BasicEmbeddingsIndex in llmrails.py
    # and ignores the provider registry, so we cannot override it via register.)
    app.register_embedding_search_provider("linear_scan", LinearScanEmbeddingsIndex)
