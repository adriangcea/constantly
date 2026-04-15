from flask import Flask 
from routes.usuarios import usuarios_bp
 
app = Flask(__name__)

app.register_blueprint(usuarios_bp)

if __name__ == "__main__":
    app.run(debug=True)