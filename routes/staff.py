from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    session,
    request
)

import mysql.connector
from config import Config


staff_bp = Blueprint(
    "staff",
    __name__,
    url_prefix="/staff"
)


# ---------------------------------------------------------
# DATABASE CONNECTION
# ---------------------------------------------------------

def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


# ---------------------------------------------------------
# STAFF AUTHORIZATION
# ---------------------------------------------------------

def staff_required():
    """
    Allow only STAFF and ADMIN users.
    """

    if "user_id" not in session:

        flash(
            "Please log in to access the staff dashboard.",
            "warning"
        )

        return False

    if session.get("user_role") not in ["STAFF", "ADMIN"]:

        flash(
            "You do not have permission to access the staff dashboard.",
            "danger"
        )

        return False

    return True


# ---------------------------------------------------------
# STAFF DASHBOARD
# ---------------------------------------------------------

@staff_bp.route("/dashboard")
def dashboard():

    if not staff_required():
        return redirect(url_for("auth.login"))

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT
                complaint_id,
                complaint_code,
                issue_type,
                description,
                location_text,
                priority,
                status,
                created_at,
                updated_at
            FROM complaints
            ORDER BY created_at DESC
            """
        )

        complaints = cursor.fetchall()

        return render_template(
            "staff_dashboard.html",
            complaints=complaints
        )

    except mysql.connector.Error:

        flash(
            "Unable to load complaints right now.",
            "danger"
        )

        return redirect(url_for("home"))

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ---------------------------------------------------------
# UPDATE COMPLAINT STATUS
# ---------------------------------------------------------

@staff_bp.route(
    "/complaint/<int:complaint_id>/status",
    methods=["POST"]
)
def update_status(complaint_id):

    if not staff_required():
        return redirect(url_for("auth.login"))

    new_status = request.form.get(
        "status",
        ""
    ).strip().upper()

    note = request.form.get(
        "note",
        ""
    ).strip()


    # -----------------------------------------------------
    # VALID STATUS VALUES
    # -----------------------------------------------------

    allowed_statuses = [
        "SUBMITTED",
        "CHECKING_LOCATION",
        "MANUAL_REVIEW",
        "ROUTED",
        "ACKNOWLEDGED",
        "ASSIGNED",
        "IN_PROGRESS",
        "SLA_BREACHED",
        "RESOLVED",
        "REOPENED",
        "CLOSED"
    ]


    if new_status not in allowed_statuses:

        flash(
            "Invalid complaint status selected.",
            "danger"
        )

        return redirect(
            url_for(
                "staff.dashboard"
            )
        )


    connection = None
    cursor = None


    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # -------------------------------------------------
        # GET CURRENT COMPLAINT
        # -------------------------------------------------

        cursor.execute(
            """
            SELECT
                complaint_id,
                complaint_code,
                status
            FROM complaints
            WHERE complaint_id = %s
            """,
            (complaint_id,)
        )

        complaint = cursor.fetchone()


        if not complaint:

            flash(
                "Complaint not found.",
                "danger"
            )

            return redirect(
                url_for(
                    "staff.dashboard"
                )
            )


        old_status = complaint["status"]


        # -------------------------------------------------
        # CHECK WHETHER STATUS ACTUALLY CHANGED
        # -------------------------------------------------

        if old_status == new_status:

            flash(
                "The complaint is already in this status.",
                "warning"
            )

            return redirect(
                url_for(
                    "staff.dashboard"
                )
            )


        # -------------------------------------------------
        # UPDATE COMPLAINT
        # -------------------------------------------------

        cursor.execute(
            """
            UPDATE complaints
            SET
                status = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE complaint_id = %s
            """,
            (
                new_status,
                complaint_id
            )
        )


        # -------------------------------------------------
        # SAVE STATUS HISTORY
        # -------------------------------------------------

        history_note = note

        if not history_note:

            history_note = (
                f"Status changed from "
                f"{old_status} to {new_status}."
            )


        cursor.execute(
            """
            INSERT INTO complaint_status_history (
                complaint_id,
                old_status,
                new_status,
                changed_by,
                note
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                complaint_id,
                old_status,
                new_status,
                session["user_id"],
                history_note
            )
        )


        # -------------------------------------------------
        # SAVE BOTH OPERATIONS TOGETHER
        # -------------------------------------------------

        connection.commit()


        flash(
            f"Complaint {complaint['complaint_code']} "
            f"updated successfully to {new_status}.",
            "success"
        )


        return redirect(
            url_for(
                "staff.dashboard"
            )
        )


    except mysql.connector.Error:

        if connection:
            connection.rollback()


        flash(
            "There was a database error while updating "
            "the complaint.",
            "danger"
        )


        return redirect(
            url_for(
                "staff.dashboard"
            )
        )


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()