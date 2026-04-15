from flask import Blueprint, jsonify, request
from db.conexion import get_connection
import bcrypt

usuarios_bp = Blueprint("usuarios", __name__)

@usuarios_bp.route("/usuarios", methods=["GET"])
def obtener_usuarios():
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


@usuarios_bp.route("/usuarios/<int:id>", methods=["GET"])
def obtener_usuario(id):
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


@usuarios_bp.route("/usuarios/<int:id>", methods=["PUT"])
def actualizar_usuario(id):
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


@usuarios_bp.route("/usuarios/<int:id>", methods=["DELETE"])
def eliminar_usuario(id):
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