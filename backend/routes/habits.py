from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.connection import get_connection

habits_bp = Blueprint("habits", __name__)

@habits_bp.route("/habits", methods=["POST"])
@jwt_required()
def create_habit():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validación
    if not data or not all(k in data for k in ("name", "frequency")):
        return jsonify({"mensaje": "Datos incompletos"}), 400

    name = data["name"]
    description = data.get("description", "")
    frequency = data["frequency"]

    # Validar ENUM
    if frequency not in ["diaria", "semanal", "mensual"]:
        return jsonify({"mensaje": "Frecuencia inválida"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO Habito (id_usuario, nombre, descripcion, frecuencia)
        VALUES (%s, %s, %s, %s)
    """

    try:
        cursor.execute(query, (user_id, name, description, frequency))
        conn.commit()
    except Exception as e:
        return jsonify({"mensaje": "Error al crear el hábito"}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Hábito creado exitosamente"}), 201

@habits_bp.route("/habits", methods=["GET"])
@jwt_required()
def get_habits():
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT id_habito, nombre, descripcion, frecuencia, fecha_creacion, activo
        FROM Habito
        WHERE id_usuario = %s
    """

    cursor.execute(query, (user_id,))
    habits = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(habits)