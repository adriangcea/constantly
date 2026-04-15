from flask import Blueprint, jsonify, request
from db.conexion import get_connection
import bcrypt

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/usuarios", methods=["GET"])
def obtener_usuarios():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Usuario")
    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(result)


@usuarios_bp.route("/usuarios", methods=["POST"])
def crear_usuario():
    data = request.json

    if not data or not all(k in data for k in ("nombre", "email", "contraseña")):
        return jsonify({"error": "Faltan datos"}), 400

    nombre = data["nombre"]
    email = data["email"]
    contraseña = data["contraseña"]

    password_bytes = contraseña.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO Usuario (nombre, email, password_hash, fecha_registro, rol, estado)
    VALUES (%s, %s, %s, NOW(), 'user', 'activo')
    """

    try:
        cursor.execute(query, (nombre, email, hashed_password))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Usuario creado correctamente"})