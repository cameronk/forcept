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
			isSubmitting: false,
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
			console.log("Visit properties: %O", props);

		if(props.hasOwnProperty("patients") && props.patients !== null) {
			console.log("Pre-existing patients detected, loading into state.");

			var patients = {};
			for(var patientID in props.patients) {
				console.log("Setting up patient %i", patientID);
				patients[patientID] = Utilities.applyGeneratedFields(props.patients[patientID]);
			}

			console.log("Done setting up patients: %O", patients);

			this.setState({
				patients: patients
			}, function() {
				console.log("Done mounting %i patients.", Object.keys(patients).length);
				__debug(this.state.patients);
			}.bind(this));
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
			isSubmitting: true,
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
				var xhr = new window.XMLHttpRequest();

				xhr.upload.addEventListener("progress", function(evt) {
		            if (evt.lengthComputable) {
		                var percentComplete = evt.loaded / evt.total;

		                //Do something with upload progress here
		                this.setState({
		                	progress: percentComplete * 100
		                });
		            }
		       }.bind(this), false);

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
			});
		}
	},


	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function(patientData) {
		return function(event) {
			var data = {
				"_token": document.querySelector("meta[name='csrf-token']").getAttribute('value')
			};

			if(arguments.length > 0 && patientData !== null && typeof patientData === "object") {
				data["importedFieldData"] = patientData;
			}

			// Set state as loading
			// this.isLoading(true);
			console.log(data);

			$.ajax({
				type: "POST",
				url: "/patients/create",
				data: data,
				success: function(resp) {
					console.log("success");
					if(resp.status == "success") {
						this.handlePatientAdd(resp.patient);
					}
				}.bind(this),
				error: function(resp) {
					console.log("handlePatientAddfromScratch: error");
					console.log(resp);
					// console.log(resp);
				},
				complete: function() {
					// this.isLoading(false);
				}.bind(this)
			});
		}.bind(this);
	},

	/*
	 * Aggregate data
	 */
	handleFinishVisit: function( isDoneLoading ) {
		$("#visit-finish-modal")
			.modal('show');
	},


	/*
	 *
	 */
	topLevelPatientStateChange: function(patientID, fieldID, value) {
		console.log("[Visit]->topLevelPatientStateChange(): patientID=" + patientID + ", fieldID=" + fieldID + ", value=" + value);

		// Check if patient is in our patients array
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients; // Grab patients from state
				patient = patients[patientID], // Grab patient object
				patient[fieldID] = value; // Find our patient and set fieldID = passed value

			// Apply generated fields to patient object
			patient = Utilities.applyGeneratedFields(patient);

			// Push patients back to state
			this.setState({
				patients: patients
			});

		} else {
			console.error("[Visit]->topLevelPatientStateChange(): Missing patient ID " + patientID + " in Visit patients state");
		}
	},

	/*
	 *
	 */
	topLevelStoreResource: function(resourceID, resource) {
		console.log("[Visit]->topLevelStoreResource(): resourceID=" + resourceID + ", resource=" + resource);

		var resources = this.state.resources;
			resources[resourceID] = resource;

		this.setState({
			resources: resources
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
			importPatientControl;

		console.log("typeof first: %s, typeof visible: %s", typeof patientKeys[0], typeof state.visiblePatient.toString());
		console.log("%s patient keys, %s is visible, located: %s", patientKeys.length, state.visiblePatient, patientKeys.indexOf(state.visiblePatient.toString()));

		if(patientKeys.length === 0 || state.visiblePatient === 0) {
			patientRow = (
				<div>no patients yet</div>
			);
		} else {
			if(patientKeys.indexOf(state.visiblePatient.toString()) !== -1) {
				patientRow = (
					<div className="row">

						<Visit.PatientsOverview
							fields={props.patientFields}
							patients={state.patients}
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

		if(props.controlsType === 'new-visit') {
			createPatientControl = (
				<li className="nav-item pull-right">
					<a className="nav-link" onClick={this.handlePatientAddfromScratch(false)}>
						<span className="fa fa-plus"></span>
						&nbsp; Create new
					</a>
				</li>
			);
			importPatientControl = (
				<li className="nav-item pull-right">
					<a className="nav-link">
						<span className="fa fa-download"></span>
						&nbsp; Import
					</a>
				</li>
			);
		}

		return (
			<div className="container-fluid">
				<Visit.FinishModal
					stages={props.stages}
					onConfirmFinishVisit={this.handleConfirmFinishVisit} />

				{/** Page content header **/}
				<div className="row" id="page-header">
					<div className="col-xs-12">
						<h4>
							<span className={['fa', (props.controlsType == 'new-visit' ? 'fa-plus' : 'fa-clipboard')].join(' ')}></span>
							&nbsp; {props.containerTitle}
						</h4>
					</div>
				</div>

				{/** Page content inline list **/}
				<div className="row" id="page-header-secondary">
					<div className="col-xs-12">
						<ul className="nav nav-pills" role="tablist">
							{patientKeys.map(function(patientID, index) {
								return (
									<li className="nav-item">
										<a className={"nav-link" + (patientID == state.visiblePatient ? " active" : "")}>
											{state.patients[patientID].full_name}
										</a>
									</li>
								);
							})}
							{createPatientControl}
							{importPatientControl}
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
