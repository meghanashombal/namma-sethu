from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session
)

from datetime import datetime, timedelta

import mysql.connector
import uuid

from config import Config
from services.routing import route_complaint


complaints_bp = Blueprint(
    "complaints",
    __name__
)


def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )


# -------------------------------------------------------------
# REPORT COMPLAINT
# -------------------------------------------------------------

@complaints_bp.route(
    "/report",
    methods=["GET", "POST"]
)
def report():

    # ---------------------------------------------------------
    # LOGIN CHECK
    # ---------------------------------------------------------

    if "user_id" not in session:

        flash(
            "Please log in before submitting a complaint.",
            "warning"
        )

        return redirect(
            url_for("auth.login")
        )


    # ---------------------------------------------------------
    # SHOW REPORT PAGE
    # ---------------------------------------------------------

    if request.method == "GET":

        return render_template(
            "report.html"
        )


    # ---------------------------------------------------------
    # GET FORM DATA
    # ---------------------------------------------------------

    issue_type = request.form.get(
        "issue_type",
        ""
    ).strip()

    description = request.form.get(
        "description",
        ""
    ).strip()

    location_text = request.form.get(
        "location_text",
        ""
    ).strip()

    latitude = request.form.get(
        "latitude"
    ) or None

    longitude = request.form.get(
        "longitude"
    ) or None


    # ---------------------------------------------------------
    # VALIDATION
    # ---------------------------------------------------------

    if not issue_type or not description:

        flash(
            "Issue type and description are required.",
            "danger"
        )

        return redirect(
            url_for("complaints.report")
        )


    # ---------------------------------------------------------
    # GENERATE TRACKING INFORMATION
    # ---------------------------------------------------------

    complaint_code = (
        f"NS-{uuid.uuid4().hex[:8].upper()}"
    )

    tracking_token = uuid.uuid4().hex


    connection = None
    cursor = None


    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # -----------------------------------------------------
        # STEP 1: AUTOMATIC ROUTING
        # -----------------------------------------------------

        routing_result = route_complaint(
            issue_type
        )

        department_name = routing_result[
            "department"
        ]

        routing_explanation = routing_result[
            "explanation"
        ]

        routing_success = routing_result[
            "success"
        ]


        # -----------------------------------------------------
        # STEP 2: GET ACTIVE SLA RULE
        # -----------------------------------------------------

        cursor.execute(
            """
            SELECT
                routing_hours,
                resolution_hours
            FROM sla_rules
            WHERE
                rule_status = 'ACTIVE'
                AND priority = 'MEDIUM'
                AND (
                    issue_type = %s
                    OR issue_type = 'ALL'
                )
            ORDER BY
                CASE
                    WHEN issue_type = %s THEN 0
                    ELSE 1
                END
            LIMIT 1
            """,
            (
                issue_type.upper(),
                issue_type.upper()
            )
        )

        sla_rule = cursor.fetchone()


        # -----------------------------------------------------
        # STEP 3: CALCULATE SLA DEADLINES
        # -----------------------------------------------------

        now = datetime.now()

        if sla_rule:

            routing_hours = (
                sla_rule["routing_hours"]
            )

            resolution_hours = (
                sla_rule["resolution_hours"]
            )

        else:

            # Safe fallback if no SLA rule is found
            routing_hours = 24
            resolution_hours = 72


        routing_deadline = (
            now + timedelta(
                hours=routing_hours
            )
        )

        resolution_deadline = (
            now + timedelta(
                hours=resolution_hours
            )
        )


        # -----------------------------------------------------
        # STEP 4: CREATE COMPLAINT
        # -----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO complaints (
                complaint_code,
                user_id,
                issue_type,
                description,
                latitude,
                longitude,
                location_text,
                priority,
                status,
                routing_deadline,
                resolution_deadline,
                tracking_token
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'MEDIUM',
                'SUBMITTED',
                %s,
                %s,
                %s
            )
            """,
            (
                complaint_code,
                session["user_id"],
                issue_type,
                description,
                latitude,
                longitude,
                location_text,
                routing_deadline,
                resolution_deadline,
                tracking_token
            )
        )


        # Get newly created complaint ID
        complaint_id = cursor.lastrowid


        # -----------------------------------------------------
        # STEP 5: CREATE INITIAL STATUS HISTORY
        # -----------------------------------------------------

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
                NULL,
                'SUBMITTED',
                %s,
                %s
            )
            """,
            (
                complaint_id,
                session["user_id"],
                "Complaint submitted successfully."
            )
        )


        # -----------------------------------------------------
        # STEP 6: SAVE ROUTING DECISION
        # -----------------------------------------------------

        routing_status = (
            "ROUTED"
            if routing_success
            else "MANUAL_REVIEW"
        )

        cursor.execute(
            """
            INSERT INTO routing_decisions (
                complaint_id,
                detected_issue_type,
                explanation,
                decision_status
            )
            VALUES (
                %s,
                %s,
                %s,
                %s
            )
            """,
            (
                complaint_id,
                issue_type.upper(),
                (
                    f"{department_name}. "
                    f"{routing_explanation}"
                ),
                routing_status
            )
        )


        # -----------------------------------------------------
        # STEP 7: UPDATE STATUS AFTER SUCCESSFUL ROUTING
        # -----------------------------------------------------

        if routing_success:

            cursor.execute(
                """
                UPDATE complaints
                SET
                    status = 'ROUTED',
                    updated_at = CURRENT_TIMESTAMP
                WHERE complaint_id = %s
                """,
                (
                    complaint_id,
                )
            )


            # Add routing event to status history
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
                    'SUBMITTED',
                    'ROUTED',
                    %s,
                    %s
                )
                """,
                (
                    complaint_id,
                    session["user_id"],
                    (
                        f"Complaint automatically routed to "
                        f"{department_name}. "
                        f"{routing_explanation}"
                    )
                )
            )


        # -----------------------------------------------------
        # STEP 8: SAVE EVERYTHING
        # -----------------------------------------------------

        connection.commit()


        # -----------------------------------------------------
        # SUCCESS MESSAGE
        # -----------------------------------------------------

        if routing_success:

            flash(
                f"Complaint submitted successfully. "
                f"Tracking ID: {complaint_code}. "
                f"Automatically routed to "
                f"{department_name}. "
                f"Routing deadline: "
                f"{routing_deadline.strftime('%Y-%m-%d %H:%M:%S')}.",
                "success"
            )

        else:

            flash(
                f"Complaint submitted successfully. "
                f"Tracking ID: {complaint_code}. "
                f"Manual review is required. "
                f"Routing deadline: "
                f"{routing_deadline.strftime('%Y-%m-%d %H:%M:%S')}.",
                "warning"
            )


        return redirect(
            url_for("complaints.report")
        )


    except mysql.connector.Error:

        if connection:

            connection.rollback()


        flash(
            "There was a database error while submitting "
            "your complaint.",
            "danger"
        )


        return redirect(
            url_for("complaints.report")
        )


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# -------------------------------------------------------------
# MY COMPLAINTS
# -------------------------------------------------------------

@complaints_bp.route(
    "/my-complaints"
)
def my_complaints():

    if "user_id" not in session:

        flash(
            "Please log in to view your complaints.",
            "warning"
        )

        return redirect(
            url_for("auth.login")
        )


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
                routing_deadline,
                resolution_deadline,
                created_at,
                updated_at
            FROM complaints
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (
                session["user_id"],
            )
        )


        complaints = cursor.fetchall()


        return render_template(
            "my_complaints.html",
            complaints=complaints
        )


    except mysql.connector.Error:

        flash(
            "Unable to load your complaints right now.",
            "danger"
        )

        return redirect(
            url_for("home")
        )


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()