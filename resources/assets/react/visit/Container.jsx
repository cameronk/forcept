/*
 * Patients management (main content)
 *
 * Properties:
 *  - _token: 			Laravel CSRF token
 *  - controlsType: 	determine which controls set to use
 *  - containerTitle: 	Title for patients container
 *
 *  - fields: 			All fields for this stage
 *  - patients:  		All patients in this visit
 *
 * 	- isSubmitting:  	is the parent form in submission state?
 *
 *  - onFinishVisit:  	Bubble onFinishVisit event up to Visit container
 *  - onPatientAdd: 	Bubble onPatientAdd event up to Visit container
 *  - onPatientDataChange: Bubble onPatientDataChange event up to Visit container
 *  - onStoreResource: Bubble onStoreResource event up to Visit container
 */
Visit.PatientsContainer = React.createClass({

	/*
	 * Initially, the container isn't loading
	 */
	getInitialState: function() {
		return {
			showImportBlock: false,
			isLoading: false
		}
	},

	/*
	 * Set state to loading
	 */
	isLoading: function(val) {
		this.setState({
			isLoading: val
		});
	},

	/*
	 * Handle finishing the visit
	 */
	onFinishVisit: function() {
		console.log("PatientsContainer: onFinishVisit");
		this.isLoading(true);
		this.props.onFinishVisit(this.isLoading(false));
	},

	/*
	 * Add a bare patient record
	 */
	handlePatientAddfromScratch: function(patientData) {
		var data;
		if(arguments.length > 0 && patientData !== null && typeof patientData === "object") {
			console.log('args.length = ' + arguments.length);
			console.log('patientData === null: ' + patientData === null);
			console.log('typeof patientData:' + typeof patientData);
			console.log(patientData);
			data = {
				"_token": this.props._token,
				"importedFieldData": patientData
			};
		} else {
			data = {
				"_token": this.props._token,
			};
		}

		// Set state as loading
		this.isLoading(true);

		$.ajax({
			type: "POST",
			url: "/patients/create",
			data: data,
			success: function(resp) {
				console.log("success");
				if(resp.status == "success") {
					this.props.onPatientAdd(resp.patient);
				}
			}.bind(this),
			error: function(resp) {
				console.log("handlePatientAddfromScratch: error");
				console.log(resp);
				// console.log(resp);
			},
			complete: function() {
				this.isLoading(false);
			}.bind(this)
		});

	},
	handlePatientAdd: function(patient) {
		if(patient.hasOwnProperty('field_number') && patient.field_number !== null) {
			this.handlePatientAddfromScratch(patient);
		} else {
			this.props.onPatientAdd(patient);
		}
	},

	handleShowImportBlock: function() {
		this.setState({
			showImportBlock: true
		});
	},
	handleCloseImportBlock: function() {
		this.setState({
			showImportBlock: false
		});
	},

	render: function() {

		var props = this.props,
			state = this.state,
			isLoading = (state.isLoading || props.isSubmitting),
			patients = (props.hasOwnProperty('patients') ? props.patients : {}),
			patientIDs = Object.keys(patients),
			patientsCount = patientIDs.length,
			patientsDOM,
			importBlock,
			controls;

		console.group("Visit.PatientsContainer: render");
			console.log("Showing import block: %s", state.showImportBlock);
			console.log("Patient IDs: %O", patientIDs);
			console.log("Patients count: %i", patientsCount);

		// Loading state can be triggered by:
		// 		isLoading 		-> provided by controls, procs when adding new patient / importing
		// 		isSubmitting 	-> provided by container, procs when visit is submitted to next stage

		// If we're submitting, don't show patients block
		if(!props.isSubmitting) {

			// Set up patients block
			if(patientsCount > 0) {

				// Build patients DOM
				patientsDOM = patientIDs.map(function(patientID, index) {

					var thisPatient = patients[patientID];

					console.groupCollapsed("Fieldset #%i: Patient %s", index, patientID);
						console.log("Fields: %O", props.fields);
						console.log("This patient: %O", thisPatient);

					var patientDOM = (
						<div key={patientID}>
							<Visit.Patient
								/*
								 * Stage type
								 */
								stageType={props.stageType}
								
								/*
								 * Visit
								 */
								visitID={props.visitID}

								/*
								 * Patient record
								 */
								patient={thisPatient}
								id={patientID}
								index={index}

								/*
								 * All available fields
								 */
								fields={props.fields}

								/*
								 * Fields to summarize at the top of each patient
								 */
								summaryFields={props.summaryFields}

								/*
								 * Event handlers
								 */
								onPatientDataChange={props.onPatientDataChange}
								onStoreResource={props.onStoreResource} />
							<hr/>
						</div>
					);

					console.groupEnd(); // End: "#%i: Patient [patientID]"

					// Push back to patientsDOM
					return patientDOM;

				}.bind(this));
			} else {
				patientsDOM = (
					<div className="alert alert-info">
						There are currently no patients in this visit.
					</div>
				);
			}
		} else {
			// Scroll to top of window
			window.scrollTo(0, 0);
		}

		// Set up import block
		if(state.showImportBlock) {
			importBlock = (
				<Visit.ImportBlock
					_token={props._token}

					onPatientAdd={this.handlePatientAdd}
					onClose={this.handleCloseImportBlock} />
			);
		}

		// Set up controls block
		switch(props.controlsType) {
			case "new-visit":
				// We're on the new visit page
				controls = (
					<Visit.NewVisitControls
						isLoading={isLoading}
						isImportBlockVisible={state.showImportBlock}

						onFinishVisit={this.onFinishVisit}
						onPatientAddFromScratch={this.handlePatientAddfromScratch}
						onShowImportBlock={this.handleShowImportBlock} />
				);
				break;
			case "stage-visit":
				// We're on some sort of stage page
				controls = (
					<Visit.StageVisitControls
						isLoading={isLoading}

						onFinishVisit={this.onFinishVisit} />
				);
				break;
		}

		// Add messages as necessary
		var message;
		if(isLoading == true) {

			// If we have a progress value
			if(props.progress > 0) {
				var percent = props.progress.toFixed(1);
				message = (
					<div>
						<div className="alert alert-info">
							<strong>One moment...</strong>
						</div>
						<progress className="progress progress-striped progress-animated" value={percent} max="100">
							{percent}%
						</progress>
					</div>
				);
			} else {
				message = (
					<div className="alert alert-info">
						<strong>One moment...</strong>
					</div>
				);
			}

		} else {
			// We aren't loading, perhaps there was already a response?
			var response = props.confirmFinishVisitResponse;
			if(response !== null) {
				if(response.status == "success") {
					var link;
					if(response.toStage !== "__checkout__") {

						link = (
							<a href={"/visits/stage/" + response.toStage + "/handle/" + response.visitID} className="btn btn-link">
								Follow this visit
							</a>
						);
					}
					message = (
						<div className="alert alert-success">
							<strong>Awesome!</strong> {response.message} {link}
						</div>
					);
				} else {
					var errorListItems = response.errors.map(function(error, index) {
						return (
							<li key={index}>{error}</li>
						);
					});
					message = (
						<div className="alert alert-danger">
							<strong>An error occurred:</strong> {response.message}
							<ul>{errorListItems}</ul>
						</div>
					);
				}
			}
		}

		console.log("Ending PatientsContainer group...");
		console.groupEnd(); // End: 'Visit.PatientsContainer: render'

		return (
			<div className="col-xs-12 col-sm-12 col-md-8 col-xl-9">
	            <h1 className="p-t text-xs-center">{props.containerTitle}</h1>
	            <hr/>
            	{message}
            	{patientsDOM}
            	{importBlock}
            	{controls}
	        </div>
		);
	}
});
