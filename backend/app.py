from flask import Flask 
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.users import users_bp
from routes.auth import auth_bp
from routes.habits import habits_bp 
from routes.progress import progress_bp

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "super-secret-key"
jwt = JWTManager(app) 

CORS(app)

app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(habits_bp)  
app.register_blueprint(progress_bp) 

if __name__ == "__main__":
    app.run(debug=True)