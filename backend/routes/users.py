from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from db.connection import get_connection
import bcrypt

users_bp = Blueprint("users", __name__)

@users_bp.route('/users/me', methods=['GET'])
@jwt_required()
def get_my_user():
    user_id = get_jwt_identity()

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id_usuario, nombre, email FROM Usuario WHERE id_usuario = %s",
        (user_id,)
    )

    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(user)

@users_bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT id_usuario, nombre, email, fecha_registro, rol, estado
        FROM Usuario    
    """)
    usuarios = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(usuarios)


@users_bp.route("/users/<int:id>", methods=["GET"])
@jwt_required()
def get_user_by_id(id):
    user_id = get_jwt_identity()

    if user_id != id:
        return jsonify({"error": "No tienes permiso para ver este usuario"}), 403

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT id_usuario, nombre, email, fecha_registro, rol, estado
    FROM Usuario
    WHERE id_usuario = %s
    """
    cursor.execute(query, (id,))

    usuario = cursor.fetchone()

    cursor.close()
    conn.close()

    #Si no existe el usuario
    if usuario is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify(usuario)


@users_bp.route("/users", methods=["POST"])
def create_user():
    data = request.json

    if not data or not all(k in data for k in ("nombre", "email", "password")):
        return jsonify({"error": "Faltan datos"}), 400

    nombre = data["nombre"]
    email = data["email"]
    contraseña = data["password"]

    password_bytes = contraseña.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

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


@users_bp.route("/users/<int:id>", methods=["PUT"])
@jwt_required()
def update_user(id):
    user_id = get_jwt_identity()

    if user_id != id:
        return jsonify({"error": "No tienes permiso para actualizar este usuario"}), 403

    data = request.json

    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    # Comprobar si el usuario existe
    cursor.execute("SELECT id_usuario FROM Usuario WHERE id_usuario = %s", (id,))
    usuario = cursor.fetchone()

    if not usuario:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Construir query dinámicamente
    campos = []
    valores = []

    if "nombre" in data:
        campos.append("nombre = %s")
        valores.append(data["nombre"])

    if "email" in data:
        campos.append("email = %s")
        valores.append(data["email"])

    if "contraseña" in data:
        import bcrypt
        password_bytes = data["contraseña"].encode('utf-8')
        hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

        campos.append("password_hash = %s")
        valores.append(hashed_password)

    #  Si no hay campos para actualizar
    if not campos:
        cursor.close()
        conn.close()
        return jsonify({"error": "No hay campos para actualizar"}), 400

    query = f"""
    UPDATE Usuario
    SET {', '.join(campos)}
    WHERE id_usuario = %s
    """

    valores.append(id)

    try:
        cursor.execute(query, tuple(valores))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Usuario actualizado correctamente"})


@users_bp.route("/users/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    user_id = get_jwt_identity()

    if user_id != id:
        return jsonify({"error": "No tienes permiso para eliminar este usuario"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    # 1. Comprobar si existe
    cursor.execute("SELECT id_usuario FROM Usuario WHERE id_usuario = %s", (id,))
    usuario = cursor.fetchone()

    if not usuario:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuario no encontrado"}), 404

    # 2. Eliminar usuario
    try:
        cursor.execute("DELETE FROM Usuario WHERE id_usuario = %s", (id,))
        conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    cursor.close()
    conn.close()

    return jsonify({"mensaje": "Usuario eliminado correctamente"})