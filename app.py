from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import subprocess

app = Flask(__name__)

# ---------------- ML MODEL ----------------
X = np.array([[50],[60],[70],[80],[90],[100],[120],[140]])
y = np.array([55,65,75,85,95,110,130,150])
model = RandomForestRegressor().fit(X, y)

history = []

# ---------------- SCORE CALCULATION ----------------
def calculate_score(data):
    water = data.get("water_usage", 0)
    energy = data.get("energy_usage", 0)
    cost = data.get("electricity_cost", 0)
    waste = data.get("waste_generated", 0)

    water_score = min((100 / max(water,1)) * 100, 100)
    energy_score = min((80 / max(energy,1)) * 100, 100)
    cost_score = min((10 / max(cost,1)) * 100, 100)
    waste_score = max(((30 - waste) / 30) * 100, 0)

    final_score = (
        water_score * 0.3 +
        energy_score * 0.3 +
        cost_score * 0.2 +
        waste_score * 0.2
    )

    return round(final_score, 2)

# ---------------- PREDICTION ----------------
def predict_energy(val):
    return round(model.predict(np.array([[val]]))[0], 2)

# ---------------- OLLAMA AI ----------------
def get_ai(data):
    prompt = f"Give short sustainability suggestions: {data}"

    try:
        res = subprocess.run(
            ["C:\\Users\\ishan\\AppData\\Local\\Programs\\Ollama\\ollama.exe", "run", "llama3"],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=60
        )

        # 🔍 Debug prints (see terminal)
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)

        if res.returncode != 0:
            return f"Error: {res.stderr}"

        return res.stdout.strip() if res.stdout else "No response from AI"

    except Exception as e:
        return f"Exception: {str(e)}"

# ---------------- ROUTES ----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    score = calculate_score(data)
    prediction = predict_energy(data.get("energy_usage", 0))
    ai = get_ai(data)

    history.append(data.get("energy_usage", 0))

    return jsonify({
        "score": score,
        "prediction": prediction,
        "ai": ai,
        "history": history
    })

# ---------------- RUN ----------------
if __name__ == "__main__":
    print("🚀 SERVER STARTED ON PORT 5001")
    app.run(debug=True, port=5001)