"""Small illustrative evaluation harness; expand and independently label before claiming quality."""
import json
from pathlib import Path
from matching import rank_jobs

ROOT = Path(__file__).resolve().parent
jobs = json.loads((ROOT / "data" / "jobs.json").read_text(encoding="utf-8"))

# Each label is a human-authored expected top role for this small demonstration set.
# This is not a representative benchmark and must not be described as general accuracy.
examples = [
    {"skills": ["Python", "SQL", "Pandas", "Excel"], "interests": ["data analysis"], "expected": "Junior Data Analyst"},
    {"skills": ["React", "JavaScript", "CSS", "HTML"], "interests": ["web interfaces"], "expected": "Junior Frontend Developer"},
    {"skills": ["Python", "Flask", "SQL", "Git"], "interests": ["backend APIs"], "expected": "Junior Python Developer"},
    {"skills": ["Python", "NumPy", "Scikit-learn", "Statistics"], "interests": ["machine learning"], "expected": "Machine Learning Intern"},
    {"skills": ["Figma", "Wireframing", "Prototyping", "User Research"], "interests": ["product design"], "expected": "Junior UI/UX Designer"},
]

def evaluate(use_semantic):
    correct = 0
    for example in examples:
        results = rank_jobs(example, jobs, use_semantic=use_semantic)
        predicted = results[0]["title"]
        correct += predicted == example["expected"]
        print(f"expected={example['expected']!r} predicted={predicted!r} top_score={results[0]['match_score']}")
    return correct / len(examples)

if __name__ == "__main__":
    print("\nSkill-overlap baseline")
    baseline = evaluate(False)
    print(f"Top-1 agreement on demo set: {baseline:.1%}")
    print("\nLocal semantic model (downloads model on first use)")
    semantic = evaluate(True)
    print(f"Top-1 agreement on demo set: {semantic:.1%}")
    print("\nCaution: this five-example demo set is too small to support broad performance claims.")
