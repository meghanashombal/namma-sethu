from flask import Flask, jsonify, render_template
from config import Config

# Import application routes
from routes.auth import auth_bp
from routes.complaints import complaints_bp
from routes.tracking import tracking_bp
from routes.staff import staff_bp

# Import SLA service
from services.sla import check_sla_breaches

import os


# ---------------------------------------------------------
# CREATE FLASK APPLICATION
# ---------------------------------------------------------

app = Flask(__name__)

# Load configuration
app.config.from_object(Config)


# ---------------------------------------------------------
# CREATE UPLOADS FOLDER
# ---------------------------------------------------------

os.makedirs(
    app.config["UPLOAD_FOLDER"],
    exist_ok=True
)


# ---------------------------------------------------------
# REGISTER BLUEPRINTS
# ---------------------------------------------------------

# Authentication routes
app.register_blueprint(auth_bp)

# Citizen complaint routes
app.register_blueprint(complaints_bp)

# Complaint tracking routes
app.register_blueprint(tracking_bp)

# Staff dashboard routes
app.register_blueprint(staff_bp)


# ---------------------------------------------------------
# HOME PAGE
# ---------------------------------------------------------

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


# ---------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------

@app.route("/health")
def health():

    return jsonify({
        "status": "ok",
        "project": "Namma Sethu"
    })


# ---------------------------------------------------------
# SLA CHECK
# ---------------------------------------------------------

@app.route("/admin/check-sla")
def check_sla():

    result = check_sla_breaches()

    return jsonify(result)


# ---------------------------------------------------------
# RUN APPLICATION
# ---------------------------------------------------------

if __name__ == "__main__":

    app.run(
        debug=True
    )