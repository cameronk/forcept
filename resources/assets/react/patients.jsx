/**
 * patients.jsx
 */

var PatientsTable = React.createClass({

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
                            <Fields.Resource
                                id={resourceObj[0]}
                                resource={{ type: "image/jpeg" }}
                                className="thumbnail" />
                        );
                    }
                } else {
                    photo = "No photo";
                }

                var visitLabel = (
                    <em>Checked out</em>
                ),
                    visitsCount = thisPatient.visits.length;

                if(visitsCount > 0) {
                    if(thisPatient.hasOwnProperty("visit") && thisPatient.visit !== null) {
                        visitLabel = (
                            <a href={["/visits/stage/", thisPatient.visit.stage, "/handle/", thisPatient.visit.id].join("")}>
                                <h4>
                                    <span className="label label-success">
                                        {thisPatient.visit.id} &raquo;
                                    </span>
                                </h4>
                            </a>
                        );
                    }
                }

                return (
                    <tr>
                        <td width={200}>
                            {photo}
                        </td>
                        <td>
                            <h4>
                                <span className="label label-default">{thisPatient.id}</span>
                            </h4>
                        </td>
                        <td>
                            {Utilities.getFullName(thisPatient)}
                        </td>
                        <td>
                            {thisPatient.visits.length}
                        </td>
                        <td>
                            {visitLabel}
                        </td>
                        <td>
                            {thisPatient.created_at}
                        </td>
                        <td>
                            {thisPatient.updated_at}
                        </td>
                    </tr>
                );
            }.bind(this));
        }

        return (
            <div className="p-t">
                <h1>Patients ({patientsCount})</h1>
                <fieldset className="fieldset">
                    <div className="row">
                        <div className="col-xs-12 col-sm-4">
                            <div className="input-group">
                                <input type="text" className="form-control" placeholder="Search by first or last name..." onChange={this.handleSearchNameChange} />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button" onMouseUp={this.handleDoSearch.bind(this, "name")}>
                                        Search
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-4">
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="Search by Forcept ID..." min="100000" onChange={this.handleSearchForceptIDChange} />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button" onMouseUp={this.handleDoSearch.bind(this, "forceptID")}>
                                        Search
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-4">
                            <div className="input-group">
                                <input type="number" className="form-control" placeholder="Search by field number..." />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" type="button">
                                        Search
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </fieldset>
                <div className="row">
                    <div className="col-xs-12 table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>
                                        Photo
                                    </th>
                                    <th>
                                        ID
                                    </th>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Visits
                                    </th>
                                    <th>
                                        Location
                                    </th>
                                    <th>
                                        Created at
                                    </th>
                                    <th>
                                        Last updated
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});
