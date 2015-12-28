/**
 * flowEditor.jsx
 */

/* =================================================== */

var flowEditor_CustomizableFields = ["select", "multiselect"];
var flowEditor_DefaultFieldState = {
	name: "",
	type: "text",
	mutable: true,
	settings: null,
};


/**
 * Heirarchy
 *
 * > FlowEditorFields (houses all field containers and form controls)
 * | Passes down: 
 * |   field object, onRemove handler for the configurator, key (time-based input key), index (index in fields object)
 * ==> FlowEditorFieldConfigurator (single field configuration control area)
 *   | Passes down:
 *   |   field type, onChange handler
 *   ==> FlowEditorFieldConfiguratorSettingsDialog
 */

var FlowEditor = React.createClass({

	/*
	 * Initial container state: has no fields
	 */
	getInitialState: function() {
		return {
			fields: {},
			fieldValidities: {},
			invalidCount: 0,
			isValid: true,
			fieldsRemoved: [],
		};
	},

	/*
	 * Add prop fields to state before mount
	 */
	componentWillMount: function() {
		this.setState({ fields: this.props.fields }, function() {
			this.checkContainerValidity();
		}.bind(this));
	},


	/*
	 * Add a new field to the container
	 */
	handleAddNewField: function() {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;
		var key = new Date().getTime();

		fields[key] = flowEditor_DefaultFieldState; // Default settings for a new input
		fieldValidities[key] = false; // Input defaults to invalid

		this.setState({ fields: fields, fieldValidities: fieldValidities });

		// Since we added a field, we should re-check validity of the container
		this.checkContainerValidity();
	},

	/*
	 * Remove a field from the container (requires key)
	 */
 	handleRemoveField: function(key) {
		var fields = this.state.fields;
		var fieldValidities = this.state.fieldValidities;
		var fieldsRemoved = this.state.fieldsRemoved;

		if(fields.hasOwnProperty(key)) {
			fieldsRemoved.push( (this.refs[key].state.name.length > 0 ? this.refs[key].state.name : '<em>Untitled field</em>' ) + " &nbsp; <span class='label label-default'>" + key + "</span>");
			delete fields[key];
		}
		if(fieldValidities.hasOwnProperty(key)) {
			delete fieldValidities[key];
		}

		this.setState({ fields: fields, fieldValidities: fieldValidities, fieldsRemoved: fieldsRemoved });

		// Since we removed a field, we should re-check validity of the container
		this.checkContainerValidity();
 	},

 	/*
 	 * Check the validity of a field object
 	 */
 	checkFieldValidity: function(ref) {

 		console.log("Checking field validity for " + ref);

 		var fieldValidities = this.state.fieldValidities;
 			fieldValidities[ref] = this.refs[ref].isValid();

 			console.log(fieldValidities[ref]);

 		this.setState({ fieldValidities: fieldValidities });
 		this.checkContainerValidity();
 	},

 	/*
 	 * Check the validity of the container as a whole
 	 */
 	checkContainerValidity: function() {
 		var valid = true;
 		var invalidCount = 0;

 		for(var fieldKey in this.state.fieldValidities) {
 			if(this.state.fieldValidities[fieldKey] !== true) {
 				invalidCount++;
 				valid = false;
 			}
 		}

 		this.setState({ invalidCount: invalidCount, isValid: valid });
 	},

 	/*
 	 * Compile container data into one coherent object
 	 */
 	compileData: function() {
 		var data = {};
 		Object.keys(this.state.fields).map(function(key, i) {
 			data[key] = this.refs[key].state;
 		}.bind(this));

 		return data;
 	},

 	/*
 	 * Clear removed fields from state
 	 */
 	clearRemoved: function() {
 		this.setState({ fieldsRemoved: [] });
 	},

 	/*
 	 * Render the container
 	 */
	render: function() {
		var fields;

		// Check if any fields are stored in state.
		if(Object.keys(this.state.fields).length > 0) {
			fields = Object.keys(this.state.fields).map(function(key, index) {
				console.log(" => Creating field " + key + " (" + this.state.fields[key].name + ", " + this.state.fields[key].type + ")");
				console.log(this.state.fields[key]);
				return (
					<FlowEditor.Field
						{...this.state.fields[key]} 
						onChange={this.checkFieldValidity.bind(this, key)} 
						onRemove={this.handleRemoveField.bind(this, key)} 
						key={key} 
						data-key={key} 
						ref={key} 
						index={index} />
				);
			}.bind(this));
		} else {
			fields = (
				<div className="alert alert-info">
					No fields added &mdash; try <a className="alert-link" onClick={this.handleAddNewField}>adding a new one</a>.
				</div>
			);
		}

		return (
			<div id="flow-editor-fields-contain">
				{fields}       
	            <button type="button" className="btn btn-primary btn-lg" onClick={this.handleAddNewField}>Add a new field</button>
	            <button type="button" className="btn btn-success btn-lg" onClick={this.props.handleSubmit} disabled={!this.state.isValid}>{this.state.isValid ? "Submit changes" : this.state.invalidCount + " field(s) need attention before submitting"}</button>
			</div>
		);
	}

});


FlowEditor.DisableTypeChanges = [ "multiselect", "file" ];


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
 		return flowEditor_DefaultFieldState;
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
 			settings: 
 				flowEditor_CustomizableFields.indexOf(this.props.type) !== -1 // If this field is a customizable field
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
 	 * Handle field removal
 	 */
 	handleRemoveField: function() {
 		this.props.onRemove(this.props.key);
 	},

 	/*
 	 * Handle change to field settings.
 	 */
 	handleFieldSettingsChange: function() {

 		console.log("");
 		console.log("--[handleFieldSettings change - "+ this.props['data-key'] + "]--");
 		console.log("\t| State for this field's settings component:");

 		// Grab state object via React ref
 		var settings = this.refs['settings-' + this.props['data-key']].state;

 		console.log(settings);

 		// Bump child state up to parent settings state
 		this.setState({ settings: settings }, function() {
 			console.log("\t| New state for " + this.props['data-key']);
 			console.log(this.state);
 			console.log("--[/handleFieldSettings change]--");
 		}.bind(this));
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
 			disableTypeChangeNotification;

 		if(this.state.name.length == 0) {
 			nameInputGroup = (
 				<div className="form-group has-error">
 					<label className="form-control-label" for={"name-" + this.props['data-key']}>Name:</label>
 					<input type="text" id={"name-" + this.props['data-key']} className="form-control form-control-error" placeholder="Field name" maxLength="30" onChange={this.handleFieldNameChange} defaultValue={this.state.name} />
 					<div className="alert alert-danger">
 						<strong>Heads up:</strong> all inputs require a name.
 					</div>
 				</div>
 			);
 		} else {
 			nameInputGroup = (
 				<div className="form-group">
 					<label className="form-control-label" for={"name-" + this.props['data-key']}>Name:</label>
 					<input type="text" id={"name-" + this.props['data-key']} className="form-control" placeholder="Field name" maxLength="30" onChange={this.handleFieldNameChange} defaultValue={this.state.name} />	
 				</div>	
 			);
 		}

 		if(FlowEditor.DisableTypeChanges.indexOf(this.state.type) !== -1) {
 			disableTypeChangeNotification = (
 				<div className="alert alert-info">
 					Once created, the <strong>{this.state.type}</strong> field type cannot be changed to any other type.
 				</div>
 			);
 		}

 		return (
 			<div data-key={this.props['data-key']} data-index={this.props.index} className="row flow-editor-configurator-row p-t"> 

 				{ /* Configurator: field setup header */ }
 				<div className="col-xs-12">
 					<div className="row">
 						<div className="col-sm-12 col-md-8">
	 						<h4 className="field-title">
		 						<span className="label label-info">#{this.props.index + 1}</span>
		 						<span className="label label-default">{this.props['data-key']}</span>
		 						<span className="title hidden-lg-down">{this.state.name.length > 0 ? '"' + this.state.name + '"' : "Untitled " + this.state.type + " input"}</span>
		 					</h4>
 						</div>
	 					<div className="col-sm-12 col-md-4">
		 					<h4 className="field-title m-b">
		 						<button type="button" className="btn btn-sm btn-danger-outline pull-right" disabled={!this.state.mutable} onClick={this.handleRemoveField}>&times; Remove {this.state.name.length > 0 ? '"' + this.state.name + '"' : 'this input'}</button>
		 					</h4>
		 				</div>
 					</div>
 				</div>
 				
 				{ /* Configurator: name/type */ }
 				<div className="col-sm-4 col-xs-12">
 					{nameInputGroup}
 					<div className="form-group">
 						<label className="form-control-label">Type:</label>
	 					<select className="form-control" disabled={!this.state.mutable || FlowEditor.DisableTypeChanges.indexOf(this.state.type) !== -1} onChange={this.handleFieldTypeChange} defaultValue={this.state.type}>
	 						<option value="text">Text input</option>
	 						<option value="number">Number input</option>
	 						<option value="date">Date input</option>
	 						<option value="select">Select input with options</option>
	 						<option value="multiselect">Multi-select input with options</option>
	 					</select>
	 					{disableTypeChangeNotification}
	 				</div>
 				</div>

 				{ /* Configurator: settings */ }
	            <div className="col-sm-8 col-xs-12">
	                <FlowEditor.Field.Settings
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


FlowEditor.Field.Settings = React.createClass({

	/*

	 * Return initial state based on property type
	 */
	getInitialState: function() {
		console.log("Caught getInitialState for field settings dialog with type " + this.props.type);
		switch(this.props.type) {

			case "text":
			case "date":
			case "number":
				// Do nothing for these types
				console.log("\t| Dialog is for text/date field, skipping.");
				return {};
				break;

			case "select":
				console.log("\t| Dialog is for select field, returning initial select options.");
				return {
					options: [],
					allowCustomData: false,
				};
				break;

			case "multiselect":
				console.log("\t| Dialog is for multiselect field, returning initial select options.");
				return {
					options: [],
				};
				break;

			default:
				console.log("\t| Field not recognized, skipping.");
				return {};
				break;
		}
	},

	/*
	 * Prepare component for mounting
	 */
	componentWillMount: function() {
 		
 		console.log("");
 		console.log("--[mount: " + this.props['field-key'] + "]--")
		console.log("Mounting options dialog for '" + this.props.type + "' input with props:");
		console.log(this.props);

		switch(this.props.type) {
			case "text":
			case "date":
			case "number":
				// Do nothing for these types
				break;
			case "select":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

					// If there's a set value for allowing custom data...
					if(this.props.settings.hasOwnProperty("allowCustomData") && this.props.settings.allowCustomData == "true") {
						this.setState({ allowCustomData: (this.props.settings.allowCustomData == "true") });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;
			case "multiselect":

				// If there's already an options array...
				if(this.props.hasOwnProperty('settings') && this.props.settings !== null) {

					// Settings array exists. Check for each setting data point
					if(this.props.settings.hasOwnProperty("options")) {
						this.setState({ options: this.props.settings.options });
					}

				} else {
					console.log("\t| Input DOES NOT have pre-defined settings");
				}

				break;
		}
	},

	/*
	 * Component completed mounting
	 */
	componentDidMount: function() {
		console.log("Component 'FlowEditorFieldConfiguratorSettingsDialog' mounted, state is now:");
		console.log(this.state);
 		console.log("--[/mount: " + this.props['field-key'] + "]--");
 		console.log("");
	},

	/*
	 * Handle adding of a new option (SELECT type)
	 */
	handleAddOption: function() {

		console.log("");
		console.log("--[add option: " + this.props['field-key'] + "]--");


		var push = function() {
			var options = this.state.options;
				options.push("");
			this.setState({ options: options });

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

			console.log("--[/add option: " + this.props['field-key'] + "]--");
			console.log("");
		}.bind(this);

		if(!this.state.hasOwnProperty('options')) {
			// No options yet (type was probably just changed to select), add one.
			// Make sure to set other initial state values first
			console.log("\t| Missing options property, returning component to initial state and continuing...");
			this.setState(this.getInitialState(), function() {
				push();
			}.bind(this));
		} else {
			console.log("\t| Options array exists, pushing...");
			push();
		}

	},

	/*
	 * Handle removing of an option (SELECT type)
	 */
	handleRemoveOption: function(index) {
		var options = this.state.options;
			options.splice(index, 1);
		this.setState({ options: options });

		// Bump changes to parent element for aggregation
		this.props.onChange(this.state);
	},

	/*
	 * Handle change of option text (SELECT type)
	 */
	handleChangeOptionText: function(index) {
		return function(event) {
			var options = this.state.options;
				options[index] = event.target.value;
			this.setState({ options: options });

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);
		}.bind(this);
	},

	/*
	 * Handle change of allow custom data checkbox (SELECT type)
	 */
	handleAllowCustomDataChange: function() {
		console.log("");
		console.log("--[handleAllowCustomDataChange]--");
		console.log("\t| for: " + this.props['field-key']);
		console.log("\t| State before custom data change:");
		console.log(this.state);

		var newStatus = !this.state.allowCustomData;
		this.setState({ allowCustomData: newStatus }, function() {
			console.log("\t| New state:");
			console.log(this.state);

			// Bump changes to parent element for aggregation
			this.props.onChange(this.state);

			console.log("--[/handleAllowCustomDataChange]--");
			console.log("");
		});

	},

	/*
	 * Render the settings dialog
	 */
	render: function() {

		var mutabilityMessage;

		// Add a message if this field is immutable
		if(this.props.mutable == false) {
			mutabilityMessage = (
				<div className="alert alert-danger">
					<strong>Notice:</strong> This field is protected. Only the display name and type-based settings can be modified.
				</div>
			);
		} else {
			mutabilityMessage = (
				<span></span>
			);
		}

		switch(this.props.type) {
			case "text":
			case "date":
			case "number":
				return (
					<div>
						<div className="alert alert-info m-t">
							No configuration is required for {this.props.type} inputs.
						</div>
						{mutabilityMessage}
					</div>
				);
				break;
			case "select":

				var optionInputs,
					customDataCheckbox;

				// If there are options in the state
				if(this.state.hasOwnProperty('options') && this.state.options.length > 0) {

					// Map option input containers to one variable
					optionInputs = this.state.options.map(function(value, index) {
						return (
							<div className="field-select-option form-group row" key={index}>
								<div className="col-sm-12">
									<div className="input-group">
										<input type="text" placeholder="Enter an option" className="form-control" defaultValue={value} onChange={this.handleChangeOptionText(index)} />
										<span className="input-group-btn">
											<button type="button" onClick={this.handleRemoveOption.bind(this, index)} className="btn btn-danger">
											  	<span>&times;</span>
											</button>
										</span>
									</div>
								</div>
							</div>
						);
					}.bind(this));

					// Add a checkbox at the end
					customDataCheckbox = (
						<div className="col-sm-12">
							<div className="checkbox m-t">
								<label>
									<input type="checkbox" 
										checked={this.state.allowCustomData == true} 
										onChange={this.handleAllowCustomDataChange} />
										Allow users to enter custom data for this field
								</label>
							</div>
						</div>
					);
				} else {

					// No options available, show info message
					optionInputs = (
						<div className="alert alert-info">
							No options have been defined &mdash; try <a className="alert-link" onClick={this.handleAddOption}>adding one</a>. 
						</div>
					);
					customDataCheckbox = (
						<span></span>
					);
				}

				return (
					<div className="field-select-options-contain">
		            	<h5>Options ({ this.state.hasOwnProperty('options') ? this.state.options.length : 0 })</h5>
						{optionInputs}
						{customDataCheckbox}
						{mutabilityMessage}
						<button type="button" className="btn btn-primary-outline" onClick={this.handleAddOption}>Add another option</button>
					</div>
				);

				break;

			case "multiselect":

				var optionInputs;

				// If there are options in the state
				if(this.state.hasOwnProperty('options') && this.state.options.length > 0) {

					// Map option input containers to one variable
					optionInputs = this.state.options.map(function(value, index) {
						return (
							<div className="field-select-option form-group row" key={index}>
								<div className="col-sm-12">
									<div className="input-group">
										<input type="text" placeholder="Enter an option" className="form-control" defaultValue={value} onChange={this.handleChangeOptionText(index)} />
										<span className="input-group-btn">
											<button type="button" onClick={this.handleRemoveOption.bind(this, index)} className="btn btn-danger">
											  	<span>&times;</span>
											</button>
										</span>
									</div>
								</div>
							</div>
						);
					}.bind(this));

				} else {

					// No options available, show info message
					optionInputs = (
						<div className="alert alert-info">
							No options have been defined &mdash; try <a className="alert-link" onClick={this.handleAddOption}>adding one</a>. 
						</div>
					);
					customDataCheckbox = (
						<span></span>
					);
				}

				return (
					<div className="field-select-options-contain">
		            	<h5>Options ({ this.state.hasOwnProperty('options') ? this.state.options.length : 0 })</h5>
						{optionInputs}
						{mutabilityMessage}
						<button type="button" className="btn btn-primary-outline" onClick={this.handleAddOption}>Add another option</button>
					</div>
				);

				break;
			default:
				return (
					<div>
						<div className="alert alert-danger m-t">
							Unrecognized input type "{this.props.type}"
						</div>
						{mutabilityMessage}
					</div>
				);
				break;
		}
	}
});