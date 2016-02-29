/**
 * patients/Table.jsx
 * @author Cameron Kelley
 *
 * Searchable patients table.
 */

Patients.Table = React.createClass({

    /*
     *
     */
    getInitialState: function() {
        return {
            patients: {},

            isFetching: false,

            name: "",
            forceptID: "",
            fieldNumber: ""
        };
    },

    /*
     *
     */
    componentWillMount: function() {
        var props = this.props;
        if(props.hasOwnProperty("preload") && props.preload === true) {
            this.getPatients();
        }
    },

    /*
     *
     */
    getPatients: function(endpt, method, constraints) {

        endpt = endpt || "fetch";
        var type = (endpt === "fetch" ? "GET" : "POST");
        method = method || "";
        constraints = constraints || {};
        constraints._token = document.querySelector("meta[name='csrf-token']").getAttribute('value');

        this.setState({
            isFetching: true
        });

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
                    isFetching: false,
                    patients: patients
                });
            }.bind(this),
            error: function(xhr) {

				/*
				 * Abort request modal
				 */
				Request.abort(xhr, function() {

					this.setState({
						isFetching: false
					});

				}.bind(this));

            }.bind(this)
        });
    },

    /*
     *
     */
    handleSearchNameChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            name: value
        });
    },

    /*
     *
     */
    handleSearchForceptIDChange: function(event) {
        var value = event.target.value;
        if(value.length == 0) {
            this.getPatients();
        }

        this.setState({
            forceptID: value
        });
    },

    /*
     *
     */
    handleDoSearch: function(type) {
        console.log("handleDoSearch");
        this.getPatients("search", "", {
            by: type,
            for: this.state[type]
        });
    },

    /*
     *
     */
    render: function() {

        var patientRows, messageRow,
            props = this.props,
            state = this.state,
            patients = this.state.patients,
            patientIDs = Object.keys(patients),
            patientsCount = patientIDs.length,
            excludePatients = ((props.hasOwnProperty("exclude") && Array.isArray(props.exclude)) ? props.exclude : []);

        /*
         * If we're fetching, show a loading message.
         */
        if(state.isFetching) {
            messageRow = (
                <tr>
                    <td colSpan={8}>
						<div className="row p-t" id="page-header-message-block">
							<div className="col-xs-2 text-xs-right hidden-sm-down">
								<img src="/assets/img/loading.gif" />
							</div>
							<div className="col-xs-10 p-t">
								<h2>
                                    <span className="fa fa-circle-o-notch fa-spin hidden-md-up"></span> Fetching patients...
                                </h2>
							</div>
						</div>
                    </td>
                </tr>
            );
        } else if(patientsCount > 0) {

            var alreadyInAVisitCount = 0;
            var excludedCount = 0;

            console.log("Excluding %O", excludePatients);

            /*
             * Render patient rows.
             */
            patientRows = patientIDs.map(function(patientIndex, index) {

                var thisPatient = patients[patientIndex];

                /*
                 * Hide patient if ID is found in
                 * excludePatients array.
                 */
                if(excludePatients.indexOf(thisPatient.id.toString()) !== -1) {
                    excludedCount++;
                    return;
                }

                var action,
                    actionType = "link",
                    photo = Utilities.getPatientPhotoAsResource(thisPatient, {}, function() {}, "thumbnail"),
                    visitsCount = thisPatient.visits.length,
                    visitLabel = (
                        <em>Checked out</em>
                    );

                /*
                 * Update action type if property was passed.
                 */
                if(props.hasOwnProperty("action")) {

                    /*
                     * If the action is "import",
                     * check for an import handler function.
                     */
                    if(props.action !== "import" || props.hasOwnProperty("handleImportPatient")) {
                        actionType = props.action;
                    }

                }

                /*
                 * If this patient has visits,
                 * create a visit label.
                 */
                if(visitsCount > 0) {
                    if(thisPatient.hasOwnProperty("current_visit") && thisPatient.current_visit !== null) {

                        /*
                         * If our action is "import", we don't want
                         * to display any patients that are currently
                         * in a visit.
                         */
                        if(actionType === "import") {
                            alreadyInAVisitCount++;
                            return;
                        }

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

                /*
                 * Build action DOM.
                 */
                switch(actionType) {

                    /*
                     * Show an import button.
                     */
                    case "import":
                        action = (
                            <button type="button" className="btn btn-block btn-primary" onClick={props.handleImportPatient(thisPatient)}>
                                <span className="fa fa-download"></span> Import
                            </button>
                        );
                        break;

                    /*
                     * Link to the patient profile.
                     */
                    case "link":
                    default:
                        action = (
                            <a href={["/patients/view/", thisPatient.id].join("")}>
                                View &raquo;
                            </a>
                        );
                        break;
                }

                /*
                 * Build the patient row.
                 */
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
                        <td className="hidden-sm-down">
                            {thisPatient.visits.length}
                        </td>
                        <td>
                            {visitLabel}
                        </td>
                        <td className="hidden-xs-down">
                            {thisPatient.created_at}
                        </td>
                        <td className="hidden-sm-down">
                            {thisPatient.updated_at}
                        </td>
                        <td>
                            {action}
                        </td>
                    </tr>
                );
            }.bind(this));

            /*
             * Display a message alerting the user
             * that some patients weren't displayed.
             */
            var invalidCount = (excludedCount + alreadyInAVisitCount);
            if(invalidCount > 0) {
                messageRow = (
                    <tr className="table-warning p-y">
                        <td colSpan={8}>
                            <h6>
                                <span className="fa fa-fw fa-warning m-x"></span> {invalidCount} patient{invalidCount === 1 ? "" : "s"} matched criteria, but are invalid in this context.
                            </h6>
                            <h6 className="text-muted">
                                {alreadyInAVisitCount} are already in a visit &mdash; {excludedCount} are already in <em>this</em> visit.
                            </h6>
                        </td>
                    </tr>
                );
            }

        } else {
            messageRow = (
                <tr>
                    <td colSpan={8}>
						<div className="row p-t" id="page-header-message-block">
							<div className="col-xs-2 text-xs-right hidden-sm-down">
								<h1 className="display-3">
                                    <span className="fa fa-user-times"></span>
                                </h1>
							</div>
							<div className="col-xs-10 p-t">
								<h2>
                                    <span className="fa fa-user-times hidden-md-up"></span> No patients match these criteria.
                                </h2>
								<p>
									You can refine your search with the controls above.
								</p>
							</div>
						</div>
                    </td>
                </tr>
            );
        }

        return (
            <div>
                <h2 className="m-y">
                    {props.hasOwnProperty("icon") ? (
                        <span className={props.icon}></span>
                    ) : ""}
                    {props.title.format({ count: patientsCount })}
                </h2>
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
                                    <th className="hidden-sm-down">
                                        Location
                                    </th>
                                    <th className="hidden-xs-down">
                                        Created at
                                    </th>
                                    <th className="hidden-sm-down">
                                        Last updated
                                    </th>
                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {messageRow}
                                {patientRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
});
