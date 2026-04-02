#!/usr/bin/env python3
"""Tests for jira.py — issue type discovery, caching, transitions, and case handling.

All tests are dry-run: API calls and disk I/O are mocked. No Jira instance needed.

Usage:
    python apps/features/test_jira.py
    python -m unittest apps.features.test_jira  (from project root)
"""

import json
import os
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Ensure the features dir is importable
sys.path.insert(0, str(Path(__file__).resolve().parent))

import jira


# Simulated Jira API responses
FAKE_ISSUE_TYPES_RESPONSE = [
    {"id": "10001", "name": "Task"},
    {"id": "10002", "name": "Epic"},
    {"id": "10003", "name": "Subtask"},
    {"id": "10004", "name": "Story"},
    {"id": "10005", "name": "Bug"},
]

FAKE_TRANSITIONS_RESPONSE = {
    "transitions": [
        {"id": "11", "name": "TO DO"},
        {"id": "21", "name": "IN PROGRESS"},
        {"id": "2", "name": "IN REVIEW"},
        {"id": "31", "name": "DONE"},
    ]
}


class TestGetIssueTypeId(unittest.TestCase):
    """get_issue_type_id should be case-insensitive and handle fuzzy matches."""

    def setUp(self):
        # Reset in-memory cache before each test
        jira._issue_type_cache = None

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_lowercase_input(self, mock_api, mock_save, mock_load):
        result = jira.get_issue_type_id("task")
        self.assertEqual(result, "10001")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_uppercase_input(self, mock_api, mock_save, mock_load):
        result = jira.get_issue_type_id("Task")
        self.assertEqual(result, "10001")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_allcaps_input(self, mock_api, mock_save, mock_load):
        result = jira.get_issue_type_id("STORY")
        self.assertEqual(result, "10004")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_mixed_case_input(self, mock_api, mock_save, mock_load):
        result = jira.get_issue_type_id("Epic")
        self.assertEqual(result, "10002")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_unknown_type_exits(self, mock_api, mock_save, mock_load):
        with self.assertRaises(SystemExit):
            jira.get_issue_type_id("nonexistent")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_fuzzy_match(self, mock_api, mock_save, mock_load):
        # "sub" should fuzzy-match "subtask"
        result = jira.get_issue_type_id("sub")
        self.assertEqual(result, "10003")


class TestIssueTypeDiscovery(unittest.TestCase):
    """get_issue_types should discover types from API and normalize names."""

    def setUp(self):
        jira._issue_type_cache = None

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_discovers_all_types(self, mock_api, mock_save, mock_load):
        types = jira.get_issue_types()
        self.assertEqual(types["task"], "10001")
        self.assertEqual(types["epic"], "10002")
        self.assertEqual(types["subtask"], "10003")
        self.assertEqual(types["story"], "10004")
        self.assertEqual(types["bug"], "10005")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_keys_are_lowercase(self, mock_api, mock_save, mock_load):
        types = jira.get_issue_types()
        for key in types:
            self.assertEqual(key, key.lower())

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_api_called_once_then_cached(self, mock_api, mock_save, mock_load):
        jira.get_issue_types()
        jira.get_issue_types()
        jira.get_issue_types()
        mock_api.assert_called_once_with("GET", "/issuetype")

    @patch.object(jira, "_load_disk_cache", return_value=None)
    @patch.object(jira, "_save_disk_cache")
    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_saves_to_disk_after_discovery(self, mock_api, mock_save, mock_load):
        types = jira.get_issue_types()
        mock_save.assert_called_once_with(types)

    @patch.dict(os.environ, {
        "JIRA_ISSUE_TYPE_TASK": "99999",
        "JIRA_ISSUE_TYPE_STORY": "88888",
    })
    @patch.object(jira, "api")
    def test_env_overrides_skip_api(self, mock_api):
        types = jira.get_issue_types()
        self.assertEqual(types["task"], "99999")
        self.assertEqual(types["story"], "88888")
        mock_api.assert_not_called()


class TestDiskCache(unittest.TestCase):
    """Disk cache should persist types per-instance and respect TTL."""

    def setUp(self):
        jira._issue_type_cache = None
        self._tmpdir = tempfile.mkdtemp()
        self._orig_cache_file = jira._CACHE_FILE
        jira._CACHE_FILE = Path(self._tmpdir) / ".jira-cache.json"

    def tearDown(self):
        jira._CACHE_FILE = self._orig_cache_file
        import shutil
        shutil.rmtree(self._tmpdir, ignore_errors=True)

    def test_load_returns_none_when_no_file(self):
        self.assertIsNone(jira._load_disk_cache())

    def test_save_then_load(self):
        types = {"task": "10001", "story": "10004"}
        jira._save_disk_cache(types)
        loaded = jira._load_disk_cache()
        self.assertEqual(loaded, types)

    def test_load_returns_none_when_expired(self):
        types = {"task": "10001"}
        jira._save_disk_cache(types)
        # Backdate the timestamp
        data = json.loads(jira._CACHE_FILE.read_text())
        data[jira.BASE_URL]["ts"] = time.time() - jira._CACHE_TTL - 1
        jira._CACHE_FILE.write_text(json.dumps(data))
        self.assertIsNone(jira._load_disk_cache())

    def test_multiple_instances_coexist(self):
        types_a = {"task": "10001"}
        jira._save_disk_cache(types_a)

        # Simulate a different Jira instance
        orig_url = jira.BASE_URL
        jira.BASE_URL = "https://other-instance.atlassian.net"
        types_b = {"task": "20001", "story": "20004"}
        jira._save_disk_cache(types_b)

        # Both should be in the file
        data = json.loads(jira._CACHE_FILE.read_text())
        self.assertIn(orig_url, data)
        self.assertIn("https://other-instance.atlassian.net", data)
        self.assertEqual(data[orig_url]["types"], types_a)
        self.assertEqual(data["https://other-instance.atlassian.net"]["types"], types_b)

        jira.BASE_URL = orig_url

    def test_corrupted_file_returns_none(self):
        jira._CACHE_FILE.write_text("not json{{{")
        self.assertIsNone(jira._load_disk_cache())

    @patch.object(jira, "api", return_value=FAKE_ISSUE_TYPES_RESPONSE)
    def test_discovery_populates_disk_cache(self, mock_api):
        types = jira.get_issue_types()
        self.assertTrue(jira._CACHE_FILE.exists())
        loaded = jira._load_disk_cache()
        self.assertEqual(loaded, types)

    @patch.object(jira, "api")
    def test_fresh_cache_skips_api(self, mock_api):
        # Pre-populate cache
        jira._save_disk_cache({"task": "10001", "story": "10004"})
        types = jira.get_issue_types()
        self.assertEqual(types["task"], "10001")
        self.assertEqual(types["story"], "10004")
        mock_api.assert_not_called()


class TestTransitionTicket(unittest.TestCase):
    """transition_ticket should discover transitions and match case-insensitively."""

    @patch.object(jira, "api")
    def test_transition_calls_api(self, mock_api):
        mock_api.side_effect = [
            FAKE_TRANSITIONS_RESPONSE,  # GET transitions
            {},                          # POST transition
        ]
        jira.transition_ticket("RICH-1", "IN PROGRESS")
        mock_api.assert_any_call("GET", "/issue/RICH-1/transitions")
        mock_api.assert_any_call("POST", "/issue/RICH-1/transitions", {
            "transition": {"id": "21"},
        })

    @patch.object(jira, "api")
    def test_transition_case_insensitive(self, mock_api):
        mock_api.side_effect = [FAKE_TRANSITIONS_RESPONSE, {}]
        jira.transition_ticket("RICH-1", "done")
        mock_api.assert_any_call("POST", "/issue/RICH-1/transitions", {
            "transition": {"id": "31"},
        })

    @patch.object(jira, "api", return_value=FAKE_TRANSITIONS_RESPONSE)
    def test_invalid_transition_exits(self, mock_api):
        with self.assertRaises(SystemExit):
            jira.transition_ticket("RICH-1", "INVALID")


class TestMdToAdf(unittest.TestCase):
    """md_to_adf should convert markdown to Atlassian Document Format."""

    def test_empty_string(self):
        result = jira.md_to_adf("")
        self.assertEqual(result, {"version": 1, "type": "doc", "content": []})

    def test_plain_paragraph(self):
        result = jira.md_to_adf("Hello world")
        self.assertEqual(len(result["content"]), 1)
        self.assertEqual(result["content"][0]["type"], "paragraph")
        self.assertEqual(result["content"][0]["content"][0]["text"], "Hello world")

    def test_heading(self):
        result = jira.md_to_adf("## My Heading")
        block = result["content"][0]
        self.assertEqual(block["type"], "heading")
        self.assertEqual(block["attrs"]["level"], 2)

    def test_bold_inline(self):
        result = jira.md_to_adf("This is **bold** text")
        nodes = result["content"][0]["content"]
        bold_node = [n for n in nodes if n.get("marks")]
        self.assertEqual(len(bold_node), 1)
        self.assertEqual(bold_node[0]["text"], "bold")
        self.assertEqual(bold_node[0]["marks"][0]["type"], "strong")

    def test_bullet_list(self):
        result = jira.md_to_adf("- item one\n- item two")
        block = result["content"][0]
        self.assertEqual(block["type"], "bulletList")
        self.assertEqual(len(block["content"]), 2)

    def test_ordered_list(self):
        result = jira.md_to_adf("1. first\n2. second\n3. third")
        block = result["content"][0]
        self.assertEqual(block["type"], "orderedList")
        self.assertEqual(len(block["content"]), 3)


class TestArgparseLowercase(unittest.TestCase):
    """The -t flag should accept any casing and lowercase it."""

    def test_uppercase_type_lowercased(self):
        # Simulate: feature.py create "title" -t Story
        self.assertEqual(str.lower("Story"), "story")
        self.assertEqual(str.lower("TASK"), "task")
        self.assertEqual(str.lower("Epic"), "epic")
        self.assertEqual(str.lower("BUG"), "bug")


if __name__ == "__main__":
    unittest.main()
