from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.connection import get_connection
from datetime import date

progress_bp = Blueprint("progress", __name__)

@progress_bp.route("/progress", methods=["POST"])
@jwt_required()
def create_progress():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or "habit_id" not in data:
        return jsonify({"message": "Falta habit_id"}), 400

    habit_id = data["habit_id"]
    today = date.today()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    #Verificar que el hábito pertenece al usuario
    cursor.execute("""
        SELECT id_habito FROM Habito
        WHERE id_habito = %s AND id_usuario = %s
    """, (habit_id, user_id))

    habit = cursor.fetchone()

    if not habit:
        return jsonify({"message": "Hábito no encontrado o no autorizado"}), 404

    #2. Insertar progreso
    try:
        cursor.execute("""
            INSERT INTO RegistroProgreso (id_habito, fecha, completado)
            VALUES (%s, %s, %s)
        """, (habit_id, today, True))

        conn.commit()

    except Exception as e:
        # Manejar duplicado (ya marcado hoy)
        if "Duplicate entry" in str(e):
            return jsonify({"message": "Ya marcado para hoy"}), 400

        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"message": "Progreso registrado"}), 201

@progress_bp.route("/progress/<int:habit_id>", methods=["GET"])
@jwt_required()
def get_progress(habit_id):
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    #Verificar que el hábito pertenece al usuario
    cursor.execute("""
        SELECT id_habito FROM Habito
        WHERE id_habito = %s AND id_usuario = %s
    """, (habit_id, user_id))

    habit = cursor.fetchone()

    if not habit:
        return jsonify({"message": "Hábito no encontrado o no autorizado"}), 404

    #Obtener progreso
    cursor.execute("""
        SELECT fecha, completado
        FROM RegistroProgreso
        WHERE id_habito = %s
        ORDER BY fecha DESC
    """, (habit_id,))

    progress = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(progress)

@progress_bp.route("/progress", methods=["GET"])
@jwt_required()
def get_all_progress():
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT h.nombre, rp.fecha, rp.completado
        FROM RegistroProgreso rp
        JOIN Habito h ON rp.id_habito = h.id_habito
        WHERE h.id_usuario = %s
        ORDER BY rp.fecha DESC
    """, (user_id,))

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

@progress_bp.route("/habits/<int:habit_id>/streak", methods=["GET"])
@jwt_required()
def get_streak(habit_id):
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    #Verificar que el hábito es del usuario
    cursor.execute("""
        SELECT id_habito FROM Habito
        WHERE id_habito = %s AND id_usuario = %s
    """, (habit_id, user_id))

    habit = cursor.fetchone()

    if not habit:
        return jsonify({"message": "Hábito no encontrado o no autorizado"}), 404

    #Obtener fechas ordenadas DESC
    cursor.execute("""
        SELECT fecha
        FROM RegistroProgreso
        WHERE id_habito = %s AND completado = TRUE
        ORDER BY fecha DESC
    """, (habit_id,))

    fechas = cursor.fetchall()

    cursor.close()
    conn.close()

    #Calcular streak
    from datetime import date, timedelta

    streak = 0
    today = date.today()

    for i, row in enumerate(fechas):
        expected_date = today - timedelta(days=i)

        if row["fecha"] == expected_date:
            streak += 1
        else:
            break

    return jsonify({"streak": streak})