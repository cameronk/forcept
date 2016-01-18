
/**
 * Field JSON structure

 {
  "fields": {
    "[id]": {
      "name": "Patient name",
      "type": "text",
    },
    "[id]": {
      "name": "Location",
      "type": "select",
      "settings": {
        "options": ["option 1", "option 2"],
        "allowCustomData": true
      }
    }
  }
}

*/

FlowEditor.Field = React.createClass({

	/*
	 * Initial state for a field
	 */
 	getInitialState: function() {
 		return FlowEditor.getDefaultFieldState(this.props.stageType);
 	},

 	/*
 	 * Set up field state based on props prior to mount
 	 */
 	componentWillMount: function() {
 		this.setState({
 			// Required properties
 			name: this.props.name,
 			type: this.props.type,
 			mutable: isTrue(this.props.mutable),

 			// Settings
 			description: this.props.hasOwnProperty("description") ? this.props.description : null,
 			settings:
 				(FlowEditor.customizableFields).indexOf(this.props.type) !== -1 // If this field is a customizable field
 				&& typeof this.props.settings === "object" // If the settings object exists
 				&& Object.keys(this.props.settings).length > 0  // If the settings object has parameters
 					? this.props.settings // Use the settings object
 					: null, // Otherwise, return null

 		});
 	},

 	/*
 	 * Handle field name change
 	 */
 	handleFieldNameChange: function(event) {
 		this.setState({ name: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});

 	},

 	/*
 	 * Handle field type change
 	 */
 	handleFieldTypeChange: function(event) {
 		console.log("Type change from " + this.state.type + " => " + event.target.value);
 		this.setState({ type: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});
 	},

 	/*
 	 *
 	 */
 	handleFieldDescriptionChange: function(event) {
 		this.setState({ description: event.target.value }, function() {
	 		// Remind container to check validity of inputs
	 		this.props.onChange(this.props['data-key']);
 		});
 	},

 	/*
 	 * Handle field removal
 	 */
 	handleRemoveField: function() {
 		this.props.onRemove(this.props.key);
 	},

 	/*
 	 * Handle change to field settings.
 	 */
 	handleFieldSettingsChange: function() {

 		// Grab state object via React ref
 		var settings = this.refs['settings-' + this.props['data-key']].state;

 		// Bump child state up to parent settings state
 		this.setState({ settings: settings });
 	},

 	/*
 	 * Check the validity of this field.
 	 */
 	isValid: function() {
 		var valid = true;

 		// Field must have a name
 		if(this.state.name.length == 0) {
 			valid = false;
 		}

 		console.log(this.state.name + " has length " + this.state.name.length + " and therefore validity " + valid);

 		return valid;
 	},

 	/*
 	 * Display the field
 	 */
 	render: function() {

 		var nameInput,
 			description,
 			typeSelect,
 			disableTypeChangeNotification,
 			fieldContext,
 			fieldContextPlural;

 		// var fieldContext = this.props.stageType == "pharmacy" ? "category" : "input";


 		// Check if type change should be disabled for this input type
 		if(FlowEditor.disableTypeChanges.indexOf(this.state.type) !== -1) {
 			disableTypeChangeNotification = (
 				<div className="alert alert-info">
 					Once created, the <strong>{this.state.type}</strong> field type cannot be changed to any other type.
 				</div>
 			);
 		}

 		// Handle stageType-based changes
 		if(this.props.stageType == "pharmacy") {
 			fieldContext = "Category";
 			fieldContextPlural = "categories";
 		} else {
 			fieldContext = "Input";
 			fieldContextPlural = "inputs";

	 		// Show option to change field type if NOT pharmacy stage
 			typeSelect = (
				<div className="form-group">
					<label className="form-control-label">Type:</label>
 					<select className="form-control" disabled={!this.state.mutable || FlowEditor.disableTypeChanges.indexOf(this.state.type) !== -1} onChange={this.handleFieldTypeChange} defaultValue={this.state.type}>
 						<optgroup label="Inputs">
	 						<option value="text">Text input</option>
	 						<option value="textarea">Textarea input</option>
	 						<option value="number">Number input</option>
	 						<option value="date">Date input</option>
	 					</optgroup>
	 					<optgroup label="Multiple-option fields">
	 						<option value="select">Select input with options</option>
	 						<option value="multiselect">Multi-select input with options</option>
	 						<option value="file">File input</option>
	 						<option value="yesno">Yes or no buttons</option>
	 					</optgroup>
	 					<optgroup label="Other">
	 						<option value="header">Group fields with a header</option>
	 						<option value="pharmacy">Pharmacy - show available medication</option>
	 					</optgroup>
 					</select>
 					{disableTypeChangeNotification}
 				</div>
	 		);
 		}

 		if(this.state.name.length == 0) {
 			nameInputGroup = (
 				<div className="form-group has-error">
 					<label className="form-control-label" htmlFor={"name-" + this.props['data-key']}>Name:</label>
 					<input type="text"
 						id={"name-" + this.props['data-key']}
 						className="form-control form-control-error"
 						placeholder={fieldContext + " name"}
 						maxLength="100"
 						onChange={this.handleFieldNameChange}
 						defaultValue={this.state.name} />
 					<div className="alert alert-danger">
 						<strong>Heads up:</strong> all {fieldContextPlural} require a name.
 					</div>
 				</div>
 			);
 		} else {
 			nameInputGroup = (
 				<div className="form-group">
 					<label className="form-control-label" htmlFor={"name-" + this.props['data-key']}>Name:</label>
 					<input type="text"
 						id={"name-" + this.props['data-key']}
 						className="form-control"
 						placeholder="Field name"
 						maxLength="100"
 						onChange={this.handleFieldNameChange}
 						defaultValue={this.state.name} />
 				</div>
 			);
 		}


 		//
 		if(this.state.description !== null
 			&& this.state.description.length > 0) {
 			description = this.props.description;
 		}

 		// {this.state.name.length > 0 ? '"' + this.state.name + '"' : 'this ' + fieldContext.toLowerCase()}
 		return (
 			<div data-key={this.props['data-key']} data-index={this.props.index} className="row flow-editor-configurator-row p-t">

 				{ /* Configurator: field setup header */ }
 				<div className="col-xs-12">
 					<div className="row">
 						<div className="col-sm-12 col-md-10">
	 						<h4 className="field-title">
		 						<span className="label label-info">#{this.props.index + 1}</span>
		 						<span className="label label-default">{this.props['data-key']}</span>
		 						<span className="title hidden-lg-down">
		 							<small>
		 							{this.state.name.length > 0
		 								? this.state.name
		 								: (this.props.stageType == "pharmacy")
		 									? "Untitled category"
		 									: "Untitled " + this.state.type + " input"}
		 							</small>
		 						</span>
		 					</h4>
 						</div>
	 					<div className="col-sm-12 col-md-2">
		 					<h4 className="field-title m-b">
		 						<button type="button" className="btn btn-sm btn-danger-outline pull-right" disabled={!this.state.mutable} onClick={this.handleRemoveField}>
		 							&times; Remove
		 						</button>
		 					</h4>
		 				</div>
 					</div>
 				</div>

 				{ /* Configurator: name/type */ }
 				<div className="col-sm-4 col-xs-12">
 					{nameInputGroup}
 					{typeSelect}
	 				<div className="form-group">
	 					<label className="form-control-label">Description:</label>
	 					<textarea
	 						className="form-control"
	 						maxLength="255"
	 						placeholder="Enter a description here"

	 						onChange={this.handleFieldDescriptionChange}
	 						defaultValue={description}>
	 					</textarea>
	 				</div>
 				</div>

 				{ /* Configurator: settings */ }
	            <div className="col-sm-8 col-xs-12">
	                <FlowEditor.Field.Settings
	                	stageType={this.props.stageType}
	                	ref={'settings-' + this.props['data-key']}
	                	field-key={this.props['data-key']}
	                	type={this.state.type}
	                	mutable={this.state.mutable}
	                	settings={this.state.settings}

	                	onChange={this.handleFieldSettingsChange}
	                	/>
	            </div>
	        </div>
 		);
 	}

 });
