/**
 * Forcept.jsx
 */


var FlowEditorFieldConfiguratorOptionsInput = React.createClass({
	render: function() {

	}
});

var FlowEditorFieldConfiguratorOptions = React.createClass({

	getInitialState: function() {
		return {
			fields: [],
		};
	},
	componentWillMount: function() {
		if(Array.isArray(this.props.selectOptions)) {
			this.setState({ fields: this.props.selectOptions });
		}
	},

	handleOptionTextChange: function() {

	},

	handleRemoveOption: function(index) {
		var fields = this.state.fields;
			fields.splice(index, 1);
		this.setState({ fields: fields });
	},

	handleAddOption: function() {
		var fields = this.state.fields;
			fields.push("");
		this.setState({ fields: fields });
	},

	render: function() {

		if(this.props.type == "text" || this.props.type == "date") {
			return (
				<h5>No configuration required for {this.props.type} inputs.</h5>
			);
		} else if(this.props.type == "select"){

			var optionInputs;
			if(this.state.fields.length > 0) {
				optionInputs = this.state.fields.map(function(value, index) {
					return (
						<div className="field-select-option form-group row" key={index}>
							<div className="col-sm-11">
								<input type="text" placeholder="Enter an option" className="form-control" defaultValue={value}/>
							</div>
							<div className="col-sm-1">
								<button type="button" onClick={this.handleRemoveOption.bind(this, index)} className="btn btn-danger-outline">
								  	<span>&times;</span>
								</button>
							</div>
						</div>
					);
				}.bind(this));
			} else {
				optionInputs = (
					<h5>No options defined. Click "Add Another Option" to create one.</h5>
				);
			}

			return (
				<div className="field-select-options-contain">
					{optionInputs}
					<a className="btn btn-primary-outline" onClick={this.handleAddOption}>Add another option</a>
				</div>
			);
		} 
	}
});

 var FlowEditorFieldConfigurator = React.createClass({

 	getInitialState: function() {
 		return {
 			name: "",
 			type: "text",
 			selectOptions: [],
 		};
 	},

 	componentWillMount: function() {
 		this.setState({ 
 			name: this.props.name,
 			type: this.props.type,
 			options: this.props.options,
 		});
 	},

 	handleFieldTypeChange: function(event) {
 		this.setState({ type: event.target.value });
 	},

 	handleRemoveField: function() {
 		ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this).parentNode);
 	},

 	render: function() {
 		return (
 			<div className="form-group row p-t"> 
 				<div className="col-sm-4">
 					<input type="text" name="field_name" className="form-control" placeholder="Field name" defaultValue={this.state.name}/>
 					<select className="form-control" name="field_type" onChange={this.handleFieldTypeChange} defaultValue={this.state.type}>
 						<option value="text">Text input</option>
 						<option value="date">Date input</option>
 						<option value="select">Select input with options</option>
 					</select>
					<button type="button" className="btn btn-danger-outline m-t" onClick={this.handleRemoveField}>
					  	<span>&times; Remove this field</span>
					</button>
 				</div>
	            <div className="col-sm-8">
	                <FlowEditorFieldConfiguratorOptions type={this.state.type} selectOptions={this.state.options} />
	            </div>
	        </div>
 		);
 	}

 });