# Python Data Processing Pipeline

A Python data processing pipeline that reads raw CSV/JSON files, cleans and transforms records, handles missing values and type conversion, removes duplicates, validates data, logs processing stages, and writes structured results.

## Features
- CSV and JSON input support
- Missing-value handling
- Numeric type conversion with invalid values converted safely
- Duplicate removal
- Range validation
- Configurable processing using `config.json`
- File + console logging
- Structured CSV/JSON output
- Unit tests

## Setup
Python 3.9+ recommended.

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
```

## Run
```bash
python src/pipeline.py --input data/input.csv --output output/processed.csv
python src/pipeline.py --input data/input.json --output output/processed.json
```

## Processing Flow
1. Read raw data
2. Normalize column names
3. Convert configured numeric fields
4. Fill configured missing values
5. Remove duplicates
6. Validate numeric ranges
7. Transform and standardize output
8. Write structured results
9. Record processing logs

## Tests
```bash
python -m unittest discover tests
```
