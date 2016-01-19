/**
 * flowEditor.jsx
 */

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
 *
 * Properties:
 *  - stageName: current name of this stage
 *  - stageType: current type of this stage
 *  - fields: currently saved fields
 *  - handleSubmit: handler for submitting fields to server
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

		fields[key] = FlowEditor.getDefaultFieldState(this.props.stageType); // Default settings for a new input
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

 	handleConfigUpload: function(event) {
		var reader = new FileReader();
		var file = event.target.files[0];

		reader.onload = function(upload) {
			console.log("Reader onload return upload target result:");
			console.log(upload.target.result);

			var fields = JSON.parse(atob(upload.target.result.split(",")[1]));
			if(fields) {
				this.setState({
					fields: fields,
				});
			}
		}.bind(this);

		reader.readAsDataURL(file);
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
						stageType={this.props.stageType}
						key={key}
						data-key={key}
						ref={key}
						index={index}

						onChange={this.checkFieldValidity.bind(this, key)}
						onRemove={this.handleRemoveField.bind(this, key)} />
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
			<div>
				<h4 className="p-t">
				    Field configuration
				    <div className="btn-group btn-group-sm pull-right">
				    	<label htmlFor="uploadConfig" className="btn btn-primary-outline">
				    		{'Upload config'}
				    	</label>
				    	<input type="file" id="uploadConfig" style={{display: "none"}} onChange={this.handleConfigUpload} accept=".json" />
				    	<a href={'/data/flow/download?stage=' + encodeURIComponent(this.props.stageName) + '&fields=' + window.btoa(JSON.stringify(this.state.fields))} target="_blank" className="btn btn-primary-outline">
				    		{'Download config'}
				    	</a>
				    </div>
				</h4>
				<hr/>
				<div id="flow-editor-fields-contain">
					{fields}
		            <button type="button" className="btn btn-primary btn-lg" onClick={this.handleAddNewField}>Add a new field</button>
		            <button type="button" className="btn btn-success btn-lg" onClick={this.props.handleSubmit} disabled={!this.state.isValid}>{this.state.isValid ? "Submit changes" : this.state.invalidCount + " field(s) need attention before submitting"}</button>
				</div>
			</div>
		);
	}

});

FlowEditor.customizableFields 	= [ "select", "multiselect", "file", "date" ];
FlowEditor.disableTypeChanges 	= [ "multiselect", "file" ];
FlowEditor.getDefaultFieldState = function(stageType) {
	switch(stageType) {
		case "pharmacy":
			return {
				name: "",
				type: "multiselect",
				mutable: true,
				settings: {
					options: {},
					allowCustomData: false
				},
			}
			break;
		default:
			return {
				name: "",
				type: "text",
				mutable: true,
				settings: {},
			};
			break;
	}
};
FlowEditor.getDefaultOptionState = function(stageType) {
	switch(stageType) {
		case "pharmacy":
			return {
				value: "",
				count: 0,
				available: false
			};
			break;
		default:
			return {
				value: ""
			};
			break;
	}
};
