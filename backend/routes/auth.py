from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from utils.auth import check_password
from db.connection import get_connection
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Usuario WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user or not check_password(password, user['password_hash']):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    token = create_access_token(
        identity=str(user['id_usuario']),
        expires_delta=timedelta(hours=5)
    )

    return jsonify({
        "access_token": token,
        "user": {
            "id": user['id_usuario'],
            "email": user['email'],
            "nombre": user['nombre']
        }
    })