import unittest

import pandas as pd

from src.pipeline import clean_data, normalize_columns, transform_data, validate_data


CONFIG = {
    "missing_values": {"name": "Unknown", "age": 0, "city": "Unknown", "score": 0.0},
    "numeric_columns": ["id", "age", "score"],
    "required_columns": ["id", "name", "age", "city", "score"],
    "score_min": 0,
    "score_max": 100,
}


class TestPipeline(unittest.TestCase):
    def test_column_normalization(self):
        result = normalize_columns(pd.DataFrame({"Student Name": ["Arun"]}))
        self.assertIn("student_name", result.columns)

    def test_missing_values_and_duplicates(self):
        df = pd.DataFrame([
            {"id": 1, "name": None, "age": None, "city": None, "score": 50},
            {"id": 1, "name": None, "age": None, "city": None, "score": 50},
        ])
        result = clean_data(df, CONFIG)
        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0]["name"], "Unknown")
        self.assertEqual(result.iloc[0]["age"], 0)

    def test_score_validation(self):
        df = pd.DataFrame([
            {"id": 1, "name": "A", "age": 20, "city": "Chennai", "score": 150}
        ])
        result = validate_data(df, CONFIG)
        self.assertEqual(result.iloc[0]["score"], 100)

    def test_transform(self):
        df = pd.DataFrame([
            {"score": 91.4567, "id": 1, "name": "A", "age": 20, "city": "Chennai"}
        ])
        result = transform_data(df)
        self.assertEqual(list(result.columns), ["id", "name", "age", "city", "score"])
        self.assertEqual(result.iloc[0]["score"], 91.46)


if __name__ == "__main__":
    unittest.main()
