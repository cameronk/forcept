/* ========================================= */

/**
 * visit/Visit.jsx
 * @author Cameron Kelley
 *
 * Visit container
 *
 * The visit container acts as a state bridge between the
 * PatientsOverview and PatientsContainer module.
 *
 * Properties:
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
			 * "default" 	=> show patients or messages as necessary
			 * "submitted" 	=> we just finished moving a visit
			 * "loading" 	=> display loading gif in header bar
			 * "submitting" => display submitting overlay
			 */
			displayState: "default",
			isValid: false,

			progress: 0,
			movedResponse: null,

			/*
			 * Visible item values:
			 *  -1 	=> Import block
			 *   0  => Nothing ("no patients in this visit")
			 * > 0 	=> Patient
			 */
			visibleItem: 0,


			/*
			 * Some component states are stored in
			 * the visit container, because we need
			 * to share them between each component
			 * in order to properly display information
			 * (for example, column organization)
			 */
			componentStates: {
				patientRecord: {
					visible: true,
					compact: false,
				},
				visitSummary: {
					visible: true,
					compact: true,
				}
			},

			patients: {},
			resources: {}
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
				visibleItem: firstPatient
			}, this.validate); // Validate after updating patients
		}

		console.groupEnd();
	},

	/*
	 * Toggle the state of a visit sub-component.
	 * @return void
	 */
	toggleComponentState: function(component, value) {
		return function(event) {
			var state = this.state;
			if(state.componentStates.hasOwnProperty(component)
				&& state.componentStates[component].hasOwnProperty(value)) {
				state.componentStates[component][value] = !state.componentStates[component][value];

				this.setState({
					componentStates: state.componentStates,
				});
			}
		}.bind(this);
	},

	/*
	 *
	 */
	handleConfirmFinishVisit: function( destination, modalObject ) {

		var props = this.props;

		/*
		 * change displayState to submitting.
		 */
		this.setState({
			displayState: "submitting"
		});

		// Go ahead and close the modal
		$("#visit-finish-modal")
			.modal('hide')
			.on('hidden.bs.modal', function(e) {
				console.log("Modal hidden");
				// modalObject.setState(modalObject.getInitialState());
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

				/*
				 * Grab window xhr object
				 */
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

				return xhr;

			}.bind(this),
			success: function(resp) {
				this.setState({
					/*
					 * Reset progress back to 0
					 */
					progress: 0,

					/*
					 * Remove patients since we just submitted them
					 */
					patients: {},

					/*
					 * Display a message
					 */
					displayState: "submitted",
					visibleItem: 0
				});
			}.bind(this),
			error: function(resp) {

			},
			complete: function(resp) {
				console.log("Complete: %O", resp);
				this.setState({
					movedResponse: resp.responseJSON
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
				patients: patients,
				visibleItem: patient.id
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
	 * Handle importing of a patient object.
	 * @return void
	 */
	handleImportPatient: function(patient) {
		return function(event) {

			/*
			 * If the patient was pulled from field data table,
			 * we need to "add it from scratch" to create the
			 * respective Patient record.
			 */
			if(patient.hasOwnProperty('field_number') && patient.field_number !== null) {
				this.handlePatientAddfromScratch(patient);
			} else {
				this.handlePatientAdd(patient);
			}

		}.bind(this);
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
					this.setDisplayState("default");
				}.bind(this)
			});
		}.bind(this);
	},

	/*
	 * Display the finish modal if the container is valid.
	 * @return void
	 */
	handleFinishVisit: function() {
		if(this.state.isValid) {
			$("#visit-finish-modal")
				.modal('show');
		}
	},

	/*
	 *
	 */
	switchVisibleItem: function( patientID ) {
		return function(event) {
			if(this.state.visibleItem !== patientID) {
				this.setState({
					displayState: "default", // in case we were importing...
					visibleItem: patientID
				});
			}
		}.bind(this);
	},

	/*
	 * Check the validity of the visit.
	 */
	validate: function() {
		var valid = Object.keys(this.state.patients).length > 0;
		console.group("Visit.Visit: validate (valid=%s)", valid);
		console.groupEnd();
		this.setState({
			isValid: valid
		});
	},

	/*
	 *
	 */
	topLevelPatientStateChange: function(patientID, fieldID, value) {
		console.log("[Visit]->topLevelPatientStateChange(): patientID=" + patientID + ", fieldID=" + fieldID + ", value=" + value);

		/*
		 * Check if patient is in our patients array
		 */
		if(this.state.patients.hasOwnProperty(patientID)) {

			var patients = this.state.patients; // Grab patients from state
				patient = patients[patientID], 	// Grab patient object
				patient[fieldID] = value; 		// Find our patient and set fieldID = passed value

			/*
			 * Apply generated fields to patient object
			 */
			patient = Utilities.applyGeneratedFields(patient);

			__debug(patients);

			/*
			 * Push patients back to state,
			 * validating the form afterwards.
			 */
			this.setState({
				patients: patients
			}, this.validate);

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
	 * Render Visit container.
	 * @return JSX element
	 */
	render: function() {

		/*
		 * Instantiate ALL the things
		 */
		var patientRow, submittingOverlay,
			createPatientControl, importPatientControl,
			loadingItem, importingItem,
			props = this.props,
			state = this.state,
			patientKeys = Object.keys(state.patients),
			controlsDisabled = (["default", "submitted"].indexOf(state.displayState) === -1),
			submitDisabled 	 = (controlsDisabled || !state.isValid);

		/*
		 * Determine what to render based on state.visibleItem
		 */
		switch(state.visibleItem) {

			/**
			 * Show the import block.
			 */
			case -1:
				importingItem = (
					<li className="nav-item">
						<a className="nav-link active">
							<span className="fa fa-download"></span>
							&nbsp; Import
						</a>
					</li>
				);
				patientRow = (
					<Patients.Table
						icon={"fa fa-download m-r m-l"}
						title={"Import a patient"}
						action={"import"}
						preload={false}
						exclude={patientKeys}
						handleImportPatient={this.handleImportPatient} />
				);
				break;

			/**
			 * Show a message.
			 */
			case 0:

				/*
				 * Check if we have any patients in this visit.
				 */
				if(patientKeys.length === 0) {

					/*
					 * If we just finished submitting,
					 * display a different message.
					 */
					if(state.displayState === "submitted" && state.movedResponse !== null) {
						patientRow = (
							<div className="row p-t" id="page-header-message-block">
								<div className="col-xs-2 text-xs-right hidden-sm-down">
									<h1 className="display-3"><span className="fa fa-check"></span></h1>
								</div>
								<div className="col-xs-10 p-t">
									<h2><span className="fa fa-check hidden-md-up"></span> Visit was {state.movedResponse.toStage === "__checkout__" ? "checked out" : "moved"}.</h2>
									<p>
										{state.movedResponse.toStage !== "__checkout__" ? (
											<span>You can <a href={"/visits/stage/" + state.movedResponse.toStage + "/handle/" + state.movedResponse.visitID}>follow this visit</a> to the next stage. </span>
										) : "" }
									</p>
								</div>
							</div>
						);
					} else {
						patientRow = (
							<div className="row p-t" id="page-header-message-block">
								<div className="col-xs-2 text-xs-right hidden-sm-down">
									<h1 className="display-3"><span className="fa fa-user-times"></span></h1>
								</div>
								<div className="col-xs-10 p-t">
									<h2><span className="fa fa-user-times hidden-md-up"></span> No patients in this visit</h2>
									<p>
										Try adding some &mdash; click the <span className="fa fa-plus"></span> icon above to create a new patient, or the <span className="fa fa-download"></span> icon to import.
									</p>
								</div>
							</div>
						);
					}
				} else {
					patientRow = (
						<div className="row p-t" id="page-header-message-block">
							<div className="col-xs-2 text-xs-right hidden-sm-down">
								<h1 className="display-3"><span className="fa fa-user-times"></span></h1>
							</div>
							<div className="col-xs-10 p-t">
								<h2><span className="fa fa-user-times hidden-md-up"></span> You've added {patientKeys.length} patient{patientKeys.length > 1 ? "s" : ""}.</h2>
								<p>Click a patient tab above to enter data, or click the <span className="fa fa-plus"></span> icon above to add a new patient.</p>
							</div>
						</div>
					);
				}
				break;

			/**
			 * Show the patient provided by visibleItem.
			 */
			default:
				var patientIndex = patientKeys.indexOf(state.visibleItem.toString());
				if(patientIndex !== -1) {
					patientRow = (
						<div className={"row" + (controlsDisabled ? " disabled" : "")}>

							{/*
							  * Column sizing:
							  *
							  * Overview:
							  * - stages WITHOUT summary: offset 1 on both sides (total area: 10)
							  * TODO finish this
							  */}

							<Visit.Overview
								fields={props.patientFields}
								patient={state.patients[state.visibleItem]}
								resources={state.resources}

								/*
								 * Event handlers
								 */
								onStoreResource={this.topLevelStoreResource}

								/*
								 * Fields to summarize in summary card
								 */
								summaryFields={props.summaryFields}

								/*
								 * Handle component state & toggling.
								 */
								componentStates={state.componentStates}
								toggleComponentState={this.toggleComponentState} />

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
								patient={state.patients[state.visibleItem]}
								id={state.visibleItem}
								index={patientIndex}

								/*
								 * All available fields
								 */
								fields={props.mutableFields}

								/*
								 * Fields to summarize at the top of each patient
								 */
								summaryFields={props.summaryFields}

								/*
								 * Handle component state & toggling.
								 */
								componentStates={state.componentStates}
								toggleComponentState={this.toggleComponentState}

								/*
								 * Event handlers
								 */
								onPatientDataChange={this.topLevelPatientStateChange}
								onStoreResource={this.topLevelStoreResource} />
						</div>
					);
				} else {
					// TODO figure out what to do here
					patientRow = (
						<div>test</div>
					);
				}
				break;

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
					<a className={"nav-link nav-button" + (controlsDisabled ? " disabled" : "")} disabled={controlsDisabled} onClick={this.switchVisibleItem(-1)}>
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
			case "submitting":
				submittingOverlay = (
					<div className="forcept-visit-submit-overlay row">
						<div className="col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2 col-md-4 col-md-offset-4 col-xl-2 col-xl-offset-5">
							<h5>Working... <span className="label label-success label-pill pull-right">{state.progress}%</span></h5>
							<progress className="progress" value={state.progress} max="100">
								<div className="progress">
									<span className="progress-bar" style={{ width: state.progress + "%" }}>{state.progress}%</span>
								</div>
							</progress>
						</div>
					</div>
				);
				break;
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
				<Modals.FinishVisit
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
											<a  onClick={this.switchVisibleItem(patientID)}
												className={"nav-link" + (patientID == state.visibleItem ? " active" : "")}>
												<span className="label label-default">{patientID}</span>
												&nbsp; {state.patients[patientID].abbr_name}
											</a>
										</li>
									);
								}.bind(this))}
								{importingItem}
								{loadingItem}

							{/* Right-aligned controls */}
								{importPatientControl}
								{createPatientControl}
								<li className="nav-item pull-right">
									<a className={"nav-link nav-button text-success" + (submitDisabled ? " disabled" : "")} disabled={submitDisabled} onClick={this.handleFinishVisit}>
										<span className="fa fa-level-up"></span> &nbsp; Move visit
									</a>
								</li>

						</ul>
					</div>
				</div>

				{/** Visible patient **/}
				{submittingOverlay}
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
