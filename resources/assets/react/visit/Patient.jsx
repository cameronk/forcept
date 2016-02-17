/*
 * Display specified fields relative to this patient
 *
 * Properties:
 *  - value: prescription set ID
 */

Visit.Patient = React.createClass({

	/*
	 *
	 */
	handleFieldChange: function(fieldID, value) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onPatientDataChange(this.props.id, fieldID, value);
	},

	/*
	 *
	 */
	handleStoreResource: function(resourceID, resource) {
		// Continue bubbling event from Fields.whatever to top-level Visit container
		// (this element passes along the patient ID to modify)
		this.props.onStoreResource(resourceID, resource);
	},

	/*
	 *
	 */
	render: function() {

		// Instantiate ALL the things!
		var props = this.props,
			state = this.state,
			fields = props.fields,
			fieldKeys = Object.keys(fields),
			countFields = fieldKeys.length,
			summaryFields = props.summaryFields,
			summaryFieldsKeys = Object.keys(summaryFields),
			countSummaryFields = summaryFieldsKeys.length,
			name = (props.patient.full_name !== null) ? props.patient.full_name : "Unnamed patient",
			summary;

		// console.log ALL the things!
		console.groupCollapsed("Visit.Patient: render"); // keep this collapsed
			console.log("Stage type: %s", props.stageType);
			console.log("Iterable field count: %i", countFields);
			console.log("Iterable field keys: %O", fieldKeys);
			console.log("Summary field count : %i", countSummaryFields);

		// Build summary DOM
		if(summaryFields !== null && typeof summaryFields === "object" && countSummaryFields > 0) {

			// TODO this sucks, figure out a better way
			var leftColumnFields = {},
				rightColumnFields = {},
				patientsObjectSpoof = {};

			patientsObjectSpoof[props.patient.patient_id] = props.patient;

			summaryFieldsKeys.map(function(key, index) {
				if(index > (countSummaryFields - 1) / 2) {
					rightColumnFields[key] = summaryFields[key];
				} else {
					leftColumnFields[key] = summaryFields[key];
				}
			}.bind(this));

			console.log("Left column: %O", leftColumnFields);
			console.log("Right column: %O", rightColumnFields);

			summary = (
				<div className="row">
				</div>
			);
		}

		var fieldsDOM;

		if(props.stageType === "pharmacy") {
			console.group("Running pharmacy loop.");

				// Loop through summary fields instead of actual fields.
				fieldsDOM = summaryFieldsKeys.map(function(fieldID, index) {

					var fieldDOM,
						thisField = summaryFields[fieldID],
						thisPatient = props.patient,
						defaultValue = thisPatient.hasOwnProperty(fieldID) ? thisPatient[fieldID] : "";

					console.group("Field #%i: '%s' %O", index, thisField.name, thisField);
						console.log("Type: %s", thisField.type);
						console.log("Default value: %s", defaultValue);

					// Mutate data as necessary per field type
					if(thisField.type === "pharmacy") {
						console.log("-> found a pharmacy-type");
						fieldDOM = (
							<Fields.Pharmacy
								{...thisField}
								patientID={props.id}
								visitID={props.visitID}
								defaultValue={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
					}

					console.groupEnd();

					// Return fieldDOM back to map function
					return fieldDOM;

				}.bind(this));

			console.groupEnd();
		} else {

			/*
			 * Map fieldKeys to fieldsDOM variable for
			 * future rendering
			 */
			fieldsDOM = fieldKeys.map(function(fieldID, index) {

				var fieldDOM,
					thisField = fields[fieldID],
					thisPatient = props.patient,
					defaultValue = thisPatient.hasOwnProperty(fieldID) ? thisPatient[fieldID] : "";

				console.group("Field #%i: '%s' %O", index, thisField.name, thisField);
					console.log("Type: %s", thisField.type);
					console.log("Default value: %s", defaultValue);
					console.log("thisPatient has fieldID property: %s", thisPatient.hasOwnProperty(fieldID));

				/*
				 * DATA MUTATION
				 *
				 * Modify field value based on field type
				 * (convert JSON data types => JS objects)
				 */
				switch(thisField.type) {
					// Fields stored as JSON arrays
					case "multiselect":
					case "file":
						if(defaultValue !== null && typeof defaultValue === "string") {
							try {
								defaultValue = JSON.parse(defaultValue)
							} catch(e) {
								console.error("Attempt to convert this field's data into an array failed.");
								defaultValue = [];
							}
						}
						break;
				}

				/*
				 * DATA RENDERING
				 *
				 * Render field value based on type.
				 */
				switch(thisField.type) {

					/*
					 * Input field types
					 */
					case "text":
						fieldDOM = (
							<Fields.Text
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "textarea":
						fieldDOM = (
							<Fields.TextArea
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "number":
						fieldDOM = (
							<Fields.Number
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "date":
						fieldDOM = (
							<Fields.Date
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "select":
						fieldDOM = (
							<Fields.Select
								{...thisField}
								multiple={false}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "multiselect":
						fieldDOM = (
							<Fields.Select
								{...thisField}
								multiple={true}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "file":
						fieldDOM = (
							<Fields.File
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								onStore={this.handleStoreResource}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "yesno":
						fieldDOM = (
							<Fields.YesNo
								{...thisField}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;

					/*
					 * Other fields
					 */
					case "header":
						fieldDOM = (
							<Fields.Header
								{...thisField}
								key={fieldID}
								id={fieldID} />
						);
						break;
					case "pharmacy":
						fieldDOM = (
							<Fields.Pharmacy
								{...thisField}
								patientID={props.id}
								visitID={props.visitID}
								value={defaultValue}
								onChange={this.handleFieldChange}
								key={fieldID}
								id={fieldID} />
						);
						break;

					/*
					 * Field type not recognized
					 */
					default:
						fieldDOM = (
							<div className="alert alert-danger">
								<strong>Warning:</strong> Unrecognized input type {thisField['type']}
							</div>
						);
						break;
				}

				console.groupEnd(); // "FIeld #..."

				// Return fieldDOM back to map function
				return fieldDOM;

			}.bind(this));
		}
		//-- End switch stage type to determine fieldsDOM output --\\


		console.groupEnd(); // End "Iterable field..."


		var patientBlock = (
			<blockquote className="blockquote">
				<h3>
					<span className="label label-info">#{props.hasOwnProperty('index') ? props.index + 1 : "?"}</span>
		            <span className="label label-default">{props.hasOwnProperty('id') ? props.id : "?"}</span> &nbsp;
		            <span className="hidden-xs-down">{name}</span>
		            <div className="hidden-sm-up p-t">{name}</div>
		        </h3>
		        {summary}
		        <hr/>
		        {fieldsDOM}
			</blockquote>
		);

		console.groupEnd(); // End "Visit.Patient: render"

		// Render the patient block!
		return patientBlock;
	}

});
