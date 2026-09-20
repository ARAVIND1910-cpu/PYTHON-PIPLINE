import argparse
import json
import logging
from pathlib import Path
from typing import Any

import pandas as pd


def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler("pipeline.log", encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


def load_config(path: str = "config.json") -> dict[str, Any]:
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def read_data(input_path: str, input_format: str | None = None) -> pd.DataFrame:
    path = Path(input_path)
    fmt = (input_format or path.suffix.lstrip(".")).lower()
    logging.info("Reading %s input: %s", fmt.upper(), path)

    if fmt == "csv":
        return pd.read_csv(path)
    if fmt == "json":
        return pd.read_json(path)

    raise ValueError(f"Unsupported input format: {fmt}")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()
    result.columns = (
        result.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
    )
    logging.info("Normalized column names")
    return result


def clean_data(df: pd.DataFrame, config: dict[str, Any]) -> pd.DataFrame:
    result = df.copy()

    for column in config["required_columns"]:
        if column not in result.columns:
            result[column] = pd.NA

    for column in config["numeric_columns"]:
        if column in result.columns:
            result[column] = pd.to_numeric(result[column], errors="coerce")

    for column, default in config["missing_values"].items():
        if column in result.columns:
            result[column] = result[column].fillna(default)

    for column in ["name", "city"]:
        if column in result.columns:
            result[column] = result[column].astype(str).str.strip().str.title()

    before = len(result)
    result = result.drop_duplicates()
    logging.info("Removed %d duplicate rows", before - len(result))

    return result


def validate_data(df: pd.DataFrame, config: dict[str, Any]) -> pd.DataFrame:
    result = df.copy()

    if "score" in result.columns:
        result["score"] = result["score"].clip(
            lower=config["score_min"], upper=config["score_max"]
        )

    if "age" in result.columns:
        result["age"] = result["age"].clip(lower=0)

    logging.info("Validated numeric ranges")
    return result


def transform_data(df: pd.DataFrame) -> pd.DataFrame:
    result = df.copy()

    if "score" in result.columns:
        result["score"] = result["score"].round(2)

    preferred = ["id", "name", "age", "city", "score"]
    ordered = [c for c in preferred if c in result.columns]
    ordered += [c for c in result.columns if c not in ordered]
    return result[ordered]


def write_data(df: pd.DataFrame, output_path: str, output_format: str | None = None) -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fmt = (output_format or path.suffix.lstrip(".")).lower()

    if fmt == "csv":
        df.to_csv(path, index=False)
    elif fmt == "json":
        df.to_json(path, orient="records", indent=2)
    else:
        raise ValueError(f"Unsupported output format: {fmt}")

    logging.info("Wrote %d records to %s", len(df), path)


def run_pipeline(input_path: str, output_path: str, config_path: str = "config.json") -> pd.DataFrame:
    config = load_config(config_path)
    df = read_data(input_path)
    logging.info("Raw records: %d", len(df))

    df = normalize_columns(df)
    df = clean_data(df, config)
    df = validate_data(df, config)
    df = transform_data(df)

    write_data(df, output_path)
    logging.info("Pipeline completed successfully")
    return df


def main() -> None:
    parser = argparse.ArgumentParser(description="Data Processing Pipeline")
    parser.add_argument("--input", required=True, help="Path to CSV or JSON input")
    parser.add_argument("--output", required=True, help="Path to CSV or JSON output")
    parser.add_argument("--config", default="config.json", help="Configuration JSON path")
    args = parser.parse_args()

    setup_logging()
    run_pipeline(args.input, args.output, args.config)


if __name__ == "__main__":
    main()
