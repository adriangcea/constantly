from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.connection import get_connection

habits_bp = Blueprint("habits", __name__)

@habits_bp.route("/habits", methods=["POST"])
@jwt_required()
def create_habit():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not all(k in data for k in ("nombre", "frecuencia")):
        return jsonify({"mensaje": "Datos incompletos"}), 400

    name = data["nombre"]
    description = data.get("descripcion", "")
    frequency = data["frecuencia"]

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

    for habit in habits:
        if habit.get("fecha_creacion"):
            habit["fecha_creacion"] = habit["fecha_creacion"].isoformat()

    return jsonify(habits)


@habits_bp.route("/habits/<int:habit_id>", methods=["PUT"])
@jwt_required()
def update_habit(habit_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"mensaje": "No se enviaron datos"}), 400

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verificar que el hábito pertenece al usuario
    cursor.execute("""
        SELECT id_habito FROM Habito
        WHERE id_habito = %s AND id_usuario = %s
    """, (habit_id, user_id))

    habit = cursor.fetchone()

    if not habit:
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Hábito no encontrado o no autorizado"}), 404

    # Construir query dinámicamente
    campos = []
    valores = []

    if "nombre" in data:
        campos.append("nombre = %s")
        valores.append(data["nombre"])

    if "descripcion" in data:
        campos.append("descripcion = %s")
        valores.append(data["descripcion"])

    if "frecuencia" in data:
        if data["frecuencia"] not in ["diaria", "semanal", "mensual"]:
            cursor.close()
            conn.close()
            return jsonify({"mensaje": "Frecuencia inválida"}), 400
        campos.append("frecuencia = %s")
        valores.append(data["frecuencia"])

    if not campos:
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "No hay campos para actualizar"}), 400

    valores.append(habit_id)

    try:
        cursor.execute(f"""
            UPDATE Habito SET {', '.join(campos)}
            WHERE id_habito = %s
        """, tuple(valores))
        conn.commit()
    except Exception as e:
        return jsonify({"mensaje": "Error al actualizar el hábito"}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Hábito actualizado correctamente"})


@habits_bp.route("/habits/<int:habit_id>", methods=["DELETE"])
@jwt_required()
def delete_habit(habit_id):
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Verificar que el hábito pertenece al usuario
    cursor.execute("""
        SELECT id_habito FROM Habito
        WHERE id_habito = %s AND id_usuario = %s
    """, (habit_id, user_id))

    habit = cursor.fetchone()

    if not habit:
        cursor.close()
        conn.close()
        return jsonify({"mensaje": "Hábito no encontrado o no autorizado"}), 404

    try:
        # Primero eliminar el progreso asociado
        cursor.execute("DELETE FROM RegistroProgreso WHERE id_habito = %s", (habit_id,))
        # Luego el hábito
        cursor.execute("DELETE FROM Habito WHERE id_habito = %s", (habit_id,))
        conn.commit()
    except Exception as e:
        return jsonify({"mensaje": "Error al eliminar el hábito"}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Hábito eliminado correctamente"})
