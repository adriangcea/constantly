from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "API de hábitos funcionando 🚀"

@app.route("/usuarios")
def usuarios():
    return jsonify([
        {"id": 1, "nombre": "Admin"},
        {"id": 2, "nombre": "Usuario1"}
    ])

if __name__ == "__main__":
    app.run(debug=True)