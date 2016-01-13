/**
 * patients.jsx
 */

var PatientsTable = React.createClass({displayName: "PatientsTable",

    getInitialState: function() {
        return {
            patients: {},

            name: "",
            forceptID: "",
            fieldNumber: ""
        };
    },

    componentWillMount: function() {
        this.getPatients();
    },

    getPatients: function(endpt, method, constraints) {
        endpt = endpt || "fetch";
        var type = (endpt === "fetch" ? "GET" : "POST");
        method = method || "";
        constraints = constraints || {};

        constraints._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

        $.ajax({
            type: type,
            url: "/patients/" + endpt + "/" + method,
            data: constraints,
            success: function(resp) {

                var patients = resp.patients;
                var patientKeys = Object.keys(patients);

                for(var i = 0; i < patientKeys.length; i++) {
                    patients[patientKeys[i]] = Utilities.applyGeneratedFields(patients[patientKeys[i]]);
                }

                this.setState({
                    patients: patients
                });
            }.bind(this)
        });
    },

    handleSearchNameChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            name: value
        });
    },

    handleSearchForceptIDChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            forceptID: value
        });
    },

    handleDoSearch: function(type) {
        console.log("handleDoSearch");
        this.getPatients("search", "", {
            by: type,
            for: this.state[type]
        });
    },

    render: function() {
        var patientRows;

        var patients = this.state.patients,
            patientIDs = Object.keys(patients),
            patientsCount = patientIDs.length;

        if(patientsCount > 0) {
            patientRows = patientIDs.map(function(patientID, index) {
                var thisPatient = patients[patientID];

                var photo;
                if(thisPatient.hasOwnProperty('photo') && thisPatient.photo !== null) {
                    var resourceObj = [];
                    try {
                        resourceObj = JSON.parse(thisPatient.photo);
                    } catch(e) {
                        console.log("could not parse patient photo");
                    }
                    if(resourceObj.length > 0) {
                        photo = (
                            React.createElement(Fields.Resource, {
                                id: resourceObj[0], 
                                resource: { type: "image/jpeg"}, 
                                className: "thumbnail"})
                        );
                    }
                } else {
                    photo = "No photo";
                }

                var visitLabel = (
                    React.createElement("em", null, "Checked out")
                ),
                    visitsCount = thisPatient.visits.length;

                if(visitsCount > 0) {
                    if(thisPatient.hasOwnProperty("visit") && thisPatient.visit !== null) {
                        visitLabel = (
                            React.createElement("a", {href: ["/visits/stage/", thisPatient.visit.stage, "/handle/", thisPatient.visit.id].join("")}, 
                                React.createElement("h4", null, 
                                    React.createElement("span", {className: "label label-success"}, 
                                        thisPatient.visit.id, " »"
                                    )
                                )
                            )
                        );
                    }
                }

                return (
                    React.createElement("tr", null, 
                        React.createElement("td", {width: 200}, 
                            photo
                        ), 
                        React.createElement("td", null, 
                            React.createElement("h4", null, 
                                React.createElement("span", {className: "label label-default"}, thisPatient.id)
                            )
                        ), 
                        React.createElement("td", null, 
                            Utilities.getFullName(thisPatient)
                        ), 
                        React.createElement("td", null, 
                            thisPatient.visits.length
                        ), 
                        React.createElement("td", null, 
                            visitLabel
                        ), 
                        React.createElement("td", null, 
                            thisPatient.created_at
                        ), 
                        React.createElement("td", null, 
                            thisPatient.updated_at
                        )
                    )
                );
            }.bind(this));
        }

        return (
            React.createElement("div", {className: "p-t"}, 
                React.createElement("h1", null, "Patients (", patientsCount, ")"), 
                React.createElement("fieldset", {className: "fieldset"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "text", className: "form-control", placeholder: "Search by first or last name...", onChange: this.handleSearchNameChange}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button", onMouseUp: this.handleDoSearch.bind(this, "name")}, 
                                        "Search"
                                    )
                                )
                            )
                        ), 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "number", className: "form-control", placeholder: "Search by Forcept ID...", min: "100000", onChange: this.handleSearchForceptIDChange}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button", onMouseUp: this.handleDoSearch.bind(this, "forceptID")}, 
                                        "Search"
                                    )
                                )
                            )
                        ), 
                        React.createElement("div", {className: "col-xs-12 col-sm-4"}, 
                            React.createElement("div", {className: "input-group"}, 
                                React.createElement("input", {type: "number", className: "form-control", placeholder: "Search by field number..."}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-primary", type: "button"}, 
                                        "Search"
                                    )
                                )
                            )
                        )
                    )
                ), 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-xs-12 table-responsive"}, 
                        React.createElement("table", {className: "table table-striped"}, 
                            React.createElement("thead", null, 
                                React.createElement("tr", null, 
                                    React.createElement("th", null, 
                                        "Photo"
                                    ), 
                                    React.createElement("th", null, 
                                        "ID"
                                    ), 
                                    React.createElement("th", null, 
                                        "Name"
                                    ), 
                                    React.createElement("th", null, 
                                        "Visits"
                                    ), 
                                    React.createElement("th", null, 
                                        "Location"
                                    ), 
                                    React.createElement("th", null, 
                                        "Created at"
                                    ), 
                                    React.createElement("th", null, 
                                        "Last updated"
                                    )
                                )
                            ), 
                            React.createElement("tbody", null, 
                                patientRows
                            )
                        )
                    )
                )
            )
        );
    }
});
