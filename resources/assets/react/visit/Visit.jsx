/**
 * visit.jsx
 */

/*
 * Visit container
 *
 * The visit container acts as a state bridge between the
 * PatientsOverview and PatientsContainer module.
 *
 * Accepted properties:
 *  - _token: Laravel CSRF token
 *  - containerTitle: Title for the PatientContainer block
 *  - controlsType: Denote which set of controls should appear ["new-visit", "stage-visit"]
 *  - redirectOnFinish: URL to redirect to on complete
 *
 *  - visitID: ID of the current visit being modified (null if new visit setup)
 *  - patients: Patients object with fieldID => data setup
 *  - stages: Array of stages (in order of 'order') for finish modal
 *  - currentStage: ID of current stage
 *  - currentStageType: type of current stage (basic, pharmacy)
 *
 *  - mutableFields: NEW Fields which should be mutable for EACH patient in the PatientContainer block.
 *  - patientFields: PREEXISTING Fields which should have their data displayed in the PatientOverview block.
 *  - summaryFields: PREEXISTING Fields which should have their data displayed in the PatientOverview block.
 */
var Visit = React.createClass({

	/*
	 * Get initial Visit state
	 */
	getInitialState: function() {
		return {

			/*
			 * Display states:
			 *
			 * "default" => show patients or messages as necessary
			 * "loading" => display loading gif somewhere
			 */
			displayState: "default",
			isValid: false,
			// isSubmitting: false,

			progress: 0,
			confirmFinishVisitResponse: null,
			visiblePatient: 0,

			patients: {},
			resources: {},
			prescriptions: {},
		};
	},

	/*
	 * Deploy necessary state changes prior to mount
	 */
	componentWillMount: function() {

		var props = this.props;

		console.group("Visit: mount");
			console.log("Props: %O", props);

		/*
		 * Check if patients have already been loaded.
		 * (i.e. are we handling a visit or making a new one?)
		 */
		if(props.hasOwnProperty("patients") && props.patients !== null) {
			console.log("Pre-existing patients detected, loading into state.");

			var patients = {},
				firstPatient = null;

			/*
			 * Apply generated fields for each patient
			 * and push to above object.
			 */
			for(var patientID in props.patients) {

				/*
				 * Save first patient ID for default tab selection.
				 */
				if(firstPatient === null) {
					firstPatient = patientID;
				}

				console.log("Setting up patient %i", patientID);
				patients[patientID] = Utilities.applyGeneratedFields(props.patients[patientID]);
			}

			console.log("Done setting up patients: %O", patients);

			this.setState({
				patients: patients,
				visiblePatient: firstPatient
			}, this.validate); // Validate after updating patients
		}

		console.groupEnd();
	},

	/*
	 *
	 */
	handleConfirmFinishVisit: function( destination, modalObject ) {

		var props = this.props;

		// Update state to submitting
		this.setState({
			// isSubmitting: true,
			displayState: "submitting"
		});

		// Go ahead and close the modal
		$("#visit-finish-modal")
			.modal('hide')
			.on('hidden.bs.modal', function(e) {
				console.log("Modal hidden");
				modalObject.setState(modalObject.getInitialState());
				modalObject.resetSelectState();
			});

		$.ajax({
			type: "POST",
			url: "/visits/store",
			data: {
				"_token": props._token,
				visit: props.visitID,
				patients: this.state.patients,
				stage: props.currentStage,
				destination: destination
			},
			xhr: function() {

				// Grab window xhr object
				var xhr = new window.XMLHttpRequest();

				/*
				 * Handle upload progress listener
				 */
				xhr.upload.addEventListener("progress", function(evt) {
		            if(evt.lengthComputable) {
		                this.setState({
		                	progress: (evt.loaded / evt.total) * 100
		                });
		            }
		       }.bind(this), false);

				// Spit it back
				return xhr;

			}.bind(this),
			success: function(resp) {
				this.setState(this.getInitialState());
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
				this.setState({
					confirmFinishVisitResponse: resp.responseJSON
				});
			}.bind(this)
		});
	},

	/*
	 * Handle addition of a new patient.
	 *
	 * @arguments
	 * - patient: Object of patient data as pulled from the patients database table
	 */
	handlePatientAdd: function( patient ) {
		var patients = this.state.patients;
		console.log("Adding patient %s", patient.id);
		if(patients.hasOwnProperty(patient.id)) {
			// Patient already in Visit
		} else {
			// Update state with new patient
			console.log(typeof patient.id);
			patients[patient.id] = Utilities.applyGeneratedFields(patient);
			this.setState({
				confirmFinishVisitResponse: null,
				patients: patients,
				visiblePatient: patient.id
			}, this.validate); // Validate after updating patients
		}
	},

	/*
	 *
	 */
	setDisplayState: function(state) {
		this.setState({
			displayState: state
		});
	},


	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function(patientData) {
		return function(event) {

			/*
			 * Data array initially contains token
			 */
			var data = {
				"_token": document.querySelector("meta[name='csrf-token']").getAttribute('value')
			};

			/*
			 * If patientData was defined (passed from import), add to data object
			 */
			if(arguments.length > 0 && patientData !== null && typeof patientData === "object") {
				data["importedFieldData"] = patientData;
			}

			// Set state as loading
			this.setDisplayState("loading");

			$.ajax({
				type: "POST",
				url: "/patients/create",
				data: data,
				success: function(resp) {
					if(resp.status == "success") {
						this.handlePatientAdd(resp.patient);
					}
				}.bind(this),
				error: function(resp) {
					console.log("handlePatientAddfromScratch: error");
					console.log(resp);
				},
				complete: function() {
					// this.isLoading(false);
					this.setDisplayState("default");
				}.bind(this)
			});
		}.bind(this);
	},

	/*
	 *
	 */
	handleFinishVisit: function( isDoneLoading ) {
		$("#visit-finish-modal")
			.modal('show');
	},

	/*
	 *
	 */
	switchVisiblePatient: function( patientID ) {
		return function(event) {
			if(this.state.visiblePatient !== patientID) {
				this.setState({
					visiblePatient: patientID
				});
			}
		}.bind(this);
	},

	/*
	 *
	 */
	topLevelPatientStateChange: function(patientID, fieldID, value) {
		console.log("[Visit]->topLevelPatientStateChange(): patientID=" + patientID + ", fieldID=" + fieldID + ", value=" + value);

		// Check if patient is in our patients array
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients; // Grab patients from state
				patient = patients[patientID], 	// Grab patient object
				patient[fieldID] = value; 		// Find our patient and set fieldID = passed value

			// Apply generated fields to patient object
			patient = Utilities.applyGeneratedFields(patient);

			__debug(patients);

			// Push patients back to state
			this.setState({
				patients: patients
			}, this.validate); // Validate after updating patients

		} else {
			console.error("[Visit]->topLevelPatientStateChange(): Missing patient ID " + patientID + " in Visit patients state");
		}
	},

	/*
	 *
	 */
	topLevelStoreResource: function(resourceID, resource) {
		console.log("[Visit]->topLevelStoreResource(): resourceID=%s, resource=%O", resourceID, resource);

		var resources = this.state.resources;
			resources[resourceID] = resource;

		this.setState({
			resources: resources
		});
	},

	/*
	 * Check the validity of the visit.
	 */
	validate: function() {
		this.setState({
			isValid: Object.keys(this.state.patients).length > 0
		});
	},

	/*
	 * Render Visit container
	 */
	render: function() {

		var props = this.props,
			state = this.state,
			patientKeys = Object.keys(state.patients),
			patientRow,
			createPatientControl,
			importPatientControl,
			loadingItem,
			controlsDisabled = (state.displayState !== "default")
			submitDisabled 	 = (controlsDisabled || !state.isValid);

		/*
		 * Check if there are any patients in this visit
		 */
		if(patientKeys.length === 0 || state.visiblePatient === 0) {
			patientRow = (
				<div className="row p-t" id="page-header-message-block">
					<div className="col-xs-2 text-xs-right hidden-sm-down">
						<h1 className="display-3"><span className="fa fa-user-times"></span></h1>
					</div>
					<div className="col-xs-10 p-t">
						<h2><span className="fa fa-user-times hidden-md-up"></span> No patients in this visit</h2>
						<p>Try adding some &mdash; click the <span className="fa fa-plus"></span> icon above.</p>
					</div>
				</div>
			);
		} else {
			if(patientKeys.indexOf(state.visiblePatient.toString()) !== -1) {
				patientRow = (
					<div className={"row" + (controlsDisabled ? " disabled" : "")}>
						<Visit.Overview
							fields={props.patientFields}
							patient={state.patients[state.visiblePatient]}
							mini={false}
							resources={state.resources} />

						<Visit.Patient
							/*
							 * Stage type
							 */
							stageType={props.currentStageType}

							/*
							 * Visit
							 */
							visitID={props.visitID}

							/*
							 * Patient record
							 */
							patient={state.patients[state.visiblePatient]}
							id={state.visiblePatient}
							index={0}

							/*
							 * All available fields
							 */
							fields={props.mutableFields}

							/*
							 * Fields to summarize at the top of each patient
							 */
							summaryFields={props.summaryFields}

							/*
							 * Event handlers
							 */
						    onPatientDataChange={this.topLevelPatientStateChange}
						    onStoreResource={this.topLevelStoreResource} />
					</div>
				);
			} else {
				patientRow = (
					<div>test</div>
				);
			}
		}

		/*
		 * If this is a new visit, show create/import controls.
		 */
		if(props.controlsType === 'new-visit') {
			createPatientControl = (
				<li className="nav-item pull-right">
					<a className={"nav-link nav-button" + (controlsDisabled ? " disabled" : "")} disabled={controlsDisabled} onClick={this.handlePatientAddfromScratch(false)}>
						<span className="fa fa-plus"></span>
						<span className="hidden-lg-down">&nbsp; New patient</span>
					</a>
				</li>
			);
			importPatientControl = (
				<li className="nav-item pull-right">
					<a className={"nav-link nav-button" + (controlsDisabled ? " disabled" : "")} disabled={controlsDisabled}>
						<span className="fa fa-download"></span>
						<span className="hidden-lg-down">&nbsp; Import patient</span>
					</a>
				</li>
			);
		}

		/*
		 * Render additional components based on current "displayState".
		 */
		switch(state.displayState) {
			case "loading":
				loadingItem = (
					<li className="nav-item">
						<img src="/assets/img/loading.gif" />
					</li>
				);
				break;
		}

		/*
		 *
		 */
		return (
			<div className="container-fluid">

				{/** Move visit modal **/}
				<Visit.FinishModal
					stages={props.stages}
					onConfirmFinishVisit={this.handleConfirmFinishVisit} />

				{/** Page content header **/}
				<div className="row" id="page-header">
					<div className="col-xs-12">
						<h4>{props.containerTitle}</h4>
					</div>
				</div>

				{/** Page content inline list **/}
				<div className="row" id="page-header-secondary">
					<div className="col-xs-12">
						<ul className="nav nav-pills" role="tablist">

							{/* Left-aligned controls */}
								{patientKeys.map(function(patientID, index) {
									return (
										<li className="nav-item" key={"patient-tab-" + patientID}>
											<a  onClick={this.switchVisiblePatient(patientID)}
												className={"nav-link" + (patientID == state.visiblePatient ? " active" : "")}>
												<span className="label label-default">{patientID}</span>
												&nbsp; {state.patients[patientID].abbr_name}
											</a>
										</li>
									);
								}.bind(this))}
								{loadingItem}

							{/* Right-aligned controls */}
								{importPatientControl}
								{createPatientControl}
								<li className="nav-item pull-right">
									<a className={"nav-link nav-button text-success" + (submitDisabled ? " disabled" : "")} disabled={submitDisabled} onClick={this.handleFinishVisit}>
										<span className="fa fa-level-up"></span>
										<span className="hidden-md-down">&nbsp; Move visit</span>
									</a>
								</li>

						</ul>
					</div>
				</div>

				{/** Visible patient **/}
				{patientRow}

			</div>
		);
	}

});

/*
 * Variables
 */
Visit.generatedFields = {
	"generatedHeader": {
		name: "Generated",
		type: "header"
	},
	"age": {
		name: "Age",
		type: "number"
	}
};
