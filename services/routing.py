def route_complaint(issue_type):
    """
    Identify the department responsible for a complaint.
    """

    issue_type = issue_type.strip().upper()

    routing_map = {

        "DRAINAGE": {
            "department": "Drainage Department",
            "explanation": (
                "Drainage-related complaints are handled "
                "by the drainage department."
            )
        },

        "GARBAGE": {
            "department": "Waste Management Department",
            "explanation": (
                "Garbage and waste-related complaints are "
                "handled by the waste management department."
            )
        },

        "STREETLIGHT": {
            "department": "Street Lighting Department",
            "explanation": (
                "Streetlight complaints are handled by "
                "the street lighting department."
            )
        },

        "ROAD": {
            "department": "Road Maintenance Department",
            "explanation": (
                "Road-related complaints are handled by "
                "the road maintenance department."
            )
        },

        "WATER": {
            "department": "Water Supply Department",
            "explanation": (
                "Water-related complaints are handled by "
                "the water supply department."
            )
        },

        "SEWERAGE": {
            "department": "Sewerage Department",
            "explanation": (
                "Sewerage complaints are handled by "
                "the sewerage department."
            )
        },

        "PARK": {
            "department": "Parks and Horticulture Department",
            "explanation": (
                "Park-related complaints are handled by "
                "the parks and horticulture department."
            )
        },

        "TRAFFIC": {
            "department": "Traffic Department",
            "explanation": (
                "Traffic-related complaints are handled by "
                "the traffic department."
            )
        }
    }

    result = routing_map.get(issue_type)

    if result:
        return {
            "success": True,
            "department": result["department"],
            "explanation": result["explanation"]
        }

    return {
        "success": False,
        "department": "Manual Review",
        "explanation": (
            "The complaint type could not be automatically "
            "identified. Manual review is required."
        )
    }