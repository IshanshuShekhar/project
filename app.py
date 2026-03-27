from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import subprocess

app = Flask(__name__)

# ------------------------------
# ML MODEL
# ------------------------------
X = np.array([[50],[60],[70],[80],[90],[100],[120],[140]])
y = np.array([55,65,75,85,95,110,130,150])
model = RandomForestRegressor(n_estimators=100, random_state=42).fit(X, y)

history = []
score_history = []

# ------------------------------
# SUSTAINABILITY SCORE
# ------------------------------
def calculate_score(data):
    water = data.get("water_usage", 0)
    water_demand = data.get("water_demand", 100)
    energy = data.get("energy_usage", 0)
    energy_demand = data.get("energy_demand", 80)
    cost = data.get("electricity_cost", 0)
    waste = data.get("waste_generated", 0)

    water_score = (water_demand / max(water,1)) * 100
    energy_score = (energy_demand / max(energy,1)) * 100
    cost_score = (10 / max(cost,1)) * 100
    waste_score = ((30 - waste) / 30) * 100

    return round(water_score*0.3 + energy_score*0.3 + cost_score*0.2 + waste_score*0.2, 2)

# ------------------------------
# ESTIMATED SAVINGS
# ------------------------------
def estimate_savings(data):
    energy = data.get("energy_usage", 0)
    cost = data.get("electricity_cost", 0)
    return round(energy * 0.15 * cost, 2)

# ------------------------------
# ENERGY PREDICTION
# ------------------------------
def predict_energy(val):
    return round(model.predict(np.array([[val]]))[0], 2)

# ------------------------------
# AI FUNCTION (OLLAMA)
# ------------------------------
def run_ai(prompt):
    try:
        res = subprocess.run(
            ["ollama", "run", "llama3"],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=180
        )
        if res.returncode != 0:
            return "AI not available"
        return res.stdout.strip() if res.stdout.strip() else "AI returned empty"
    except subprocess.TimeoutExpired:
        return "AI not available (timeout)"
    except FileNotFoundError:
        return "AI not available (Ollama not installed)"
    except Exception as e:
        return f"AI not available (exception: {str(e)})"

# ------------------------------
# ROUTES
# ------------------------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json

    score = calculate_score(data)
    prediction = predict_energy(data.get("energy_usage", 0))
    savings = estimate_savings(data)

    # Short, concise AI prompt
    prompt = f"Give 2-3 short sustainability tips for Water={data.get('water_usage',0)}, Energy={data.get('energy_usage',0)}, Cost={data.get('electricity_cost',0)}, Waste={data.get('waste_generated',0)}"
    ai = run_ai(prompt)

    history.append(data.get("energy_usage", 0))
    score_history.append(score)

    return jsonify({
        "score": score,
        "prediction": prediction,
        "savings": savings,
        "ai": ai,
        "history": history,
        "score_history": score_history
    })

@app.route("/whatif-ai", methods=["POST"])
def whatif():
    data = request.json
    prompt = f"Suggest 2-3 concise improvements for Water={data.get('water_usage',0)}, Energy={data.get('energy_usage',0)}, Cost={data.get('electricity_cost',0)}, Waste={data.get('waste_generated',0)}"
    result = run_ai(prompt)
    return jsonify({"whatif": result})

if __name__ == "__main__":
    print("🚀 Running on http://127.0.0.1:5008")
    app.run(debug=True, port=5008)