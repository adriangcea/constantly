from flask import Flask, jsonify, request
from db.conexion import get_connection

app = Flask(__name__)

@app.route("/usuarios", methods=["GET"])
def usuarios():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Usuario")
    result = cursor.fetchall()

    conn.close()
    return jsonify(result)


@app.route("/usuarios", methods=["POST"])
def crear_usuario():
    data = request.json

    nombre = data["nombre"]
    email = data["email"]
    contraseña = data["contraseña"]

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO Usuario (nombre, email, contraseña, fecha_registro, rol, estado)
    VALUES (%s, %s, %s, NOW(), 'user', 'activo')
    """

    cursor.execute(query, (nombre, email, contraseña))
    conn.commit()

    conn.close()

    return jsonify({"mensaje": "Usuario creado correctamente"})
    

if __name__ == "__main__":
    app.run(debug=True)