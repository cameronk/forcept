/*
 * Display specified fields relative to this patient
 *
 * Properties:
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

		var props = this.props,
			state = this.state,

			fields = props.fields,
			fieldKeys = Object.keys(fields),
			countFields = fieldKeys.length,

			summaryFields = props.summaryFields,
			summaryFieldsKeys = Object.keys(summaryFields),
			countSummaryFields = summaryFieldsKeys.length,

			name = props.patient.full_name !== null ? props.patient.full_name : "Unnamed patient",
			summary;

		console.log("[Visit.Patient] Preparing to render " + countFields + " iterable fields, " + countSummaryFields + " fields to summarize");
		console.log("[Visit.Patient] Field keys: [" + fieldKeys.join(", ") + "]");

		// Build summary DOM
		if(summaryFields !== null && typeof summaryFields === "object" && countSummaryFields > 0) {

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

			console.log("[Visit.Patient] " + Object.keys(leftColumnFields).length + " fields in the left column");
			console.log("[Visit.Patient] " + Object.keys(rightColumnFields).length + " fields in the right column");

			summary = (
				<div className="row">
					<Visit.PatientsOverview
						fields={leftColumnFields}
						patients={patientsObjectSpoof}
						mini={true} />
					<Visit.PatientsOverview
						fields={rightColumnFields}
						patients={patientsObjectSpoof}
						mini={true} />
				</div>
			);
		}


		return (
			<blockquote className="blockquote">
				<h3>
					<span className="label label-info">#{props.hasOwnProperty('index') ? props.index + 1 : "?"}</span>
		            <span className="label label-default">{props.hasOwnProperty('id') ? props.id : "?"}</span> &nbsp;
		            <span className="hidden-xs-down">{name}</span>
		            <div className="hidden-sm-up p-t">{name}</div>
		        </h3>
		        {summary}
		        <hr/>
		        {fieldKeys.map(function(fieldID, index) {


					var thisField = fields[fieldID],
						thisPatient = props.patient,
						defaultValue = thisPatient.hasOwnProperty(fieldID) ? thisPatient[fieldID] : null;

					console.log("[Visit.Patient][" + props.id + "][" + fieldID + "] rendering with type " + thisField.type + ", defaultValue: " + defaultValue + " (typeof defaultValue='" + (typeof defaultValue) + "')");

					// Mutate data as necessary per field type
					switch(thisField.type) {
						// Fields stored as JSON arrays
						case "multiselect":
						case "file":
						case "pharmacy":
							if(defaultValue !== null && typeof defaultValue === "string") {
								try {
									defaultValue = JSON.parse(defaultValue)
								} catch(e) {
									console.error("[Visit.Patient][" + props.id + "][" + fieldID + "] attempt to convert data -> array failed");
									defaultValue = [];
								}
							}
							break;
					}

		        	// Figure out which type of field we should render
		        	switch(thisField.type) {

		        		/*
		        		 * Input field types
		        		 */
		        		case "text":
		        			return (
		        				<Fields.Text
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "textarea":
		        			return (
		        				<Fields.Textarea
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "number":
		        			return (
		        				<Fields.Number
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "date":
		        			return (
		        				<Fields.Date
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "select":
							return (
		        				<Fields.Select
		        					{...thisField}
		        					multiple={false}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "multiselect":
		        			return (
		        				<Fields.Select
		        					{...thisField}
		        					multiple={true}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "file":
		        			return (
								<Fields.File
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
									onStore={this.handleStoreResource}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "yesno":
		        			return (
								<Fields.YesNo
		        					{...thisField}
		        					defaultValue={defaultValue}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;

		        		/*
		        		 * Other fields
		        		 */
		        		case "header":
		        			return (
		        				<Fields.Header
		        					{...thisField}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;
		        		case "pharmacy":
		        			return (
		        				<Fields.Pharmacy
		        					{...thisField}
		        					onChange={this.handleFieldChange}
		        					key={fieldID}
		        					id={fieldID} />
		        			);
		        			break;

		        		/*
		        		 * Field type not recognized
		        		 */
		        		default:
		        			return (
		        				<div className="alert alert-danger">
		        					<strong>Warning:</strong> Unrecognized input type {thisField['type']}
		        				</div>
		        			);
		        			break;
		        	}
		        }.bind(this))}
			</blockquote>
		);
	}

});
